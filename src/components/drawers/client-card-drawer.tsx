"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Mail,
  Phone,
  Building2,
  User,
  Calendar,
  Heart,
  AlertTriangle,
  XCircle,
  Clock,
  History,
  MoreHorizontal,
  DollarSign,
  Tag,
  Plus,
  Trash2,
  Star,
  Check,
  Pencil,
  MapPin,
  FileText,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  ArrowRight,
  Users,
  LogIn,
  ThumbsUp,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useUIStore } from "@/stores/ui-store";
import type { HealthScore, ClientStage } from "@/types";
import { calculateHealthScore } from "@/lib/business-rules";

// ── Health config ───────────────────────────────────────────────────────────
const healthConfig: Record<
  HealthScore,
  { label: string; color: string; bgColor: string; icon: React.ReactNode; numericScore: number }
> = {
  good: {
    label: "Saudavel",
    color: "text-status-success",
    bgColor: "bg-status-success-light",
    icon: <Heart className="h-4 w-4 fill-current text-status-success" />,
    numericScore: 85,
  },
  warning: {
    label: "Atencao",
    color: "text-status-warning",
    bgColor: "bg-status-warning-light",
    icon: <AlertTriangle className="h-4 w-4 text-status-warning" />,
    numericScore: 55,
  },
  critical: {
    label: "Critico",
    color: "text-status-danger",
    bgColor: "bg-status-danger-light",
    icon: <XCircle className="h-4 w-4 text-status-danger" />,
    numericScore: 20,
  },
};

// ── Client Stage config ─────────────────────────────────────────────────────
const clientStageConfig: { id: ClientStage; label: string }[] = [
  { id: "onboarding", label: "Onboarding" },
  { id: "implantacao", label: "Implantacao" },
  { id: "acompanhamento", label: "Acompanhamento" },
  { id: "retencao", label: "Retencao" },
  { id: "churn", label: "Churn" },
];

// ── Mock data ───────────────────────────────────────────────────────────────
const mockClient = {
  id: "1",
  companyName: "Restaurante Panoramico",
  cnpj: "12.345.678/0001-00",
  razaoSocial: "Restaurante Panoramico Ltda ME",
  endereco: "Av. Paulista, 1000 - Bela Vista, Sao Paulo - SP",
  telefoneEmpresa: "(11) 3456-7890",
  emailEmpresa: "contato@panoramico.com",
  stage: "acompanhamento" as ClientStage,
  healthScore: "good" as HealthScore,
  monthlyRevenue: 2500,
  contractStart: "2025-06-01",
  contractEnd: "2026-06-01",
  responsibleId: "u1",
  responsibleName: "Maria Silva",
  tags: ["food-service", "restaurante", "premium"],
  lastInteraction: "2026-02-03",
  groupName: "Grupo Panoramico",
  notes: "Cliente com excelente engajamento. Acompanhar renovacao do contrato em junho.",
};

const mockContacts = [
  {
    id: "c1",
    nome: "Ana Costa",
    email: "ana@panoramico.com",
    telefone: "(11) 99999-0001",
    cargo: "Diretora Geral",
    isPrimary: true,
  },
  {
    id: "c2",
    nome: "Bruno Oliveira",
    email: "bruno@panoramico.com",
    telefone: "(11) 99999-0002",
    cargo: "Gerente de Operacoes",
    isPrimary: false,
  },
];

const mockTeamMembers = [
  { id: "u1", name: "Maria Silva", avatar: "" },
  { id: "u2", name: "Pedro Santos", avatar: "" },
  { id: "u3", name: "Julia Fernandes", avatar: "" },
  { id: "u4", name: "Rafael Costa", avatar: "" },
];

const mockMrrHistory = [
  { month: "Set", value: 1800 },
  { month: "Out", value: 2000 },
  { month: "Nov", value: 2200 },
  { month: "Dez", value: 2300 },
  { month: "Jan", value: 2500 },
  { month: "Fev", value: 2500 },
];

const mockMetrics = {
  usageScore: 82,
  daysSinceLastLogin: 2,
  npsScore: 9,
};

const mockTimeline = [
  {
    id: "t1",
    type: "created",
    message: "Cliente criado a partir de oportunidade ganha",
    user: "Maria Silva",
    date: "01/06/2025 10:00",
  },
  {
    id: "t2",
    type: "stage-change",
    message: "Movido de Onboarding para Implantacao",
    user: "Maria Silva",
    date: "15/06/2025 14:30",
  },
  {
    id: "t3",
    type: "stage-change",
    message: "Movido de Implantacao para Acompanhamento",
    user: "Maria Silva",
    date: "01/08/2025 09:00",
  },
  {
    id: "t4",
    type: "activity",
    message: "Reuniao trimestral de acompanhamento realizada",
    user: "Maria Silva",
    date: "01/11/2025 15:00",
  },
  {
    id: "t5",
    type: "value-change",
    message: "MRR alterado de R$ 2.000 para R$ 2.500 (upsell)",
    user: "Pedro Santos",
    date: "15/01/2026 11:30",
  },
  {
    id: "t6",
    type: "health-change",
    message: "Health score atualizado para Saudavel",
    user: "Sistema",
    date: "03/02/2026 08:00",
  },
];

const churnReasons = [
  "Preco muito alto",
  "Nao utiliza o produto",
  "Mudou para concorrente",
  "Empresa fechou",
  "Insatisfacao com suporte",
  "Falta de funcionalidades",
  "Outro",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
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
    case "health-change":
      return <Heart className="h-3.5 w-3.5" />;
    default:
      return <Clock className="h-3.5 w-3.5" />;
  }
}

// ── Inline Editable Field ───────────────────────────────────────────────────
function InlineEditable({
  value,
  onSave,
  className = "",
  type = "text",
}: {
  value: string;
  onSave: (val: string) => void;
  className?: string;
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
        className="h-8 rounded-[15px] font-body text-sm"
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

// ── Editable Field Row ──────────────────────────────────────────────────────
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

// ── Client Stage Selector ───────────────────────────────────────────────────
function ClientStageSelector({
  currentStage,
  onStageChange,
}: {
  currentStage: ClientStage;
  onStageChange: (stage: ClientStage) => void;
}) {
  const currentIndex = clientStageConfig.findIndex((s) => s.id === currentStage);

  return (
    <div className="flex items-center gap-1">
      {clientStageConfig.map((stage, i) => {
        const isActive = stage.id === currentStage;
        const isPast = i < currentIndex;
        const isChurn = stage.id === "churn";

        return (
          <button
            key={stage.id}
            onClick={() => onStageChange(stage.id)}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 font-body text-xs font-medium transition-all ${
              isActive
                ? isChurn
                  ? "bg-status-danger text-white shadow-sm"
                  : "bg-brand text-white shadow-sm"
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

// ── Owner Selector ──────────────────────────────────────────────────────────
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

// ── MRR Mini Bar Chart ──────────────────────────────────────────────────────
function MrrChart({
  data,
}: {
  data: { month: string; value: number }[];
}) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="rounded-[15px] border border-zinc-100 p-4">
      <h4 className="mb-3 font-heading text-sm font-semibold text-black">
        MRR - Ultimos 6 Meses
      </h4>
      <div className="flex items-end gap-2" style={{ height: 120 }}>
        {data.map((d, i) => {
          const heightPercent = (d.value / maxValue) * 100;
          const isLast = i === data.length - 1;
          return (
            <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
              <span className="font-body text-[10px] font-medium text-zinc-500">
                {formatCurrency(d.value)}
              </span>
              <div
                className={`w-full rounded-t-lg transition-all ${
                  isLast ? "bg-brand" : "bg-brand/20"
                }`}
                style={{ height: `${heightPercent}%`, minHeight: 8 }}
              />
              <span className="font-body text-xs text-zinc-400">{d.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({
  icon,
  label,
  value,
  suffix,
  color = "text-black",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  suffix?: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[15px] border border-zinc-100 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
        {icon}
      </div>
      <div>
        <p className="font-body text-xs text-zinc-500">{label}</p>
        <p className={`font-heading text-lg font-bold ${color}`}>
          {value}
          {suffix && (
            <span className="ml-0.5 font-body text-xs font-normal text-zinc-400">
              {suffix}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// ── Churn Modal ─────────────────────────────────────────────────────────────
function ChurnModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string, notes: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [churnNotes, setChurnNotes] = useState("");

  function handleSubmit() {
    onConfirm(reason, churnNotes);
    setReason("");
    setChurnNotes("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[480px] rounded-[20px] p-8">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-danger-light">
              <XCircle className="h-5 w-5 text-status-danger" />
            </div>
            <DialogTitle className="font-heading text-xl font-semibold text-black">
              Registrar Churn
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label className="font-body text-sm text-zinc-600">
              Motivo do Churn
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="h-10 rounded-[15px] font-body text-sm">
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent className="rounded-[15px]">
                {churnReasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-body text-sm text-zinc-600">
              Observacoes
            </Label>
            <Textarea
              value={churnNotes}
              onChange={(e) => setChurnNotes(e.target.value)}
              className="min-h-[100px] rounded-[15px] font-body text-sm"
              placeholder="Descreva os detalhes do churn..."
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="secondary"
            onClick={onClose}
            className="rounded-full font-heading text-sm"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason}
            className="rounded-full bg-status-danger font-heading text-sm text-white hover:bg-status-danger/90"
          >
            Registrar Churn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export function ClientCardDrawer() {
  const { drawerType, closeDrawer, openModal } = useUIStore();
  const isOpen = drawerType === "client-card";
  // Health Score calculado dinamicamente
  const computedHealth = calculateHealthScore(mockClient);
  const health = {
    ...healthConfig[computedHealth.category],
    numericScore: computedHealth.numericScore,
  };

  // State
  const [stage, setStage] = useState<ClientStage>(mockClient.stage);
  const [responsibleId, setResponsibleId] = useState(mockClient.responsibleId);
  const [responsibleName, setResponsibleName] = useState(mockClient.responsibleName);
  const [notes, setNotes] = useState(mockClient.notes);
  const [tags, setTags] = useState(mockClient.tags);
  const [newTag, setNewTag] = useState("");
  const [contacts, setContacts] = useState(mockContacts);
  const [showChurnModal, setShowChurnModal] = useState(false);

  // Company editable fields
  const [cnpj, setCnpj] = useState(mockClient.cnpj);
  const [razaoSocial, setRazaoSocial] = useState(mockClient.razaoSocial);
  const [endereco, setEndereco] = useState(mockClient.endereco);
  const [telefoneEmpresa, setTelefoneEmpresa] = useState(mockClient.telefoneEmpresa);
  const [emailEmpresa, setEmailEmpresa] = useState(mockClient.emailEmpresa);

  // Contact form
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

  return (
    <>
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
                    {mockClient.companyName}
                  </SheetTitle>
                  {/* Health Score Badge */}
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 font-heading text-sm font-bold ${health.bgColor} ${health.color}`}
                  >
                    {health.icon}
                    {health.label}
                    <span className="ml-1 text-xs font-normal opacity-70">
                      ({health.numericScore})
                    </span>
                  </div>
                  {/* Group Badge */}
                  {mockClient.groupName && (
                    <Badge className="gap-1 rounded-[10px] bg-zinc-100 text-zinc-600 font-body text-xs">
                      <Users className="h-3 w-3" />
                      {mockClient.groupName}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 font-body text-sm text-zinc-500">
                  CNPJ: {mockClient.cnpj}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowChurnModal(true)}
                  variant="destructive"
                  className="rounded-full font-heading text-sm"
                >
                  Registrar Churn
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
                    <DropdownMenuItem onClick={() => openModal("new-activity")}>
                      Registrar interacao
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-status-danger"
                      onClick={() => openModal("confirm-deactivate")}
                    >
                      Desativar cliente
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
              <ClientStageSelector currentStage={stage} onStageChange={setStage} />
            </div>

            {/* Owner row */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-zinc-400" />
                  <span className="font-body text-sm text-zinc-600">
                    MRR: <strong className="text-black">{formatCurrency(mockClient.monthlyRevenue)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  <span className="font-body text-sm text-zinc-600">
                    Contrato: <strong className="text-black">{new Date(mockClient.contractStart).toLocaleDateString("pt-BR")}</strong>
                  </span>
                </div>
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
                  { value: "metricas", label: "Metricas" },
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
                    label="Receita Mensal"
                  >
                    <span className="font-body text-sm font-medium text-black">
                      {formatCurrency(mockClient.monthlyRevenue)}/mes
                    </span>
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
                    label="Inicio do Contrato"
                  >
                    <span className="font-body text-sm font-medium text-black">
                      {new Date(mockClient.contractStart).toLocaleDateString("pt-BR")}
                    </span>
                  </InfoRow>
                  <InfoRow
                    icon={<Clock className="h-4 w-4" />}
                    label="Ultima Interacao"
                  >
                    <span className="font-body text-sm font-medium text-black">
                      {mockClient.lastInteraction
                        ? new Date(mockClient.lastInteraction).toLocaleDateString("pt-BR")
                        : "--"}
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
                    placeholder="Adicione anotacoes sobre este cliente..."
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

              {/* ── Tab: Metricas ───────────────────────────────────── */}
              <TabsContent value="metricas" className="mt-6">
                <div className="space-y-4">
                  {/* MRR Chart */}
                  <MrrChart data={mockMrrHistory} />

                  {/* Metric Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard
                      icon={<Activity className="h-5 w-5" />}
                      label="Score de Uso"
                      value={mockMetrics.usageScore}
                      suffix="/100"
                      color={
                        mockMetrics.usageScore >= 70
                          ? "text-status-success"
                          : mockMetrics.usageScore >= 40
                            ? "text-status-warning"
                            : "text-status-danger"
                      }
                    />
                    <MetricCard
                      icon={<LogIn className="h-5 w-5" />}
                      label="Dias Desde Ultimo Login"
                      value={mockMetrics.daysSinceLastLogin}
                      suffix={mockMetrics.daysSinceLastLogin === 1 ? "dia" : "dias"}
                      color={
                        mockMetrics.daysSinceLastLogin <= 3
                          ? "text-status-success"
                          : mockMetrics.daysSinceLastLogin <= 7
                            ? "text-status-warning"
                            : "text-status-danger"
                      }
                    />
                    <MetricCard
                      icon={<ThumbsUp className="h-5 w-5" />}
                      label="NPS Score"
                      value={mockMetrics.npsScore}
                      suffix="/10"
                      color={
                        mockMetrics.npsScore >= 8
                          ? "text-status-success"
                          : mockMetrics.npsScore >= 6
                            ? "text-status-warning"
                            : "text-status-danger"
                      }
                    />
                    <MetricCard
                      icon={<TrendingUp className="h-5 w-5" />}
                      label="Crescimento MRR"
                      value="+39%"
                      color="text-status-success"
                    />
                  </div>
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
                      {i < mockTimeline.length - 1 && (
                        <div className="absolute left-[15px] top-8 h-full w-px bg-zinc-200" />
                      )}
                      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                        {getTimelineIcon(event.type)}
                      </div>
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

      {/* Churn Modal */}
      <ChurnModal
        open={showChurnModal}
        onClose={() => setShowChurnModal(false)}
        onConfirm={(reason, notes) => {
          setStage("churn");
          toast.success("Churn registrado!", {
            description: `Motivo: ${reason}.${notes ? ` Observacoes: ${notes}.` : ""} O cliente foi marcado como churn.`,
          });
        }}
      />
    </>
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
