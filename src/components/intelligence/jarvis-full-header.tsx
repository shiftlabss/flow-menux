"use client";

// ============================================================================
// Menux Intelligence — Full Header
// Connected to store: mode switching, history, new conversation, commands
// ============================================================================

import {
  History,
  Plus,
  Command,
  Target,
  Search,
  MessageSquare,
  Sparkles,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useRouter } from "next/navigation";
import { useIntelligenceStore } from "@/stores/intelligence-store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { JarvisMode } from "@/types/intelligence";
import { transition } from "@/lib/motion";

const MODES: { id: JarvisMode; label: string; icon: React.ReactNode }[] = [
  { id: "focus", label: "Foco Cliente", icon: <Target className="h-4 w-4" /> },
  { id: "audit", label: "Auditoria", icon: <Search className="h-4 w-4" /> },
  { id: "reply", label: "Responder", icon: <MessageSquare className="h-4 w-4" /> },
  { id: "proposal", label: "Proposta", icon: <Sparkles className="h-4 w-4" /> },
];

export function JarvisFullHeader() {
  const router = useRouter();
  const {
    jarvisMode,
    setJarvisMode,
    toggleHistory,
    startNewConversation,
    remainingQueries,
  } = useIntelligenceStore();

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition.panel}
      className="premium-grain sticky top-0 z-10 flex flex-col border-b border-zinc-200/70 bg-white/85 px-6 py-3 backdrop-blur-xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-400 hover:text-zinc-600 md:hidden"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-brand to-cyan-600 text-white shadow-sm ring-1 ring-white/20">
            <Zap className="premium-float h-5 w-5 fill-white text-white" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-zinc-900 leading-tight">
              Jarvis Comercial
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="premium-glow-dot relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="font-body text-xs font-medium text-emerald-600">
                Online · {remainingQueries} consultas
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                  onClick={toggleHistory}
                >
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Historico</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                  onClick={startNewConversation}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Nova Conversa</TooltipContent>
            </Tooltip>

            <div className="ml-2 h-4 w-px bg-zinc-200" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 h-9 w-9 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                  onClick={() => {
                    useIntelligenceStore.getState().executeSlashCommand("/ajuda");
                  }}
                >
                  <Command className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ver Comandos</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {MODES.map((mode) => (
          <ModePill
            key={mode.id}
            active={jarvisMode === mode.id}
            onClick={() => setJarvisMode(mode.id)}
            label={mode.label}
            icon={mode.icon}
          />
        ))}
      </div>
    </motion.header>
  );
}

function ModePill({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ease-out",
        active
          ? "border-brand/20 text-brand-strong shadow-sm"
          : "bg-white border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
      )}
    >
      {active && (
        <motion.span
          layoutId="jarvis-mode-pill"
          className="absolute inset-0 rounded-full bg-brand/10"
          transition={transition.quick}
        />
      )}
      <span
        className={cn(
          "relative z-10 transition-colors",
          active ? "text-brand" : "text-zinc-400 group-hover:text-zinc-500"
        )}
      >
        {icon}
      </span>
      <span className="relative z-10">{label}</span>
    </button>
  );
}
