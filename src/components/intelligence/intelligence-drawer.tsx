"use client";

// ============================================================================
// Menux Intelligence — Main Drawer
// Ref: docs/Menux Intelligence.md — seção 2.2
// Premium Sheet lateral direita com 3 zonas fixas
// ============================================================================

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MessageSquarePlus,
  Users,
  Send,
  Slash,
  Clock,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIntelligenceStore } from "@/stores/intelligence-store";
import { useUIStore } from "@/stores/ui-store";
import { IntelligenceMessage } from "./intelligence-message";
import { TypingIndicator } from "./intelligence-typing-indicator";
import { SlashCommandMenu } from "./slash-command-menu";
import { ConversationHistory } from "./conversation-history";
import { ClientPickerModal } from "./client-picker-modal";
import { getInputPlaceholder } from "@/lib/intelligence-commands";
import { INTELLIGENCE_LIMITS } from "@/types/intelligence";
import type { SlashCommandDefinition } from "@/types/intelligence";

// ─── Component ──────────────────────────────────────────────────────────

export function IntelligenceDrawer() {
  const {
    isOpen,
    close,
    messages,
    isTyping,
    contextCard,
    sendMessage,
    executeSlashCommand,
    openClientPicker,
    startNewConversation,
    toggleHistory,
    isHistoryOpen,
    viewingHistoryConversation,
    exitHistoryView,
    activeScreen,
  } = useIntelligenceStore();

  const { drawerType } = useUIStore();
  const hasCardDrawerOpen = drawerType !== null;

  const [inputText, setInputText] = useState("");
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<SlashCommandDefinition | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-focus no input quando abre
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Detectar slash commands no input
  useEffect(() => {
    if (inputText.startsWith("/") && !pendingCommand) {
      setShowSlashMenu(true);
    } else if (!inputText.startsWith("/")) {
      setShowSlashMenu(false);
    }
  }, [inputText, pendingCommand]);

  // Placeholder contextual — seção 2.2.2 (Zona 3)
  const placeholder = pendingCommand
    ? pendingCommand.inputPlaceholder ?? "Digite sua mensagem..."
    : getInputPlaceholder(activeScreen, contextCard?.cardName);

  // Character count
  const charCount = inputText.length;
  const showCharCount = charCount >= 1800;

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      if (!inputText.trim()) return;

      if (pendingCommand) {
        // Executar slash command com o payload
        executeSlashCommand(pendingCommand.command, inputText.trim());
        setPendingCommand(null);
      } else {
        sendMessage(inputText.trim());
      }

      setInputText("");
      setShowSlashMenu(false);
    },
    [inputText, pendingCommand, executeSlashCommand, sendMessage]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter → envia, Shift+Enter → nova linha — seção 2.2.2
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }

      // Escape → fechar menu ou drawer
      if (e.key === "Escape") {
        if (showSlashMenu) {
          setShowSlashMenu(false);
        } else if (pendingCommand) {
          setPendingCommand(null);
          setInputText("");
        }
      }
    },
    [handleSubmit, showSlashMenu, pendingCommand]
  );

  const handleSlashSelect = useCallback(
    (cmd: SlashCommandDefinition) => {
      setShowSlashMenu(false);

      if (cmd.requiresInput) {
        // Comando precisa de input adicional — seção 3.2
        setPendingCommand(cmd);
        setInputText("");
        inputRef.current?.focus();
      } else {
        // Executar direto
        executeSlashCommand(cmd.command);
        setInputText("");
      }
    },
    [executeSlashCommand]
  );

  const handleSlashButtonClick = useCallback(() => {
    setInputText("/");
    setShowSlashMenu(true);
    inputRef.current?.focus();
  }, []);

  // Mensagens exibidas (conversa ativa ou histórico em somente leitura)
  const displayMessages = viewingHistoryConversation
    ? viewingHistoryConversation.messages
    : messages;

  const isReadOnly = !!viewingHistoryConversation;

  // ── Temperature badge para o header ──────────────────────────────────

  const tempEmoji =
    contextCard?.temperature === "hot"
      ? "🔥"
      : contextCard?.temperature === "warm"
        ? "🌡️"
        : contextCard?.temperature === "cold"
          ? "❄️"
          : null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Drawer principal — seção 2.2.1 */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className={cn(
                "fixed right-0 top-0 z-40 flex h-screen flex-col",
                "w-[480px] max-w-full",
                // Fundo premium gradiente sutil — seção 2.2.1
                "bg-white dark:bg-gradient-to-b dark:from-slate-950 dark:to-slate-900",
                // Borda esquerda gradiente — seção 2.2.1
                "border-l-2 border-l-transparent",
                // Sombra lateral (sem overlay escurecido) — seção 2.2.1
                "shadow-[-8px_0_30px_rgba(0,0,0,0.08)]"
              )}
              style={{
                borderImage:
                  "linear-gradient(to bottom, #3b82f6, #8b5cf6) 1",
              }}
            >
              {/* ═══════════════════════════════════════════════════════════
                   ZONA 1 — Header (fixo, 64px) — seção 2.2.2
                 ═══════════════════════════════════════════════════════════ */}
              <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-100 px-4 dark:border-slate-800">
                {/* Left: Icon + Title */}
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </span>
                  <span className="font-heading text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Menux Intelligence
                  </span>
                </div>

                {/* Center: Context badge — seção 2.2.2 (clicável → abre/foca o card) */}
                {contextCard && (
                  <button
                    onClick={() => {
                      // Abrir drawer do card correspondente
                      const drawerType = contextCard.entityType === "client" ? "client-card" : "lead-card";
                      useUIStore.getState().openDrawer(drawerType, { id: contextCard.cardId });
                    }}
                    className="ml-2 flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                    title={`Abrir ${contextCard.cardName}`}
                  >
                    {tempEmoji && <span>{tempEmoji}</span>}
                    <span className="max-w-[120px] truncate">
                      {contextCard.cardName}
                    </span>
                  </button>
                )}

                {/* Right: Actions */}
                <div className="ml-auto flex items-center gap-1">
                  {/* Escolher cliente — seção 2.2.2 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openClientPicker}
                    className="h-8 gap-1.5 px-2 text-xs text-slate-500"
                    title="Escolher cliente"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Cliente</span>
                  </Button>

                  {/* Histórico — seção 7.2 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleHistory}
                    className="h-8 w-8 text-slate-500"
                    title="Histórico de conversas"
                  >
                    <Clock className="h-3.5 w-3.5" />
                  </Button>

                  {/* Nova conversa — seção 2.2.2 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={startNewConversation}
                    className="h-8 w-8 text-slate-500"
                    title="Nova conversa"
                  >
                    <MessageSquarePlus className="h-3.5 w-3.5" />
                  </Button>

                  {/* Fechar — seção 2.2.2 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={close}
                    className="h-8 w-8 text-slate-500"
                    title="Fechar (Esc)"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════
                   ZONA 2 — Área de mensagens (scroll vertical) — seção 2.2.2
                 ═══════════════════════════════════════════════════════════ */}
              <div className="relative flex-1 overflow-hidden">
                {/* History overlay */}
                <ConversationHistory />

                {/* Read-only banner */}
                {isReadOnly && (
                  <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-800 dark:bg-amber-900/20">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    <span className="flex-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                      Visualizando conversa anterior (somente leitura)
                    </span>
                    <button
                      onClick={exitHistoryView}
                      className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-800"
                    >
                      <ChevronLeft className="h-3 w-3" />
                      Voltar
                    </button>
                  </div>
                )}

                <ScrollArea className="h-full">
                  <div className="flex flex-col gap-3 px-4 py-4">
                    {displayMessages.map((msg, index) => {
                      // Date separator — seção 2.2.2: separadores quando conversa cruza meia-noite
                      let showDateSeparator = false;
                      if (index > 0) {
                        const prevDate = new Date(displayMessages[index - 1].timestamp).toDateString();
                        const currDate = new Date(msg.timestamp).toDateString();
                        showDateSeparator = prevDate !== currDate;
                      }

                      return (
                        <div key={msg.id}>
                          {showDateSeparator && (
                            <div className="flex items-center gap-3 py-2">
                              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                              <span className="text-[10px] font-medium text-slate-400">
                                {new Date(msg.timestamp).toLocaleDateString("pt-BR", {
                                  weekday: "short",
                                  day: "2-digit",
                                  month: "short",
                                })}
                              </span>
                              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                            </div>
                          )}
                          <IntelligenceMessage message={msg} isReadOnly={isReadOnly} />
                        </div>
                      );
                    })}

                    {/* Typing indicator — seção 2.2.2 */}
                    {isTyping && !isReadOnly && <TypingIndicator />}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* ═══════════════════════════════════════════════════════════
                   ZONA 3 — Barra de input (fixa, ~80px) — seção 2.2.2
                 ═══════════════════════════════════════════════════════════ */}
              {!isReadOnly && (
                <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                  {/* Pending command chip */}
                  {pendingCommand && (
                    <div className="mb-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {pendingCommand.icon} {pendingCommand.label}
                      </span>
                      <button
                        onClick={() => {
                          setPendingCommand(null);
                          setInputText("");
                        }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {/* Input area */}
                  <form
                    onSubmit={handleSubmit}
                    className="relative"
                  >
                    {/* Slash command menu */}
                    <SlashCommandMenu
                      inputText={inputText}
                      isVisible={showSlashMenu}
                      onSelect={handleSlashSelect}
                      onClose={() => {
                        setShowSlashMenu(false);
                        setInputText("");
                      }}
                    />

                    <div className="flex items-end gap-2">
                      {/* Slash trigger button — seção 2.2.2 */}
                      <button
                        type="button"
                        onClick={handleSlashButtonClick}
                        className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                        title="Comandos rápidos (/)"
                      >
                        <Slash className="h-4 w-4" />
                      </button>

                      {/* Textarea — seção 2.2.2 */}
                      <div className="relative min-w-0 flex-1">
                        <textarea
                          ref={inputRef}
                          value={inputText}
                          onChange={(e) => {
                            if (
                              e.target.value.length <=
                              INTELLIGENCE_LIMITS.MAX_USER_MESSAGE_LENGTH
                            ) {
                              setInputText(e.target.value);
                            }
                          }}
                          onKeyDown={handleKeyDown}
                          placeholder={placeholder}
                          rows={1}
                          className={cn(
                            "w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2",
                            "font-body text-sm text-slate-700 placeholder:text-slate-400",
                            "outline-none transition-colors",
                            "focus:border-purple-300 focus:bg-white focus:ring-2 focus:ring-purple-100",
                            "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:focus:border-purple-600 dark:focus:ring-purple-900",
                            "max-h-[96px] overflow-y-auto" // Max 4 linhas
                          )}
                          style={{
                            height: "auto",
                            minHeight: "36px",
                          }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = "auto";
                            target.style.height = `${Math.min(target.scrollHeight, 96)}px`;
                          }}
                          disabled={isTyping}
                        />
                      </div>

                      {/* Send button — seção 2.2.2 */}
                      <button
                        type="submit"
                        disabled={!inputText.trim() || isTyping}
                        className={cn(
                          "mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all",
                          inputText.trim() && !isTyping
                            ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                            : "text-slate-300 dark:text-slate-600"
                        )}
                        title="Enviar (Enter)"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Character counter — seção 2.2.2 (visível a partir de 1800) */}
                    {showCharCount && (
                      <p
                        className={cn(
                          "mt-1 text-right text-[10px] font-medium",
                          charCount > INTELLIGENCE_LIMITS.MAX_USER_MESSAGE_LENGTH - 50
                            ? "text-red-500"
                            : "text-slate-400"
                        )}
                      >
                        {charCount}/{INTELLIGENCE_LIMITS.MAX_USER_MESSAGE_LENGTH}
                      </p>
                    )}
                  </form>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal D11 — sempre renderiza, controla por estado */}
      <ClientPickerModal />
    </>
  );
}
