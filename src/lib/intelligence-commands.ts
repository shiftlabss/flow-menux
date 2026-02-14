// ============================================================================
// Menux Intelligence — Slash Commands Registry
// Ref: docs/Menux Intelligence.md — seção 3.1
// ============================================================================

import type {
  SlashCommandDefinition,
  UserRoleIntelligence,
} from "@/types/intelligence";

/** Definições de todos os 15 slash commands */
export const SLASH_COMMANDS: SlashCommandDefinition[] = [
  {
    command: "/briefing",
    label: "Briefing do Lead",
    icon: "📋",
    description:
      "Gera resumo completo do card: contexto, objeções, histórico, próximo passo sugerido",
    requiresCard: true,
    availableFor: ["comercial", "cs", "admin", "master"],
    requiresInput: false,
  },
  {
    command: "/objecao",
    label: "Quebrar Objeção",
    icon: "🛡️",
    description:
      "Solicita a objeção recebida e retorna contra-argumento + mensagem pronta para WhatsApp",
    requiresCard: false,
    availableFor: ["comercial", "cs"],
    requiresInput: true,
    inputPlaceholder: "Qual objeção você recebeu?",
  },
  {
    command: "/mensagem",
    label: "Escrever Mensagem",
    icon: "💬",
    description:
      "Ghostwriting de mensagem para WhatsApp/email com tom e contexto do lead",
    requiresCard: false,
    availableFor: ["comercial", "cs"],
    requiresInput: true,
    inputPlaceholder:
      "Qual o canal (WhatsApp/Email/Ligação) e objetivo da mensagem?",
  },
  {
    command: "/pitch",
    label: "Pitch Personalizado",
    icon: "🎯",
    description:
      "Gera 2-3 argumentos matadores baseados no perfil do lead (segmento, mesas, dores)",
    requiresCard: true,
    availableFor: ["comercial"],
    requiresInput: false,
  },
  {
    command: "/funil",
    label: "Resumo do Funil",
    icon: "📊",
    description:
      "Visão consolidada do pipeline: quentes, parados, em risco, próximas ações",
    requiresCard: false,
    availableFor: ["comercial", "admin", "master"],
    requiresInput: false,
  },
  {
    command: "/analise",
    label: "Analisar Card",
    icon: "🔍",
    description:
      "Diagnóstico completo: temperatura, score, risco, sugestão de próximo passo",
    requiresCard: true,
    availableFor: ["comercial", "cs", "admin", "master"],
    requiresInput: false,
  },
  {
    command: "/comparar",
    label: "Comparativo",
    icon: "⚔️",
    description:
      "Menux vs concorrente citado — apenas pontos oficiais e documentados",
    requiresCard: false,
    availableFor: ["comercial"],
    requiresInput: true,
    inputPlaceholder: "Qual concorrente você quer comparar?",
  },
  {
    command: "/planos",
    label: "Planos e Preços",
    icon: "💰",
    description:
      "Consulta rápida sobre Assist, Sales, Control — preços, features, setup",
    requiresCard: false,
    availableFor: ["comercial", "cs", "admin", "master"],
    requiresInput: false,
  },
  {
    command: "/followup",
    label: "Gerar Follow-up",
    icon: "🔄",
    description:
      "Cria mensagem de follow-up baseada na última interação do card",
    requiresCard: true,
    availableFor: ["comercial", "cs"],
    requiresInput: false,
  },
  {
    command: "/ajuda",
    label: "O que você pode fazer?",
    icon: "❓",
    description: "Lista capacidades da Intelligence com exemplos",
    requiresCard: false,
    availableFor: ["comercial", "cs", "admin", "master"],
    requiresInput: false,
  },
  {
    command: "/resumo",
    label: "Briefing Matinal",
    icon: "🌅",
    description:
      "Resumo do dia: prioridades, ganhos rápidos, alertas e métricas",
    requiresCard: false,
    availableFor: ["comercial", "cs", "admin", "master"],
    requiresInput: false,
  },
  {
    command: "/riscos",
    label: "Alertas de Risco",
    icon: "🚨",
    description:
      "Todos os alertas de risco: SLA, deals parados, contratos expirando, saúde de clientes",
    requiresCard: false,
    availableFor: ["comercial", "admin", "master"],
    requiresInput: false,
  },
  {
    command: "/meta",
    label: "Progresso da Meta",
    icon: "🎯",
    description:
      "Progresso das suas metas com projeções e o que falta para bater",
    requiresCard: false,
    availableFor: ["comercial", "cs", "admin", "master"],
    requiresInput: false,
  },
  {
    command: "/coaching",
    label: "Coaching de Vendas",
    icon: "📈",
    description:
      "Insights de performance, taxa de conversão, dicas personalizadas de melhoria",
    requiresCard: false,
    availableFor: ["comercial", "admin", "master"],
    requiresInput: false,
  },
  {
    command: "/agenda",
    label: "Agenda do Dia",
    icon: "📅",
    description:
      "Atividades de hoje + sugestão de ordem de prioridade",
    requiresCard: false,
    availableFor: ["comercial", "cs", "admin", "master"],
    requiresInput: false,
  },
];

/**
 * Retorna os comandos disponíveis para um determinado perfil.
 * Filtra por permissão + disponibilidade de card quando necessário.
 */
export function getAvailableCommands(
  role: UserRoleIntelligence,
): SlashCommandDefinition[] {
  return SLASH_COMMANDS.filter((cmd) => {
    const roleAllowed = cmd.availableFor.includes(role);
    // Se o comando requer card e não há card → ainda mostra, mas será disabled
    return roleAllowed;
  });
}

/**
 * Busca slash command por texto digitado (filtra conforme o vendedor digita).
 */
export function filterCommands(
  commands: SlashCommandDefinition[],
  search: string
): SlashCommandDefinition[] {
  if (!search || search === "/") return commands;

  const normalizedSearch = search
    .toLowerCase()
    .replace("/", "")
    .trim();

  return commands.filter(
    (cmd) =>
      cmd.command.toLowerCase().includes(normalizedSearch) ||
      cmd.label.toLowerCase().includes(normalizedSearch) ||
      cmd.description.toLowerCase().includes(normalizedSearch)
  );
}

/**
 * Placeholder contextual do input — seção 2.2.2 (Zona 3).
 */
export function getInputPlaceholder(
  activeScreen: string,
  cardName?: string
): string {
  if (cardName) return `Pergunte sobre ${cardName}...`;

  switch (activeScreen) {
    case "pipes":
      return "Pergunte sobre seus leads...";
    case "dashboard":
      return "Como posso te ajudar hoje?";
    default:
      return "Fale com a Intelligence...";
  }
}
