"use client";

// ============================================================================
// Menux Intelligence — Execution Panel (Right Sidebar)
// Painel com dados computados em tempo real: prioridades, insights, ganhos
// rápidos, alertas de risco e ações rápidas.
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
  ShieldAlert,
  Trophy,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Sunrise,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SlashCommand } from "@/types/intelligence";
import { useIntelligenceStore } from "@/stores/intelligence-store";
import { useOpportunityStore } from "@/stores/opportunity-store";
import { useExecutionPanelData } from "@/hooks/use-execution-panel-data";
import { formatCurrencyBRL } from "@/lib/business-rules";

export function IntelligenceExecutionPanel() {
  const { contextCard, executeSlashCommand, openClientPicker, proactiveSuggestions, dismissSuggestion } =
    useIntelligenceStore();
  const { opportunities } = useOpportunityStore();

  const { priorities, insights, quickWins, riskAlerts } =
    useExecutionPanelData();

  const hasClient = !!contextCard;

  const pendingSuggestions = proactiveSuggestions.filter((s) => !s.dismissed);

  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    priorities: true,
    actions: true,
    insights: true,
    quickWins: false,
    risks: true,
    suggestions: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
      case "resumo":
        executeSlashCommand("/resumo");
        break;
      case "riscos":
        executeSlashCommand("/riscos");
        break;
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-zinc-50/50">
      <div className="p-5 space-y-6">
        {/* Proactive Suggestions */}
        {pendingSuggestions.length > 0 && (
          <section>
            <SectionHeader
              icon={<Sunrise className="h-4 w-4 text-violet-500" />}
              title="Sugestoes do Jarvis"
              count={pendingSuggestions.length}
              expanded={expandedSections.suggestions}
              onToggle={() => toggleSection("suggestions")}
              accentColor="violet"
            />
            <AnimatePresence>
              {expandedSections.suggestions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 mt-3">
                    {pendingSuggestions.slice(0, 5).map((suggestion) => (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={cn(
                          "rounded-lg border p-3 text-xs",
                          suggestion.priority === "high"
                            ? "border-red-200 bg-red-50"
                            : suggestion.priority === "medium"
                              ? "border-amber-200 bg-amber-50"
                              : "border-zinc-200 bg-white"
                        )}
                      >
                        <p className={cn(
                          "leading-relaxed",
                          suggestion.priority === "high" ? "text-red-800" :
                          suggestion.priority === "medium" ? "text-amber-800" :
                          "text-zinc-700"
                        )}>
                          {suggestion.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {suggestion.cardName && (
                            <button
                              onClick={() => {
                                const opp = opportunities.find(
                                  (o) => o.id === suggestion.cardId || o.clientName === suggestion.cardName
                                );
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
                              className="text-[10px] font-medium text-indigo-600 hover:text-indigo-700"
                            >
                              Investigar →
                            </button>
                          )}
                          <button
                            onClick={() => dismissSuggestion(suggestion.id)}
                            className="text-[10px] text-zinc-400 hover:text-zinc-600 ml-auto"
                          >
                            Dispensar
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {/* Priorities */}
        <section>
          <SectionHeader
            icon={<Clock className="h-4 w-4 text-red-500" />}
            title="Prioridades de Hoje"
            count={priorities.length}
            expanded={expandedSections.priorities}
            onToggle={() => toggleSection("priorities")}
            accentColor="red"
          />
          <AnimatePresence>
            {expandedSections.priorities && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {priorities.length > 0 ? (
                  <div className="space-y-2 mt-3">
                    {priorities.map((item) => (
                      <PriorityCard
                        key={item.id}
                        severity={item.severity}
                        title={item.title}
                        subtitle={item.subtitle}
                        type={item.type}
                        onClick={() => {
                          if (item.linkedEntityId) {
                            const opp = opportunities.find((o) => o.id === item.linkedEntityId);
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
                          }
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-zinc-200 bg-white p-3 text-center mt-3">
                    <p className="text-xs text-zinc-500">
                      ✅ Nenhuma prioridade urgente.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Quick Actions */}
        <section>
          <SectionHeader
            icon={<Zap className="h-4 w-4 text-amber-500 fill-amber-500" />}
            title="Acoes Rapidas"
            expanded={expandedSections.actions}
            onToggle={() => toggleSection("actions")}
            accentColor="amber"
          />
          <AnimatePresence>
            {expandedSections.actions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <TooltipProvider>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <QuickActionCard
                      icon={<MessageSquare className="h-3.5 w-3.5" />}
                      label="WhatsApp"
                      color="text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100"
                      onClick={() => handleQuickAction("whatsapp")}
                      disabled={!hasClient}
                      tooltip={!hasClient ? "Selecione um cliente primeiro" : undefined}
                    />
                    <QuickActionCard
                      icon={<Mail className="h-3.5 w-3.5" />}
                      label="Email"
                      color="text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100"
                      onClick={() => handleQuickAction("email")}
                      disabled={!hasClient}
                      tooltip={!hasClient ? "Selecione um cliente primeiro" : undefined}
                    />
                    <QuickActionCard
                      icon={<Calendar className="h-3.5 w-3.5" />}
                      label="Follow-up"
                      color="text-purple-600 bg-purple-50 border-purple-100 hover:bg-purple-100"
                      onClick={() => handleQuickAction("agendar")}
                      disabled={!hasClient}
                      tooltip={!hasClient ? "Selecione um cliente primeiro" : undefined}
                    />
                    <QuickActionCard
                      icon={<Target className="h-3.5 w-3.5" />}
                      label="Pitch"
                      color="text-amber-600 bg-amber-50 border-amber-100 hover:bg-amber-100"
                      onClick={() => handleQuickAction("proposta")}
                      disabled={!hasClient}
                      tooltip={!hasClient ? "Selecione um cliente primeiro" : undefined}
                    />
                    <QuickActionCard
                      icon={<Sunrise className="h-3.5 w-3.5" />}
                      label="Resumo"
                      color="text-violet-600 bg-violet-50 border-violet-100 hover:bg-violet-100"
                      onClick={() => handleQuickAction("resumo")}
                    />
                    <QuickActionCard
                      icon={<TrendingUp className="h-3.5 w-3.5" />}
                      label="Funil"
                      color="text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-100"
                      onClick={() => handleQuickAction("funil")}
                    />
                    <QuickActionCard
                      icon={<ShieldAlert className="h-3.5 w-3.5" />}
                      label="Riscos"
                      color="text-red-600 bg-red-50 border-red-100 hover:bg-red-100"
                      onClick={() => handleQuickAction("riscos")}
                    />
                    <QuickActionCard
                      icon={<FileText className="h-3.5 w-3.5" />}
                      label="Planos"
                      color="text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100"
                      onClick={() => handleQuickAction("planos")}
                    />
                  </div>
                </TooltipProvider>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Smart Insights */}
        {insights.length > 0 && (
          <section>
            <SectionHeader
              icon={<BarChart3 className="h-4 w-4 text-indigo-500" />}
              title="Insights Inteligentes"
              count={insights.length}
              expanded={expandedSections.insights}
              onToggle={() => toggleSection("insights")}
              accentColor="indigo"
            />
            <AnimatePresence>
              {expandedSections.insights && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 mt-3">
                    {insights.map((insight) => (
                      <InsightCard
                        key={insight.id}
                        title={insight.title}
                        description={insight.description}
                        metric={insight.metric}
                        actionLabel={insight.actionLabel}
                        onAction={
                          insight.actionCommand
                            ? () =>
                                executeSlashCommand(
                                  insight.actionCommand as SlashCommand
                                )
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {/* Quick Wins */}
        {quickWins.length > 0 && (
          <section>
            <SectionHeader
              icon={<Trophy className="h-4 w-4 text-emerald-500" />}
              title="Ganhos Rapidos"
              count={quickWins.length}
              expanded={expandedSections.quickWins}
              onToggle={() => toggleSection("quickWins")}
              accentColor="emerald"
            />
            <AnimatePresence>
              {expandedSections.quickWins && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 mt-3">
                    {quickWins.map((qw) => (
                      <div
                        key={qw.id}
                        onClick={() => {
                          const opp = opportunities.find(
                            (o) => o.id === qw.opportunityId
                          );
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
                        className="group flex items-center gap-3 p-3 rounded-lg border border-emerald-100 bg-white hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs text-zinc-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                            {qw.clientName}
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">
                            {qw.reason} · {formatCurrencyBRL(qw.value)}/mes
                          </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-1.5">
                          <div
                            className={cn(
                              "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold",
                              qw.probability >= 70
                                ? "bg-emerald-100 text-emerald-700"
                                : qw.probability >= 50
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-zinc-100 text-zinc-600"
                            )}
                          >
                            {qw.probability}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {/* Risk Alerts */}
        {riskAlerts.length > 0 && (
          <section>
            <SectionHeader
              icon={<ShieldAlert className="h-4 w-4 text-red-500" />}
              title="Alertas de Risco"
              count={riskAlerts.length}
              expanded={expandedSections.risks}
              onToggle={() => toggleSection("risks")}
              accentColor="red"
            />
            <AnimatePresence>
              {expandedSections.risks && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 mt-3">
                    {riskAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={cn(
                          "rounded-lg border p-3",
                          alert.severity === "critical"
                            ? "border-red-200 bg-red-50"
                            : "border-amber-200 bg-amber-50"
                        )}
                      >
                        <p
                          className={cn(
                            "font-medium text-xs",
                            alert.severity === "critical"
                              ? "text-red-800"
                              : "text-amber-800"
                          )}
                        >
                          {alert.title}
                        </p>
                        <p
                          className={cn(
                            "text-[10px] mt-0.5",
                            alert.severity === "critical"
                              ? "text-red-600"
                              : "text-amber-600"
                          )}
                        >
                          {alert.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {/* Context-aware card insights (when a card is selected) */}
        {contextCard && (
          <section>
            <SectionHeader
              icon={<Target className="h-4 w-4 text-violet-500" />}
              title={`Contexto: ${contextCard.cardName}`}
              accentColor="violet"
            />
            <div className="space-y-2 mt-3">
              <InsightCard
                title={
                  contextCard.temperature === "hot"
                    ? "Lead quente!"
                    : contextCard.temperature === "cold"
                      ? "Lead frio"
                      : "Lead morno"
                }
                description={
                  contextCard.temperature === "hot"
                    ? "Momento ideal para avancar com proposta ou demonstracao."
                    : contextCard.temperature === "cold"
                      ? "Considere reengajamento antes de oferecer algo."
                      : "Mantenha contato e identifique gatilhos de decisao."
                }
                actionLabel="Analise completa"
                onAction={() => executeSlashCommand("/analise")}
              />

              {contextCard.registeredObjections.length > 0 && (
                <InsightCard
                  title={`${contextCard.registeredObjections.length} objecao(oes)`}
                  description="Use /objecao para preparar contra-argumentos personalizados."
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
          </section>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  count,
  expanded,
  onToggle,
  accentColor = "zinc",
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
  expanded?: boolean;
  onToggle?: () => void;
  accentColor?: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 w-full px-1 group"
    >
      {icon}
      <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-500 flex-1 text-left">
        {title}
      </h3>
      {typeof count === "number" && count > 0 && (
        <span
          className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
            accentColor === "red"
              ? "bg-red-100 text-red-700"
              : accentColor === "amber"
                ? "bg-amber-100 text-amber-700"
                : accentColor === "emerald"
                  ? "bg-emerald-100 text-emerald-700"
                  : accentColor === "violet"
                    ? "bg-violet-100 text-violet-700"
                    : "bg-indigo-100 text-indigo-700"
          )}
        >
          {count}
        </span>
      )}
      {onToggle && (
        <span className="text-zinc-400 group-hover:text-zinc-600 transition-colors">
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </span>
      )}
    </button>
  );
}

function PriorityCard({
  severity,
  title,
  subtitle,
  type,
  onClick,
}: {
  severity: "critical" | "warning" | "info";
  title: string;
  subtitle: string;
  type: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
        severity === "critical"
          ? "border-red-200 bg-red-50 hover:border-red-300"
          : severity === "warning"
            ? "border-amber-200 bg-amber-50 hover:border-amber-300"
            : "border-zinc-200 bg-white hover:border-indigo-200"
      )}
    >
      <div
        className={cn(
          "h-6 w-6 shrink-0 rounded-full flex items-center justify-center mt-0.5",
          severity === "critical"
            ? "bg-red-100"
            : severity === "warning"
              ? "bg-amber-100"
              : "bg-zinc-100"
        )}
      >
        {type === "overdue" ? (
          <AlertTriangle className={cn("h-3 w-3", severity === "critical" ? "text-red-600" : "text-amber-600")} />
        ) : type === "sla-warning" ? (
          <Clock className="h-3 w-3 text-red-600" />
        ) : type === "hot-idle" ? (
          <Zap className="h-3 w-3 text-amber-600 fill-amber-600" />
        ) : (
          <Calendar className="h-3 w-3 text-zinc-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-xs text-zinc-900 line-clamp-1">
          {title}
        </p>
        <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">
          {subtitle}
        </p>
      </div>
      <ArrowRight className="h-3 w-3 text-zinc-400 group-hover:text-zinc-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
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
        "flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg border transition-all text-sm font-medium",
        disabled
          ? "opacity-50 cursor-not-allowed bg-zinc-50 border-zinc-200 text-zinc-400"
          : color
      )}
    >
      {icon}
      <span className="text-[10px]">{label}</span>
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
  title,
  description,
  metric,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  metric?: { value: string; trend: "up" | "down" | "stable" };
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-lg border border-indigo-100 bg-white p-3 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-xs text-zinc-800">{title}</span>
        {metric && (
          <span
            className={cn(
              "text-xs font-bold",
              metric.trend === "up"
                ? "text-emerald-600"
                : metric.trend === "down"
                  ? "text-red-600"
                  : "text-zinc-500"
            )}
          >
            {metric.value}{" "}
            {metric.trend === "up" ? "↑" : metric.trend === "down" ? "↓" : "→"}
          </span>
        )}
      </div>
      <p className="text-[10px] text-zinc-600 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button
          variant="link"
          className="h-auto p-0 text-[10px] text-indigo-600 mt-1 hover:text-indigo-700"
          onClick={onAction}
        >
          {actionLabel} <ArrowRight className="h-2.5 w-2.5 ml-0.5" />
        </Button>
      )}
    </div>
  );
}
