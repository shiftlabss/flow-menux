"use strict";

import { 
  Calendar, 
  ChevronDown, 
  Users, 
  User, 
  Sparkles,
  LayoutGrid
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useDashboardStore, type Period } from "@/stores/dashboard-store";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";
import { transition } from "@/lib/motion";

const periodLabels: Record<Period, string> = {
  today: "Hoje",
  "7d": "7 dias",
  "30d": "30 dias",
  quarter: "Trimestre",
};

export function DashboardHeader() {
  const router = useRouter();
  const { period, context, setPeriod, setContext } = useDashboardStore();
  const { user } = useAuthStore();

  const handleIntelligenceOpen = () => {
    router.push("/intelligence");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition.panel}
      className="premium-ambient rounded-[20px] border border-zinc-200/70 bg-white/65 p-5 shadow-[var(--shadow-premium-soft)] backdrop-blur-sm"
    >
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        {/* Esquerda: Título e Contexto */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...transition.panel, delay: 0.08 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Calendar className="h-4 w-4" />
            <span className="capitalize">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
            <span className="premium-glow-dot inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
            <span className="text-xs text-zinc-400">
              Olá, {user?.name?.split(" ")[0] ?? "time"}
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-zinc-900">
            Dashboard
          </h1>
          <p className="text-zinc-500">
            Raio X do comercial, <span className="font-medium text-zinc-900">hoje</span>
          </p>
        </motion.div>

        {/* Direita: Controles */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...transition.panel, delay: 0.14 }}
          className="flex flex-wrap items-center gap-3"
        >
          {/* Toggle Contexto (Me vs Team) */}
          <div className="flex items-center rounded-full border border-zinc-200/90 bg-white/90 p-1 shadow-sm">
            {[
              { id: "me" as const, label: "Meus", icon: <User className="h-3.5 w-3.5" /> },
              { id: "team" as const, label: "Time", icon: <Users className="h-3.5 w-3.5" /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setContext(item.id)}
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                  context === item.id
                    ? "text-brand-strong"
                    : "text-zinc-500 hover:text-zinc-900"
                )}
              >
                {context === item.id && (
                  <motion.span
                    layoutId="dashboard-context-pill"
                    className="absolute inset-0 rounded-full bg-brand/10 shadow-sm"
                    transition={transition.quick}
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Separator */}
          <div className="hidden h-8 w-px bg-zinc-200 sm:block" />

          {/* Selector de Período */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="premium-shine gap-2 rounded-full border-zinc-200 bg-white/80 font-medium"
              >
                <LayoutGrid className="h-3.5 w-3.5 text-zinc-500" />
                {periodLabels[period]}
                <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              {(Object.keys(periodLabels) as Period[]).map((p) => (
                <DropdownMenuItem
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="gap-2"
                >
                  {period === p && <div className="h-1.5 w-1.5 rounded-full bg-brand" />}
                  <span className={period === p ? "font-medium" : ""}>
                    {periodLabels[p]}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Intelligence Action */}
          <Button
            onClick={handleIntelligenceOpen}
            className="premium-shine gap-2 rounded-full bg-brand text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand-strong hover:shadow-xl hover:shadow-brand/30 active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Intelligence
          </Button>
        </motion.div>
      </div>
    </motion.header>
  );
}
