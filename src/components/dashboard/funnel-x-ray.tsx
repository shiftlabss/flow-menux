"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Gauge,
  Lightbulb,
  Loader2,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type FlowStageId = "lead" | "contact" | "meeting" | "proposal" | "won";
type FunnelXRayState = "ready" | "loading" | "error";
type ActionState = "idle" | "loading" | "success" | "error";

interface FlowStage {
  id: FlowStageId;
  label: string;
  volume: number;
  value: number;
  stalledCount: number;
  stalledDays: number;
}

interface FlowTransition {
  from: FlowStage;
  to: FlowStage;
  conversion: number;
  advanced: number;
  base: number;
}

interface StageInsight {
  riskDeals: string[];
  highlight: string;
  recommendation: string;
}

const STAGE_TO_PIPELINE: Record<FlowStageId, string> = {
  lead: "lead-in",
  contact: "contato-feito",
  meeting: "reuniao-agendada",
  proposal: "proposta-enviada",
  won: "fechamento",
};

const FUNNEL_STAGES: FlowStage[] = [
  {
    id: "lead",
    label: "Leads",
    volume: 150,
    value: 2460000,
    stalledCount: 6,
    stalledDays: 3,
  },
  {
    id: "contact",
    label: "Contato",
    volume: 68,
    value: 1840000,
    stalledCount: 7,
    stalledDays: 4,
  },
  {
    id: "meeting",
    label: "Reunião",
    volume: 44,
    value: 1260000,
    stalledCount: 8,
    stalledDays: 4,
  },
  {
    id: "proposal",
    label: "Proposta",
    volume: 11,
    value: 850000,
    stalledCount: 11,
    stalledDays: 5,
  },
  {
    id: "won",
    label: "Fechamento",
    volume: 3,
    value: 120000,
    stalledCount: 2,
    stalledDays: 2,
  },
];

const STAGE_INSIGHTS: Record<FlowStageId, StageInsight> = {
  lead: {
    riskDeals: ["Blue Horizon Foods", "Mercado Vale Norte", "Bistrô Veneza"],
    highlight: "Lead subiu +12% na semana",
    recommendation: "Priorizar contato inicial em leads quentes das últimas 24h.",
  },
  contact: {
    riskDeals: ["Hotel Mirante Sul", "Rede Sabor Urbano", "Alpha Distribuição"],
    highlight: "Contato com decisor caiu 9%",
    recommendation: "Escalar follow-up com decisores sem retorno há 3 dias.",
  },
  meeting: {
    riskDeals: ["Grupo Matriz", "Restaurante Villa", "Bom Pão Atacado"],
    highlight: "Reuniões com melhor fit subiram 7%",
    recommendation: "Fechar agenda com agenda de prova de valor em até 48h.",
  },
  proposal: {
    riskDeals: ["Café Aurora", "Rede Solaris", "Empório Central"],
    highlight: "Queda de 75% da reunião para proposta",
    recommendation:
      "Cobrar feedbacks das propostas paradas para destravar fechamento.",
  },
  won: {
    riskDeals: ["Núcleo Gourmet", "Casa da Serra", "Pousada Atlântica"],
    highlight: "Fechamento estável, porém com ticket menor",
    recommendation: "Subir ticket com pacote premium na reta final.",
  },
};

function buildTransitions(stages: FlowStage[]): FlowTransition[] {
  return stages.slice(0, -1).map((from, index) => {
    const to = stages[index + 1];
    const conversion =
      from.volume > 0 ? Math.round((to.volume / from.volume) * 100) : 0;
    return {
      from,
      to,
      conversion,
      advanced: to.volume,
      base: from.volume,
    };
  });
}

function formatCurrencyCompact(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`;
  return `R$ ${value}`;
}

function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function FunnelXRay({ state = "ready" }: { state?: FunnelXRayState }) {
  const router = useRouter();
  const [viewState, setViewState] = useState<FunnelXRayState>(state);
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [activeStageId, setActiveStageId] = useState<FlowStageId | null>(null);

  const stages = FUNNEL_STAGES;
  const transitions = useMemo(() => buildTransitions(stages), [stages]);
  const hasEnoughData = stages.length >= 2 && stages.some((stage) => stage.volume > 0);

  const bottleneck = useMemo(() => {
    if (transitions.length === 0) return null;
    return transitions.reduce((min, current) =>
      current.conversion < min.conversion ? current : min
    );
  }, [transitions]);

  const criticalStageId = bottleneck?.to.id ?? stages[0]?.id ?? null;
  const bottleneckDrop = bottleneck ? Math.max(0, 100 - bottleneck.conversion) : 0;
  const bottleneckStalledCount = bottleneck?.to.stalledCount ?? 0;
  const bottleneckStalledDays = bottleneck?.to.stalledDays ?? 0;
  const averageSpeedDays = 18;
  const riskValue = 45000;

  const activeStage = stages.find((stage) => stage.id === activeStageId) ?? null;
  const activeInsight = activeStage ? STAGE_INSIGHTS[activeStage.id] : null;
  const highlightText = activeInsight?.highlight ?? "Sem destaque para a etapa selecionada";
  const recommendationText =
    activeInsight?.recommendation ??
    "Sem recomendação disponível para a etapa selecionada.";

  useEffect(() => {
    setViewState(state);
  }, [state]);

  useEffect(() => {
    if (criticalStageId) {
      setActiveStageId(criticalStageId);
    }
  }, [criticalStageId]);

  useEffect(() => {
    if (actionState !== "success") return;
    const timer = window.setTimeout(() => setActionState("idle"), 1200);
    return () => window.clearTimeout(timer);
  }, [actionState]);

  function openPipeline(stageId?: FlowStageId) {
    if (!stageId) {
      router.push("/pipes");
      return;
    }
    const stageParam = STAGE_TO_PIPELINE[stageId];
    router.push(`/pipes?stage=${stageParam}`);
  }

  async function handleRecommendedAction() {
    if (actionState === "loading") return;
    setActionState("loading");
    await new Promise((resolve) => window.setTimeout(resolve, 180));

    const success = Math.random() > 0.14;
    setActionState(success ? "success" : "error");
  }

  function handleRetry() {
    setViewState("loading");
    window.setTimeout(() => {
      setViewState("ready");
    }, 220);
  }

  return (
    <BentoCard
      noPadding
      elevated
      hoverable
      className="min-h-0 overflow-hidden border-zinc-200/80 bg-white/75"
    >
      <div className="border-b border-zinc-200/75 bg-white/85 px-3.5 py-3 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-heading text-[1.02rem] font-semibold text-zinc-900">
              Raio X do Funil
            </h3>
            <p className="truncate text-xs text-zinc-500">
              Fluxo de conversão, gargalos e ação recomendada para hoje
            </p>
          </div>
          <motion.button
            type="button"
            onClick={() => openPipeline(activeStage?.id)}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.09, ease: "easeOut" }}
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-zinc-700 transition-all duration-[120ms] ease-out hover:-translate-y-px hover:bg-zinc-100 hover:text-zinc-900"
          >
            <span className="underline-offset-4 transition-all duration-[120ms] group-hover:underline">
              Ver Pipeline
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </div>

      {viewState === "error" && (
        <div className="mx-5 mt-4 rounded-xl border border-red-200/80 bg-red-50/70 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-medium text-red-700">
              <AlertTriangle className="h-3.5 w-3.5" />
              Não foi possível carregar o Raio X agora.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="text-xs font-semibold text-red-700 underline underline-offset-4 transition-colors hover:text-red-800"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {viewState === "loading" && <FunnelXRaySkeleton />}

      {viewState === "ready" && !hasEnoughData && (
        <div className="p-5">
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/70 p-4">
            <p className="text-sm font-semibold text-zinc-900">
              Sem dados suficientes para o Raio X
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Cadastre oportunidades para gerar conversão e gargalos acionáveis.
            </p>
            <Button
              size="sm"
              className="mt-3 h-8 rounded-full bg-zinc-900 text-xs text-white hover:bg-zinc-800"
              onClick={() => openPipeline()}
            >
              Ver pipeline
            </Button>
          </div>
        </div>
      )}

      {viewState === "ready" && hasEnoughData && activeStage && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-12"
        >
          <div className="space-y-3 lg:col-span-7">
            <TooltipProvider delayDuration={80}>
              <FlowStepsConnected
                stages={stages}
                transitions={transitions}
                activeStageId={activeStage.id}
                bottleneckToStageId={bottleneck?.to.id ?? null}
                onHoverStage={setActiveStageId}
                onOpenStage={openPipeline}
              />
            </TooltipProvider>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14 }}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <SummaryMiniCard
                    icon={<Gauge className="h-3.5 w-3.5 text-brand" />}
                    label="Velocidade média"
                    value={`${averageSpeedDays} dias`}
                    helper="Da entrada ao fechamento"
                  />
                  <SummaryMiniCard
                    icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
                    label="Valor em risco"
                    value={formatCurrencyBRL(riskValue)}
                    helper="Deals sem retorno > 5 dias"
                  />
                  <SummaryMiniCard
                    icon={<Lightbulb className="h-3.5 w-3.5 text-emerald-600" />}
                    label="Etapa crítica hoje"
                    value={bottleneck?.to.label ?? "—"}
                    helper={`${bottleneckDrop}% de queda`}
                  />
                </div>

                <div className="rounded-xl border border-zinc-200/80 bg-white/80 p-3.5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Oportunidades em risco
                    </p>
                    <button
                      type="button"
                      onClick={() => openPipeline(activeStage.id)}
                      className="text-[11px] font-semibold text-brand underline-offset-4 transition-colors hover:text-brand-strong hover:underline"
                    >
                      Ver etapa
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {activeInsight?.riskDeals.slice(0, 3).map((deal) => (
                      <div
                        key={deal}
                        className="flex items-center justify-between rounded-lg border border-zinc-200/70 bg-zinc-50/70 px-2.5 py-2"
                      >
                        <span className="truncate text-xs font-medium text-zinc-700">
                          {deal}
                        </span>
                        <span className="ml-3 text-[10px] text-zinc-500">
                          +{activeStage.stalledDays} dias
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="space-y-3 lg:col-span-5">
            <div className="rounded-xl border border-red-200/75 bg-red-50/60 p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-red-700">
                  TOP GARGALO
                </span>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-[1rem] font-semibold text-zinc-900">
                Queda de <span className="text-red-600">{bottleneckDrop}%</span> em{" "}
                {bottleneck?.to.label ?? "Proposta"}
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                {bottleneckStalledCount} oportunidades paradas há +
                {bottleneckStalledDays} dias.
              </p>
              <button
                type="button"
                onClick={() => openPipeline(bottleneck?.to.id)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-red-700 underline-offset-4 transition-colors hover:text-red-800 hover:underline"
              >
                Ver lista
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="rounded-xl border border-emerald-200/75 bg-emerald-50/65 p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-700">
                  DESTAQUE
                </span>
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-[1rem] font-semibold text-zinc-900">
                Conversão de Lead subiu <span className="text-emerald-600">+12%</span>
              </p>
              <p className="mt-1 text-xs text-zinc-600">{highlightText}</p>
              <button
                type="button"
                onClick={() => openPipeline("lead")}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 underline-offset-4 transition-colors hover:text-emerald-800 hover:underline"
              >
                Ver motivo
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="rounded-xl border border-zinc-200/80 bg-white/85 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-zinc-900">
                  Ação recomendada
                </h4>
                <Sparkles className="h-4 w-4 text-brand" />
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={activeStage.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.14 }}
                  className="text-xs leading-relaxed text-zinc-600"
                >
                  {recommendationText}
                </motion.p>
              </AnimatePresence>

              <div className="mt-3 space-y-2">
                <Button
                  onClick={handleRecommendedAction}
                  disabled={actionState === "loading"}
                  className="h-9 w-full rounded-full bg-zinc-900 text-xs font-semibold text-white hover:bg-zinc-800 active:scale-[0.99]"
                >
                  {actionState === "loading" ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Executando...
                    </>
                  ) : (
                    "Cobrar feedbacks"
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => openPipeline(activeStage.id)}
                  className="w-full text-center text-xs font-semibold text-zinc-600 underline-offset-4 transition-colors hover:text-zinc-800 hover:underline active:scale-[0.99]"
                >
                  Gerar mensagens
                </button>
              </div>

              <AnimatePresence>
                {actionState === "success" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.09 }}
                    className="mt-2 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                  >
                    Ações criadas
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {actionState === "error" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="mt-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-700"
                  >
                    Não foi possível criar as ações agora.
                    <button
                      type="button"
                      onClick={handleRecommendedAction}
                      className="ml-1.5 font-semibold underline underline-offset-4"
                    >
                      Tentar novamente
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </BentoCard>
  );
}

function FlowStepsConnected({
  stages,
  transitions,
  activeStageId,
  bottleneckToStageId,
  onHoverStage,
  onOpenStage,
}: {
  stages: FlowStage[];
  transitions: FlowTransition[];
  activeStageId: FlowStageId;
  bottleneckToStageId: FlowStageId | null;
  onHoverStage: (stageId: FlowStageId) => void;
  onOpenStage: (stageId: FlowStageId) => void;
}) {
  return (
    <>
      <div className="hidden items-stretch gap-2 md:flex md:flex-wrap xl:flex-nowrap">
        {stages.map((stage, index) => (
          <Fragment key={stage.id}>
            <FlowStepCard
              stage={stage}
              active={activeStageId === stage.id}
              onHoverStage={onHoverStage}
              onOpenStage={onOpenStage}
              compact={false}
            />
            {index < transitions.length && (
              <FlowConnector
                transition={transitions[index]}
                isBottleneck={bottleneckToStageId === transitions[index].to.id}
                orientation="horizontal"
                delay={index * 0.03}
              />
            )}
          </Fragment>
        ))}
      </div>

      <div className="space-y-2 md:hidden">
        {stages.map((stage, index) => (
          <Fragment key={`mobile-${stage.id}`}>
            <FlowStepCard
              stage={stage}
              active={activeStageId === stage.id}
              onHoverStage={onHoverStage}
              onOpenStage={onOpenStage}
              compact
            />
            {index < transitions.length && (
              <FlowConnector
                transition={transitions[index]}
                isBottleneck={bottleneckToStageId === transitions[index].to.id}
                orientation="vertical"
                delay={index * 0.03}
              />
            )}
          </Fragment>
        ))}
      </div>
    </>
  );
}

function FlowStepCard({
  stage,
  active,
  onHoverStage,
  onOpenStage,
  compact,
}: {
  stage: FlowStage;
  active: boolean;
  onHoverStage: (stageId: FlowStageId) => void;
  onOpenStage: (stageId: FlowStageId) => void;
  compact: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onOpenStage(stage.id)}
      onMouseEnter={() => onHoverStage(stage.id)}
      onFocus={() => onHoverStage(stage.id)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.14, ease: "easeOut" }}
      className={cn(
        "group/step min-w-0 rounded-xl border px-3 py-3 text-left transition-all duration-[140ms] ease-out",
        "shadow-[0_8px_22px_-18px_rgba(15,23,42,0.45)] hover:shadow-[0_10px_26px_-16px_rgba(15,23,42,0.5)]",
        compact ? "w-full" : "flex-[1_1_148px]",
        active
          ? "border-brand/40 bg-brand/10 shadow-[0_0_0_1px_rgba(29,78,216,0.14),0_10px_26px_-16px_rgba(29,78,216,0.55)]"
          : "border-zinc-200/85 bg-white/90 hover:border-zinc-300/90"
      )}
      aria-pressed={active}
    >
      <p className="truncate text-[11px] font-semibold uppercase tracking-[0.07em] text-zinc-500">
        {stage.label}
      </p>
      <p className="mt-1 text-xl font-bold leading-none text-zinc-900">
        {stage.volume}
      </p>
      <p className="mt-1 text-[11px] text-zinc-500">{formatCurrencyCompact(stage.value)}</p>
    </motion.button>
  );
}

function FlowConnector({
  transition,
  isBottleneck,
  orientation,
  delay,
}: {
  transition: FlowTransition;
  isBottleneck: boolean;
  orientation: "horizontal" | "vertical";
  delay: number;
}) {
  const lineClass = isBottleneck ? "bg-amber-300/80" : "bg-zinc-300/85";
  const pillClass = isBottleneck
    ? "border-amber-300/80 bg-amber-50 text-amber-700"
    : "border-zinc-200 bg-white text-zinc-600";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className={cn(
            "group/connector relative flex shrink-0 items-center justify-center",
            orientation === "horizontal"
              ? "min-w-[46px] flex-1 md:max-w-[64px]"
              : "h-6 w-full"
          )}
        >
          {orientation === "horizontal" ? (
            <>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.22, delay, ease: "easeOut" }}
                className={cn(
                  "h-px w-full origin-left transition-opacity duration-[120ms] group-hover/connector:opacity-100",
                  lineClass,
                  isBottleneck ? "opacity-95" : "opacity-70"
                )}
              />
              <ArrowRight className="ml-1 h-3 w-3 text-zinc-400 transition-opacity duration-[120ms] group-hover/connector:opacity-100" />
            </>
          ) : (
            <>
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.22, delay, ease: "easeOut" }}
                className={cn(
                  "h-full w-px origin-top transition-opacity duration-[120ms] group-hover/connector:opacity-100",
                  lineClass,
                  isBottleneck ? "opacity-95" : "opacity-70"
                )}
              />
              <ArrowDown className="absolute bottom-[-3px] h-3 w-3 text-zinc-400 transition-opacity duration-[120ms] group-hover/connector:opacity-100" />
            </>
          )}

          <span
            className={cn(
              "absolute rounded-full border px-1.5 py-0.5 text-[10px] font-semibold shadow-sm transition-opacity duration-[120ms] group-hover/connector:opacity-100",
              orientation === "horizontal" ? "top-[-11px]" : "right-2 top-[2px]",
              pillClass,
              isBottleneck ? "opacity-100" : "opacity-85"
            )}
          >
            {transition.conversion}%
          </span>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-[11px]">
        {transition.advanced} de {transition.base} avançaram
      </TooltipContent>
    </Tooltip>
  );
}

function SummaryMiniCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.09, ease: "easeOut" }}
      className="rounded-xl border border-zinc-200/80 bg-white/80 px-3 py-2.5 text-left transition-colors duration-[120ms] ease-out hover:bg-zinc-100/60"
    >
      <div className="mb-1 flex items-center gap-1.5 text-zinc-500">{icon}</div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-zinc-900">{value}</p>
      <p className="mt-0.5 text-[10px] text-zinc-500">{helper}</p>
    </motion.button>
  );
}

function FunnelXRaySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-12">
      <div className="space-y-3 lg:col-span-7">
        <div className="hidden items-stretch gap-2 md:flex md:flex-wrap xl:flex-nowrap">
          {Array.from({ length: 5 }).map((_, index) => (
            <Fragment key={`sk-flow-${index}`}>
              <Skeleton className="h-[86px] flex-[1_1_148px] rounded-xl before:[animation-duration:900ms]" />
              {index < 4 && (
                <Skeleton className="h-3 min-w-[46px] flex-1 rounded-full before:[animation-duration:900ms] md:max-w-[64px]" />
              )}
            </Fragment>
          ))}
        </div>

        <div className="space-y-2 md:hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <Fragment key={`sk-flow-mobile-${index}`}>
              <Skeleton className="h-[84px] rounded-xl before:[animation-duration:900ms]" />
              {index < 4 && (
                <div className="flex justify-center">
                  <Skeleton className="h-6 w-2 rounded-full before:[animation-duration:900ms]" />
                </div>
              )}
            </Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={`sk-summary-${index}`}
              className="h-20 rounded-xl before:[animation-duration:900ms]"
            />
          ))}
        </div>
        <Skeleton className="h-32 rounded-xl before:[animation-duration:900ms]" />
      </div>

      <div className="space-y-3 lg:col-span-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton
            key={`sk-diagnostic-${index}`}
            className="h-32 rounded-xl before:[animation-duration:900ms]"
          />
        ))}
      </div>
    </div>
  );
}
