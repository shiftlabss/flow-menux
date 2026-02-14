"use strict";

import { motion } from "framer-motion";
import { 
  AlertCircle, 
  ArrowRight, 
  TrendingDown, 
  Lightbulb, 
  ArrowUpRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";

const funnelData = [
  { id: "lead", label: "Leads", volume: 150, value: 0, conversion: 45 },
  { id: "contact", label: "Contato", volume: 68, value: 0, conversion: 60 },
  { id: "meeting", label: "Reunião", volume: 41, value: 0, conversion: 35 },
  { id: "proposal", label: "Proposta", volume: 14, value: 850000, conversion: 25 },
  { id: "won", label: "Fechamento", volume: 3, value: 120000, conversion: 0 }, // End
];

const FunnelNode = ({ stage, index, isBottleneck }: { stage: typeof funnelData[0], index: number, isBottleneck?: boolean }) => {
  return (
    <div className="relative z-10 flex flex-col items-center gap-2">
      <div 
        className={cn(
          "flex h-12 min-w-[100px] items-center justify-center rounded-lg border px-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
          isBottleneck 
            ? "bg-red-50 border-red-200 text-red-700 ring-4 ring-red-50/50" 
            : "bg-white border-zinc-200 text-zinc-900"
        )}
      >
        <span className="font-semibold text-sm">{stage.label}</span>
      </div>
      <div className="text-center">
        <div className="text-xs font-bold text-zinc-700">{stage.volume}</div>
        {stage.value > 0 && (
          <div className="text-[10px] text-zinc-400">
            {(stage.value / 1000).toFixed(0)}k
          </div>
        )}
      </div>
      
      {/* Conversion Badge */}
      {index < funnelData.length - 1 && (
        <div className={cn(
            "absolute -right-8 top-3.5 z-20 flex h-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ring-2 ring-white",
            stage.conversion < 30 ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-500"
        )}>
            {stage.conversion}%
        </div>
      )}
    </div>
  );
};

export function FunnelXRay() {
  const maxVolume = Math.max(...funnelData.map(d => d.volume));
  
  // Calculate bottlenecks (e.g. conversion < 30%)
  const bottleneckIndex = funnelData.findIndex(s => s.conversion < 30 && s.conversion > 0);

  return (
    <BentoCard className="flex flex-col gap-6 p-0 overflow-hidden sm:flex-row glass">
      
      {/* Coluna Esquerda: Flowchart */}
      <div className="flex-1 bg-zinc-50/50 p-6 relative">
         <div className="mb-6 flex items-center justify-between">
            <div>
                <h3 className="text-base font-semibold text-zinc-900">Raio X do Funil</h3>
                <p className="text-xs text-zinc-500">Fluxo de conversão e gargalos</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-7">
                Ver Pipeline <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
         </div>

         {/* Visualization Container */}
         <div className="relative flex items-center justify-between px-4 py-8">
            {/* SVG Connections Layer */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none overflow-visible">
                <defs>
                    <linearGradient id="flowGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#e4e4e7" />
                        <stop offset="100%" stopColor="#e4e4e7" />
                    </linearGradient>
                </defs>
                {funnelData.map((stage, i) => {
                    if (i === funnelData.length - 1) return null;
                    const nextStage = funnelData[i + 1];
                    const startX = (i / (funnelData.length - 1)) * 100; 
                    const endX = ((i + 1) / (funnelData.length - 1)) * 100;
                    
                    // Simple logic to position lines roughly between nodes
                    // In a real app with variable widths, we'd calculate center points.
                    // For this fixed layout, let's approximate.
                    
                    // Stroke width proportional to volume of NEXT stage (flow through)
                    const strokeWidth = Math.max(2, (nextStage.volume / maxVolume) * 40);

                    return (
                        <path
                            key={`conn-${i}`}
                            d={`M ${10 + (i * 20)}% 55 Q ${20 + (i * 20)}% 55 ${30 + (i * 20)}% 55`} 
                            // This is a placeholder path logic. 
                            // Real implementation needs precise coordinates from refs or fixed assumptions.
                            // Let's use simple CSS lines for robustness instead of complex SVG math in this iteration.
                            fill="none"
                            stroke="rgba(0,0,0,0.05)"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                        />
                    );
                })}
                {/* 
                   Fallback: Simple CSS connectors 
                   Since exact SVG positioning relative to flex items is hard without refs/measurements,
                   I will use a background line container in the main flex div.
                */}
            </svg>

            {/* Connecting Lines (Simulated with absolute divs for simplicity/robustness) */}
            <div className="absolute top-[3.75rem] left-10 right-10 h-0.5 bg-zinc-100 -z-0" />

            {funnelData.map((stage, i) => (
                <FunnelNode 
                    key={stage.id} 
                    stage={stage} 
                    index={i} 
                    isBottleneck={i === bottleneckIndex}
                />
            ))}
         </div>
      </div>

      {/* Coluna Direita: Diagnóstico */}
      <div className="w-full border-t border-zinc-100 bg-white p-6 sm:w-80 sm:border-l sm:border-t-0">
        <h4 className="flex items-center gap-2 font-semibold text-zinc-900">
            <Lightbulb className="h-4 w-4 text-amber-500 fill-amber-100" />
            Diagnóstico do Dia
        </h4>

        <div className="mt-6 space-y-6">
            {/* Gargalo */}
            <div className="group rounded-lg border border-red-100 bg-red-50/50 p-3 transition-colors hover:border-red-200">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Top Gargalo</span>
                    <TrendingDown className="h-3.5 w-3.5 text-red-600" />
                </div>
                <p className="text-sm font-medium text-zinc-900">
                    Queda de <span className="text-red-600 font-bold">75%</span> em Proposta
                </p>
                <p className="text-xs text-zinc-500 mt-1">11 oportunidades paradas há +5 dias.</p>
            </div>

            {/* Insight Positivo */}
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                 <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Destaque</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-zinc-900">
                    Conversão de Lead subiu <span className="text-emerald-600 font-bold">+12%</span>
                </p>
            </div>
            
            {/* Ação Recomendada */}
            <div className="pt-2">
                <p className="mb-3 text-xs font-medium text-zinc-500">Ação recomendada</p>
                <Button className="w-full justify-between bg-zinc-900 text-xs hover:bg-zinc-800">
                    Cobrar feedbacks de propostas
                    <ArrowRight className="h-3 w-3 opacity-50" />
                </Button>
            </div>
        </div>
      </div>

    </BentoCard>
  );
}
