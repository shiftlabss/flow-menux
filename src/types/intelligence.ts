// ============================================================================
// Menux Intelligence — Types & Interfaces
// Ref: docs/Menux Intelligence.md (v1.1)
// ============================================================================

import type { Activity, Temperature } from "@/types";

// ─── Slash Commands ────────────────────────────────────────────────────────

export type SlashCommand =
  | "/briefing"
  | "/objecao"
  | "/mensagem"
  | "/pitch"
  | "/funil"
  | "/analise"
  | "/comparar"
  | "/planos"
  | "/followup"
  | "/ajuda"
  | "/resumo"
  | "/riscos"
  | "/meta"
  | "/coaching"
  | "/agenda";

export interface SlashCommandDefinition {
  command: SlashCommand;
  label: string;
  icon: string;
  description: string;
  requiresCard: boolean;
  availableFor: UserRoleIntelligence[];
  /** Se true, pede input adicional após seleção */
  requiresInput: boolean;
  /** Placeholder do input quando o comando é selecionado */
  inputPlaceholder?: string;
}

// ─── User / Permission ────────────────────────────────────────────────────

export type UserRoleIntelligence =
  | "master"
  | "admin"
  | "comercial"
  | "cs";

export type JarvisMode = "focus" | "audit" | "reply" | "proposal";

/** Mapa de capacidades por perfil — seção 9.1 do documento */
export interface IntelligencePermissions {
  canAccessIntelligence: boolean;
  canBriefingAllCards: boolean;
  canBriefingOwnCards: boolean;
  canViewAllFunnel: boolean;
  canViewOwnFunnel: boolean;
  canGhostwrite: boolean;
  canUseObjectionsAndPitch: boolean;
  canQueryMenuxBase: boolean;
  canViewOthersHistory: boolean;
  canReceiveProactiveSuggestions: boolean;
  canSelectAllClientsInPicker: boolean;
}

// ─── Messages ─────────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant" | "system";

export type MessageContentType =
  | "text"
  | "briefing"
  | "objection-response"
  | "ghostwriting"
  | "pitch"
  | "funnel-summary"
  | "card-analysis"
  | "comparison"
  | "plans-info"
  | "followup"
  | "help"
  | "greeting"
  | "context-loaded"
  | "error"
  | "morning-briefing"
  | "risk-report"
  | "goal-progress"
  | "coaching"
  | "agenda";

/** Bloco copiável dentro de uma mensagem — seção 6.1 */
export interface CopyableBlock {
  id: string;
  content: string;
  channel?: "whatsapp" | "email" | "call";
  /** Limite de caracteres para este canal */
  charLimit?: number;
  /** Label do bloco (ex: "Assunto", "Corpo") */
  label?: string;
}

/** Ação sugerida pela IA — seção 6.2 */
export type SuggestedActionType =
  | "create-activity"
  | "save-note"
  | "schedule-followup"
  | "open-card";

export interface SuggestedAction {
  id: string;
  type: SuggestedActionType;
  label: string;
  icon: string;
  /** Dados pré-preenchidos para a ação */
  payload?: Record<string, unknown>;
  /** Se a ação já foi executada */
  executed?: boolean;
}

/** Badge de contexto exibido no topo de uma resposta — seção 4.1.2 */
export interface ContextBadge {
  cardId: string;
  cardName: string;
  stage: string;
  temperature: Temperature;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  contentType: MessageContentType;
  timestamp: string;
  /** Blocos copiáveis dentro da mensagem */
  copyableBlocks?: CopyableBlock[];
  /** Ações sugeridas abaixo da mensagem */
  suggestedActions?: SuggestedAction[];
  /** Badge de contexto (se baseado em card) */
  contextBadge?: ContextBadge;
  /** Slash command que gerou esta mensagem */
  sourceCommand?: SlashCommand;
  /** Se a mensagem está sendo gerada (streaming) */
  isStreaming?: boolean;
}

// ─── Conversations ────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  /** Primeira mensagem (truncada) para preview no histórico */
  preview: string;
  messages: Message[];
  /** Card relacionado (se houver) */
  relatedCardId?: string;
  relatedCardName?: string;
  createdAt: string;
  updatedAt: string;
  /** Total de mensagens */
  messageCount: number;
}

// ─── Proactive Suggestions — seção 5 ─────────────────────────────────────

export type ProactiveSuggestionType =
  | "overdue-activity"
  | "hot-lead-idle"
  | "advanced-stage-opened"
  | "morning-summary"
  | "missing-fields"
  | "sla-approaching"
  | "stale-deal"
  | "follow-up-reminder"
  | "goal-risk"
  | "win-probability-drop"
  | "contract-expiring"
  | "cross-sell-opportunity"
  | "competitive-intelligence"
  | "team-performance";

export type ProactiveSuggestionPriority = "high" | "medium" | "low";

export interface ProactiveSuggestion {
  id: string;
  type: ProactiveSuggestionType;
  priority: ProactiveSuggestionPriority;
  message: string;
  /** Card relacionado */
  cardId?: string;
  cardName?: string;
  /** Se já foi dispensada */
  dismissed: boolean;
  createdAt: string;
}

// ─── Client Picker (Modal D11) — seção 2.3.2 ────────────────────────────

export interface ClientPickerItem {
  id: string;
  /** ID da oportunidade ou cliente */
  entityId: string;
  entityType: "opportunity" | "client";
  companyName: string;
  segment?: string;
  stage: string;
  stageLabel: string;
  temperature: Temperature;
  lastContact?: string;
  value?: number;
  /** Tags do card */
  tags?: string[];
}

export interface ClientPickerFilters {
  pipeId?: string;
  temperature?: Temperature[];
}

// ─── Context — seção 4.1.1 ───────────────────────────────────────────────

export interface ContactInfo {
  name: string;
  role?: string;
  isDecisionMaker?: boolean;
  /** Score de patente (0-100) */
  patentScore?: number;
}

export interface CardContext {
  cardId: string;
  cardName: string;
  cnpj?: string;
  contacts: ContactInfo[];
  stage: string;
  stageLabel: string;
  temperature: Temperature;
  leadScore?: number;
  patentScore?: number;
  quotedPlan?: string;
  setupValue?: number;
  mrrValue?: number;
  tags: string[];
  /** Última atividade */
  lastActivity?: {
    type: string;
    date: string;
    description?: string;
  };
  /** Próxima atividade */
  nextActivity?: {
    type: string;
    date: string;
    description?: string;
  };
  /** Atividades vencidas */
  overdueActivities: Activity[];
  /** Últimas 10 notas da timeline */
  timelineNotes: string[];
  /** Objeções registradas */
  registeredObjections: string[];
  /** Tipo da entidade (oportunidade ou cliente) */
  entityType: "opportunity" | "client";
}

export interface VendorContext {
  id: string;
  name: string;
  role: UserRoleIntelligence | "leitura";
  /** Cards atribuídos ao vendedor */
  assignedCardCount: number;
  /** Taxa de conversão */
  conversionRate?: number;
}

export interface PipelineContext {
  /** Cards por etapa */
  cardsByStage: Record<string, number>;
  /** Cards com atividade vencida */
  overdueCards: number;
  /** Cards quentes sem atividade */
  hotIdleCards: number;
  /** Cards parados > 7 dias */
  staleCards: number;
  /** Total MRR potencial */
  totalMRR: number;
}

/** Tela ativa do vendedor — define placeholder e comportamento */
export type ActiveScreen =
  | "dashboard"
  | "pipes"
  | "clients"
  | "activities"
  | "finance"
  | "settings"
  | "other";

export interface IntelligenceContext {
  card: CardContext | null;
  vendor: VendorContext;
  pipeline: PipelineContext | null;
  activeScreen: ActiveScreen;
}

// ─── Store State ─────────────────────────────────────────────────────────

export interface IntelligenceState {
  /** Drawer aberto/fechado */
  isOpen: boolean;
  /** Conversa ativa */
  activeConversation: Conversation | null;
  /** Mensagens da conversa ativa */
  messages: Message[];
  /** IA está digitando */
  isTyping: boolean;
  /** Saudação já foi enviada nesta sessão */
  greetingSent: boolean;
  /** Card de contexto atualmente carregado */
  contextCard: CardContext | null;
  /** Modal de seleção de cliente aberto */
  isClientPickerOpen: boolean;
  /** Texto de busca no modal de seleção */
  clientPickerSearch: string;
  /** Filtros ativos no modal de seleção */
  clientPickerFilters: ClientPickerFilters;
  /** Sugestões proativas pendentes */
  proactiveSuggestions: ProactiveSuggestion[];
  /** Histórico de conversas (últimas 50) */
  history: Conversation[];
  /** Se o histórico está sendo visualizado */
  isHistoryOpen: boolean;
  /** Conversa do histórico sendo visualizada (somente leitura) */
  viewingHistoryConversation: Conversation | null;
  /** Tela ativa do vendedor */
  activeScreen: ActiveScreen;
  /** Rate limit: consultas restantes nesta hora */
  remainingQueries: number;
  /** Timestamp de reset do rate limit */
  rateLimitResetAt: string | null;
  /** Modo atual do Jarvis */
  jarvisMode: JarvisMode;
}

export interface IntelligenceActions {
  /** Abre o drawer */
  open: () => void;
  /** Fecha o drawer */
  close: () => void;
  /** Toggle do drawer */
  toggle: () => void;
  /** Envia mensagem e dispara processamento da IA */
  sendMessage: (text: string) => void;
  /** Executa slash command */
  executeSlashCommand: (command: SlashCommand, payload?: string) => void;
  /** Define card de contexto */
  setContextCard: (card: CardContext | null) => void;
  /** Abre modal de seleção de cliente */
  openClientPicker: () => void;
  /** Fecha modal de seleção de cliente */
  closeClientPicker: () => void;
  /** Atualiza busca do client picker */
  setClientPickerSearch: (search: string) => void;
  /** Atualiza filtros do client picker */
  setClientPickerFilters: (filters: ClientPickerFilters) => void;
  /** Seleciona cliente no modal → setContextCard + close + mensagem de confirmação */
  selectClient: (item: ClientPickerItem) => void;
  /** Dispensa sugestão proativa */
  dismissSuggestion: (id: string) => void;
  /** Inicia nova conversa + saudação */
  startNewConversation: () => void;
  /** Carrega conversa do histórico (somente leitura) */
  loadConversation: (id: string) => void;
  /** Define modo do Jarvis */
  setJarvisMode: (mode: JarvisMode) => void;
  /** Volta para conversa ativa (sai do histórico) */
  exitHistoryView: () => void;
  /** Abre/fecha painel de histórico */
  toggleHistory: () => void;
  /** Define tela ativa */
  setActiveScreen: (screen: ActiveScreen) => void;
  /** Adiciona sugestão proativa */
  addProactiveSuggestion: (suggestion: Omit<ProactiveSuggestion, "id" | "dismissed" | "createdAt">) => void;
  /** Marca ação sugerida como executada */
  markActionExecuted: (messageId: string, actionId: string) => void;
  /** Adiciona mensagem da IA (usado internamente pelo engine) */
  addAssistantMessage: (message: Omit<Message, "id" | "timestamp" | "role">) => void;
  /** Decrementa rate limit */
  decrementRateLimit: () => void;
  /** Reseta rate limit */
  resetRateLimit: () => void;
}

export type IntelligenceStore = IntelligenceState & IntelligenceActions;

// ─── Constantes ──────────────────────────────────────────────────────────

/** Limites técnicos — seção 10 */
export const INTELLIGENCE_LIMITS = {
  /** Máx mensagens por conversa */
  MAX_MESSAGES_PER_CONVERSATION: 100,
  /** Máx conversas armazenadas por vendedor */
  MAX_STORED_CONVERSATIONS: 50,
  /** Máx caracteres por mensagem do vendedor */
  MAX_USER_MESSAGE_LENGTH: 2000,
  /** Máx caracteres por resposta da IA */
  MAX_AI_RESPONSE_LENGTH: 6000,
  /** Sugestões proativas por dia */
  MAX_PROACTIVE_SUGGESTIONS_PER_DAY: 15,
  /** Consultas por hora */
  MAX_QUERIES_PER_HOUR: 60,
  /** Janela de contexto (mensagens) */
  CONTEXT_WINDOW_MESSAGES: 20,
  /** Retenção de histórico em dias */
  HISTORY_RETENTION_DAYS: 30,
  /** Limite de caracteres para WhatsApp */
  WHATSAPP_CHAR_LIMIT: 280,
  /** Limite de caracteres para email (corpo) */
  EMAIL_BODY_CHAR_LIMIT: 500,
} as const;

/** SLA de resposta em ms — seção 10 */
export const INTELLIGENCE_SLA = {
  SIMPLE_RESPONSE_MS: 5000,
  COMPLEX_RESPONSE_MS: 15000,
} as const;
