"use client";

// ============================================================================
// Menux Intelligence — Full Console (Chat + Composer)
// Connected to Zustand store for real message flow
// ============================================================================

import { Send, Sparkles, User, Command, X, AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/cn";
import { useState, useRef, useEffect, useCallback, useMemo, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIntelligenceStore } from "@/stores/intelligence-store";
import { IntelligenceMessage } from "./intelligence-message";
import { SlashCommandMenu } from "./slash-command-menu";
import { ConversationHistory } from "./conversation-history";
import { ClientPickerModal } from "./client-picker-modal";
import type { SlashCommandDefinition, SlashCommand } from "@/types/intelligence";
import { INTELLIGENCE_LIMITS } from "@/types/intelligence";

export function JarvisFullConsole() {
  const [inputValue, setInputValue] = useState("");
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<SlashCommandDefinition | null>(null);
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isTyping,
    greetingSent,
    contextCard,
    remainingQueries,
    viewingHistoryConversation,
    isHistoryOpen,
    sendMessage,
    executeSlashCommand,
    open: initConversation,
  } = useIntelligenceStore();

  // Initialize conversation with greeting on mount
  useEffect(() => {
    if (!greetingSent) {
      initConversation();
    }
  }, [greetingSent, initConversation]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => {
      scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages, isTyping]);

  // Display messages: either active conversation or history
  const displayMessages = viewingHistoryConversation
    ? viewingHistoryConversation.messages
    : messages;

  const isReadOnly = !!viewingHistoryConversation;

  // Detect slash command input
  useEffect(() => {
    startTransition(() => {
      if (inputValue.startsWith("/") && !pendingCommand) {
        setShowSlashMenu(true);
      } else if (!inputValue.startsWith("/")) {
        setShowSlashMenu(false);
      }
    });
  }, [inputValue, pendingCommand]);

  // Handle send
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isReadOnly) return;

    const text = inputValue.trim();
    setInputValue("");
    setShowSlashMenu(false);

    if (pendingCommand) {
      // Sending payload for a slash command that requires input
      await executeSlashCommand(pendingCommand.command, text);
      setPendingCommand(null);
    } else if (text.startsWith("/")) {
      // Direct slash command without payload (e.g. user typed /briefing and pressed enter)
      const cmd = text.split(" ")[0] as SlashCommand;
      const payload = text.slice(cmd.length).trim();
      await executeSlashCommand(cmd, payload || undefined);
    } else {
      await sendMessage(text);
    }
  }, [inputValue, pendingCommand, isReadOnly, sendMessage, executeSlashCommand]);

  // Handle slash command selection from menu
  const handleSlashCommandSelect = useCallback(
    (cmd: SlashCommandDefinition) => {
      setShowSlashMenu(false);
      if (cmd.requiresInput) {
        setPendingCommand(cmd);
        setInputValue("");
        inputRef.current?.focus();
      } else {
        setInputValue("");
        executeSlashCommand(cmd.command);
      }
    },
    [executeSlashCommand]
  );

  // Handle key press in input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!showSlashMenu) {
        handleSend();
      }
    }
    if (e.key === "Escape" && pendingCommand) {
      setPendingCommand(null);
      setInputValue("");
    }
  };

  // Group messages by role for WhatsApp-style grouping
  const groupedMessages = useMemo(() => {
    return displayMessages.map((msg, i) => {
      const prev = displayMessages[i - 1];
      const next = displayMessages[i + 1];
      const isGrouped = prev?.role === msg.role;
      const isLastInGroup = !next || next.role !== msg.role;
      return { message: msg, isGrouped, isLastInGroup };
    });
  }, [displayMessages]);

  // Placeholder text
  const placeholder = pendingCommand
    ? pendingCommand.inputPlaceholder ?? "Digite o complemento..."
    : contextCard
      ? `Pergunte sobre ${contextCard.cardName}...`
      : "Digite uma mensagem ou /comando...";

  return (
    <div className="flex h-full flex-col bg-slate-50 relative">
      {/* History Panel (overlay) */}
      <ConversationHistory />

      {/* Client Picker Modal */}
      <ClientPickerModal />

      {/* Read-only history banner */}
      {isReadOnly && (
        <div className="flex items-center justify-between bg-amber-50 border-b border-amber-200 px-4 py-2">
          <p className="text-xs font-medium text-amber-700">
            Visualizando conversa do historico (somente leitura)
          </p>
          <button
            onClick={() => useIntelligenceStore.getState().exitHistoryView()}
            className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline"
          >
            Voltar para conversa ativa
          </button>
        </div>
      )}

      {/* Banner Proativo — sugestão de maior prioridade */}
      <ProactiveBanner />

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col pb-4 max-w-3xl mx-auto w-full">
          {/* Day Divider */}
          <div className="flex justify-center my-4">
            <span className="bg-white border border-zinc-200 px-3 py-1 rounded-full text-[10px] font-medium text-zinc-400 shadow-sm uppercase tracking-wide">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              })}
            </span>
          </div>

          {/* Messages */}
          {groupedMessages.map(({ message, isGrouped, isLastInGroup }) => (
            <IntelligenceMessage
              key={message.id}
              message={message}
              isReadOnly={isReadOnly}
              isGrouped={isGrouped}
              isLastInGroup={isLastInGroup}
            />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 mt-2">
              <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm mt-1 ring-2 ring-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1.5 h-10 bg-white rounded-2xl rounded-tl-sm px-4 shadow-sm border border-zinc-100/50">
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" />
              </div>
            </div>
          )}

          {/* Auto-scroll anchor */}
          <div ref={scrollEndRef} />

          {/* Empty state */}
          {displayMessages.length === 0 && !isTyping && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg mb-4">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="font-heading text-lg font-bold text-zinc-800 mb-1">
                Jarvis Comercial
              </h3>
              <p className="text-sm text-zinc-500 max-w-sm">
                Seu assistente de vendas inteligente. Faça perguntas, use comandos
                com <kbd className="bg-zinc-100 border border-zinc-200 rounded px-1 text-xs">/</kbd> ou selecione um cliente para comecar.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Composer Area */}
      {!isReadOnly && (
        <div className="p-4 pt-2 bg-slate-50/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto relative">
            {/* Slash Command Menu */}
            <SlashCommandMenu
              inputText={inputValue}
              isVisible={showSlashMenu}
              onSelect={handleSlashCommandSelect}
              onClose={() => {
                setShowSlashMenu(false);
                setInputValue("");
              }}
            />

            {/* Pending command badge */}
            {pendingCommand && (
              <div className="flex items-center gap-2 mb-2 px-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  <Command className="h-3 w-3" />
                  {pendingCommand.command}
                </span>
                <button
                  onClick={() => {
                    setPendingCommand(null);
                    setInputValue("");
                  }}
                  className="text-[10px] text-zinc-400 hover:text-zinc-600"
                >
                  Cancelar
                </button>
              </div>
            )}

            {/* Context card badge */}
            {contextCard && !pendingCommand && (
              <div className="flex items-center gap-2 mb-2 px-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  {contextCard.temperature === "hot" ? "🔥" : contextCard.temperature === "warm" ? "🌡️" : "❄️"}
                  {contextCard.cardName} · {contextCard.stageLabel}
                </span>
                <button
                  onClick={() => useIntelligenceStore.getState().setContextCard(null)}
                  className="text-[10px] text-zinc-400 hover:text-zinc-600"
                >
                  Remover
                </button>
              </div>
            )}

            <div
              className={cn(
                "relative flex items-end gap-2 rounded-[26px] bg-white shadow-xl shadow-zinc-200/50 border transition-all duration-200 p-2",
                "focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-200 border-zinc-200"
              )}
            >
              <div className="flex-1 py-3 min-h-[44px]">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  maxLength={INTELLIGENCE_LIMITS.MAX_USER_MESSAGE_LENGTH}
                  className="w-full bg-transparent border-none outline-none text-sm placeholder:text-zinc-400 font-medium pl-2"
                  disabled={isTyping}
                />
              </div>

              <div className="flex items-center gap-1 mb-0.5">
                <Button
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full shadow-md transition-all duration-200",
                    inputValue
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
                      : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                  )}
                  disabled={!inputValue.trim() || isTyping}
                  onClick={handleSend}
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between px-4 mt-3">
              <div className="flex gap-4 text-[10px] text-zinc-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <kbd className="bg-white border border-zinc-200 rounded px-1 min-w-[18px] h-[18px] flex items-center justify-center font-sans">
                    ↵
                  </kbd>
                  Enviar
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="bg-white border border-zinc-200 rounded px-1 min-w-[18px] h-[18px] flex items-center justify-center font-sans">
                    /
                  </kbd>
                  Comandos
                </span>
                {remainingQueries < 10 && (
                  <span className="text-amber-500">
                    {remainingQueries} consultas restantes
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-300">
                Jarvis pode cometer erros. Verifique as informacoes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Banner Proativo — exibe a sugestão de maior prioridade no topo do chat
// ============================================================================

function ProactiveBanner() {
  const { proactiveSuggestions, dismissSuggestion, sendMessage } =
    useIntelligenceStore();

  const topSuggestion = useMemo(() => {
    const pending = proactiveSuggestions.filter((s) => !s.dismissed);
    if (pending.length === 0) return null;
    // Prioridade: high > medium > low
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...pending].sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    )[0];
  }, [proactiveSuggestions]);

  if (!topSuggestion) return null;

  const priorityConfig = {
    high: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-700",
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
    },
    medium: {
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-700",
      icon: <TrendingUp className="h-4 w-4 text-amber-500" />,
    },
    low: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-700",
      icon: <Lightbulb className="h-4 w-4 text-blue-500" />,
    },
  };

  const config = priorityConfig[topSuggestion.priority];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "flex items-center gap-3 border-b px-4 py-2.5",
          config.bg
        )}
      >
        {config.icon}
        <div className="flex-1 min-w-0">
          <p className={cn("text-xs font-semibold truncate", config.text)}>
            {topSuggestion.cardName
              ? `${topSuggestion.cardName} — ${topSuggestion.message}`
              : topSuggestion.message}
          </p>
          <p className="text-[10px] text-zinc-500 truncate capitalize">
            {topSuggestion.type.replace(/-/g, " ")}
          </p>
        </div>
        <button
          onClick={() => {
            const actionText = topSuggestion.cardName
              ? `Analisar: ${topSuggestion.cardName}`
              : `Analisar: ${topSuggestion.message}`;
            sendMessage(actionText);
            dismissSuggestion(topSuggestion.id);
          }}
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold transition-colors",
            topSuggestion.priority === "high"
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : topSuggestion.priority === "medium"
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          )}
        >
          Investigar
        </button>
        <button
          onClick={() => dismissSuggestion(topSuggestion.id)}
          className="shrink-0 rounded-full p-1 text-zinc-400 hover:text-zinc-600 hover:bg-white/60 transition-colors"
          title="Dispensar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
