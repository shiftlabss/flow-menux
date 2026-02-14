"use strict";

import { motion } from "framer-motion";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BentoCard } from "@/components/ui/bento-card";
import { useDashboardStore } from "@/stores/dashboard-store";

// Mock Data Generators based on period
const getKpiData = (period: string) => {
  // Logic to vary data based on period (mock)
  const multiplier = period === 'quarter' ? 3 : period === '30d' ? 1.5 : 1;
  return {
    pipeline: { value: 3450000 * multiplier, trend: 12, history: [40, 35, 55, 45, 60, 55, 75, 80] },
    conversion: { rate: 18.5, won: 42 * multiplier, stages: [100, 65, 40, 18] },
    activities: { pending: 12, overdue: 4, today: 8 },
    sla: { breached: 2, at_risk: 5 }
  };
};

const SimpleSparkline = ({ data, color = "#10b981", height = 40 }: { data: number[], color?: string, height?: number }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = 100 / (data.length - 1);
  
  const points = data.map((d, i) => {
    const x = i * step;
    const y = 100 - ((d - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path
        d={`M0,100 L0,${100 - ((data[0] - min) / range) * 100} ${data.map((d, i) => `L${i * step},${100 - ((d - min) / range) * 100}`).join(" ")} L100,100 Z`}
        fill="url(#gradient)"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const MicroFunnel = ({ data }: { data: number[] }) => {
  return (
    <div className="flex h-12 w-full items-end gap-1">
      {data.map((val, i) => (
        <div 
          key={i} 
          className="relative w-full rounded-sm bg-brand/20 first:bg-brand/10 last:bg-brand"
          style={{ height: `${val}%` }}
        />
      ))}
    </div>
  );
};

export function KpiSection() {
  const { period } = useDashboardStore();
  const data = getKpiData(period);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 gap-[var(--gap-bento-sm)] sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-1">
      
      {/* KPI 1: Pipeline Total (Large) */}
      <BentoCard className="relative overflow-hidden p-6 glass">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-bento-label text-zinc-500 font-medium">Pipeline Total</p>
            <h3 className="text-bento-value font-semibold text-zinc-900 tracking-tight">
              {formatCurrency(data.pipeline.value)}
            </h3>
          </div>
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
            data.pipeline.trend > 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
          )}>
            {data.pipeline.trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(data.pipeline.trend)}%
          </div>
        </div>
        <div className="mt-4 opacity-50">
            <SimpleSparkline data={data.pipeline.history} color={data.pipeline.trend > 0 ? "#10b981" : "#ef4444"} />
        </div>
        <p className="mt-2 text-xs text-zinc-400">vs período anterior</p>
      </BentoCard>

      {/* KPI 2: Conversão (Large) */}
      <BentoCard className="relative overflow-hidden p-6 glass">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-bento-label text-zinc-500 font-medium">Conversão Global</p>
            <h3 className="text-bento-value font-semibold text-zinc-900 tracking-tight">
              {data.conversion.rate}%
            </h3>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            {data.conversion.won} ganhos
          </div>
        </div>
        <div className="mt-4">
            <MicroFunnel data={data.conversion.stages} />
        </div>
      </BentoCard>

      {/* KPI 3: Atividades (Compact) */}
      <BentoCard className="flex flex-col justify-between p-6 glass">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Atividades</span>
            </div>
            <span className="text-2xl font-semibold text-zinc-900">{data.activities.pending}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-red-50 p-2 text-center">
                <span className="block text-2xl font-bold text-red-600">{data.activities.overdue}</span>
                <span className="text-[10px] uppercase tracking-wider text-red-600/70 font-semibold">Atrasadas</span>
            </div>
            <div className="rounded-lg bg-zinc-50 p-2 text-center">
                <span className="block text-2xl font-bold text-zinc-700">{data.activities.today}</span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Hoje</span>
            </div>
        </div>
      </BentoCard>

      {/* KPI 4: SLAs (Compact) */}
      <BentoCard className="flex flex-col justify-between p-6 glass bg-gradient-to-br from-white to-red-50/10">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">SLA Crítico</span>
            </div>
        </div>
        
        <div className="mt-2 space-y-3">
            <div className="flex items-end justify-between border-b border-red-100 pb-2">
                <span className="text-xs font-medium text-zinc-500">Estourados</span>
                <span className="text-sm font-bold text-red-600">{data.sla.breached}</span>
            </div>
            <div className="flex items-end justify-between">
                <span className="text-xs font-medium text-zinc-500">Em risco</span>
                <span className="text-sm font-bold text-amber-600">{data.sla.at_risk}</span>
            </div>
        </div>
        <div className="mt-3">
             <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '35%' }} />
             </div>
             <p className="mt-1.5 text-[10px] text-zinc-400 text-right">35% de risco total</p>
        </div>
      </BentoCard>

    </div>
  );
}
