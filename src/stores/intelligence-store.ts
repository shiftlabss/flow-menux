// ============================================================================
// Menux Intelligence — Zustand Store
// Ref: docs/Menux Intelligence.md — seção 14
// ============================================================================

import { create } from "zustand";
import type {
  IntelligenceStore,
  Message,
  Conversation,
  CardContext,
  ClientPickerItem,
  ClientPickerFilters,
  SlashCommand,
  ActiveScreen,
  UserRoleIntelligence,
} from "@/types/intelligence";
import { INTELLIGENCE_LIMITS } from "@/types/intelligence";
import {
  processMessage,
  generateGreeting,
  generateContextLoaded,
  generateErrorMessage,
} from "@/lib/intelligence-engine";
import { useAuthStore } from "@/stores/auth-store";
import { useOpportunityStore } from "@/stores/opportunity-store";
import { useActivityStore } from "@/stores/activity-store";
import { computePipelineContext } from "@/lib/proactive-engine";

// ─── Helpers ──────────────────────────────────────────────────────────────

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function now(): string {
  return new Date().toISOString();
}

function createConversation(messages: Message[] = []): Conversation {
  return {
    id: uid(),
    preview: messages[0]?.content?.slice(0, 80) ?? "",
    messages,
    createdAt: now(),
    updatedAt: now(),
    messageCount: messages.length,
  };
}

function getVendorContext() {
  const user = useAuthStore.getState().user;
  const opportunities = useOpportunityStore.getState().opportunities;
  const userOpps = opportunities.filter((o) => o.responsibleId === user?.id);
  const closed = userOpps.filter((o) => o.status === "won" || o.status === "lost");
  const won = closed.filter((o) => o.status === "won");
  const conversionRate = closed.length >= 3 ? Math.round((won.length / closed.length) * 100) : undefined;

  return {
    id: user?.id ?? "unknown",
    name: user?.name ?? "Vendedor",
    role: (user?.role ?? "comercial") as UserRoleIntelligence,
    assignedCardCount: userOpps.filter((o) => o.status === "open").length,
    conversionRate,
  };
}

function getPipelineContext() {
  try {
    const user = useAuthStore.getState().user;
    if (!user) return null;

    const opportunities = useOpportunityStore.getState().opportunities;
    const activities = useActivityStore.getState().activities;
    return computePipelineContext(opportunities, activities, user.id, user.role);
  } catch (err) {
    console.error("[Intelligence] Erro ao computar pipeline context:", err);
    return null;
  }
}

// ─── Store ────────────────────────────────────────────────────────────────

export const useIntelligenceStore = create<IntelligenceStore>((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────
  isOpen: false,
  activeConversation: null,
  messages: [],
  isTyping: false,
  greetingSent: false,
  contextCard: null,
  isClientPickerOpen: false,
  clientPickerSearch: "",
  clientPickerFilters: {},
  proactiveSuggestions: [],
  history: [],
  isHistoryOpen: false,
  viewingHistoryConversation: null,
  activeScreen: "other",
  remainingQueries: INTELLIGENCE_LIMITS.MAX_QUERIES_PER_HOUR,
  rateLimitResetAt: null,
  jarvisMode: "focus",
  isThinking: false,

  // ── Actions ────────────────────────────────────────────────────────────

  open: () => {
    const state = get();

    // Se já tem conversa ativa com saudação enviada, apenas abre
    if (state.greetingSent && state.messages.length > 0) {
      set({ isOpen: true });
      return;
    }

    // Nova sessão → gerar saudação
    const vendor = getVendorContext();
    const greeting = generateGreeting(vendor, state.contextCard, true);

    set({
      isOpen: true,
      greetingSent: true,
      messages: [greeting],
      activeConversation: createConversation([greeting]),
    });
  },

  close: () => set({ isOpen: false }),

  toggle: () => {
    const state = get();
    if (state.isOpen) {
      state.close();
    } else {
      state.open();
    }
  },

  sendMessage: async (text: string) => {
    const state = get();

    // Validações — seção 10 e 11
    if (!text.trim()) return;

    if (text.length > INTELLIGENCE_LIMITS.MAX_USER_MESSAGE_LENGTH) {
      return; // Silenciosamente ignora — o UI deve já travar no limite
    }

    if (state.messages.length >= INTELLIGENCE_LIMITS.MAX_MESSAGES_PER_CONVERSATION) {
      const errorMsg = generateErrorMessage("max-messages");
      set((s) => ({ messages: [...s.messages, errorMsg] }));
      return;
    }

    if (state.remainingQueries <= 0) {
      const errorMsg = generateErrorMessage("rate-limit", {
        resetTime: state.rateLimitResetAt
          ? new Date(state.rateLimitResetAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "--:--",
      });
      set((s) => ({ messages: [...s.messages, errorMsg] }));
      return;
    }

    // Criar mensagem do vendedor
    const userMessage: Message = {
      id: uid(),
      role: "user",
      content: text,
      contentType: "text",
      timestamp: now(),
    };

    set((s) => ({
      messages: [...s.messages, userMessage],
      isTyping: true,
    }));

    // Processar resposta da IA
    try {
      const vendor = getVendorContext();
      const response = await processMessage({
        text,
        card: state.contextCard,
        vendor,
        pipeline: getPipelineContext(),
      });

      set((s) => ({
        messages: [...s.messages, response],
        isTyping: false,
        remainingQueries: s.remainingQueries - 1,
        activeConversation: s.activeConversation
          ? {
              ...s.activeConversation,
              messages: [...s.messages, response],
              messageCount: s.messages.length + 1,
              updatedAt: now(),
            }
          : null,
      }));
    } catch {
      const errorMsg = generateErrorMessage("api-error");
      set((s) => ({
        messages: [...s.messages, errorMsg],
        isTyping: false,
      }));
    }
  },

  executeSlashCommand: async (command: SlashCommand, payload?: string) => {
    const state = get();

    if (state.remainingQueries <= 0) {
      const errorMsg = generateErrorMessage("rate-limit");
      set((s) => ({ messages: [...s.messages, errorMsg] }));
      return;
    }

    if (state.messages.length >= INTELLIGENCE_LIMITS.MAX_MESSAGES_PER_CONVERSATION) {
      const errorMsg = generateErrorMessage("max-messages");
      set((s) => ({ messages: [...s.messages, errorMsg] }));
      return;
    }

    // Criar mensagem do vendedor mostrando o comando
    const userMessage: Message = {
      id: uid(),
      role: "user",
      content: payload ? `${command} ${payload}` : command,
      contentType: "text",
      timestamp: now(),
      sourceCommand: command,
    };

    set((s) => ({
      messages: [...s.messages, userMessage],
      isTyping: true,
    }));

    try {
      const vendor = getVendorContext();
      const response = await processMessage({
        text: payload ?? "",
        command,
        card: state.contextCard,
        vendor,
        pipeline: getPipelineContext(),
      });

      set((s) => ({
        messages: [...s.messages, response],
        isTyping: false,
        remainingQueries: s.remainingQueries - 1,
        activeConversation: s.activeConversation
          ? {
              ...s.activeConversation,
              messages: [...s.messages, response],
              messageCount: s.messages.length + 1,
              updatedAt: now(),
            }
          : null,
      }));
    } catch {
      const errorMsg = generateErrorMessage("api-error");
      set((s) => ({
        messages: [...s.messages, errorMsg],
        isTyping: false,
      }));
    }
  },

  setContextCard: (card: CardContext | null) => {
    set({ contextCard: card });
  },

  openClientPicker: () => {
    set({
      isClientPickerOpen: true,
      clientPickerSearch: "",
      clientPickerFilters: {},
    });
  },

  closeClientPicker: () => {
    set({ isClientPickerOpen: false });
  },

  setClientPickerSearch: (search: string) => {
    set({ clientPickerSearch: search });
  },

  setClientPickerFilters: (filters: ClientPickerFilters) => {
    set({ clientPickerFilters: filters });
  },

  selectClient: (item: ClientPickerItem) => {
    const cardContext: CardContext = {
      cardId: item.entityId,
      cardName: item.companyName,
      stage: item.stage,
      stageLabel: item.stageLabel,
      temperature: item.temperature,
      contacts: [],
      tags: item.tags ?? [],
      overdueActivities: [],
      timelineNotes: [],
      registeredObjections: [],
      entityType: item.entityType,
    };

    // Gerar mensagem de confirmação
    const confirmMsg = generateContextLoaded(cardContext);

    set((s) => ({
      contextCard: cardContext,
      isClientPickerOpen: false,
      messages: [...s.messages, confirmMsg],
    }));
  },

  dismissSuggestion: (id: string) => {
    set((s) => ({
      proactiveSuggestions: s.proactiveSuggestions.map((sug) =>
        sug.id === id ? { ...sug, dismissed: true } : sug
      ),
    }));
  },

  startNewConversation: () => {
    const state = get();

    // Salvar conversa atual no histórico (se tiver mensagens)
    if (state.activeConversation && state.messages.length > 1) {
      const history = [
        {
          ...state.activeConversation,
          messages: state.messages,
          messageCount: state.messages.length,
          updatedAt: now(),
        },
        ...state.history,
      ].slice(0, INTELLIGENCE_LIMITS.MAX_STORED_CONVERSATIONS);

      set({ history });
    }

    // Gerar nova saudação
    const vendor = getVendorContext();
    const greeting = generateGreeting(vendor, null, false);

    set({
      messages: [greeting],
      greetingSent: true,
      activeConversation: createConversation([greeting]),
      contextCard: null,
      viewingHistoryConversation: null,
      isHistoryOpen: false,
    });
  },

  loadConversation: (id: string) => {
    const state = get();
    const convo = state.history.find((c) => c.id === id);
    if (convo) {
      set({
        viewingHistoryConversation: convo,
        isHistoryOpen: false,
      });
    }
  },

  exitHistoryView: () => {
    set({ viewingHistoryConversation: null });
  },

  toggleHistory: () => {
    set((s) => ({ isHistoryOpen: !s.isHistoryOpen }));
  },

  setActiveScreen: (screen: ActiveScreen) => {
    set({ activeScreen: screen });
  },

  addProactiveSuggestion: (suggestion) => {
    const state = get();
    const todaySuggestions = state.proactiveSuggestions.filter((s) => {
      const created = new Date(s.createdAt);
      const today = new Date();
      return (
        created.getDate() === today.getDate() &&
        created.getMonth() === today.getMonth() &&
        created.getFullYear() === today.getFullYear() &&
        !s.dismissed
      );
    });

    // Limite de 3 sugestões proativas por dia — seção 5.2
    if (todaySuggestions.length >= INTELLIGENCE_LIMITS.MAX_PROACTIVE_SUGGESTIONS_PER_DAY) {
      return;
    }

    set((s) => ({
      proactiveSuggestions: [
        ...s.proactiveSuggestions,
        {
          ...suggestion,
          id: uid(),
          dismissed: false,
          createdAt: now(),
        },
      ],
    }));
  },

  markActionExecuted: (messageId: string, actionId: string) => {
    set((s) => ({
      messages: s.messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              suggestedActions: msg.suggestedActions?.map((action) =>
                action.id === actionId
                  ? { ...action, executed: true }
                  : action
              ),
            }
          : msg
      ),
    }));
  },

  addAssistantMessage: (message) => {
    const fullMessage: Message = {
      ...message,
      id: uid(),
      timestamp: now(),
      role: "assistant",
    };

    set((s) => ({
      messages: [...s.messages, fullMessage],
    }));
  },

  decrementRateLimit: () => {
    set((s) => {
      const remaining = s.remainingQueries - 1;
      return {
        remainingQueries: Math.max(0, remaining),
        rateLimitResetAt:
          remaining <= 0 && !s.rateLimitResetAt
            ? new Date(Date.now() + 60 * 60 * 1000).toISOString()
            : s.rateLimitResetAt,
      };
    });
  },

  resetRateLimit: () => {
    set({
      remainingQueries: INTELLIGENCE_LIMITS.MAX_QUERIES_PER_HOUR,
      rateLimitResetAt: null,
    });
  },

  setJarvisMode: (mode) => set({ jarvisMode: mode }),
}));
