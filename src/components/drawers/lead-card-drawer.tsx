"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  X,
  Phone,
  MessageCircle,
  Circle,
  Mail,
  Calendar,
  Tag,
  DollarSign,
  User,
  Users,
  Store,
  Clock,
  Flame,
  Thermometer,
  Snowflake,
  MoreHorizontal,
  Building2,
  Plus,
  Trash2,
  Star,
  ChevronRight,
  Check,
  CheckCircle,
  Pencil,
  Globe,
  MapPin,
  TrendingUp,
  FileText,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Shield,
  ChevronDown,
  Activity,
  Filter,
  Instagram,
  ExternalLink,
  UtensilsCrossed,
  Copy,
  UserCircle,
  Coffee,
  Beer,
  Pizza,
  ShoppingBasket,
  Truck,
  GlassWater,
  ChefHat,
  Wine,
  Clock3,
  Globe2,
  LayoutList,
  Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskCep } from "@/lib/masks";
import { PhoneInput } from "@/components/ui/masked-inputs";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUIStore } from "@/stores/ui-store";
import type { Temperature, PipelineStage } from "@/types";
import { calculateLeadScore, calculateTemperature } from "@/lib/business-rules";
import { mockActivities } from "@/lib/mock-data";
import { stageFieldsConfig } from "@/lib/mock-stage-fields";

// ═══════════════════════════════════════════════════════════════════
// Types & Constants
// ═══════════════════════════════════════════════════════════════════

type DealStatus = "open" | "won" | "lost";
type BannerVariant = "success" | "error" | "info" | "warning";
type TimelineFilterType =
  | "all"
  | "activity"
  | "stage-change"
  | "note"
  | "value-change";

interface InlineBanner {
  message: string;
  variant: BannerVariant;
  action?: { label: string; onClick: () => void };
}

const referenceSetup = 15000;
const referenceMRR = 1200;
const NOTES_AUTOSAVE_MS = 800;

// ═══════════════════════════════════════════════════════════════════
// Telemetria — Frontend event tracking stub
// ═══════════════════════════════════════════════════════════════════

function trackEvent(
  event: string,
  properties?: Record<string, string | number | boolean>,
) {
  // Stub: em produção, seria integrado com analytics provider
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.debug(`[telemetry] ${event}`, properties);
  }
}

// ═══════════════════════════════════════════════════════════════════
// Config maps
// ═══════════════════════════════════════════════════════════════════

const temperatureConfig: Record<
  Temperature,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    border: string;
    chipClass: string;
  }
> = {
  hot: {
    label: "Quente",
    icon: <Flame className="h-3.5 w-3.5" />,
    color: "text-status-danger",
    bg: "bg-status-danger-light",
    border: "border-status-danger/15",
    chipClass: "bg-red-50 text-red-600 border-red-200/40 hover:bg-red-100/60",
  },
  warm: {
    label: "Morna",
    icon: <Thermometer className="h-3.5 w-3.5" />,
    color: "text-status-warning",
    bg: "bg-status-warning-light",
    border: "border-status-warning/15",
    chipClass:
      "bg-amber-50 text-amber-600 border-amber-200/40 hover:bg-amber-100/60",
  },
  cold: {
    label: "Fria",
    icon: <Snowflake className="h-3.5 w-3.5" />,
    color: "text-status-info",
    bg: "bg-status-info-light",
    border: "border-status-info/15",
    chipClass: "bg-sky-50 text-sky-600 border-sky-200/40 hover:bg-sky-100/60",
  },
};

const stageConfig: { id: PipelineStage; label: string }[] = [
  { id: "lead-in", label: "Lead-In" },
  { id: "contato-feito", label: "Contato Feito" },
  { id: "reuniao-agendada", label: "Reuniao Agendada" },
  { id: "proposta-enviada", label: "Proposta Enviada" },
  { id: "negociacao", label: "Negociacao" },
  { id: "fechamento", label: "Fechamento" },
];

const statusConfig: Record<
  DealStatus,
  { label: string; color: string; bg: string }
> = {
  open: { label: "Aberto", color: "text-brand", bg: "bg-brand/10" },
  won: {
    label: "Ganho",
    color: "text-status-success",
    bg: "bg-status-success/10",
  },
  lost: {
    label: "Perdido",
    color: "text-status-danger",
    bg: "bg-status-danger/10",
  },
};

const COMPANY_TYPES = [
  { id: "restaurante", label: "Restaurante", icon: UtensilsCrossed },
  { id: "cafeteria", label: "Cafeteria", icon: Coffee },
  { id: "bar", label: "Bar / Pub", icon: Beer },
  { id: "pizzaria", label: "Pizzaria", icon: Pizza },
  { id: "hamburgueria", label: "Hamburgueria", icon: ChefHat },
  { id: "padaria", label: "Padaria", icon: ShoppingBasket },
  { id: "sorveteria", label: "Sorveteria", icon: GlassWater },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "food-truck", label: "Food Truck", icon: Flame },
  { id: "bistro", label: "Bistrô", icon: Wine },
  { id: "buffet", label: "Buffet", icon: Users },
  { id: "adega", label: "Adega / Empório", icon: Store },
];

const DAYS_OF_WEEK = [
  { id: "seg", label: "Segunda" },
  { id: "ter", label: "Terça" },
  { id: "qua", label: "Quarta" },
  { id: "qui", label: "Quinta" },
  { id: "sex", label: "Sexta" },
  { id: "sab", label: "Sábado" },
  { id: "dom", label: "Domingo" },
];

const UF_LIST = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];


// ═══════════════════════════════════════════════════════════════════
// Mock Data
// ═══════════════════════════════════════════════════════════════════

const mockLead = {
  id: "1",
  title: "Restaurante Bela Vista",
  clientName: "Restaurante Bela Vista Ltda",
  nomeFantasia: "Restaurante Bela Vista",
  segmento: "Food service premium",
  nomeInterno: "",
  fonte: "Indicação parceiro",
  cep: "01411-000",
  logradouro: "Rua das Flores",
  numero: "123",
  complemento: "",
  bairro: "Jardim Paulista",
  cidade: "Sao Paulo",
  estado: "SP",
  telefoneEmpresa: "(11) 3456-7890",
  emailEmpresa: "contato@belavista.com",
  value: 12000,
  monthlyValue: 1000,
  stage: "contato-feito" as PipelineStage,
  temperature: "hot" as Temperature,
  score: 78,
  responsibleId: "u1",
  responsibleName: "Maria Silva",
  responsibleAvatar: "",
  tags: ["food-service", "restaurante", "premium"],
  source: "Indicacao",
  currency: "BRL",
  expectedCloseDate: "2026-03-15",
  createdAt: "2026-01-15",
  updatedAt: "2026-02-05",
  notes:
    "Cliente muito interessado. Agendar reuniao de apresentacao do modulo financeiro.",
  groupName: null,
  website: "https://belavista.com.br",
  instagram: "https://instagram.com/belavistarestaurante",
  cardapio: "https://belavista.com.br/cardapio",
  metadata: {
    stageValues: {
      origem_lead: "google",
    },
  },
};

const mockContacts = [
  {
    id: "c1",
    nome: "Joao Silva",
    email: "joao@belavista.com",
    telefone: "(11) 99999-1234",
    cargo: "Gerente Geral",
    isPrimary: true,
  },
  {
    id: "c2",
    nome: "Ana Costa",
    email: "ana@belavista.com",
    telefone: "(11) 99999-5678",
    cargo: "Diretora Financeira",
    isPrimary: false,
  },
  {
    id: "c3",
    nome: "Carlos Mendes",
    email: "carlos@belavista.com",
    telefone: "(11) 99999-9012",
    cargo: "Coordenador de TI",
    isPrimary: false,
  },
];

const mockTeamMembers = [
  { id: "u1", name: "Maria Silva", avatar: "" },
  { id: "u2", name: "Pedro Santos", avatar: "" },
  { id: "u3", name: "Julia Fernandes", avatar: "" },
  { id: "u4", name: "Rafael Costa", avatar: "" },
];

const mockTimeline = [
  {
    id: "t1",
    type: "created",
    message: "Oportunidade criada",
    user: "Maria Silva",
    date: "15/01/2026 10:00",
  },
  {
    id: 1,
    type: "stage-change",
    date: "Hoje, 14:30",
    title: "Mudança de Etapa",
    description: "Alterado de Lead In para Contato Feito",
    author: "Ana Silva",
    icon: CheckCircle,
  },
  {
    id: 2,
    type: "note",
    user: "Maria Silva",
    date: "22/01/2026 11:00",
  },
  {
    id: "t6",
    type: "value-change",
    message: "Valor alterado de R$ 8.000 para R$ 12.000",
    user: "Pedro Santos",
    date: "25/01/2026 16:45",
  },
  {
    id: "t7",
    type: "temperature-change",
    message: "Temperatura alterada de Morna para Quente",
    user: "Maria Silva",
    date: "28/01/2026 10:20",
  },
  {
    id: "t8",
    type: "activity",
    message: "Reuniao online com equipe do cliente",
    user: "Maria Silva",
    date: "03/02/2026 15:00",
  },
];


const mockVisits = [
  {
    id: "v1",
    type: "presencial",
    location: "Restaurante Bela Vista",
    status: "agendada",
    date: "15/02/2026 14:00",
    responsible: "Maria Silva",
  },
  {
    id: "v2",
    type: "online",
    location: "Google Meet",
    status: "realizada",
    date: "10/02/2026 10:00",
    responsible: "Pedro Santos",
    result: "Cliente demonstrou interesse no módulo financeiro.",
  },
];

const mockNoteHistory = [
  {
    id: "n1",
    author: "Maria Silva",
    date: "14/02/2026 09:30",
    content: "Cliente solicitou nova proposta com desconto de 5% para fechar ainda este mês.",
  },
  {
    id: "n2",
    author: "Pedro Santos",
    date: "10/02/2026 16:15",
    content: "Reunião de alinhamento realizada. O cliente gostou bastante da demonstração do painel financeiro.",
  },
  {
    id: "n3",
    author: "Sistema",
    date: "05/02/2026 10:00",
    content: "Oportunidade movida para a etapa de Negociação.",
  },
];

const lostReasons = [
  "Preco alto",
  "Escolheu concorrente",
  "Sem orcamento",
  "Projeto cancelado",
  "Sem resposta",
  "Outro",
];

// ═══════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════

function formatCurrency(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(value);
}

function getScoreColor(score: number) {
  if (score >= 70)
    return "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
  if (score >= 40)
    return "bg-amber-50 text-amber-700 border border-amber-200/50";
  return "bg-red-50 text-red-700 border border-red-200/50";
}

function getScoreLabel(score: number) {
  if (score >= 70) return "Alto";
  if (score >= 40) return "Medio";
  return "Baixo";
}


function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ═══════════════════════════════════════════════════════════════════
// InlineStatusBanner
// ═══════════════════════════════════════════════════════════════════

function InlineStatusBanner({
  banner,
  onDismiss,
}: {
  banner: InlineBanner;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (banner.variant === "success" || banner.variant === "info") {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [banner, onDismiss]);

  const variantStyles: Record<BannerVariant, string> = {
    success:
      "bg-status-success/10 text-status-success border-status-success/20",
    error: "bg-status-danger/10 text-status-danger border-status-danger/20",
    info: "bg-brand/10 text-brand border-brand/20",
    warning:
      "bg-status-warning/10 text-status-warning border-status-warning/20",
  };

  const icons: Record<BannerVariant, React.ReactNode> = {
    success: <Check className="h-3.5 w-3.5 shrink-0" />,
    error: <AlertTriangle className="h-3.5 w-3.5 shrink-0" />,
    info: <Activity className="h-3.5 w-3.5 shrink-0" />,
    warning: <AlertTriangle className="h-3.5 w-3.5 shrink-0" />,
  };

  return (
    <div
      className={`flex items-center gap-2 rounded-[10px] border px-3 py-2 font-body text-xs font-medium animate-in fade-in slide-in-from-top-1 duration-200 ${variantStyles[banner.variant]}`}
      role={banner.variant === "error" ? "alert" : "status"}
      aria-live={banner.variant === "error" ? "assertive" : "polite"}
    >
      {icons[banner.variant]}
      <span className="flex-1">{banner.message}</span>
      {banner.action && (
        <button
          onClick={banner.action.onClick}
          className="shrink-0 underline underline-offset-2 transition-opacity hover:opacity-70"
        >
          {banner.action.label}
        </button>
      )}
      <button
        onClick={onDismiss}
        className="shrink-0 rounded p-0.5 transition-colors hover:bg-black/10"
        aria-label="Fechar"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// InlineEditable with save/cancel states
// ═══════════════════════════════════════════════════════════════════

function InlineEditable({
  value,
  onSave,
  className = "",
  inputClassName = "",
  type = "text",
  readOnly = false,
  validate,
}: {
  value: string;
  onSave: (val: string) => void;
  className?: string;
  inputClassName?: string;
  type?: string;
  readOnly?: boolean;
  validate?: (val: string) => string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function handleSave() {
    if (validate) {
      const err = validate(draft);
      if (err) {
        setError(err);
        return;
      }
    }
    setEditing(false);
    setError(null);
    if (draft !== value) onSave(draft);
  }

  function handleCancel() {
    setDraft(value);
    setEditing(false);
    setError(null);
  }

  if (readOnly) {
    return <span className={className}>{value || "--"}</span>;
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <Input
            ref={inputRef}
            type={type}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(null);
            }}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            className={`h-7 rounded-[10px] font-body text-sm ${inputClassName}`}
          />
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleSave}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-status-success transition-colors hover:bg-status-success/10"
            aria-label="Salvar"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleCancel}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100"
            aria-label="Cancelar"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        {error && (
          <p className="font-body text-[10px] text-status-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <span
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={`cursor-pointer rounded-md px-1 py-0.5 transition-colors hover:bg-zinc-100 ${className}`}
      title="Clique para editar"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setDraft(value);
          setEditing(true);
        }
      }}
    >
      {value || "--"}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════
// StageRail — Premium stage navigation
// ═══════════════════════════════════════════════════════════════════

function StageRail({
  currentStage,
  onStageChange,
  disabled = false,
  statusBanner,
  onBannerDismiss,
}: {
  currentStage: PipelineStage;
  onStageChange: (stage: PipelineStage) => void;
  disabled?: boolean;
  statusBanner: InlineBanner | null;
  onBannerDismiss: () => void;
}) {
  const currentIndex = stageConfig.findIndex((s) => s.id === currentStage);
  const currentLabel = stageConfig[currentIndex]?.label ?? "Etapa";

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={disabled}
            className={`inline-flex h-8 items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 py-1.5 font-body text-xs font-semibold text-brand transition-all duration-150 ease-out hover:bg-brand/15 hover:border-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-1 ${disabled ? "pointer-events-none opacity-50" : ""}`}
            aria-label={`Etapa atual: ${currentLabel}`}
          >
            <span className="font-body text-[10px] font-medium text-brand/60">
              Etapa
            </span>
            <span className="font-body text-[11px]">{currentLabel}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="rounded-[var(--radius-bento-card)] min-w-[200px]"
        >
          {stageConfig.map((stage, i) => {
            const isActive = stage.id === currentStage;
            const isPast = i < currentIndex;

            return (
              <DropdownMenuItem
                key={stage.id}
                onClick={() => onStageChange(stage.id)}
                className={`flex items-center gap-2 font-body text-sm ${
                  isActive
                    ? "font-semibold text-brand"
                    : isPast
                      ? "text-brand/70"
                      : "text-zinc-500"
                }`}
              >
                {isPast && <Check className="h-3.5 w-3.5 text-brand" />}
                {isActive && (
                  <ChevronRight className="h-3.5 w-3.5 text-brand" />
                )}
                {!isPast && !isActive && <span className="h-3.5 w-3.5" />}
                {stage.label}
                {isActive && (
                  <span className="ml-auto rounded-full bg-brand/10 px-1.5 py-0.5 font-body text-[9px] font-medium text-brand">
                    Atual
                  </span>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      {statusBanner && (
        <InlineStatusBanner banner={statusBanner} onDismiss={onBannerDismiss} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// NotesCard with autosave
// ═══════════════════════════════════════════════════════════════════

function NotesCard({
  initialNotes,
  onNotesChange,
}: {
  initialNotes: string;
  onNotesChange: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastSaved, setLastSaved] = useState(initialNotes);

  const handleChange = useCallback(
    (val: string) => {
      setNotes(val);
      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        setSaveState("saving");
        // Simulate async save
        setTimeout(() => {
          onNotesChange(val);
          setLastSaved(val);
          setSaveState("saved");
          trackEvent("notes_saved_succeeded");
          setTimeout(() => setSaveState("idle"), 2000);
        }, 300);
      }, NOTES_AUTOSAVE_MS);
    },
    [onNotesChange],
  );

  const handleManualSave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSaveState("saving");
    setTimeout(() => {
      onNotesChange(notes);
      setLastSaved(notes);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    }, 300);
  };

  const hasUnsaved = notes !== lastSaved;

  return (
    <div className="rounded-[14px] border border-zinc-100 p-3.5 transition-all hover:border-zinc-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-50 text-zinc-400">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <span className="font-body text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Anotacoes
          </span>
        </div>
        <div className="flex items-center gap-2">
          {saveState === "saving" && (
            <span className="flex items-center gap-1 font-body text-[10px] text-zinc-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Salvando...
            </span>
          )}
          {saveState === "saved" && (
            <span
              className="flex items-center gap-1 font-body text-[10px] text-status-success"
              role="status"
            >
              <Check className="h-3 w-3" />
              Salvo
            </span>
          )}
          {saveState === "error" && (
            <button
              onClick={handleManualSave}
              className="flex items-center gap-1 font-body text-[10px] text-status-danger hover:underline"
            >
              <RefreshCw className="h-3 w-3" />
              Salvar agora
            </button>
          )}
          {hasUnsaved && saveState === "idle" && (
            <span className="font-body text-[10px] text-zinc-300">
              Nao salvo
            </span>
          )}
        </div>
      </div>
      <Textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        className="mt-2 min-h-[80px] resize-none rounded-[10px] border-zinc-100 font-body text-sm focus:border-brand/30"
        placeholder="Contexto rapido do que ja foi conversado..."
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Timeline Premium with filter
// ═══════════════════════════════════════════════════════════════════


function getTimelineIcon(type: string, CustomIcon?: React.ElementType) {
  if (CustomIcon) return <CustomIcon className="h-3.5 w-3.5" />;
  switch (type) {
    case "activity":
      return <CheckCircle className="h-3.5 w-3.5" />;
    case "stage-change":
      return <ArrowRight className="h-3.5 w-3.5" />;
    case "note":
      return <FileText className="h-3.5 w-3.5" />;
    case "value-change":
      return <DollarSign className="h-3.5 w-3.5" />;
    case "tag-added":
      return <Tag className="h-3.5 w-3.5" />;
    default:
      return <Clock className="h-3.5 w-3.5" />;
  }
}

function getTimelineIconColor(type: string) {
  switch (type) {
    case "activity":
      return "bg-brand/10 text-brand";
    case "stage-change":
      return "bg-purple-50 text-purple-600";
    case "note":
      return "bg-yellow-50 text-yellow-600";
    case "value-change":
      return "bg-green-50 text-green-600";
    case "tag-added":
      return "bg-zinc-100 text-zinc-500";
    default:
      return "bg-zinc-100 text-zinc-500";
  }
}

function TimelinePremium({ events }: { events: typeof mockTimeline }) {
  const [filter, setFilter] = useState<TimelineFilterType>("all");

  const filterOptions: { value: TimelineFilterType; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "activity", label: "Atividades" },
    { value: "stage-change", label: "Etapas" },
    { value: "note", label: "Notas" },
    { value: "value-change", label: "Valores" },
  ];

  const filteredEvents =
    filter === "all" ? events : events.filter((e) => e.type === filter);

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-zinc-300" />
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={cn(
                "rounded-full px-2.5 py-1 font-body text-[11px] font-medium transition-all",
                filter === opt.value
                  ? "bg-brand/10 text-brand"
                  : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Timeline entries */}
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <Activity className="h-8 w-8 text-zinc-200" />
          <p className="mt-2 font-body text-sm text-zinc-400">
            Sem atividades encontradas
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="mt-2 rounded-full font-body text-xs text-brand"
            onClick={() => setFilter("all")}
          >
            Limpar filtro
          </Button>
        </div>
      ) : (
        <div className="relative space-y-0">
          {filteredEvents.map((event, i) => (
            <div key={event.id} className="group relative flex gap-3 pb-5">
              {i < filteredEvents.length - 1 && (
                <div className="absolute left-[13px] top-7 h-full w-px bg-zinc-100" />
              )}
              <div
                className={cn(
                    "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all ring-4 ring-white",
                    getTimelineIconColor(event.type)
                )}
              >
                {getTimelineIcon(event.type, event.icon)}
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-col">
                    <span className="font-heading text-xs font-semibold text-zinc-900">
                        {event.title || "Evento"}
                    </span>
                    <p className="font-body text-sm text-zinc-600">
                        {event.description || event.message}
                    </p>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                    {/* Tiny avatar placeholder or name */}
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-100 text-[9px] font-bold text-zinc-500">
                        {(event.author || event.user || "?").charAt(0)}
                    </div>
                    <p className="font-body text-[10px] text-zinc-400">
                    {event.author || event.user} &middot; {event.date}
                    </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Contact Card
// ═══════════════════════════════════════════════════════════════════

function ContactCard({
  contact,
  onEdit,
  onDelete,
}: {
  contact: (typeof mockContacts)[0];
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-start justify-between rounded-[14px] border border-zinc-100 p-3.5 transition-all hover:border-zinc-200 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-50">
          <User className="h-4 w-4 text-zinc-400" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-heading text-sm font-semibold text-black">
              {contact.nome}
            </p>
            {contact.isPrimary && (
              <Badge className="gap-0.5 rounded-[6px] bg-brand/10 px-1.5 py-0.5 font-body text-[9px] text-brand">
                <Star className="h-2.5 w-2.5" /> Principal
              </Badge>
            )}
          </div>
          <p className="font-body text-[11px] text-zinc-400">{contact.cargo}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 font-body text-[11px] text-zinc-500">
              <Mail className="h-3 w-3" /> {contact.email}
            </span>
            <span className="flex items-center gap-1 font-body text-[11px] text-zinc-500">
              <Phone className="h-3 w-3" /> {contact.telefone}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={onEdit}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          aria-label="Editar contato"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-status-danger/10 hover:text-status-danger"
          aria-label="Remover contato"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// EditableField (for tab content)
// ═══════════════════════════════════════════════════════════════════

function EditableField({
  icon,
  label,
  value,
  onSave,
  type = "text",
  readOnly = false,
  placeholder,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onSave: (val: string) => void;
  type?: string;
  readOnly?: boolean;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function handleSave() {
    setEditing(false);
    if (draft !== value) onSave(draft);
  }

  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-zinc-100 p-3 transition-colors hover:border-zinc-200">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-50 text-zinc-400">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-body text-[10px] font-medium uppercase tracking-wider text-zinc-400">
          {label}
        </p>
        {editing && !readOnly ? (
          <div className="mt-0.5 flex items-center gap-1">
            <Input
              ref={inputRef}
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") {
                  setDraft(value);
                  setEditing(false);
                }
              }}
              placeholder={placeholder}
              className="h-7 rounded-[8px] border-zinc-200 font-body text-sm"
            />
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleSave}
              className="flex h-6 w-6 items-center justify-center rounded-md text-status-success hover:bg-status-success/10"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setDraft(value);
                setEditing(false);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <p
            onClick={() => {
              if (!readOnly) {
                setDraft(value);
                setEditing(true);
              }
            }}
            className={`mt-0.5 truncate font-body text-sm font-medium text-black ${!readOnly ? "cursor-pointer rounded-md px-1 py-0.5 transition-colors hover:bg-zinc-50" : ""}`}
            title={readOnly ? undefined : "Clique para editar"}
          >
            {value || (
              <span className="text-zinc-300">{placeholder || "--"}</span>
            )}
          </p>
        )}
      </div>
      {!editing && !readOnly && (
        <button
          onClick={() => {
            setDraft(value);
            setEditing(true);
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-300 transition-colors hover:bg-zinc-100 hover:text-zinc-500"
          aria-label={`Editar ${label}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
      {readOnly && (
        <div
          className="flex items-center gap-1 text-zinc-300"
          title="Somente leitura"
        >
          <Shield className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Temperature Selector (compact)
// ═══════════════════════════════════════════════════════════════════

function TemperatureSelect({
  current,
  onChange,
  suggested,
  disabled = false,
}: {
  current: Temperature;
  onChange: (t: Temperature) => void;
  suggested?: Temperature;
  disabled?: boolean;
}) {
  const cfg = temperatureConfig[current];

  return (
    <div
      className={`flex items-center gap-2 ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={disabled}
            className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 py-1.5 font-body text-[11px] font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-1 ${cfg.chipClass}`}
            aria-label={`Temperatura: ${cfg.label}`}
          >
            {cfg.icon}
            {cfg.label}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="rounded-[var(--radius-bento-card)] min-w-[180px]"
        >
          {(["hot", "warm", "cold"] as Temperature[]).map((temp) => {
            const tempCfg = temperatureConfig[temp];
            const isSelected = current === temp;

            return (
              <DropdownMenuItem
                key={temp}
                onClick={() => onChange(temp)}
                className={`flex items-center gap-2 font-body text-sm ${isSelected ? "font-semibold" : ""}`}
              >
                <span className={tempCfg.color}>{tempCfg.icon}</span>
                <span className={isSelected ? tempCfg.color : "text-zinc-600"}>
                  {tempCfg.label}
                </span>
                {isSelected && (
                  <Check className="ml-auto h-3.5 w-3.5 text-brand" />
                )}
              </DropdownMenuItem>
            );
          })}
          {suggested && suggested !== current && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onChange(suggested)}
                className="flex items-center gap-2 font-body text-xs text-brand"
              >
                <Star className="h-3 w-3" />
                Sugestao: {temperatureConfig[suggested].label}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// LostReasonDrawer (inline panel)
// ═══════════════════════════════════════════════════════════════════

function LostReasonPanel({
  onConfirm,
  onCancel,
  isLoading,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="animate-in slide-in-from-right-2 space-y-4 rounded-[14px] border border-status-danger/20 bg-status-danger/5 p-4 duration-200">
      <div>
        <h4 className="font-heading text-sm font-semibold text-status-danger">
          Motivo da perda
        </h4>
        <p className="mt-0.5 font-body text-xs text-zinc-500">
          Marcar como perdido encerra a oportunidade. Voce quer continuar?
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {lostReasons.map((r) => (
          <button
            key={r}
            onClick={() => setReason(r)}
            className={`rounded-full border px-3 py-1.5 font-body text-xs transition-all ${
              reason === r
                ? "border-status-danger bg-status-danger text-white"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full font-heading text-xs"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          className="rounded-full bg-status-danger font-heading text-xs text-white hover:bg-status-danger/90"
          onClick={() => {
            if (reason) onConfirm(reason);
          }}
          disabled={!reason || isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : null}
          Confirmar perda
        </Button>
      </div>
    </div>
  );
}



// ═══════════════════════════════════════════════════════════════════
// CopyButton — Inline copy-to-clipboard with fade feedback
// ═══════════════════════════════════════════════════════════════════

function CopyButton({
  value,
  children,
  className = "",
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  }, [value]);

  return (
    <button
      onClick={handleCopy}
      className={`group/copy relative inline-flex items-center gap-1.5 transition-all duration-120 ease-out hover:scale-[1.03] hover:bg-black/[0.04] active:scale-[0.97] rounded-md px-1 py-0.5 ${className}`}
      title={`Copiar: ${value}`}
    >
      {children}
      {copied ? (
        <span className="inline-flex items-center gap-0.5 font-body text-[9px] font-semibold text-status-success animate-in fade-in duration-[90ms]">
          <Check className="h-2.5 w-2.5" />
          Copiado
        </span>
      ) : (
        <Copy className="h-2.5 w-2.5 text-zinc-300 opacity-0 transition-opacity duration-120 group-hover/copy:opacity-100" />
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ExecutiveCompanyStrip — Faixa C (3 blocos: Empresa, Contato, Deal)
// ═══════════════════════════════════════════════════════════════════

function ExecutiveCompanyStrip({
  nomeFantasia,
  segmento,
  enderecoFormatado,
  telefoneEmpresa,
  emailEmpresa,
  website,
  instagramUrl,
  cardapioUrl,
  primaryContact,
  stage,
  temperature,
  responsibleName,
  responsibleId,
  suggestedTemperature,
  onStageChange,
  onTemperatureChange,
  onResponsibleChange,
  teamMembers,
  isLocked,
  stageBanner,
  onStageBannerDismiss,
}: {
  nomeFantasia: string;
  segmento: string;
  enderecoFormatado: string;
  telefoneEmpresa: string;
  emailEmpresa: string;
  website: string;
  instagramUrl: string;
  cardapioUrl: string;
  primaryContact: {
    nome: string;
    cargo: string;
    email: string;
    telefone: string;
  } | null;
  stage: PipelineStage;
  temperature: Temperature;
  responsibleName: string;
  responsibleId: string;
  suggestedTemperature?: Temperature;
  onStageChange: (s: PipelineStage) => void;
  onTemperatureChange: (t: Temperature) => void;
  onResponsibleChange: (id: string, name: string) => void;
  teamMembers: { id: string; name: string; avatar: string }[];
  isLocked: boolean;
  stageBanner: InlineBanner | null;
  onStageBannerDismiss: () => void;
}) {
  const [stripUpdatedLabel, setStripUpdatedLabel] = useState<string | null>(
    null,
  );
  const hasAnyLink = website || instagramUrl || cardapioUrl;
  const hasAnyContact = telefoneEmpresa || emailEmpresa || hasAnyLink;

  const showStripUpdate = useCallback((msg: string) => {
    setStripUpdatedLabel(msg);
    setTimeout(() => setStripUpdatedLabel(null), 1200);
  }, []);

  return (
    <div className="mt-3 animate-in fade-in slide-in-from-bottom-1 duration-[180ms] ease-out">
      <div className="rounded-xl border border-zinc-100/60 bg-gradient-to-b from-zinc-50/60 to-zinc-50/30 px-4 py-3 md:px-5 md:py-3.5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-4">
          {/* ─── Bloco A: Empresa & Links (5 cols) ─────────────────── */}
          <div className="md:col-span-5 min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand/8">
                <Building2 className="h-3.5 w-3.5 text-brand" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-[13px] font-bold text-black leading-tight">
                  {nomeFantasia || "Sem empresa vinculada"}
                </p>
                {segmento && (
                  <p className="truncate font-body text-[10px] text-zinc-400 leading-tight">
                    {segmento}
                  </p>
                )}
              </div>
            </div>

            {/* Endereço */}
            <div className="mt-1.5 pl-[38px]">
              {enderecoFormatado ? (
                <p
                  className="truncate font-body text-[10px] text-zinc-400 leading-tight"
                  title={enderecoFormatado}
                >
                  <MapPin className="mr-0.5 inline h-2.5 w-2.5 text-zinc-300 align-[-1px]" />
                  {enderecoFormatado}
                </p>
              ) : (
                <p className="font-body text-[10px] text-zinc-300 italic leading-tight">
                  <MapPin className="mr-0.5 inline h-2.5 w-2.5 text-zinc-200 align-[-1px]" />
                  Endereco nao informado
                </p>
              )}

              {/* Contact icons & links row */}
              {hasAnyContact ? (
                <div className="mt-1.5 flex flex-wrap items-center gap-0.5">
                  {telefoneEmpresa && (
                    <CopyButton
                      value={telefoneEmpresa}
                      className="!px-1 !py-0.5"
                    >
                      <Phone className="h-2.5 w-2.5 text-zinc-400" />
                      <span className="font-body text-[10px] text-zinc-500">
                        {telefoneEmpresa}
                      </span>
                    </CopyButton>
                  )}
                  {emailEmpresa && (
                    <CopyButton value={emailEmpresa} className="!px-1 !py-0.5">
                      <Mail className="h-2.5 w-2.5 text-zinc-400" />
                      <span className="truncate max-w-[120px] font-body text-[10px] text-zinc-500">
                        {emailEmpresa}
                      </span>
                    </CopyButton>
                  )}
                  {website && (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 font-body text-[10px] text-brand/70 transition-all duration-[120ms] hover:bg-brand/5 hover:text-brand hover:scale-[1.05] active:scale-[0.97]"
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                      Site
                    </a>
                  )}
                  {instagramUrl && (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 font-body text-[10px] text-brand/70 transition-all duration-[120ms] hover:bg-brand/5 hover:text-brand hover:scale-[1.05] active:scale-[0.97]"
                    >
                      <Instagram className="h-2.5 w-2.5" />
                      IG
                    </a>
                  )}
                  {cardapioUrl && (
                    <a
                      href={cardapioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 font-body text-[10px] text-brand/70 transition-all duration-[120ms] hover:bg-brand/5 hover:text-brand hover:scale-[1.05] active:scale-[0.97]"
                    >
                      <UtensilsCrossed className="h-2.5 w-2.5" />
                      Menu
                    </a>
                  )}
                </div>
              ) : (
                <p className="mt-1.5 font-body text-[10px] text-zinc-300 italic">
                  Sem links cadastrados
                </p>
              )}
            </div>
          </div>

          {/* ─── Bloco B: Contato Principal (4 cols) ───────────────── */}
          <div className="md:col-span-4 md:border-l md:border-zinc-200/30 md:pl-4 min-w-0">
            {primaryContact ? (
              <div className="group/contact relative">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                    <User className="h-3.5 w-3.5 text-zinc-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-heading text-[13px] font-semibold text-black leading-tight">
                      {primaryContact.nome}
                    </p>
                    <p className="truncate font-body text-[10px] text-zinc-400 leading-tight">
                      {primaryContact.cargo}
                    </p>
                  </div>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-0.5 pl-[36px]">
                  {primaryContact.email && (
                    <CopyButton
                      value={primaryContact.email}
                      className="!px-1 !py-0.5"
                    >
                      <Mail className="h-2.5 w-2.5 text-zinc-400" />
                      <span className="truncate max-w-[110px] font-body text-[10px] text-zinc-500">
                        {primaryContact.email}
                      </span>
                    </CopyButton>
                  )}
                  {primaryContact.telefone && (
                    <CopyButton
                      value={primaryContact.telefone}
                      className="!px-1 !py-0.5"
                    >
                      <Phone className="h-2.5 w-2.5 text-zinc-400" />
                      <span className="font-body text-[10px] text-zinc-500">
                        {primaryContact.telefone}
                      </span>
                    </CopyButton>
                  )}
                </div>
                <button className="absolute top-0 right-0 inline-flex items-center gap-0.5 rounded-md border border-zinc-200/50 bg-white px-1.5 py-0.5 font-body text-[9px] font-medium text-zinc-400 shadow-sm opacity-0 transition-all duration-[120ms] group-hover/contact:opacity-100 hover:text-brand hover:border-brand/20 active:scale-[0.98]">
                  <ChevronRight className="h-2 w-2" />
                  Abrir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                  <User className="h-3.5 w-3.5 text-zinc-300" />
                </div>
                <div>
                  <p className="font-body text-[10px] text-zinc-400">
                    Sem contato principal
                  </p>
                  <button className="mt-0.5 inline-flex items-center gap-0.5 font-body text-[10px] font-medium text-brand transition-colors hover:text-brand/80">
                    <Plus className="h-2.5 w-2.5" />
                    Definir contato
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ─── Bloco C: Operação do Deal (3 cols) ────────────────── */}
          <div className="md:col-span-3 md:border-l md:border-zinc-200/30 md:pl-4 min-w-0">
            <div className="relative space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <StageRail
                  currentStage={stage}
                  onStageChange={(s) => {
                    onStageChange(s);
                    showStripUpdate("Atualizado");
                  }}
                  disabled={isLocked}
                  statusBanner={stageBanner}
                  onBannerDismiss={onStageBannerDismiss}
                />
                <TemperatureSelect
                  current={temperature}
                  onChange={(t) => {
                    onTemperatureChange(t);
                    showStripUpdate("Atualizado");
                  }}
                  suggested={suggestedTemperature}
                  disabled={isLocked}
                />
              </div>
              <div className="flex items-center justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="group/owner flex items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-2 transition-colors duration-[140ms] hover:bg-white/80 active:scale-[0.98]">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[8px] font-bold text-white">
                        {getInitials(responsibleName)}
                      </div>
                      <span className="font-body text-[10px] text-zinc-500">
                        {responsibleName}
                      </span>
                      <Pencil className="h-2 w-2 text-zinc-300 opacity-0 transition-opacity duration-[140ms] group-hover/owner:opacity-100" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl min-w-[180px]"
                  >
                    {teamMembers.map((member) => (
                      <DropdownMenuItem
                        key={member.id}
                        onClick={() => {
                          onResponsibleChange(member.id, member.name);
                          showStripUpdate("Atualizado");
                        }}
                        className="flex items-center gap-2"
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[9px] font-bold text-zinc-600">
                          {getInitials(member.name)}
                        </div>
                        <span className="font-body text-xs">{member.name}</span>
                        {member.id === responsibleId && (
                          <Check className="ml-auto h-3.5 w-3.5 text-brand" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {stripUpdatedLabel && (
                <div className="absolute -top-1.5 right-0 inline-flex items-center gap-0.5 rounded-full bg-status-success/10 px-1.5 py-0.5 font-body text-[8px] font-semibold text-status-success animate-in fade-in duration-90">
                  <Check className="h-2 w-2" />
                  {stripUpdatedLabel}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// UI Helpers for Company Tab Refactor
// ═══════════════════════════════════════════════════════════════════

function PremiumCard({
  children,
  title,
  description,
  icon: Icon,
  delay = 0,
  successMessage,
  headerAction,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  icon: React.ElementType;
  delay?: number;
  successMessage?: string | null;
  headerAction?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: delay, ease: "easeOut" }}
      className="relative rounded-[20px] border border-zinc-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md group"
    >
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-3 right-5 z-20 flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-heading text-[11px] font-bold text-emerald-600 shadow-sm border border-emerald-100"
          >
            <Check className="h-3 w-3" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-zinc-50 text-zinc-400 group-hover:bg-brand/5 group-hover:text-brand transition-colors">
            <Icon className="h-5.5 w-5.5" />
          </div>
          <div>
            <h3 className="font-heading text-[15px] font-semibold tracking-tight text-zinc-900">
              {title}
            </h3>
            <p className="font-body text-[11px] text-zinc-400 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'call':
      return Phone;
    case 'meeting':
      return Users;
    case 'email':
      return Mail;
    case 'whatsapp':
      return MessageCircle;
    default:
      return Circle;
  }
};


// ═══════════════════════════════════════════════════════════════════
// Main Component — LeadCardDrawer (Premium)
// ═══════════════════════════════════════════════════════════════════

export default function LeadCardDrawer() {
  const { modalType, closeModal } = useUIStore();
  const isOpen = modalType === "lead-card";

  // ── Deal state ───────────────────────────────────────────────
  const [title, setTitle] = useState(mockLead.title);
  const [value, setValue] = useState(mockLead.value);
  const [monthlyValue, setMonthlyValue] = useState(mockLead.monthlyValue);
  const [stage, setStage] = useState<PipelineStage>(mockLead.stage);
  const [viewStage, setViewStage] = useState<PipelineStage>(mockLead.stage);

  // Sync viewStage when actual stage changes
  useEffect(() => {
    setViewStage(stage);
  }, [stage]);
  const [temperature, setTemperature] = useState<Temperature>(
    mockLead.temperature,
  );
  const [responsibleId, setResponsibleId] = useState(mockLead.responsibleId);
  const [responsibleName, setResponsibleName] = useState(
    mockLead.responsibleName,
  );
  const [tags, setTags] = useState(mockLead.tags);
  const [newTag, setNewTag] = useState("");
  const [contacts, setContacts] = useState(mockContacts);
  const [dealStatus, setDealStatus] = useState<DealStatus>("open");
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    mockLead.expectedCloseDate,
  );
  const [source] = useState(mockLead.source);

  // Company fields — neste funil, sem CNPJ e sem Razão Social
  const [nomeFantasia] = useState(mockLead.nomeFantasia);
  const [segmento] = useState(mockLead.segmento);
  const [cep, setCep] = useState(mockLead.cep);
  const [logradouro, setLogradouro] = useState(mockLead.logradouro);
  const [numero, setNumero] = useState(mockLead.numero);
  const [complemento, setComplemento] = useState(mockLead.complemento);
  const [bairro, setBairro] = useState(mockLead.bairro);
  const [cidade, setCidade] = useState(mockLead.cidade);
  const [estado, setEstado] = useState(mockLead.estado);
  const [cepLoading, setCepLoading] = useState(false);
  const [telefoneEmpresa] = useState(mockLead.telefoneEmpresa);
  const [emailEmpresa] = useState(mockLead.emailEmpresa);
  const [website, setWebsite] = useState(mockLead.website);
  const [instagramUrl, setInstagramUrl] = useState(mockLead.instagram);
  const [cardapioUrl, setCardapioUrl] = useState(mockLead.cardapio);

  // --- Company Refactor State ---
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [hoursMode, setHoursMode] = useState<"standard" | "daily">("daily");
  const [standardHours, setStandardHours] = useState({
    open: "08:00",
    close: "18:00",
  });
  const [dailyHours, setDailyHours] = useState<
    Record<string, { active: boolean; open: string; close: string; isClosed: boolean }>
  >(
    DAYS_OF_WEEK.reduce(
      (acc, day) => ({
        ...acc,
        [day.id]: {
          active: true,
          open: "08:00",
          close: "19:00",
          isClosed: false,
        },
      }),
      {},
    ),
  );
  const [sectionSuccess, setSectionSuccess] = useState<
    Record<string, string | null>
  >({
    localizacao: null,
    tipo: null,
    horario: null,
    online: null,
  });

  // --- Stage Fields State ---
  const [stageValues, setStageValues] = useState<Record<string, string | number | boolean | null | undefined>>(
    mockLead.metadata?.stageValues || {}
  );
  const [notes, setNotes] = useState(mockLead.notes || "");

  const handleUpdateStageField = (fieldId: string, val: string | number | boolean | null | undefined) => {
    setStageValues((prev) => ({ ...prev, [fieldId]: val }));
    // In a real app, debounce save or mutation here
  };

  // --- Company Refactor State ---

  const handleCepChange = async (val: string) => {
    const masked = maskCep(val);
    setCep(masked);

    const newVal = val.replace(/\D/g, "").slice(0, 8);

    if (newVal.length === 8) {
      setCepLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${newVal}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setLogradouro(data.logradouro || "");
          setBairro(data.bairro || "");
          setCidade(data.localidade || "");
          setEstado(data.uf || "");
          if (data.complemento) setComplemento(data.complemento);
          trackEvent("cep_lookup_success", { cep: newVal });
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setCepLoading(false);
      }
    }
  };

  const enderecoFormatado = useMemo(() => {
    const parts: string[] = [];
    if (logradouro) {
      parts.push(numero ? `${logradouro}, ${numero}` : logradouro);
    }
    if (complemento) parts.push(complemento);
    if (bairro) parts.push(bairro);
    if (cidade && estado) {
      parts.push(`${cidade} - ${estado}`);
    } else if (cidade) {
      parts.push(cidade);
    }
    return parts.join(", ");
  }, [logradouro, numero, complemento, bairro, cidade, estado]);

  // UI state
  const [headerBanner, setHeaderBanner] = useState<InlineBanner | null>(null);
  const [stageBanner, setStageBanner] = useState<InlineBanner | null>(null);
  const [showWinConfirm, setShowWinConfirm] = useState(false);
  const [showLostPanel, setShowLostPanel] = useState(false);
  const [isWinLoading, setIsWinLoading] = useState(false);
  const [isLostLoading, setIsLostLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Contact forms
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
  });
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editContact, setEditContact] = useState({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
  });

  // Computed
  const relatedActivities = useMemo(
    () => mockActivities.filter((a) => a.opportunityId === mockLead.id),
    [],
  );
  const leadScore = useMemo(
    () => calculateLeadScore(mockLead, relatedActivities),
    [relatedActivities],
  );
  const suggestedTemperature = useMemo(
    () => calculateTemperature(mockLead),
    [],
  );

  const isLocked = dealStatus !== "open";

  // Telemetry: view_opened
  useEffect(() => {
    if (isOpen) {
      trackEvent("view_opened", {
        entity_type: "deal",
        entity_id: mockLead.id,
      });
    }
  }, [isOpen]);

  // ── Handlers ─────────────────────────────────────────────────

  const handleStageChange = useCallback(
    (newStage: PipelineStage) => {
      if (isLocked) return;
      const prevStage = stage;
      trackEvent("stage_changed", {
        from_stage_id: prevStage,
        to_stage_id: newStage,
        entity_id: mockLead.id,
      });
      setStage(newStage);
      setStageBanner({ message: "Etapa atualizada", variant: "success" });
    },
    [stage, isLocked],
  );

  const handleMarkWon = useCallback(() => {
    trackEvent("mark_won_clicked", { entity_id: mockLead.id });
    setIsWinLoading(true);
    setTimeout(() => {
      setDealStatus("won");
      setShowWinConfirm(false);
      setIsWinLoading(false);
      setHeaderBanner({
        message: "Oportunidade marcada como ganho",
        variant: "success",
      });
      trackEvent("mark_won_succeeded", { entity_id: mockLead.id });
    }, 600);
  }, []);

  const handleMarkLost = useCallback((reason: string) => {
    trackEvent("mark_lost_clicked", { entity_id: mockLead.id, reason });
    setIsLostLoading(true);
    setTimeout(() => {
      setDealStatus("lost");
      setShowLostPanel(false);
      setIsLostLoading(false);
      setHeaderBanner({
        message: `Oportunidade marcada como perdida — ${reason}`,
        variant: "info",
      });
      trackEvent("mark_lost_succeeded", { entity_id: mockLead.id, reason });
    }, 600);
  }, []);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) =>
    setTags(tags.filter((t) => t !== tag));

  const handleAddContact = () => {
    if (newContact.nome.trim()) {
      setContacts([
        ...contacts,
        { id: `c${Date.now()}`, ...newContact, isPrimary: false },
      ]);
      setNewContact({ nome: "", email: "", telefone: "", cargo: "" });
      setShowAddContact(false);
    }
  };

  const handleDeleteContact = (id: string) =>
    setContacts(contacts.filter((c) => c.id !== id));

  const handleStartEditContact = (contact: (typeof mockContacts)[0]) => {
    setEditingContactId(contact.id);
    setEditContact({
      nome: contact.nome,
      email: contact.email,
      telefone: contact.telefone,
      cargo: contact.cargo,
    });
  };

  const handleSaveEditContact = () => {
    if (editingContactId && editContact.nome.trim()) {
      setContacts(
        contacts.map((c) =>
          c.id === editingContactId ? { ...c, ...editContact } : c,
        ),
      );
      setEditingContactId(null);
      setEditContact({ nome: "", email: "", telefone: "", cargo: "" });
    }
  };

  // --- Company Refactor Handlers ---
  const toggleType = (id: string) => {
    if (isLocked) return;
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const notifySuccess = (section: string) => {
    setSectionSuccess((prev) => ({ ...prev, [section]: "Salvo" }));
    setTimeout(() => {
      setSectionSuccess((prev) => ({ ...prev, [section]: null }));
    }, 1200);
  };

  const handleUpdateDailyHour = (
    dayId: string,
    field: string,
    value: string | boolean,
  ) => {
    if (isLocked) return;
    setDailyHours((prev) => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value },
    }));
  };

  // Status pill
  const statusCfg = statusConfig[dealStatus];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => closeModal()}>
        <DialogContent
          className="flex h-[90vh] !max-h-[90vh] w-[90vw] !max-w-[90vw] flex-col overflow-hidden rounded-[var(--radius-bento-card)] !gap-0 !p-0"
          showCloseButton={false}
        >
          {/* ═══════════════════════════════════════════════════════════
              HeaderStickyDeal — Premium 3-zone layout
              ═══════════════════════════════════════════════════════════ */}
          <div className="sticky top-0 z-10 border-b border-zinc-100/80 bg-white/97 backdrop-blur-md transition-shadow duration-[120ms]">
            <div className="px-5 pt-3 pb-2 md:px-6">
              {/* ─── Camada 1: Top Bar Compacta ────────────────────── */}
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {/* Breadcrumb — minimal */}
                  <nav
                    className="mb-1 flex items-center gap-1 font-body text-[10px] text-zinc-400"
                    aria-label="Breadcrumb"
                  >
                    <span>Pipes</span>
                    <ChevronRight className="h-2.5 w-2.5" aria-hidden="true" />
                    <span className="text-zinc-500">Pipeline Comercial</span>
                  </nav>

                  {/* Title row: Name + Score + Status */}
                  <div className="flex flex-wrap items-center gap-2">
                    <DialogTitle className="font-heading text-xl font-bold tracking-tight text-black sm:text-[22px] leading-tight">
                      <InlineEditable
                        value={title}
                        onSave={setTitle}
                        className="font-heading text-xl font-bold tracking-tight sm:text-[22px] leading-tight"
                        readOnly={isLocked}
                      />
                    </DialogTitle>

                    {leadScore > 0 && (
                      <div
                        className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-heading text-[10px] font-bold leading-none ${getScoreColor(leadScore)}`}
                        title={`Lead Score: ${leadScore} (${getScoreLabel(leadScore)})`}
                      >
                        <TrendingUp className="h-2 w-2" aria-hidden="true" />
                        {leadScore}
                      </div>
                    )}

                    <span
                      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-body text-[10px] font-medium transition-all duration-[140ms] ${statusCfg.color} ${statusCfg.bg}`}
                    >
                      {dealStatus === "won" && (
                        <Check className="h-2 w-2" aria-hidden="true" />
                      )}
                      {dealStatus === "lost" && (
                        <X className="h-2 w-2" aria-hidden="true" />
                      )}
                      {statusCfg.label}
                    </span>

                    {source && (
                      <span className="font-body text-[10px] text-zinc-400">
                        via {source}
                      </span>
                    )}
                  </div>
                </div>

                {/* ─── Actions: compact ──────────────────────────────── */}
                <div className="flex shrink-0 items-center gap-1">
                  {dealStatus === "open" && (
                    <>
                      <button
                        onClick={() => setShowWinConfirm(true)}
                        disabled={isWinLoading}
                        className="group/won inline-flex h-[34px] items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 font-heading text-[11px] font-semibold text-emerald-700 transition-all duration-[140ms] ease-out hover:border-emerald-500 hover:bg-emerald-600 hover:text-white hover:shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 disabled:pointer-events-none disabled:opacity-50"
                      >
                        {isWinLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" aria-hidden="true" />
                        )}
                        <span className="max-sm:hidden">Ganho</span>
                      </button>
                      <button
                        onClick={() => setShowLostPanel(true)}
                        disabled={isLostLoading}
                        className="group/lost inline-flex h-[34px] items-center gap-1 rounded-full border border-zinc-200/80 bg-white px-3 font-heading text-[11px] font-semibold text-zinc-500 transition-all duration-[140ms] ease-out hover:border-red-400 hover:bg-red-500 hover:text-white hover:shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/30 disabled:pointer-events-none disabled:opacity-50"
                      >
                        {isLostLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" aria-hidden="true" />
                        )}
                        <span className="max-sm:hidden">Perdido</span>
                      </button>
                    </>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition-all duration-[140ms] hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-[12px]">
                      <DropdownMenuItem>
                        <Calendar className="mr-2 h-4 w-4" />
                        Nova atividade
                      </DropdownMenuItem>
                      {dealStatus !== "open" && (
                        <DropdownMenuItem
                          onClick={() => {
                            setDealStatus("open");
                            setHeaderBanner({
                              message: "Oportunidade reaberta",
                              variant: "info",
                            });
                          }}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reabrir oportunidade
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-status-danger focus:text-status-danger"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <button
                    onClick={() => closeModal()}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition-all duration-[140ms] hover:bg-zinc-100 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                    aria-label="Fechar"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Header banners */}
              {headerBanner && (
                <div className="mt-2">
                  <InlineStatusBanner
                    banner={headerBanner}
                    onDismiss={() => setHeaderBanner(null)}
                  />
                </div>
              )}

              {showLostPanel && dealStatus === "open" && (
                <div className="mt-2">
                  <LostReasonPanel
                    onConfirm={handleMarkLost}
                    onCancel={() => setShowLostPanel(false)}
                    isLoading={isLostLoading}
                  />
                </div>
              )}

              {/* ─── Faixa C: Executive Company Strip ─────────────────── */}
              <ExecutiveCompanyStrip
                nomeFantasia={nomeFantasia}
                segmento={segmento}
                enderecoFormatado={enderecoFormatado}
                telefoneEmpresa={telefoneEmpresa}
                emailEmpresa={emailEmpresa}
                website={website}
                instagramUrl={instagramUrl}
                cardapioUrl={cardapioUrl}
                primaryContact={contacts.find((c) => c.isPrimary) ?? null}
                stage={stage}
                temperature={temperature}
                responsibleName={responsibleName}
                responsibleId={responsibleId}
                suggestedTemperature={suggestedTemperature}
                onStageChange={handleStageChange}
                onTemperatureChange={setTemperature}
                onResponsibleChange={(id, name) => {
                  setResponsibleId(id);
                  setResponsibleName(name);
                }}
                teamMembers={mockTeamMembers}
                isLocked={isLocked}
                stageBanner={stageBanner}
                onStageBannerDismiss={() => setStageBanner(null)}
              />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              Body — Split View (Desktop) / Stack (Mobile)
              ═══════════════════════════════════════════════════════════ */}
          <div className="flex min-h-0 flex-1">
            {/* ── Full-width content: Tabs ─────────────────────────── */}
            <div className="min-h-0 flex-1">
              <ScrollArea className="h-full">
                <div className="p-5 md:px-8 lg:px-10">
                    <Tabs defaultValue="empresa">
                    <TabsList className="inline-flex h-9 items-center justify-start rounded-full bg-zinc-100/80 p-1">
                      {[
                        { value: "empresa", label: "Empresa" },
                        { value: "contatos", label: "Contatos" },
                        { value: "visitas", label: "Visitas" },
                        { value: "atividades", label: "Atividades" },
                        { value: "anotacoes", label: "Anotações" },
                        { value: "linha-do-tempo", label: "Linha do Tempo" },
                      ].map((tab) => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="flex-none rounded-full px-4 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-wide text-zinc-500 transition-all duration-200 hover:text-zinc-700 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
                        >
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>



                    <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 pb-10">
                        {/* ── Left Column: Tab Content (Span 7) ── */}
                        <div className="md:col-span-12 lg:col-span-7 space-y-4">
                        
                        {/* ── Tab: Empresa ──────────────────────────────── */}
                        <TabsContent value="empresa" className="mt-0 space-y-4">
                            {/* ── Section: Classificação & Resumo (Moved from Values/Tags) ── */}
                            <PremiumCard
                              title="Classificação & Resumo"
                              description="Dados principais do negócio"
                              icon={Target}
                              delay={0}
                            >
                                <div className="space-y-6">
                                    {/* Row 1: Tags input & list */}
                                    <div className="space-y-3">
                                        <Label className="font-heading text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                            Tags
                                        </Label>
                                        {!isLocked && (
                                          <div className="flex items-center gap-2">
                                            <Input
                                              value={newTag}
                                              onChange={(e) => setNewTag(e.target.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  e.preventDefault();
                                                  handleAddTag();
                                                }
                                              }}
                                              placeholder="Nova tag..."
                                              className="h-8 flex-1 rounded-[10px] font-body text-xs"
                                            />
                                            <Button
                                              onClick={handleAddTag}
                                              className="h-8 w-8 rounded-full bg-brand p-0 text-white hover:bg-brand/90"
                                              size="icon"
                                            >
                                              <Plus className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                          {tags.length > 0 ? tags.map((tag) => (
                                            <Badge
                                              key={tag}
                                              variant="outline"
                                              className="gap-1.5 rounded-[6px] border-zinc-200 bg-zinc-50 py-1 pl-2 pr-1.5 font-body text-[10px] font-medium text-zinc-600"
                                            >
                                              {tag}
                                              {!isLocked && (
                                                <button
                                                  onClick={() => handleRemoveTag(tag)}
                                                  className="rounded-full p-0.5 transition-colors hover:bg-zinc-200"
                                                >
                                                  <X className="h-3 w-3 text-zinc-400" />
                                                </button>
                                              )}
                                            </Badge>
                                          )) : (
                                            <p className="font-body text-xs text-zinc-400 italic">Nenhuma tag</p>
                                          )}
                                        </div>
                                    </div>

                                    <div className="h-px bg-zinc-100" />

                                    {/* Row 2: Valores & Previsão */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <EditableField
                                          icon={<DollarSign className="h-3.5 w-3.5" />}
                                          label="Valor Total"
                                          value={formatCurrency(value)}
                                          onSave={(v) => {
                                            const num = Number(v.replace(/\D/g, ""));
                                            if (!isNaN(num)) setValue(num);
                                          }}
                                          readOnly={isLocked}
                                        />
                                        <EditableField
                                          icon={<DollarSign className="h-3.5 w-3.5" />}
                                          label="Valor Mensal"
                                          value={formatCurrency(monthlyValue)}
                                          onSave={(v) => {
                                            const num = Number(v.replace(/\D/g, ""));
                                            if (!isNaN(num)) setMonthlyValue(num);
                                          }}
                                          readOnly={isLocked}
                                        />
                                        <EditableField
                                          icon={<Calendar className="h-3.5 w-3.5" />}
                                          label="Previsão"
                                          value={expectedCloseDate}
                                          onSave={setExpectedCloseDate}
                                          type="date"
                                          readOnly={isLocked}
                                        />
                                        <EditableField
                                          icon={<Globe className="h-3.5 w-3.5" />}
                                          label="Fonte"
                                          value={source}
                                          onSave={() => {}}
                                          readOnly
                                        />
                                    </div>
                                    
                                    {/* Discount detection block */}
                                    {dealStatus === "open" &&
                                      (value < referenceSetup * 0.8 ||
                                        monthlyValue < referenceMRR * 0.9) && (
                                        <div className="flex items-start gap-3 rounded-[10px] border border-status-warning/20 bg-status-warning/5 p-3">
                                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" />
                                          <div className="flex-1">
                                            <p className="font-heading text-xs font-semibold text-status-warning">
                                              Desconto detectado
                                            </p>
                                            <div className="mt-1 space-y-0.5">
                                              {value < referenceSetup * 0.8 && (
                                                <p className="font-body text-[10px] text-status-warning">
                                                  Setup ({formatCurrency(value)}) &lt; Ref ({formatCurrency(referenceSetup)})
                                                </p>
                                              )}
                                              {monthlyValue < referenceMRR * 0.9 && (
                                                <p className="font-body text-[10px] text-status-warning">
                                                  MRR ({formatCurrency(monthlyValue)}) &lt; Ref ({formatCurrency(referenceMRR)})
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                </div>
                            </PremiumCard>

                            <PremiumCard
                              title="Localização"
                              description=""
                              icon={MapPin}
                              delay={0}
                              successMessage={sectionSuccess.localizacao}
                            >
                            <div className="space-y-4">
                                {/* Row 1: CEP | Endereço | Número */}
                                <div className="flex gap-2">
                                  <div className="w-[140px] flex-none">
                                    <Label className="mb-1.5 block font-heading text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                      CEP
                                    </Label>
                                    <div className="relative">
                                      <Input
                                        value={cep}
                                        onChange={(e) => handleCepChange(e.target.value)}
                                        placeholder="00000-000"
                                        className="h-9 rounded-lg border-zinc-200 bg-white font-body text-xs transition-all focus:border-brand focus:ring-2 focus:ring-brand/10"
                                        readOnly={isLocked}
                                        maxLength={9}
                                      />
                                      {cepLoading && (
                                        <Loader2 className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin text-brand" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <Label className="mb-1.5 block font-heading text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                      Endereço
                                    </Label>
                                    <Input
                                      value={logradouro}
                                      onChange={(e) => setLogradouro(e.target.value)}
                                      placeholder="Logradouro"
                                      className="h-9 rounded-lg border-zinc-200 bg-white font-body text-xs"
                                      readOnly={isLocked}
                                    />
                                  </div>
                                  <div className="w-[70px] flex-none">
                                    <Label className="mb-1.5 block font-heading text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                      Nº
                                    </Label>
                                    <Input
                                      value={numero}
                                      onChange={(e) =>
                                        setNumero(e.target.value.replace(/\D/g, ""))
                                      }
                                      placeholder="123"
                                      className="h-9 rounded-lg border-zinc-200 bg-white font-body text-xs"
                                      readOnly={isLocked}
                                    />
                                  </div>
                                </div>

                                {/* Row 2: Bairro | Cidade | UF */}
                                <div className="flex gap-2">
                                  <div className="flex-1 min-w-0">
                                    <Label className="mb-1.5 block font-heading text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                      Bairro
                                    </Label>
                                    <Input
                                      value={bairro}
                                      onChange={(e) => setBairro(e.target.value)}
                                      placeholder="Bairro"
                                      className="h-9 rounded-lg border-zinc-200 bg-white font-body text-xs"
                                      readOnly={isLocked}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <Label className="mb-1.5 block font-heading text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                      Cidade
                                    </Label>
                                    <Input
                                      value={cidade}
                                      onChange={(e) => setCidade(e.target.value)}
                                      placeholder="Cidade"
                                      className="h-9 rounded-lg border-zinc-200 bg-white font-body text-xs"
                                      readOnly={isLocked}
                                    />
                                  </div>
                                  <div className="w-[70px] flex-none">
                                    <Label className="mb-1.5 block font-heading text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                      UF
                                    </Label>
                                    <Select
                                      value={estado}
                                      onValueChange={setEstado}
                                      disabled={isLocked}
                                    >
                                      <SelectTrigger className="h-9 rounded-lg border-zinc-200 bg-white px-2 font-body text-xs font-medium focus:ring-brand/10">
                                        <SelectValue placeholder="UF" />
                                      </SelectTrigger>
                                      <SelectContent className="max-h-[220px]">
                                        {UF_LIST.map((uf) => (
                                          <SelectItem
                                            key={uf}
                                            value={uf}
                                            className="font-body text-xs"
                                          >
                                            {uf}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                          </div>
                        </PremiumCard>

                        {/* ── Section 2: Tipo ── */}
                        <PremiumCard
                          title="Tipo"
                          description=""
                          icon={Tag}
                          delay={0.06}
                          successMessage={sectionSuccess.tipo}
                        >
                          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                            {COMPANY_TYPES.map((type) => (
                              <button
                                key={type.id}
                                disabled={isLocked}
                                onClick={() => toggleType(type.id)}
                                className={cn(
                                  "group flex flex-col items-center gap-1.5 rounded-[12px] p-2.5 text-center transition-all duration-200",
                                  selectedTypes.includes(type.id)
                                    ? "bg-brand/5 border border-brand/20 text-brand shadow-sm"
                                    : "bg-zinc-50/50 border border-transparent text-zinc-400 hover:bg-zinc-100/80 hover:text-zinc-500",
                                  !isLocked && "active:scale-[0.96] hover:scale-[1.02]",
                                )}
                              >
                                <div
                                  className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                                    selectedTypes.includes(type.id)
                                      ? "bg-brand/10 text-brand"
                                      : "bg-white text-zinc-300 group-hover:text-zinc-400 shadow-sm",
                                  )}
                                >
                                  <type.icon className="h-4 w-4" />
                                </div>
                                <span className="font-heading text-[9px] font-bold tracking-tight uppercase line-clamp-2">
                                  {type.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </PremiumCard>

                        {/* ── Section 3: Horário de Funcionamento ── */}
                        <PremiumCard
                          title="Horário"
                          description=""
                          icon={Clock3}
                          delay={0.12}
                          successMessage={sectionSuccess.horario}
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <Label className="font-heading text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                              Configuração
                            </Label>
                             <div className="flex items-center gap-2">
                                <span className={cn("font-heading text-[10px] font-bold transition-colors", hoursMode === 'standard' ? "text-brand" : "text-zinc-300")}>PADRÃO</span>
                                <Switch 
                                  checked={hoursMode === 'daily'} 
                                  onCheckedChange={(v) => setHoursMode(v ? 'daily' : 'standard')} 
                                  className="scale-75 data-[state=checked]:bg-brand"
                                  disabled={isLocked}
                                />
                                <span className={cn("font-heading text-[10px] font-bold transition-colors", hoursMode === 'daily' ? "text-brand" : "text-zinc-300")}>DIÁRIO</span>
                             </div>
                          </div>

                           {hoursMode === "standard" ? (
                              <div className="grid grid-cols-2 gap-3">
                                  <div>
                                     <Label className="mb-1.5 block font-heading text-[9px] font-bold uppercase text-zinc-400">Abertura</Label>
                                     <Input 
                                        type="time" 
                                        value={standardHours.open} 
                                        onChange={(e) => setStandardHours(prev => ({...prev, open: e.target.value}))}
                                        className="h-9 rounded-lg border-zinc-200 bg-white font-body text-xs" 
                                        disabled={isLocked}
                                     />
                                  </div>
                                  <div>
                                     <Label className="mb-1.5 block font-heading text-[9px] font-bold uppercase text-zinc-400">Fechamento</Label>
                                     <Input 
                                        type="time" 
                                        value={standardHours.close} 
                                        onChange={(e) => setStandardHours(prev => ({...prev, close: e.target.value}))}
                                        className="h-9 rounded-lg border-zinc-200 bg-white font-body text-xs" 
                                        disabled={isLocked}
                                     />
                                  </div>
                              </div>
                           ) : (
                              <div className="space-y-1">
                                {DAYS_OF_WEEK.map(day => (
                                   <div key={day.id} className="flex items-center justify-between py-1">
                                      <div className="flex items-center gap-2">
                                         <Switch 
                                            checked={dailyHours[day.id].active} 
                                            onCheckedChange={(v) => handleUpdateDailyHour(day.id, "active", v)}
                                            className="scale-75 data-[state=checked]:bg-brand"
                                            disabled={isLocked} 
                                          />
                                         <span className="w-8 font-heading text-[10px] font-bold text-zinc-500 uppercase">{day.label.slice(0, 3)}</span>
                                      </div>
                                      {dailyHours[day.id].active ? (
                                         <div className="flex items-center gap-1.5">
                                            <Input 
                                                type="time" 
                                                value={dailyHours[day.id].open} 
                                                onChange={(e) => handleUpdateDailyHour(day.id, "open", e.target.value)}
                                                className="h-7 w-[60px] rounded-md border-zinc-200 p-1 text-center font-body text-[10px]" 
                                                disabled={isLocked}
                                            />
                                            <span className="text-zinc-300">-</span>
                                            <Input 
                                                type="time" 
                                                value={dailyHours[day.id].close}
                                                onChange={(e) => handleUpdateDailyHour(day.id, "close", e.target.value)}
                                                className="h-7 w-[60px] rounded-md border-zinc-200 p-1 text-center font-body text-[10px]"
                                                disabled={isLocked}
                                            />
                                         </div>
                                      ) : <span className="font-heading text-[9px] font-bold uppercase text-zinc-300">Fechado</span>}
                                   </div>
                                ))}
                              </div>
                           )}
                        </PremiumCard>

                        {/* ── Section 4: Presença Online ── */}
                        <PremiumCard
                          title="Online"
                          description=""
                          icon={Globe2}
                          delay={0.18}
                          successMessage={sectionSuccess.online}
                        >
                          <div className="space-y-3">
                            {[
                              {
                                id: "site",
                                label: "Site",
                                icon: Globe,
                                value: website,
                                setter: setWebsite,
                              },
                              {
                                id: "ig",
                                label: "Instagram",
                                icon: Instagram,
                                value: instagramUrl,
                                setter: setInstagramUrl,
                              },
                              {
                                id: "menu",
                                label: "Cardápio",
                                icon: UtensilsCrossed,
                                value: cardapioUrl,
                                setter: setCardapioUrl,
                              },
                            ].map((channel) => (
                              <div key={channel.id} className="group/field relative">
                                <Label className="font-heading text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                  {channel.label}
                                </Label>
                                <div className="relative mt-1.5 flex items-center">
                                  <div className="absolute left-3 flex items-center gap-1.5 text-zinc-300">
                                    <channel.icon className="h-3.5 w-3.5" />
                                  </div>
                                  <Input
                                    value={channel.value}
                                    onChange={(e) => channel.setter(e.target.value)}
                                    placeholder={channel.id === "menu" ? "URL" : "URL"}
                                    className="h-9 rounded-lg border-zinc-200 pl-9 pr-8 font-body text-xs transition-all focus:border-brand focus:ring-2 focus:ring-brand/10"
                                    disabled={isLocked}
                                  />
                                  <AnimatePresence>
                                    {channel.value && (
                                      <motion.button
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        onClick={() =>
                                          window.open(
                                            channel.value.startsWith("http")
                                              ? channel.value
                                              : `https://${channel.value}`,
                                            "_blank",
                                          )
                                        }
                                        className="absolute right-2 h-6 rounded-md bg-zinc-900 px-2 font-heading text-[9px] font-bold text-white shadow-sm transition-all hover:bg-black active:scale-[0.97]"
                                      >
                                        Visitar
                                      </motion.button>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            ))}
                          </div>
                        </PremiumCard>

                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={() => {
                                notifySuccess("localizacao");
                                notifySuccess("tipo");
                                notifySuccess("horario");
                                notifySuccess("online");
                                }}
                                className="h-10 rounded-full bg-black px-6 font-heading text-xs font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                            >
                                Salvar Alterações
                            </Button>
                        </div>

                        </TabsContent>

                        {/* ── Tab: Contatos ─────────────────────────────── */}
                        <TabsContent value="contatos" className="mt-0">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-heading text-sm font-semibold text-black">
                          Contatos ({contacts.length})
                        </h3>
                        {!isLocked && (
                          <Button
                            onClick={() => setShowAddContact(true)}
                            className="rounded-full bg-brand font-heading text-xs text-white hover:bg-brand/90"
                            size="sm"
                          >
                            <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar
                          </Button>
                        )}
                      </div>

                      {showAddContact && (
                        <div className="mb-4 space-y-3 rounded-[14px] border border-zinc-200 p-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="font-body text-[10px] uppercase tracking-wider text-zinc-400">
                                Nome
                              </Label>
                              <Input
                                value={newContact.nome}
                                onChange={(e) =>
                                  setNewContact({
                                    ...newContact,
                                    nome: e.target.value,
                                  })
                                }
                                className="mt-1 h-8 rounded-[10px] font-body text-sm"
                                placeholder="Nome"
                              />
                            </div>
                            <div>
                              <Label className="font-body text-[10px] uppercase tracking-wider text-zinc-400">
                                Cargo
                              </Label>
                              <Input
                                value={newContact.cargo}
                                onChange={(e) =>
                                  setNewContact({
                                    ...newContact,
                                    cargo: e.target.value,
                                  })
                                }
                                className="mt-1 h-8 rounded-[10px] font-body text-sm"
                                placeholder="Cargo"
                              />
                            </div>
                            <div>
                              <Label className="font-body text-[10px] uppercase tracking-wider text-zinc-400">
                                E-mail
                              </Label>
                              <Input
                                type="email"
                                value={newContact.email}
                                onChange={(e) =>
                                  setNewContact({
                                    ...newContact,
                                    email: e.target.value,
                                  })
                                }
                                className="mt-1 h-8 rounded-[10px] font-body text-sm"
                                placeholder="email@empresa.com"
                              />
                            </div>
                            <div>
                              <Label className="font-body text-[10px] uppercase tracking-wider text-zinc-400">
                                Telefone
                              </Label>
                              <PhoneInput
                                value={newContact.telefone}
                                onValueChange={(raw) =>
                                  setNewContact({
                                    ...newContact,
                                    telefone: raw,
                                  })
                                }
                                className="mt-1 h-8 rounded-[10px] font-body text-sm"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full font-heading text-xs"
                              onClick={() => setShowAddContact(false)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              className="rounded-full bg-brand font-heading text-xs text-white hover:bg-brand/90"
                              onClick={handleAddContact}
                            >
                              Salvar
                            </Button>
                          </div>
                        </div>
                      )}

                      {contacts.length === 0 ? (
                        <div className="flex flex-col items-center py-8 text-center">
                          <User className="h-8 w-8 text-zinc-200" />
                          <p className="mt-2 font-body text-sm text-zinc-400">
                            Sem contatos vinculados
                          </p>
                          {!isLocked && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="mt-2 rounded-full font-body text-xs text-brand"
                              onClick={() => setShowAddContact(true)}
                            >
                              <Plus className="mr-1 h-3.5 w-3.5" /> Vincular
                              contato
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {contacts.map((contact) =>
                            editingContactId === contact.id ? (
                              <div
                                key={contact.id}
                                className="space-y-3 rounded-[14px] border border-brand/20 bg-brand/5 p-4"
                              >
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label className="font-body text-[10px] uppercase tracking-wider text-zinc-400">
                                      Nome
                                    </Label>
                                    <Input
                                      value={editContact.nome}
                                      onChange={(e) =>
                                        setEditContact({
                                          ...editContact,
                                          nome: e.target.value,
                                        })
                                      }
                                      className="mt-1 h-8 rounded-[10px] font-body text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="font-body text-[10px] uppercase tracking-wider text-zinc-400">
                                      Cargo
                                    </Label>
                                    <Input
                                      value={editContact.cargo}
                                      onChange={(e) =>
                                        setEditContact({
                                          ...editContact,
                                          cargo: e.target.value,
                                        })
                                      }
                                      className="mt-1 h-8 rounded-[10px] font-body text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="font-body text-[10px] uppercase tracking-wider text-zinc-400">
                                      E-mail
                                    </Label>
                                    <Input
                                      type="email"
                                      value={editContact.email}
                                      onChange={(e) =>
                                        setEditContact({
                                          ...editContact,
                                          email: e.target.value,
                                        })
                                      }
                                      className="mt-1 h-8 rounded-[10px] font-body text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="font-body text-[10px] uppercase tracking-wider text-zinc-400">
                                      Telefone
                                    </Label>
                                    <PhoneInput
                                      value={editContact.telefone}
                                      onValueChange={(raw) =>
                                        setEditContact({
                                          ...editContact,
                                          telefone: raw,
                                        })
                                      }
                                      className="mt-1 h-8 rounded-[10px] font-body text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full font-heading text-xs"
                                    onClick={() => {
                                      setEditingContactId(null);
                                      setEditContact({
                                        nome: "",
                                        email: "",
                                        telefone: "",
                                        cargo: "",
                                      });
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="rounded-full bg-brand font-heading text-xs text-white hover:bg-brand/90"
                                    onClick={handleSaveEditContact}
                                  >
                                    Salvar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <ContactCard
                                key={contact.id}
                                contact={contact}
                                onEdit={() => handleStartEditContact(contact)}
                                onDelete={() => handleDeleteContact(contact.id)}
                              />
                            ),
                          )}
                        </div>
                      )}
                        </TabsContent>



                        {/* ── Tab: Visitas ──────────────────────────────── */}
                        <TabsContent value="visitas" className="mt-0 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-heading text-sm font-semibold text-zinc-700">Visitas Agendadas</h3>
                                <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-full text-xs">
                                    <Plus className="h-3.5 w-3.5" />
                                    Nova Visita
                                </Button>
                            </div>
                            
                            <div className="space-y-3">
                                {mockVisits.map((visit) => (
                                    <div key={visit.id} className="group relative flex gap-3 rounded-2xl border border-zinc-100 bg-white p-4 transition-all hover:border-zinc-200 hover:shadow-sm">
                                        <div className={cn(
                                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                                            visit.type === 'presencial' 
                                                ? "border-purple-100 bg-purple-50 text-purple-600" 
                                                : "border-blue-100 bg-blue-50 text-blue-600"
                                        )}>
                                            {visit.type === 'presencial' ? <MapPin className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-heading text-sm font-semibold text-zinc-900">
                                                        {visit.type === 'presencial' ? 'Visita Presencial' : 'Reunião Remota'}
                                                    </p>
                                                    <p className="text-xs text-zinc-500">{visit.location}</p>
                                                </div>
                                                <Badge variant="secondary" className={cn(
                                                    "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                                                    visit.status === 'agendada' && "bg-amber-50 text-amber-600 hover:bg-amber-100",
                                                    visit.status === 'realizada' && "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
                                                )}>
                                                    {visit.status}
                                                </Badge>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 text-xs text-zinc-400">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {visit.date}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <UserCircle className="h-3.5 w-3.5" />
                                                    {visit.responsible}
                                                </div>
                                            </div>

                                            {visit.result && (
                                                <div className="mt-2 rounded-lg bg-zinc-50 p-2 text-xs text-zinc-600">
                                                    <span className="font-semibold">Resultado:</span> {visit.result}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* ── Tab: Atividades ───────────────────────────── */}
                        <TabsContent value="atividades" className="mt-0 space-y-4">
                             <div className="flex items-center justify-between">
                                <h3 className="font-heading text-sm font-semibold text-zinc-700">Atividades</h3>
                                <div className="flex gap-2">
                                     <Button size="sm" variant="outline" className="h-8 w-8 rounded-full p-0">
                                        <Filter className="h-3.5 w-3.5" />
                                     </Button>
                                    <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-full text-xs">
                                        <Plus className="h-3.5 w-3.5" />
                                        Nova
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {mockActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-white p-3 transition-all hover:border-zinc-200">
                                        <div className={cn(
                                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                                            activity.status === 'completed' ? "border-zinc-100 bg-zinc-50 text-zinc-400" : "border-brand/10 bg-brand/5 text-brand"
                                        )}>
                                           {(() => {
                                                const Icon = getActivityIcon(activity.type);
                                                return <Icon className="h-4 w-4" />;
                                            })()}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between">
                                                <p className={cn("font-heading text-sm font-medium", activity.status === 'completed' ? "text-zinc-500 line-through" : "text-zinc-900")}>
                                                    {activity.title}
                                                </p>
                                                <div className="flex gap-1">
                                                     <button className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-300 hover:bg-zinc-100 hover:text-zinc-600">
                                                        <CheckCircle className="h-4 w-4" />
                                                     </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-zinc-400">
                                                <span className={cn(
                                                    "flex items-center gap-1",
                                                    activity.status === 'late' && "text-red-500 font-medium"
                                                )}>
                                                    <Clock className="h-3 w-3" />
                                                    {activity.date}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <UserCircle className="h-3 w-3" />
                                                    {activity.responsible}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* ── Tab: Anotações ────────────────────────────── */}
                        <TabsContent value="anotacoes" className="mt-0 space-y-6">
                            {/* Editor Principal */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Nova Nota</label>
                                <NotesCard 
                                    initialNotes={notes}
                                    onNotesChange={setNotes}
                                />
                            </div>

                            <Separator />

                            {/* Feed de Histórico */}
                            <div className="space-y-4">
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Histórico</label>
                                <div className="space-y-4 pl-2">
                                    {mockNoteHistory.map((note) => (
                                        <div key={note.id} className="relative border-l border-zinc-100 pl-6 pb-2 last:pb-0">
                                            <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full border border-zinc-100 bg-zinc-50" />
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-heading text-xs font-semibold text-zinc-700">{note.author}</span>
                                                    <span className="text-[10px] text-zinc-400">{note.date}</span>
                                                </div>
                                                <p className="font-body text-sm text-zinc-600 leading-relaxed">
                                                    {note.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        {/* ── Tab: Linha do Tempo (NEW - replaced Historico) ── */}
                        <TabsContent value="linha-do-tempo" className="mt-0 space-y-4">
                            <TimelinePremium events={mockTimeline} />
                        </TabsContent>
                        </div>

                        {/* ── Right Column: Persistent Sidebar (Span 5) ── */}
                        <div className="md:col-span-12 lg:col-span-5 space-y-4">
                            <div className="sticky top-4">
                                <PremiumCard
                                    title="Campos da Etapa"
                                    description="Campos específicos desta etapa"
                                    icon={LayoutList}
                                    delay={0.2}
                                    headerAction={
                                        <div className="w-[180px]">
                                            <Select
                                                value={viewStage || "lead-in"}
                                                onValueChange={(val) => setViewStage(val as PipelineStage)}
                                                disabled={isLocked}
                                            >
                                                <SelectTrigger className="h-8 w-full rounded-lg border-zinc-200 bg-white font-body text-xs font-medium focus:ring-brand/10">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent align="end">
                                                    <SelectItem value="lead-in">Lead In</SelectItem>
                                                    <SelectItem value="contato-feito">Contato Feito</SelectItem>
                                                    <SelectItem value="reuniao-agendada">Reunião Agendada</SelectItem>
                                                    <SelectItem value="proposta-enviada">Proposta Enviada</SelectItem>
                                                    <SelectItem value="negociacao">Negociação</SelectItem>
                                                    <SelectItem value="fechamento">Fechamento</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    }
                                >
                                    <div className="space-y-4">

                                        <div className="h-px bg-zinc-100" />

                                        {/* Dynamic Fields */}
                                        <div className="space-y-4">
                                            {(stageFieldsConfig[viewStage] || stageFieldsConfig["lead-in"]).map((field) => (
                                                <div key={field.id}>
                                                    <Label className="font-heading text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                                    </Label>
                                                    <div className="mt-1.5">
                                                        {field.type === "select" ? (
                                                            <Select
                                                                value={String(stageValues[field.id] || "")}
                                                                onValueChange={(val) => handleUpdateStageField(field.id, val)}
                                                                disabled={isLocked}
                                                            >
                                                                <SelectTrigger className="h-9 w-full rounded-lg border-zinc-200 font-body text-xs focus:ring-brand/10">
                                                                    <SelectValue placeholder="Selecione..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {field.options?.map((opt) => (
                                                                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                                                            {opt.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        ) : field.type === "textarea" ? (
                                                            <Textarea 
                                                                value={String(stageValues[field.id] || "")}
                                                                onChange={(e) => handleUpdateStageField(field.id, e.target.value)}
                                                                className="flex min-h-[80px] w-full rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/10 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                                                placeholder={field.placeholder}
                                                                disabled={isLocked}
                                                            />
                                                        ) : (
                                                            <Input 
                                                                type={field.type === "number" || field.type === "currency" ? "text" : field.type}
                                                                value={String(stageValues[field.id] || "")}
                                                                onChange={(e) => handleUpdateStageField(field.id, e.target.value)}
                                                                placeholder={field.placeholder}
                                                                className="h-9 rounded-lg border-zinc-200 font-body text-xs focus:ring-brand/10"
                                                                disabled={isLocked}
                                                            />
                                                        )}
                                                    </div>
                                                    {field.helperText && (
                                                        <p className="mt-1 text-[9px] text-zinc-400">{field.helperText}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Empty State / Message */}
                                        {(!stageFieldsConfig[viewStage] || stageFieldsConfig[viewStage].length === 0) && (
                                            <div className="flex flex-col items-center justify-center py-8 text-center bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
                                                <LayoutList className="h-8 w-8 text-zinc-200 mb-2" />
                                                <p className="font-heading text-xs font-medium text-zinc-400">Nenhum campo específico</p>
                                            </div>
                                        )}
                                    </div>
                                </PremiumCard>


                            </div>
                        </div>
                    </div>
                  </Tabs>
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════
          Win Confirmation
          ═══════════════════════════════════════════════════════════ */}
      <AlertDialog open={showWinConfirm} onOpenChange={setShowWinConfirm}>
        <AlertDialogContent className="rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-xl">
              Marcar como ganho?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body text-sm text-zinc-600">
              Marcar como ganho encerra a oportunidade. Edicoes sensiveis serao
              bloqueadas. Voce quer continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full" disabled={isWinLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkWon}
              disabled={isWinLoading}
              className="rounded-full bg-status-success text-white hover:bg-status-success/90"
            >
              {isWinLoading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-1.5 h-4 w-4" />
              )}
              Sim, marcar como ganho
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ═══════════════════════════════════════════════════════════
          Delete Confirmation
          ═══════════════════════════════════════════════════════════ */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-[20px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-xl">
              Excluir oportunidade?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body text-sm text-zinc-600">
              Esta acao nao pode ser desfeita. Todos os dados desta oportunidade
              serao removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteConfirm(false);
                closeModal();
              }}
              className="rounded-full bg-status-danger text-white hover:bg-status-danger/90"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
