"use client";

// ============================================================================
// Menux Intelligence — Client Picker Modal (D11)
// Ref: docs/Menux Intelligence.md — seção 2.3.2
// ============================================================================

import { useMemo, useCallback, useEffect, useState } from "react";
import { Search, X, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIntelligenceStore } from "@/stores/intelligence-store";
import { useOpportunityStore } from "@/stores/opportunity-store";
import { useAuthStore } from "@/stores/auth-store";
import type { ClientPickerItem } from "@/types/intelligence";
import type { Temperature } from "@/types";
import { formatCurrencyBRL } from "@/lib/business-rules";

// ─── Temperature Components ─────────────────────────────────────────────

function TemperatureBadge({ temp }: { temp: Temperature }) {
  const config = {
    hot: { emoji: "🔥", label: "Quente", cls: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
    warm: { emoji: "🌡️", label: "Morno", cls: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
    cold: { emoji: "❄️", label: "Frio", cls: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  };
  const c = config[temp];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", c.cls)}>
      {c.emoji} {c.label}
    </span>
  );
}

function StagePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
      {label}
    </span>
  );
}

// ─── Relative Time ──────────────────────────────────────────────────────

function relativeTime(dateStr?: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "hoje";
  if (diffDays === 1) return "há 1 dia";
  if (diffDays < 7) return `há ${diffDays} dias`;
  if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semana(s)`;
  return `há ${Math.floor(diffDays / 30)} mês(es)`;
}

// ─── Stage label map ────────────────────────────────────────────────────

const stageLabels: Record<string, string> = {
  "lead-in": "Lead In",
  "contato-feito": "Contato Feito",
  "reuniao-agendada": "Reunião Agendada",
  "proposta-enviada": "Proposta Enviada",
  negociacao: "Negociação",
  fechamento: "Fechamento",
};

// ─── Component ──────────────────────────────────────────────────────────

export function ClientPickerModal() {
  const {
    isClientPickerOpen,
    closeClientPicker,
    clientPickerSearch,
    setClientPickerSearch,
    clientPickerFilters,
    setClientPickerFilters,
    selectClient,
  } = useIntelligenceStore();

  const { opportunities } = useOpportunityStore();
  const user = useAuthStore((s) => s.user);
  const [debounced, setDebounced] = useState(clientPickerSearch);

  // Debounce search — seção 2.3.2: debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(clientPickerSearch), 300);
    return () => clearTimeout(timer);
  }, [clientPickerSearch]);

  // Converter oportunidades para itens do picker
  const items: ClientPickerItem[] = useMemo(() => {
    return opportunities
      .filter((opp) => {
        // Respeitar permissão — seção 9.2
        if (user?.role === "comercial" || user?.role === "cs") {
          return opp.responsibleId === user.id;
        }
        return true; // master e admin veem todos
      })
      .map((opp) => ({
        id: opp.id,
        entityId: opp.id,
        entityType: "opportunity" as const,
        companyName: opp.clientName ?? opp.title,
        segment: opp.tags?.[0],
        stage: opp.stage,
        stageLabel: stageLabels[opp.stage] ?? opp.stage,
        temperature: opp.temperature,
        lastContact: opp.updatedAt,
        value: opp.monthlyValue,
        tags: opp.tags,
      }));
  }, [opportunities, user]);

  // Filtrar itens — seção 2.3.2
  const filteredItems = useMemo(() => {
    let result = items;

    // Filtro por busca
    if (debounced.trim()) {
      const search = debounced.toLowerCase();
      result = result.filter(
        (item) =>
          item.companyName.toLowerCase().includes(search) ||
          item.segment?.toLowerCase().includes(search) ||
          item.tags?.some((t) => t.toLowerCase().includes(search))
      );
    }

    // Filtro por temperatura
    if (clientPickerFilters.temperature?.length) {
      result = result.filter((item) =>
        clientPickerFilters.temperature!.includes(item.temperature)
      );
    }

    // Ordenação — seção 2.3.2: vencidos, quentes, último interagido, alfa
    result.sort((a, b) => {
      // Quentes primeiro
      const tempOrder: Record<Temperature, number> = {
        hot: 0,
        warm: 1,
        cold: 2,
      };
      const tempDiff = tempOrder[a.temperature] - tempOrder[b.temperature];
      if (tempDiff !== 0) return tempDiff;

      // Último interagido
      if (a.lastContact && b.lastContact) {
        return (
          new Date(b.lastContact).getTime() -
          new Date(a.lastContact).getTime()
        );
      }

      // Alfabético
      return a.companyName.localeCompare(b.companyName);
    });

    return result;
  }, [items, debounced, clientPickerFilters]);

  // Toggle filtro de temperatura
  const toggleTemperatureFilter = useCallback(
    (temp: Temperature) => {
      const current = clientPickerFilters.temperature ?? [];
      const updated = current.includes(temp)
        ? current.filter((t) => t !== temp)
        : [...current, temp];
      setClientPickerFilters({
        ...clientPickerFilters,
        temperature: updated.length ? updated : undefined,
      });
    },
    [clientPickerFilters, setClientPickerFilters]
  );

  // Clear filters
  const clearFilters = useCallback(() => {
    setClientPickerSearch("");
    setClientPickerFilters({});
  }, [setClientPickerSearch, setClientPickerFilters]);

  return (
    <Dialog open={isClientPickerOpen} onOpenChange={(open) => !open && closeClientPicker()}>
      <DialogContent className="max-w-[520px] gap-0 p-0 sm:max-w-[520px]">
        {/* Header — 1. seção 2.3.2 */}
        <DialogHeader className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <DialogTitle className="flex items-center gap-2 font-heading text-base">
            <Users className="h-4.5 w-4.5 text-purple-500" />
            Selecionar cliente
          </DialogTitle>
        </DialogHeader>

        {/* Search — 2. seção 2.3.2 */}
        <div className="border-b border-slate-100 px-5 py-3 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por nome, CNPJ ou contato..."
              value={clientPickerSearch}
              onChange={(e) => setClientPickerSearch(e.target.value)}
              className="pl-9 text-sm"
              autoFocus
            />
            {clientPickerSearch && (
              <button
                onClick={() => setClientPickerSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Temperature Filters — 3. seção 2.3.2 */}
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-2.5 dark:border-slate-800">
          {(["hot", "warm", "cold"] as Temperature[]).map((temp) => {
            const isActive = clientPickerFilters.temperature?.includes(temp);
            const emoji = temp === "hot" ? "🔥" : temp === "warm" ? "🌡️" : "❄️";
            const label = temp === "hot" ? "Quente" : temp === "warm" ? "Morno" : "Frio";
            return (
              <button
                key={temp}
                onClick={() => toggleTemperatureFilter(temp)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-purple-100 text-purple-700 ring-1 ring-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:ring-purple-700"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                )}
              >
                {emoji} {label}
              </button>
            );
          })}

          {(clientPickerFilters.temperature?.length || clientPickerSearch) && (
            <button
              onClick={clearFilters}
              className="ml-auto text-[11px] font-medium text-purple-500 hover:text-purple-700"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Card List — 4. seção 2.3.2 */}
        <ScrollArea className="max-h-[70vh]">
          <div className="p-2">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => selectClient(item)}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  {/* Company info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-body text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {item.companyName}
                      </span>
                      {item.segment && (
                        <span className="shrink-0 text-[11px] text-slate-400">
                          {item.segment}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <StagePill label={item.stageLabel} />
                      <TemperatureBadge temp={item.temperature} />
                      {item.lastContact && (
                        <span className="text-[10px] text-slate-400">
                          Último contato: {relativeTime(item.lastContact)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Value */}
                  {item.value && item.value > 0 && (
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {formatCurrencyBRL(item.value)}
                      </p>
                      <p className="text-[10px] text-slate-400">/mês</p>
                    </div>
                  )}
                </button>
              ))
            ) : (
              /* Empty state — seção 11 */
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="mb-3 h-8 w-8 text-slate-300" />
                <p className="font-body text-sm text-slate-500">
                  {clientPickerSearch
                    ? `Nenhum cliente encontrado para "${clientPickerSearch}". Tente outro nome ou limpe os filtros.`
                    : "Você ainda não tem clientes neste pipe. Pode me fazer perguntas gerais ou consultar a base Menux."}
                </p>
                {clientPickerSearch && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-sm font-medium text-purple-500 hover:text-purple-700"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer — 5. seção 2.3.2 */}
        <div className="border-t border-slate-100 px-5 py-2.5 dark:border-slate-800">
          <p className="text-[11px] text-slate-400">
            Mostrando {filteredItems.length} de {items.length} clientes
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
