"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import {
  Plus,
  Filter,
  MoreHorizontal,
  Flame,
  Thermometer,
  Snowflake,
  GripVertical,
  Clock,
  AlertTriangle,
  Settings2,
} from "lucide-react";
import { Reorder } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Opportunity, PipelineStage, Temperature } from "@/types";
import { useUIStore } from "@/stores/ui-store";
import { useOpportunityStore } from "@/stores/opportunity-store";
import { calculateSlaDeadline } from "@/lib/business-rules";
import { PipelineManagerDrawer } from "@/components/pipeline/pipeline-manager-drawer";

// ===== Funnel Definitions =====

interface FunnelDefinition {
  id: string;
  label: string;
  stages: { id: PipelineStage; label: string; slaHours: number }[];
}

const funnels: FunnelDefinition[] = [
  {
    id: "comercial",
    label: "Funil Comercial",
    stages: [
      { id: "lead-in", label: "Lead-In", slaHours: 48 },
      { id: "contato-feito", label: "Contato Feito", slaHours: 72 },
      { id: "reuniao-agendada", label: "Reuniao Agendada", slaHours: 120 },
      { id: "proposta-enviada", label: "Proposta Enviada", slaHours: 96 },
      { id: "negociacao", label: "Negociacao", slaHours: 168 },
      { id: "fechamento", label: "Fechamento", slaHours: 48 },
    ],
  },
  {
    id: "indicacao",
    label: "Funil Indicacao",
    stages: [
      { id: "lead-in", label: "Lead-In", slaHours: 24 },
      { id: "contato-feito", label: "Contato Feito", slaHours: 48 },
      { id: "proposta-enviada", label: "Proposta Enviada", slaHours: 72 },
      { id: "fechamento", label: "Fechamento", slaHours: 48 },
    ],
  },
];

// ===== Stage Order (for validation) =====

const stageOrder: PipelineStage[] = [
  "lead-in",
  "contato-feito",
  "reuniao-agendada",
  "proposta-enviada",
  "negociacao",
  "fechamento",
];

// ===== Stage Validation Rules =====

const stageRequiredFields: Record<PipelineStage, { field: keyof Opportunity; label: string }[]> = {
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

// ===== Temperature Icons =====

const temperatureIcons: Record<Temperature, React.ReactNode> = {
  hot: <Flame className="h-3.5 w-3.5 text-status-danger" />,
  warm: <Thermometer className="h-3.5 w-3.5 text-status-warning" />,
  cold: <Snowflake className="h-3.5 w-3.5 text-status-info" />,
};

// ===== Mock Data: 14 opportunities =====

const currentUserId = "user-1";

const mockOpportunities: Opportunity[] = [
  // LEAD-IN
  {
    id: "1",
    title: "Restaurante Bela Vista",
    clientName: "Restaurante Bela Vista Ltda",
    value: 12000,
    monthlyValue: 1000,
    stage: "lead-in",
    temperature: "hot",
    responsibleId: "1",
    responsibleName: "Maria Silva",
    tags: ["food-service", "premium"],
    createdAt: "2026-01-15",
    updatedAt: "2026-02-05",
    status: "open",
    slaDeadline: "2026-02-07T18:00:00",
  },
  {
    id: "2",
    title: "Padaria Pao Quente",
    clientName: "Padaria Pao Quente ME",
    value: 4800,
    monthlyValue: 400,
    stage: "lead-in",
    temperature: "warm",
    responsibleId: "1",
    responsibleName: "Maria Silva",
    tags: ["panificacao"],
    createdAt: "2026-02-01",
    updatedAt: "2026-02-05",
    status: "open",
    slaDeadline: "2026-02-08T10:00:00",
  },
  {
    id: "3",
    title: "Lanchonete do Carlos",
    clientName: "Carlos Almeida ME",
    value: 3600,
    monthlyValue: 300,
    stage: "lead-in",
    temperature: "cold",
    responsibleId: "3",
    responsibleName: "Ana Oliveira",
    tags: ["fast-food"],
    createdAt: "2026-02-03",
    updatedAt: "2026-02-04",
    status: "open",
    slaDeadline: "2026-02-06T08:00:00",
  },
  // CONTATO FEITO
  {
    id: "4",
    title: "Bar do Ze",
    clientName: "Bar do Ze Ltda",
    value: 8400,
    monthlyValue: 700,
    stage: "contato-feito",
    temperature: "warm",
    responsibleId: "1",
    responsibleName: "Maria Silva",
    tags: ["bar", "noturno"],
    createdAt: "2026-02-01",
    updatedAt: "2026-02-06",
    status: "open",
    slaDeadline: "2026-02-09T14:00:00",
  },
  {
    id: "5",
    title: "Pizzaria Napoli",
    clientName: "Napoli Alimentos Ltda",
    value: 15000,
    monthlyValue: 1250,
    stage: "contato-feito",
    temperature: "hot",
    responsibleId: "2",
    responsibleName: "Joao Santos",
    tags: ["pizzaria", "delivery"],
    createdAt: "2026-01-28",
    updatedAt: "2026-02-05",
    status: "open",
    slaDeadline: "2026-02-04T12:00:00",
  },
  // REUNIAO AGENDADA
  {
    id: "6",
    title: "Hotel Sunset",
    clientName: "Hotel Sunset S.A.",
    value: 36000,
    monthlyValue: 3000,
    stage: "reuniao-agendada",
    temperature: "warm",
    responsibleId: "1",
    responsibleName: "Maria Silva",
    tags: ["hotelaria"],
    createdAt: "2026-01-20",
    updatedAt: "2026-02-04",
    status: "open",
    expectedCloseDate: "2026-03-15",
    slaDeadline: "2026-02-10T09:00:00",
  },
  {
    id: "7",
    title: "Sorveteria Gelato",
    clientName: "Gelato Artesanal ME",
    value: 7200,
    monthlyValue: 600,
    stage: "reuniao-agendada",
    temperature: "cold",
    responsibleId: "1",
    responsibleName: "Maria Silva",
    tags: ["sorvetes"],
    createdAt: "2026-01-22",
    updatedAt: "2026-02-03",
    status: "open",
    expectedCloseDate: "2026-03-01",
    slaDeadline: "2026-02-06T15:00:00",
  },
  // PROPOSTA ENVIADA
  {
    id: "8",
    title: "Cafe Central",
    clientName: "Cafe Central ME",
    value: 6000,
    monthlyValue: 500,
    stage: "proposta-enviada",
    temperature: "cold",
    responsibleId: "2",
    responsibleName: "Joao Santos",
    tags: ["cafeteria"],
    createdAt: "2026-01-10",
    updatedAt: "2026-02-03",
    status: "open",
    expectedCloseDate: "2026-02-28",
    slaDeadline: "2026-02-07T11:00:00",
  },
  {
    id: "9",
    title: "Hamburgueria Smash",
    clientName: "Smash Burger Ltda",
    value: 9600,
    monthlyValue: 800,
    stage: "proposta-enviada",
    temperature: "hot",
    responsibleId: "1",
    responsibleName: "Maria Silva",
    tags: ["hamburgueria", "premium"],
    createdAt: "2026-01-18",
    updatedAt: "2026-02-05",
    status: "open",
    expectedCloseDate: "2026-02-20",
    slaDeadline: "2026-02-09T16:00:00",
  },
  // NEGOCIACAO
  {
    id: "10",
    title: "Pousada Mar Azul",
    clientName: "Pousada Mar Azul ME",
    value: 24000,
    monthlyValue: 2000,
    stage: "negociacao",
    temperature: "hot",
    responsibleId: "2",
    responsibleName: "Joao Santos",
    tags: ["hotelaria"],
    createdAt: "2026-01-05",
    updatedAt: "2026-02-06",
    status: "open",
    expectedCloseDate: "2026-02-15",
    slaDeadline: "2026-02-12T10:00:00",
  },
  {
    id: "11",
    title: "Doceria Sabor & Arte",
    clientName: "Sabor e Arte Doces Ltda",
    value: 10800,
    monthlyValue: 900,
    stage: "negociacao",
    temperature: "warm",
    responsibleId: "1",
    responsibleName: "Maria Silva",
    tags: ["confeitaria"],
    createdAt: "2026-01-12",
    updatedAt: "2026-02-05",
    status: "open",
    expectedCloseDate: "2026-02-25",
    slaDeadline: "2026-02-05T08:00:00",
  },
  // FECHAMENTO
  {
    id: "12",
    title: "Churrascaria Fogo Bravo",
    clientName: "Fogo Bravo Ltda",
    value: 18000,
    monthlyValue: 1500,
    stage: "fechamento",
    temperature: "hot",
    responsibleId: "1",
    responsibleName: "Maria Silva",
    tags: ["food-service", "churrascaria"],
    createdAt: "2025-12-20",
    updatedAt: "2026-02-06",
    status: "open",
    expectedCloseDate: "2026-02-10",
    slaDeadline: "2026-02-08T17:00:00",
  },
  {
    id: "13",
    title: "Acai da Praia",
    clientName: "Acai da Praia Franquias S.A.",
    value: 42000,
    monthlyValue: 3500,
    stage: "fechamento",
    temperature: "hot",
    responsibleId: "1",
    responsibleName: "Maria Silva",
    tags: ["acai", "franquia"],
    createdAt: "2025-12-10",
    updatedAt: "2026-02-06",
    status: "open",
    expectedCloseDate: "2026-02-08",
    slaDeadline: "2026-02-07T12:00:00",
  },
  {
    id: "14",
    title: "Cantina Bella Nonna",
    clientName: "Bella Nonna Restaurante Ltda",
    value: 14400,
    monthlyValue: 1200,
    stage: "lead-in",
    temperature: "warm",
    responsibleId: "2",
    responsibleName: "Joao Santos",
    tags: ["italiano", "restaurante"],
    createdAt: "2026-02-04",
    updatedAt: "2026-02-06",
    status: "open",
    slaDeadline: "2026-02-09T09:00:00",
  },
];

// ===== Helpers =====

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

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

function getSlaStatus(slaDeadline?: string): { status: SlaStatus; label: string } {
  if (!slaDeadline) return { status: "ok", label: "" };
  const now = new Date();
  const deadline = new Date(slaDeadline);
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { status: "breached", label: "Estourado" };
  }

  const totalHours = diffMs / (1000 * 60 * 60);
  const days = Math.floor(totalHours / 24);
  const hours = Math.floor(totalHours % 24);

  const label = days > 0 ? `${days}d ${hours}h` : `${hours}h`;

  if (totalHours <= 12) {
    return { status: "near", label };
  }

  return { status: "ok", label };
}

function getSlaIndicatorColor(status: SlaStatus): string {
  switch (status) {
    case "ok":
      return "bg-status-success";
    case "near":
      return "bg-status-warning";
    case "breached":
      return "bg-status-danger";
  }
}

function getCardBorderColor(status: SlaStatus): string {
  switch (status) {
    case "ok":
      return "border-l-brand";
    case "near":
      return "border-l-status-warning";
    case "breached":
      return "border-l-status-danger";
  }
}

function validateStageTransition(
  opportunity: Opportunity,
  targetStage: PipelineStage
): string[] {
  const currentIdx = stageOrder.indexOf(opportunity.stage);
  const targetIdx = stageOrder.indexOf(targetStage);

  // Only validate when moving forward
  if (targetIdx <= currentIdx) return [];

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

  return missing;
}

// ===== Main Page Component =====

export default function PipesPage() {
  const { openDrawer } = useUIStore();
  const { opportunities: storeOpportunities, moveToStage } = useOpportunityStore();
  const [selectedFunnel, setSelectedFunnel] = useState("comercial");
  // Merge store opportunities with local mock for backward compat
  const [localOpportunities, setLocalOpportunities] = useState<Opportunity[]>(mockOpportunities);
  const opportunities = storeOpportunities.length > 0 ? storeOpportunities.filter((o) => o.status === "open") : localOpportunities;
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const [isManageDrawerOpen, setIsManageDrawerOpen] = useState(false);
  const dragCardRef = useRef<Opportunity | null>(null);

  const activeFunnel = funnels.find((f) => f.id === selectedFunnel) ?? funnels[0];
  const activeStageIds = activeFunnel.stages.map((s) => s.id);

  // Get opportunities grouped by stage
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
      if (activeStageIds.includes(opp.stage)) {
        grouped[opp.stage].push(opp);
      }
    }
    return grouped;
  }, [opportunities, activeStageIds]);

  // Drag handlers for cross-column drag
  const handleDragStart = useCallback(
    (e: React.DragEvent, opportunity: Opportunity) => {
      // Only allow dragging own cards
      if (opportunity.responsibleId !== currentUserId) {
        e.preventDefault();
        return;
      }
      setDraggingCardId(opportunity.id);
      dragCardRef.current = opportunity;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", opportunity.id);
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, stage: PipelineStage) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverStage(stage);
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setDragOverStage(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetStage: PipelineStage) => {
      e.preventDefault();
      setDragOverStage(null);

      const card = dragCardRef.current;
      if (!card) return;

      if (card.stage === targetStage) {
        setDraggingCardId(null);
        dragCardRef.current = null;
        return;
      }

      // Validate stage transition
      const missingFields = validateStageTransition(card, targetStage);
      if (missingFields.length > 0) {
        toast.error("Campos obrigatorios faltando", {
          description: `Para mover para ${
            activeFunnel.stages.find((s) => s.id === targetStage)?.label ?? targetStage
          }, preencha: ${missingFields.join(", ")}`,
          duration: 5000,
        });
        setDraggingCardId(null);
        dragCardRef.current = null;
        return;
      }

      // Move card to target stage + recalcular SLA
      const targetStageDef = activeFunnel.stages.find(
        (s) => s.id === targetStage
      );
      const newSlaDeadline = targetStageDef
        ? calculateSlaDeadline(targetStageDef.slaHours)
        : undefined;

      // Update in store
      const slaHours = targetStageDef?.slaHours;
      if (storeOpportunities.length > 0) {
        moveToStage(card.id, targetStage, slaHours);
      } else {
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
      }

      toast.success("Oportunidade movida", {
        description: `"${card.title}" movida para ${
          activeFunnel.stages.find((s) => s.id === targetStage)?.label ?? targetStage
        }`,
      });

      setDraggingCardId(null);
      dragCardRef.current = null;
    },
    [activeFunnel, moveToStage, storeOpportunities.length]
  );

  const handleDragEnd = useCallback(() => {
    setDraggingCardId(null);
    setDragOverStage(null);
    dragCardRef.current = null;
  }, []);

  // Reorder within a column
  const handleReorder = useCallback(
    (stage: PipelineStage, newOrder: Opportunity[]) => {
      setLocalOpportunities((prev) => {
        const otherCards = prev.filter((o) => o.stage !== stage);
        return [...otherCards, ...newOrder];
      });
    },
    []
  );

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-black sm:text-3xl">
              Pipeline de Vendas
            </h1>
            <p className="mt-1 font-body text-sm text-zinc-500">
              Gerencie suas oportunidades pelo funil de vendas
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Funnel Selector */}
            <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
              <SelectTrigger className="w-[200px] rounded-[15px] font-heading text-sm">
                <SelectValue placeholder="Selecionar funil" />
              </SelectTrigger>
              <SelectContent className="rounded-[15px]">
                {funnels.map((funnel) => (
                  <SelectItem key={funnel.id} value={funnel.id}>
                    {funnel.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setIsManageDrawerOpen(true)}
              className="rounded-full font-heading text-sm"
            >
              <Settings2 className="mr-2 h-4 w-4" />
              Gerenciar Funis
            </Button>
            <Button
              variant="outline"
              onClick={() => openDrawer("filters")}
              className="rounded-full font-heading text-sm"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button
              onClick={() => openDrawer("new-opportunity")}
              className="rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Oportunidade
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div
          className="flex gap-3 overflow-x-auto pb-4"
          style={{ padding: "4px" }}
        >
          {activeFunnel.stages.map((stageDef) => {
            const cards = opportunitiesByStage[stageDef.id] || [];
            const totalValue = cards.reduce((acc, o) => acc + o.value, 0);
            const isDropTarget = dragOverStage === stageDef.id;

            // Column-level SLA: worst SLA status among cards
            const worstSla = cards.reduce<SlaStatus>((worst, card) => {
              const { status } = getSlaStatus(card.slaDeadline);
              if (status === "breached") return "breached";
              if (status === "near" && worst !== "breached") return "near";
              return worst;
            }, "ok");

            return (
              <div
                key={stageDef.id}
                className={`flex w-[85vw] shrink-0 flex-col rounded-[15px] transition-colors duration-150 sm:w-[290px] ${
                  isDropTarget
                    ? "bg-brand-light ring-2 ring-brand"
                    : "bg-zinc-50"
                }`}
                onDragOver={(e) => handleDragOver(e, stageDef.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stageDef.id)}
              >
                {/* Column Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[15px] bg-inherit p-3">
                  <div className="flex items-center gap-2">
                    {/* SLA Indicator Dot */}
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${getSlaIndicatorColor(worstSla)}`}
                      title={
                        worstSla === "ok"
                          ? "Dentro do SLA"
                          : worstSla === "near"
                            ? "Proximo do SLA"
                            : "SLA estourado"
                      }
                    />
                    <span className="font-heading text-sm font-semibold text-black">
                      {stageDef.label}
                    </span>
                    <Badge
                      variant="secondary"
                      className="rounded-[10px] font-body text-xs"
                    >
                      {cards.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-body text-xs text-zinc-500">
                      {formatCurrency(totalValue)}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-zinc-400 hover:text-brand"
                          onClick={() =>
                            openDrawer("new-opportunity", {
                              initialStage: stageDef.id,
                            })
                          }
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Adicionar oportunidade</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Column Cards */}
                <ScrollArea className="flex-1 px-3 pb-2">
                  {cards.length > 0 ? (
                    <Reorder.Group
                      axis="y"
                      values={cards}
                      onReorder={(newOrder) =>
                        handleReorder(stageDef.id, newOrder)
                      }
                      className="space-y-2"
                    >
                      {cards.map((opportunity) => {
                        const isGhost =
                          opportunity.responsibleId !== currentUserId;

                        if (isGhost) {
                          return (
                            <Reorder.Item
                              key={opportunity.id}
                              value={opportunity}
                              dragListener={false}
                            >
                              <GhostCard opportunity={opportunity} />
                            </Reorder.Item>
                          );
                        }

                        return (
                          <Reorder.Item
                            key={opportunity.id}
                            value={opportunity}
                            className={
                              draggingCardId === opportunity.id
                                ? "opacity-50"
                                : ""
                            }
                          >
                            <OpportunityCard
                              opportunity={opportunity}
                              onOpen={() =>
                                openDrawer("lead-card", {
                                  id: opportunity.id,
                                })
                              }
                              onDragStart={(e) =>
                                handleDragStart(e, opportunity)
                              }
                              onDragEnd={handleDragEnd}
                            />
                          </Reorder.Item>
                        );
                      })}
                    </Reorder.Group>
                  ) : (
                    /* Empty Column State */
                    <div className="flex h-28 items-center justify-center rounded-[15px] border-2 border-dashed border-zinc-200">
                      <p className="font-body text-xs text-zinc-400">
                        Arraste cards aqui
                      </p>
                    </div>
                  )}
                </ScrollArea>

                {/* Column Total Footer */}
                <div className="border-t border-zinc-200 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-xs text-zinc-400">
                      Total
                    </span>
                    <span className="font-heading text-sm font-semibold text-black">
                      {formatCurrency(totalValue)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pipeline Manager Drawer */}
        <PipelineManagerDrawer
          open={isManageDrawerOpen}
          onOpenChange={setIsManageDrawerOpen}
        />
      </div>
    </TooltipProvider>
  );
}

// ===== Opportunity Card Component =====

function OpportunityCard({
  opportunity,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  opportunity: Opportunity;
  onOpen: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const { openModal, openDrawer } = useUIStore();
  const sla = getSlaStatus(opportunity.slaDeadline);
  const borderColor = getCardBorderColor(sla.status);

  return (
    <div
      className={`cursor-pointer rounded-[15px] border border-zinc-200 bg-white border-l-[3px] ${borderColor} p-3 transition-shadow duration-100 hover:shadow-md`}
      onClick={onOpen}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {/* Drag Handle + Temperature */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <GripVertical className="h-4 w-4 cursor-grab text-zinc-300 active:cursor-grabbing" />
          {temperatureIcons[opportunity.temperature]}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-zinc-400"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-[15px]">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              openDrawer("new-activity", { opportunityId: opportunity.id });
            }}>
              Nova atividade
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-status-success"
              onClick={(e) => {
                e.stopPropagation();
                openModal("win-opportunity", { opportunityId: opportunity.id });
              }}
            >
              Marcar como Ganho
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-status-danger"
              onClick={(e) => {
                e.stopPropagation();
                openModal("lose-opportunity", { opportunityId: opportunity.id });
              }}
            >
              Marcar como Perdido
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title (Client Name) */}
      <div className="mb-2 min-w-0">
        <p className="line-clamp-2 font-body text-sm font-medium text-black">
          {opportunity.clientName}
        </p>
      </div>

      {/* Value */}
      <div className="mb-2">
        <span className="font-heading text-sm font-semibold text-black">
          {formatCurrency(opportunity.value)}
        </span>
      </div>

      {/* Tags (max 2) */}
      {opportunity.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {opportunity.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="rounded-[10px] font-body text-[11px]"
            >
              {tag}
            </Badge>
          ))}
          {opportunity.tags.length > 2 && (
            <Badge
              variant="secondary"
              className="rounded-[10px] font-body text-[11px]"
            >
              +{opportunity.tags.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* Footer: Avatar + SLA Countdown */}
      <div className="flex items-center justify-between border-t border-zinc-100 pt-2">
        {/* Responsible Avatar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[10px] font-heading font-semibold text-white">
              {getInitials(opportunity.responsibleName)}
            </div>
          </TooltipTrigger>
          <TooltipContent>{opportunity.responsibleName}</TooltipContent>
        </Tooltip>

        {/* SLA Countdown */}
        {sla.label && (
          <div
            className={`flex items-center gap-1 font-body text-xs font-medium ${
              sla.status === "breached"
                ? "text-status-danger"
                : sla.status === "near"
                  ? "text-status-warning"
                  : "text-zinc-400"
            }`}
          >
            {sla.status === "breached" ? (
              <AlertTriangle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            <span>{sla.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Ghost Card Component (other sellers) =====

function GhostCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="rounded-[15px] border border-zinc-200 bg-white p-3 opacity-50">
          <div className="min-w-0">
            <p className="line-clamp-2 font-body text-sm font-medium text-black">
              {opportunity.clientName}
            </p>
            <p className="mt-0.5 truncate font-body text-xs text-zinc-500">
              {opportunity.responsibleName}
            </p>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>Card de outro vendedor</TooltipContent>
    </Tooltip>
  );
}
