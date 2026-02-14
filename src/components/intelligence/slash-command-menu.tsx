"use client";

// ============================================================================
// Menux Intelligence — Slash Command Menu
// Ref: docs/Menux Intelligence.md — seção 3.2
// ============================================================================

import { useState, useMemo, useCallback, useEffect, useRef, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";
import { useIntelligenceStore } from "@/stores/intelligence-store";
import {
  getAvailableCommands,
  filterCommands,
} from "@/lib/intelligence-commands";
import type {
  SlashCommandDefinition,
  UserRoleIntelligence,
} from "@/types/intelligence";

interface SlashCommandMenuProps {
  /** Texto atual no input (para filtragem) */
  inputText: string;
  /** Se o menu está visível */
  isVisible: boolean;
  /** Callback ao selecionar um comando */
  onSelect: (command: SlashCommandDefinition) => void;
  /** Callback ao fechar o menu */
  onClose: () => void;
}

export function SlashCommandMenu({
  inputText,
  isVisible,
  onSelect,
  onClose,
}: SlashCommandMenuProps) {
  const user = useAuthStore((s) => s.user);
  const { contextCard } = useIntelligenceStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const role = (user?.role ?? "comercial") as UserRoleIntelligence;
  const hasCard = !!contextCard;

  // Comandos disponíveis para o perfil
  const available = useMemo(
    () => getAvailableCommands(role),
    [role]
  );

  // Filtrar por texto digitado
  const filtered = useMemo(
    () => filterCommands(available, inputText),
    [available, inputText]
  );

  // Reset seleção quando filtro muda
  useEffect(() => {
    startTransition(() => {
      setSelectedIndex(0);
    });
  }, [inputText]);

  // Navegação por teclado
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isVisible || filtered.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filtered.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filtered.length - 1
          );
          break;
        case "Enter":
        case "Tab":
          e.preventDefault();
          if (filtered[selectedIndex]) {
            onSelect(filtered[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [isVisible, filtered, selectedIndex, onSelect, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Scroll item selecionado para view
  useEffect(() => {
    if (menuRef.current) {
      const selected = menuRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      selected?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isVisible || filtered.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.15 }}
        className={cn(
          "absolute bottom-full left-0 right-0 mb-2 max-h-[320px] overflow-y-auto",
          "rounded-xl border border-slate-200 bg-white shadow-xl",
          "dark:border-slate-700 dark:bg-slate-900"
        )}
      >
        {/* Section header */}
        <div className="sticky top-0 border-b border-slate-100 bg-white/95 px-3 py-2 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/95">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Comandos rápidos
          </p>
        </div>

        {/* Commands list */}
        <div className="p-1">
          {filtered.map((cmd, index) => {
            const needsCard = cmd.requiresCard && !hasCard;

            return (
              <button
                key={cmd.command}
                data-index={index}
                onClick={() => {
                  if (!needsCard) {
                    onSelect(cmd);
                  }
                }}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                  index === selectedIndex
                    ? "bg-slate-100 dark:bg-slate-800"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  needsCard && "opacity-50 cursor-not-allowed"
                )}
                disabled={needsCard}
                title={
                  needsCard
                    ? "Requer card aberto"
                    : `${cmd.command} — ${cmd.description}`
                }
              >
                {/* Icon */}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-base dark:bg-slate-800">
                  {cmd.icon}
                </span>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-body text-sm font-medium text-slate-800 dark:text-slate-200">
                      {cmd.label}
                    </span>
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                      {cmd.command}
                    </code>
                  </div>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {cmd.description}
                  </p>
                </div>

                {/* Card required indicator */}
                {cmd.requiresCard && (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                      hasCard
                        ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                    )}
                  >
                    {hasCard ? "✅ Card" : "⚠️ Requer card"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
