"use client";

import { useState } from "react";
import {
  BarChart3,
  Users,
  Activity,
  DollarSign,
  Heart,
  Clock,
  FileDown,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { exportToCSV, exportToPDF, exportToExcel } from "@/lib/export";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

interface ReportRow {
  label: string;
  values: number[];
}

interface MockReport {
  id: string;
  title: string;
  columns: string[];
  rows: ReportRow[];
  barChart: { label: string; value: number }[];
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const reportDefinitions: ReportDefinition[] = [
  {
    id: "pipeline-performance",
    title: "Pipeline Performance",
    description:
      "Analise o desempenho do pipeline por etapa, valor e velocidade de conversao.",
    icon: <BarChart3 className="h-6 w-6" />,
    category: "Vendas",
  },
  {
    id: "conversion-by-seller",
    title: "Conversao por Vendedor",
    description:
      "Compare taxas de conversao, volume e receita gerada por vendedor.",
    icon: <Users className="h-6 w-6" />,
    category: "Vendas",
  },
  {
    id: "activities-by-type",
    title: "Atividades por Tipo",
    description:
      "Distribuicao de atividades realizadas por tipo (ligacao, reuniao, email, etc).",
    icon: <Activity className="h-6 w-6" />,
    category: "Operacional",
  },
  {
    id: "monthly-revenue",
    title: "Receita Mensal",
    description:
      "Evolucao da receita mensal com comparativo de metas e periodos anteriores.",
    icon: <DollarSign className="h-6 w-6" />,
    category: "Financeiro",
  },
  {
    id: "health-score-overview",
    title: "Health Score Overview",
    description:
      "Visao geral da saude dos clientes por categoria e tendencia ao longo do tempo.",
    icon: <Heart className="h-6 w-6" />,
    category: "CS",
  },
  {
    id: "sla-compliance",
    title: "SLA Compliance",
    description:
      "Monitoramento do cumprimento de SLAs por etapa do pipeline e por responsavel.",
    icon: <Clock className="h-6 w-6" />,
    category: "Operacional",
  },
];

const mockReportData: Record<string, MockReport> = {
  "pipeline-performance": {
    id: "pipeline-performance",
    title: "Pipeline Performance",
    columns: ["Etapa", "Oportunidades", "Valor Total", "Conversao"],
    rows: [
      { label: "Lead-In", values: [12, 72000, 67] },
      { label: "Contato Feito", values: [8, 48000, 75] },
      { label: "Reuniao Agendada", values: [10, 65000, 80] },
      { label: "Proposta Enviada", values: [7, 45500, 57] },
      { label: "Negociacao", values: [6, 36000, 83] },
      { label: "Fechamento", values: [4, 18000, 100] },
    ],
    barChart: [
      { label: "Lead-In", value: 72000 },
      { label: "Contato", value: 48000 },
      { label: "Reuniao", value: 65000 },
      { label: "Proposta", value: 45500 },
      { label: "Negociacao", value: 36000 },
      { label: "Fechamento", value: 18000 },
    ],
  },
  "conversion-by-seller": {
    id: "conversion-by-seller",
    title: "Conversao por Vendedor",
    columns: ["Vendedor", "Deals", "Receita", "Conversao (%)"],
    rows: [
      { label: "Ana Souza", values: [14, 92000, 38] },
      { label: "Carlos Lima", values: [11, 78000, 31] },
      { label: "Fernanda Reis", values: [9, 64000, 28] },
      { label: "Pedro Alves", values: [13, 50500, 35] },
      { label: "Julia Mendes", values: [7, 42000, 25] },
    ],
    barChart: [
      { label: "Ana S.", value: 92000 },
      { label: "Carlos L.", value: 78000 },
      { label: "Fernanda R.", value: 64000 },
      { label: "Pedro A.", value: 50500 },
      { label: "Julia M.", value: 42000 },
    ],
  },
  "activities-by-type": {
    id: "activities-by-type",
    title: "Atividades por Tipo",
    columns: ["Tipo", "Realizadas", "Pendentes", "Canceladas"],
    rows: [
      { label: "Ligacao", values: [45, 8, 3] },
      { label: "Reuniao", values: [22, 5, 1] },
      { label: "E-mail", values: [38, 12, 2] },
      { label: "Follow-up", values: [30, 6, 4] },
      { label: "WhatsApp", values: [15, 3, 0] },
    ],
    barChart: [
      { label: "Ligacao", value: 45 },
      { label: "Reuniao", value: 22 },
      { label: "E-mail", value: 38 },
      { label: "Follow-up", value: 30 },
      { label: "WhatsApp", value: 15 },
    ],
  },
  "monthly-revenue": {
    id: "monthly-revenue",
    title: "Receita Mensal",
    columns: ["Mes", "Receita", "Meta", "Atingimento (%)"],
    rows: [
      { label: "Setembro", values: [185000, 200000, 93] },
      { label: "Outubro", values: [210000, 220000, 95] },
      { label: "Novembro", values: [198000, 250000, 79] },
      { label: "Dezembro", values: [265000, 280000, 95] },
      { label: "Janeiro", values: [240000, 300000, 80] },
      { label: "Fevereiro", values: [215000, 300000, 72] },
    ],
    barChart: [
      { label: "Set", value: 185000 },
      { label: "Out", value: 210000 },
      { label: "Nov", value: 198000 },
      { label: "Dez", value: 265000 },
      { label: "Jan", value: 240000 },
      { label: "Fev", value: 215000 },
    ],
  },
  "health-score-overview": {
    id: "health-score-overview",
    title: "Health Score Overview",
    columns: ["Categoria", "Clientes", "% do Total", "Tendencia"],
    rows: [
      { label: "Saudavel", values: [42, 65, 5] },
      { label: "Atencao", values: [15, 23, -3] },
      { label: "Critico", values: [7, 11, -2] },
      { label: "Churn", values: [1, 1, 0] },
    ],
    barChart: [
      { label: "Saudavel", value: 42 },
      { label: "Atencao", value: 15 },
      { label: "Critico", value: 7 },
      { label: "Churn", value: 1 },
    ],
  },
  "sla-compliance": {
    id: "sla-compliance",
    title: "SLA Compliance",
    columns: ["Etapa", "Dentro do SLA", "Proximo", "Estourado"],
    rows: [
      { label: "Lead-In", values: [10, 1, 1] },
      { label: "Contato Feito", values: [7, 1, 0] },
      { label: "Reuniao Agendada", values: [8, 1, 1] },
      { label: "Proposta Enviada", values: [5, 1, 1] },
      { label: "Negociacao", values: [4, 2, 0] },
      { label: "Fechamento", values: [4, 0, 0] },
    ],
    barChart: [
      { label: "Lead-In", value: 83 },
      { label: "Contato", value: 88 },
      { label: "Reuniao", value: 80 },
      { label: "Proposta", value: 71 },
      { label: "Negociacao", value: 67 },
      { label: "Fechamento", value: 100 },
    ],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number, reportId: string, colIndex: number) {
  // Revenue-related columns
  if (
    reportId === "pipeline-performance" && colIndex === 1 ||
    reportId === "conversion-by-seller" && colIndex === 1 ||
    reportId === "monthly-revenue" && (colIndex === 0 || colIndex === 1)
  ) {
    return formatCurrency(value);
  }
  // Percentage columns
  if (
    reportId === "pipeline-performance" && colIndex === 2 ||
    reportId === "conversion-by-seller" && colIndex === 2 ||
    reportId === "monthly-revenue" && colIndex === 2 ||
    reportId === "health-score-overview" && (colIndex === 1 || colIndex === 2)
  ) {
    return `${value}%`;
  }
  return value.toLocaleString("pt-BR");
}

const categoryColors: Record<string, string> = {
  Vendas: "bg-brand-light text-brand",
  Operacional: "bg-blue-50 text-blue-600",
  Financeiro: "bg-green-50 text-green-600",
  CS: "bg-purple-50 text-purple-600",
};

// ---------------------------------------------------------------------------
// ReportCard
// ---------------------------------------------------------------------------

function ReportCard({
  report,
  onGenerate,
}: {
  report: ReportDefinition;
  onGenerate: (id: string) => void;
}) {
  const badgeClass = categoryColors[report.category] || "bg-zinc-100 text-zinc-600";

  return (
    <Card className="rounded-[15px] border-zinc-200 transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        {/* Icon + Category */}
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-brand-light text-brand">
            {report.icon}
          </div>
          <Badge className={`rounded-[10px] border-0 font-body text-[11px] ${badgeClass}`}>
            {report.category}
          </Badge>
        </div>

        {/* Title + Description */}
        <h3 className="mt-3 font-heading text-base font-semibold text-black">
          {report.title}
        </h3>
        <p className="mt-1 font-body text-sm leading-relaxed text-zinc-500">
          {report.description}
        </p>

        {/* Generate button */}
        <Button
          onClick={() => onGenerate(report.id)}
          className="mt-4 w-full rounded-full bg-black font-heading text-sm text-white hover:bg-zinc-800"
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Gerar
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// ReportViewer — displayed after "Gerar" is clicked
// ---------------------------------------------------------------------------

function ReportViewer({
  report,
  reportId,
  onClose,
}: {
  report: MockReport;
  reportId: string;
  onClose: () => void;
}) {
  const [dateStart, setDateStart] = useState("2026-01-01");
  const [dateEnd, setDateEnd] = useState("2026-02-06");
  const maxBarValue = Math.max(...report.barChart.map((b) => b.value));

  function handleExport(type: "CSV" | "PDF" | "Excel") {
    const exportData = report.rows.map((row) => {
      const obj: Record<string, unknown> = { [report.columns[0]]: row.label };
      row.values.forEach((val, i) => {
        obj[report.columns[i + 1]] = val;
      });
      return obj;
    });

    const filename = `relatorio-${report.id}`;

    switch (type) {
      case "CSV":
        exportToCSV(exportData, filename);
        toast.success("Exportação CSV concluída", {
          description: `Arquivo ${filename}.csv baixado.`,
        });
        break;
      case "PDF":
        exportToPDF(exportData, filename);
        toast("Exportação PDF", {
          description: "Em produção será implementado com jspdf.",
        });
        break;
      case "Excel":
        exportToExcel(exportData, filename);
        toast("Exportação Excel", {
          description: "Em produção será implementado com xlsx.",
        });
        break;
    }
  }

  return (
    <Card className="rounded-[15px] border-zinc-200">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full text-zinc-500"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="font-heading text-xl font-bold text-black">
                {report.title}
              </CardTitle>
              <p className="font-body text-sm text-zinc-500">
                Relatorio gerado em{" "}
                {new Date().toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Export buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("CSV")}
              className="rounded-full font-heading text-xs"
            >
              <FileDown className="mr-1.5 h-3.5 w-3.5" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("PDF")}
              className="rounded-full font-heading text-xs"
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("Excel")}
              className="rounded-full font-heading text-xs"
            >
              <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
              Excel
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Date range */}
        <div className="flex flex-wrap items-center gap-3 rounded-[15px] bg-zinc-50 p-4">
          <Calendar className="h-4 w-4 text-zinc-500" />
          <span className="font-body text-sm text-zinc-600">Periodo:</span>
          <Input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            className="h-8 w-40 rounded-[10px] text-sm"
          />
          <span className="font-body text-sm text-zinc-500">ate</span>
          <Input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            className="h-8 w-40 rounded-[10px] text-sm"
          />
        </div>

        {/* Bar Chart (pure CSS) */}
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-heading text-sm font-semibold text-black">
            <TrendingUp className="h-4 w-4 text-brand" />
            Visualizacao
          </h4>
          <div className="space-y-2.5">
            {report.barChart.map((bar) => {
              const pct =
                maxBarValue > 0 ? (bar.value / maxBarValue) * 100 : 0;
              return (
                <div key={bar.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm text-zinc-700">
                      {bar.label}
                    </span>
                    <span className="font-heading text-sm font-semibold text-black">
                      {bar.value >= 1000
                        ? formatCurrency(bar.value)
                        : bar.value.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="relative h-3 w-full overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-brand transition-all duration-700 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Data Table */}
        <div className="space-y-3">
          <h4 className="font-heading text-sm font-semibold text-black">
            Dados Detalhados
          </h4>
          <div className="overflow-x-auto rounded-[15px] border border-zinc-200">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  {report.columns.map((col, i) => (
                    <th
                      key={col}
                      className={`whitespace-nowrap px-4 py-3 font-heading text-xs font-semibold text-zinc-600 ${
                        i > 0 ? "text-right" : ""
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row, rowIndex) => (
                  <tr
                    key={row.label}
                    className={`border-b border-zinc-50 transition-colors hover:bg-zinc-50 ${
                      rowIndex % 2 === 0 ? "bg-white" : "bg-zinc-25"
                    }`}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-body text-sm font-medium text-black">
                      {row.label}
                    </td>
                    {row.values.map((val, colIndex) => (
                      <td
                        key={colIndex}
                        className="whitespace-nowrap px-4 py-3 text-right font-body text-sm text-zinc-700"
                      >
                        {formatNumber(val, reportId, colIndex)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Reports Page
// ---------------------------------------------------------------------------

export default function ReportsPage() {
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const activeReport = activeReportId
    ? mockReportData[activeReportId]
    : null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-black sm:text-3xl">
          Relatorios
        </h1>
        <p className="mt-1 font-body text-sm text-zinc-500">
          Gere relatorios detalhados e exporte os dados do seu CRM
        </p>
      </div>

      {/* Report Cards Grid */}
      {!activeReport && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reportDefinitions.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onGenerate={setActiveReportId}
            />
          ))}
        </div>
      )}

      {/* Report Viewer */}
      {activeReport && activeReportId && (
        <ReportViewer
          report={activeReport}
          reportId={activeReportId}
          onClose={() => setActiveReportId(null)}
        />
      )}
    </div>
  );
}
