"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import {
  Search,
  Heart,
  AlertTriangle,
  XCircle,
  MoreHorizontal,
  User,
  Clock,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineFeedback } from "@/components/ui/inline-feedback";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import type { Client, ClientStage, HealthScore } from "@/types";
import { useUIStore } from "@/stores/ui-store";
import { useClientStore } from "@/stores/client-store";

// ===== Framer Motion Variants =====

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

// ===== Funnel Definitions =====

type FunnelType = "onboarding" | "ativos";

const onboardingStages: ClientStage[] = ["onboarding", "implantacao"];
const ativosStages: ClientStage[] = ["acompanhamento", "retencao", "churn"];

const stageConfig: Record<ClientStage, { label: string }> = {
  onboarding: { label: "Onboarding" },
  implantacao: { label: "Implantação" },
  acompanhamento: { label: "Acompanhamento" },
  retencao: { label: "Retenção" },
  churn: { label: "Churn" },
};

// ===== Health Score Config =====

const healthConfig: Record<
  HealthScore,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  good: {
    label: "Saudável",
    color: "text-status-success",
    bgColor: "bg-status-success-light",
    icon: <Heart className="h-3.5 w-3.5 fill-current text-status-success" />,
  },
  warning: {
    label: "Atenção",
    color: "text-status-warning",
    bgColor: "bg-status-warning-light",
    icon: <AlertTriangle className="h-3.5 w-3.5 text-status-warning" />,
  },
  critical: {
    label: "Crítico",
    color: "text-status-danger",
    bgColor: "bg-status-danger-light",
    icon: <XCircle className="h-3.5 w-3.5 text-status-danger" />,
  },
};

// ===== Local Mock Data (fallback, store is primary) =====

const localMockClients: Client[] = [
  {
    id: "cli-1",
    companyName: "Restaurante Panorâmico",
    cnpj: "12.345.678/0001-00",
    contactName: "Ana Costa",
    contactEmail: "ana@panoramico.com.br",
    contactPhone: "(11) 99876-5432",
    stage: "onboarding",
    healthScore: "good",
    monthlyRevenue: 2500,
    contractStart: "2026-01-28",
    responsibleId: "usr-1",
    responsibleName: "Maria Silva",
    tags: ["food-service"],
    createdAt: "2026-01-28",
    updatedAt: "2026-02-05",
    lastInteraction: "2026-02-04",
  },
  {
    id: "cli-2",
    companyName: "Hotel Imperial",
    cnpj: "98.765.432/0001-00",
    contactName: "Carlos Mendes",
    contactEmail: "carlos@imperial.com.br",
    contactPhone: "(21) 98765-4321",
    stage: "onboarding",
    healthScore: "warning",
    monthlyRevenue: 4800,
    contractStart: "2026-01-20",
    responsibleId: "usr-2",
    responsibleName: "João Santos",
    tags: ["hotelaria"],
    createdAt: "2026-01-20",
    updatedAt: "2026-02-03",
    lastInteraction: "2026-01-22",
  },
  {
    id: "cli-3",
    companyName: "Café Mocha Gourmet",
    cnpj: "55.667.788/0001-00",
    contactName: "Juliana Alves",
    contactEmail: "juliana@cafemocha.com.br",
    contactPhone: "(41) 99234-5678",
    stage: "implantacao",
    healthScore: "good",
    monthlyRevenue: 1200,
    contractStart: "2026-01-10",
    responsibleId: "usr-1",
    responsibleName: "Maria Silva",
    tags: ["cafeteria"],
    createdAt: "2026-01-10",
    updatedAt: "2026-02-06",
    lastInteraction: "2026-02-06",
  },
  {
    id: "cli-4",
    companyName: "Padaria Pão de Ouro",
    cnpj: "11.223.344/0001-00",
    contactName: "Roberto Lima",
    contactEmail: "roberto@paodeouro.com.br",
    contactPhone: "(31) 99345-6789",
    stage: "implantacao",
    healthScore: "warning",
    monthlyRevenue: 800,
    contractStart: "2026-01-05",
    responsibleId: "usr-2",
    responsibleName: "João Santos",
    tags: ["padaria"],
    createdAt: "2026-01-05",
    updatedAt: "2026-02-04",
    lastInteraction: "2026-01-18",
  },
  {
    id: "cli-5",
    companyName: "Clínica Vida Saudável",
    cnpj: "33.445.566/0001-00",
    contactName: "Dra. Fernanda Oliveira",
    contactEmail: "fernanda@vidasaudavel.com.br",
    contactPhone: "(11) 98123-4567",
    stage: "acompanhamento",
    healthScore: "good",
    monthlyRevenue: 3200,
    contractStart: "2025-08-15",
    responsibleId: "usr-1",
    responsibleName: "Maria Silva",
    tags: ["saude"],
    createdAt: "2025-08-15",
    updatedAt: "2026-02-06",
    lastInteraction: "2026-02-05",
  },
  {
    id: "cli-6",
    companyName: "Academia Power Fit",
    cnpj: "77.889.900/0001-00",
    contactName: "Marcos Pereira",
    contactEmail: "marcos@powerfit.com.br",
    contactPhone: "(21) 97654-3210",
    stage: "acompanhamento",
    healthScore: "good",
    monthlyRevenue: 1800,
    contractStart: "2025-10-01",
    responsibleId: "usr-2",
    responsibleName: "João Santos",
    tags: ["fitness"],
    createdAt: "2025-10-01",
    updatedAt: "2026-02-03",
    lastInteraction: "2026-02-02",
  },
  {
    id: "cli-7",
    companyName: "Escritório Contábil Exata",
    cnpj: "22.334.455/0001-00",
    contactName: "Patrícia Souza",
    contactEmail: "patricia@exata.com.br",
    contactPhone: "(31) 98456-7890",
    stage: "acompanhamento",
    healthScore: "warning",
    monthlyRevenue: 2100,
    contractStart: "2025-06-01",
    responsibleId: "usr-1",
    responsibleName: "Maria Silva",
    tags: ["contabilidade"],
    createdAt: "2025-06-01",
    updatedAt: "2026-01-28",
    lastInteraction: "2026-01-10",
  },
  {
    id: "cli-8",
    companyName: "Loja Virtual Trendy",
    cnpj: "66.778.899/0001-00",
    contactName: "Lucas Fernandes",
    contactEmail: "lucas@trendy.com.br",
    contactPhone: "(41) 99567-8901",
    stage: "retencao",
    healthScore: "warning",
    monthlyRevenue: 950,
    contractStart: "2025-04-01",
    responsibleId: "usr-2",
    responsibleName: "João Santos",
    tags: ["e-commerce"],
    createdAt: "2025-04-01",
    updatedAt: "2026-02-01",
    lastInteraction: "2026-01-20",
  },
  {
    id: "cli-9",
    companyName: "Construtora Horizonte",
    cnpj: "44.556.677/0001-00",
    contactName: "Ricardo Barros",
    contactEmail: "ricardo@horizonte.com.br",
    contactPhone: "(11) 97890-1234",
    stage: "retencao",
    healthScore: "critical",
    monthlyRevenue: 5500,
    contractStart: "2025-02-01",
    responsibleId: "usr-1",
    responsibleName: "Maria Silva",
    tags: ["construcao"],
    createdAt: "2025-02-01",
    updatedAt: "2026-01-25",
    lastInteraction: "2025-12-28",
  },
  {
    id: "cli-10",
    companyName: "Agência Criativa Hub",
    cnpj: "88.990.011/0001-00",
    contactName: "Camila Rocha",
    contactEmail: "camila@criativahub.com.br",
    contactPhone: "(21) 96543-2109",
    stage: "churn",
    healthScore: "critical",
    monthlyRevenue: 1600,
    contractStart: "2025-01-15",
    contractEnd: "2026-01-15",
    responsibleId: "usr-2",
    responsibleName: "João Santos",
    tags: ["agencia"],
    createdAt: "2025-01-15",
    updatedAt: "2026-01-15",
    lastInteraction: "2025-12-10",
  },
  {
    id: "cli-11",
    companyName: "Distribuidora Norte Sul",
    cnpj: "10.203.040/0001-00",
    contactName: "Fernando Gomes",
    contactEmail: "fernando@nortesul.com.br",
    contactPhone: "(31) 99012-3456",
    stage: "churn",
    healthScore: "critical",
    monthlyRevenue: 3800,
    contractStart: "2024-11-01",
    contractEnd: "2025-11-01",
    responsibleId: "usr-1",
    responsibleName: "Maria Silva",
    tags: ["distribuicao"],
    createdAt: "2024-11-01",
    updatedAt: "2025-11-15",
    lastInteraction: "2025-10-20",
  },
];

// ===== Helpers =====

function formatMRR(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR")}/mês`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

function getRelativeDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "hoje";
  if (diffDays === 1) return "há 1 dia";
  if (diffDays < 7) return `há ${diffDays} dias`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "há 1 semana" : `há ${weeks} semanas`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "há 1 mês" : `há ${months} meses`;
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? "há 1 ano" : `há ${years} anos`;
}

function getDaysSinceInteraction(dateStr?: string): number {
  if (!dateStr) return Infinity;
  const now = new Date();
  const date = new Date(dateStr);
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

// ===== Stage order for validation =====
const clientStageOrder: ClientStage[] = ["onboarding", "implantacao", "acompanhamento", "retencao", "churn"];

// ===== Page Component =====

export default function ClientsPage() {
  const { openDrawer, openModal } = useUIStore();
  const { clients: storeClients, moveToStage } = useClientStore();
  const draggedCardRef = useRef<string | null>(null);
  const dragOverStageRef = useRef<ClientStage | null>(null);

  const [activeFunnel, setActiveFunnel] = useState<FunnelType>("onboarding");
  const [searchQuery, setSearchQuery] = useState("");
  const [healthFilter, setHealthFilter] = useState<HealthScore | "all">("all");
  const [responsibleFilter, setResponsibleFilter] = useState<string>("all");
  const [dragFeedback, setDragFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Use store clients (merge with local if store is empty)
  const allClients = storeClients.length > 0 ? storeClients : localMockClients;

  // Unique responsible names for filter
  const responsibleNames = useMemo(
    () => Array.from(new Set(allClients.map((c) => c.responsibleName))),
    [allClients]
  );

  const stages =
    activeFunnel === "onboarding" ? onboardingStages : ativosStages;

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, cardId: string) => {
    draggedCardRef.current = cardId;
    e.dataTransfer.effectAllowed = "move";
    const el = e.currentTarget as HTMLElement;
    el.style.opacity = "0.5";
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.opacity = "1";
    draggedCardRef.current = null;
    dragOverStageRef.current = null;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stage: ClientStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    dragOverStageRef.current = stage;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetStage: ClientStage) => {
    e.preventDefault();
    const cardId = draggedCardRef.current;
    if (!cardId) return;

    const card = allClients.find((c) => c.id === cardId);
    if (!card || card.stage === targetStage) return;

    // Validate: can't move backwards from churn
    const currentIndex = clientStageOrder.indexOf(card.stage);
    const targetIndex = clientStageOrder.indexOf(targetStage);

    if (targetStage === "churn" && card.stage !== "retencao") {
      setDragFeedback({ type: "error", message: "Apenas clientes em Retenção podem ser movidos para Churn." });
      setTimeout(() => setDragFeedback(null), 3000);
      return;
    }

    moveToStage(cardId, targetStage);

    const stageLabel = stageConfig[targetStage].label;
    setDragFeedback({ type: "success", message: `${card.companyName} movido para ${stageLabel}.` });
    setTimeout(() => setDragFeedback(null), 2000);

    draggedCardRef.current = null;
    dragOverStageRef.current = null;
  }, [allClients, moveToStage]);

  const filteredClients = useMemo(() => {
    return allClients.filter((client) => {
      // Stage filter: only show clients belonging to the active funnel
      const funnelStages =
        activeFunnel === "onboarding" ? onboardingStages : ativosStages;
      if (!funnelStages.includes(client.stage)) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesCompany = client.companyName.toLowerCase().includes(query);
        const matchesContact = client.contactName.toLowerCase().includes(query);
        if (!matchesCompany && !matchesContact) return false;
      }

      // Health score filter
      if (healthFilter !== "all" && client.healthScore !== healthFilter)
        return false;

      // Responsible filter
      if (
        responsibleFilter !== "all" &&
        client.responsibleName !== responsibleFilter
      )
        return false;

      return true;
    });
  }, [activeFunnel, searchQuery, healthFilter, responsibleFilter, allClients]);

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-6">
      {/* Drag feedback */}
      {dragFeedback && (
        <InlineFeedback
          type={dragFeedback.type}
          message={dragFeedback.message}
          compact
          onClose={() => setDragFeedback(null)}
        />
      )}

      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-black sm:text-3xl">
            Clientes
          </h1>
          <p className="mt-1 font-body text-sm text-zinc-500">
            Acompanhe seus clientes pelo funil de sucesso
          </p>
        </div>
      </motion.div>

      {/* Funnel Toggle */}
      <motion.div variants={fadeUp} className="flex items-center gap-1 rounded-full bg-zinc-100 p-1 w-fit">
        <button
          onClick={() => setActiveFunnel("onboarding")}
          className={`rounded-full px-5 py-2 font-heading text-sm font-medium transition-colors ${
            activeFunnel === "onboarding"
              ? "bg-black text-white shadow-sm"
              : "text-zinc-600 hover:text-black"
          }`}
        >
          Onboarding
        </button>
        <button
          onClick={() => setActiveFunnel("ativos")}
          className={`rounded-full px-5 py-2 font-heading text-sm font-medium transition-colors ${
            activeFunnel === "ativos"
              ? "bg-black text-white shadow-sm"
              : "text-zinc-600 hover:text-black"
          }`}
        >
          Ativos
        </button>
      </motion.div>

      {/* Search + Filters Bar */}
      <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Buscar por empresa ou contato..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-[15px] pl-9 font-body text-sm"
          />
        </div>

        {/* Health Score Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded-full font-heading text-sm"
            >
              {healthFilter === "all"
                ? "Health Score"
                : healthConfig[healthFilter].label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="rounded-[15px]">
            <DropdownMenuItem onClick={() => setHealthFilter("all")}>
              Todos
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setHealthFilter("good")}>
              <Heart className="h-3.5 w-3.5 fill-current text-status-success" />
              Saudável
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setHealthFilter("warning")}>
              <AlertTriangle className="h-3.5 w-3.5 text-status-warning" />
              Atenção
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setHealthFilter("critical")}>
              <XCircle className="h-3.5 w-3.5 text-status-danger" />
              Crítico
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Responsible Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded-full font-heading text-sm"
            >
              <User className="mr-2 h-4 w-4" />
              {responsibleFilter === "all"
                ? "Responsável"
                : responsibleFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="rounded-[15px]">
            <DropdownMenuItem onClick={() => setResponsibleFilter("all")}>
              Todos
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {responsibleNames.map((name) => (
              <DropdownMenuItem
                key={name}
                onClick={() => setResponsibleFilter(name)}
              >
                {name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Kanban Board */}
      <motion.div
        variants={fadeUp}
        className="flex gap-3 overflow-x-auto pb-4"
        style={{ padding: "4px" }}
      >
        {stages.map((stage) => {
          const config = stageConfig[stage];
          const cards = filteredClients.filter((c) => c.stage === stage);
          const totalMRR = cards.reduce((acc, c) => acc + c.monthlyRevenue, 0);

          return (
            <motion.div
              key={stage}
              variants={scaleIn}
              className="flex w-[85vw] shrink-0 flex-col rounded-[15px] bg-zinc-50 transition-colors sm:w-[300px]"
              onDragOver={(e) => handleDragOver(e, stage)}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {/* Column Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between bg-zinc-50 p-3">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-sm font-semibold text-black">
                    {config.label}
                  </span>
                  <Badge
                    variant="secondary"
                    className="rounded-[10px] font-body text-xs"
                  >
                    {cards.length}
                  </Badge>
                </div>
                <span className="font-body text-xs text-zinc-500">
                  MRR {formatCurrency(totalMRR)}
                </span>
              </div>

              {/* Column Cards */}
              <ScrollArea className="flex-1 px-3 pb-3">
                <div className="space-y-2 min-h-[80px]">
                  {cards.map((client) => (
                    <div
                      key={client.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, client.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <ClientCard
                        client={client}
                        onOpen={() =>
                          openDrawer("client-card", { id: client.id })
                        }
                        onNewActivity={() =>
                          openDrawer("new-activity", { clientId: client.id })
                        }
                      />
                    </div>
                  ))}
                  {cards.length === 0 && (
                    <div className="flex h-24 items-center justify-center rounded-[15px] border border-dashed border-zinc-200">
                      <p className="font-body text-xs text-zinc-400">
                        Nenhum cliente nesta etapa
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

// ===== Client Card Component =====

function ClientCard({
  client,
  onOpen,
  onNewActivity,
}: {
  client: Client;
  onOpen: () => void;
  onNewActivity: () => void;
}) {
  const { openDrawer, openModal } = useUIStore();
  const health = healthConfig[client.healthScore];
  const daysSince = getDaysSinceInteraction(client.lastInteraction);

  return (
    <Card
      className="cursor-pointer rounded-[15px] border-zinc-200 bg-white transition-shadow duration-100 hover:shadow-md"
      onClick={onOpen}
    >
      <CardContent className="p-3">
        {/* Row 1: Company name + dropdown */}
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-semibold text-black">
              {client.companyName}
            </p>
            <p className="truncate font-body text-xs text-zinc-500">
              {client.contactName}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-zinc-400"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-[15px]">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  openDrawer("client-card", { id: client.id });
                }}
              >
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onNewActivity();
                }}
              >
                Nova atividade
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  openDrawer("new-activity", { clientId: client.id, clientName: client.companyName });
                }}
              >
                Registrar interação
              </DropdownMenuItem>
              {client.stage === "churn" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-status-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal("lose-opportunity", { clientId: client.id, reason: "churn" });
                    }}
                  >
                    Registrar churn
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Row 2: Health Score badge + MRR */}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-heading text-sm font-semibold text-black">
            {formatMRR(client.monthlyRevenue)}
          </span>
          <div
            className={`flex items-center gap-1 rounded-[10px] px-2 py-0.5 ${health.bgColor}`}
          >
            {health.icon}
            <span className={`font-body text-xs font-medium ${health.color}`}>
              {health.label}
            </span>
          </div>
        </div>

        {/* Row 3: Responsible + Last Interaction */}
        <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-2">
          <span className="font-body text-xs text-zinc-500">
            {client.responsibleName}
          </span>
          {client.lastInteraction && (
            <div className="flex items-center gap-1.5">
              {/* Inactivity warning dot */}
              {daysSince > 30 && (
                <span className="h-2 w-2 shrink-0 rounded-full bg-status-danger" />
              )}
              {daysSince > 14 && daysSince <= 30 && (
                <span className="h-2 w-2 shrink-0 rounded-full bg-status-warning" />
              )}
              <Clock className="h-3 w-3 text-zinc-400" />
              <span className="font-body text-xs text-zinc-400">
                {getRelativeDate(client.lastInteraction)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
