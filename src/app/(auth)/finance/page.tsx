"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  FileDown,
  AlertTriangle,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineFeedback } from "@/components/ui/inline-feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { exportToCSV, exportToPDF, exportToExcel } from "@/lib/export";
import type { CommissionStatus } from "@/types";

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

// ===== Helpers =====

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ===== Status Config =====

type ExtendedCommissionStatus = CommissionStatus;

const statusConfig: Record<
  ExtendedCommissionStatus,
  {
    label: string;
    className: string;
  }
> = {
  projected: {
    label: "Projetada",
    className: "bg-status-info-light text-status-info",
  },
  confirmed: {
    label: "Confirmada",
    className: "bg-status-warning-light text-status-warning",
  },
  paid: {
    label: "Paga",
    className: "bg-status-success-light text-status-success",
  },
  contested: {
    label: "Em Contestação",
    className: "bg-orange-100 text-orange-600",
  },
};

// ===== Mock Data =====

interface MockCommission {
  id: string;
  opportunityTitle: string;
  userName: string;
  userAvatar?: string;
  value: number;
  baseValue: number;
  percentage: number;
  status: ExtendedCommissionStatus;
  competenceMonth: string;
  paidAt?: string;
  stage: string;
  closeDate: string;
  contestationReason?: string;
}

const mockCommissions: MockCommission[] = [
  {
    id: "1",
    opportunityTitle: "Restaurante Bela Vista",
    userName: "Maria Silva",
    value: 1200,
    baseValue: 12000,
    percentage: 10,
    status: "projected",
    competenceMonth: "2026-02",
    stage: "Proposta Enviada",
    closeDate: "2026-02-28",
  },
  {
    id: "2",
    opportunityTitle: "Hotel Sunset Premium",
    userName: "Maria Silva",
    value: 3600,
    baseValue: 36000,
    percentage: 10,
    status: "confirmed",
    competenceMonth: "2026-02",
    stage: "Contrato Assinado",
    closeDate: "2026-02-15",
  },
  {
    id: "3",
    opportunityTitle: "Café Central Express",
    userName: "João Santos",
    value: 600,
    baseValue: 6000,
    percentage: 10,
    status: "paid",
    competenceMonth: "2026-02",
    paidAt: "2026-02-05",
    stage: "Finalizado",
    closeDate: "2026-01-20",
  },
  {
    id: "4",
    opportunityTitle: "Pousada Mar Azul",
    userName: "João Santos",
    value: 2400,
    baseValue: 24000,
    percentage: 10,
    status: "confirmed",
    competenceMonth: "2026-02",
    stage: "Contrato Assinado",
    closeDate: "2026-02-10",
  },
  {
    id: "5",
    opportunityTitle: "Churrascaria Fogo Bravo",
    userName: "Maria Silva",
    value: 1800,
    baseValue: 18000,
    percentage: 10,
    status: "projected",
    competenceMonth: "2026-02",
    stage: "Negociação",
    closeDate: "2026-03-05",
  },
  {
    id: "6",
    opportunityTitle: "Padaria São José",
    userName: "Ana Oliveira",
    value: 900,
    baseValue: 9000,
    percentage: 10,
    status: "paid",
    competenceMonth: "2026-02",
    paidAt: "2026-02-03",
    stage: "Finalizado",
    closeDate: "2026-01-25",
  },
  {
    id: "7",
    opportunityTitle: "Loja TechStore",
    userName: "Ana Oliveira",
    value: 4500,
    baseValue: 45000,
    percentage: 10,
    status: "projected",
    competenceMonth: "2026-02",
    stage: "Qualificação",
    closeDate: "2026-03-15",
  },
  {
    id: "8",
    opportunityTitle: "Clínica Saúde Total",
    userName: "Carlos Mendes",
    value: 2100,
    baseValue: 21000,
    percentage: 10,
    status: "confirmed",
    competenceMonth: "2026-02",
    stage: "Contrato Assinado",
    closeDate: "2026-02-12",
  },
  {
    id: "9",
    opportunityTitle: "Academia FitLife",
    userName: "Carlos Mendes",
    value: 1500,
    baseValue: 15000,
    percentage: 10,
    status: "paid",
    competenceMonth: "2026-02",
    paidAt: "2026-02-01",
    stage: "Finalizado",
    closeDate: "2026-01-18",
  },
  {
    id: "10",
    opportunityTitle: "Escritório ContábilPro",
    userName: "João Santos",
    value: 750,
    baseValue: 7500,
    percentage: 10,
    status: "projected",
    competenceMonth: "2026-02",
    stage: "Proposta Enviada",
    closeDate: "2026-03-01",
  },
];

const allSellers = [
  "Maria Silva",
  "João Santos",
  "Ana Oliveira",
  "Carlos Mendes",
];

// ===== Component =====

export default function FinancePage() {
  // Period selector state
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Tab state
  const [tab, setTab] = useState("all");

  // Seller filter
  const [sellerFilter, setSellerFilter] = useState("all");

  // Expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Contestation dialog
  const [contestDialogOpen, setContestDialogOpen] = useState(false);
  const [contestCommissionId, setContestCommissionId] = useState<string | null>(
    null
  );
  const [contestReason, setContestReason] = useState("");
  const [isSubmittingContest, setIsSubmittingContest] = useState(false);
  const [contestFeedback, setContestFeedback] = useState<{type: "success" | "error" | "info", message: string} | null>(null);
  const [contestFieldError, setContestFieldError] = useState<string | null>(null);

  // Export feedback
  const [exportFeedback, setExportFeedback] = useState<{type: "success" | "error" | "info", message: string} | null>(null);

  // Local commission state (for status mutations)
  const [commissions, setCommissions] =
    useState<MockCommission[]>(mockCommissions);

  // Period label
  const periodLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
  const periodKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;

  function handlePrevMonth() {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  }

  // Filter commissions by period and seller
  const filteredByPeriodAndSeller = useMemo(() => {
    return commissions.filter((c) => {
      const matchesPeriod = c.competenceMonth === periodKey;
      const matchesSeller =
        sellerFilter === "all" || c.userName === sellerFilter;
      return matchesPeriod && matchesSeller;
    });
  }, [commissions, periodKey, sellerFilter]);

  // Filter by tab
  const filtered = useMemo(() => {
    if (tab === "all") return filteredByPeriodAndSeller;
    return filteredByPeriodAndSeller.filter((c) => c.status === tab);
  }, [filteredByPeriodAndSeller, tab]);

  // Summary calculations
  const summary = useMemo(() => {
    const projected = filteredByPeriodAndSeller
      .filter((c) => c.status === "projected")
      .reduce((sum, c) => sum + c.value, 0);
    const confirmed = filteredByPeriodAndSeller
      .filter((c) => c.status === "confirmed" || c.status === "contested")
      .reduce((sum, c) => sum + c.value, 0);
    const paid = filteredByPeriodAndSeller
      .filter((c) => c.status === "paid")
      .reduce((sum, c) => sum + c.value, 0);
    const total = projected + confirmed + paid;
    return { projected, confirmed, paid, total };
  }, [filteredByPeriodAndSeller]);

  // Team summary
  const teamSummary = useMemo(() => {
    const map = new Map<
      string,
      { projected: number; confirmed: number; paid: number }
    >();
    filteredByPeriodAndSeller.forEach((c) => {
      if (!map.has(c.userName)) {
        map.set(c.userName, { projected: 0, confirmed: 0, paid: 0 });
      }
      const entry = map.get(c.userName)!;
      if (c.status === "projected") entry.projected += c.value;
      else if (c.status === "confirmed" || c.status === "contested")
        entry.confirmed += c.value;
      else if (c.status === "paid") entry.paid += c.value;
    });
    return Array.from(map.entries()).map(([name, totals]) => ({
      name,
      ...totals,
    }));
  }, [filteredByPeriodAndSeller]);

  // Row expand toggle
  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // Contestation handlers
  function openContestDialog(commissionId: string) {
    setContestCommissionId(commissionId);
    setContestReason("");
    setContestFeedback(null);
    setContestFieldError(null);
    setContestDialogOpen(true);
  }

  async function submitContestation() {
    setContestFieldError(null);
    setContestFeedback(null);

    if (!contestCommissionId || !contestReason.trim()) {
      setContestFieldError("Por favor, informe o motivo da contestação.");
      return;
    }

    setIsSubmittingContest(true);

    try {
      // Simulate API delay (replace with real API call in production)
      await new Promise((resolve) => setTimeout(resolve, 800));

      // POST /api/commissions/:id/contest { reason }
      // const response = await fetch(`/api/commissions/${contestCommissionId}/contest`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ reason: contestReason }),
      // });
      // if (!response.ok) throw new Error("Falha ao enviar contestação");

      setCommissions((prev) =>
        prev.map((c) =>
          c.id === contestCommissionId
            ? {
                ...c,
                status: "contested" as ExtendedCommissionStatus,
                contestationReason: contestReason,
              }
            : c
        )
      );

      setContestFeedback({ type: "success", message: "Contestação enviada com sucesso." });
      setTimeout(() => {
        setContestDialogOpen(false);
        setContestCommissionId(null);
        setContestReason("");
        setContestFeedback(null);
      }, 1500);
    } catch {
      setContestFeedback({ type: "error", message: "Erro ao enviar contestação. Tente novamente em alguns instantes." });
    } finally {
      setIsSubmittingContest(false);
    }
  }

  // Export handlers
  function handleExport(format: "csv" | "pdf" | "excel") {
    const exportData = filtered.map((c) => ({
      Oportunidade: c.opportunityTitle,
      Vendedor: c.userName,
      "Valor Base": c.baseValue,
      "Percentual (%)": c.percentage,
      Comissão: c.value,
      Status: statusConfig[c.status].label,
      Competência: c.competenceMonth,
      Etapa: c.stage,
      Fechamento: c.closeDate,
      "Pago em": c.paidAt ?? "",
    }));

    const filename = `comissoes-${periodKey}`;

    switch (format) {
      case "csv":
        exportToCSV(exportData, filename);
        setExportFeedback({ type: "success", message: `Exportação CSV concluída. Arquivo ${filename}.csv baixado.` });
        setTimeout(() => setExportFeedback(null), 3000);
        break;
      case "pdf":
        exportToPDF(exportData, filename);
        setExportFeedback({ type: "info", message: "Exportação PDF/Excel será implementada em breve." });
        setTimeout(() => setExportFeedback(null), 3000);
        break;
      case "excel":
        exportToExcel(exportData, filename);
        setExportFeedback({ type: "info", message: "Exportação PDF/Excel será implementada em breve." });
        setTimeout(() => setExportFeedback(null), 3000);
        break;
    }
  }

  // Percentage helper
  function pct(value: number, total: number) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  return (
    <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-black sm:text-3xl">
            Financeiro
          </h1>
          <p className="mt-1 font-body text-sm text-zinc-500">
            Acompanhe comissões e receitas
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Seller Filter */}
          <Select value={sellerFilter} onValueChange={setSellerFilter}>
            <SelectTrigger className="h-9 rounded-full border-zinc-200 font-body text-sm">
              <SelectValue placeholder="Vendedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os vendedores</SelectItem>
              {allSellers.map((seller) => (
                <SelectItem key={seller} value={seller}>
                  {seller}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full font-heading text-sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Export Feedback */}
      {exportFeedback && (
        <motion.div variants={fadeUp}>
          <InlineFeedback
            type={exportFeedback.type}
            message={exportFeedback.message}
            compact
            onClose={() => setExportFeedback(null)}
          />
        </motion.div>
      )}

      {/* Period Selector */}
      <motion.div variants={fadeUp} className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full border-zinc-200"
          onClick={handlePrevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[120px] text-center font-heading text-lg font-semibold text-black sm:min-w-[200px]">
          {periodLabel}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full border-zinc-200"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Projetado */}
        <Card className="rounded-[15px] border-zinc-200 p-5">
          <CardContent className="p-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-status-info-light">
                <TrendingUp className="h-5 w-5 text-status-info" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-body text-xs text-zinc-500">Projetado</p>
                  {summary.total > 0 && (
                    <Badge className="rounded-[10px] bg-status-info-light font-body text-[10px] text-status-info">
                      {pct(summary.projected, summary.total)}%
                    </Badge>
                  )}
                </div>
                <p className="font-heading text-xl font-bold text-black">
                  {formatCurrency(summary.projected)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmado */}
        <Card className="rounded-[15px] border-zinc-200 p-5">
          <CardContent className="p-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-status-warning-light">
                <Clock className="h-5 w-5 text-status-warning" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-body text-xs text-zinc-500">Confirmado</p>
                  {summary.total > 0 && (
                    <Badge className="rounded-[10px] bg-status-warning-light font-body text-[10px] text-status-warning">
                      {pct(summary.confirmed, summary.total)}%
                    </Badge>
                  )}
                </div>
                <p className="font-heading text-xl font-bold text-black">
                  {formatCurrency(summary.confirmed)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pago */}
        <Card className="rounded-[15px] border-zinc-200 p-5">
          <CardContent className="p-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-status-success-light">
                <CheckCircle2 className="h-5 w-5 text-status-success" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-body text-xs text-zinc-500">Pago</p>
                  {summary.total > 0 && (
                    <Badge className="rounded-[10px] bg-status-success-light font-body text-[10px] text-status-success">
                      {pct(summary.paid, summary.total)}%
                    </Badge>
                  )}
                </div>
                <p className="font-heading text-xl font-bold text-black">
                  {formatCurrency(summary.paid)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Commissions Table */}
      <motion.div variants={fadeUp}>
      <Card className="rounded-[15px] border-zinc-200">
        <CardHeader>
          <CardTitle className="font-heading text-lg font-semibold text-black">
            Comissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-4 border-b border-zinc-200 bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent px-4 font-body text-sm data-[state=active]:border-black data-[state=active]:text-black"
              >
                Todas
              </TabsTrigger>
              <TabsTrigger
                value="projected"
                className="rounded-none border-b-2 border-transparent px-4 font-body text-sm data-[state=active]:border-black data-[state=active]:text-black"
              >
                Projetadas
              </TabsTrigger>
              <TabsTrigger
                value="confirmed"
                className="rounded-none border-b-2 border-transparent px-4 font-body text-sm data-[state=active]:border-black data-[state=active]:text-black"
              >
                Confirmadas
              </TabsTrigger>
              <TabsTrigger
                value="paid"
                className="rounded-none border-b-2 border-transparent px-4 font-body text-sm data-[state=active]:border-black data-[state=active]:text-black"
              >
                Pagas
              </TabsTrigger>
            </TabsList>

            <TabsContent value={tab}>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="font-body text-sm text-zinc-400">
                    Nenhuma comissão encontrada para este período.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-100">
                      <TableHead className="w-8 font-body text-xs font-medium uppercase text-zinc-500" />
                      <TableHead className="font-body text-xs font-medium uppercase text-zinc-500">
                        Oportunidade
                      </TableHead>
                      <TableHead className="font-body text-xs font-medium uppercase text-zinc-500">
                        Vendedor
                      </TableHead>
                      <TableHead className="font-body text-xs font-medium uppercase text-zinc-500">
                        %
                      </TableHead>
                      <TableHead className="font-body text-xs font-medium uppercase text-zinc-500">
                        Valor
                      </TableHead>
                      <TableHead className="font-body text-xs font-medium uppercase text-zinc-500">
                        Competência
                      </TableHead>
                      <TableHead className="font-body text-xs font-medium uppercase text-zinc-500">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((commission) => {
                      const config = statusConfig[commission.status];
                      const isExpanded = expandedRows.has(commission.id);
                      return (
                        <CommissionRow
                          key={commission.id}
                          commission={commission}
                          config={config}
                          isExpanded={isExpanded}
                          onToggle={() => toggleRow(commission.id)}
                          onContest={() => openContestDialog(commission.id)}
                        />
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </motion.div>

      {/* Team Summary (admin/master view) */}
      {teamSummary.length > 0 && (
        <motion.div variants={fadeUp}>
        <Card className="rounded-[15px] border-zinc-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-zinc-500" />
              <CardTitle className="font-heading text-lg font-semibold text-black">
                Resumo por Vendedor
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {teamSummary.map((member) => (
                <div
                  key={member.name}
                  className="flex items-start gap-3 rounded-[15px] border border-zinc-100 p-4"
                >
                  <Avatar size="default">
                    <AvatarFallback className="bg-zinc-100 font-heading text-xs text-zinc-600">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <p className="font-heading text-sm font-semibold text-black">
                      {member.name}
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-body text-[11px] text-status-info">
                          Projetado
                        </span>
                        <span className="font-heading text-xs font-medium text-black">
                          {formatCurrency(member.projected)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-body text-[11px] text-status-warning">
                          Confirmado
                        </span>
                        <span className="font-heading text-xs font-medium text-black">
                          {formatCurrency(member.confirmed)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-body text-[11px] text-status-success">
                          Pago
                        </span>
                        <span className="font-heading text-xs font-medium text-black">
                          {formatCurrency(member.paid)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </motion.div>
      )}

      {/* Contestation Dialog */}
      <Dialog open={contestDialogOpen} onOpenChange={setContestDialogOpen}>
        <DialogContent className="rounded-[15px] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold">
              Contestar Comissão
            </DialogTitle>
            <DialogDescription className="font-body text-sm text-zinc-500">
              Informe o motivo da contestação. A comissão ficará com status
              &quot;Em Contestação&quot; até análise.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Textarea
              className="min-h-[100px] rounded-[15px] font-body text-sm"
              placeholder="Descreva o motivo da contestação..."
              value={contestReason}
              onChange={(e) => {
                setContestReason(e.target.value);
                if (contestFieldError) setContestFieldError(null);
              }}
            />
            {contestFieldError && (
              <p className="text-xs text-status-danger">{contestFieldError}</p>
            )}
          </div>
          {contestFeedback && (
            <InlineFeedback
              type={contestFeedback.type}
              message={contestFeedback.message}
              compact
              onClose={() => setContestFeedback(null)}
            />
          )}
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full font-heading text-sm"
              onClick={() => setContestDialogOpen(false)}
              disabled={isSubmittingContest}
            >
              Cancelar
            </Button>
            <Button
              className="rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
              onClick={submitContestation}
              disabled={isSubmittingContest}
            >
              {isSubmittingContest && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmittingContest ? "Enviando..." : "Enviar Contestação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// ===== Commission Row Sub-Component =====

function CommissionRow({
  commission,
  config,
  isExpanded,
  onToggle,
  onContest,
}: {
  commission: MockCommission;
  config: { label: string; className: string };
  isExpanded: boolean;
  onToggle: () => void;
  onContest: () => void;
}) {
  return (
    <>
      <TableRow
        className="h-[52px] cursor-pointer border-zinc-100 transition-colors hover:bg-zinc-50"
        onClick={onToggle}
      >
        <TableCell className="w-8 pr-0">
          <ChevronDown
            className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </TableCell>
        <TableCell className="font-body text-sm text-black">
          {commission.opportunityTitle}
        </TableCell>
        <TableCell className="font-body text-sm text-zinc-600">
          {commission.userName}
        </TableCell>
        <TableCell className="font-body text-sm text-zinc-600">
          {commission.percentage}%
        </TableCell>
        <TableCell className="font-heading text-sm font-medium text-black">
          {formatCurrency(commission.value)}
        </TableCell>
        <TableCell className="font-body text-sm text-zinc-600">
          {MONTH_NAMES[parseInt(commission.competenceMonth.split("-")[1], 10) - 1]}{" "}
          {commission.competenceMonth.split("-")[0]}
        </TableCell>
        <TableCell>
          <Badge
            className={`rounded-[10px] font-body text-xs ${config.className}`}
          >
            {config.label}
          </Badge>
        </TableCell>
      </TableRow>

      {/* Expanded Details */}
      {isExpanded && (
        <TableRow className="border-zinc-100 bg-zinc-50/50">
          <TableCell colSpan={7} className="p-0">
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* Opportunity Details */}
                <div className="space-y-2">
                  <p className="font-heading text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Detalhes da Oportunidade
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-body text-xs text-zinc-500">
                        Nome
                      </span>
                      <span className="font-body text-xs text-black">
                        {commission.opportunityTitle}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-xs text-zinc-500">
                        Etapa
                      </span>
                      <span className="font-body text-xs text-black">
                        {commission.stage}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-xs text-zinc-500">
                        Fechamento
                      </span>
                      <span className="font-body text-xs text-black">
                        {formatDate(commission.closeDate)}
                      </span>
                    </div>
                    {commission.paidAt && (
                      <div className="flex justify-between">
                        <span className="font-body text-xs text-zinc-500">
                          Pago em
                        </span>
                        <span className="font-body text-xs text-black">
                          {formatDate(commission.paidAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="space-y-2">
                  <p className="font-heading text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Cálculo da Comissão
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-body text-xs text-zinc-500">
                        Valor base
                      </span>
                      <span className="font-body text-xs text-black">
                        {formatCurrency(commission.baseValue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-xs text-zinc-500">
                        Percentual
                      </span>
                      <span className="font-body text-xs text-black">
                        {commission.percentage}%
                      </span>
                    </div>
                    <div className="mt-1 border-t border-zinc-200 pt-1">
                      <div className="flex justify-between">
                        <span className="font-heading text-xs font-semibold text-zinc-600">
                          Comissão
                        </span>
                        <span className="font-heading text-xs font-semibold text-black">
                          {formatCurrency(commission.baseValue)} x{" "}
                          {commission.percentage}% ={" "}
                          {formatCurrency(commission.value)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <p className="font-heading text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Ações
                  </p>
                  {commission.status === "confirmed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-orange-300 font-heading text-xs text-orange-600 hover:bg-orange-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onContest();
                      }}
                    >
                      <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                      Contestar
                    </Button>
                  )}
                  {commission.status === "contested" && (
                    <div className="space-y-1">
                      <Badge className="rounded-[10px] bg-orange-100 font-body text-xs text-orange-600">
                        Em Contestação
                      </Badge>
                      {commission.contestationReason && (
                        <p className="font-body text-xs italic text-zinc-500">
                          &quot;{commission.contestationReason}&quot;
                        </p>
                      )}
                    </div>
                  )}
                  {commission.status === "paid" && (
                    <p className="font-body text-xs text-status-success">
                      Comissão paga em {formatDate(commission.paidAt!)}
                    </p>
                  )}
                  {commission.status === "projected" && (
                    <p className="font-body text-xs text-zinc-400">
                      Aguardando confirmação
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
