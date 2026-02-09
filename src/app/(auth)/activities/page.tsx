"use client";

import { useState, useMemo, type ReactNode } from "react";
import {
  Plus,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  RotateCcw,
  MessageCircle,
  MapPin,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  List,
  CalendarDays,
  CalendarRange,
  ThumbsUp,
  Minus,
  ThumbsDown,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { InlineFeedback } from "@/components/ui/inline-feedback";
import { useUIStore, type DrawerType, type ModalType } from "@/stores/ui-store";
import { useActivityStore } from "@/stores/activity-store";
import type { Activity, ActivityType, ActivityStatus } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function today() {
  return new Date();
}

function dateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateBR(s: string) {
  const d = parseDate(s);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(d: Date) {
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

function addDays(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ---------------------------------------------------------------------------
// Mock Data — 15 activities
// ---------------------------------------------------------------------------

const mockActivities: Activity[] = [
  // Overdue (past)
  {
    id: "1",
    title: "Ligar para confirmar pedido",
    type: "call",
    status: "overdue",
    dueDate: "2026-02-02",
    dueTime: "10:00",
    responsibleId: "1",
    responsibleName: "Você",
    opportunityTitle: "Restaurante Bela Vista",
    clientName: "João Silva",
    createdAt: "2026-01-28",
  },
  {
    id: "2",
    title: "Enviar proposta revisada",
    type: "email",
    status: "overdue",
    dueDate: "2026-02-03",
    dueTime: "14:00",
    responsibleId: "2",
    responsibleName: "Ana Souza",
    opportunityTitle: "Café Central",
    clientName: "Maria Oliveira",
    createdAt: "2026-01-30",
  },
  {
    id: "3",
    title: "Follow-up contrato pendente",
    type: "follow-up",
    status: "overdue",
    dueDate: "2026-02-04",
    dueTime: "09:00",
    responsibleId: "1",
    responsibleName: "Você",
    opportunityTitle: "Hotel Sunset",
    clientName: "Carlos Mendes",
    createdAt: "2026-02-01",
  },
  // Today
  {
    id: "4",
    title: "Reunião de apresentação do sistema",
    type: "meeting",
    status: "pending",
    dueDate: "2026-02-06",
    dueTime: "09:30",
    responsibleId: "1",
    responsibleName: "Você",
    opportunityTitle: "Padaria Pão Quente",
    clientName: "Roberto Lima",
    createdAt: "2026-02-04",
  },
  {
    id: "5",
    title: "Ligação de qualificação",
    type: "call",
    status: "pending",
    dueDate: "2026-02-06",
    dueTime: "11:00",
    responsibleId: "2",
    responsibleName: "Ana Souza",
    opportunityTitle: "Lanchonete do Bairro",
    clientName: "Fernanda Costa",
    createdAt: "2026-02-05",
  },
  {
    id: "6",
    title: "Enviar mensagem de boas-vindas",
    type: "whatsapp",
    status: "pending",
    dueDate: "2026-02-06",
    dueTime: "14:00",
    responsibleId: "1",
    responsibleName: "Você",
    clientName: "Pousada Mar Azul",
    createdAt: "2026-02-05",
  },
  // Next 7 days
  {
    id: "7",
    title: "Preparar proposta comercial",
    type: "task",
    status: "pending",
    dueDate: "2026-02-07",
    dueTime: "10:00",
    responsibleId: "1",
    responsibleName: "Você",
    opportunityTitle: "Bar do Zé",
    clientName: "José Pereira",
    createdAt: "2026-02-05",
  },
  {
    id: "8",
    title: "Follow-up após reunião",
    type: "follow-up",
    status: "pending",
    dueDate: "2026-02-08",
    dueTime: "09:00",
    responsibleId: "2",
    responsibleName: "Ana Souza",
    opportunityTitle: "Padaria Pão Quente",
    clientName: "Roberto Lima",
    createdAt: "2026-02-06",
  },
  {
    id: "9",
    title: "Enviar contrato para assinatura",
    type: "email",
    status: "pending",
    dueDate: "2026-02-09",
    responsibleId: "1",
    responsibleName: "Você",
    opportunityTitle: "Restaurante Sabor & Arte",
    clientName: "Luciana Ramos",
    createdAt: "2026-02-06",
  },
  {
    id: "10",
    title: "Reunião de onboarding",
    type: "meeting",
    status: "pending",
    dueDate: "2026-02-10",
    dueTime: "15:00",
    responsibleId: "3",
    responsibleName: "Pedro Santos",
    opportunityTitle: "Pizzaria Napoli",
    clientName: "Marcos Alves",
    createdAt: "2026-02-06",
  },
  // Future
  {
    id: "11",
    title: "Ligação de retenção",
    type: "call",
    status: "pending",
    dueDate: "2026-02-16",
    dueTime: "10:00",
    responsibleId: "1",
    responsibleName: "Você",
    clientName: "Sorveteria Gelato",
    createdAt: "2026-02-06",
  },
  {
    id: "12",
    title: "Enviar pesquisa de satisfação",
    type: "whatsapp",
    status: "pending",
    dueDate: "2026-02-20",
    responsibleId: "2",
    responsibleName: "Ana Souza",
    clientName: "Cantina Italiana",
    createdAt: "2026-02-06",
  },
  // Completed
  {
    id: "13",
    title: "E-mail de boas-vindas enviado",
    type: "email",
    status: "completed",
    dueDate: "2026-02-05",
    dueTime: "10:00",
    responsibleId: "1",
    responsibleName: "Você",
    clientName: "Pousada Mar Azul",
    completedAt: "2026-02-05",
    createdAt: "2026-02-04",
  },
  {
    id: "14",
    title: "Reunião de alinhamento concluída",
    type: "meeting",
    status: "completed",
    dueDate: "2026-02-04",
    dueTime: "16:00",
    responsibleId: "3",
    responsibleName: "Pedro Santos",
    opportunityTitle: "Churrascaria Fogo de Chão",
    clientName: "Ricardo Nunes",
    completedAt: "2026-02-04",
    createdAt: "2026-02-02",
  },
  // Cancelled
  {
    id: "15",
    title: "Tarefa cancelada - cliente desistiu",
    type: "task",
    status: "cancelled",
    dueDate: "2026-02-05",
    responsibleId: "2",
    responsibleName: "Ana Souza",
    opportunityTitle: "Doceria Sabor Doce",
    clientName: "Patrícia Almeida",
    createdAt: "2026-02-03",
  },
];

// ---------------------------------------------------------------------------
// Config Maps
// ---------------------------------------------------------------------------

const typeIconComponents: Record<ActivityType, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  visit: MapPin,
  task: CheckSquare,
  "follow-up": RotateCcw,
  whatsapp: MessageCircle,
};

function TypeIcon({
  type,
  className = "h-4 w-4",
}: {
  type: ActivityType;
  className?: string;
}) {
  const Icon = typeIconComponents[type];
  return <Icon className={className} />;
}

const typeLabels: Record<ActivityType, string> = {
  call: "Ligacao",
  email: "E-mail",
  meeting: "Reuniao",
  visit: "Visita",
  task: "Tarefa",
  "follow-up": "Follow-up",
  whatsapp: "WhatsApp",
};

const typeLabelsPt: Record<ActivityType, string> = {
  call: "Ligacoes",
  email: "E-mails",
  meeting: "Reunioes",
  visit: "Visitas",
  task: "Tarefas",
  "follow-up": "Follow-ups",
  whatsapp: "WhatsApp",
};

const typeColors: Record<ActivityType, { bg: string; text: string }> = {
  call: { bg: "bg-blue-100", text: "text-blue-600" },
  email: { bg: "bg-amber-100", text: "text-amber-600" },
  meeting: { bg: "bg-purple-100", text: "text-purple-600" },
  visit: { bg: "bg-indigo-100", text: "text-indigo-600" },
  task: { bg: "bg-emerald-100", text: "text-emerald-600" },
  "follow-up": { bg: "bg-orange-100", text: "text-orange-600" },
  whatsapp: { bg: "bg-green-100", text: "text-green-600" },
};

const typeDotColors: Record<ActivityType, string> = {
  call: "bg-blue-500",
  email: "bg-amber-500",
  meeting: "bg-purple-500",
  visit: "bg-indigo-500",
  task: "bg-emerald-500",
  "follow-up": "bg-orange-500",
  whatsapp: "bg-green-500",
};

const statusConfig: Record<
  ActivityStatus,
  { label: string; icon: ReactNode; color: string; dotColor: string }
> = {
  pending: {
    label: "Pendente",
    icon: <Clock className="h-3.5 w-3.5" />,
    color: "text-status-info",
    dotColor: "bg-status-info",
  },
  completed: {
    label: "Concluida",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    color: "text-status-success",
    dotColor: "bg-status-success",
  },
  overdue: {
    label: "Atrasada",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    color: "text-status-danger",
    dotColor: "bg-status-danger",
  },
  cancelled: {
    label: "Cancelada",
    icon: <XCircle className="h-3.5 w-3.5" />,
    color: "text-zinc-400",
    dotColor: "bg-zinc-400",
  },
};

// ---------------------------------------------------------------------------
// Grouping logic
// ---------------------------------------------------------------------------

interface GroupedActivities {
  overdue: Activity[];
  today: Activity[];
  next7: Activity[];
  future: Activity[];
}

function groupActivities(activities: Activity[]): GroupedActivities {
  const now = dateOnly(today());
  const in7 = addDays(now, 7);

  const groups: GroupedActivities = {
    overdue: [],
    today: [],
    next7: [],
    future: [],
  };

  for (const a of activities) {
    if (a.status === "completed" || a.status === "cancelled") continue;
    const d = parseDate(a.dueDate);
    if (d < now) {
      groups.overdue.push(a);
    } else if (isSameDay(d, now)) {
      groups.today.push(a);
    } else if (d < in7) {
      groups.next7.push(a);
    } else {
      groups.future.push(a);
    }
  }

  return groups;
}

// ---------------------------------------------------------------------------
// View types
// ---------------------------------------------------------------------------

type ViewMode = "list" | "week" | "month";

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ActivitiesPage() {
  const { openModal, openDrawer } = useUIStore();
  const { activities: storeActivities, completeActivity: storeCompleteActivity } = useActivityStore();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  // Use store activities if available
  const activities = storeActivities.length > 0 ? storeActivities : mockActivities;
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completionSentiment, setCompletionSentiment] = useState<
    "positive" | "neutral" | "negative" | null
  >(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters state
  const [filterTypes, setFilterTypes] = useState<Set<ActivityType>>(
    new Set(["call", "email", "meeting", "visit", "task", "follow-up", "whatsapp"])
  );
  const [filterResponsible, setFilterResponsible] = useState<string>("all");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");

  // Apply filters
  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      if (!filterTypes.has(a.type)) return false;
      if (filterResponsible !== "all" && a.responsibleId !== filterResponsible)
        return false;
      if (filterDateStart && a.dueDate < filterDateStart) return false;
      if (filterDateEnd && a.dueDate > filterDateEnd) return false;
      return true;
    });
  }, [activities, filterTypes, filterResponsible, filterDateStart, filterDateEnd]);

  const groups = useMemo(
    () => groupActivities(filteredActivities),
    [filteredActivities]
  );

  // Counts for sidebar
  const counts = useMemo(() => {
    const byStatus: Record<ActivityStatus, number> = {
      pending: 0,
      overdue: 0,
      completed: 0,
      cancelled: 0,
    };
    const byType: Record<ActivityType, number> = {
      call: 0,
      email: 0,
      meeting: 0,
      visit: 0,
      task: 0,
      "follow-up": 0,
      whatsapp: 0,
    };
    for (const a of filteredActivities) {
      byStatus[a.status]++;
      byType[a.type]++;
    }
    return { byStatus, byType, total: filteredActivities.length };
  }, [filteredActivities]);

  // Unique responsible names
  const responsibles = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of activities) {
      map.set(a.responsibleId, a.responsibleName);
    }
    return Array.from(map.entries());
  }, [activities]);

  // Complete activity handler
  function handleComplete(id: string) {
    storeCompleteActivity(id, completionNotes || undefined);
    setCompletingId(null);
    setCompletionSentiment(null);
    setCompletionNotes("");
  }

  function toggleFilterType(type: ActivityType) {
    setFilterTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  return (
    <div className="bento-container mx-auto">
      <div className="flex gap-6">
        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-black sm:text-3xl">
                Atividades
              </h1>
              <p className="mt-1 font-body text-sm text-zinc-500">
                Gerencie suas atividades e acompanhe seus compromissos
              </p>
            </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center rounded-full border border-zinc-200 bg-zinc-50 p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-heading text-xs font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-black text-white"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                Lista
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-heading text-xs font-medium transition-colors ${
                  viewMode === "week"
                    ? "bg-black text-white"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Semana
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-heading text-xs font-medium transition-colors ${
                  viewMode === "month"
                    ? "bg-black text-white"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                <CalendarRange className="h-3.5 w-3.5" />
                Mes
              </button>
            </div>

            {/* Filters */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full font-heading text-sm"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px]">
                <SheetHeader>
                  <SheetTitle className="font-heading">Filtros</SheetTitle>
                  <SheetDescription className="font-body text-sm">
                    Filtre atividades por tipo, responsavel e periodo
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 px-4 pt-4">
                  {/* Type filters */}
                  <div>
                    <p className="mb-3 font-heading text-sm font-semibold text-black">
                      Tipo de Atividade
                    </p>
                    <div className="space-y-2">
                      {(
                        [
                          "call",
                          "email",
                          "meeting",
                          "visit",
                          "task",
                          "follow-up",
                          "whatsapp",
                        ] as ActivityType[]
                      ).map((type) => (
                        <label
                          key={type}
                          className="flex cursor-pointer items-center gap-2.5"
                        >
                          <Checkbox
                            checked={filterTypes.has(type)}
                            onCheckedChange={() => toggleFilterType(type)}
                            className="h-[18px] w-[18px] rounded-[4px]"
                          />
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full ${typeColors[type].bg}`}
                          >
                            <span className={typeColors[type].text}>
                              <TypeIcon type={type} className="h-3 w-3" />
                            </span>
                          </div>
                          <span className="font-body text-sm text-zinc-700">
                            {typeLabels[type]}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Responsible filter */}
                  <div>
                    <p className="mb-3 font-heading text-sm font-semibold text-black">
                      Responsavel
                    </p>
                    <select
                      value={filterResponsible}
                      onChange={(e) => setFilterResponsible(e.target.value)}
                      className="h-9 w-full rounded-[15px] border border-zinc-200 bg-white px-3 font-body text-sm text-zinc-700 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    >
                      <option value="all">Todos</option>
                      {responsibles.map(([id, name]) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date range */}
                  <div>
                    <p className="mb-3 font-heading text-sm font-semibold text-black">
                      Periodo
                    </p>
                    <div className="space-y-2">
                      <div>
                        <label className="mb-1 block font-body text-xs text-zinc-500">
                          Data inicial
                        </label>
                        <Input
                          type="date"
                          value={filterDateStart}
                          onChange={(e) => setFilterDateStart(e.target.value)}
                          className="rounded-[15px] font-body text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block font-body text-xs text-zinc-500">
                          Data final
                        </label>
                        <Input
                          type="date"
                          value={filterDateEnd}
                          onChange={(e) => setFilterDateEnd(e.target.value)}
                          className="rounded-[15px] font-body text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Clear */}
                  <Button
                    variant="outline"
                    className="w-full rounded-full font-heading text-sm"
                    onClick={() => {
                      setFilterTypes(
                        new Set([
                          "call",
                          "email",
                          "meeting",
                          "task",
                          "follow-up",
                          "whatsapp",
                        ])
                      );
                      setFilterResponsible("all");
                      setFilterDateStart("");
                      setFilterDateEnd("");
                    }}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* New Activity */}
            <Button
              className="rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
              onClick={() => openDrawer("new-activity")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Atividade
            </Button>
          </div>
        </div>

        {/* View Content */}
        {viewMode === "list" && (
          <ListView
            groups={groups}
            completedActivities={filteredActivities.filter(
              (a) => a.status === "completed"
            )}
            cancelledActivities={filteredActivities.filter(
              (a) => a.status === "cancelled"
            )}
            completingId={completingId}
            setCompletingId={setCompletingId}
            completionSentiment={completionSentiment}
            setCompletionSentiment={setCompletionSentiment}
            completionNotes={completionNotes}
            setCompletionNotes={setCompletionNotes}
            handleComplete={handleComplete}
            openModal={openModal}
            openDrawer={openDrawer}
          />
        )}
        {viewMode === "week" && (
          <WeekView activities={filteredActivities} openModal={openModal} openDrawer={openDrawer} />
        )}
        {viewMode === "month" && (
          <MonthView activities={filteredActivities} />
        )}
      </div>

      {/* Sidebar Summary */}
      <div className="hidden w-[280px] shrink-0 lg:block">
        <SidebarSummary counts={counts} />
      </div>
    </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ListView
// ---------------------------------------------------------------------------

interface ListViewProps {
  groups: GroupedActivities;
  completedActivities: Activity[];
  cancelledActivities: Activity[];
  completingId: string | null;
  setCompletingId: (id: string | null) => void;
  completionSentiment: "positive" | "neutral" | "negative" | null;
  setCompletionSentiment: (
    s: "positive" | "neutral" | "negative" | null
  ) => void;
  completionNotes: string;
  setCompletionNotes: (s: string) => void;
  handleComplete: (id: string) => void;
  openModal: (type: ModalType, data?: Record<string, unknown>) => void;
  openDrawer: (type: DrawerType, data?: Record<string, unknown>) => void;
}

function ListView({
  groups,
  completedActivities,
  cancelledActivities,
  completingId,
  setCompletingId,
  completionSentiment,
  setCompletionSentiment,
  completionNotes,
  setCompletionNotes,
  handleComplete,
  openModal,
  openDrawer,
}: ListViewProps) {
  return (
    <div className="space-y-6">
      {/* Atrasadas */}
      {groups.overdue.length > 0 && (
        <ActivityGroup
          title="Atrasadas"
          count={groups.overdue.length}
          headerColor="text-status-danger"
          badgeColor="bg-status-danger text-white"
          activities={groups.overdue}
          isOverdue
          completingId={completingId}
          setCompletingId={setCompletingId}
          completionSentiment={completionSentiment}
          setCompletionSentiment={setCompletionSentiment}
          completionNotes={completionNotes}
          setCompletionNotes={setCompletionNotes}
          handleComplete={handleComplete}
          openModal={openModal}
          openDrawer={openDrawer}
        />
      )}

      {/* Hoje */}
      {groups.today.length > 0 && (
        <ActivityGroup
          title="Hoje"
          count={groups.today.length}
          headerColor="text-black"
          badgeColor="bg-black text-white"
          activities={groups.today}
          completingId={completingId}
          setCompletingId={setCompletingId}
          completionSentiment={completionSentiment}
          setCompletionSentiment={setCompletionSentiment}
          completionNotes={completionNotes}
          setCompletionNotes={setCompletionNotes}
          handleComplete={handleComplete}
          openModal={openModal}
          openDrawer={openDrawer}
        />
      )}

      {/* Proximos 7 dias */}
      {groups.next7.length > 0 && (
        <ActivityGroup
          title="Proximos 7 dias"
          count={groups.next7.length}
          headerColor="text-zinc-600"
          badgeColor="bg-zinc-200 text-zinc-700"
          activities={groups.next7}
          completingId={completingId}
          setCompletingId={setCompletingId}
          completionSentiment={completionSentiment}
          setCompletionSentiment={setCompletionSentiment}
          completionNotes={completionNotes}
          setCompletionNotes={setCompletionNotes}
          handleComplete={handleComplete}
          openModal={openModal}
          openDrawer={openDrawer}
        />
      )}

      {/* Futuras */}
      {groups.future.length > 0 && (
        <ActivityGroup
          title="Futuras"
          count={groups.future.length}
          headerColor="text-zinc-500"
          badgeColor="bg-zinc-100 text-zinc-500"
          activities={groups.future}
          completingId={completingId}
          setCompletingId={setCompletingId}
          completionSentiment={completionSentiment}
          setCompletionSentiment={setCompletionSentiment}
          completionNotes={completionNotes}
          setCompletionNotes={setCompletionNotes}
          handleComplete={handleComplete}
          openModal={openModal}
          openDrawer={openDrawer}
        />
      )}

      {/* Concluidas */}
      {completedActivities.length > 0 && (
        <ActivityGroup
          title="Concluidas"
          count={completedActivities.length}
          headerColor="text-status-success"
          badgeColor="bg-status-success-light text-status-success"
          activities={completedActivities}
          completingId={completingId}
          setCompletingId={setCompletingId}
          completionSentiment={completionSentiment}
          setCompletionSentiment={setCompletionSentiment}
          completionNotes={completionNotes}
          setCompletionNotes={setCompletionNotes}
          handleComplete={handleComplete}
          openModal={openModal}
          openDrawer={openDrawer}
        />
      )}

      {/* Canceladas */}
      {cancelledActivities.length > 0 && (
        <ActivityGroup
          title="Canceladas"
          count={cancelledActivities.length}
          headerColor="text-zinc-400"
          badgeColor="bg-zinc-100 text-zinc-400"
          activities={cancelledActivities}
          completingId={completingId}
          setCompletingId={setCompletingId}
          completionSentiment={completionSentiment}
          setCompletionSentiment={setCompletionSentiment}
          completionNotes={completionNotes}
          setCompletionNotes={setCompletionNotes}
          handleComplete={handleComplete}
          openModal={openModal}
          openDrawer={openDrawer}
        />
      )}

      {/* Empty state */}
      {groups.overdue.length === 0 &&
        groups.today.length === 0 &&
        groups.next7.length === 0 &&
        groups.future.length === 0 &&
        completedActivities.length === 0 &&
        cancelledActivities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <CheckCircle2 className="h-12 w-12 text-zinc-200" />
            <p className="mt-3 font-body text-sm text-zinc-500">
              Nenhuma atividade encontrada
            </p>
          </div>
        )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ActivityGroup
// ---------------------------------------------------------------------------

interface ActivityGroupProps {
  title: string;
  count: number;
  headerColor: string;
  badgeColor: string;
  activities: Activity[];
  isOverdue?: boolean;
  completingId: string | null;
  setCompletingId: (id: string | null) => void;
  completionSentiment: "positive" | "neutral" | "negative" | null;
  setCompletionSentiment: (
    s: "positive" | "neutral" | "negative" | null
  ) => void;
  completionNotes: string;
  setCompletionNotes: (s: string) => void;
  handleComplete: (id: string) => void;
  openModal: (type: ModalType, data?: Record<string, unknown>) => void;
  openDrawer: (type: DrawerType, data?: Record<string, unknown>) => void;
}

function ActivityGroup({
  title,
  count,
  headerColor,
  badgeColor,
  activities,
  isOverdue,
  completingId,
  setCompletingId,
  completionSentiment,
  setCompletionSentiment,
  completionNotes,
  setCompletionNotes,
  handleComplete,
  openModal,
  openDrawer,
}: ActivityGroupProps) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h2 className={`font-heading text-sm font-semibold ${headerColor}`}>
          {title}
        </h2>
        <span
          className={`inline-flex h-5 min-w-5 items-center justify-center rounded-[10px] px-1.5 font-heading text-xs font-semibold ${badgeColor}`}
        >
          {count}
        </span>
      </div>
      <div className="space-y-2">
        {activities.map((activity) => (
          <ActivityRow
            key={activity.id}
            activity={activity}
            isOverdue={isOverdue || activity.status === "overdue"}
            completingId={completingId}
            setCompletingId={setCompletingId}
            completionSentiment={completionSentiment}
            setCompletionSentiment={setCompletionSentiment}
            completionNotes={completionNotes}
            setCompletionNotes={setCompletionNotes}
            handleComplete={handleComplete}
            openModal={openModal}
            openDrawer={openDrawer}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ActivityRow
// ---------------------------------------------------------------------------

interface ActivityRowProps {
  activity: Activity;
  isOverdue?: boolean;
  completingId: string | null;
  setCompletingId: (id: string | null) => void;
  completionSentiment: "positive" | "neutral" | "negative" | null;
  setCompletionSentiment: (
    s: "positive" | "neutral" | "negative" | null
  ) => void;
  completionNotes: string;
  setCompletionNotes: (s: string) => void;
  handleComplete: (id: string) => void;
  openModal: (type: ModalType, data?: Record<string, unknown>) => void;
  openDrawer: (type: DrawerType, data?: Record<string, unknown>) => void;
}

function ActivityRow({
  activity,
  isOverdue,
  completingId,
  setCompletingId,
  completionSentiment,
  setCompletionSentiment,
  completionNotes,
  setCompletionNotes,
  handleComplete,
  openModal,
  openDrawer,
}: ActivityRowProps) {
  const config = statusConfig[activity.status];
  const tColor = typeColors[activity.type];
  const isCompleted = activity.status === "completed";
  const isCancelled = activity.status === "cancelled";

  return (
    <Card
      className={`cursor-pointer rounded-[15px] border-zinc-200 transition-colors duration-100 hover:bg-zinc-50 ${
        isOverdue && !isCompleted && !isCancelled
          ? "bg-status-danger-light/30"
          : ""
      }`}
      onClick={() => {
        openDrawer("new-activity", { activityId: activity.id, mode: "edit" });
      }}
    >
      <CardContent className="flex items-center gap-4 p-4">
        {/* Checkbox with completion popover */}
        <div onClick={(e) => e.stopPropagation()}>
          <Popover
            open={completingId === activity.id}
            onOpenChange={(open) => {
              if (!open) {
                setCompletingId(null);
                setCompletionSentiment(null);
                setCompletionNotes("");
              }
            }}
          >
            <PopoverTrigger asChild>
              <div>
                <Checkbox
                  checked={isCompleted}
                  disabled={isCompleted || isCancelled}
                  onCheckedChange={() => {
                    if (!isCompleted && !isCancelled) {
                      setCompletingId(activity.id);
                      setCompletionSentiment(null);
                      setCompletionNotes("");
                    }
                  }}
                  className="h-[18px] w-[18px] rounded-[4px]"
                />
              </div>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              side="bottom"
              className="w-[260px] rounded-[15px] border border-zinc-200 p-4 shadow-lg"
            >
              <p className="mb-3 font-heading text-sm font-semibold text-black">
                Como foi?
              </p>
              <div className="mb-3 flex gap-2">
                <button
                  onClick={() => setCompletionSentiment("positive")}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-[10px] border px-3 py-2 transition-colors ${
                    completionSentiment === "positive"
                      ? "border-status-success bg-status-success-light"
                      : "border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  <ThumbsUp
                    className={`h-5 w-5 ${
                      completionSentiment === "positive"
                        ? "text-status-success"
                        : "text-zinc-400"
                    }`}
                  />
                  <span className="font-body text-xs text-zinc-600">
                    Positivo
                  </span>
                </button>
                <button
                  onClick={() => setCompletionSentiment("neutral")}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-[10px] border px-3 py-2 transition-colors ${
                    completionSentiment === "neutral"
                      ? "border-status-warning bg-status-warning-light"
                      : "border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  <Minus
                    className={`h-5 w-5 ${
                      completionSentiment === "neutral"
                        ? "text-status-warning"
                        : "text-zinc-400"
                    }`}
                  />
                  <span className="font-body text-xs text-zinc-600">
                    Neutro
                  </span>
                </button>
                <button
                  onClick={() => setCompletionSentiment("negative")}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-[10px] border px-3 py-2 transition-colors ${
                    completionSentiment === "negative"
                      ? "border-status-danger bg-status-danger-light"
                      : "border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  <ThumbsDown
                    className={`h-5 w-5 ${
                      completionSentiment === "negative"
                        ? "text-status-danger"
                        : "text-zinc-400"
                    }`}
                  />
                  <span className="font-body text-xs text-zinc-600">
                    Negativo
                  </span>
                </button>
              </div>
              <Textarea
                placeholder="Observacoes (opcional)..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="mb-3 min-h-[60px] rounded-[10px] font-body text-sm"
              />
              <Button
                className="w-full rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
                onClick={() => handleComplete(activity.id)}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Concluir
              </Button>
            </PopoverContent>
          </Popover>
        </div>

        {/* Type Icon */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tColor.bg} ${tColor.text}`}
        >
          <TypeIcon type={activity.type} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p
            className={`truncate font-body text-sm font-medium ${
              isCompleted
                ? "text-zinc-400 line-through"
                : isCancelled
                  ? "text-zinc-400 line-through"
                  : "text-black"
            }`}
          >
            {activity.title}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <Badge
              variant="secondary"
              className="rounded-[10px] font-body text-xs"
            >
              {typeLabels[activity.type]}
            </Badge>
            {(activity.opportunityTitle || activity.clientName) && (
              <span className="truncate font-body text-xs text-zinc-500">
                {activity.opportunityTitle || activity.clientName}
              </span>
            )}
          </div>
        </div>

        {/* Assigned user avatar */}
        <Avatar size="sm">
          <AvatarFallback className="bg-brand/10 font-heading text-[10px] text-brand">
            {getInitials(activity.responsibleName)}
          </AvatarFallback>
        </Avatar>

        {/* Right side: date, time + status */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            {activity.dueTime && (
              <span className="block font-body text-sm text-zinc-500">
                {activity.dueTime}
              </span>
            )}
            <span className="block font-body text-xs text-zinc-400">
              {formatDateBR(activity.dueDate)}
            </span>
          </div>
          <div className={`flex items-center gap-1 ${config.color}`}>
            {config.icon}
            <span className="font-body text-xs font-medium">
              {config.label}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// WeekView
// ---------------------------------------------------------------------------

function WeekView({
  activities,
  openModal,
  openDrawer,
}: {
  activities: Activity[];
  openModal: (type: ModalType, data?: Record<string, unknown>) => void;
  openDrawer: (type: DrawerType, data?: Record<string, unknown>) => void;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const now = today();
  const weekStart = addDays(startOfWeek(now), weekOffset * 7);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  // Group activities by day
  const activitiesByDay = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const d of days) {
      const key = d.toISOString().split("T")[0];
      map.set(key, []);
    }
    for (const a of activities) {
      const key = a.dueDate;
      if (map.has(key)) {
        map.get(key)!.push(a);
      }
    }
    return map;
  }, [activities, days]);

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-full"
          onClick={() => setWeekOffset((p) => p - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-heading text-sm font-medium text-zinc-700">
          {days[0].toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          })}{" "}
          -{" "}
          {days[6].toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-full"
          onClick={() => setWeekOffset((p) => p + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 7 column grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {days.map((day, i) => {
          const key = day.toISOString().split("T")[0];
          const dayActivities = activitiesByDay.get(key) || [];
          const isToday = isSameDay(day, dateOnly(now));

          return (
            <div
              key={key}
              className={`min-h-[200px] rounded-[15px] border p-3 ${
                isToday
                  ? "border-brand bg-brand/5"
                  : "border-zinc-200 bg-white"
              }`}
            >
              {/* Day header */}
              <div className="mb-2 text-center">
                <p className="font-body text-xs text-zinc-400">
                  {dayNames[i]}
                </p>
                <p
                  className={`font-heading text-lg font-bold ${
                    isToday ? "text-brand" : "text-black"
                  }`}
                >
                  {day.getDate()}
                </p>
              </div>

              {/* Activity cards */}
              <div className="space-y-1.5">
                {dayActivities.map((a) => {
                  const tc = typeColors[a.type];
                  return (
                    <div
                      key={a.id}
                      className={`cursor-pointer rounded-[10px] border border-zinc-100 p-2 transition-colors hover:bg-zinc-50 ${
                        a.status === "overdue" ? "bg-status-danger-light/30" : ""
                      }`}
                      onClick={() =>
                        openDrawer("new-activity", { activityId: a.id, mode: "edit" })
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${tc.bg}`}
                        >
                          <span className={tc.text}>
                            <TypeIcon type={a.type} className="h-3 w-3" />
                          </span>
                        </div>
                        <p className="truncate font-body text-xs font-medium text-black">
                          {a.title}
                        </p>
                      </div>
                      {a.dueTime && (
                        <p className="mt-0.5 pl-6 font-body text-[10px] text-zinc-400">
                          {a.dueTime}
                        </p>
                      )}
                    </div>
                  );
                })}
                {dayActivities.length === 0 && (
                  <p className="py-4 text-center font-body text-xs text-zinc-300">
                    --
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MonthView
// ---------------------------------------------------------------------------

function MonthView({ activities }: { activities: Activity[] }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const now = today();
  const viewYear = now.getFullYear();
  const viewMonth = now.getMonth() + monthOffset;
  const adjustedDate = new Date(viewYear, viewMonth, 1);
  const year = adjustedDate.getFullYear();
  const month = adjustedDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  const monthName = adjustedDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  // Set of dates with activities
  const activityDates = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const a of activities) {
      const d = parseDate(a.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = a.dueDate;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(a);
      }
    }
    return map;
  }, [activities, year, month]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-full"
          onClick={() => setMonthOffset((p) => p - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-heading text-sm font-medium capitalize text-zinc-700">
          {monthName}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          className="rounded-full"
          onClick={() => setMonthOffset((p) => p + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-[15px] border border-zinc-200">
        {/* Header */}
        <div className="hidden grid-cols-7 border-b border-zinc-200 bg-zinc-50 sm:grid">
          {dayNames.map((dn) => (
            <div
              key={dn}
              className="py-2 text-center font-heading text-xs font-medium text-zinc-500"
            >
              {dn}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${i}`}
                  className="min-h-[80px] border-b border-r border-zinc-100 bg-zinc-50/50"
                />
              );
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayActivities = activityDates.get(dateStr) || [];
            const isCurrentDay =
              isSameDay(new Date(year, month, day), dateOnly(now));

            return (
              <div
                key={dateStr}
                className={`min-h-[80px] border-b border-r border-zinc-100 p-2 ${
                  isCurrentDay ? "bg-brand/5" : "bg-white"
                }`}
              >
                <p
                  className={`font-heading text-xs font-medium ${
                    isCurrentDay ? "text-brand" : "text-zinc-600"
                  }`}
                >
                  {day}
                </p>
                {dayActivities.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {dayActivities.slice(0, 3).map((a) => (
                      <div
                        key={a.id}
                        className={`h-2 w-2 rounded-full ${typeDotColors[a.type]}`}
                        title={a.title}
                      />
                    ))}
                    {dayActivities.length > 3 && (
                      <span className="font-body text-[10px] text-zinc-400">
                        +{dayActivities.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SidebarSummary
// ---------------------------------------------------------------------------

interface SidebarSummaryProps {
  counts: {
    total: number;
    byStatus: Record<ActivityStatus, number>;
    byType: Record<ActivityType, number>;
  };
}

function SidebarSummary({ counts }: SidebarSummaryProps) {
  return (
    <div className="sticky top-6 space-y-5">
      {/* Total */}
      <Card className="rounded-[15px] border-zinc-200">
        <CardContent className="p-5">
          <p className="font-body text-xs uppercase tracking-wider text-zinc-400">
            Total de Atividades
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-black sm:text-3xl">
            {counts.total}
          </p>
        </CardContent>
      </Card>

      {/* By Status */}
      <Card className="rounded-[15px] border-zinc-200">
        <CardContent className="p-5">
          <p className="mb-3 font-heading text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Por Status
          </p>
          <div className="space-y-2.5">
            {(
              [
                {
                  key: "pending" as ActivityStatus,
                  label: "Pendentes",
                  dotColor: "bg-status-info",
                },
                {
                  key: "overdue" as ActivityStatus,
                  label: "Atrasadas",
                  dotColor: "bg-status-danger",
                },
                {
                  key: "completed" as ActivityStatus,
                  label: "Concluidas",
                  dotColor: "bg-status-success",
                },
                {
                  key: "cancelled" as ActivityStatus,
                  label: "Canceladas",
                  dotColor: "bg-zinc-400",
                },
              ] as const
            ).map(({ key, label, dotColor }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                  <span className="font-body text-sm text-zinc-600">
                    {label}
                  </span>
                </div>
                <span className="font-heading text-sm font-semibold text-black">
                  {counts.byStatus[key]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* By Type */}
      <Card className="rounded-[15px] border-zinc-200">
        <CardContent className="p-5">
          <p className="mb-3 font-heading text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Por Tipo
          </p>
          <div className="space-y-2.5">
            {(
              [
                "call",
                "email",
                "meeting",
                "task",
                "follow-up",
                "whatsapp",
              ] as ActivityType[]
            ).map((type) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${typeColors[type].bg}`}
                  >
                    <span className={typeColors[type].text}>
                      <TypeIcon type={type} className="h-3 w-3" />
                    </span>
                  </div>
                  <span className="font-body text-sm text-zinc-600">
                    {typeLabelsPt[type]}
                  </span>
                </div>
                <span className="font-heading text-sm font-semibold text-black">
                  {counts.byType[type]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
