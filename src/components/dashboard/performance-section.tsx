"use strict";

import { motion } from "framer-motion";
import { 
  Users, 
  TrendingUp, 
  AlertTriangle,
  PauseCircle,
  ThermometerSun,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BentoCard } from "@/components/ui/bento-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Pipeline Health Component ---
export function PipelineHealth() {
  const healthMetrics = [
    { label: "Estagnados (+30 dias)", value: 12, color: "bg-red-500" },
    { label: "Sem próxima ação", value: 8, color: "bg-amber-500" },
    { label: "Valor vazio", value: 5, color: "bg-zinc-400" },
  ];

  return (
    <BentoCard className="flex flex-col gap-4 p-6 glass">
       <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
            <ThermometerSun className="h-4 w-4 text-orange-500" />
            Saúde do Pipeline
        </h3>
      </div>
      
      <div className="space-y-4">
        {healthMetrics.map((metric) => (
             <div key={metric.label} className="group cursor-pointer">
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-zinc-600 group-hover:text-zinc-900 transition-colors">
                        {metric.label}
                    </span>
                    <span className="text-xs font-bold text-zinc-900">{metric.value} deals</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(metric.value / 20) * 100}%` }}
                        className={cn("h-full rounded-full transition-all group-hover:brightness-110", metric.color)} 
                    />
                </div>
             </div>
        ))}
      </div>
      
      <div className="mt-auto pt-4 border-t border-zinc-100">
        <div className="flex items-center justify-center gap-6">
            <div className="text-center">
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Temperatura</p>
                <p className="text-lg font-bold text-emerald-600">Quente 🔥</p>
            </div>
             <div className="h-8 w-px bg-zinc-100" />
            <div className="text-center">
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Velocidade</p>
                <p className="text-lg font-bold text-zinc-900">18 dias</p>
            </div>
        </div>
      </div>
    </BentoCard>
  );
}

// --- Team Performance Component ---
const teamData = [
  { id: 1, name: "Ana Silva", role: "Closer", revenue: 145000, conversion: 22, trend: 12 },
  { id: 2, name: "Carlos M.", role: "SDR", revenue: 98000, conversion: 18, trend: -5 },
  { id: 3, name: "Beatriz L.", role: "Closer", revenue: 82000, conversion: 25, trend: 8 },
];

export function TeamPerformance() {
  return (
    <BentoCard className="flex flex-col gap-4 p-6 glass">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            Performance do Time
        </h3>
        <button className="text-xs font-medium text-zinc-500 hover:text-zinc-900">Ver todos</button>
      </div>

      <div className="space-y-3">
        {teamData.map((member, i) => (
            <div key={member.id} className="flex items-center justify-between rounded-lg p-2 hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-3">
                    <span className={cn(
                        "flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold",
                        i === 0 ? "bg-amber-100 text-amber-700" : 
                        i === 1 ? "bg-zinc-100 text-zinc-600" : 
                        "bg-zinc-100 text-zinc-400"
                    )}>
                        {i + 1}
                    </span>
                    <Avatar className="h-8 w-8 border border-zinc-100">
                        <AvatarFallback className="bg-zinc-100 text-[10px]">{member.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-xs font-bold text-zinc-900">{member.name}</p>
                        <p className="text-[10px] text-zinc-500">{member.role}</p>
                    </div>
                </div>
                
                <div className="text-right">
                    <p className="text-xs font-bold text-zinc-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(member.revenue)}
                    </p>
                    <div className="flex items-center justify-end gap-1">
                        <span className="text-[10px] text-zinc-500">{member.conversion}% conv.</span>
                        <span className={cn(
                            "text-[10px] font-bold",
                            member.trend > 0 ? "text-emerald-600" : "text-red-600"
                        )}>
                            {member.trend > 0 ? '+' : ''}{member.trend}%
                        </span>
                    </div>
                </div>
            </div>
        ))}
      </div>
      
      <button className="mt-auto flex w-full items-center justify-center gap-1 rounded-lg border border-zinc-100 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50">
        Ver relatório de comissão <ChevronRight className="h-3 w-3" />
      </button>
    </BentoCard>
  );
}
