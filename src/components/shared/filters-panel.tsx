"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  X,
  Filter,
  Calendar,
  DollarSign,
  User,
  Tag,
  Flame,
  Thermometer,
  Snowflake,
  Heart,
  Activity,
  CheckSquare,
  BarChart3,
  Save,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/masked-inputs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useUIStore } from "@/stores/ui-store";

// ── Types ───────────────────────────────────────────────────────────────────
type FilterContext = "pipes" | "clients" | "activities" | "finance";

interface FiltersPanelProps {
  context: FilterContext;
  onApplyFilters?: (filters: Record<string, unknown>) => void;
}

// ── Saved Filter Types ──────────────────────────────────────────────────────
interface SavedFilter {
  id: string;
  name: string;
  filters: PipesFilterState | ClientsFilterState | ActivitiesFilterState | FinanceFilterState;
}

const MAX_SAVED_FILTERS = 10;

function getSavedFiltersKey(context: FilterContext) {
  return `flow-saved-filters-${context}`;
}

function loadSavedFilters(context: FilterContext): SavedFilter[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getSavedFiltersKey(context));
    if (!raw) return [];
    return JSON.parse(raw) as SavedFilter[];
  } catch {
    return [];
  }
}

function persistSavedFilters(context: FilterContext, filters: SavedFilter[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getSavedFiltersKey(context), JSON.stringify(filters));
}

// ── Mock options ────────────────────────────────────────────────────────────
const mockResponsibles = [
  { id: "u1", name: "Maria Silva" },
  { id: "u2", name: "Pedro Santos" },
  { id: "u3", name: "Julia Fernandes" },
  { id: "u4", name: "Rafael Costa" },
  { id: "u5", name: "Ana Oliveira" },
];

const mockStages = [
  { id: "lead-in", label: "Lead-In" },
  { id: "contato-feito", label: "Contato Feito" },
  { id: "reuniao-agendada", label: "Reuniao Agendada" },
  { id: "proposta-enviada", label: "Proposta Enviada" },
  { id: "negociacao", label: "Negociacao" },
  { id: "fechamento", label: "Fechamento" },
];

const mockClientStages = [
  { id: "onboarding", label: "Onboarding" },
  { id: "implantacao", label: "Implantacao" },
  { id: "acompanhamento", label: "Acompanhamento" },
  { id: "retencao", label: "Retencao" },
  { id: "churn", label: "Churn" },
];

const mockTemperatures = [
  { id: "hot", label: "Quente", icon: <Flame className="h-3.5 w-3.5 text-status-danger" /> },
  { id: "warm", label: "Morna", icon: <Thermometer className="h-3.5 w-3.5 text-status-warning" /> },
  { id: "cold", label: "Fria", icon: <Snowflake className="h-3.5 w-3.5 text-status-info" /> },
];

const mockTags = [
  "food-service",
  "restaurante",
  "premium",
  "varejo",
  "saude",
  "tecnologia",
  "educacao",
  "industria",
];

const mockActivityTypes = [
  { id: "call", label: "Ligacao" },
  { id: "email", label: "E-mail" },
  { id: "meeting", label: "Reuniao" },
  { id: "task", label: "Tarefa" },
  { id: "follow-up", label: "Follow-up" },
  { id: "whatsapp", label: "WhatsApp" },
];

const mockActivityStatuses = [
  { id: "pending", label: "Pendente" },
  { id: "completed", label: "Concluida" },
  { id: "overdue", label: "Atrasada" },
  { id: "cancelled", label: "Cancelada" },
];

const mockHealthScores = [
  { id: "good", label: "Saudavel", icon: <Heart className="h-3.5 w-3.5 text-status-success" /> },
  { id: "warning", label: "Atencao", icon: <Heart className="h-3.5 w-3.5 text-status-warning" /> },
  { id: "critical", label: "Critico", icon: <Heart className="h-3.5 w-3.5 text-status-danger" /> },
];

const mockFinanceStatuses = [
  { id: "projected", label: "Projetado" },
  { id: "confirmed", label: "Confirmado" },
  { id: "paid", label: "Pago" },
  { id: "contested", label: "Contestado" },
];

const mockPeriods = [
  { id: "this-month", label: "Este mes" },
  { id: "last-month", label: "Mes passado" },
  { id: "this-quarter", label: "Este trimestre" },
  { id: "last-quarter", label: "Trimestre passado" },
  { id: "this-year", label: "Este ano" },
];

// ── Checkbox Group ──────────────────────────────────────────────────────────
function CheckboxGroup({
  label,
  options,
  selected,
  onChange,
  icon,
}: {
  label: string;
  options: { id: string; label: string; icon?: React.ReactNode }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  icon?: React.ReactNode;
}) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2">
        {icon && <span className="text-zinc-400">{icon}</span>}
        <Label className="font-heading text-sm font-semibold text-black">{label}</Label>
        {selected.length > 0 && (
          <Badge className="rounded-[10px] bg-brand px-1.5 py-0 font-body text-[10px] text-white">
            {selected.length}
          </Badge>
        )}
      </div>
      <div className="space-y-2">
        {options.map((opt) => (
          <label
            key={opt.id}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-50"
          >
            <Checkbox
              checked={selected.includes(opt.id)}
              onCheckedChange={() => toggle(opt.id)}
              className="rounded-[4px]"
            />
            {opt.icon && <span>{opt.icon}</span>}
            <span className="font-body text-sm text-zinc-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ── Range Input ─────────────────────────────────────────────────────────────
function RangeInput({
  label,
  icon,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  placeholder,
  type = "text",
}: {
  label: string;
  icon?: React.ReactNode;
  minValue: string;
  maxValue: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
  placeholder?: { min: string; max: string };
  type?: string;
}) {
  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2">
        {icon && <span className="text-zinc-400">{icon}</span>}
        <Label className="font-heading text-sm font-semibold text-black">{label}</Label>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type={type}
          value={minValue}
          onChange={(e) => onMinChange(e.target.value)}
          placeholder={placeholder?.min || "Min"}
          className="h-9 rounded-[15px] font-body text-sm"
        />
        <span className="font-body text-xs text-zinc-400">ate</span>
        <Input
          type={type}
          value={maxValue}
          onChange={(e) => onMaxChange(e.target.value)}
          placeholder={placeholder?.max || "Max"}
          className="h-9 rounded-[15px] font-body text-sm"
        />
      </div>
    </div>
  );
}

// ── Pipes Filters ───────────────────────────────────────────────────────────
function PipesFilters({
  filters,
  setFilters,
}: {
  filters: PipesFilterState;
  setFilters: React.Dispatch<React.SetStateAction<PipesFilterState>>;
}) {
  return (
    <div className="space-y-6">
      <CheckboxGroup
        label="Responsavel"
        icon={<User className="h-4 w-4" />}
        options={mockResponsibles.map((r) => ({ id: r.id, label: r.name }))}
        selected={filters.responsible}
        onChange={(v) => setFilters((f) => ({ ...f, responsible: v }))}
      />

      <Separator />

      <CheckboxGroup
        label="Estagio"
        icon={<BarChart3 className="h-4 w-4" />}
        options={mockStages}
        selected={filters.stage}
        onChange={(v) => setFilters((f) => ({ ...f, stage: v }))}
      />

      <Separator />

      <CheckboxGroup
        label="Temperatura"
        icon={<Flame className="h-4 w-4" />}
        options={mockTemperatures}
        selected={filters.temperature}
        onChange={(v) => setFilters((f) => ({ ...f, temperature: v }))}
      />

      <Separator />

      <CheckboxGroup
        label="Tags"
        icon={<Tag className="h-4 w-4" />}
        options={mockTags.map((t) => ({ id: t, label: t }))}
        selected={filters.tags}
        onChange={(v) => setFilters((f) => ({ ...f, tags: v }))}
      />

      <Separator />

      <RangeInput
        label="Periodo"
        icon={<Calendar className="h-4 w-4" />}
        minValue={filters.dateStart}
        maxValue={filters.dateEnd}
        onMinChange={(v) => setFilters((f) => ({ ...f, dateStart: v }))}
        onMaxChange={(v) => setFilters((f) => ({ ...f, dateEnd: v }))}
        placeholder={{ min: "Data inicio", max: "Data fim" }}
        type="date"
      />

      <Separator />

      <div>
        <div className="mb-2.5 flex items-center gap-2">
          <span className="text-zinc-400"><DollarSign className="h-4 w-4" /></span>
          <Label className="font-heading text-sm font-semibold text-black">Faixa de Valor</Label>
        </div>
        <div className="flex items-center gap-2">
          <CurrencyInput
            value={filters.valueMin ? Number(filters.valueMin) : undefined}
            onValueChange={(v) => setFilters((f) => ({ ...f, valueMin: v > 0 ? String(v) : "" }))}
            className="h-9 rounded-[15px] font-body text-sm"
            placeholder="R$ Min"
          />
          <span className="font-body text-xs text-zinc-400">ate</span>
          <CurrencyInput
            value={filters.valueMax ? Number(filters.valueMax) : undefined}
            onValueChange={(v) => setFilters((f) => ({ ...f, valueMax: v > 0 ? String(v) : "" }))}
            className="h-9 rounded-[15px] font-body text-sm"
            placeholder="R$ Max"
          />
        </div>
      </div>
    </div>
  );
}

// ── Clients Filters ─────────────────────────────────────────────────────────
function ClientsFilters({
  filters,
  setFilters,
}: {
  filters: ClientsFilterState;
  setFilters: React.Dispatch<React.SetStateAction<ClientsFilterState>>;
}) {
  return (
    <div className="space-y-6">
      <CheckboxGroup
        label="Responsavel"
        icon={<User className="h-4 w-4" />}
        options={mockResponsibles.map((r) => ({ id: r.id, label: r.name }))}
        selected={filters.responsible}
        onChange={(v) => setFilters((f) => ({ ...f, responsible: v }))}
      />

      <Separator />

      <CheckboxGroup
        label="Estagio"
        icon={<BarChart3 className="h-4 w-4" />}
        options={mockClientStages}
        selected={filters.stage}
        onChange={(v) => setFilters((f) => ({ ...f, stage: v }))}
      />

      <Separator />

      <CheckboxGroup
        label="Health Score"
        icon={<Heart className="h-4 w-4" />}
        options={mockHealthScores}
        selected={filters.healthScore}
        onChange={(v) => setFilters((f) => ({ ...f, healthScore: v }))}
      />

      <Separator />

      <div>
        <div className="mb-2.5 flex items-center gap-2">
          <span className="text-zinc-400"><DollarSign className="h-4 w-4" /></span>
          <Label className="font-heading text-sm font-semibold text-black">Faixa de MRR</Label>
        </div>
        <div className="flex items-center gap-2">
          <CurrencyInput
            value={filters.mrrMin ? Number(filters.mrrMin) : undefined}
            onValueChange={(v) => setFilters((f) => ({ ...f, mrrMin: v > 0 ? String(v) : "" }))}
            className="h-9 rounded-[15px] font-body text-sm"
            placeholder="R$ Min"
          />
          <span className="font-body text-xs text-zinc-400">ate</span>
          <CurrencyInput
            value={filters.mrrMax ? Number(filters.mrrMax) : undefined}
            onValueChange={(v) => setFilters((f) => ({ ...f, mrrMax: v > 0 ? String(v) : "" }))}
            className="h-9 rounded-[15px] font-body text-sm"
            placeholder="R$ Max"
          />
        </div>
      </div>

      <Separator />

      <RangeInput
        label="Ultima Interacao"
        icon={<Calendar className="h-4 w-4" />}
        minValue={filters.lastInteractionStart}
        maxValue={filters.lastInteractionEnd}
        onMinChange={(v) => setFilters((f) => ({ ...f, lastInteractionStart: v }))}
        onMaxChange={(v) => setFilters((f) => ({ ...f, lastInteractionEnd: v }))}
        placeholder={{ min: "Data inicio", max: "Data fim" }}
        type="date"
      />
    </div>
  );
}

// ── Activities Filters ──────────────────────────────────────────────────────
function ActivitiesFilters({
  filters,
  setFilters,
}: {
  filters: ActivitiesFilterState;
  setFilters: React.Dispatch<React.SetStateAction<ActivitiesFilterState>>;
}) {
  return (
    <div className="space-y-6">
      <CheckboxGroup
        label="Tipo"
        icon={<Activity className="h-4 w-4" />}
        options={mockActivityTypes}
        selected={filters.type}
        onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
      />

      <Separator />

      <CheckboxGroup
        label="Responsavel"
        icon={<User className="h-4 w-4" />}
        options={mockResponsibles.map((r) => ({ id: r.id, label: r.name }))}
        selected={filters.responsible}
        onChange={(v) => setFilters((f) => ({ ...f, responsible: v }))}
      />

      <Separator />

      <CheckboxGroup
        label="Status"
        icon={<CheckSquare className="h-4 w-4" />}
        options={mockActivityStatuses}
        selected={filters.status}
        onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
      />

      <Separator />

      <RangeInput
        label="Periodo"
        icon={<Calendar className="h-4 w-4" />}
        minValue={filters.dateStart}
        maxValue={filters.dateEnd}
        onMinChange={(v) => setFilters((f) => ({ ...f, dateStart: v }))}
        onMaxChange={(v) => setFilters((f) => ({ ...f, dateEnd: v }))}
        placeholder={{ min: "Data inicio", max: "Data fim" }}
        type="date"
      />
    </div>
  );
}

// ── Finance Filters ─────────────────────────────────────────────────────────
function FinanceFilters({
  filters,
  setFilters,
}: {
  filters: FinanceFilterState;
  setFilters: React.Dispatch<React.SetStateAction<FinanceFilterState>>;
}) {
  return (
    <div className="space-y-6">
      <CheckboxGroup
        label="Vendedor"
        icon={<User className="h-4 w-4" />}
        options={mockResponsibles.map((r) => ({ id: r.id, label: r.name }))}
        selected={filters.seller}
        onChange={(v) => setFilters((f) => ({ ...f, seller: v }))}
      />

      <Separator />

      <CheckboxGroup
        label="Status"
        icon={<CheckSquare className="h-4 w-4" />}
        options={mockFinanceStatuses}
        selected={filters.status}
        onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
      />

      <Separator />

      <CheckboxGroup
        label="Periodo"
        icon={<Calendar className="h-4 w-4" />}
        options={mockPeriods}
        selected={filters.period}
        onChange={(v) => setFilters((f) => ({ ...f, period: v }))}
      />
    </div>
  );
}

// ── Filter State Types ──────────────────────────────────────────────────────
interface PipesFilterState {
  responsible: string[];
  stage: string[];
  temperature: string[];
  tags: string[];
  dateStart: string;
  dateEnd: string;
  valueMin: string;
  valueMax: string;
}

interface ClientsFilterState {
  responsible: string[];
  stage: string[];
  healthScore: string[];
  mrrMin: string;
  mrrMax: string;
  lastInteractionStart: string;
  lastInteractionEnd: string;
}

interface ActivitiesFilterState {
  type: string[];
  responsible: string[];
  status: string[];
  dateStart: string;
  dateEnd: string;
}

interface FinanceFilterState {
  seller: string[];
  status: string[];
  period: string[];
}

const initialPipesFilters: PipesFilterState = {
  responsible: [],
  stage: [],
  temperature: [],
  tags: [],
  dateStart: "",
  dateEnd: "",
  valueMin: "",
  valueMax: "",
};

const initialClientsFilters: ClientsFilterState = {
  responsible: [],
  stage: [],
  healthScore: [],
  mrrMin: "",
  mrrMax: "",
  lastInteractionStart: "",
  lastInteractionEnd: "",
};

const initialActivitiesFilters: ActivitiesFilterState = {
  type: [],
  responsible: [],
  status: [],
  dateStart: "",
  dateEnd: "",
};

const initialFinanceFilters: FinanceFilterState = {
  seller: [],
  status: [],
  period: [],
};

// ── Context labels ──────────────────────────────────────────────────────────
const contextLabels: Record<FilterContext, string> = {
  pipes: "Pipeline",
  clients: "Clientes",
  activities: "Atividades",
  finance: "Financeiro",
};

// ── Saved Filters Section ───────────────────────────────────────────────────
function SavedFiltersSection({
  savedFilters,
  onApply,
  onRemove,
  onSave,
  canSave,
}: {
  savedFilters: SavedFilter[];
  onApply: (saved: SavedFilter) => void;
  onRemove: (id: string) => void;
  onSave: (name: string) => void;
  canSave: boolean;
}) {
  const [newFilterName, setNewFilterName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  function handleSave() {
    const trimmed = newFilterName.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setNewFilterName("");
    setIsAdding(false);
  }

  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2">
        <span className="text-zinc-400">
          <Bookmark className="h-4 w-4" />
        </span>
        <Label className="font-heading text-sm font-semibold text-black">
          Filtros Salvos
        </Label>
        {savedFilters.length > 0 && (
          <Badge className="rounded-[10px] bg-zinc-100 px-1.5 py-0 font-body text-[10px] text-zinc-600">
            {savedFilters.length}
          </Badge>
        )}
      </div>

      {/* Saved filter chips */}
      {savedFilters.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {savedFilters.map((sf) => (
            <div
              key={sf.id}
              className="group flex items-center gap-1.5 rounded-[10px] border border-zinc-200 bg-zinc-50 px-3 py-1.5 transition-colors hover:border-brand hover:bg-brand-light"
            >
              <button
                type="button"
                className="font-body text-sm text-zinc-700 group-hover:text-brand"
                onClick={() => onApply(sf)}
              >
                {sf.name}
              </button>
              <button
                type="button"
                className="ml-0.5 text-zinc-400 transition-colors hover:text-status-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(sf.id);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {savedFilters.length === 0 && !isAdding && (
        <p className="mb-3 font-body text-xs text-zinc-400">
          Nenhum filtro salvo ainda.
        </p>
      )}

      {/* Save current filter */}
      {isAdding ? (
        <div className="flex items-center gap-2">
          <Input
            value={newFilterName}
            onChange={(e) => setNewFilterName(e.target.value)}
            placeholder="Nome do filtro"
            className="h-8 flex-1 rounded-[15px] font-body text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setIsAdding(false);
                setNewFilterName("");
              }
            }}
            autoFocus
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 rounded-full font-heading text-xs"
            onClick={handleSave}
            disabled={!newFilterName.trim()}
          >
            <Save className="mr-1 h-3 w-3" />
            Salvar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-full font-heading text-xs text-zinc-400"
            onClick={() => {
              setIsAdding(false);
              setNewFilterName("");
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-full border-dashed border-zinc-300 font-heading text-xs text-zinc-500 hover:border-brand hover:text-brand"
          onClick={() => setIsAdding(true)}
          disabled={!canSave}
          title={
            !canSave
              ? `Maximo de ${MAX_SAVED_FILTERS} filtros salvos`
              : undefined
          }
        >
          <Save className="mr-1.5 h-3 w-3" />
          Salvar filtro atual
        </Button>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export function FiltersPanel({ context, onApplyFilters }: FiltersPanelProps) {
  const { drawerType, closeDrawer } = useUIStore();
  const isOpen = drawerType === "filters";

  // Filter states per context
  const [pipesFilters, setPipesFilters] = useState<PipesFilterState>(initialPipesFilters);
  const [clientsFilters, setClientsFilters] = useState<ClientsFilterState>(initialClientsFilters);
  const [activitiesFilters, setActivitiesFilters] = useState<ActivitiesFilterState>(initialActivitiesFilters);
  const [financeFilters, setFinanceFilters] = useState<FinanceFilterState>(initialFinanceFilters);

  // Saved filters state
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  // Load saved filters from localStorage on mount and when context changes
  useEffect(() => {
    setSavedFilters(loadSavedFilters(context));
  }, [context]);

  // Get current filters for the active context
  const getCurrentFilters = useCallback(():
    | PipesFilterState
    | ClientsFilterState
    | ActivitiesFilterState
    | FinanceFilterState => {
    switch (context) {
      case "pipes":
        return pipesFilters;
      case "clients":
        return clientsFilters;
      case "activities":
        return activitiesFilters;
      case "finance":
        return financeFilters;
    }
  }, [context, pipesFilters, clientsFilters, activitiesFilters, financeFilters]);

  // Save a filter
  function handleSaveFilter(name: string) {
    const newSaved: SavedFilter = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      filters: getCurrentFilters(),
    };
    const updated = [...savedFilters, newSaved].slice(-MAX_SAVED_FILTERS);
    setSavedFilters(updated);
    persistSavedFilters(context, updated);
  }

  // Remove a saved filter
  function handleRemoveSavedFilter(id: string) {
    const updated = savedFilters.filter((sf) => sf.id !== id);
    setSavedFilters(updated);
    persistSavedFilters(context, updated);
  }

  // Apply a saved filter
  function handleApplySavedFilter(saved: SavedFilter) {
    switch (context) {
      case "pipes":
        setPipesFilters(saved.filters as PipesFilterState);
        break;
      case "clients":
        setClientsFilters(saved.filters as ClientsFilterState);
        break;
      case "activities":
        setActivitiesFilters(saved.filters as ActivitiesFilterState);
        break;
      case "finance":
        setFinanceFilters(saved.filters as FinanceFilterState);
        break;
    }
  }

  // Calculate total active filter count
  const filterCount = useMemo(() => {
    switch (context) {
      case "pipes": {
        const f = pipesFilters;
        return (
          f.responsible.length +
          f.stage.length +
          f.temperature.length +
          f.tags.length +
          (f.dateStart ? 1 : 0) +
          (f.dateEnd ? 1 : 0) +
          (f.valueMin ? 1 : 0) +
          (f.valueMax ? 1 : 0)
        );
      }
      case "clients": {
        const f = clientsFilters;
        return (
          f.responsible.length +
          f.stage.length +
          f.healthScore.length +
          (f.mrrMin ? 1 : 0) +
          (f.mrrMax ? 1 : 0) +
          (f.lastInteractionStart ? 1 : 0) +
          (f.lastInteractionEnd ? 1 : 0)
        );
      }
      case "activities": {
        const f = activitiesFilters;
        return (
          f.type.length +
          f.responsible.length +
          f.status.length +
          (f.dateStart ? 1 : 0) +
          (f.dateEnd ? 1 : 0)
        );
      }
      case "finance": {
        const f = financeFilters;
        return f.seller.length + f.status.length + f.period.length;
      }
      default:
        return 0;
    }
  }, [context, pipesFilters, clientsFilters, activitiesFilters, financeFilters]);

  function handleClear() {
    switch (context) {
      case "pipes":
        setPipesFilters(initialPipesFilters);
        break;
      case "clients":
        setClientsFilters(initialClientsFilters);
        break;
      case "activities":
        setActivitiesFilters(initialActivitiesFilters);
        break;
      case "finance":
        setFinanceFilters(initialFinanceFilters);
        break;
    }
  }

  function handleApply() {
    const currentFilters = getCurrentFilters();

    // Call the onApplyFilters callback if provided
    if (onApplyFilters) {
      onApplyFilters(currentFilters as unknown as Record<string, unknown>);
    }

    closeDrawer();
  }

  return (
    <Sheet open={isOpen} onOpenChange={() => closeDrawer()}>
      <SheetContent
        side="right"
        className="flex w-[400px] max-w-full flex-col overflow-hidden border-l border-zinc-200 p-0 sm:max-w-[400px]"
        showCloseButton={false}
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light">
              <Filter className="h-4 w-4 text-brand" />
            </div>
            <div>
              <SheetTitle className="font-heading text-lg font-semibold text-black">
                Filtros
              </SheetTitle>
              <p className="font-body text-xs text-zinc-500">
                {contextLabels[context]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {filterCount > 0 && (
              <Badge className="rounded-[10px] bg-brand px-2 py-0.5 font-body text-xs text-white">
                {filterCount} ativo{filterCount !== 1 ? "s" : ""}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400"
              onClick={() => closeDrawer()}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        {/* Body -- scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Saved Filters Section */}
          <SavedFiltersSection
            savedFilters={savedFilters}
            onApply={handleApplySavedFilter}
            onRemove={handleRemoveSavedFilter}
            onSave={handleSaveFilter}
            canSave={savedFilters.length < MAX_SAVED_FILTERS}
          />

          <Separator className="my-5" />

          {/* Context-specific filters */}
          {context === "pipes" && (
            <PipesFilters filters={pipesFilters} setFilters={setPipesFilters} />
          )}
          {context === "clients" && (
            <ClientsFilters filters={clientsFilters} setFilters={setClientsFilters} />
          )}
          {context === "activities" && (
            <ActivitiesFilters filters={activitiesFilters} setFilters={setActivitiesFilters} />
          )}
          {context === "finance" && (
            <FinanceFilters filters={financeFilters} setFilters={setFinanceFilters} />
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="border-t border-zinc-200 px-6 py-4">
          <div className="flex w-full items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleClear}
              className="font-heading text-sm text-zinc-500 hover:text-zinc-700"
            >
              Limpar
            </Button>
            <Button
              onClick={handleApply}
              className="rounded-full bg-brand px-6 font-heading text-sm text-white hover:bg-brand/90"
            >
              Aplicar Filtros
              {filterCount > 0 && (
                <Badge className="ml-2 rounded-full bg-white/20 px-1.5 py-0 font-body text-[10px] text-white">
                  {filterCount}
                </Badge>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
