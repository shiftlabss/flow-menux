"use client";

// ============================================================================
// Menux Intelligence — Typing Indicator
// Animação de 3 pontos indicando que a IA está "digitando"
// Ref: docs/Menux Intelligence.md — seção 2.2.2 (Zona 2)
// ============================================================================

import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 px-4 py-3 dark:bg-slate-800/40">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
