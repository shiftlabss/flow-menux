"use strict";

import { motion } from "framer-motion";
import { 
  Calendar, 
  ChevronDown, 
  Users, 
  User, 
  Sparkles,
  LayoutGrid
} from "lucide-react";
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
    <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      {/* Esquerda: Título e Contexto */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Calendar className="h-4 w-4" />
            <span className="capitalize">
            {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
            })}
            </span>
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-zinc-900">
          Dashboard
        </h1>
        <p className="text-zinc-500">
          Raio X do comercial, <span className="font-medium text-zinc-900">hoje</span>
        </p>
      </div>

      {/* Direita: Controles */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Toggle Contexto (Me vs Team) */}
        <div className="flex items-center rounded-full border border-zinc-200 bg-white p-1">
          <button
            onClick={() => setContext("me")}
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
              context === "me" 
                ? "bg-zinc-100 text-zinc-900 shadow-sm" 
                : "text-zinc-500 hover:text-zinc-900"
            )}
          >
            <User className="h-3.5 w-3.5" />
            Meus
          </button>
          <button
            onClick={() => setContext("team")}
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
              context === "team" 
                ? "bg-zinc-100 text-zinc-900 shadow-sm" 
                : "text-zinc-500 hover:text-zinc-900"
            )}
          >
            <Users className="h-3.5 w-3.5" />
            Time
          </button>
        </div>

        {/* Separator */}
        <div className="h-8 w-px bg-zinc-200 hidden sm:block" />

        {/* Selector de Período */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-full border-zinc-200 font-medium">
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
            className="gap-2 rounded-full bg-zinc-900 text-white shadow-lg shadow-zinc-900/10 hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-900/20 active:scale-95 transition-all"
        >
            <Sparkles className="h-3.5 w-3.5" />
            Intelligence
        </Button>
      </div>
    </header>
  );
}
