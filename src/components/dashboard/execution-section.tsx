"use strict";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Phone,
  Mail,
  Calendar,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";

// --- Critical Alerts Component ---

type AlertSeverity = 'critical' | 'warning' | 'info';

interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  consequence: string;
}

const initialAlerts: Alert[] = [
  { 
    id: "1", 
    severity: "critical", 
    title: "3 oportunidades com SLA estourado", 
    consequence: "Risco de churn: R$ 45k" 
  },
  { 
    id: "2", 
    severity: "warning", 
    title: "Cliente Acme Corp com Health Score Crítico", 
    consequence: "Renovação em 15 dias" 
  },
  { 
    id: "3", 
    severity: "info", 
    title: "5 atividades atrasadas para hoje", 
    consequence: "Impacto no pipeline da semana" 
  }
];

export function CriticalAlerts() {
  const [alerts, setAlerts] = useState(initialAlerts);

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <BentoCard className="flex flex-col gap-4 p-6 glass">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900">Alertas Críticos</h3>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-600">
            {alerts.length}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
            {alerts.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                >
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                    <p className="text-sm font-medium text-zinc-900">Tudo limpo!</p>
                    <p className="text-xs text-zinc-500">Sem alertas pendentes.</p>
                </motion.div>
            )}
            {alerts.map((alert) => (
            <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                className={cn(
                "group relative flex flex-col gap-2 rounded-lg border-l-4 bg-zinc-50 p-3 transition-all hover:bg-white hover:shadow-sm",
                alert.severity === "critical" ? "border-l-red-500 bg-red-50/10" : 
                alert.severity === "warning" ? "border-l-amber-500 bg-amber-50/10" : 
                "border-l-blue-500 bg-blue-50/10"
                )}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        {alert.severity === "critical" ? <AlertCircle className="mt-0.5 h-4 w-4 text-red-600" /> :
                         alert.severity === "warning" ? <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" /> :
                         <Info className="mt-0.5 h-4 w-4 text-blue-600" />}
                        
                        <div>
                            <p className="text-sm font-medium text-zinc-900">{alert.title}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                Impacto: <span className="font-medium">{alert.consequence}</span>
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="mt-1 flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 text-xs hover:bg-white hover:text-emerald-600"
                        onClick={() => resolveAlert(alert.id)}
                    >
                        Resolver <CheckCircle2 className="ml-1 h-3 w-3" />
                    </Button>
                </div>
            </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </BentoCard>
  );
}

// --- Today Activities Component ---

interface Activity {
  id: string;
  time: string;
  title: string;
  details: string;
  type: 'call' | 'email' | 'meeting';
  status: 'pending' | 'overdue' | 'done';
}

const initialActivities: Activity[] = [
  { id: "1", time: "09:00", title: "Reunião de Follow-up", details: "Cliente TechSoft", type: "meeting", status: "overdue" },
  { id: "2", time: "10:30", title: "Ligar para Decisor", details: "Lead Qualificado", type: "call", status: "done" }, // Will filter out or show separately
  { id: "3", time: "14:00", title: "Enviar Proposta", details: "Projeto Alpha", type: "email", status: "pending" },
  { id: "4", time: "15:30", title: "Demo do Produto", details: "Novos Usuários", type: "meeting", status: "pending" },
];

export function TodayActivities() {
    const [activities, setActivities] = useState(initialActivities);

    const completeActivity = (id: string) => {
        setActivities(prev => prev.filter(a => a.id !== id));
    };

    const pendingActivities = activities.filter(a => a.status !== 'done');

    return (
        <BentoCard className="flex flex-col gap-4 p-6 glass min-h-[300px]">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900">Agenda de Hoje</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                </Button>
            </div>

            <div className="relative space-y-0">
                {/* Timeline Line */}
                <div className="absolute left-[3.25rem] top-2 bottom-2 w-px bg-zinc-100" />

                <AnimatePresence>
                    {pendingActivities.length === 0 && (
                        <div className="py-8 text-center text-sm text-zinc-500">
                            Agenda livre! Bom descanso.
                        </div>
                    )}
                    {pendingActivities.map((activity) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="group relative flex items-center gap-4 py-3 first:pt-0"
                        >
                            <div className="w-10 text-right text-xs font-semibold text-zinc-400 font-mono">
                                {activity.time}
                            </div>
                            
                            <div className={cn(
                                "relative z-10 flex h-3 w-3 items-center justify-center rounded-full ring-4 ring-white",
                                activity.status === 'overdue' ? "bg-red-500" : "bg-zinc-300"
                            )} />
                            
                            <div className="flex-1 rounded-lg border border-transparent p-2 transition-all group-hover:border-zinc-100 group-hover:bg-zinc-50/50">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className={cn(
                                            "text-sm font-medium",
                                            activity.status === 'overdue' ? "text-red-600" : "text-zinc-900"
                                        )}>
                                            {activity.title}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                            {activity.type === 'meeting' && <Calendar className="h-3 w-3" />}
                                            {activity.type === 'call' && <Phone className="h-3 w-3" />}
                                            {activity.type === 'email' && <Mail className="h-3 w-3" />}
                                            <span>{activity.details}</span>
                                        </div>
                                        {activity.status === 'overdue' && (
                                            <span className="mt-1 inline-block rounded-sm bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                                                ATRASADO
                                            </span>
                                        )}
                                    </div>
                                    
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50"
                                        onClick={() => completeActivity(activity.id)}
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </BentoCard>
    );
}
