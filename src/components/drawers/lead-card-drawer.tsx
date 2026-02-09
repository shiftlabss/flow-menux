"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  X,
  Phone,
  Mail,
  Calendar,
  Tag,
  DollarSign,
  User,
  Clock,
  Flame,
  Thermometer,
  Snowflake,
  MessageSquare,
  Paperclip,
  History,
  MoreHorizontal,
  Building2,
  Plus,
  Trash2,
  Star,
  ChevronRight,
  Check,
  Pencil,
  Globe,
  MapPin,
  Briefcase,
  TrendingUp,
  FileText,
  ArrowRight,
  AlertTriangle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/masked-inputs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUIStore } from "@/stores/ui-store";
import { toast } from "sonner";
import type { Temperature, PipelineStage } from "@/types";
import { calculateLeadScore, calculateTemperature } from "@/lib/business-rules";
import { mockActivities } from "@/lib/mock-data";

// ── Discount reference values ───────────────────────────────────────────────
const referenceSetup = 15000;
const referenceMRR = 1200;

// ── Temperature config ──────────────────────────────────────────────────────
const temperatureConfig: Record<
  Temperature,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  hot: {
    label: "Quente",
    icon: <Flame className="h-4 w-4" />,
    color: "text-status-danger",
    bg: "bg-status-danger-light",
  },
  warm: {
    label: "Morna",
    icon: <Thermometer className="h-4 w-4" />,
    color: "text-status-warning",
    bg: "bg-status-warning-light",
  },
  cold: {
    label: "Fria",
    icon: <Snowflake className="h-4 w-4" />,
    color: "text-status-info",
    bg: "bg-status-info-light",
  },
};

// ── Stage config ────────────────────────────────────────────────────────────
const stageConfig: { id: PipelineStage; label: string }[] = [
  { id: "lead-in", label: "Lead-In" },
  { id: "contato-feito", label: "Contato Feito" },
  { id: "reuniao-agendada", label: "Reuniao Agendada" },
  { id: "proposta-enviada", label: "Proposta Enviada" },
  { id: "negociacao", label: "Negociacao" },
  { id: "fechamento", label: "Fechamento" },
];

// ── Mock data ───────────────────────────────────────────────────────────────
const mockLead = {
  id: "1",
  title: "Restaurante Bela Vista",
  clientName: "Restaurante Bela Vista Ltda",
  cnpj: "12.345.678/0001-00",
  razaoSocial: "Restaurante Bela Vista Ltda ME",
  endereco: "Rua das Flores, 123 - Jardim Paulista, Sao Paulo - SP",
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
  notes: "Cliente muito interessado. Agendar reuniao de apresentacao do modulo financeiro.",
  groupName: null,
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
    id: "t2",
    type: "activity",
    message: "Ligacao realizada - primeiro contato com Joao Silva",
    user: "Maria Silva",
    date: "16/01/2026 14:30",
  },
  {
    id: "t3",
    type: "stage-change",
    message: "Movido de Lead-In para Contato Feito",
    user: "Maria Silva",
    date: "16/01/2026 14:35",
  },
  {
    id: "t4",
    type: "note",
    message: "Cliente muito interessado, pedir proposta urgente",
    user: "Maria Silva",
    date: "20/01/2026 09:15",
  },
  {
    id: "t5",
    type: "tag-added",
    message: "Tag 'premium' adicionada",
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

function formatCurrency(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(value);
}

function getScoreColor(score: number) {
  if (score >= 70) return "bg-status-success text-white";
  if (score >= 40) return "bg-status-warning text-white";
  return "bg-status-danger text-white";
}

function getTimelineIcon(type: string) {
  switch (type) {
    case "created":
      return <Plus className="h-3.5 w-3.5" />;
    case "activity":
      return <Calendar className="h-3.5 w-3.5" />;
    case "stage-change":
      return <ArrowRight className="h-3.5 w-3.5" />;
    case "note":
      return <FileText className="h-3.5 w-3.5" />;
    case "tag-added":
      return <Tag className="h-3.5 w-3.5" />;
    case "value-change":
      return <DollarSign className="h-3.5 w-3.5" />;
    case "temperature-change":
      return <Flame className="h-3.5 w-3.5" />;
    default:
      return <Clock className="h-3.5 w-3.5" />;
  }
}

// ── Inline Editable Field ───────────────────────────────────────────────────
function InlineEditable({
  value,
  onSave,
  className = "",
  inputClassName = "",
  type = "text",
}: {
  value: string;
  onSave: (val: string) => void;
  className?: string;
  inputClassName?: string;
  type?: string;
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

  if (editing) {
    return (
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
        className={`h-8 rounded-[15px] font-body text-sm ${inputClassName}`}
      />
    );
  }

  return (
    <span
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={`cursor-pointer rounded-lg px-1.5 py-0.5 transition-colors hover:bg-zinc-100 ${className}`}
      title="Clique para editar"
    >
      {value}
    </span>
  );
}

// ── Stage Selector ──────────────────────────────────────────────────────────
function StageSelector({
  currentStage,
  onStageChange,
  disabled = false,
}: {
  currentStage: PipelineStage;
  onStageChange: (stage: PipelineStage) => void;
  disabled?: boolean;
}) {
  const currentIndex = stageConfig.findIndex((s) => s.id === currentStage);

  return (
    <div
      className={`flex items-center gap-1 ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      {stageConfig.map((stage, i) => {
        const isActive = stage.id === currentStage;
        const isPast = i < currentIndex;

        return (
          <button
            key={stage.id}
            onClick={() => onStageChange(stage.id)}
            disabled={disabled}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 font-body text-xs font-medium transition-all ${
              isActive
                ? "bg-brand text-white shadow-sm"
                : isPast
                  ? "bg-brand/10 text-brand"
                  : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600"
            }`}
          >
            {isPast && <Check className="h-3 w-3" />}
            {stage.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Temperature Selector ────────────────────────────────────────────────────
function TemperatureSelector({
  current,
  onChange,
}: {
  current: Temperature;
  onChange: (t: Temperature) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {(["hot", "warm", "cold"] as Temperature[]).map((temp) => {
        const cfg = temperatureConfig[temp];
        const isSelected = current === temp;
        return (
          <button
            key={temp}
            onClick={() => onChange(temp)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-body text-xs font-medium transition-all ${
              isSelected
                ? `${cfg.bg} ${cfg.color}`
                : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100"
            }`}
            title={cfg.label}
          >
            {cfg.icon}
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Score Display ───────────────────────────────────────────────────────────
function ScoreDisplay({ score }: { score: number }) {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-[10px] px-2.5 py-1 font-heading text-xs font-bold ${getScoreColor(score)}`}
    >
      <TrendingUp className="h-3 w-3" />
      {score}
    </div>
  );
}

// ── Owner Avatar with Reassign ──────────────────────────────────────────────
function OwnerSelector({
  currentId,
  currentName,
  teamMembers,
  onReassign,
}: {
  currentId: string;
  currentName: string;
  teamMembers: { id: string; name: string; avatar: string }[];
  onReassign: (id: string, name: string) => void;
}) {
  const initials = currentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full px-2 py-1 transition-colors hover:bg-zinc-100">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
            {initials}
          </div>
          <span className="font-body text-sm font-medium text-black">
            {currentName}
          </span>
          <Pencil className="h-3 w-3 text-zinc-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="rounded-[15px]">
        {teamMembers.map((member) => (
          <DropdownMenuItem
            key={member.id}
            onClick={() => onReassign(member.id, member.name)}
            className="flex items-center gap-2"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold text-zinc-600">
              {member.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <span className="font-body text-sm">{member.name}</span>
            {member.id === currentId && (
              <Check className="ml-auto h-4 w-4 text-brand" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Contact Card ────────────────────────────────────────────────────────────
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
    <div className="flex items-start justify-between rounded-[15px] border border-zinc-200 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100">
          <User className="h-5 w-5 text-zinc-500" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-heading text-sm font-semibold text-black">
              {contact.nome}
            </p>
            {contact.isPrimary && (
              <Badge className="gap-1 rounded-[10px] bg-brand-light text-brand font-body text-[10px]">
                <Star className="h-3 w-3" />
                Principal
              </Badge>
            )}
          </div>
          <p className="font-body text-xs text-zinc-500">{contact.cargo}</p>
          <div className="mt-1.5 flex items-center gap-3">
            <span className="flex items-center gap-1 font-body text-xs text-zinc-500">
              <Mail className="h-3 w-3" />
              {contact.email}
            </span>
            <span className="flex items-center gap-1 font-body text-xs text-zinc-500">
              <Phone className="h-3 w-3" />
              {contact.telefone}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-400 hover:text-zinc-600"
          onClick={onEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-400 hover:text-status-danger"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export function LeadCardDrawer() {
  const { drawerType, closeDrawer, openModal } = useUIStore();
  const isOpen = drawerType === "lead-card";

  // Editable state
  const [title, setTitle] = useState(mockLead.title);
  const [value, setValue] = useState(mockLead.value);
  const [monthlyValue, setMonthlyValue] = useState(mockLead.monthlyValue);
  const [stage, setStage] = useState<PipelineStage>(mockLead.stage);
  const [temperature, setTemperature] = useState<Temperature>(mockLead.temperature);
  const [responsibleId, setResponsibleId] = useState(mockLead.responsibleId);
  const [responsibleName, setResponsibleName] = useState(mockLead.responsibleName);
  const [notes, setNotes] = useState(mockLead.notes);
  const [tags, setTags] = useState(mockLead.tags);
  const [newTag, setNewTag] = useState("");
  const [contacts, setContacts] = useState(mockContacts);

  // Computed business rules
  const relatedActivities = useMemo(
    () => mockActivities.filter((a) => a.opportunityId === mockLead.id),
    []
  );
  const leadScore = useMemo(
    () => calculateLeadScore(mockLead, relatedActivities),
    [relatedActivities]
  );
  const suggestedTemperature = useMemo(
    () => calculateTemperature(mockLead),
    []
  );

  // Company editable fields
  const [cnpj, setCnpj] = useState(mockLead.cnpj);
  const [razaoSocial, setRazaoSocial] = useState(mockLead.razaoSocial);
  const [endereco, setEndereco] = useState(mockLead.endereco);
  const [telefoneEmpresa, setTelefoneEmpresa] = useState(mockLead.telefoneEmpresa);
  const [emailEmpresa, setEmailEmpresa] = useState(mockLead.emailEmpresa);

  // Valores editable fields
  const [expectedCloseDate, setExpectedCloseDate] = useState(mockLead.expectedCloseDate);
  const [source, setSource] = useState(mockLead.source);
  const [currency, setCurrency] = useState(mockLead.currency);

  // Approval state
  const [isAwaitingApproval, setIsAwaitingApproval] = useState(false);

  // Contact add form
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
  });

  // Contact edit
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editContact, setEditContact] = useState({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
  });

  // Discount detection logic
  const hasSetupDiscount = value < referenceSetup * 0.8;
  const hasMRRDiscount = monthlyValue < referenceMRR * 0.9;
  const hasDiscountDetected = hasSetupDiscount || hasMRRDiscount;

  function handleAddTag() {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag("");
    }
  }

  function handleRemoveTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleAddContact() {
    if (newContact.nome.trim()) {
      setContacts([
        ...contacts,
        {
          id: `c${Date.now()}`,
          ...newContact,
          isPrimary: false,
        },
      ]);
      setNewContact({ nome: "", email: "", telefone: "", cargo: "" });
      setShowAddContact(false);
    }
  }

  function handleDeleteContact(id: string) {
    setContacts(contacts.filter((c) => c.id !== id));
  }

  function handleStartEditContact(contact: (typeof mockContacts)[0]) {
    setEditingContactId(contact.id);
    setEditContact({
      nome: contact.nome,
      email: contact.email,
      telefone: contact.telefone,
      cargo: contact.cargo,
    });
  }

  function handleSaveEditContact() {
    if (editingContactId && editContact.nome.trim()) {
      setContacts(
        contacts.map((c) =>
          c.id === editingContactId ? { ...c, ...editContact } : c
        )
      );
      toast.success("Contato atualizado!", {
        description: `Os dados de ${editContact.nome} foram salvos.`,
      });
      setEditingContactId(null);
      setEditContact({ nome: "", email: "", telefone: "", cargo: "" });
    }
  }

  function handleRequestApproval() {
    setIsAwaitingApproval(true);
    toast.warning("Solicitacao de aprovacao enviada. Aguardando resposta do gestor.");
  }

  return (
    <Sheet open={isOpen} onOpenChange={() => closeDrawer()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-l border-zinc-200 p-0 sm:w-[720px] sm:max-w-[720px]"
        showCloseButton={false}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <SheetHeader className="sticky top-0 z-10 border-b border-zinc-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <SheetTitle className="font-heading text-xl font-semibold text-black">
                  <InlineEditable
                    value={title}
                    onSave={setTitle}
                    className="font-heading text-xl font-semibold"
                  />
                </SheetTitle>
                <ScoreDisplay score={leadScore} />
              </div>
              <p className="mt-0.5 font-body text-sm text-zinc-500">
                {mockLead.clientName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => openModal("win-opportunity")}
                className="rounded-full bg-status-success font-heading text-sm text-white hover:bg-status-success/90"
              >
                Ganho
              </Button>
              <Button
                onClick={() => openModal("lose-opportunity")}
                variant="destructive"
                className="rounded-full font-heading text-sm"
              >
                Perdido
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-zinc-400">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-[15px]">
                  <DropdownMenuItem onClick={() => openModal("new-activity")}>
                    Nova atividade
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-status-danger"
                    onClick={() => openModal("confirm-delete")}
                  >
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-400"
                onClick={() => closeDrawer()}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Stage Selector */}
          <div className="mt-3 overflow-x-auto">
            <StageSelector
              currentStage={stage}
              onStageChange={setStage}
              disabled={isAwaitingApproval}
            />
          </div>

          {/* Awaiting approval banner */}
          {isAwaitingApproval && (
            <div className="mt-3 flex items-center gap-2 rounded-[10px] bg-status-warning-light px-4 py-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-status-warning" />
              <p className="font-body text-sm font-medium text-status-warning">
                Aguardando aprovacao de desconto. Atividades podem continuar.
              </p>
            </div>
          )}

          {/* Temperature + Owner row */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TemperatureSelector current={temperature} onChange={setTemperature} />
              {suggestedTemperature !== temperature && (
                <button
                  onClick={() => setTemperature(suggestedTemperature)}
                  className="font-body text-[10px] text-zinc-400 hover:text-brand transition-colors"
                  title="Clique para aplicar a sugestao"
                >
                  Sugestao: {temperatureConfig[suggestedTemperature].label}
                </button>
              )}
            </div>
            <OwnerSelector
              currentId={responsibleId}
              currentName={responsibleName}
              teamMembers={mockTeamMembers}
              onReassign={(id, name) => {
                setResponsibleId(id);
                setResponsibleName(name);
              }}
            />
          </div>
        </SheetHeader>

        {/* ── Body ────────────────────────────────────────────────── */}
        <div className="p-6">
          <Tabs defaultValue="resumo">
            <TabsList className="w-full border-b border-zinc-200 bg-transparent p-0">
              {[
                { value: "resumo", label: "Resumo" },
                { value: "empresa", label: "Empresa" },
                { value: "contatos", label: "Contatos" },
                { value: "valores", label: "Valores" },
                { value: "tags", label: "Tags" },
                { value: "historico", label: "Historico" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent px-4 py-2.5 font-body text-sm data-[state=active]:border-brand data-[state=active]:text-brand"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── Tab: Resumo ─────────────────────────────────────── */}
            <TabsContent value="resumo" className="mt-6">
              <div className="grid grid-cols-2 gap-4">
                <InfoRow
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Valor Total"
                >
                  <InlineEditable
                    value={formatCurrency(value)}
                    onSave={(v) => {
                      const num = Number(v.replace(/\D/g, ""));
                      if (!isNaN(num)) setValue(num);
                    }}
                    className="font-body text-sm font-medium text-black"
                  />
                </InfoRow>
                <InfoRow
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Valor Mensal"
                >
                  <InlineEditable
                    value={formatCurrency(monthlyValue)}
                    onSave={(v) => {
                      const num = Number(v.replace(/\D/g, ""));
                      if (!isNaN(num)) setMonthlyValue(num);
                    }}
                    className="font-body text-sm font-medium text-black"
                  />
                </InfoRow>
                <InfoRow
                  icon={<User className="h-4 w-4" />}
                  label="Responsavel"
                >
                  <span className="font-body text-sm font-medium text-black">
                    {responsibleName}
                  </span>
                </InfoRow>
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Previsao de Fechamento"
                >
                  <span className="font-body text-sm font-medium text-black">
                    {expectedCloseDate
                      ? new Date(expectedCloseDate).toLocaleDateString("pt-BR")
                      : "--"}
                  </span>
                </InfoRow>
                <InfoRow
                  icon={<Clock className="h-4 w-4" />}
                  label="Criado em"
                >
                  <span className="font-body text-sm font-medium text-black">
                    {new Date(mockLead.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </InfoRow>
                <InfoRow
                  icon={<Globe className="h-4 w-4" />}
                  label="Fonte"
                >
                  <span className="font-body text-sm font-medium text-black">
                    {source}
                  </span>
                </InfoRow>
              </div>

              {/* Tags preview */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-zinc-400" />
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="rounded-[10px] font-body text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Notes */}
              <Separator className="my-6" />
              <div>
                <h3 className="mb-3 font-heading text-base font-semibold text-black">
                  Anotacoes
                </h3>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px] rounded-[15px] font-body text-sm"
                  placeholder="Adicione anotacoes sobre esta oportunidade..."
                />
              </div>
            </TabsContent>

            {/* ── Tab: Empresa ────────────────────────────────────── */}
            <TabsContent value="empresa" className="mt-6">
              <div className="space-y-4">
                <EditableField
                  icon={<Building2 className="h-4 w-4" />}
                  label="CNPJ"
                  value={cnpj}
                  onSave={setCnpj}
                />
                <EditableField
                  icon={<FileText className="h-4 w-4" />}
                  label="Razao Social"
                  value={razaoSocial}
                  onSave={setRazaoSocial}
                />
                <EditableField
                  icon={<MapPin className="h-4 w-4" />}
                  label="Endereco"
                  value={endereco}
                  onSave={setEndereco}
                />
                <EditableField
                  icon={<Phone className="h-4 w-4" />}
                  label="Telefone"
                  value={telefoneEmpresa}
                  onSave={setTelefoneEmpresa}
                />
                <EditableField
                  icon={<Mail className="h-4 w-4" />}
                  label="E-mail"
                  value={emailEmpresa}
                  onSave={setEmailEmpresa}
                />
              </div>
            </TabsContent>

            {/* ── Tab: Contatos ───────────────────────────────────── */}
            <TabsContent value="contatos" className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-heading text-base font-semibold text-black">
                  Contatos ({contacts.length})
                </h3>
                <Button
                  onClick={() => setShowAddContact(true)}
                  className="rounded-full bg-brand font-heading text-sm text-white hover:bg-brand/90"
                  size="sm"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Adicionar
                </Button>
              </div>

              {showAddContact && (
                <div className="mb-4 space-y-3 rounded-[15px] border border-zinc-200 p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="font-body text-xs text-zinc-500">Nome</Label>
                      <Input
                        value={newContact.nome}
                        onChange={(e) =>
                          setNewContact({ ...newContact, nome: e.target.value })
                        }
                        className="mt-1 h-9 rounded-[15px] font-body text-sm"
                        placeholder="Nome do contato"
                      />
                    </div>
                    <div>
                      <Label className="font-body text-xs text-zinc-500">Cargo</Label>
                      <Input
                        value={newContact.cargo}
                        onChange={(e) =>
                          setNewContact({ ...newContact, cargo: e.target.value })
                        }
                        className="mt-1 h-9 rounded-[15px] font-body text-sm"
                        placeholder="Cargo"
                      />
                    </div>
                    <div>
                      <Label className="font-body text-xs text-zinc-500">E-mail</Label>
                      <Input
                        type="email"
                        value={newContact.email}
                        onChange={(e) =>
                          setNewContact({ ...newContact, email: e.target.value })
                        }
                        className="mt-1 h-9 rounded-[15px] font-body text-sm"
                        placeholder="email@empresa.com"
                      />
                    </div>
                    <div>
                      <Label className="font-body text-xs text-zinc-500">Telefone</Label>
                      <PhoneInput
                        value={newContact.telefone}
                        onValueChange={(raw) =>
                          setNewContact({ ...newContact, telefone: raw })
                        }
                        className="mt-1 h-9 rounded-[15px] font-body text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full font-heading text-sm"
                      onClick={() => setShowAddContact(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-full bg-brand font-heading text-sm text-white hover:bg-brand/90"
                      onClick={handleAddContact}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {contacts.map((contact) =>
                  editingContactId === contact.id ? (
                    <div
                      key={contact.id}
                      className="space-y-3 rounded-[15px] border border-brand/30 bg-brand-light/10 p-4"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="font-body text-xs text-zinc-500">Nome</Label>
                          <Input
                            value={editContact.nome}
                            onChange={(e) =>
                              setEditContact({ ...editContact, nome: e.target.value })
                            }
                            className="mt-1 h-9 rounded-[15px] font-body text-sm"
                          />
                        </div>
                        <div>
                          <Label className="font-body text-xs text-zinc-500">Cargo</Label>
                          <Input
                            value={editContact.cargo}
                            onChange={(e) =>
                              setEditContact({ ...editContact, cargo: e.target.value })
                            }
                            className="mt-1 h-9 rounded-[15px] font-body text-sm"
                          />
                        </div>
                        <div>
                          <Label className="font-body text-xs text-zinc-500">E-mail</Label>
                          <Input
                            type="email"
                            value={editContact.email}
                            onChange={(e) =>
                              setEditContact({ ...editContact, email: e.target.value })
                            }
                            className="mt-1 h-9 rounded-[15px] font-body text-sm"
                          />
                        </div>
                        <div>
                          <Label className="font-body text-xs text-zinc-500">Telefone</Label>
                          <PhoneInput
                            value={editContact.telefone}
                            onValueChange={(raw) =>
                              setEditContact({ ...editContact, telefone: raw })
                            }
                            className="mt-1 h-9 rounded-[15px] font-body text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full font-heading text-sm"
                          onClick={() => {
                            setEditingContactId(null);
                            setEditContact({ nome: "", email: "", telefone: "", cargo: "" });
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          className="rounded-full bg-brand font-heading text-sm text-white hover:bg-brand/90"
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
                  )
                )}
              </div>
            </TabsContent>

            {/* ── Tab: Valores ────────────────────────────────────── */}
            <TabsContent value="valores" className="mt-6">
              <div className="space-y-4">
                <EditableField
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Valor Total"
                  value={formatCurrency(value)}
                  onSave={(v) => {
                    const num = Number(v.replace(/\D/g, ""));
                    if (!isNaN(num)) setValue(num);
                  }}
                />
                <EditableField
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Valor Mensal"
                  value={formatCurrency(monthlyValue)}
                  onSave={(v) => {
                    const num = Number(v.replace(/\D/g, ""));
                    if (!isNaN(num)) setMonthlyValue(num);
                  }}
                />

                {/* Discount detection warning */}
                {hasDiscountDetected && (
                  <div className="flex items-start gap-3 rounded-[15px] border border-status-warning/30 bg-status-warning-light p-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-status-warning" />
                    <div className="flex-1">
                      <p className="font-heading text-sm font-semibold text-status-warning">
                        Desconto detectado. Pode exigir aprovacao.
                      </p>
                      <div className="mt-1.5 space-y-1">
                        {hasSetupDiscount && (
                          <p className="font-body text-xs text-status-warning">
                            Valor Setup ({formatCurrency(value)}) esta abaixo de 80% da
                            referencia ({formatCurrency(referenceSetup)})
                          </p>
                        )}
                        {hasMRRDiscount && (
                          <p className="font-body text-xs text-status-warning">
                            Valor MRR ({formatCurrency(monthlyValue)}) esta abaixo de 90%
                            da referencia ({formatCurrency(referenceMRR)})
                          </p>
                        )}
                      </div>
                      {!isAwaitingApproval && (
                        <Button
                          onClick={handleRequestApproval}
                          className="mt-3 rounded-full bg-status-warning font-heading text-sm text-white hover:bg-status-warning/90"
                          size="sm"
                        >
                          <Send className="mr-1.5 h-4 w-4" />
                          Solicitar Aprovacao
                        </Button>
                      )}
                      {isAwaitingApproval && (
                        <p className="mt-2 font-body text-xs font-medium text-status-warning">
                          Aprovacao ja solicitada. Aguardando resposta.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <EditableField
                  icon={<Calendar className="h-4 w-4" />}
                  label="Data Prevista de Fechamento"
                  value={expectedCloseDate}
                  onSave={setExpectedCloseDate}
                  type="date"
                />
                <EditableField
                  icon={<Globe className="h-4 w-4" />}
                  label="Fonte"
                  value={source}
                  onSave={setSource}
                />
                <EditableField
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Moeda"
                  value={currency}
                  onSave={setCurrency}
                />
              </div>
            </TabsContent>

            {/* ── Tab: Tags ───────────────────────────────────────── */}
            <TabsContent value="tags" className="mt-6">
              <div className="space-y-4">
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
                    placeholder="Digite uma nova tag..."
                    className="h-9 flex-1 rounded-[15px] font-body text-sm"
                  />
                  <Button
                    onClick={handleAddTag}
                    className="rounded-full bg-brand font-heading text-sm text-white hover:bg-brand/90"
                    size="sm"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="gap-1.5 rounded-[10px] py-1.5 pr-1.5 font-body text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="rounded-full p-0.5 transition-colors hover:bg-zinc-200"
                      >
                        <X className="h-3 w-3 text-zinc-400" />
                      </button>
                    </Badge>
                  ))}
                </div>

                {tags.length === 0 && (
                  <p className="py-8 text-center font-body text-sm text-zinc-400">
                    Nenhuma tag adicionada
                  </p>
                )}
              </div>
            </TabsContent>

            {/* ── Tab: Historico ───────────────────────────────────── */}
            <TabsContent value="historico" className="mt-6">
              <div className="relative space-y-0">
                {mockTimeline.map((event, i) => (
                  <div key={event.id} className="relative flex gap-4 pb-6">
                    {/* Vertical line */}
                    {i < mockTimeline.length - 1 && (
                      <div className="absolute left-[15px] top-8 h-full w-px bg-zinc-200" />
                    )}
                    {/* Icon */}
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                      {getTimelineIcon(event.type)}
                    </div>
                    {/* Content */}
                    <div className="flex-1 pt-0.5">
                      <p className="font-body text-sm text-black">
                        {event.message}
                      </p>
                      <p className="font-body text-xs text-zinc-400">
                        {event.user} -- {event.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Shared sub-components ───────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
        {icon}
      </div>
      <div>
        <p className="font-body text-xs text-zinc-500">{label}</p>
        {children}
      </div>
    </div>
  );
}

function EditableField({
  icon,
  label,
  value,
  onSave,
  type = "text",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onSave: (val: string) => void;
  type?: string;
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
    <div className="flex items-center gap-3 rounded-[15px] border border-zinc-100 p-3 transition-colors hover:border-zinc-200">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-body text-xs text-zinc-500">{label}</p>
        {editing ? (
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
            className="mt-0.5 h-7 rounded-[10px] border-zinc-200 font-body text-sm"
          />
        ) : (
          <p
            onClick={() => {
              setDraft(value);
              setEditing(true);
            }}
            className="mt-0.5 cursor-pointer rounded-lg px-1 py-0.5 font-body text-sm font-medium text-black transition-colors hover:bg-zinc-50"
            title="Clique para editar"
          >
            {value || "--"}
          </p>
        )}
      </div>
      {!editing && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-zinc-300 hover:text-zinc-500"
          onClick={() => {
            setDraft(value);
            setEditing(true);
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
