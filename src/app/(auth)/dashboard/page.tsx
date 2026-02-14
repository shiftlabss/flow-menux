"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  CalendarCheck,
  Phone,
  Mail,
  Video,
  MessageSquare,
  Kanban,
  Heart,
  AlertCircle,
  ShieldAlert,
  UserX,
  Users,
  BarChart3,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { useOpportunityStore } from "@/stores/opportunity-store";
import { useActivityStore } from "@/stores/activity-store";
import { useClientStore } from "@/stores/client-store";
import { calculateHealthScore } from "@/lib/business-rules";
import { BentoStatCard } from "@/components/ui/bento-stat-card";
import { BentoListCard } from "@/components/ui/bento-list-card";
import { BentoTableCard } from "@/components/ui/bento-table-card";
import { BentoCard } from "@/components/ui/bento-card";
import { SkeletonBlock } from "@/components/ui/skeleton-block";
import { InlineFeedback } from "@/components/ui/inline-feedback";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Role = "comercial" | "cs" | "admin";

type ActivityType = "call" | "meeting" | "follow-up" | "email";

interface Activity {
  id: string;
  title: string;
  time: string;
  type: ActivityType;
  overdue: boolean;
  done: boolean;
  loading?: boolean;
  success?: boolean;
  error?: string;
}

interface PipelineStage {
  stage: string;
  count: number;
  value: number;
}

interface CriticalAlert {
  id: string;
  type: "sla" | "health" | "activity";
  message: string;
  severity: "danger" | "warning";
}

interface HealthCard {
  label: string;
  value: number;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

interface TeamMember {
  name: string;
  deals: number;
  revenue: number;
  conversion: number;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

// Metrics are now computed from stores in the component

const criticalAlerts: CriticalAlert[] = [
  {
    id: "1",
    type: "sla",
    message: "3 oportunidades com SLA estourado",
    severity: "danger",
  },
  {
    id: "2",
    type: "health",
    message: "Cliente Acme Corp com Health Score Crítico",
    severity: "danger",
  },
  {
    id: "3",
    type: "activity",
    message: "5 atividades atrasadas para hoje",
    severity: "warning",
  },
];

// Pipeline preview is now computed from stores in the component

const todayActivities: Activity[] = [
  {
    id: "1",
    title: "Ligação com João - Restaurante Bela Vista",
    time: "08:00",
    type: "call",
    overdue: true,
    done: false,
  },
  {
    id: "2",
    title: "Follow-up proposta - Café Central",
    time: "08:30",
    type: "follow-up",
    overdue: true,
    done: false,
  },
  {
    id: "3",
    title: "Reunião de apresentação - Hotel Sunset",
    time: "11:00",
    type: "meeting",
    overdue: false,
    done: false,
  },
  {
    id: "4",
    title: "E-mail de acompanhamento - Pousada Mar",
    time: "14:00",
    type: "email",
    overdue: false,
    done: false,
  },
  {
    id: "5",
    title: "Ligação com Maria - Padaria Gourmet",
    time: "16:00",
    type: "call",
    overdue: false,
    done: false,
  },
];

const csHealthCards: HealthCard[] = [
  {
    label: "Saudáveis",
    value: 42,
    color: "text-status-success",
    bgColor: "bg-status-success-light",
    icon: <Heart className="h-5 w-5" />,
  },
  {
    label: "Atenção",
    value: 15,
    color: "text-status-warning",
    bgColor: "bg-status-warning-light",
    icon: <AlertCircle className="h-5 w-5" />,
  },
  {
    label: "Críticos",
    value: 7,
    color: "text-status-danger",
    bgColor: "bg-status-danger-light",
    icon: <ShieldAlert className="h-5 w-5" />,
  },
  {
    label: "Churn",
    value: 3,
    color: "text-zinc-600",
    bgColor: "bg-zinc-50",
    icon: <UserX className="h-5 w-5" />,
  },
];

const teamMembers: TeamMember[] = [
  { name: "Ana Souza", deals: 14, revenue: 92000, conversion: 38 },
  { name: "Carlos Lima", deals: 11, revenue: 78000, conversion: 31 },
  { name: "Fernanda Reis", deals: 9, revenue: 64000, conversion: 28 },
  { name: "Pedro Alves", deals: 13, revenue: 50500, conversion: 35 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  call: <Phone className="h-4 w-4" />,
  meeting: <Video className="h-4 w-4" />,
  "follow-up": <MessageSquare className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
};

// ---------------------------------------------------------------------------
// Dashboard Skeleton (Bento Style)
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="bento-container mx-auto space-y-8">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-[15px] bg-zinc-100" />
        <div className="h-4 w-72 animate-pulse rounded-[15px] bg-zinc-100" />
      </div>

      {/* Metric cards skeleton - Bento Grid */}
      <div className="bento-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-bento-card)] border border-zinc-200 bg-white p-5 shadow-[var(--shadow-bento-sm)]"
          >
            <SkeletonBlock type="stat" />
          </div>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="bento-grid grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="h-96 animate-pulse rounded-[var(--radius-bento-card)] bg-zinc-100" />
        </div>
        <div className="lg:col-span-4">
          <div className="h-96 animate-pulse rounded-[var(--radius-bento-card)] bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pipeline Chart (Bento Style)
// ---------------------------------------------------------------------------

function PipelineChart({ stages }: { stages: PipelineStage[] }) {
  const maxValue = Math.max(...stages.map((s) => s.value));

  if (stages.length === 0) {
    return (
      <BentoCard title="Pipeline de Vendas">
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-zinc-400">
          <Kanban className="h-10 w-10" />
          <p className="font-body text-sm">Pipeline vazio</p>
        </div>
      </BentoCard>
    );
  }

  return (
    <BentoCard title="Pipeline de Vendas" hoverable>
      <div className="space-y-4">
        {stages.map((stage) => {
          const pct = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
          return (
            <div key={stage.stage} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm font-medium text-zinc-700">
                  {stage.stage}
                </span>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="rounded-[var(--radius-bento-inner)] font-body text-xs"
                  >
                    {stage.count}
                  </Badge>
                  <span className="w-24 text-right font-body text-sm font-medium text-black">
                    {formatCurrency(stage.value)}
                  </span>
                </div>
              </div>
              {/* Horizontal bar */}
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
                  className="absolute inset-y-0 left-0 rounded-full bg-brand"
                />
              </div>
            </div>
          );
        })}
      </div>
    </BentoCard>
  );
}

// ---------------------------------------------------------------------------
// CS Health Overview (Bento Style)
// ---------------------------------------------------------------------------

function CSHealthOverview({ cards }: { cards: HealthCard[] }) {
  return (
    <BentoCard title="Saúde dos Clientes" hoverable>
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={cn(
              "flex flex-col items-center gap-2 rounded-[var(--radius-bento-card)] p-5",
              card.bgColor
            )}
          >
            <div className={card.color}>{card.icon}</div>
            <p className={cn("font-heading text-2xl font-bold sm:text-3xl", card.color)}>
              {card.value}
            </p>
            <p className="font-body text-sm text-zinc-600">{card.label}</p>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}

// ---------------------------------------------------------------------------
// Critical Alerts (Bento Style - Elevated)
// ---------------------------------------------------------------------------

function CriticalAlerts({ alerts }: { alerts: CriticalAlert[] }) {
  const router = useRouter();

  if (alerts.length === 0) return null;

  const handleAlertClick = (alert: CriticalAlert) => {
    switch (alert.type) {
      case "sla":
        router.push("/pipes");
        break;
      case "health":
        router.push("/clients");
        break;
      case "activity":
        router.push("/activities");
        break;
      default:
        router.push("/dashboard");
    }
  };

  return (
    <BentoListCard
      title="Alertas Críticos"
      items={alerts}
      elevated
      renderItem={(alert) => (
        <button
          onClick={() => handleAlertClick(alert)}
          className={cn(
            "group w-full rounded-[var(--radius-bento-inner)]",
            "border-l-4 p-3",
            "flex items-center gap-3",
            "transition-all duration-[var(--transition-bento)]",
            "hover:bg-zinc-50 active:scale-[var(--scale-bento-active)]",
            alert.severity === "danger"
              ? "border-l-status-danger bg-status-danger-light"
              : "border-l-status-warning bg-status-warning-light"
          )}
        >
          <AlertTriangle
            className={cn(
              "h-5 w-5 shrink-0",
              alert.severity === "danger"
                ? "text-status-danger"
                : "text-status-warning"
            )}
          />
          <p className="flex-1 text-left font-body text-sm font-medium text-black">
            {alert.message}
          </p>
          <span className="font-body text-xs text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100">
            Ver detalhes →
          </span>
        </button>
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Today's Activities (Bento Style - Elevated)
// ---------------------------------------------------------------------------

function TodayActivities({
  activities,
  onToggle,
}: {
  activities: Activity[];
  onToggle: (id: string) => void;
}) {
  const overdue = activities.filter((a) => a.overdue && !a.done);
  const today = activities.filter((a) => !a.overdue);

  // Agrupar atividades com subheaders
  const groupedItems: Array<{ type: "header"; label: string } | { type: "activity"; activity: Activity }> = [];

  if (overdue.length > 0) {
    groupedItems.push({ type: "header", label: "ATRASADAS" });
    overdue.forEach((activity) => groupedItems.push({ type: "activity", activity }));
  }

  if (today.length > 0) {
    groupedItems.push({ type: "header", label: "HOJE" });
    today.forEach((activity) => groupedItems.push({ type: "activity", activity }));
  }

  return (
    <BentoListCard
      title="Atividades de Hoje"
      items={groupedItems}
      elevated
      grouped
      emptyState={{
        icon: <CalendarCheck className="h-10 w-10" />,
        message: "Nenhuma atividade para hoje",
      }}
      renderItem={(item) => {
        if (item.type === "header") {
          return (
            <p
              className={cn(
                "font-heading text-xs font-semibold uppercase tracking-wider",
                item.label === "ATRASADAS"
                  ? "text-status-danger"
                  : "text-black"
              )}
            >
              {item.label}
            </p>
          );
        }

        const activity = item.activity;

        return (
          <div className="space-y-2">
            <div
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-bento-card)] border p-3",
                "transition-colors duration-[var(--transition-bento)]",
                activity.done
                  ? "border-zinc-100 bg-zinc-50 opacity-60"
                  : activity.overdue
                    ? "border-status-danger/20 bg-status-danger-light"
                    : "border-zinc-100 bg-white hover:bg-zinc-50"
              )}
            >
              {/* Checkbox */}
              <button
                onClick={() => onToggle(activity.id)}
                disabled={activity.loading}
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-bento-small)] border",
                  "transition-all duration-[var(--transition-bento-fast)]",
                  "focus:outline-none focus:ring-2 focus:ring-brand/50 focus:ring-offset-2",
                  activity.done
                    ? "border-brand bg-brand text-white"
                    : "border-zinc-300 bg-white hover:border-brand",
                  activity.loading && "opacity-50 cursor-wait",
                  !activity.loading && !activity.done && "active:scale-[var(--scale-bento-active)]"
                )}
                aria-label={
                  activity.done
                    ? "Desmarcar atividade"
                    : "Marcar atividade como concluída"
                }
              >
                {activity.done && <Check className="h-3 w-3" />}
              </button>

              {/* Type icon */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  activity.overdue && !activity.done
                    ? "bg-status-danger/10 text-status-danger"
                    : "bg-zinc-100 text-zinc-500"
                )}
              >
                {activityIcons[activity.type]}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate font-body text-sm font-medium",
                    activity.done ? "text-zinc-400 line-through" : "text-black"
                  )}
                >
                  {activity.title}
                </p>
                <p
                  className={cn(
                    "font-body text-xs",
                    activity.overdue && !activity.done
                      ? "font-medium text-status-danger"
                      : "text-zinc-500"
                  )}
                >
                  {activity.time}
                </p>
              </div>
            </div>

            {/* Inline Feedback - Success */}
            {activity.success && (
              <InlineFeedback
                type="success"
                message="Atividade concluída com sucesso!"
                compact
              />
            )}

            {/* Inline Feedback - Error */}
            {activity.error && (
              <InlineFeedback
                type="error"
                message={activity.error}
                actionLabel="Tentar novamente"
                onAction={() => onToggle(activity.id)}
                compact
              />
            )}
          </div>
        );
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>(todayActivities);
  const { user } = useAuthStore();
  const { opportunities } = useOpportunityStore();
  const { activities: storeActivities } = useActivityStore();
  const { clients } = useClientStore();

  // Computed metrics from stores
  const openOpps = useMemo(() => opportunities.filter((o) => o.status === "open"), [opportunities]);
  const wonOpps = useMemo(() => opportunities.filter((o) => o.status === "won"), [opportunities]);

  const metrics = useMemo(() => {
    const totalValue = openOpps.reduce((sum, o) => sum + o.value, 0);
    const pendingActivities = storeActivities.filter((a) => a.status === "pending" || a.status === "overdue");
    const overdueActivities = storeActivities.filter((a) => a.status === "overdue");
    const slaBreaches = openOpps.filter((o) => o.slaDeadline && new Date(o.slaDeadline) < new Date()).length;

    return {
      totalOpportunities: openOpps.length,
      totalValue,
      conversionRate: opportunities.length > 0 ? Math.round((wonOpps.length / opportunities.length) * 100) : 0,
      averageTicket: openOpps.length > 0 ? Math.round(totalValue / openOpps.length) : 0,
      activitiesDue: pendingActivities.length,
      slaBreaches,
      newLeadsThisMonth: openOpps.filter((o) => o.stage === "lead-in").length,
      wonThisMonth: wonOpps.length,
    };
  }, [openOpps, wonOpps, opportunities, storeActivities]);

  const pipelinePreview: PipelineStage[] = useMemo(() => {
    const stageLabels: Record<string, string> = {
      "lead-in": "Lead-In",
      "contato-feito": "Contato Feito",
      "reuniao-agendada": "Reunião Agendada",
      "proposta-enviada": "Proposta Enviada",
      "negociacao": "Negociação",
      "fechamento": "Fechamento",
    };

    const stageOrder = ["lead-in", "contato-feito", "reuniao-agendada", "proposta-enviada", "negociacao", "fechamento"];
    return stageOrder.map((stageId) => {
      const stageOpps = openOpps.filter((o) => o.stage === stageId);
      return {
        stage: stageLabels[stageId] || stageId,
        count: stageOpps.length,
        value: stageOpps.reduce((sum, o) => sum + o.value, 0),
      };
    });
  }, [openOpps]);

  // Computed CS health from client store
  const computedCsHealthCards: HealthCard[] = useMemo(() => {
    const healthCounts = { good: 0, warning: 0, critical: 0, churn: 0 };
    for (const client of clients) {
      if (client.stage === "churn") {
        healthCounts.churn++;
      } else {
        const { category } = calculateHealthScore(client);
        healthCounts[category]++;
      }
    }
    return [
      { ...csHealthCards[0], value: healthCounts.good },
      { ...csHealthCards[1], value: healthCounts.warning },
      { ...csHealthCards[2], value: healthCounts.critical },
      { ...csHealthCards[3], value: healthCounts.churn },
    ];
  }, [clients]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleActivity = useCallback(async (id: string) => {
    // Simular loading
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, loading: true, success: false, error: undefined } : a))
    );

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simular sucesso (90% de chance)
    const success = Math.random() > 0.1;

    setActivities((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              done: success ? !a.done : a.done,
              loading: false,
              success: success,
              error: success ? undefined : "Erro ao atualizar atividade. Tente novamente.",
            }
          : a
      )
    );

    // Limpar feedback após 3s
    setTimeout(() => {
      setActivities((prev) =>
        prev.map((a) => (a.id === id ? { ...a, success: false, error: undefined } : a))
      );
    }, 3000);
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const userRole = user?.role || "master";

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="bento-container mx-auto space-y-8"
    >
      {/* Page Header */}
      <motion.div variants={fadeUp}>
        <h1 className="font-heading text-2xl font-bold text-black sm:text-3xl">Dashboard</h1>
        <p className="mt-1 font-body text-sm text-zinc-500">
          Visão geral do seu pipeline e atividades
        </p>
      </motion.div>

      {/* Metric Cards - Bento Grid Responsivo */}
      {userRole === "cs" ? (
        <motion.div variants={fadeUp} className="bento-grid grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {computedCsHealthCards.map((card, i) => (
            <motion.div key={card.label} variants={scaleIn} custom={i}>
            <BentoStatCard
              key={card.label}
              label={card.label}
              value={card.value.toString()}
              helper="clientes nesta categoria"
              icon={card.icon}
              delta={{
                value:
                  card.label === "Saudáveis"
                    ? 5
                    : card.label === "Churn"
                      ? 2
                      : card.label === "Atenção"
                        ? 3
                        : 8,
                direction:
                  card.label === "Saudáveis"
                    ? "up"
                    : card.label === "Churn"
                      ? "down"
                      : card.label === "Atenção"
                        ? "up"
                        : "down",
              }}
            />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="bento-grid grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <motion.div variants={scaleIn}>
          <BentoStatCard
            label="Oportunidades Abertas"
            value={metrics.totalOpportunities.toString()}
            helper={`${metrics.newLeadsThisMonth} novos este mês`}
            icon={<Target className="h-5 w-5" />}
            delta={{ value: 12, direction: "up" }}
          />
          </motion.div>
          <motion.div variants={scaleIn}>
          <BentoStatCard
            label="Valor Total no Pipeline"
            value={formatCurrency(metrics.totalValue)}
            helper={`Ticket médio: ${formatCurrency(metrics.averageTicket)}`}
            icon={<DollarSign className="h-5 w-5" />}
            delta={{ value: 8, direction: "up" }}
          />
          </motion.div>
          <motion.div variants={scaleIn}>
          <BentoStatCard
            label="Taxa de Conversão"
            value={`${metrics.conversionRate}%`}
            helper={`${metrics.wonThisMonth} ganhos este mês`}
            icon={<Users className="h-5 w-5" />}
            delta={{ value: 5, direction: "up" }}
          />
          </motion.div>
          <motion.div variants={scaleIn}>
          <BentoStatCard
            label="Atividades Pendentes"
            value={metrics.activitiesDue.toString()}
            helper={`${metrics.slaBreaches} SLAs estourados`}
            icon={<CalendarCheck className="h-5 w-5" />}
            delta={{ value: 3, direction: "down" }}
          />
          </motion.div>
        </motion.div>
      )}

      {/* Bento Layout Principal */}
      <motion.div variants={fadeUp} className="bento-grid grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Coluna Esquerda - 8 cols */}
        <motion.div variants={fadeIn} className="space-y-6 lg:col-span-8">
          {/* Alertas Críticos - Full width em mobile, integrado no grid em desktop */}
          <div className="lg:hidden">
            <CriticalAlerts alerts={criticalAlerts} />
          </div>

          {/* Comercial: Pipeline */}
          {(userRole === "comercial" || userRole === "admin" || userRole === "master") && (
            <PipelineChart stages={pipelinePreview} />
          )}

          {/* CS: Health Overview */}
          {userRole === "cs" && <CSHealthOverview cards={computedCsHealthCards} />}

          {/* Admin: Team Performance */}
          {(userRole === "admin" || userRole === "master") && (
            <BentoTableCard
              title="Desempenho da Equipe"
              columns={[
                { key: "name", label: "Nome", align: "left" },
                { key: "deals", label: "Deals", align: "center" },
                { key: "revenue", label: "Receita", align: "center" },
                { key: "conversion", label: "Conversão", align: "right" },
              ]}
              rows={teamMembers.map((m) => ({
                name: (
                  <span className="truncate font-medium text-black">{m.name}</span>
                ),
                deals: <span className="text-zinc-600">{m.deals}</span>,
                revenue: (
                  <span className="text-zinc-600">{formatCurrency(m.revenue)}</span>
                ),
                conversion: (
                  <span className="font-semibold text-brand">{m.conversion}%</span>
                ),
              }))}
            />
          )}
        </motion.div>

        {/* Coluna Direita - 4 cols (tall cards) */}
        <motion.div variants={fadeIn} className="space-y-6 lg:col-span-4">
          {/* Alertas Críticos - Visible apenas em desktop */}
          <div className="hidden lg:block">
            <CriticalAlerts alerts={criticalAlerts} />
          </div>

          {/* Atividades de Hoje */}
          <TodayActivities activities={activities} onToggle={handleToggleActivity} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
