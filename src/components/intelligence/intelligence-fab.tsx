"use client";

// ============================================================================
// Menux Intelligence — FAB (Floating Action Button)
// Ref: docs/Menux Intelligence.md — seção 2.1
// ============================================================================

import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { useIntelligenceStore } from "@/stores/intelligence-store";
import { useAuthStore } from "@/stores/auth-store";
import { canAccessIntelligence } from "@/lib/intelligence-permissions";

export function IntelligenceFAB() {
  const router = useRouter();
  const pathname = usePathname();
  const { proactiveSuggestions } = useIntelligenceStore();
  const user = useAuthStore((s) => s.user);

  // Verificar permissão — seção 9.1 e 11: perfil Leitura não vê o FAB
  const hasAccess = user?.role ? canAccessIntelligence(user.role) : false;

  // Atalho de teclado global: Ctrl/Cmd + I — seção 2.1
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!hasAccess) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        e.preventDefault();
        router.push("/intelligence");
      }
    },
    [hasAccess, router]
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

  // Hide FAB on the intelligence page itself
  if (pathname === "/intelligence") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-6 right-6 z-50 md:block" // Changed bottom position slightly
      >
        <button
          onClick={() => router.push("/intelligence")}
          className={cn(
              "group relative flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/40 active:scale-95",
              "focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
            )}
            aria-label="Abrir Menux Intelligence"
            title="Menux Intelligence"
          >
            {/* Pulse animation ring */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-ping opacity-20" />

            {/* Icon */}
            <Sparkles className="relative z-10 h-5 w-5 transition-transform group-hover:rotate-12" />

            {/* Proactive suggestion badge com contagem — seção 5.1 */}
            {hasPendingSuggestions && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  "absolute -right-1 -top-1 z-20 flex items-center justify-center rounded-full text-[10px] font-bold text-white",
                  "ring-2 ring-white",
                  pendingSuggestions.length > 9 ? "h-5 w-5" : "h-4.5 w-4.5 min-w-[18px]",
                  highPriority
                    ? "bg-red-500" // Vermelho — atividade vencida / lead quente parado
                    : "bg-blue-500" // Azul — início do dia / resumo
                )}
              >
                {/* Inner pulse for high priority */}
                {highPriority && (
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                )}
                {pendingSuggestions.length > 99 ? "99+" : pendingSuggestions.length}
              </motion.span>
            )}
          </button>

          {/* Tooltip on hover */}
          <div className="pointer-events-none absolute -left-[140px] top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg whitespace-nowrap">
              Menux Intelligence
            </div>
          </div>
      </motion.div>
    </AnimatePresence>
  );
}
