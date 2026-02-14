// ============================================================================
// Menux Intelligence — Proactive Engine
// Motor de inteligência proativa que analisa dados de todas as stores
// e gera sugestões, prioridades, insights e alertas em tempo real.
// Funções puras — sem React, sem side-effects.
// ============================================================================

import type { Opportunity, Activity, Client, Goal } from "@/types";
import type { PipelineStageConfig } from "@/stores/pipeline-store";
import type { PipelineContext } from "@/types/intelligence";
import type {
  ProactiveSuggestionType,
  ProactiveSuggestionPriority,
} from "@/types/intelligence";
import { formatCurrencyBRL } from "@/lib/business-rules";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProactiveEngineInput {
  opportunities: Opportunity[];
  activities: Activity[];
  clients: Client[];
  goals: Goal[];
  pipelines: { stages: PipelineStageConfig[] }[];
  userId: string;
  userRole: string;
}

export interface GeneratedSuggestion {
  type: ProactiveSuggestionType;
  priority: ProactiveSuggestionPriority;
  message: string;
  cardId?: string;
  cardName?: string;
}

export interface PriorityItem {
  id: string;
  type: "overdue" | "due-today" | "sla-warning" | "hot-idle" | "follow-up";
  title: string;
  subtitle: string;
  severity: "critical" | "warning" | "info";
  linkedEntityId?: string;
  linkedEntityType?: "opportunity" | "activity" | "client";
}

export interface SmartInsight {
  id: string;
  icon: string;
  title: string;
  description: string;
  metric?: { value: string; trend: "up" | "down" | "stable" };
  actionLabel?: string;
  actionCommand?: string;
}

export interface QuickWinItem {
  id: string;
  opportunityId: string;
  clientName: string;
  stage: string;
  probability: number;
  value: number;
  reason: string;
}

export interface RiskAlert {
  id: string;
  type: "sla-breach" | "health-drop" | "stale" | "contract-expiring" | "goal-risk";
  title: string;
  description: string;
  severity: "critical" | "warning";
  linkedEntityId?: string;
}

export interface ExecutionPanelData {
  priorities: PriorityItem[];
  insights: SmartInsight[];
  quickWins: QuickWinItem[];
  riskAlerts: RiskAlert[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysBetween(dateA: string | Date, dateB: string | Date): number {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function hoursBetween(dateA: string | Date, dateB: string | Date): number {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return (b.getTime() - a.getTime()) / (1000 * 60 * 60);
}

function isToday(date: string): boolean {
  const d = new Date(date);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function relativeTime(date: string): string {
  const days = daysBetween(date, new Date().toISOString());
  if (days === 0) return "hoje";
  if (days === 1) return "ontem";
  return `ha ${days} dias`;
}

function getStageName(
  stageId: string,
  pipelines: { stages: PipelineStageConfig[] }[]
): string {
  for (const p of pipelines) {
    const found = p.stages.find((s) => s.id === stageId);
    if (found) return found.name;
  }
  return stageId;
}

function filterByUser<T extends { responsibleId: string }>(
  items: T[],
  userId: string,
  userRole: string
): T[] {
  if (userRole === "master" || userRole === "admin") return items;
  return items.filter((i) => i.responsibleId === userId);
}

// ─── Individual Analyzers ────────────────────────────────────────────────────

function analyzeOverdueActivities(
  activities: Activity[],
  opportunities: Opportunity[],
  userId: string,
  userRole: string
): GeneratedSuggestion[] {
  const userActs = filterByUser(activities, userId, userRole);
  const overdue = userActs.filter((a) => {
    if (a.status === "completed" || a.status === "cancelled") return false;
    const dueDate = new Date(a.dueDate);
    return dueDate < new Date();
  });

  return overdue.slice(0, 3).map((act) => {
    const opp = act.opportunityId
      ? opportunities.find((o) => o.id === act.opportunityId)
      : null;
    const daysOverdue = daysBetween(act.dueDate, new Date().toISOString());

    return {
      type: "overdue-activity" as ProactiveSuggestionType,
      priority: (daysOverdue >= 3 ? "high" : "medium") as ProactiveSuggestionPriority,
      message: `Atividade "${act.title}" vencida ${relativeTime(act.dueDate)}.${opp ? ` Lead: ${opp.clientName}.` : ""} Resolva para manter o pipeline saudavel.`,
      cardId: opp?.id,
      cardName: opp?.clientName,
    };
  });
}

function analyzeHotLeadsIdle(
  opportunities: Opportunity[],
  activities: Activity[],
  userId: string,
  userRole: string,
  thresholdDays = 3
): GeneratedSuggestion[] {
  const userOpps = filterByUser(opportunities, userId, userRole).filter(
    (o) => o.status === "open" && o.temperature === "hot"
  );

  return userOpps
    .map((opp) => {
      const oppActivities = activities
        .filter((a) => a.opportunityId === opp.id && a.status !== "cancelled")
        .sort(
          (a, b) =>
            new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
        );

      const lastDate = oppActivities[0]?.dueDate ?? opp.updatedAt;
      const daysSince = daysBetween(lastDate, new Date().toISOString());

      if (daysSince >= thresholdDays) {
        return {
          type: "hot-lead-idle" as ProactiveSuggestionType,
          priority: "high" as ProactiveSuggestionPriority,
          message: `Lead quente "${opp.clientName}" sem atividade ha ${daysSince} dias. Na etapa ${opp.stage}. Momento de agir!`,
          cardId: opp.id,
          cardName: opp.clientName,
        };
      }
      return null;
    })
    .filter(Boolean) as GeneratedSuggestion[];
}

function analyzeSLAApproaching(
  opportunities: Opportunity[],
  pipelines: { stages: PipelineStageConfig[] }[],
  userId: string,
  userRole: string
): GeneratedSuggestion[] {
  const now = new Date();
  const userOpps = filterByUser(opportunities, userId, userRole).filter(
    (o) => o.status === "open" && o.slaDeadline
  );

  return userOpps
    .map((opp) => {
      const hoursLeft = hoursBetween(now.toISOString(), opp.slaDeadline!);
      if (hoursLeft > 0 && hoursLeft <= 6) {
        const stageName = getStageName(opp.stage, pipelines);
        return {
          type: "sla-approaching" as ProactiveSuggestionType,
          priority: "high" as ProactiveSuggestionPriority,
          message: `"${opp.clientName}" esta a ${Math.round(hoursLeft)}h do SLA na etapa ${stageName}. Priorize esta oportunidade!`,
          cardId: opp.id,
          cardName: opp.clientName,
        };
      }
      return null;
    })
    .filter(Boolean) as GeneratedSuggestion[];
}

function analyzeStaleDeals(
  opportunities: Opportunity[],
  userId: string,
  userRole: string,
  thresholdDays = 7
): GeneratedSuggestion[] {
  const userOpps = filterByUser(opportunities, userId, userRole).filter(
    (o) => o.status === "open"
  );

  return userOpps
    .map((opp) => {
      const daysSince = daysBetween(opp.updatedAt, new Date().toISOString());
      if (daysSince >= thresholdDays) {
        return {
          type: "stale-deal" as ProactiveSuggestionType,
          priority: (daysSince >= 14 ? "high" : "medium") as ProactiveSuggestionPriority,
          message: `Negociacao "${opp.clientName}" parada ha ${daysSince} dias sem movimentacao. Considere reengajar ou reavaliar.`,
          cardId: opp.id,
          cardName: opp.clientName,
        };
      }
      return null;
    })
    .filter(Boolean) as GeneratedSuggestion[];
}

function analyzeGoalRisk(
  goals: Goal[]
): GeneratedSuggestion[] {
  const now = new Date();

  return goals
    .map((goal) => {
      const endDate = new Date(goal.endDate);
      const startDate = new Date(goal.startDate);
      if (endDate < now) return null; // past goal

      const totalDuration = daysBetween(startDate.toISOString(), endDate.toISOString());
      const elapsed = daysBetween(startDate.toISOString(), now.toISOString());
      const daysRemaining = daysBetween(now.toISOString(), endDate.toISOString());
      const expectedProgress = totalDuration > 0 ? elapsed / totalDuration : 1;
      const actualProgress = goal.target > 0 ? goal.current / goal.target : 0;

      // Only alert if behind schedule AND within 15 days of deadline
      if (actualProgress < expectedProgress * 0.85 && daysRemaining <= 15) {
        const deficit = goal.target - goal.current;
        const deficitStr =
          goal.type === "revenue"
            ? formatCurrencyBRL(deficit)
            : `${deficit} ${goal.type === "conversion" ? "%" : ""}`;

        return {
          type: "goal-risk" as ProactiveSuggestionType,
          priority: (daysRemaining <= 7 ? "high" : "medium") as ProactiveSuggestionPriority,
          message: `Meta "${goal.title}" em risco. Faltam ${deficitStr} nos proximos ${daysRemaining} dias. Progresso: ${Math.round(actualProgress * 100)}%.`,
        };
      }
      return null;
    })
    .filter(Boolean) as GeneratedSuggestion[];
}

function analyzeContractExpiring(
  clients: Client[],
  userId: string,
  userRole: string,
  thresholdDays = 30
): GeneratedSuggestion[] {
  const now = new Date();
  const userClients =
    userRole === "master" || userRole === "admin"
      ? clients
      : clients.filter((c) => c.responsibleId === userId);

  return userClients
    .map((client) => {
      if (!client.contractEnd) return null;
      const daysUntil = daysBetween(now.toISOString(), client.contractEnd);
      if (daysUntil > 0 && daysUntil <= thresholdDays) {
        return {
          type: "contract-expiring" as ProactiveSuggestionType,
          priority: (daysUntil <= 15 ? "high" : "medium") as ProactiveSuggestionPriority,
          message: `Contrato de "${client.companyName}" expira em ${daysUntil} dias. Inicie a renovacao agora.`,
          cardName: client.companyName,
        };
      }
      return null;
    })
    .filter(Boolean) as GeneratedSuggestion[];
}

function analyzeMissingFields(
  opportunities: Opportunity[],
  userId: string,
  userRole: string
): GeneratedSuggestion[] {
  const userOpps = filterByUser(opportunities, userId, userRole).filter(
    (o) => o.status === "open"
  );

  const noCloseDate = userOpps.filter((o) => !o.expectedCloseDate);
  if (noCloseDate.length >= 3) {
    return [
      {
        type: "missing-fields" as ProactiveSuggestionType,
        priority: "low" as ProactiveSuggestionPriority,
        message: `${noCloseDate.length} oportunidades abertas sem data de fechamento prevista. Preencha para melhorar previsibilidade.`,
      },
    ];
  }
  return [];
}

function analyzeCrossSell(
  clients: Client[],
  userId: string,
  userRole: string
): GeneratedSuggestion[] {
  const userClients =
    userRole === "master" || userRole === "admin"
      ? clients
      : clients.filter((c) => c.responsibleId === userId);

  const activeClients = userClients.filter(
    (c) => c.stage !== "churn" && c.monthlyRevenue > 0
  );
  if (activeClients.length === 0) return [];

  const avgRevenue =
    activeClients.reduce((sum, c) => sum + c.monthlyRevenue, 0) /
    activeClients.length;

  return activeClients
    .filter(
      (c) => c.healthScore === "good" && c.monthlyRevenue < avgRevenue * 0.7
    )
    .slice(0, 2)
    .map((c) => ({
      type: "cross-sell-opportunity" as ProactiveSuggestionType,
      priority: "low" as ProactiveSuggestionPriority,
      message: `"${c.companyName}" com saude boa e ticket ${formatCurrencyBRL(c.monthlyRevenue)} (media: ${formatCurrencyBRL(avgRevenue)}). Oportunidade de upsell!`,
      cardName: c.companyName,
    }));
}

function analyzeCompetitiveLosses(
  opportunities: Opportunity[],
  userId: string,
  userRole: string
): GeneratedSuggestion[] {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentLosses = filterByUser(opportunities, userId, userRole).filter(
    (o) =>
      o.status === "lost" &&
      new Date(o.updatedAt) > thirtyDaysAgo &&
      o.lossReason
  );

  if (recentLosses.length === 0) return [];

  // Group by loss reason
  const reasonCounts = recentLosses.reduce(
    (acc, o) => {
      const reason = o.lossReason ?? "outro";
      acc[reason] = (acc[reason] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topReason = Object.entries(reasonCounts).sort(
    ([, a], [, b]) => b - a
  )[0];

  if (topReason && topReason[1] >= 2) {
    return [
      {
        type: "competitive-intelligence" as ProactiveSuggestionType,
        priority: "medium" as ProactiveSuggestionPriority,
        message: `${recentLosses.length} deals perdidos nos ultimos 30 dias. Principal motivo: "${topReason[0]}" (${topReason[1]}x). Ajuste sua abordagem.`,
      },
    ];
  }
  return [];
}

function analyzeTeamPerformance(
  opportunities: Opportunity[],
  userId: string
): GeneratedSuggestion[] {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentOpps = opportunities.filter(
    (o) => new Date(o.updatedAt) > thirtyDaysAgo
  );

  if (recentOpps.length < 5) return [];

  // Calculate user conversion vs team average
  const userOpps = recentOpps.filter((o) => o.responsibleId === userId);
  const userWon = userOpps.filter((o) => o.status === "won").length;
  const userTotal = userOpps.filter(
    (o) => o.status === "won" || o.status === "lost"
  ).length;
  const userRate = userTotal > 0 ? (userWon / userTotal) * 100 : 0;

  const teamWon = recentOpps.filter((o) => o.status === "won").length;
  const teamTotal = recentOpps.filter(
    (o) => o.status === "won" || o.status === "lost"
  ).length;
  const teamRate = teamTotal > 0 ? (teamWon / teamTotal) * 100 : 0;

  if (userTotal < 3) return [];

  const diff = userRate - teamRate;
  if (Math.abs(diff) >= 10) {
    return [
      {
        type: "team-performance" as ProactiveSuggestionType,
        priority: "low" as ProactiveSuggestionPriority,
        message:
          diff > 0
            ? `Sua taxa de conversao (${Math.round(userRate)}%) esta ${Math.round(diff)}% acima da media do time. Excelente trabalho!`
            : `Sua taxa de conversao (${Math.round(userRate)}%) esta ${Math.round(Math.abs(diff))}% abaixo da media. Use /coaching para dicas.`,
      },
    ];
  }
  return [];
}

// ─── Master Generator ────────────────────────────────────────────────────────

export function generateAllSuggestions(
  input: ProactiveEngineInput
): GeneratedSuggestion[] {
  const { opportunities, activities, clients, goals, pipelines, userId, userRole } =
    input;

  const suggestions: GeneratedSuggestion[] = [
    ...analyzeOverdueActivities(activities, opportunities, userId, userRole),
    ...analyzeSLAApproaching(opportunities, pipelines, userId, userRole),
    ...analyzeHotLeadsIdle(opportunities, activities, userId, userRole),
    ...analyzeStaleDeals(opportunities, userId, userRole),
    ...analyzeGoalRisk(goals),
    ...analyzeContractExpiring(clients, userId, userRole),
    ...analyzeMissingFields(opportunities, userId, userRole),
    ...analyzeCrossSell(clients, userId, userRole),
    ...analyzeCompetitiveLosses(opportunities, userId, userRole),
    ...analyzeTeamPerformance(opportunities, userId),
  ];

  // Sort: high > medium > low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return suggestions.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

// ─── Pipeline Context Builder ────────────────────────────────────────────────

export function computePipelineContext(
  opportunities: Opportunity[],
  activities: Activity[],
  userId: string,
  userRole: string
): PipelineContext {
  const userOpps = filterByUser(opportunities, userId, userRole).filter(
    (o) => o.status === "open"
  );

  const cardsByStage: Record<string, number> = {};
  let totalMRR = 0;
  let overdueCards = 0;
  let hotIdleCards = 0;
  let staleCards = 0;

  for (const opp of userOpps) {
    // Count by stage
    cardsByStage[opp.stage] = (cardsByStage[opp.stage] ?? 0) + 1;

    // Total MRR
    totalMRR += opp.monthlyValue;

    // Overdue check
    const oppActs = activities.filter(
      (a) => a.opportunityId === opp.id && a.status !== "cancelled"
    );
    const hasOverdue = oppActs.some(
      (a) => a.status !== "completed" && new Date(a.dueDate) < new Date()
    );
    if (hasOverdue) overdueCards++;

    // Hot idle check
    if (opp.temperature === "hot") {
      const lastDate = oppActs.length
        ? Math.max(...oppActs.map((a) => new Date(a.dueDate).getTime()))
        : new Date(opp.updatedAt).getTime();
      const daysSince = daysBetween(
        new Date(lastDate).toISOString(),
        new Date().toISOString()
      );
      if (daysSince >= 3) hotIdleCards++;
    }

    // Stale check
    const daysSinceUpdate = daysBetween(
      opp.updatedAt,
      new Date().toISOString()
    );
    if (daysSinceUpdate >= 7) staleCards++;
  }

  return { cardsByStage, totalMRR, overdueCards, hotIdleCards, staleCards };
}

// ─── Execution Panel Computed Data ───────────────────────────────────────────

export function computeTodaysPriorities(
  input: ProactiveEngineInput
): PriorityItem[] {
  const { opportunities, activities, userId, userRole, pipelines } = input;
  const items: PriorityItem[] = [];
  const now = new Date();

  // 1. Overdue activities
  const userActs = filterByUser(activities, userId, userRole);
  const overdueActs = userActs.filter((a) => {
    if (a.status === "completed" || a.status === "cancelled") return false;
    return new Date(a.dueDate) < now;
  });

  for (const act of overdueActs.slice(0, 3)) {
    items.push({
      id: `pri-${act.id}`,
      type: "overdue",
      title: act.title,
      subtitle: `Vencida ${relativeTime(act.dueDate)}${act.clientName ? ` · ${act.clientName}` : ""}`,
      severity: "critical",
      linkedEntityId: act.opportunityId,
      linkedEntityType: "opportunity",
    });
  }

  // 2. Today's pending activities
  const todayActs = userActs.filter(
    (a) => a.status === "pending" && isToday(a.dueDate)
  );
  for (const act of todayActs.slice(0, 3)) {
    items.push({
      id: `pri-${act.id}`,
      type: "due-today",
      title: act.title,
      subtitle: `Hoje${act.dueTime ? ` as ${act.dueTime}` : ""}${act.clientName ? ` · ${act.clientName}` : ""}`,
      severity: "warning",
      linkedEntityId: act.opportunityId,
      linkedEntityType: "opportunity",
    });
  }

  // 3. SLA approaching
  const userOpps = filterByUser(opportunities, userId, userRole).filter(
    (o) => o.status === "open" && o.slaDeadline
  );
  for (const opp of userOpps) {
    const hoursLeft = hoursBetween(now.toISOString(), opp.slaDeadline!);
    if (hoursLeft > 0 && hoursLeft <= 8) {
      const stageName = getStageName(opp.stage, pipelines);
      items.push({
        id: `pri-sla-${opp.id}`,
        type: "sla-warning",
        title: opp.clientName,
        subtitle: `${Math.round(hoursLeft)}h para SLA · ${stageName}`,
        severity: "critical",
        linkedEntityId: opp.id,
        linkedEntityType: "opportunity",
      });
    }
  }

  // 4. Hot leads idle
  const hotIdle = filterByUser(opportunities, userId, userRole).filter(
    (o) => o.status === "open" && o.temperature === "hot"
  );
  for (const opp of hotIdle.slice(0, 2)) {
    const oppActs = activities.filter(
      (a) => a.opportunityId === opp.id && a.status !== "cancelled"
    );
    const lastDate = oppActs.length
      ? Math.max(...oppActs.map((a) => new Date(a.dueDate).getTime()))
      : new Date(opp.updatedAt).getTime();
    const daysSince = daysBetween(
      new Date(lastDate).toISOString(),
      now.toISOString()
    );
    if (daysSince >= 3) {
      items.push({
        id: `pri-hot-${opp.id}`,
        type: "hot-idle",
        title: opp.clientName,
        subtitle: `Lead quente sem atividade ha ${daysSince}d`,
        severity: "warning",
        linkedEntityId: opp.id,
        linkedEntityType: "opportunity",
      });
    }
  }

  // Sort by severity then return top 8
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  return items
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, 8);
}

export function computeSmartInsights(
  input: ProactiveEngineInput
): SmartInsight[] {
  const { opportunities, goals, userId, userRole } = input;
  const insights: SmartInsight[] = [];
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const userOpps = filterByUser(opportunities, userId, userRole);

  // 1. Pipeline velocity (avg days to close won deals)
  const recentWins = userOpps.filter(
    (o) => o.status === "won" && new Date(o.updatedAt) > thirtyDaysAgo
  );
  if (recentWins.length >= 2) {
    const avgDays = Math.round(
      recentWins.reduce(
        (sum, o) => sum + daysBetween(o.createdAt, o.updatedAt),
        0
      ) / recentWins.length
    );
    insights.push({
      id: "insight-velocity",
      icon: "zap",
      title: "Velocidade do Pipeline",
      description: `Ciclo medio de fechamento: ${avgDays} dias (${recentWins.length} deals fechados nos ultimos 30 dias).`,
      metric: { value: `${avgDays}d`, trend: avgDays <= 21 ? "up" : "down" },
    });
  }

  // 2. Conversion rate
  const closed = userOpps.filter(
    (o) =>
      (o.status === "won" || o.status === "lost") &&
      new Date(o.updatedAt) > thirtyDaysAgo
  );
  const won = closed.filter((o) => o.status === "won");
  if (closed.length >= 3) {
    const rate = Math.round((won.length / closed.length) * 100);
    insights.push({
      id: "insight-conversion",
      icon: "trending-up",
      title: "Taxa de Conversao",
      description: `${rate}% de conversao (${won.length} ganhos de ${closed.length} finalizados) nos ultimos 30 dias.`,
      metric: {
        value: `${rate}%`,
        trend: rate >= 50 ? "up" : rate >= 35 ? "stable" : "down",
      },
    });
  }

  // 3. Goal progress
  const activeGoals = goals.filter((g) => new Date(g.endDate) > now);
  if (activeGoals.length > 0) {
    const mainGoal = activeGoals[0];
    const progress = Math.round(
      (mainGoal.current / mainGoal.target) * 100
    );
    const remaining = mainGoal.target - mainGoal.current;
    const remainingStr =
      mainGoal.type === "revenue" ? formatCurrencyBRL(remaining) : `${remaining}`;
    const daysLeft = daysBetween(now.toISOString(), mainGoal.endDate);

    insights.push({
      id: "insight-goal",
      icon: "target",
      title: `Meta: ${mainGoal.title}`,
      description: `${progress}% concluido. Faltam ${remainingStr} em ${daysLeft} dias.`,
      metric: {
        value: `${progress}%`,
        trend: progress >= 80 ? "up" : progress >= 50 ? "stable" : "down",
      },
      actionLabel: "Detalhes",
      actionCommand: "/meta",
    });
  }

  // 4. Total pipeline value
  const openOpps = userOpps.filter((o) => o.status === "open");
  if (openOpps.length > 0) {
    const totalMRR = openOpps.reduce((sum, o) => sum + o.monthlyValue, 0);
    const totalValue = openOpps.reduce((sum, o) => sum + o.value, 0);
    insights.push({
      id: "insight-pipeline-value",
      icon: "bar-chart",
      title: "Pipeline Ativo",
      description: `${openOpps.length} oportunidades abertas. MRR potencial: ${formatCurrencyBRL(totalMRR)}. Valor total: ${formatCurrencyBRL(totalValue)}.`,
      metric: { value: formatCurrencyBRL(totalMRR), trend: "stable" },
      actionLabel: "Ver funil",
      actionCommand: "/funil",
    });
  }

  return insights;
}

export function computeQuickWins(
  input: ProactiveEngineInput
): QuickWinItem[] {
  const { opportunities, activities, userId, userRole } = input;

  const userOpps = filterByUser(opportunities, userId, userRole).filter(
    (o) => o.status === "open"
  );

  return userOpps
    .map((opp) => {
      // Calculate probability based on stage, temperature, recent activity
      let probability = 0;

      // Stage advancement (later stages = higher probability)
      const stageScores: Record<string, number> = {
        "lead-in": 10,
        "contato-feito": 20,
        "reuniao-agendada": 40,
        "proposta-enviada": 60,
        "negociacao": 75,
        "fechamento": 90,
      };
      probability += stageScores[opp.stage] ?? 15;

      // Temperature bonus
      if (opp.temperature === "hot") probability += 15;
      else if (opp.temperature === "warm") probability += 5;

      // Recent activity bonus
      const oppActs = activities.filter(
        (a) => a.opportunityId === opp.id && a.status !== "cancelled"
      );
      const hasRecentActivity = oppActs.some(
        (a) => daysBetween(a.dueDate, new Date().toISOString()) <= 3
      );
      if (hasRecentActivity) probability += 10;

      // Cap at 95
      probability = Math.min(95, probability);

      // Reason text
      const reasons: string[] = [];
      if (opp.temperature === "hot") reasons.push("Lead quente");
      if (
        opp.stage === "negociacao" ||
        opp.stage === "fechamento" ||
        opp.stage === "proposta-enviada"
      )
        reasons.push(opp.stage.replace(/-/g, " "));
      if (hasRecentActivity) reasons.push("Atividade recente");

      return {
        id: opp.id,
        opportunityId: opp.id,
        clientName: opp.clientName,
        stage: opp.stage,
        probability,
        value: opp.monthlyValue,
        reason: reasons.join(" + ") || opp.stage,
      };
    })
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 5);
}

export function computeRiskAlerts(
  input: ProactiveEngineInput
): RiskAlert[] {
  const { opportunities, clients, goals, userId, userRole } = input;
  const alerts: RiskAlert[] = [];
  const now = new Date();

  // 1. SLA breaches
  const userOpps = filterByUser(opportunities, userId, userRole).filter(
    (o) => o.status === "open" && o.slaDeadline
  );
  for (const opp of userOpps) {
    const hoursLeft = hoursBetween(now.toISOString(), opp.slaDeadline!);
    if (hoursLeft < 0) {
      alerts.push({
        id: `risk-sla-${opp.id}`,
        type: "sla-breach",
        title: `SLA estourado: ${opp.clientName}`,
        description: `SLA vencido ha ${Math.abs(Math.round(hoursLeft))}h na etapa ${opp.stage}.`,
        severity: "critical",
        linkedEntityId: opp.id,
      });
    }
  }

  // 2. Client health drops
  const userClients =
    userRole === "master" || userRole === "admin"
      ? clients
      : clients.filter((c) => c.responsibleId === userId);

  const atRiskClients = userClients.filter(
    (c) =>
      c.healthScore === "critical" &&
      c.stage !== "churn"
  );
  for (const client of atRiskClients.slice(0, 3)) {
    alerts.push({
      id: `risk-health-${client.id}`,
      type: "health-drop",
      title: `Saude critica: ${client.companyName}`,
      description: `Cliente com health score critico. Risco de churn iminente.`,
      severity: "critical",
      linkedEntityId: client.id,
    });
  }

  // 3. Stale deals
  const staleOpps = filterByUser(opportunities, userId, userRole).filter(
    (o) =>
      o.status === "open" &&
      daysBetween(o.updatedAt, now.toISOString()) >= 14
  );
  for (const opp of staleOpps.slice(0, 2)) {
    const days = daysBetween(opp.updatedAt, now.toISOString());
    alerts.push({
      id: `risk-stale-${opp.id}`,
      type: "stale",
      title: `Parado ha ${days}d: ${opp.clientName}`,
      description: `Sem movimentacao ha ${days} dias. Reengaje ou reavalie.`,
      severity: "warning",
      linkedEntityId: opp.id,
    });
  }

  // 4. Contract expiring
  for (const client of userClients) {
    if (!client.contractEnd) continue;
    const daysUntil = daysBetween(now.toISOString(), client.contractEnd);
    if (daysUntil > 0 && daysUntil <= 30) {
      alerts.push({
        id: `risk-contract-${client.id}`,
        type: "contract-expiring",
        title: `Contrato expirando: ${client.companyName}`,
        description: `Expira em ${daysUntil} dias. Inicie renovacao.`,
        severity: daysUntil <= 15 ? "critical" : "warning",
        linkedEntityId: client.id,
      });
    }
  }

  // 5. Goal risk
  const activeGoals = goals.filter((g) => new Date(g.endDate) > now);
  for (const goal of activeGoals) {
    const progress = goal.target > 0 ? goal.current / goal.target : 0;
    const daysLeft = daysBetween(now.toISOString(), goal.endDate);
    const totalDays = daysBetween(goal.startDate, goal.endDate);
    const expectedProgress = totalDays > 0 ? (totalDays - daysLeft) / totalDays : 1;

    if (progress < expectedProgress * 0.7 && daysLeft <= 10) {
      alerts.push({
        id: `risk-goal-${goal.id}`,
        type: "goal-risk",
        title: `Meta em risco: ${goal.title}`,
        description: `${Math.round(progress * 100)}% concluido com ${daysLeft} dias restantes.`,
        severity: "critical",
      });
    }
  }

  // Sort by severity
  const severityOrder = { critical: 0, warning: 1 };
  return alerts
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .slice(0, 8);
}

// ─── Morning Briefing Generator ──────────────────────────────────────────────

export function generateMorningSummaryContent(
  input: ProactiveEngineInput
): string {
  const priorities = computeTodaysPriorities(input);
  const insights = computeSmartInsights(input);
  const quickWins = computeQuickWins(input);
  const risks = computeRiskAlerts(input);

  const sections: string[] = [];

  sections.push("🌅 **Briefing Matinal**\n");

  // Priorities
  if (priorities.length > 0) {
    sections.push("**Prioridades de hoje:**");
    for (const p of priorities.slice(0, 5)) {
      const icon = p.severity === "critical" ? "🔴" : p.severity === "warning" ? "🟡" : "🔵";
      sections.push(`  ${icon} **${p.title}** — ${p.subtitle}`);
    }
    sections.push("");
  } else {
    sections.push("**Prioridades:** ✅ Nenhuma urgencia. Dia tranquilo!\n");
  }

  // Quick wins
  if (quickWins.length > 0) {
    sections.push("**Ganhos rapidos (maior probabilidade):**");
    for (const qw of quickWins.slice(0, 3)) {
      sections.push(
        `  🎯 **${qw.clientName}** — ${qw.probability}% de probabilidade · ${formatCurrencyBRL(qw.value)}/mes · ${qw.reason}`
      );
    }
    sections.push("");
  }

  // Risks
  if (risks.length > 0) {
    sections.push("**Alertas de risco:**");
    for (const r of risks.slice(0, 3)) {
      const icon = r.severity === "critical" ? "🚨" : "⚠️";
      sections.push(`  ${icon} ${r.title} — ${r.description}`);
    }
    sections.push("");
  }

  // Key metric
  const conversionInsight = insights.find(
    (i) => i.id === "insight-conversion"
  );
  if (conversionInsight?.metric) {
    sections.push(
      `**Metrica do dia:** Taxa de conversao: ${conversionInsight.metric.value} ${conversionInsight.metric.trend === "up" ? "📈" : conversionInsight.metric.trend === "down" ? "📉" : "➡️"}`
    );
  }

  sections.push("\n💡 Use `/riscos` para detalhes ou `/meta` para progresso das metas.");

  return sections.join("\n");
}
