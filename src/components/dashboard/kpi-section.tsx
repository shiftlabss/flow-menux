"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, animate, useMotionValue } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Clock3,
  Gauge,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStore } from "@/stores/dashboard-store";
import { cardStaggerContainer, listItemReveal } from "@/lib/motion";

type KPIState = "default" | "loading" | "error";
type TrendTone = "positive" | "negative" | "neutral";

interface TrendData {
  value: string;
  tone: TrendTone;
}

interface KPIData {
  label: string;
  value: number;
  valueFormat: "currency" | "percent" | "integer" | "sla";
  subtext: string;
  trend?: TrendData;
  targetPath: string;
  state?: KPIState;
}

const getKpiData = (period: string): Record<"pipeline" | "conversion" | "activities" | "sla", KPIData> => {
  const periodFactor = period === "quarter" ? 3 : period === "30d" ? 1.45 : 1;

  return {
    pipeline: {
      label: "Pipeline Total",
      value: 3_450_000 * periodFactor,
      valueFormat: "currency",
      subtext: "vs período anterior",
      trend: { value: "+12%", tone: "positive" },
      targetPath: "/pipes",
      state: "default",
    },
    conversion: {
      label: "Conversão Global",
      value: 18.5,
      valueFormat: "percent",
      subtext: "Ganhos no período: 42",
      trend: { value: "+8%", tone: "positive" },
      targetPath: "/reports",
      state: "default",
    },
    activities: {
      label: "Atividades",
      value: 12,
      valueFormat: "integer",
      subtext: "Hoje",
      trend: { value: "-3%", tone: "negative" },
      targetPath: "/activities",
      state: "default",
    },
    sla: {
      label: "SLA Crítico",
      value: 2,
      valueFormat: "sla",
      subtext: "5 em risco",
      trend: { value: "+2%", tone: "negative" },
      targetPath: "/pipes?status=sla-breached",
      state: "default",
    },
  };
};

function formatKpiValue(value: number, format: KPIData["valueFormat"]): string {
  if (format === "currency") {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (format === "percent") {
    return `${value.toFixed(1)}%`;
  }

  if (format === "sla") {
    return `${Math.round(value)} estourados`;
  }

  return Math.round(value).toString();
}

function AnimatedKpiValue({
  value,
  format,
}: {
  value: number;
  format: KPIData["valueFormat"];
}) {
  const motionValue = useMotionValue(value);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const unsubscribe = motionValue.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [motionValue]);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.22,
      ease: [0.22, 0.61, 0.36, 1],
    });
    return controls.stop;
  }, [motionValue, value]);

  return <>{formatKpiValue(displayValue, format)}</>;
}

function TrendBadge({ trend }: { trend?: TrendData }) {
  if (!trend) {
    return <div className="h-6 min-w-[68px]" aria-hidden />;
  }

  const Icon =
    trend.tone === "positive"
      ? ArrowUpRight
      : trend.tone === "negative"
        ? ArrowDownRight
        : TrendingUp;

  return (
    <div
      className={cn(
        "inline-flex h-6 min-w-[68px] items-center justify-center gap-1 rounded-full px-2 text-[12px] font-semibold",
        trend.tone === "positive" && "bg-emerald-100 text-emerald-700",
        trend.tone === "negative" && "bg-red-100 text-red-700",
        trend.tone === "neutral" && "bg-zinc-100 text-zinc-700"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {trend.value}
    </div>
  );
}

function SparklineMini() {
  const points = "0,26 18,24 36,17 54,20 72,14 90,16 108,8 126,6";
  return (
    <svg
      width="126"
      height="28"
      viewBox="0 0 126 28"
      fill="none"
      className="h-7 w-[126px]"
      aria-hidden
    >
      <polyline
        points={points}
        stroke="#10b981"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ConversionBarsMini() {
  const bars = [100, 68, 41, 19];
  return (
    <div className="flex h-7 w-[126px] items-end gap-1.5" aria-hidden>
      {bars.map((height, index) => (
        <div
          key={`bar-${index}`}
          className={cn(
            "w-full rounded-[6px]",
            index === bars.length - 1 ? "bg-brand" : "bg-brand/25"
          )}
          style={{ height: `${Math.max(8, Math.round((height / 100) * 28))}px` }}
        />
      ))}
    </div>
  );
}

function ActivityMiniChips() {
  return (
    <div className="flex h-7 w-[126px] items-center justify-end gap-1.5" aria-hidden>
      <span className="inline-flex h-6 items-center rounded-full bg-red-100 px-2 text-[10px] font-semibold text-red-700">
        Atrasadas: 4
      </span>
      <span className="inline-flex h-6 items-center rounded-full bg-zinc-100 px-2 text-[10px] font-semibold text-zinc-700">
        Hoje: 8
      </span>
    </div>
  );
}

function SlaProgressMini() {
  return (
    <div className="w-[126px]" aria-hidden>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/80">
        <div className="h-full w-[35%] rounded-full bg-red-500" />
      </div>
      <p className="mt-1 text-right text-[10px] text-zinc-500">35% de risco</p>
    </div>
  );
}

function KPITemplateCard({
  icon,
  data,
  miniVisual,
  onClick,
  onRetry,
}: {
  icon: React.ReactNode;
  data: KPIData;
  miniVisual: React.ReactNode;
  onClick: () => void;
  onRetry: () => void;
}) {
  const state = data.state ?? "default";

  return (
    <motion.button
      type="button"
      onClick={state === "default" ? onClick : undefined}
      whileTap={state === "default" ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.09, ease: "easeInOut" }}
      className={cn(
        "premium-shine group flex h-[156px] w-full flex-col rounded-[20px] border border-zinc-200/80 bg-white/85 p-[18px] text-left",
        "shadow-[var(--shadow-bento-sm)] transition-[transform,box-shadow,border-color] duration-[140ms] ease-out",
        "hover:-translate-y-[2px] hover:shadow-[var(--shadow-bento-sm-hover)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25",
        state !== "default" && "cursor-default hover:translate-y-0"
      )}
    >
      {state === "loading" ? (
        <div className="flex h-full flex-col">
          <Skeleton className="h-3 w-24 rounded-md before:[animation-duration:900ms]" />
          <Skeleton className="mt-4 h-8 w-32 rounded-lg before:[animation-duration:900ms]" />
          <Skeleton className="mt-2 h-3 w-28 rounded-md before:[animation-duration:900ms]" />
          <div className="mt-auto flex h-[42px] items-end">
            <Skeleton className="h-7 w-full rounded-md before:[animation-duration:900ms]" />
          </div>
        </div>
      ) : state === "error" ? (
        <div className="flex h-full flex-col justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900">{data.label}</p>
            <p className="mt-2 text-xs text-red-700">Erro ao carregar métrica.</p>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRetry();
            }}
            className="w-fit text-xs font-semibold text-brand underline underline-offset-4"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <header className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] bg-zinc-100 text-zinc-700">
                {icon}
              </div>
              <p className="truncate text-[13px] font-medium text-zinc-600">
                {data.label}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400 transition-colors group-hover:text-zinc-600" />
          </header>

          <div className="mt-3">
            <p className="text-[30px] leading-none font-semibold text-zinc-900">
              <AnimatedKpiValue value={data.value} format={data.valueFormat} />
            </p>
            <p className="mt-2 truncate text-[12px] text-zinc-500">{data.subtext || "—"}</p>
          </div>

          <footer className="mt-auto flex h-[42px] items-end justify-between gap-2">
            <TrendBadge trend={data.trend} />
            <div className="flex h-7 items-end justify-end">{miniVisual}</div>
          </footer>
        </>
      )}
    </motion.button>
  );
}

export function KpiSection() {
  const router = useRouter();
  const { period } = useDashboardStore();
  const baseData = getKpiData(period);
  const [cardState, setCardState] = useState<Record<keyof typeof baseData, KPIState>>({
    pipeline: baseData.pipeline.state ?? "default",
    conversion: baseData.conversion.state ?? "default",
    activities: baseData.activities.state ?? "default",
    sla: baseData.sla.state ?? "default",
  });

  const kpis = useMemo(
    () => ({
      pipeline: { ...baseData.pipeline, state: cardState.pipeline },
      conversion: { ...baseData.conversion, state: cardState.conversion },
      activities: { ...baseData.activities, state: cardState.activities },
      sla: { ...baseData.sla, state: cardState.sla },
    }),
    [baseData, cardState]
  );

  function retryCard(card: keyof typeof kpis) {
    setCardState((prev) => ({ ...prev, [card]: "loading" }));
    window.setTimeout(() => {
      setCardState((prev) => ({ ...prev, [card]: "default" }));
    }, 240);
  }

  return (
    <motion.div
      variants={cardStaggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <motion.div custom={0} variants={listItemReveal}>
        <KPITemplateCard
          icon={<Gauge className="h-4 w-4" />}
          data={kpis.pipeline}
          miniVisual={<SparklineMini />}
          onClick={() => router.push(kpis.pipeline.targetPath)}
          onRetry={() => retryCard("pipeline")}
        />
      </motion.div>

      <motion.div custom={1} variants={listItemReveal}>
        <KPITemplateCard
          icon={<TrendingUp className="h-4 w-4" />}
          data={kpis.conversion}
          miniVisual={<ConversionBarsMini />}
          onClick={() => router.push(kpis.conversion.targetPath)}
          onRetry={() => retryCard("conversion")}
        />
      </motion.div>

      <motion.div custom={2} variants={listItemReveal}>
        <KPITemplateCard
          icon={<Clock3 className="h-4 w-4" />}
          data={kpis.activities}
          miniVisual={<ActivityMiniChips />}
          onClick={() => router.push(kpis.activities.targetPath)}
          onRetry={() => retryCard("activities")}
        />
      </motion.div>

      <motion.div custom={3} variants={listItemReveal}>
        <KPITemplateCard
          icon={<ShieldAlert className="h-4 w-4" />}
          data={kpis.sla}
          miniVisual={<SlaProgressMini />}
          onClick={() => router.push(kpis.sla.targetPath)}
          onRetry={() => retryCard("sla")}
        />
      </motion.div>
    </motion.div>
  );
}
