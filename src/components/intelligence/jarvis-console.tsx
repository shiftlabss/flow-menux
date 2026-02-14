"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Lightbulb, 
  Calendar, 
  Clock, 
  Briefcase, 
  MessageCircle,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Plus
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useIntelligenceStore } from "@/stores/intelligence-store";
import type { JarvisMode } from "./jarvis-header";
import type { CardContext } from "@/types/intelligence";

interface JarvisConsoleProps {
  onAction: (action: string) => void;
}

export function JarvisConsole({ onAction }: JarvisConsoleProps) {
  const { jarvisMode, contextCard } = useIntelligenceStore();

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
       {/* 
         Dynamic content based on Mode 
         This section replaces the previous giant empty state
       */}
       
       {/* Module A: Priorities (Always relevant, but filtered by mode maybe?) */}
       <PriorityModule />

       {/* Module B: Suggested Commands */}
       <CommandSuggestions mode={jarvisMode as JarvisMode} onAction={onAction} />

       {/* Module C: Quick Actions (Only if client selected) */}
       {contextCard && (
         <QuickActionsModule contextCard={contextCard} />
       )}
    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function PriorityModule() {
  return (
    <section>
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
        <Clock className="h-3 w-3" /> Prioridades de Hoje
      </h4>
      <div className="space-y-2">
         <div className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow cursor-pointer group dark:bg-slate-900 dark:border-slate-800">
            <div className="mt-0.5 p-1.5 rounded-md bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
               <AlertCircle className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1">
               <p className="text-xs font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">Follow-up: Clinica Odonto Plus</p>
               <p className="text-[10px] text-slate-400 mt-0.5">Atrasado há 2 dias • Proposta enviada</p>
            </div>
         </div>
         
         <div className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow cursor-pointer group dark:bg-slate-900 dark:border-slate-800">
            <div className="mt-0.5 p-1.5 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
               <Calendar className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1">
               <p className="text-xs font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">Reunião: Construtora Horizonte</p>
               <p className="text-[10px] text-slate-400 mt-0.5">Hoje às 14:00 • Apresentação de Proposta</p>
            </div>
         </div>
      </div>
    </section>
  );
}

function CommandSuggestions({ mode, onAction }: { mode: JarvisMode; onAction: (cmd: string) => void }) {
  // Define commands per mode
  const commands = {
    focus: [
      { id: 'brief', label: 'Briefing do Cliente', cmd: '/briefing', desc: 'Resumo completo e histórico' },
      { id: 'follow', label: 'Sugerir Follow-up', cmd: '/followup', desc: 'Mensagem personalizada de retomada' },
      { id: 'objec', label: 'Tratar Objeção', cmd: '/objecao', desc: 'Argumentos para contornar negativas' },
      { id: 'next', label: 'Próximo Passo', cmd: '/proximo', desc: 'Sugerir melhor ação para avançar' },
    ],
    audit: [
      { id: 'funnel', label: 'Análise de Funil', cmd: '/funil', desc: 'Identificar gargalos e oportunidades' },
      { id: 'stalled', label: 'Leads Estagnados', cmd: '/estagnados', desc: 'Listar leads sem interação há 7 dias' },
      { id: 'forecast', label: 'Previsão Vendas', cmd: '/forecast', desc: 'Estimativa de fechamento mensal' },
    ],
    reply: [
      { id: 'msg', label: 'Gerar Resposta', cmd: '/responder', desc: 'Criar resposta contextual para última msg' },
      { id: 'formal', label: 'Tom Formal', cmd: '/tom formal', desc: 'Reescrever com tom executivo' },
      { id: 'casual', label: 'Tom Casual', cmd: '/tom casual', desc: 'Reescrever com tom amigável' },
    ],
    proposal: [
      { id: 'draft', label: 'Rascunho Proposta', cmd: '/proposta', desc: 'Gerar estrutura de proposta comercial' },
      { id: 'terms', label: 'Condições', cmd: '/termos', desc: 'Sugerir termos de negociação' },
      { id: 'pitch', label: 'Pitch de Venda', cmd: '/pitch', desc: 'Argumentos de venda para este perfil' },
    ]
  };

  const activeCommands = commands[mode] || commands.focus;

  return (
    <section>
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
        <Zap className="h-3 w-3" /> Ações do Jarvis
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {activeCommands.map((item) => (
          <button
            key={item.id}
            onClick={() => onAction(item.cmd)}
            className={cn(
               "text-left p-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white hover:border-indigo-200 hover:shadow-sm hover:from-indigo-50/50 hover:to-white transition-all group dark:border-slate-800 dark:bg-slate-900/40 dark:from-slate-900 dark:to-slate-900 dark:hover:border-indigo-900",
            )}
          >
             <p className="text-xs font-semibold text-slate-700 group-hover:text-indigo-700 dark:text-slate-300 dark:group-hover:text-indigo-400">{item.label}</p>
             <p className="text-[10px] text-slate-400 leading-snug mt-1 group-hover:text-slate-500 dark:text-slate-500">{item.desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function QuickActionsModule({ contextCard }: { contextCard: CardContext }) {
   return (
    <section>
       <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
         <Briefcase className="h-3 w-3" /> Execução Rápida
       </h4>
       
       <div className="flex flex-col gap-2">
          {/* Action Row */}
          <div className="bg-white rounded-xl border border-slate-100 p-1 flex items-center gap-1 dark:bg-slate-900 dark:border-slate-800">
             <QuickActionButton icon={CheckCircle2} label="Nova Atividade" color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-900/20" />
             <QuickActionButton icon={MessageCircle} label="Reg. Conversa" color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
             <QuickActionButton icon={BarChart3} label="Reg. Visita" color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
          </div>
       </div>
    </section>
   );
}

function QuickActionButton({ icon: Icon, label, color, bg }: { icon: React.ComponentType<{ className?: string }>; label: string; color: string; bg: string }) {
  return (
    <button className="flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg hover:bg-slate-50 transition-colors group dark:hover:bg-slate-800">
       <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", bg, color)}>
          <Icon className="h-4 w-4" />
       </div>
       <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">{label}</span>
    </button>
  )
}
