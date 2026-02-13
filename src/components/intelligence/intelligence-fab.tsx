"use client";

// ============================================================================
// Menux Intelligence — FAB (Floating Action Button)
// Ref: docs/Menux Intelligence.md — seção 2.1
// ============================================================================

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { useIntelligenceStore } from "@/stores/intelligence-store";
import { useAuthStore } from "@/stores/auth-store";
import { canAccessIntelligence } from "@/lib/intelligence-permissions";

export function IntelligenceFAB() {
  const { isOpen, toggle, proactiveSuggestions } = useIntelligenceStore();
  const user = useAuthStore((s) => s.user);

  // Verificar permissão — seção 9.1 e 11: perfil Leitura não vê o FAB
  const hasAccess = user?.role ? canAccessIntelligence(user.role) : false;

  // Atalho de teclado global: Ctrl/Cmd + I — seção 2.1
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!hasAccess) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        e.preventDefault();
        toggle();
      }
    },
    [hasAccess, toggle]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Não renderizar se não tem permissão — seção 11
  if (!hasAccess) return null;

  // Badge proativo: sugestões não dispensadas
  const pendingSuggestions = proactiveSuggestions.filter(
    (s) => !s.dismissed
  );
  const hasPendingSuggestions = pendingSuggestions.length > 0;
  const highPriority = pendingSuggestions.some((s) => s.priority === "high");

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-40 right-6 z-50 hidden md:block"
        >
          <button
            onClick={toggle}
            className={cn(
              "group relative flex h-12 w-12 items-center justify-center rounded-full",
              "bg-gradient-to-br from-blue-500 to-purple-600",
              "text-white shadow-lg shadow-purple-500/25",
              "transition-all duration-300",
              "hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105",
              "active:scale-95",
              "focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
            )}
            aria-label="Abrir Menux Intelligence (Ctrl+I)"
            title="Menux Intelligence (Ctrl+I)"
          >
            {/* Pulse animation ring */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-ping opacity-20" />

            {/* Icon */}
            <Sparkles className="relative z-10 h-5 w-5 transition-transform group-hover:rotate-12" />

            {/* Proactive suggestion badge — seção 5.1 */}
            {hasPendingSuggestions && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  "absolute -right-0.5 -top-0.5 z-20 flex h-3.5 w-3.5 items-center justify-center rounded-full",
                  "ring-2 ring-white",
                  highPriority
                    ? "bg-red-500" // Dot vermelho — atividade vencida / lead quente parado
                    : "bg-blue-500" // Dot azul — início do dia / resumo
                )}
              >
                {/* Inner pulse for high priority */}
                {highPriority && (
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                )}
              </motion.span>
            )}
          </button>

          {/* Tooltip on hover */}
          <div className="pointer-events-none absolute -left-[140px] top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg whitespace-nowrap">
              Menux Intelligence
              <span className="ml-1.5 text-slate-400">⌘I</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
