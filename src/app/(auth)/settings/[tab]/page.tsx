"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  GitBranch,
  Clock,
  Percent,
  FormInput,
  XCircle,
  Tags,
  FileText,
  Bell,
  Plug,
  Pencil,
  Plus,
  Trash2,
  AlertTriangle,
  Filter,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// ===== Tab config =====

const tabConfig: {
  key: string;
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: "general", label: "Geral", icon: <Settings className="h-4 w-4" /> },
  { key: "pipeline", label: "Pipeline", icon: <GitBranch className="h-4 w-4" /> },
  { key: "funnels", label: "Funis", icon: <Filter className="h-4 w-4" /> },
  { key: "sla", label: "SLA", icon: <Clock className="h-4 w-4" /> },
  { key: "commissions", label: "Comissões", icon: <Percent className="h-4 w-4" /> },
  { key: "fields", label: "Campos", icon: <FormInput className="h-4 w-4" /> },
  { key: "reasons", label: "Motivos de Perda", icon: <XCircle className="h-4 w-4" /> },
  { key: "tags", label: "Tags", icon: <Tags className="h-4 w-4" /> },
  { key: "terms", label: "Termos", icon: <FileText className="h-4 w-4" /> },
  { key: "notifications", label: "Notificações", icon: <Bell className="h-4 w-4" /> },
  { key: "integrations", label: "Integrações", icon: <Plug className="h-4 w-4" /> },
];

const titleMap: Record<string, string> = {
  general: "Configurações Gerais",
  pipeline: "Pipeline",
  funnels: "Funis de Vendas",
  sla: "Configuração de SLA",
  commissions: "Regras de Comissão",
  fields: "Campos Personalizados",
  reasons: "Motivos de Perda",
  tags: "Gestão de Tags",
  terms: "Termos de Uso",
  notifications: "Notificações",
  integrations: "Integrações",
};

// ===== Main Page =====

export default function SettingsTabPage({
  params,
}: {
  params: Promise<{ tab: string }>;
}) {
  const { tab } = use(params);
  const [isDirty, setIsDirty] = useState(false);

  const markDirty = useCallback(() => {
    if (!isDirty) setIsDirty(true);
  }, [isDirty]);

  const handleSave = () => {
    toast.success("Alterações salvas!", {
      description: "Suas configurações foram atualizadas com sucesso.",
    });
    setIsDirty(false);
  };

  const handleDiscard = () => {
    setIsDirty(false);
  };

  return (
    <div className="flex gap-8">
      {/* Sidebar Navigation */}
      <aside className="w-[200px] shrink-0">
        <nav className="sticky top-6 space-y-1">
          {tabConfig.map((item) => {
            const isActive = tab === item.key;
            return (
              <Link
                key={item.key}
                href={`/settings/${item.key}`}
                className={`flex items-center gap-3 rounded-[15px] px-3 py-2.5 font-body text-sm transition-colors ${
                  isActive
                    ? "bg-black font-medium text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-black"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content Area */}
      <div className="min-w-0 flex-1 space-y-6">
        {/* Unsaved Changes Banner */}
        {isDirty && (
          <div className="flex items-center justify-between rounded-[15px] border border-status-warning bg-status-warning-light px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-status-warning" />
              <span className="font-body text-sm font-medium text-status-warning">
                Você tem alterações não salvas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscard}
                className="rounded-full font-heading text-xs"
              >
                Descartar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="rounded-full bg-black font-heading text-xs text-white hover:bg-zinc-800"
              >
                Salvar
              </Button>
            </div>
          </div>
        )}

        {/* Page Title */}
        <div>
          <h1 className="font-heading text-2xl font-bold text-black sm:text-3xl">
            {titleMap[tab] || tab}
          </h1>
          <p className="mt-1 font-body text-sm text-zinc-500">
            Personalize o comportamento do Flow
          </p>
        </div>

        {tab === "general" && <GeneralSettings onDirty={markDirty} />}
        {tab === "pipeline" && <PipelineSettings onDirty={markDirty} />}
        {tab === "funnels" && <FunnelsSettings />}
        {tab === "sla" && <SLASettings onDirty={markDirty} />}
        {tab === "commissions" && <CommissionsSettings onDirty={markDirty} />}
        {tab === "fields" && <FieldsSettings onDirty={markDirty} />}
        {tab === "reasons" && <ReasonsSettings onDirty={markDirty} />}
        {tab === "tags" && <TagsSettings onDirty={markDirty} />}
        {tab === "terms" && <TermsSettings onDirty={markDirty} />}
        {tab === "notifications" && <NotificationSettings onDirty={markDirty} />}
        {tab === "integrations" && <IntegrationSettings />}
      </div>
    </div>
  );
}

// ===== General Settings =====

function GeneralSettings({ onDirty }: { onDirty: () => void }) {
  return (
    <div className="space-y-6">
      <Card className="rounded-[15px] border-zinc-200">
        <CardHeader>
          <CardTitle className="font-heading text-lg font-semibold text-black">
            Informações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="font-body text-sm text-zinc-600">
              Nome da empresa
            </Label>
            <Input
              defaultValue="Menux"
              onChange={onDirty}
              className="h-10 rounded-[15px] font-body text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-body text-sm text-zinc-600">CNPJ</Label>
            <Input
              defaultValue="12.345.678/0001-00"
              onChange={onDirty}
              className="h-10 rounded-[15px] font-body text-sm"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={() => {
                toast.success("Informações salvas!", {
                  description: "As informações da empresa foram atualizadas.",
                });
              }}
              className="rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
            >
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[15px] border-zinc-200">
        <CardHeader>
          <CardTitle className="font-heading text-lg font-semibold text-black">
            Preferências
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-sm font-medium text-black">
                Formato de moeda
              </p>
              <p className="font-body text-xs text-zinc-500">
                Moeda padrão para valores
              </p>
            </div>
            <Select defaultValue="BRL" onValueChange={onDirty}>
              <SelectTrigger className="w-32 rounded-[15px] font-body text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[15px]">
                <SelectItem value="BRL">R$ (BRL)</SelectItem>
                <SelectItem value="USD">$ (USD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-sm font-medium text-black">
                Fuso horário
              </p>
              <p className="font-body text-xs text-zinc-500">
                Fuso usado para datas e SLAs
              </p>
            </div>
            <Select defaultValue="America/Sao_Paulo" onValueChange={onDirty}>
              <SelectTrigger className="w-48 rounded-[15px] font-body text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[15px]">
                <SelectItem value="America/Sao_Paulo">
                  São Paulo (GMT-3)
                </SelectItem>
                <SelectItem value="America/Manaus">
                  Manaus (GMT-4)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== Pipeline Settings =====

function PipelineSettings({ onDirty }: { onDirty: () => void }) {
  const stages = [
    { id: "lead-in", label: "Lead-In", sla: 24 },
    { id: "contato-feito", label: "Contato Feito", sla: 48 },
    { id: "reuniao-agendada", label: "Reunião Agendada", sla: 72 },
    { id: "proposta-enviada", label: "Proposta Enviada", sla: 120 },
    { id: "negociacao", label: "Negociação", sla: 168 },
    { id: "fechamento", label: "Fechamento", sla: 240 },
  ];

  return (
    <Card className="rounded-[15px] border-zinc-200">
      <CardHeader>
        <CardTitle className="font-heading text-lg font-semibold text-black">
          Etapas do Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="flex items-center justify-between rounded-[15px] border border-zinc-200 p-4"
            >
              <div>
                <p className="font-body text-sm font-medium text-black">
                  {stage.label}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="font-body text-xs text-zinc-500">
                    SLA (horas):
                  </Label>
                  <Input
                    type="number"
                    defaultValue={stage.sla}
                    onChange={onDirty}
                    className="h-9 w-20 rounded-[15px] font-body text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => {
              toast.success("Pipeline atualizado!", {
                description: "As etapas do pipeline foram salvas com sucesso.",
              });
            }}
            className="rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
          >
            Salvar configuração
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== Funnels Settings =====

function FunnelsSettings() {
  const [funnels, setFunnels] = useState([
    {
      id: "comercial",
      name: "Comercial",
      description: "Funil de vendas principal",
      stages: [
        "Lead-In",
        "Contato Feito",
        "Reunião Agendada",
        "Proposta Enviada",
        "Negociação",
        "Fechamento",
      ],
    },
    {
      id: "cs",
      name: "CS",
      description: "Funil de Customer Success",
      stages: [
        "Onboarding",
        "Implantação",
        "Acompanhamento",
        "Retenção",
      ],
    },
  ]);

  const [editingFunnel, setEditingFunnel] = useState<(typeof funnels)[0] | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStages, setEditStages] = useState<string[]>([]);
  const [newStageName, setNewStageName] = useState("");

  function handleOpenEdit(funnel: (typeof funnels)[0]) {
    setEditingFunnel(funnel);
    setEditName(funnel.name);
    setEditDescription(funnel.description);
    setEditStages([...funnel.stages]);
    setNewStageName("");
  }

  function handleSaveEdit() {
    if (!editingFunnel || !editName.trim()) return;
    setFunnels(
      funnels.map((f) =>
        f.id === editingFunnel.id
          ? { ...f, name: editName, description: editDescription, stages: editStages }
          : f
      )
    );
    setEditingFunnel(null);
    toast.success("Funil atualizado!", {
      description: `O funil "${editName}" foi salvo com sucesso.`,
    });
  }

  function handleAddStage() {
    if (newStageName.trim() && !editStages.includes(newStageName.trim())) {
      setEditStages([...editStages, newStageName.trim()]);
      setNewStageName("");
    }
  }

  function handleRemoveStage(index: number) {
    setEditStages(editStages.filter((_, i) => i !== index));
  }

  function handleMoveStage(index: number, direction: "up" | "down") {
    const newStages = [...editStages];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newStages.length) return;
    [newStages[index], newStages[swapIndex]] = [newStages[swapIndex], newStages[index]];
    setEditStages(newStages);
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {funnels.map((funnel) => (
          <Card key={funnel.id} className="rounded-[15px] border-zinc-200">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="font-heading text-lg font-semibold text-black">
                  {funnel.name}
                </CardTitle>
                <p className="mt-1 font-body text-xs text-zinc-500">
                  {funnel.description}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full font-heading text-xs"
                onClick={() => handleOpenEdit(funnel)}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Editar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {funnel.stages.map((stage, idx) => (
                  <div
                    key={stage}
                    className="flex items-center gap-3 rounded-[10px] bg-zinc-50 px-3 py-2"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand font-heading text-[10px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="font-body text-sm text-black">{stage}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Funnel Dialog */}
      <Dialog open={!!editingFunnel} onOpenChange={() => setEditingFunnel(null)}>
        <DialogContent className="max-w-[520px] rounded-[20px] p-8">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-semibold text-black">
              Editar Funil
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label className="font-body text-sm text-zinc-600">Nome do funil</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-10 rounded-[15px] font-body text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-sm text-zinc-600">Descrição</Label>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="h-10 rounded-[15px] font-body text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-sm text-zinc-600">Etapas</Label>
              <div className="space-y-2">
                {editStages.map((stage, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-[10px] bg-zinc-50 px-3 py-2"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand font-heading text-[10px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="flex-1 font-body text-sm text-black">{stage}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-zinc-400 hover:text-zinc-600"
                      onClick={() => handleMoveStage(idx, "up")}
                      disabled={idx === 0}
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-zinc-400 hover:text-zinc-600"
                      onClick={() => handleMoveStage(idx, "down")}
                      disabled={idx === editStages.length - 1}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-status-danger hover:bg-status-danger-light"
                      onClick={() => handleRemoveStage(idx)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddStage();
                    }
                  }}
                  placeholder="Nova etapa..."
                  className="h-9 rounded-[15px] font-body text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleAddStage}
                  className="rounded-full bg-black font-heading text-xs text-white hover:bg-zinc-800"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="secondary"
              onClick={() => setEditingFunnel(null)}
              className="rounded-full font-heading text-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editName.trim() || editStages.length === 0}
              className="rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
            >
              Salvar funil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ===== SLA Settings =====

function SLASettings({ onDirty }: { onDirty: () => void }) {
  const stages = [
    { id: "lead-in", label: "Lead-In", slaHours: 24, warningHours: 18 },
    { id: "contato-feito", label: "Contato Feito", slaHours: 48, warningHours: 36 },
    { id: "reuniao-agendada", label: "Reunião Agendada", slaHours: 72, warningHours: 48 },
    { id: "proposta-enviada", label: "Proposta Enviada", slaHours: 120, warningHours: 96 },
    { id: "negociacao", label: "Negociação", slaHours: 168, warningHours: 120 },
    { id: "fechamento", label: "Fechamento", slaHours: 240, warningHours: 192 },
  ];

  return (
    <Card className="rounded-[15px] border-zinc-200">
      <CardHeader>
        <CardTitle className="font-heading text-lg font-semibold text-black">
          Prazos de SLA por Etapa
        </CardTitle>
        <p className="font-body text-xs text-zinc-500">
          Defina o tempo máximo e o limiar de aviso para cada etapa do pipeline
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="pb-3 text-left font-body text-xs font-medium uppercase text-zinc-500">
                  Etapa
                </th>
                <th className="pb-3 text-left font-body text-xs font-medium uppercase text-zinc-500">
                  SLA (horas)
                </th>
                <th className="pb-3 text-left font-body text-xs font-medium uppercase text-zinc-500">
                  Aviso (horas)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {stages.map((stage) => (
                <tr key={stage.id}>
                  <td className="py-3">
                    <span className="font-body text-sm font-medium text-black">
                      {stage.label}
                    </span>
                  </td>
                  <td className="py-3">
                    <Input
                      type="number"
                      defaultValue={stage.slaHours}
                      onChange={onDirty}
                      className="h-9 w-24 rounded-[15px] font-body text-sm"
                    />
                  </td>
                  <td className="py-3">
                    <Input
                      type="number"
                      defaultValue={stage.warningHours}
                      onChange={onDirty}
                      className="h-9 w-24 rounded-[15px] font-body text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => {
              toast.success("SLA atualizado!", {
                description: "Os prazos de SLA foram salvos com sucesso.",
              });
            }}
            className="rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
          >
            Salvar SLA
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== Commissions Settings =====

function CommissionsSettings({ onDirty }: { onDirty: () => void }) {
  const roles = [
    { id: "comercial", label: "Comercial", percentage: 10, minValue: 500 },
    { id: "cs", label: "CS", percentage: 5, minValue: 300 },
    { id: "admin", label: "Admin", percentage: 3, minValue: 200 },
    { id: "master", label: "Master", percentage: 2, minValue: 0 },
  ];

  return (
    <Card className="rounded-[15px] border-zinc-200">
      <CardHeader>
        <CardTitle className="font-heading text-lg font-semibold text-black">
          Regras de Comissão por Papel
        </CardTitle>
        <p className="font-body text-xs text-zinc-500">
          Configure o percentual e valor mínimo de comissão para cada papel
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="pb-3 text-left font-body text-xs font-medium uppercase text-zinc-500">
                  Papel
                </th>
                <th className="pb-3 text-left font-body text-xs font-medium uppercase text-zinc-500">
                  Percentual (%)
                </th>
                <th className="pb-3 text-left font-body text-xs font-medium uppercase text-zinc-500">
                  Valor mínimo (R$)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className="py-3">
                    <span className="font-body text-sm font-medium text-black">
                      {role.label}
                    </span>
                  </td>
                  <td className="py-3">
                    <Input
                      type="number"
                      defaultValue={role.percentage}
                      onChange={onDirty}
                      className="h-9 w-24 rounded-[15px] font-body text-sm"
                    />
                  </td>
                  <td className="py-3">
                    <Input
                      type="number"
                      defaultValue={role.minValue}
                      onChange={onDirty}
                      className="h-9 w-24 rounded-[15px] font-body text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => {
              toast.success("Comissões salvas!", {
                description: "As regras de comissão foram atualizadas.",
              });
            }}
            className="rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
          >
            Salvar comissões
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== Custom Fields Settings =====

function FieldsSettings({ onDirty }: { onDirty: () => void }) {
  const [fields, setFields] = useState([
    { id: "1", name: "Segmento", type: "select", required: true },
    { id: "2", name: "Faturamento Anual", type: "number", required: false },
    { id: "3", name: "Data de Fundação", type: "date", required: false },
    { id: "4", name: "Observações Internas", type: "text", required: false },
  ]);

  const typeLabels: Record<string, string> = {
    text: "Texto",
    number: "Número",
    select: "Seleção",
    date: "Data",
  };

  const addField = () => {
    const newField = {
      id: String(Date.now()),
      name: "",
      type: "text",
      required: false,
    };
    setFields([...fields, newField]);
    onDirty();
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    onDirty();
  };

  const updateField = (id: string, key: string, value: string | boolean) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
    onDirty();
  };

  return (
    <Card className="rounded-[15px] border-zinc-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="font-heading text-lg font-semibold text-black">
            Campos Personalizados
          </CardTitle>
          <p className="mt-1 font-body text-xs text-zinc-500">
            Defina campos adicionais para oportunidades e clientes
          </p>
        </div>
        <Button
          size="sm"
          onClick={addField}
          className="rounded-full bg-black font-heading text-xs text-white hover:bg-zinc-800"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Adicionar campo
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {fields.map((field) => (
            <div
              key={field.id}
              className="flex items-center gap-4 rounded-[15px] border border-zinc-200 p-4"
            >
              <div className="flex-1">
                <Input
                  placeholder="Nome do campo"
                  defaultValue={field.name}
                  onChange={(e) => updateField(field.id, "name", e.target.value)}
                  className="h-9 rounded-[15px] font-body text-sm"
                />
              </div>
              <Select
                defaultValue={field.type}
                onValueChange={(val) => updateField(field.id, "type", val)}
              >
                <SelectTrigger className="w-32 rounded-[15px] font-body text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-[15px]">
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="select">Seleção</SelectItem>
                  <SelectItem value="date">Data</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Switch
                  defaultChecked={field.required}
                  onCheckedChange={(val) => updateField(field.id, "required", val)}
                />
                <Label className="font-body text-xs text-zinc-500">Obrigatório</Label>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeField(field.id)}
                className="h-8 w-8 text-status-danger hover:bg-status-danger-light hover:text-status-danger"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => {
              toast.success("Campos salvos!", {
                description: "Os campos personalizados foram atualizados.",
              });
            }}
            className="rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
          >
            Salvar campos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== Loss Reasons Settings =====

function ReasonsSettings({ onDirty }: { onDirty: () => void }) {
  const [reasons, setReasons] = useState([
    { id: "1", label: "Preço" },
    { id: "2", label: "Concorrência" },
    { id: "3", label: "Timing inadequado" },
    { id: "4", label: "Sem orçamento" },
    { id: "5", label: "Sem resposta do cliente" },
    { id: "6", label: "Produto não atende" },
  ]);

  const [newReason, setNewReason] = useState("");

  const addReason = () => {
    if (!newReason.trim()) return;
    setReasons([...reasons, { id: String(Date.now()), label: newReason.trim() }]);
    setNewReason("");
    onDirty();
  };

  const removeReason = (id: string) => {
    setReasons(reasons.filter((r) => r.id !== id));
    onDirty();
  };

  return (
    <Card className="rounded-[15px] border-zinc-200">
      <CardHeader>
        <CardTitle className="font-heading text-lg font-semibold text-black">
          Motivos de Perda
        </CardTitle>
        <p className="font-body text-xs text-zinc-500">
          Gerencie os motivos disponíveis ao registrar uma perda de oportunidade
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <Input
            placeholder="Novo motivo de perda..."
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addReason();
            }}
            className="h-10 flex-1 rounded-[15px] font-body text-sm"
          />
          <Button
            onClick={addReason}
            className="rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Adicionar
          </Button>
        </div>
        <div className="space-y-2">
          {reasons.map((reason) => (
            <div
              key={reason.id}
              className="flex items-center justify-between rounded-[15px] border border-zinc-200 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <XCircle className="h-4 w-4 text-status-danger" />
                <span className="font-body text-sm text-black">{reason.label}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeReason(reason.id)}
                className="h-8 w-8 text-zinc-400 hover:text-status-danger"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ===== Tags Settings =====

const tagColors = [
  { name: "Roxo", value: "#7A55FD" },
  { name: "Azul", value: "#3B82F6" },
  { name: "Verde", value: "#22C55E" },
  { name: "Amarelo", value: "#EAB308" },
  { name: "Vermelho", value: "#EF4444" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Cinza", value: "#6B7280" },
];

function TagsSettings({ onDirty }: { onDirty: () => void }) {
  const [tags, setTags] = useState([
    { id: "1", label: "Indicação", color: "#7A55FD" },
    { id: "2", label: "Inbound", color: "#3B82F6" },
    { id: "3", label: "Outbound", color: "#22C55E" },
    { id: "4", label: "Enterprise", color: "#EAB308" },
    { id: "5", label: "Renovação", color: "#EC4899" },
  ]);

  const [newTag, setNewTag] = useState("");
  const [newTagColor, setNewTagColor] = useState("#7A55FD");

  const addTag = () => {
    if (!newTag.trim()) return;
    setTags([
      ...tags,
      { id: String(Date.now()), label: newTag.trim(), color: newTagColor },
    ]);
    setNewTag("");
    onDirty();
  };

  const removeTag = (id: string) => {
    setTags(tags.filter((t) => t.id !== id));
    onDirty();
  };

  return (
    <Card className="rounded-[15px] border-zinc-200">
      <CardHeader>
        <CardTitle className="font-heading text-lg font-semibold text-black">
          Gestão de Tags
        </CardTitle>
        <p className="font-body text-xs text-zinc-500">
          Crie e gerencie tags para organizar oportunidades e clientes
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Input
            placeholder="Nova tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTag();
            }}
            className="h-10 flex-1 rounded-[15px] font-body text-sm"
          />
          <Select value={newTagColor} onValueChange={setNewTagColor}>
            <SelectTrigger className="w-28 rounded-[15px] font-body text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: newTagColor }}
                />
                <span>Cor</span>
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-[15px]">
              {tagColors.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: c.value }}
                    />
                    {c.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={addTag}
            className="rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Adicionar
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              className="group flex items-center gap-2 rounded-[10px] border-none px-3 py-1.5 font-body text-sm"
              style={{
                backgroundColor: `${tag.color}18`,
                color: tag.color,
              }}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.label}
              <button
                onClick={() => removeTag(tag.id)}
                className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ===== Terms Settings =====

function TermsSettings({ onDirty }: { onDirty: () => void }) {
  const [content, setContent] = useState(
    `Termos de Uso do Flow CRM

1. Aceitação dos Termos
Ao acessar e utilizar o Flow CRM, você concorda com os presentes Termos de Uso.

2. Uso da Plataforma
O Flow CRM é uma plataforma de gestão de relacionamento com o cliente. O uso é limitado às finalidades comerciais legítimas.

3. Privacidade
Seus dados são protegidos conforme a LGPD. Consulte nossa Política de Privacidade para mais detalhes.

4. Responsabilidades
O usuário é responsável por manter a segurança de suas credenciais de acesso.`
  );

  return (
    <Card className="rounded-[15px] border-zinc-200">
      <CardHeader>
        <CardTitle className="font-heading text-lg font-semibold text-black">
          Termos de Uso
        </CardTitle>
        <p className="font-body text-xs text-zinc-500">
          Edite os termos de uso exibidos para os usuários do sistema
        </p>
      </CardHeader>
      <CardContent>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            onDirty();
          }}
          rows={16}
          className="w-full resize-y rounded-[15px] border border-zinc-200 bg-white px-4 py-3 font-body text-sm text-black placeholder:text-zinc-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => {
              toast.success("Termos salvos!", {
                description: "Os termos de uso foram atualizados.",
              });
            }}
            className="rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
          >
            Salvar termos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== Notification Settings =====

function NotificationSettings({ onDirty }: { onDirty: () => void }) {
  const notifications = [
    {
      id: "sla-warning",
      title: "Alerta de SLA",
      description: "Receber aviso quando SLA está próximo de estourar",
    },
    {
      id: "sla-breach",
      title: "SLA estourado",
      description: "Notificar quando SLA é violado",
    },
    {
      id: "activity-due",
      title: "Atividade vencendo",
      description: "Lembrete de atividades do dia",
    },
    {
      id: "opportunity-won",
      title: "Oportunidade ganha",
      description: "Notificar quando uma oportunidade é fechada",
    },
    {
      id: "health-drop",
      title: "Queda de Health Score",
      description: "Alerta de queda no score de clientes",
    },
    {
      id: "goal-achieved",
      title: "Meta atingida",
      description: "Celebração quando meta é batida",
    },
  ];

  return (
    <Card className="rounded-[15px] border-zinc-200">
      <CardHeader>
        <CardTitle className="font-heading text-lg font-semibold text-black">
          Preferências de Notificação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between"
            >
              <div>
                <p className="font-body text-sm font-medium text-black">
                  {item.title}
                </p>
                <p className="font-body text-xs text-zinc-500">
                  {item.description}
                </p>
              </div>
              <Switch defaultChecked onCheckedChange={onDirty} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ===== Integration Settings =====

function IntegrationSettings() {
  return (
    <Card className="rounded-[15px] border-zinc-200">
      <CardHeader>
        <CardTitle className="font-heading text-lg font-semibold text-black">
          Integrações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
            <Plug className="h-5 w-5 text-zinc-400" />
          </div>
          <p className="font-body text-sm text-zinc-500">
            As integrações serão disponibilizadas em breve.
          </p>
          <p className="mt-1 font-body text-xs text-zinc-400">
            WhatsApp, E-mail, Calendário e mais.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
