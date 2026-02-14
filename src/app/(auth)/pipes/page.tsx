"use client";

import {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import {
  Plus,
  MoreHorizontal,
  Flame,
  Thermometer,
  Snowflake,
  Clock,
  AlertTriangle,
  Lock,
  Palette,
  Check,
  ArrowDownToLine,
  Search,
  CheckCircle2,
  X,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Opportunity, PipelineStage, Temperature } from "@/types";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  calculateSlaDeadline,
  calculateTemperature,
  formatCurrencyBRL,
  PIPELINE_STAGE_ORDER,
} from "@/lib/business-rules";
import { generateDynamicMockData } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { PipelineManagerDrawer } from "@/components/pipeline/pipeline-manager-drawer";
import { PipelineSwitcher } from "@/components/pipeline/pipeline-switcher";

// ═══════════════════════════════════════════════════════════════════
// Framer Motion Variants
// ═══════════════════════════════════════════════════════════════════

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

// ═══════════════════════════════════════════════════════════════════
// Funnel Definitions
// ═══════════════════════════════════════════════════════════════════

interface FunnelDefinition {
  id: string;
  label: string;
  stages: { id: PipelineStage; label: string; slaHours: number }[];
}

const funnels: FunnelDefinition[] = [
  {
    id: "comercial",
    label: "Leads",
    stages: [
      { id: "lead-in", label: "Lead-In", slaHours: 48 },
      { id: "contato-feito", label: "Contato Feito", slaHours: 72 },
      { id: "reuniao-agendada", label: "Reunião Agendada", slaHours: 120 },
      { id: "proposta-enviada", label: "Proposta Enviada", slaHours: 96 },
      { id: "negociacao", label: "Negociação", slaHours: 168 },
      { id: "fechamento", label: "Fechamento", slaHours: 48 },
    ],
  },
  {
    id: "indicacao",
    label: "Indicação",
    stages: [
      { id: "lead-in", label: "Lead-In", slaHours: 24 },
      { id: "contato-feito", label: "Contato Feito", slaHours: 48 },
      { id: "proposta-enviada", label: "Proposta Enviada", slaHours: 72 },
      { id: "fechamento", label: "Fechamento", slaHours: 48 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// Stage Validation
// ═══════════════════════════════════════════════════════════════════


const stageRequiredFields: Record<
  PipelineStage,
  { field: keyof Opportunity; label: string }[]
> = {
  "lead-in": [],
  "contato-feito": [{ field: "clientName", label: "Nome do contato" }],
  "reuniao-agendada": [
    { field: "clientName", label: "Nome do contato" },
    { field: "expectedCloseDate", label: "Data prevista de fechamento" },
  ],
  "proposta-enviada": [
    { field: "clientName", label: "Nome do contato" },
    { field: "expectedCloseDate", label: "Data prevista de fechamento" },
    { field: "value", label: "Valor da proposta" },
  ],
  negociacao: [
    { field: "clientName", label: "Nome do contato" },
    { field: "expectedCloseDate", label: "Data prevista de fechamento" },
    { field: "value", label: "Valor da proposta" },
    { field: "monthlyValue", label: "Valor mensal" },
  ],
  fechamento: [
    { field: "clientName", label: "Nome do contato" },
    { field: "expectedCloseDate", label: "Data prevista de fechamento" },
    { field: "value", label: "Valor da proposta" },
    { field: "monthlyValue", label: "Valor mensal" },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// Temperature Config
// ═══════════════════════════════════════════════════════════════════

const temperatureConfig: Record<
  Temperature,
  { icon: React.ReactNode; label: string; colorClass: string }
> = {
  hot: {
    icon: <Flame className="h-3.5 w-3.5" />,
    label: "Quente",
    colorClass: "text-status-danger",
  },
  warm: {
    icon: <Thermometer className="h-3.5 w-3.5" />,
    label: "Morno",
    colorClass: "text-status-warning",
  },
  cold: {
    icon: <Snowflake className="h-3.5 w-3.5" />,
    label: "Frio",
    colorClass: "text-status-info",
  },
};

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type SlaStatus = "ok" | "near" | "breached";

function getSlaStatus(
  slaDeadline?: string
): { status: SlaStatus; label: string; detailLabel: string } {
  if (!slaDeadline)
    return { status: "ok", label: "", detailLabel: "SLA não definido" };
  const now = new Date();
  const deadline = new Date(slaDeadline);
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs <= 0) {
    // #11 FIX: Detailed SLA tooltip — show how much overdue
    const overMs = Math.abs(diffMs);
    const overHours = Math.floor(overMs / (1000 * 60 * 60));
    const overDays = Math.floor(overHours / 24);
    const remainHours = overHours % 24;
    const overLabel =
      overDays > 0 ? `${overDays}d ${remainHours}h` : `${overHours}h`;
    return {
      status: "breached",
      label: "Estourado",
      detailLabel: `SLA estourado há ${overLabel}`,
    };
  }

  const totalHours = diffMs / (1000 * 60 * 60);
  const days = Math.floor(totalHours / 24);
  const hours = Math.floor(totalHours % 24);
  const label = days > 0 ? `${days}d ${hours}h` : `${hours}h`;

  if (totalHours <= 12) {
    return {
      status: "near",
      label,
      detailLabel: `SLA vence em ${label} — atenção!`,
    };
  }

  return { status: "ok", label, detailLabel: `SLA restante: ${label}` };
}

function getSlaColors(status: SlaStatus) {
  switch (status) {
    case "ok":
      return {
        dot: "bg-status-success",
        border: "border-l-brand",
        text: "text-zinc-400",
      };
    case "near":
      return {
        dot: "bg-status-warning",
        border: "border-l-status-warning",
        text: "text-status-warning",
      };
    case "breached":
      return {
        dot: "bg-status-danger",
        border: "border-l-status-danger",
        text: "text-status-danger",
      };
  }
}

function validateStageTransition(
  opportunity: Opportunity,
  targetStage: PipelineStage
): { missing: string[]; isRegression: boolean } {
  const currentIdx = PIPELINE_STAGE_ORDER.indexOf(opportunity.stage);
  const targetIdx = PIPELINE_STAGE_ORDER.indexOf(targetStage);

  // #6 FIX: Detect regression (moving backwards)
  if (targetIdx < currentIdx) {
    return { missing: [], isRegression: true };
  }

  const requiredFields = stageRequiredFields[targetStage] || [];
  const missing: string[] = [];

  for (const req of requiredFields) {
    const val = opportunity[req.field];
    if (val === undefined || val === null || val === "") {
      missing.push(req.label);
    } else if (typeof val === "number" && val <= 0) {
      missing.push(req.label);
    }
  }

  return { missing, isRegression: false };
}

// ═══════════════════════════════════════════════════════════════════
// Stage Color Palette
// ═══════════════════════════════════════════════════════════════════

const stageColorPalette = [
  { id: "default", label: "Padrão", bg: "bg-brand", hex: "#6d28d9" },
  { id: "blue", label: "Azul", bg: "bg-blue-500", hex: "#3b82f6" },
  { id: "cyan", label: "Ciano", bg: "bg-cyan-500", hex: "#06b6d4" },
  { id: "green", label: "Verde", bg: "bg-emerald-500", hex: "#10b981" },
  { id: "yellow", label: "Amarelo", bg: "bg-amber-400", hex: "#fbbf24" },
  { id: "orange", label: "Laranja", bg: "bg-orange-500", hex: "#f97316" },
  { id: "red", label: "Vermelho", bg: "bg-red-500", hex: "#ef4444" },
  { id: "pink", label: "Rosa", bg: "bg-pink-500", hex: "#ec4899" },
  { id: "gray", label: "Cinza", bg: "bg-zinc-400", hex: "#a1a1aa" },
];

interface StageCustomization {
  label?: string;
  colorId?: string;
}

// #19 FIX: LocalStorage key for stage customizations
const STAGE_CUSTOM_STORAGE_KEY = "flow-stage-customizations";

function loadStageCustomizations(): Record<string, StageCustomization> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STAGE_CUSTOM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    try { localStorage.removeItem(STAGE_CUSTOM_STORAGE_KEY); } catch {}
    return {};
  }
}

function saveStageCustomizations(
  data: Record<string, StageCustomization>
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STAGE_CUSTOM_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently ignore quota errors
  }
}

// ═══════════════════════════════════════════════════════════════════
// Skeleton Loading Component — #5 FIX
// ═══════════════════════════════════════════════════════════════════

function PipelineSkeleton({ stageCount }: { stageCount: number }) {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden">
      {/* Header skeleton */}
      <div className="shrink-0 space-y-3 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-[180px] rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-16 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        </div>
      </div>

      {/* Board skeleton */}
      <div className="flex flex-1 gap-3 overflow-hidden px-7 pb-2">
        {Array.from({ length: stageCount }).map((_, i) => (
          <div
            key={i}
            className="flex w-[320px] shrink-0 flex-col rounded-[var(--radius-bento-card)] bg-zinc-50/80 p-3"
          >
            {/* Column header skeleton */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-6 rounded-md" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Card skeletons */}
            {Array.from({ length: 2 - (i % 2) }).map((_, j) => (
              <div
                key={j}
                className="mb-2 rounded-[var(--radius-bento-card)] border border-zinc-200 bg-white p-3"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════════════════════

export default function PipesPage() {
  const { openDrawer, openModal } = useUIStore();
  const { user } = useAuthStore();
  const currentUserId = user?.id ?? "1";
  const [selectedFunnel, setSelectedFunnel] = useState("comercial");
  const [localOpportunities, setLocalOpportunities] = useState<Opportunity[]>(
    () => generateDynamicMockData()
  );
  const opportunities = localOpportunities;
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [draggingCardStage, setDraggingCardStage] = useState<PipelineStage | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(
    null
  );
  const [dropIndicator, setDropIndicator] = useState<{
    stage: PipelineStage;
    index: number;
  } | null>(null);
  const [isManageDrawerOpen, setIsManageDrawerOpen] = useState(false);

  // #19 FIX: Load from localStorage on mount
  const [stageCustomizations, setStageCustomizations] = useState<
    Record<string, StageCustomization>
  >(() => loadStageCustomizations());

  const [renamingStage, setRenamingStage] = useState<PipelineStage | null>(
    null
  );
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [columnError, setColumnError] = useState<{
    stage: PipelineStage;
    message: string;
  } | null>(null);
  const dragCardRef = useRef<Opportunity | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // #5 FIX: Skeleton loading state
  const [isLoading, setIsLoading] = useState(true);

  // #9 FIX: Success feedback after moving a card
  const [successFeedback, setSuccessFeedback] = useState<{
    stage: PipelineStage;
    cardTitle: string;
  } | null>(null);

  // #16 FIX: "Apenas meus cards" filter
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  // #17 FIX: Quick search
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // #13 FIX: Live region for screen readers
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const activeFunnel =
    funnels.find((f) => f.id === selectedFunnel) ?? funnels[0];

  // #4 FIX: Memoize activeStageIds to avoid recreating array every render
  const activeStageIds = useMemo(
    () => activeFunnel.stages.map((s) => s.id),
    [activeFunnel]
  );

  // #5 FIX: Simulate loading (will be replaced by real data fetching)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // #19 FIX: Persist stage customizations to localStorage on every change
  useEffect(() => {
    saveStageCustomizations(stageCustomizations);
  }, [stageCustomizations]);

  // #17 FIX: Normalize search query
  const normalizedSearch = useMemo(
    () => searchQuery.toLowerCase().trim(),
    [searchQuery]
  );

  const opportunitiesByStage = useMemo(() => {
    const grouped: Record<PipelineStage, Opportunity[]> = {
      "lead-in": [],
      "contato-feito": [],
      "reuniao-agendada": [],
      "proposta-enviada": [],
      negociacao: [],
      fechamento: [],
    };
    for (const opp of opportunities) {
      if (!activeStageIds.includes(opp.stage)) continue;

      // #16 FIX: Filter own cards only
      if (showOnlyMine && opp.responsibleId !== currentUserId) continue;

      // #17 FIX: Search filter
      if (
        normalizedSearch &&
        !opp.title.toLowerCase().includes(normalizedSearch) &&
        !opp.clientName.toLowerCase().includes(normalizedSearch) &&
        !opp.tags.some((t) => t.toLowerCase().includes(normalizedSearch))
      ) {
        continue;
      }

      grouped[opp.stage].push(opp);
    }
    // Sort: own cards first, ghost cards (other sellers) below
    for (const stage of Object.keys(grouped) as PipelineStage[]) {
      grouped[stage].sort((a, b) => {
        const aOwn = a.responsibleId === currentUserId ? 0 : 1;
        const bOwn = b.responsibleId === currentUserId ? 0 : 1;
        return aOwn - bOwn;
      });
    }
    return grouped;
  }, [opportunities, activeStageIds, showOnlyMine, normalizedSearch, currentUserId]);

  // #7 FIX: Separate counts for own vs total
  const { myCount, myTotal, boardCount, boardTotal } = useMemo(() => {
    const active = opportunities.filter((o) =>
      activeStageIds.includes(o.stage)
    );
    const mine = active.filter((o) => o.responsibleId === currentUserId);
    return {
      myCount: mine.length,
      myTotal: mine.reduce((acc, o) => acc + o.value, 0),
      boardCount: active.length,
      boardTotal: active.reduce((acc, o) => acc + o.value, 0),
    };
  }, [opportunities, activeStageIds, currentUserId]);

  // #15 FIX: Compute dynamic temperatures
  const averageDealValue = useMemo(() => {
    const active = opportunities.filter((o) =>
      activeStageIds.includes(o.stage)
    );
    if (active.length === 0) return 10000;
    return active.reduce((acc, o) => acc + o.value, 0) / active.length;
  }, [opportunities, activeStageIds]);

  const getTemp = useCallback(
    (opp: Opportunity) => {
      const computed = calculateTemperature(opp, averageDealValue);
      return temperatureConfig[computed];
    },
    [averageDealValue]
  );

  // #13 FIX: Announce to screen readers
  const announce = useCallback((message: string) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = message;
    }
  }, []);

  // Announce search results to screen readers
  useEffect(() => {
    if (normalizedSearch) {
      const total = Object.values(opportunitiesByStage).reduce(
        (acc, cards) => acc + cards.length,
        0
      );
      announce(`${total} cards encontrados para "${searchQuery}"`);
    }
  }, [normalizedSearch, opportunitiesByStage, announce, searchQuery]);

  // ── Drag handlers ──────────────────────────────────────────────

  // #1 FIX: Add grabbing cursor to body during drag
  const handleDragStart = useCallback(
    (e: React.DragEvent, opportunity: Opportunity) => {
      if (opportunity.responsibleId !== currentUserId) {
        e.preventDefault();
        return;
      }
      setDraggingCardId(opportunity.id);
      setDraggingCardStage(opportunity.stage);
      dragCardRef.current = opportunity;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", opportunity.id);
      document.body.style.cursor = "grabbing";
      // #13 FIX: Announce drag start
      announce(
        `Arrastando card ${opportunity.title}. Solte em uma etapa para mover.`
      );
    },
    [announce, currentUserId]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, stage: PipelineStage) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverStage(stage);

      const column = e.currentTarget as HTMLElement;
      const cardElements = column.querySelectorAll("[data-card-index]");
      let insertIndex = cardElements.length;

      for (let i = 0; i < cardElements.length; i++) {
        const rect = cardElements[i].getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          insertIndex = i;
          break;
        }
      }

      setDropIndicator({ stage, index: insertIndex });
    },
    []
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const related = e.relatedTarget as Node | null;
    if (!e.currentTarget.contains(related)) {
      setDragOverStage(null);
      setDropIndicator(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetStage: PipelineStage) => {
      e.preventDefault();
      setDragOverStage(null);
      setDropIndicator(null);
      setColumnError(null);
      document.body.style.cursor = "";

      const card = dragCardRef.current;
      if (!card) return;

      if (card.stage === targetStage) {
        setDraggingCardId(null);
        setDraggingCardStage(null);
        dragCardRef.current = null;
        return;
      }

      // #6 FIX: Check for regression and show warning
      const { missing, isRegression } = validateStageTransition(
        card,
        targetStage
      );

      if (missing.length > 0) {
        setColumnError({
          stage: targetStage,
          message: `Preencha: ${missing.join(", ")}`,
        });
        setDraggingCardId(null);
        setDraggingCardStage(null);
        dragCardRef.current = null;
        announce(`Erro: campos obrigatórios faltando — ${missing.join(", ")}`);
        setTimeout(() => setColumnError(null), 5000);
        return;
      }

      if (isRegression) {
        const fromLabel =
          PIPELINE_STAGE_ORDER[PIPELINE_STAGE_ORDER.indexOf(card.stage)]
            ?.replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()) || card.stage;
        const toLabel =
          PIPELINE_STAGE_ORDER[PIPELINE_STAGE_ORDER.indexOf(targetStage)]
            ?.replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()) || targetStage;
        setColumnError({
          stage: targetStage,
          message: `Card retrocedido de ${fromLabel} para ${toLabel}`,
        });
        announce(`Aviso: card retrocedido de ${fromLabel} para ${toLabel}`);
        setTimeout(() => setColumnError(null), 4000);
      }

      const targetStageDef = activeFunnel.stages.find(
        (s) => s.id === targetStage
      );
      const newSlaDeadline = targetStageDef
        ? calculateSlaDeadline(targetStageDef.slaHours)
        : undefined;

      setLocalOpportunities((prev) =>
        prev.map((o) =>
          o.id === card.id
            ? {
                ...o,
                stage: targetStage,
                updatedAt: new Date().toISOString(),
                slaDeadline: newSlaDeadline,
              }
            : o
        )
      );

      // #9 FIX: Show success feedback
      if (!isRegression) {
        setSuccessFeedback({ stage: targetStage, cardTitle: card.title });
        announce(
          `Card ${card.title} movido com sucesso para ${targetStage.replace(/-/g, " ")}`
        );
        setTimeout(() => setSuccessFeedback(null), 2500);
      }

      setDraggingCardId(null);
      setDraggingCardStage(null);
      dragCardRef.current = null;
    },
    [activeFunnel, announce]
  );

  const handleDragEnd = useCallback(() => {
    setDraggingCardId(null);
    setDraggingCardStage(null);
    setDragOverStage(null);
    setDropIndicator(null);
    dragCardRef.current = null;
    document.body.style.cursor = "";
  }, []);

  // ── #18 FIX: Win / Lose handlers ──────────────────────────────
  const handleWinOpportunity = useCallback(
    (opportunityId: string) => {
      setLocalOpportunities((prev) =>
        prev.map((o) =>
          o.id === opportunityId
            ? { ...o, status: "won" as const, updatedAt: new Date().toISOString() }
            : o
        )
      );
      const opp = opportunities.find((o) => o.id === opportunityId);
      if (opp) {
        setSuccessFeedback({
          stage: opp.stage,
          cardTitle: `${opp.title} — Ganho!`,
        });
        announce(`Oportunidade ${opp.title} marcada como ganha!`);
        setTimeout(() => setSuccessFeedback(null), 3000);
      }
    },
    [opportunities, announce]
  );

  const handleLoseOpportunity = useCallback(
    (opportunityId: string) => {
      setLocalOpportunities((prev) =>
        prev.map((o) =>
          o.id === opportunityId
            ? { ...o, status: "lost" as const, updatedAt: new Date().toISOString() }
            : o
        )
      );
      const opp = opportunities.find((o) => o.id === opportunityId);
      if (opp) {
        announce(`Oportunidade ${opp.title} marcada como perdida.`);
      }
    },
    [opportunities, announce]
  );

  // ── Stage customization ──────────────────────────────────────────

  const startRename = useCallback(
    (stageId: PipelineStage, currentLabel: string) => {
      setRenamingStage(stageId);
      setRenameValue(currentLabel);
      setTimeout(() => renameInputRef.current?.focus(), 50);
    },
    []
  );

  const confirmRename = useCallback(() => {
    if (renamingStage && renameValue.trim()) {
      setStageCustomizations((prev) => ({
        ...prev,
        [renamingStage]: {
          ...prev[renamingStage],
          label: renameValue.trim(),
        },
      }));
    }
    setRenamingStage(null);
    setRenameValue("");
  }, [renamingStage, renameValue]);

  const setStageColor = useCallback(
    (stageId: PipelineStage, colorId: string) => {
      setStageCustomizations((prev) => ({
        ...prev,
        [stageId]: { ...prev[stageId], colorId },
      }));
    },
    []
  );

  const getStageColor = useCallback(
    (stageId: PipelineStage) => {
      const colorId = stageCustomizations[stageId]?.colorId || "default";
      return (
        stageColorPalette.find((c) => c.id === colorId) ?? stageColorPalette[0]
      );
    },
    [stageCustomizations]
  );

  // #17 FIX: Toggle search with Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => {
          if (!prev) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
          }
          return !prev;
        });
      }
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  // ═════════════════════════════════════════════════════════════════
  // Render
  // ═════════════════════════════════════════════════════════════════

  // #5 FIX: Show skeleton while loading
  if (isLoading) {
    return <PipelineSkeleton stageCount={activeFunnel.stages.length} />;
  }

  return (
    <TooltipProvider>
      {/* #13 FIX: Live region for screen reader announcements */}
      <div
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <motion.div initial="hidden" animate="show" variants={staggerContainer} className="flex h-[calc(100vh-64px)] flex-col overflow-hidden">
        {/* ── Header & Toolbar ─────────────────────────────────── */}
        <motion.div variants={fadeUp} className="shrink-0 space-y-3 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <PipelineSwitcher
                selectedPipeline={activeFunnel}
                availablePipelines={funnels}
                hasActiveFilters={showOnlyMine || searchQuery.length > 0}
                isAdmin={true}
                showOnlyMine={showOnlyMine}
                onToggleShowOnlyMine={() => setShowOnlyMine((prev) => !prev)}
                onPipelineChange={(pipelineId) => {
                  setSelectedFunnel(pipelineId);
                  // Clear filters when changing pipeline
                  if (showOnlyMine || searchQuery) {
                    setShowOnlyMine(false);
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }
                }}
                onSettingsClick={() => setIsManageDrawerOpen(true)}
              />
              {/* #7 FIX: Show own vs total counts */}
              <p className="mt-0.5 font-body text-sm text-zinc-500">
                {myCount} meus · {formatCurrencyBRL(myTotal)}
                <span className="mx-1.5 text-zinc-300">|</span>
                {boardCount} total · {formatCurrencyBRL(boardTotal)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* #17 FIX: Search toggle + inline input */}
              {isSearchOpen && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  <Input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar cards..."
                    className="h-9 w-[200px] rounded-full pl-8 pr-8 font-body text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isSearchOpen ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setIsSearchOpen((prev) => !prev);
                      if (!isSearchOpen) {
                        setTimeout(() => searchInputRef.current?.focus(), 50);
                      } else {
                        setSearchQuery("");
                      }
                    }}
                    className={`h-9 rounded-full font-heading text-sm ${isSearchOpen ? "bg-black text-white hover:bg-zinc-800" : ""}`}
                  >
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Buscar (⌘K)</TooltipContent>
              </Tooltip>

              <Button
                variant="outline"
                size="sm"
                onClick={() => openDrawer("filters")}
                className="h-9 rounded-full font-heading text-sm"
              >
                <Filter className="mr-1.5 h-3.5 w-3.5" />
                Filtros
              </Button>

              <Button
                size="sm"
                onClick={() => openDrawer("new-opportunity")}
                className="h-9 rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Novo Card
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── Board ────────────────────────────────────────────── */}
        <div
          className="relative flex min-h-0 flex-1 items-stretch"
          // #13 FIX: Accessible role for the board
          role="region"
          aria-label="Pipeline de vendas — arraste os cards entre as etapas"
        >
          {/* Board scroll container */}
          <div
            ref={boardRef}
            className="flex flex-1 gap-3 overflow-x-auto scroll-smooth px-7 pb-2"
            style={{ scrollSnapType: "x proximity" }}
          >
            {activeFunnel.stages.map((stageDef) => {
              const cards = opportunitiesByStage[stageDef.id] || [];
              const totalValue = cards.reduce((acc, o) => acc + o.value, 0);
              const isDropTarget = dragOverStage === stageDef.id;
              const error =
                columnError?.stage === stageDef.id
                  ? columnError.message
                  : null;
              // #6 FIX: Check if error is a regression warning
              const isRegressionWarning = error?.startsWith("Card retrocedido");

              // #9 FIX: Check if this stage has success feedback
              const hasSuccess = successFeedback?.stage === stageDef.id;

              return (
                <motion.div
                  key={stageDef.id}
                  variants={scaleIn}
                  className={`group/col flex w-[85vw] shrink-0 flex-col rounded-[var(--radius-bento-card)] border transition-all duration-150 sm:w-[320px] xl:w-[340px] ${
                    isDropTarget
                      ? "border-brand bg-brand/5 ring-2 ring-brand/30"
                      : "border-transparent bg-zinc-50/80"
                  }`}
                  style={{ scrollSnapAlign: "start" }}
                  onDragOver={(e) => handleDragOver(e, stageDef.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stageDef.id)}
                  // #13 FIX: Accessible column role
                  role="group"
                  aria-label={`Etapa: ${stageCustomizations[stageDef.id]?.label || stageDef.label}, ${cards.length} cards, ${formatCurrencyBRL(totalValue)}`}
                >
                  {/* ── Column Header (sticky) ───────────────── */}
                  <div className="sticky top-0 z-10 rounded-t-[var(--radius-bento-card)] bg-inherit px-3 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 items-center gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full transition-transform hover:scale-125 ${getStageColor(stageDef.id).bg}`}
                              aria-label={`Cor da etapa: ${getStageColor(stageDef.id).label}`}
                            />
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="w-auto rounded-[var(--radius-bento-card)] p-3"
                          >
                            <span className="mb-2 flex items-center gap-1.5 font-body text-[11px] font-medium text-zinc-500">
                              <Palette className="h-3 w-3" />
                              Cor da etapa
                            </span>
                            <div className="grid grid-cols-5 gap-1.5">
                              {stageColorPalette.map((color) => {
                                const isActive =
                                  (stageCustomizations[stageDef.id]
                                    ?.colorId || "default") === color.id;
                                return (
                                  <button
                                    key={color.id}
                                    onClick={() =>
                                      setStageColor(stageDef.id, color.id)
                                    }
                                    className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${color.bg} ${
                                      isActive
                                        ? "ring-2 ring-zinc-900 ring-offset-2"
                                        : "hover:ring-2 hover:ring-zinc-300 hover:ring-offset-1"
                                    }`}
                                    title={color.label}
                                    aria-label={color.label}
                                  >
                                    {isActive && (
                                      <Check className="h-3 w-3 text-white" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </PopoverContent>
                        </Popover>

                        {renamingStage === stageDef.id ? (
                          <input
                            ref={renameInputRef}
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={confirmRename}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") confirmRename();
                              if (e.key === "Escape") {
                                setRenamingStage(null);
                                setRenameValue("");
                              }
                            }}
                            className="min-w-0 flex-1 truncate rounded-md border border-zinc-300 bg-white px-1.5 py-0.5 font-heading text-[13px] font-semibold text-black outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                            aria-label="Renomear etapa"
                          />
                        ) : (
                          <button
                            onClick={() =>
                              startRename(
                                stageDef.id,
                                stageCustomizations[stageDef.id]?.label ||
                                  stageDef.label
                              )
                            }
                            className="truncate font-heading text-[13px] font-semibold text-black hover:text-brand transition-colors"
                            title="Clique para renomear"
                          >
                            {stageCustomizations[stageDef.id]?.label ||
                              stageDef.label}
                          </button>
                        )}

                        <span className="shrink-0 rounded-md bg-zinc-200/70 px-1.5 py-0.5 font-body text-[11px] font-medium text-zinc-600">
                          {cards.length}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className="font-body text-[11px] font-medium text-zinc-400">
                          {formatCurrencyBRL(totalValue)}
                        </span>
                      </div>
                    </div>

                    {/* Inline error / regression feedback */}
                    {error && (
                      <div
                        className={`mt-2 flex items-start gap-1.5 rounded-[var(--radius-bento-inner)] px-2.5 py-2 ${
                          isRegressionWarning
                            ? "bg-[var(--feedback-warning-bg)] text-[var(--feedback-warning-text)]"
                            : "bg-[var(--feedback-error-bg)] text-[var(--feedback-error-text)]"
                        }`}
                        role="alert"
                      >
                        {isRegressionWarning ? (
                          <ArrowDownToLine className="mt-0.5 h-3 w-3 shrink-0" />
                        ) : (
                          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                        )}
                        <span className="font-body text-[11px] leading-tight">
                          {error}
                        </span>
                      </div>
                    )}

                    {/* #9 FIX: Success feedback after moving card */}
                    {hasSuccess && (
                      <div
                        className="mt-2 flex items-start gap-1.5 rounded-[var(--radius-bento-inner)] bg-[var(--feedback-success-bg)] px-2.5 py-2 text-[var(--feedback-success-text)]"
                        role="status"
                      >
                        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />
                        <span className="font-body text-[11px] leading-tight">
                          {successFeedback.cardTitle} movido com sucesso
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ── Column Cards ──────────────────────────── */}
                  <div className="flex-1 overflow-y-auto px-3 pb-3">
                    {cards.length > 0 || isDropTarget ? (
                      <div className="space-y-2">
                        {(() => {
                          const showPlaceholder =
                            draggingCardId &&
                            dropIndicator?.stage === stageDef.id &&
                            draggingCardStage !== stageDef.id;

                          const elements: React.ReactNode[] = [];

                          if (
                            showPlaceholder &&
                            dropIndicator.index === 0
                          ) {
                            elements.push(
                              <div
                                key="drop-placeholder"
                                className="rounded-[var(--radius-bento-card)] border-2 border-dashed border-brand/40 bg-brand/5 transition-all duration-200"
                                style={{ height: 72 }}
                              />
                            );
                          }

                          cards.forEach((opportunity, idx) => {
                            const isGhost =
                              opportunity.responsibleId !== currentUserId;

                            if (isGhost) {
                              elements.push(
                                <GhostDealCard
                                  key={opportunity.id}
                                  opportunity={opportunity}
                                />
                              );
                            } else {
                              elements.push(
                                <div
                                  key={opportunity.id}
                                  data-card-index={idx}
                                  className={`transition-transform duration-200 ${
                                    draggingCardId === opportunity.id
                                      ? "scale-[0.97] opacity-40"
                                      : ""
                                  }`}
                                >
                                  <DealCardBento
                                    opportunity={opportunity}
                                    temp={getTemp(opportunity)}
                                    onOpen={() =>
                                      openModal("lead-card", {
                                        id: opportunity.id,
                                      })
                                    }
                                    onDragStart={(e) =>
                                      handleDragStart(e, opportunity)
                                    }
                                    onDragEnd={handleDragEnd}
                                    onWin={() =>
                                      handleWinOpportunity(opportunity.id)
                                    }
                                    onLose={() =>
                                      handleLoseOpportunity(opportunity.id)
                                    }
                                  />
                                </div>
                              );
                            }

                            if (
                              showPlaceholder &&
                              dropIndicator.index === idx + 1
                            ) {
                              elements.push(
                                <div
                                  key="drop-placeholder"
                                  className="rounded-[var(--radius-bento-card)] border-2 border-dashed border-brand/40 bg-brand/5 transition-all duration-200"
                                  style={{ height: 72 }}
                                />
                              );
                            }
                          });

                          if (
                            showPlaceholder &&
                            dropIndicator.index >= cards.length &&
                            !elements.some(
                              (el) =>
                                el !== null &&
                                typeof el === "object" &&
                                "key" in el &&
                                el.key === "drop-placeholder"
                            )
                          ) {
                            elements.push(
                              <div
                                key="drop-placeholder"
                                className="rounded-[var(--radius-bento-card)] border-2 border-dashed border-brand/40 bg-brand/5 transition-all duration-200"
                                style={{ height: 72 }}
                              />
                            );
                          }

                          if (cards.length === 0 && isDropTarget) {
                            elements.push(
                              <div
                                key="drop-placeholder-empty"
                                className="rounded-[var(--radius-bento-card)] border-2 border-dashed border-brand/40 bg-brand/5 transition-all duration-200"
                                style={{ height: 72 }}
                              />
                            );
                          }

                          return elements;
                        })()}
                      </div>
                    ) : (
                      // #10 FIX: Better empty state
                      <div className="flex h-24 flex-col items-center justify-center gap-1 rounded-[var(--radius-bento-inner)] border-2 border-dashed border-zinc-200 transition-colors">
                        <p className="font-body text-xs text-zinc-400">
                          Nenhum card nesta etapa
                        </p>
                        <button
                          onClick={() =>
                            openDrawer("new-opportunity", {
                              initialStage: stageDef.id,
                            })
                          }
                          className="font-body text-[11px] font-medium text-brand hover:underline"
                        >
                          + Criar novo
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Pipeline Manager Drawer */}
        <PipelineManagerDrawer
          open={isManageDrawerOpen}
          onOpenChange={setIsManageDrawerOpen}
        />
      </motion.div>
    </TooltipProvider>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DealCardBento — Card Spec padronizado
// ═══════════════════════════════════════════════════════════════════
//
// Slots fixos:
//   1. Header row:  title (ellipsis) + menu "…"
//   2. Sub row:     client name (ellipsis) + owner avatar chip
//   3. Meta row:    value (currency) + SLA countdown
//   4. Tags row:    max 2 tags + "+N" chip (conditional)
//   5. Temperature: bottom-right indicator
//
// Estados: default, hover, focus-visible, dragging (ghost via parent)

function DealCardBento({
  opportunity,
  temp,
  onOpen,
  onDragStart,
  onDragEnd,
  onWin,
  onLose,
}: {
  opportunity: Opportunity;
  temp: { icon: React.ReactNode; label: string; colorClass: string };
  onOpen: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onWin: () => void;
  onLose: () => void;
}) {
  // #3 FIX: Use openDrawer but stop propagation in the content
  const { openDrawer } = useUIStore();
  const sla = getSlaStatus(opportunity.slaDeadline);
  const slaColors = getSlaColors(sla.status);

  return (
    <div
      className={`group relative cursor-pointer rounded-[var(--radius-bento-card)] border border-zinc-200 border-l-[3px] ${slaColors.border} bg-white p-3 shadow-[var(--shadow-bento-sm)] transition-all duration-[var(--transition-bento-fast)] hover:shadow-[var(--shadow-bento-sm-hover)] focus-within:ring-2 focus-within:ring-brand/40 active:scale-[var(--scale-bento-active)]`}
      onClick={onOpen}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      tabIndex={0}
      // #13 FIX: Better aria labels
      role="button"
      aria-roledescription="card arrastável"
      aria-label={`${opportunity.title}, ${formatCurrencyBRL(opportunity.value)}, ${temp.label}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      {/* ── 1. Header row ──────────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        <span className="min-w-0 flex-1 truncate font-heading text-[13px] font-semibold text-black">
          {opportunity.title}
        </span>

        {/* #3 FIX: DropdownMenu with onCloseAutoFocus to prevent card click */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-400 opacity-0 transition-opacity hover:bg-zinc-100 hover:text-zinc-600 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Ações da oportunidade"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="rounded-[var(--radius-bento-card)]"
            onClick={(e) => e.stopPropagation()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
            >
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                openDrawer("new-activity", {
                  opportunityId: opportunity.id,
                });
              }}
            >
              Nova atividade
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* #18 FIX: Win/Lose directly update localOpportunities */}
            <DropdownMenuItem
              className="text-status-success"
              onClick={(e) => {
                e.stopPropagation();
                onWin();
              }}
            >
              Marcar como Ganho
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-status-danger"
              onClick={(e) => {
                e.stopPropagation();
                onLose();
              }}
            >
              Marcar como Perdido
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── 2. Sub row: neighborhood + owner ──────────────────── */}
      <div className="mt-1.5 flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate font-body text-[12px] text-zinc-500">
          {opportunity.neighborhood || "Sem bairro"}
        </span>
        {/* #12 FIX: Bigger avatar 24x24 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-heading text-[10px] font-semibold text-white">
              {getInitials(opportunity.responsibleName)}
            </span>
          </TooltipTrigger>
          <TooltipContent>{opportunity.responsibleName}</TooltipContent>
        </Tooltip>
      </div>

      {/* ── 3. Meta row: value + SLA ───────────────────────── */}
      <div className="mt-2 flex items-center justify-between">
        <span className="font-heading text-[13px] font-bold text-black">
          {opportunity.value > 0
            ? formatCurrencyBRL(opportunity.value)
            : "Sem valor"}
        </span>

        {/* #11 FIX: Tooltip com breakdown detalhado do SLA */}
        {sla.label && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`flex items-center gap-1 font-body text-[11px] font-medium ${slaColors.text}`}
              >
                {sla.status === "breached" ? (
                  <AlertTriangle className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {sla.label}
              </span>
            </TooltipTrigger>
            <TooltipContent>{sla.detailLabel}</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* ── 4. Tags row (conditional) ──────────────────────── */}
      {opportunity.tags.length > 0 && (
        <div className="mt-2 flex items-center gap-1 overflow-hidden">
          {opportunity.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="max-w-[100px] shrink-0 truncate rounded-[var(--radius-bento-inner)] px-1.5 py-0 font-body text-[10px] leading-5"
            >
              {tag}
            </Badge>
          ))}
          {opportunity.tags.length > 2 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className="shrink-0 rounded-[var(--radius-bento-inner)] px-1.5 py-0 font-body text-[10px] leading-5"
                >
                  +{opportunity.tags.length - 2}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {opportunity.tags.slice(2).join(", ")}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}

      {/* ── Temperature indicator (bottom-right) ─────────── */}
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`absolute bottom-2.5 right-2.5 ${temp.colorClass}`}
          >
            {temp.icon}
          </span>
        </TooltipTrigger>
        <TooltipContent>{temp.label}</TooltipContent>
      </Tooltip>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GhostDealCard — Cards de outros vendedores
// ═══════════════════════════════════════════════════════════════════

function GhostDealCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="flex cursor-default select-none items-center gap-2.5 rounded-[var(--radius-bento-card)] border border-zinc-100 bg-zinc-50 p-2.5 opacity-60"
          // #13 FIX: Accessible role
          role="listitem"
          aria-label={`Card de ${opportunity.responsibleName}: ${opportunity.clientName}`}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200">
            <Lock className="h-3 w-3 text-zinc-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-[12px] font-medium text-zinc-500">
              {opportunity.clientName}
            </p>
            <p className="truncate font-body text-[11px] text-zinc-400">
              {opportunity.responsibleName}
            </p>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>Card de outro vendedor</TooltipContent>
    </Tooltip>
  );
}
