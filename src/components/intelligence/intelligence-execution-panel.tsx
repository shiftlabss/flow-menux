"use client";

// ============================================================================
// Menux Intelligence — Execution Panel (Right Sidebar)
// Connected to store: quick actions trigger slash commands, priorities from data
// ============================================================================

import {
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  Mail,
  MessageSquare,
  FileText,
  Zap,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";
import { useMemo } from "react";
import { useIntelligenceStore } from "@/stores/intelligence-store";
import { useOpportunityStore } from "@/stores/opportunity-store";
import { useAuthStore } from "@/stores/auth-store";

export function IntelligenceExecutionPanel() {
  const { contextCard, executeSlashCommand, openClientPicker } =
    useIntelligenceStore();
  const { opportunities } = useOpportunityStore();
  const user = useAuthStore((s) => s.user);

  // Priority items from real opportunity data
  const priorityItems = useMemo(() => {
    const userOpps =
      user?.role === "comercial" || user?.role === "cs"
        ? opportunities.filter((o) => o.responsibleId === user?.id)
        : opportunities;

    return userOpps
      .filter((o) => o.temperature === "hot")
      .slice(0, 3)
      .map((o) => ({
        id: o.id,
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
        bg: "bg-red-50",
        title: o.clientName ?? o.title,
        subtitle: `Lead quente · ${o.stage}`,
        action: "Focar",
      }));
  }, [opportunities, user]);

  const hasClient = !!contextCard;

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case "whatsapp":
        executeSlashCommand("/mensagem", "WhatsApp");
        break;
      case "email":
        executeSlashCommand("/mensagem", "email");
        break;
      case "agendar":
        executeSlashCommand("/followup");
        break;
      case "proposta":
        executeSlashCommand("/pitch");
        break;
      case "funil":
        executeSlashCommand("/funil");
        break;
      case "planos":
        executeSlashCommand("/planos");
        break;
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-zinc-50/50">
      <div className="p-6 space-y-8">
        {/* Priorities Block */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-1">
            <Clock className="h-4 w-4 text-indigo-500" />
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-500">
              Prioridades de Hoje
            </h3>
          </div>

          {priorityItems.length > 0 ? (
            <div className="space-y-3">
              {priorityItems.map((item) => (
                <PriorityCard
                  key={item.id}
                  icon={item.icon}
                  bg={item.bg}
                  title={item.title}
                  subtitle={item.subtitle}
                  action={item.action}
                  onClick={() => {
                    const opp = opportunities.find((o) => o.id === item.id);
                    if (opp) {
                      useIntelligenceStore.getState().selectClient({
                        id: opp.id,
                        entityId: opp.id,
                        entityType: "opportunity",
                        companyName: opp.clientName ?? opp.title,
                        stage: opp.stage,
                        stageLabel: opp.stage,
                        temperature: opp.temperature,
                        lastContact: opp.updatedAt,
                        value: opp.monthlyValue,
                        tags: opp.tags,
                      });
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center">
              <p className="text-xs text-zinc-500">
                Nenhuma prioridade urgente agora.
              </p>
              <p className="text-[10px] text-zinc-400 mt-1">
                Prioridades aparecem automaticamente com base nos seus leads.
              </p>
            </div>
          )}
        </section>

        {/* Quick workflows */}
        <section>
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4 px-1">
            Acoes Rapidas
          </h3>
          <TooltipProvider>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionCard
                icon={<MessageSquare className="h-4 w-4" />}
                label="WhatsApp"
                color="text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100"
                onClick={() => handleQuickAction("whatsapp")}
                disabled={!hasClient}
                tooltip={!hasClient ? "Selecione um cliente primeiro" : undefined}
              />
              <QuickActionCard
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                color="text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100"
                onClick={() => handleQuickAction("email")}
                disabled={!hasClient}
                tooltip={!hasClient ? "Selecione um cliente primeiro" : undefined}
              />
              <QuickActionCard
                icon={<Calendar className="h-4 w-4" />}
                label="Follow-up"
                color="text-purple-600 bg-purple-50 border-purple-100 hover:bg-purple-100"
                onClick={() => handleQuickAction("agendar")}
                disabled={!hasClient}
                tooltip={!hasClient ? "Selecione um cliente primeiro" : undefined}
              />
              <QuickActionCard
                icon={<Target className="h-4 w-4" />}
                label="Pitch"
                color="text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100"
                onClick={() => handleQuickAction("proposta")}
                disabled={!hasClient}
                tooltip={!hasClient ? "Selecione um cliente primeiro" : undefined}
              />
              <QuickActionCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="Funil"
                color="text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-100"
                onClick={() => handleQuickAction("funil")}
              />
              <QuickActionCard
                icon={<FileText className="h-4 w-4" />}
                label="Planos"
                color="text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100"
                onClick={() => handleQuickAction("planos")}
              />
            </div>
          </TooltipProvider>
        </section>

        {/* Context-aware Insights */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-1">
            <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-500">
              Insights
            </h3>
          </div>

          {contextCard ? (
            <div className="space-y-3">
              <InsightCard
                icon={<TrendingUp className="h-4 w-4 text-indigo-600" />}
                title={`Analise: ${contextCard.cardName}`}
                description={
                  contextCard.temperature === "hot"
                    ? "Lead quente! Momento ideal para avancar com uma proposta ou demonstracao."
                    : contextCard.temperature === "cold"
                      ? "Lead frio. Considere uma abordagem de reengajamento antes de oferecer algo."
                      : "Lead morno. Mantenha o contato e identifique gatilhos de decisao."
                }
                actionLabel="Analise completa"
                onAction={() => executeSlashCommand("/analise")}
              />

              {contextCard.registeredObjections.length > 0 && (
                <InsightCard
                  icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}
                  title="Objecoes registradas"
                  description={`${contextCard.registeredObjections.length} objecao(oes) registrada(s). Use /objecao para preparar contra-argumentos.`}
                  actionLabel="Quebrar objecao"
                  onAction={() =>
                    executeSlashCommand(
                      "/objecao",
                      contextCard.registeredObjections[0]
                    )
                  }
                />
              )}
            </div>
          ) : (
            <InsightCard
              icon={<TrendingUp className="h-4 w-4 text-indigo-600" />}
              title="Dica do Jarvis"
              description="Selecione um cliente no painel esquerdo para receber insights personalizados e sugestoes de acao."
              actionLabel="Selecionar cliente"
              onAction={openClientPicker}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function PriorityCard({
  icon,
  bg,
  title,
  subtitle,
  action,
  onClick,
}: {
  icon: React.ReactNode;
  bg: string;
  title: string;
  subtitle: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group flex flex-col p-3 rounded-xl border border-zinc-200 bg-white hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/50 transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "h-8 w-8 shrink-0 rounded-full flex items-center justify-center",
            bg
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-zinc-900 group-hover:text-indigo-700 transition-colors line-clamp-1">
            {title}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
            {subtitle}
          </p>
        </div>
      </div>
      {action && (
        <div className="mt-3 pt-2 border-t border-zinc-50 flex justify-end">
          <span className="text-[10px] font-medium text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            {action} <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      )}
    </div>
  );
}

function QuickActionCard({
  label,
  icon,
  color,
  onClick,
  disabled,
  tooltip,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
}) {
  const button = (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all text-sm font-medium",
        disabled
          ? "opacity-50 cursor-not-allowed bg-zinc-50 border-zinc-200 text-zinc-400"
          : color
      )}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="top">{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

function InsightCard({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm relative overflow-hidden group">
      <div className="flex items-center gap-2 mb-2 relative z-10">
        {icon}
        <span className="font-bold text-sm text-zinc-800">{title}</span>
      </div>
      <p className="text-xs text-zinc-600 leading-relaxed relative z-10">
        {description}
      </p>
      <Button
        variant="link"
        className="h-auto p-0 text-xs text-indigo-600 mt-2 hover:text-indigo-700 relative z-10"
        onClick={onAction}
      >
        {actionLabel} <ArrowRight className="h-3 w-3 ml-1" />
      </Button>
    </div>
  );
}
