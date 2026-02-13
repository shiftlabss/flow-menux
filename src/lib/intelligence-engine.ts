// ============================================================================
// Menux Intelligence — AI Engine (Simulated)
// Gera respostas simuladas para cada capacidade descrita na seção 4.2
// Ref: docs/Menux Intelligence.md
// ============================================================================

import type {
  Message,
  MessageContentType,
  SlashCommand,
  CardContext,
  VendorContext,
  CopyableBlock,
  SuggestedAction,
  SuggestedActionType,
  ContextBadge,
  PipelineContext,
} from "@/types/intelligence";
import { INTELLIGENCE_LIMITS } from "@/types/intelligence";
import { formatCurrencyBRL } from "@/lib/business-rules";

// ─── Helpers ──────────────────────────────────────────────────────────────

function uid(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function now(): string {
  return new Date().toISOString();
}

function buildContextBadge(card: CardContext | null): ContextBadge | undefined {
  if (!card) return undefined;
  return {
    cardId: card.cardId,
    cardName: card.cardName,
    stage: card.stageLabel,
    temperature: card.temperature,
  };
}

function temperatureEmoji(t: string): string {
  switch (t) {
    case "hot":
      return "🔥";
    case "warm":
      return "🌡️";
    case "cold":
      return "❄️";
    default:
      return "🌡️";
  }
}

function temperatureLabel(t: string): string {
  switch (t) {
    case "hot":
      return "Quente";
    case "warm":
      return "Morno";
    case "cold":
      return "Frio";
    default:
      return t;
  }
}

// ─── Greeting — seção 2.3.1 ──────────────────────────────────────────────

export function generateGreeting(
  vendor: VendorContext,
  card: CardContext | null,
  isFirstOfDay: boolean
): Message {
  let content: string;

  if (card) {
    // Se o vendedor já tem um card aberto
    content = `✨ **Olá, ${vendor.name}!** Sou a Menux Intelligence, seu braço direito comercial.\n\nVi que você está com **${card.cardName}** aberto. Quer que eu te ajude com esse lead ou prefere escolher outro?`;
  } else if (isFirstOfDay) {
    // Primeira abertura do dia → resumo matinal
    content = `✨ **Bom dia, ${vendor.name}!** Sou a Menux Intelligence, seu braço direito comercial.\n\nVocê tem atividades para hoje e leads quentes esperando ação. Quer focar em algum cliente?\n\n**📋 Escolher cliente**\n\nOu pode mandar sua dúvida direto — estou aqui pra ajudar.`;
  } else {
    // Abertura genérica
    content = `✨ **Olá, ${vendor.name}!** Sou a Menux Intelligence, seu braço direito comercial.\n\nQuer falar sobre algum cliente específico? Selecione abaixo para eu carregar todo o contexto.\n\n**📋 Escolher cliente**\n\nOu pode mandar sua dúvida direto — estou aqui pra ajudar.`;
  }

  // Saudações sem card oferecem botão de seleção de cliente
  const suggestedActions: SuggestedAction[] = !card
    ? [
        {
          id: uid(),
          type: "open-card" as SuggestedActionType,
          label: "📋 Escolher cliente",
          icon: "users",
          payload: { action: "open-client-picker" },
        },
      ]
    : [];

  return {
    id: uid(),
    role: "assistant",
    content,
    contentType: "greeting",
    timestamp: now(),
    suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
  };
}

// ─── Context Loaded Confirmation — seção 2.3.2 ──────────────────────────

export function generateContextLoaded(card: CardContext): Message {
  return {
    id: uid(),
    role: "assistant",
    content: `✅ Contexto carregado: **${card.cardName}** (${card.stageLabel} · ${temperatureEmoji(card.temperature)} ${temperatureLabel(card.temperature)}). Como posso te ajudar com esse lead?`,
    contentType: "context-loaded",
    timestamp: now(),
    contextBadge: buildContextBadge(card),
  };
}

// ─── Briefing — seção 4.2.1 ─────────────────────────────────────────────

function generateBriefing(card: CardContext): Message {
  const overdueCount = card.overdueActivities.length;
  const contactList = card.contacts.length
    ? card.contacts
        .map(
          (c) =>
            `  - **${c.name}** ${c.role ? `(${c.role})` : ""} ${c.isDecisionMaker ? "👑 Decisor" : ""}`
        )
        .join("\n")
    : "  - Nenhum contato registrado";

  const riskItems: string[] = [];
  if (overdueCount > 0)
    riskItems.push(`⚠️ ${overdueCount} atividade(s) vencida(s)`);
  if (card.temperature === "cold")
    riskItems.push("❄️ Lead frio — pode estar esfriando");
  if (card.registeredObjections.length > 0)
    riskItems.push(
      `🛡️ ${card.registeredObjections.length} objeção(ões) registrada(s)`
    );

  const content = `📋 **Briefing: ${card.cardName}**

**Contexto rápido:**
  - Etapa: **${card.stageLabel}** · ${temperatureEmoji(card.temperature)} ${temperatureLabel(card.temperature)}
  ${card.cnpj ? `- CNPJ: ${card.cnpj}` : ""}
  ${card.tags.length ? `- Tags: ${card.tags.join(", ")}` : ""}

**Contatos:**
${contactList}

**Valor:**
  ${card.quotedPlan ? `- Plano cotado: **${card.quotedPlan}**` : "- Plano: não cotado ainda"}
  ${card.setupValue ? `- Setup: ${formatCurrencyBRL(card.setupValue)}` : ""}
  ${card.mrrValue ? `- MRR: ${formatCurrencyBRL(card.mrrValue)}` : ""}

${
  card.timelineNotes.length > 0
    ? `**Últimas interações:**\n${card.timelineNotes
        .slice(0, 5)
        .map((n, i) => `  ${i + 1}. ${n}`)
        .join("\n")}`
    : "**Histórico:** Sem notas registradas"
}

${
  riskItems.length > 0
    ? `**Riscos:**\n${riskItems.map((r) => `  ${r}`).join("\n")}`
    : "**Riscos:** ✅ Nenhum risco identificado"
}

**Próximo passo sugerido:** ${
    overdueCount > 0
      ? "Priorize as atividades vencidas antes de avançar."
      : card.temperature === "hot"
        ? "Lead quente! Agende uma reunião o mais rápido possível."
        : "Faça um follow-up personalizado para manter o engajamento."
  }`;

  const suggestedActions: SuggestedAction[] = [
    {
      id: uid(),
      type: "create-activity",
      label: "📅 Criar atividade",
      icon: "calendar",
      payload: {
        type: "follow-up",
        description: `Follow-up do briefing de ${card.cardName}`,
      },
    },
    {
      id: uid(),
      type: "save-note",
      label: "📝 Salvar na timeline",
      icon: "file-text",
    },
  ];

  return {
    id: uid(),
    role: "assistant",
    content,
    contentType: "briefing",
    timestamp: now(),
    contextBadge: buildContextBadge(card),
    suggestedActions,
    sourceCommand: "/briefing",
  };
}

// ─── Objeção — seção 4.2.2 ──────────────────────────────────────────────

function generateObjectionResponse(
  objection: string,
  card: CardContext | null
): Message {
  // Classificar a objeção automaticamente
  const objLower = objection.toLowerCase();
  let category = "Geral";
  if (objLower.includes("preço") || objLower.includes("caro") || objLower.includes("custo"))
    category = "Preço";
  else if (objLower.includes("concorrent") || objLower.includes("outro sistema"))
    category = "Concorrente";
  else if (objLower.includes("momento") || objLower.includes("agora não") || objLower.includes("depois"))
    category = "Timing";
  else if (objLower.includes("preciso") || objLower.includes("necessidade"))
    category = "Falta de necessidade";
  else if (objLower.includes("confia") || objLower.includes("garantia"))
    category = "Desconfiança";
  else if (objLower.includes("técnic") || objLower.includes("integra"))
    category = "Técnica";

  const cardContext = card
    ? `\n\n💡 *Contexto de ${card.cardName}: ${card.stageLabel} · ${temperatureEmoji(card.temperature)}*`
    : "";

  const whatsappResponse =
    category === "Preço"
      ? `Entendo a preocupação com investimento! O legal é que o retorno vem rápido: clientes como você geralmente recuperam o valor em 2-3 meses. Posso te mostrar como?`
      : category === "Timing"
        ? `Faz total sentido! Só pra te ajudar a planejar: quando seria o melhor momento pra gente retomar? Assim garanto que você não perde as condições atuais.`
        : `Ótimo ponto! Muitos clientes tinham a mesma dúvida. Posso te mostrar como resolvemos isso na prática?`;

  const content = `🛡️ **Análise da objeção**

**Categoria:** ${category}
**Objeção recebida:** "${objection}"${cardContext}

**Contra-argumento:**
${
  category === "Preço"
    ? "Foque no ROI, não no custo. O Menux se paga em 2-3 meses com ganho de eficiência operacional. Destaque o impacto financeiro de NÃO ter o sistema."
    : category === "Timing"
      ? "Respeite o momento, mas crie urgência suave. Pergunte o que acontece se continuarem sem solução até lá. Plante a semente de que resolver antes gera vantagem."
      : category === "Concorrente"
        ? "Não fale mal do concorrente. Foque nas diferenças de entrega, suporte e resultados comprovados do Menux. Peça para compararem funcionalidades lado a lado."
        : "Valide a preocupação e redirecione com uma pergunta que traga o lead de volta ao valor."
}

**Pergunta de avanço:**
"${
    category === "Preço"
      ? "Se eu te mostrasse que o investimento se paga em 3 meses, faria sentido avançarmos?"
      : "O que precisaria acontecer para você se sentir seguro(a) pra avançar?"
  }"`;

  const copyableBlocks: CopyableBlock[] = [
    {
      id: uid(),
      content: whatsappResponse,
      channel: "whatsapp",
      charLimit: INTELLIGENCE_LIMITS.WHATSAPP_CHAR_LIMIT,
      label: "Mensagem WhatsApp",
    },
  ];

  return {
    id: uid(),
    role: "assistant",
    content,
    contentType: "objection-response",
    timestamp: now(),
    contextBadge: buildContextBadge(card),
    copyableBlocks,
    sourceCommand: "/objecao",
  };
}

// ─── Ghostwriting — seção 4.2.3 ─────────────────────────────────────────

function generateGhostwriting(
  input: string,
  card: CardContext | null
): Message {
  const inputLower = input.toLowerCase();
  let channel: "whatsapp" | "email" | "call" = "whatsapp";
  if (inputLower.includes("email")) channel = "email";
  else if (inputLower.includes("ligação") || inputLower.includes("call"))
    channel = "call";

  const clientName = card?.cardName ?? "cliente";
  const contactName = card?.contacts?.[0]?.name ?? "";

  const copyableBlocks: CopyableBlock[] = [];

  if (channel === "whatsapp") {
    const msg = contactName
      ? `Oi ${contactName}! Tudo bem? Aqui é da Menux. Vi que você demonstrou interesse no nosso sistema. Teria uns minutinhos pra gente bater um papo sobre como otimizar a operação aí? 😊`
      : `Olá! Aqui é da Menux. Gostaria de conversar sobre como podemos ajudar a otimizar a operação do seu restaurante. Teria uns minutinhos? 😊`;
    copyableBlocks.push({
      id: uid(),
      content: msg,
      channel: "whatsapp",
      charLimit: INTELLIGENCE_LIMITS.WHATSAPP_CHAR_LIMIT,
      label: "Mensagem WhatsApp",
    });
  } else if (channel === "email") {
    copyableBlocks.push(
      {
        id: uid(),
        content: `Otimize a operação do ${clientName} com a Menux`,
        channel: "email",
        label: "Assunto",
      },
      {
        id: uid(),
        content: `${contactName ? `Olá ${contactName},` : "Olá,"}\n\nEspero que esteja tudo bem! Sou da Menux e gostaria de mostrar como nosso sistema pode transformar a gestão do seu restaurante.\n\nPodemos agendar uma conversa rápida de 15 minutos esta semana?\n\nAbraço!`,
        channel: "email",
        charLimit: INTELLIGENCE_LIMITS.EMAIL_BODY_CHAR_LIMIT,
        label: "Corpo do email",
      }
    );
  } else {
    copyableBlocks.push({
      id: uid(),
      content: `• Abertura: Apresentar-se e confirmar se é bom momento\n• Contexto: Mencionar como conhecemos o restaurante\n• Dor: Perguntar sobre principais desafios da operação\n• Valor: Conectar dores com soluções Menux\n• Próximo passo: Propor demonstração ou reunião`,
      channel: "call",
      label: "Roteiro de ligação",
    });
  }

  const content = `💬 **Mensagem gerada para ${channel === "whatsapp" ? "WhatsApp" : channel === "email" ? "Email" : "Ligação"}**${card ? `\n\n📋 *Baseado em: ${card.cardName}*` : ""}`;

  return {
    id: uid(),
    role: "assistant",
    content,
    contentType: "ghostwriting",
    timestamp: now(),
    contextBadge: buildContextBadge(card),
    copyableBlocks,
    sourceCommand: "/mensagem",
  };
}

// ─── Pitch — seção 4.2.4 ────────────────────────────────────────────────

function generatePitch(card: CardContext): Message {
  const content = `🎯 **Pitch Personalizado: ${card.cardName}**

**Perfil:** ${card.stageLabel} · ${temperatureEmoji(card.temperature)} ${temperatureLabel(card.temperature)}${card.tags.length ? ` · ${card.tags.join(", ")}` : ""}

**Ponto de valor 1 — Eficiência operacional:**
  - 🔴 Dor: Perda de tempo com processos manuais no salão
  - ✅ Menux: Automação completa de comanda digital e gestão de mesas
  - 📊 Case: Restaurantes similares reduziram 40% do tempo de atendimento

**Ponto de valor 2 — Controle financeiro:**
  - 🔴 Dor: Falta de visibilidade sobre custos e margem por prato
  - ✅ Menux: Dashboard em tempo real com CMV, ticket médio e faturamento
  - 📊 Case: Aumento de 25% na margem após 3 meses de uso

**Ponto de valor 3 — Experiência do cliente:**
  - 🔴 Dor: Filas, erros de pedido, demora no atendimento
  - ✅ Menux: Cardápio digital + autoatendimento + integração com delivery

**Pergunta de abertura:** "Qual o maior gargalo da operação hoje — atendimento, controle financeiro ou gestão do cardápio?"

**Frase de fechamento:** "Com base no que conversamos, faz sentido agendarmos uma demonstração personalizada para a semana que vem?"`;

  return {
    id: uid(),
    role: "assistant",
    content,
    contentType: "pitch",
    timestamp: now(),
    contextBadge: buildContextBadge(card),
    suggestedActions: [
      {
        id: uid(),
        type: "create-activity",
        label: "📅 Agendar demonstração",
        icon: "calendar",
        payload: { type: "meeting", description: `Demo ${card.cardName}` },
      },
    ],
    sourceCommand: "/pitch",
  };
}

// ─── Funil — seção 4.2.5 ────────────────────────────────────────────────

function generateFunnelSummary(pipeline: PipelineContext | null): Message {
  if (!pipeline) {
    return {
      id: uid(),
      role: "assistant",
      content:
        "📊 Não consegui carregar os dados do funil neste momento. Tente novamente em alguns instantes.",
      contentType: "funnel-summary",
      timestamp: now(),
      sourceCommand: "/funil",
    };
  }

  const totalCards = Object.values(pipeline.cardsByStage).reduce(
    (a, b) => a + b,
    0
  );

  const content = `📊 **Resumo do seu Funil**

**Visão geral:**
  - 🔥 Quentes: precisa de ação imediata
  - 📊 Total no funil: **${totalCards}** oportunidades · **${formatCurrencyBRL(pipeline.totalMRR)}** em MRR potencial

**Por etapa:**
${Object.entries(pipeline.cardsByStage)
  .map(([stage, count]) => `  - **${stage}:** ${count} cards`)
  .join("\n")}

**⚠️ Ações imediatas:**
  ${pipeline.overdueCards > 0 ? `- 🔴 **${pipeline.overdueCards}** card(s) com atividade vencida` : "- ✅ Nenhuma atividade vencida"}
  ${pipeline.hotIdleCards > 0 ? `- 🔥 **${pipeline.hotIdleCards}** lead(s) quente(s) sem atividade` : "- ✅ Leads quentes com atividade em dia"}
  ${pipeline.staleCards > 0 ? `- ⏰ **${pipeline.staleCards}** card(s) parado(s) há mais de 7 dias` : "- ✅ Nenhum card parado"}`;

  return {
    id: uid(),
    role: "assistant",
    content,
    contentType: "funnel-summary",
    timestamp: now(),
    sourceCommand: "/funil",
  };
}

// ─── Análise — seção 4.2.6 ──────────────────────────────────────────────

function generateCardAnalysis(card: CardContext): Message {
  const healthScore = card.leadScore ?? Math.floor(Math.random() * 40 + 50);
  const overdueCount = card.overdueActivities.length;

  const gargalos: string[] = [];
  if (overdueCount > 0)
    gargalos.push(`Atividades vencidas: ${overdueCount}`);
  if (card.contacts.length === 0)
    gargalos.push("Nenhum contato registrado");
  if (!card.contacts.some((c) => c.isDecisionMaker))
    gargalos.push("Sem acesso ao decisor");
  if (!card.quotedPlan) gargalos.push("Plano não cotado");

  const closeProbability =
    card.temperature === "hot" && overdueCount === 0
      ? "Alta (70-85%)"
      : card.temperature === "warm"
        ? "Média (40-60%)"
        : "Baixa (15-30%)";

  const content = `🔍 **Análise: ${card.cardName}**

**Saúde do deal:** ${healthScore}/100 ${healthScore >= 70 ? "🟢" : healthScore >= 40 ? "🟡" : "🔴"}

**Temperatura:** ${temperatureEmoji(card.temperature)} ${temperatureLabel(card.temperature)}
  ${
    card.temperature === "cold"
      ? "→ Frio: sem atividade recente ou engajamento baixo."
      : card.temperature === "warm"
        ? "→ Morno: há engajamento mas precisa de mais ação."
        : "→ Quente: lead engajado, momento de avançar!"
  }

**Score de patente:**
  ${
    card.contacts.length > 0
      ? card.contacts
          .map(
            (c) =>
              `- ${c.name}: ${c.role ?? "Cargo não informado"} ${c.isDecisionMaker ? "👑 Decisor" : ""}`
          )
          .join("\n  ")
      : "Nenhum contato mapeado. Priorize mapear o decisor."
  }

${
  gargalos.length > 0
    ? `**Gargalos:**\n${gargalos.map((g) => `  - ⚠️ ${g}`).join("\n")}`
    : "**Gargalos:** ✅ Nenhum gargalo identificado"
}

**Próximo passo recomendado:** ${
    overdueCount > 0
      ? "Resolva as atividades vencidas imediatamente."
      : !card.contacts.some((c) => c.isDecisionMaker)
        ? "Mapeie e contate o decisor para acelerar o fechamento."
        : "Envie uma proposta personalizada e agende follow-up em 3 dias."
  }

**Probabilidade de fechamento:** ${closeProbability}`;

  return {
    id: uid(),
    role: "assistant",
    content,
    contentType: "card-analysis",
    timestamp: now(),
    contextBadge: buildContextBadge(card),
    suggestedActions: [
      {
        id: uid(),
        type: "create-activity",
        label: "📅 Criar atividade",
        icon: "calendar",
        payload: {
          type: overdueCount > 0 ? "task" : "follow-up",
          description: `Ação pós-análise de ${card.cardName}`,
        },
      },
      {
        id: uid(),
        type: "save-note",
        label: "📝 Salvar na timeline",
        icon: "file-text",
      },
    ],
    sourceCommand: "/analise",
  };
}

// ─── Comparativo — seção 4.2.7 ──────────────────────────────────────────

function generateComparison(competitor: string): Message {
  const content = `⚔️ **Menux vs ${competitor}**

| Critério | Menux | ${competitor} |
|----------|-------|${"-".repeat(competitor.length + 2)}|
| Comanda digital | ✅ Nativo, sem hardware extra | Depende de tablet proprietário |
| Gestão de mesas | ✅ Mapa interativo tempo real | Básico, sem visualização |
| Cardápio digital | ✅ QR Code + autoatendimento | Apenas PDFs |
| Suporte | ✅ Chat + telefone + CS dedicado | Apenas ticket por email |
| Setup | ✅ Onboarding em até 7 dias | 30+ dias em média |
| Preço | ✅ A partir de R$ 149/mês | Similar ou superior |

**Pontos-chave para usar na conversa:**
1. O Menux não exige hardware proprietário — funciona em qualquer dispositivo
2. Suporte humanizado com CS dedicado (não é só chatbot)
3. Setup rápido: cliente operando em até 7 dias

⚠️ *Dados baseados apenas em informações oficiais documentadas. Não faça promessas sobre o concorrente — foque nas vantagens Menux.*`;

  return {
    id: uid(),
    role: "assistant",
    content,
    contentType: "comparison",
    timestamp: now(),
    sourceCommand: "/comparar",
  };
}

// ─── Planos — seção 4.2.7 ───────────────────────────────────────────────

function generatePlansInfo(): Message {
  const content = `💰 **Planos Menux**

| Plano | Ideal para | Funcionalidades-chave | A partir de |
|-------|-----------|----------------------|------------|
| **Assist** | Operações simples | Comanda digital, cardápio QR, PDV básico | R$ 149/mês |
| **Sales** | Restaurantes em crescimento | Tudo do Assist + gestão de mesas, relatórios avançados, integrações delivery | R$ 299/mês |
| **Control** | Operações completas | Tudo do Sales + multi-unidades, CMV, fiscal, API aberta | R$ 499/mês |

**Setup:** Taxa única a partir de R$ 500 (inclui configuração + treinamento da equipe)

**Dúvidas frequentes:**
- ✅ Sem fidelidade — cancele quando quiser
- ✅ 7 dias para onboarding completo
- ✅ Suporte incluído em todos os planos

Quer que eu detalhe algum plano específico?`;

  return {
    id: uid(),
    role: "assistant",
    content,
    contentType: "plans-info",
    timestamp: now(),
    sourceCommand: "/planos",
  };
}

// ─── Follow-up — seção 4.2 ──────────────────────────────────────────────

function generateFollowup(card: CardContext): Message {
  const contactName = card.contacts?.[0]?.name ?? "";
  const lastNote =
    card.timelineNotes.length > 0
      ? card.timelineNotes[0]
      : "sem interação recente";

  const whatsappMsg = contactName
    ? `Oi ${contactName}! Tudo bem? Estou passando pra retomar nossa conversa sobre o Menux. Vi que ficou de analisar internamente — teve alguma novidade? Fico à disposição! 😊`
    : `Olá! Passando pra retomar nossa conversa sobre o Menux. Conseguiu avaliar as informações que enviamos? Estou à disposição pra qualquer dúvida!`;

  const content = `🔄 **Follow-up: ${card.cardName}**

📋 *Última interação: ${lastNote}*

**Estratégia:** Retomada gentil com abertura para atualização do lead.`;

  return {
    id: uid(),
    role: "assistant",
    content,
    contentType: "followup",
    timestamp: now(),
    contextBadge: buildContextBadge(card),
    copyableBlocks: [
      {
        id: uid(),
        content: whatsappMsg,
        channel: "whatsapp",
        charLimit: INTELLIGENCE_LIMITS.WHATSAPP_CHAR_LIMIT,
        label: "Mensagem WhatsApp",
      },
    ],
    suggestedActions: [
      {
        id: uid(),
        type: "schedule-followup",
        label: "🔄 Agendar follow-up",
        icon: "refresh-cw",
        payload: {
          type: "follow-up",
          description: `Follow-up ${card.cardName}`,
        },
      },
    ],
    sourceCommand: "/followup",
  };
}

// ─── Ajuda — seção 3.1 ──────────────────────────────────────────────────

function generateHelp(): Message {
  const content = `❓ **O que posso fazer por você?**

Sou a Menux Intelligence — seu braço direito comercial. Aqui está o que sei fazer:

| Comando | O que faz |
|---------|----------|
| \`/briefing\` | 📋 Resumo completo do lead antes de uma ligação ou reunião |
| \`/objecao\` | 🛡️ Contra-argumentos para objeções + mensagem pronta |
| \`/mensagem\` | 💬 Escrevo mensagens para WhatsApp, email ou ligação |
| \`/pitch\` | 🎯 Argumentos de venda personalizados pro perfil do lead |
| \`/funil\` | 📊 Visão geral do seu pipeline com ações prioritárias |
| \`/analise\` | 🔍 Diagnóstico completo de um card com probabilidade de fechamento |
| \`/comparar\` | ⚔️ Comparativo Menux vs concorrente |
| \`/planos\` | 💰 Info sobre planos, preços e funcionalidades |
| \`/followup\` | 🔄 Gero follow-up baseado na última interação |

💡 **Dicas:**
- Abra o card de um lead e me pergunte — uso todo o contexto automaticamente
- Use os botões de ação para criar atividades e salvar notas direto no CRM
- Copie mensagens prontas com 1 clique

Quer experimentar algum comando?`;

  return {
    id: uid(),
    role: "assistant",
    content,
    contentType: "help",
    timestamp: now(),
    sourceCommand: "/ajuda",
  };
}

// ─── Free-form response ─────────────────────────────────────────────────

function generateFreeResponse(
  text: string,
  card: CardContext | null
): Message {
  const txtLower = text.toLowerCase();

  // Detectar intenção e responder contextualmente
  if (
    txtLower.includes("preço") ||
    txtLower.includes("plano") ||
    txtLower.includes("quanto custa")
  ) {
    return generatePlansInfo();
  }

  if (
    txtLower.includes("mover") ||
    txtLower.includes("mova") ||
    txtLower.includes("avançar card")
  ) {
    // Edge case: seção 11 — IA não executa ações diretas
    return {
      id: uid(),
      role: "assistant",
      content: `Não consigo mover cards diretamente, mas posso te ajudar a preparar tudo para o avanço. ${card ? `O card **${card.cardName}** está na etapa **${card.stageLabel}**. Quer que eu verifique o que falta para avançar?` : "Abra o card que deseja avançar e eu te ajudo!"}`,
      contentType: "text",
      timestamp: now(),
      contextBadge: buildContextBadge(card),
    };
  }

  // Resposta genérica contextual
  const content = card
    ? `Entendi sua pergunta sobre **${card.cardName}**! ${card.temperature === "hot" ? "🔥 Esse lead está quente — " : ""}Como posso te ajudar com isso? Posso gerar um \`/briefing\`, preparar uma \`/mensagem\` ou analisar o card com \`/analise\`.`
    : `Entendi! Posso te ajudar de várias formas. Use os comandos rápidos (/) para ações específicas, ou me pergunte sobre planos, objeções, ou estratégias de venda.\n\n💡 Dica: selecione um cliente com 📋 para eu carregar todo o contexto e personalizar minhas respostas.`;

  return {
    id: uid(),
    role: "assistant",
    content,
    contentType: "text",
    timestamp: now(),
    contextBadge: buildContextBadge(card),
  };
}

// ─── Error responses — seção 11 ─────────────────────────────────────────

export function generateErrorMessage(
  type: "no-card" | "rate-limit" | "api-error" | "max-messages" | "media-unsupported",
  extra?: Record<string, string>
): Message {
  const messages: Record<string, string> = {
    "no-card":
      "Para usar este comando, abra o card do lead primeiro ou selecione um cliente com 📋. Posso te ajudar com outra coisa?",
    "rate-limit": `Você atingiu o limite de consultas nesta hora. O limite será resetado às ${extra?.resetTime ?? "--:--"}. Enquanto isso, suas conversas e histórico continuam disponíveis.`,
    "api-error":
      "Ops, tive um problema ao processar sua mensagem. Tente novamente em alguns instantes.",
    "max-messages":
      "Atingimos o limite desta conversa (100 mensagens). Inicie uma nova conversa para continuar.",
    "media-unsupported":
      "Por enquanto, consigo processar apenas texto. Descreva sua dúvida por escrito que eu te ajudo!",
  };

  return {
    id: uid(),
    role: "assistant",
    content: messages[type] ?? messages["api-error"],
    contentType: "error",
    timestamp: now(),
  };
}

// ─── Main Engine — Process ──────────────────────────────────────────────

export interface ProcessMessageInput {
  text: string;
  command?: SlashCommand;
  card: CardContext | null;
  vendor: VendorContext;
  pipeline: PipelineContext | null;
}

/**
 * Processa a mensagem do vendedor e retorna a resposta da IA.
 * Simula processamento assíncrono com delay artificial para UX.
 */
export async function processMessage(
  input: ProcessMessageInput
): Promise<Message> {
  // Simular tempo de resposta (1-3s para simples, 2-5s para complexo)
  const isComplex = ["/briefing", "/analise", "/funil", "/pitch"].includes(
    input.command ?? ""
  );
  const delay = isComplex
    ? 1500 + Math.random() * 2000
    : 800 + Math.random() * 1200;

  await new Promise((resolve) => setTimeout(resolve, delay));

  // Se há um slash command, usar o handler correspondente
  if (input.command) {
    switch (input.command) {
      case "/briefing":
        if (!input.card)
          return generateErrorMessage("no-card");
        return generateBriefing(input.card);

      case "/objecao":
        return generateObjectionResponse(input.text, input.card);

      case "/mensagem":
        return generateGhostwriting(input.text, input.card);

      case "/pitch":
        if (!input.card)
          return generateErrorMessage("no-card");
        return generatePitch(input.card);

      case "/funil":
        return generateFunnelSummary(input.pipeline);

      case "/analise":
        if (!input.card)
          return generateErrorMessage("no-card");
        return generateCardAnalysis(input.card);

      case "/comparar":
        return generateComparison(input.text || "Concorrente");

      case "/planos":
        return generatePlansInfo();

      case "/followup":
        if (!input.card)
          return generateErrorMessage("no-card");
        return generateFollowup(input.card);

      case "/ajuda":
        return generateHelp();

      default:
        return generateFreeResponse(input.text, input.card);
    }
  }

  // Sem comando → resposta livre
  return generateFreeResponse(input.text, input.card);
}
