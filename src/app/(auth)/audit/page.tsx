"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  Shield,
  Filter,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AuditAction = "created" | "updated" | "deleted" | "moved";

type EntityType =
  | "opportunity"
  | "client"
  | "activity"
  | "user"
  | "settings";

interface AuditEvent {
  id: string;
  timestamp: string;
  user: {
    name: string;
    initials: string;
    color: string;
  };
  action: AuditAction;
  entityType: EntityType;
  entityName: string;
  details: string;
  fullDetails?: string;
}

// ---------------------------------------------------------------------------
// Action Configuration
// ---------------------------------------------------------------------------

const actionConfig: Record<
  AuditAction,
  { label: string; bgColor: string; textColor: string; icon: React.ReactNode }
> = {
  created: {
    label: "Criado",
    bgColor: "bg-status-success-light",
    textColor: "text-status-success",
    icon: <Plus className="h-3 w-3" />,
  },
  updated: {
    label: "Atualizado",
    bgColor: "bg-status-info-light",
    textColor: "text-status-info",
    icon: <Pencil className="h-3 w-3" />,
  },
  deleted: {
    label: "Excluído",
    bgColor: "bg-status-danger-light",
    textColor: "text-status-danger",
    icon: <Trash2 className="h-3 w-3" />,
  },
  moved: {
    label: "Movido",
    bgColor: "bg-status-warning-light",
    textColor: "text-status-warning",
    icon: <ArrowRight className="h-3 w-3" />,
  },
};

const entityTypeLabels: Record<EntityType, string> = {
  opportunity: "Oportunidade",
  client: "Cliente",
  activity: "Atividade",
  user: "Usuário",
  settings: "Configuração",
};

const entityFilterOptions = [
  { value: "all", label: "Todos" },
  { value: "opportunity", label: "Oportunidades" },
  { value: "client", label: "Clientes" },
  { value: "activity", label: "Atividades" },
  { value: "user", label: "Usuários" },
  { value: "settings", label: "Configurações" },
];

const userFilterOptions = [
  { value: "all", label: "Todos os usuários" },
  { value: "Ana Souza", label: "Ana Souza" },
  { value: "Carlos Lima", label: "Carlos Lima" },
  { value: "Fernanda Reis", label: "Fernanda Reis" },
  { value: "Pedro Alves", label: "Pedro Alves" },
  { value: "Sistema", label: "Sistema" },
];

// ---------------------------------------------------------------------------
// Mock Audit Events
// ---------------------------------------------------------------------------

const mockAuditEvents: AuditEvent[] = [
  {
    id: "audit-1",
    timestamp: "2025-01-15T14:32:00",
    user: { name: "Ana Souza", initials: "AS", color: "bg-brand-light text-brand" },
    action: "created",
    entityType: "opportunity",
    entityName: "Restaurante Bela Vista",
    details: "Nova oportunidade criada no pipeline Vendas, etapa Lead-In",
    fullDetails:
      "Pipeline: Vendas\nEtapa: Lead-In\nValor: R$ 15.000\nResponsável: Ana Souza\nCliente: Restaurante Bela Vista\nProbabilidade: 20%",
  },
  {
    id: "audit-2",
    timestamp: "2025-01-15T13:45:00",
    user: { name: "Carlos Lima", initials: "CL", color: "bg-status-success-light text-status-success" },
    action: "moved",
    entityType: "opportunity",
    entityName: "Café Central",
    details: "Movido de Proposta Enviada para Negociação",
    fullDetails:
      "Oportunidade: Café Central\nEtapa anterior: Proposta Enviada\nNova etapa: Negociação\nValor atualizado: R$ 8.500\nDias na etapa anterior: 5",
  },
  {
    id: "audit-3",
    timestamp: "2025-01-15T12:20:00",
    user: { name: "Fernanda Reis", initials: "FR", color: "bg-status-warning-light text-status-warning" },
    action: "updated",
    entityType: "client",
    entityName: "Acme Corp",
    details: "Health Score atualizado de 85 para 72",
    fullDetails:
      "Cliente: Acme Corp\nCampo alterado: Health Score\nValor anterior: 85\nNovo valor: 72\nMotivo: Redução de engajamento nos últimos 30 dias",
  },
  {
    id: "audit-4",
    timestamp: "2025-01-15T11:10:00",
    user: { name: "Ana Souza", initials: "AS", color: "bg-brand-light text-brand" },
    action: "created",
    entityType: "activity",
    entityName: "Ligação com João",
    details: "Atividade do tipo ligação agendada para 16/01 às 10:00",
    fullDetails:
      "Tipo: Ligação\nData: 16/01/2025\nHorário: 10:00\nDuração prevista: 30min\nCliente: Restaurante Bela Vista\nNotas: Discutir termos do contrato",
  },
  {
    id: "audit-5",
    timestamp: "2025-01-15T10:55:00",
    user: { name: "Pedro Alves", initials: "PA", color: "bg-status-info-light text-status-info" },
    action: "deleted",
    entityType: "activity",
    entityName: "Follow-up Padaria Gourmet",
    details: "Atividade excluída — duplicada",
    fullDetails:
      "Tipo: Follow-up\nData original: 15/01/2025\nMotivo da exclusão: Atividade duplicada\nExcluído por: Pedro Alves",
  },
  {
    id: "audit-6",
    timestamp: "2025-01-15T09:30:00",
    user: { name: "Sistema", initials: "SI", color: "bg-zinc-100 text-zinc-500" },
    action: "updated",
    entityType: "settings",
    entityName: "Pipeline Vendas",
    details: "SLA da etapa Proposta Enviada alterado de 5 para 7 dias",
    fullDetails:
      "Configuração: Pipeline Vendas\nEtapa: Proposta Enviada\nCampo: SLA\nValor anterior: 5 dias\nNovo valor: 7 dias\nAlterado por: Sistema (automação)",
  },
  {
    id: "audit-7",
    timestamp: "2025-01-14T17:45:00",
    user: { name: "Carlos Lima", initials: "CL", color: "bg-status-success-light text-status-success" },
    action: "created",
    entityType: "client",
    entityName: "Hotel Sunset",
    details: "Novo cliente cadastrado com origem Indicação",
    fullDetails:
      "Nome: Hotel Sunset\nOrigem: Indicação\nSegmento: Hotelaria\nResponsável: Carlos Lima\nTelefone: (11) 98765-4321\nEmail: contato@hotelsunset.com",
  },
  {
    id: "audit-8",
    timestamp: "2025-01-14T16:20:00",
    user: { name: "Ana Souza", initials: "AS", color: "bg-brand-light text-brand" },
    action: "updated",
    entityType: "opportunity",
    entityName: "Pousada Mar",
    details: "Valor atualizado de R$ 12.000 para R$ 14.500",
    fullDetails:
      "Oportunidade: Pousada Mar\nCampo alterado: Valor\nValor anterior: R$ 12.000\nNovo valor: R$ 14.500\nMotivo: Inclusão de módulo adicional de reservas",
  },
  {
    id: "audit-9",
    timestamp: "2025-01-14T15:00:00",
    user: { name: "Fernanda Reis", initials: "FR", color: "bg-status-warning-light text-status-warning" },
    action: "moved",
    entityType: "opportunity",
    entityName: "TechCorp",
    details: "Movido de Negociação para Fechamento",
    fullDetails:
      "Oportunidade: TechCorp\nEtapa anterior: Negociação\nNova etapa: Fechamento\nValor: R$ 22.000\nProbabilidade: 90%\nPrevisão de fechamento: 20/01/2025",
  },
  {
    id: "audit-10",
    timestamp: "2025-01-14T14:30:00",
    user: { name: "Pedro Alves", initials: "PA", color: "bg-status-info-light text-status-info" },
    action: "created",
    entityType: "activity",
    entityName: "Reunião de apresentação",
    details: "Reunião agendada com Hotel Sunset para 17/01",
    fullDetails:
      "Tipo: Reunião\nData: 17/01/2025\nHorário: 14:00\nDuração prevista: 1h\nLocal: Online (Zoom)\nParticipantes: Pedro Alves, Carlos Lima, Gerente do Hotel Sunset",
  },
  {
    id: "audit-11",
    timestamp: "2025-01-14T11:15:00",
    user: { name: "Sistema", initials: "SI", color: "bg-zinc-100 text-zinc-500" },
    action: "created",
    entityType: "user",
    entityName: "Mariana Costa",
    details: "Novo usuário convidado com perfil Comercial",
    fullDetails:
      "Nome: Mariana Costa\nEmail: mariana@flow.com\nPerfil: Comercial\nConvidado por: Ana Souza\nStatus: Convite enviado",
  },
  {
    id: "audit-12",
    timestamp: "2025-01-14T10:00:00",
    user: { name: "Ana Souza", initials: "AS", color: "bg-brand-light text-brand" },
    action: "updated",
    entityType: "settings",
    entityName: "Campos personalizados",
    details: "Novo campo \"Segmento\" adicionado ao cadastro de clientes",
    fullDetails:
      "Configuração: Campos personalizados\nEntidade: Clientes\nAção: Novo campo adicionado\nNome do campo: Segmento\nTipo: Select\nOpções: Restaurante, Hotelaria, Cafeteria, Padaria, Outro",
  },
  {
    id: "audit-13",
    timestamp: "2025-01-13T16:30:00",
    user: { name: "Carlos Lima", initials: "CL", color: "bg-status-success-light text-status-success" },
    action: "deleted",
    entityType: "opportunity",
    entityName: "Pizzaria Roma",
    details: "Oportunidade excluída — cliente desistiu",
    fullDetails:
      "Oportunidade: Pizzaria Roma\nValor: R$ 5.000\nEtapa: Contato Feito\nMotivo: Cliente optou por outro fornecedor\nDias no pipeline: 12",
  },
  {
    id: "audit-14",
    timestamp: "2025-01-13T14:00:00",
    user: { name: "Fernanda Reis", initials: "FR", color: "bg-status-warning-light text-status-warning" },
    action: "updated",
    entityType: "client",
    entityName: "Padaria Gourmet",
    details: "Telefone e e-mail de contato atualizados",
    fullDetails:
      "Cliente: Padaria Gourmet\nCampos alterados: Telefone, Email\nTelefone anterior: (11) 3456-7890\nNovo telefone: (11) 3456-7899\nEmail anterior: contato@padariagourmet.com\nNovo email: vendas@padariagourmet.com",
  },
  {
    id: "audit-15",
    timestamp: "2025-01-13T10:45:00",
    user: { name: "Pedro Alves", initials: "PA", color: "bg-status-info-light text-status-info" },
    action: "moved",
    entityType: "opportunity",
    entityName: "Bistrô Jardim",
    details: "Movido de Lead-In para Contato Feito",
    fullDetails:
      "Oportunidade: Bistrô Jardim\nEtapa anterior: Lead-In\nNova etapa: Contato Feito\nValor: R$ 9.000\nPrimeiro contato realizado via telefone\nPróxima ação: Agendar reunião presencial",
  },
  {
    id: "audit-16",
    timestamp: "2025-01-13T09:00:00",
    user: { name: "Ana Souza", initials: "AS", color: "bg-brand-light text-brand" },
    action: "created",
    entityType: "opportunity",
    entityName: "Cervejaria Artesanal",
    details: "Nova oportunidade criada via formulário web",
    fullDetails:
      "Pipeline: Vendas\nEtapa: Lead-In\nValor estimado: R$ 18.000\nOrigem: Formulário do site\nCliente: Cervejaria Artesanal\nResponsável: Ana Souza",
  },
  {
    id: "audit-17",
    timestamp: "2025-01-12T17:00:00",
    user: { name: "Sistema", initials: "SI", color: "bg-zinc-100 text-zinc-500" },
    action: "updated",
    entityType: "user",
    entityName: "Carlos Lima",
    details: "Perfil alterado de Comercial para Admin",
    fullDetails:
      "Usuário: Carlos Lima\nCampo alterado: Perfil de acesso\nPerfil anterior: Comercial\nNovo perfil: Admin\nAlterado por: Ana Souza (Admin)",
  },
];

const TOTAL_RECORDS = 247;
const PAGE_SIZE = 15;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Expandable Row
// ---------------------------------------------------------------------------

function AuditRow({
  event,
  isExpanded,
  onToggle,
}: {
  event: AuditEvent;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const config = actionConfig[event.action];

  return (
    <>
      <TableRow
        className="cursor-pointer transition-colors hover:bg-zinc-50"
        onClick={onToggle}
      >
        {/* Data/Hora */}
        <TableCell>
          <span className="font-body text-sm text-zinc-600">
            {formatDateTime(event.timestamp)}
          </span>
        </TableCell>

        {/* Usuário */}
        <TableCell>
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarFallback className={`text-[10px] ${event.user.color}`}>
                {event.user.initials}
              </AvatarFallback>
            </Avatar>
            <span className="font-body text-sm font-medium text-black">
              {event.user.name}
            </span>
          </div>
        </TableCell>

        {/* Ação */}
        <TableCell>
          <span
            className={`inline-flex items-center gap-1 rounded-[10px] px-2 py-1 font-body text-xs font-medium ${config.bgColor} ${config.textColor}`}
          >
            {config.icon}
            {config.label}
          </span>
        </TableCell>

        {/* Entidade */}
        <TableCell>
          <div className="flex flex-col">
            <span className="font-body text-sm font-medium text-black">
              {event.entityName}
            </span>
            <span className="font-body text-xs text-zinc-400">
              {entityTypeLabels[event.entityType]}
            </span>
          </div>
        </TableCell>

        {/* Detalhes */}
        <TableCell>
          <div className="flex items-center gap-2">
            <span className="flex-1 truncate font-body text-sm text-zinc-600">
              {event.details}
            </span>
            {event.fullDetails && (
              <button className="shrink-0 text-zinc-400">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded details row */}
      {isExpanded && event.fullDetails && (
        <TableRow className="bg-zinc-50/50">
          <TableCell colSpan={5} className="px-6 py-4">
            <div className="rounded-[10px] bg-zinc-100 p-4">
              <p className="mb-2 font-heading text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Detalhes completos
              </p>
              <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed text-zinc-600">
                {event.fullDetails}
              </pre>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function AuditPage() {
  const [entityFilter, setEntityFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter events
  const filteredEvents = useMemo(() => {
    return mockAuditEvents.filter((event) => {
      if (entityFilter !== "all" && event.entityType !== entityFilter) {
        return false;
      }
      if (userFilter !== "all" && event.user.name !== userFilter) {
        return false;
      }
      if (dateFrom) {
        const eventDate = new Date(event.timestamp);
        const fromDate = new Date(dateFrom);
        if (eventDate < fromDate) return false;
      }
      if (dateTo) {
        const eventDate = new Date(event.timestamp);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59);
        if (eventDate > toDate) return false;
      }
      return true;
    });
  }, [entityFilter, userFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(TOTAL_RECORDS / PAGE_SIZE);
  const showingFrom = (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * PAGE_SIZE, TOTAL_RECORDS);

  const handleToggleRow = useCallback((id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  }, []);

  const handleClearFilters = useCallback(() => {
    setEntityFilter("all");
    setUserFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters =
    entityFilter !== "all" || userFilter !== "all" || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-black sm:text-3xl">
            Log de Auditoria
          </h1>
          <p className="mt-1 font-body text-sm text-zinc-500">
            Rastreie todas as ações realizadas no sistema
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-[10px] bg-zinc-50 px-3 py-2">
          <Shield className="h-4 w-4 text-zinc-400" />
          <span className="font-body text-xs text-zinc-500">
            Registros mantidos por 5 anos
          </span>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-end gap-3 rounded-[15px] border border-zinc-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <span className="font-heading text-sm font-medium text-black">
            Filtros
          </span>
        </div>

        {/* Entity type filter */}
        <div className="space-y-1">
          <label className="font-body text-xs text-zinc-500">Entidade</label>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-full rounded-[10px] sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {entityFilterOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* User filter */}
        <div className="space-y-1">
          <label className="font-body text-xs text-zinc-500">Usuário</label>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-full rounded-[10px] sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {userFilterOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date range */}
        <div className="space-y-1">
          <label className="font-body text-xs text-zinc-500">Data início</label>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-[10px] pl-8 font-body text-sm sm:w-[150px]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-body text-xs text-zinc-500">Data fim</label>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-[10px] pl-8 font-body text-sm sm:w-[150px]"
            />
          </div>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="rounded-full font-heading text-zinc-500"
          >
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Audit Table */}
      <div className="rounded-[15px] border border-zinc-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-b-zinc-200 hover:bg-transparent">
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Data/Hora
              </TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Usuário
              </TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Ação
              </TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Entidade
              </TableHead>
              <TableHead className="font-heading text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Detalhes
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <AuditRow
                  key={event.id}
                  event={event}
                  isExpanded={expandedRow === event.id}
                  onToggle={() => handleToggleRow(event.id)}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-zinc-400">
                    <Search className="h-8 w-8" />
                    <p className="font-body text-sm">
                      Nenhum registro encontrado com os filtros aplicados
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="mt-2 rounded-full font-heading text-brand"
                    >
                      Limpar filtros
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination footer */}
        {filteredEvents.length > 0 && (
          <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3">
            <span className="font-body text-sm text-zinc-500">
              Mostrando {showingFrom}-{showingTo} de {TOTAL_RECORDS} registros
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-full"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="icon-xs"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`rounded-full font-heading text-xs ${
                      currentPage === pageNum
                        ? "bg-black text-white hover:bg-zinc-800"
                        : "text-zinc-600"
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="px-1 font-body text-xs text-zinc-400">
                    ...
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setCurrentPage(totalPages)}
                    className="rounded-full font-heading text-xs text-zinc-600"
                  >
                    {totalPages}
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                size="icon-xs"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-full"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Retention notice */}
      <div className="flex items-center justify-center gap-2 rounded-[15px] bg-zinc-50 py-3">
        <Shield className="h-4 w-4 text-zinc-400" />
        <span className="font-body text-sm text-zinc-500">
          Registros mantidos por 5 anos conforme política de retenção de dados
        </span>
      </div>
    </div>
  );
}
