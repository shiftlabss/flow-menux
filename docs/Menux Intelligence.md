# Menux Intelligence

# Menux Intelligence

## IA Comercial Integrada ao Flow CRM

**Destinatário:** Produto, Engenharia, Comercial

**Escopo:** Regras de negócio, UX, capacidades, limites e permissões da Menux Intelligence — assistente de IA nativo do Flow

**Versão:** 1.1

**Responsável:** Fernando Calado

**Data da versão:** 13/02/2026 14:37 (America/Fortaleza)

---

<aside>
📌

**TL;DR — Pontos críticos deste documento**

- **Menux Intelligence** é o assistente de IA nativo do Flow, acessível via drawer lateral premium à direita da tela.
- **Papel:** Cérebro do comercial — auxilia vendedores em todo o ciclo de vendas (prospecção → fechamento → pós-venda).
- **Interface:** Chat conversacional em drawer lateral direito (Sheet), coexiste com drawers de cards (empilhamento inteligente).
- **7 capacidades core:** Briefing de lead, ghostwriting, objeções, pitch personalizado, resumo de funil, análise de card e consulta à base Menux.
- **Contexto automático:** A IA lê o card aberto (se houver) e adapta respostas ao perfil/pipeline do vendedor.
- **Saudação + seleção de cliente:** Ao abrir o drawer, a IA saúda o vendedor e oferece modal de seleção de cliente (D11) para carregar contexto imediato.
- **Human-in-the-loop:** A IA nunca executa ações diretas no CRM — apenas sugere. O vendedor confirma.
</aside>

---

# 1. Visão Geral

## 1.1 O que é a Menux Intelligence

A Menux Intelligence é a **inteligência artificial nativa do Flow CRM**, projetada para atuar como o **cérebro operacional do time comercial**. Ela vive dentro do sistema em formato de chat, acessível por qualquer tela autenticada, e tem como missão garantir que nenhum vendedor fique sem resposta, sem argumento e sem próximo passo.

<aside>
🎯

**Objetivo estratégico:** Reduzir o tempo entre dúvida e ação do vendedor para menos de 30 segundos, aumentando velocidade de resposta, qualidade dos argumentos e taxa de conversão — sem depender de supervisão humana em tempo real.

</aside>

## 1.2 Por que existe

| Dor atual | Impacto | Como a Intelligence resolve |
| --- | --- | --- |
| Vendedor trava ao receber objeção em tempo real | Perda de momentum e fechamento | Resposta com contra-argumento + mensagem pronta em < 30s |
| Informações sobre planos, preços e funcionalidades dispersas | Respostas inconsistentes ao lead | Consulta instantânea à base Menux com resposta contextualizada |
| Preparação para reunião consome 15-30 min | Menos tempo vendendo | Briefing automático do card em 1 clique |
| Follow-ups genéricos e sem personalização | Baixa taxa de resposta dos leads | Ghostwriting personalizado por perfil do lead |
| Gestor não consegue dar suporte em tempo real a todos os vendedores | Vendedores juniores perdem deals evitáveis | IA funciona como gerente comercial 24/7 disponível |

## 1.3 Princípios invioláveis

1. **Human-in-the-loop sempre:** A IA nunca executa ações no CRM (mover card, criar atividade, fechar deal). Ela **sugere**, o vendedor **confirma**.
2. **Anti-promessa:** A IA nunca promete funcionalidades, prazos ou preços que não estejam documentados na base Menux.
3. **Contexto antes de resposta:** Toda resposta considera o card aberto, a etapa do funil, o histórico de interações e o perfil do vendedor.
4. **Privacidade de dados:** A IA respeita a regra de visibilidade do Flow — vendedor só vê dados dos cards dele. A IA não expõe dados de cards de outros vendedores.
5. **Velocidade sobre perfeição:** SLA de resposta: < 5 segundos para respostas curtas, < 15 segundos para análises complexas.

---

# 2. Interface e UX

## 2.1 Ponto de acesso

A Menux Intelligence é acessível de **qualquer tela autenticada** do Flow CRM.

| Elemento | Descrição | Localização |
| --- | --- | --- |
| **Botão flutuante (FAB)** | Ícone de IA (✨) com brilho sutil animado (pulse). Tamanho: 48px. Fundo gradiente premium (azul → roxo). Sombra elevada. | Canto inferior direito da tela, acima do botão de ajuda (?). Z-index acima de todos os elementos exceto modais. |
| **Atalho de teclado** | `Ctrl/Cmd + I` (I de Intelligence) | Global — funciona em qualquer tela autenticada. |
| **Quick Action no card** | Ícone ✨ no menu "⋮" do card (Pipes e Clientes) | Drawer do card (D1 e D2) — abre Intelligence com contexto do card já injetado. |
| **Badge de sugestão proativa** | Dot vermelho no FAB quando a IA tem uma sugestão proativa (ex: card parado, atividade vencida) | FAB. Desaparece ao abrir o chat. |

## 2.2 Drawer lateral (Chat)

A Menux Intelligence abre como um **drawer lateral direito premium**, implementado com shadcn/ui `Sheet` (side="right") com visual diferenciado.

### 2.2.1 Especificações visuais

| Propriedade | Valor | Racional |
| --- | --- | --- |
| **Largura** | 480px (desktop) · 100% (mobile) | Espaço suficiente para mensagens longas sem comprometer o kanban. |
| **Altura** | 100vh | Ocupa a tela inteira verticalmente. |
| **Animação de entrada** | Slide da direita com spring animation (Framer Motion: `type: "spring", stiffness: 300, damping: 30`) | Sensação premium e fluida. |
| **Fundo** | Gradiente escuro sutil (slate-950 → slate-900) ou tema claro premium conforme preferência do sistema | Diferenciação visual do drawer de card (que usa fundo branco). |
| **Overlay** | Sem escurecimento do fundo (diferente dos drawers de card). Apenas sombra lateral. | Vendedor precisa ver o kanban/card enquanto conversa com a IA. |
| **Posição** | Fixa à direita, acima do conteúdo. Z-index: mesmo nível dos drawers de card. | Acessível sem bloquear a navegação. |
| **Borda** | Borda esquerda com gradiente azul → roxo (2px), com leve glow effect | Identidade visual premium e diferenciação da IA. |

### 2.2.2 Estrutura do drawer

O drawer é dividido em **3 zonas fixas**:

**Zona 1 — Header (fixo no topo, 64px):**

- **Esquerda:** Ícone ✨ + "Menux Intelligence" (fonte: semibold, tamanho: 16px)
- **Centro:** Badge de contexto ativo (se card aberto): pill com nome do card + temperatura (ex: "🔥 Pizzaria Bella Napoli"). Clicável → abre/foca o card.
- **Direita:** Botão "📋 Escolher cliente" (ícone `Users`, abre modal D11) + Botão "Nova conversa" (ícone `MessageSquarePlus`) + Botão "Fechar" (ícone `X`)

**Zona 2 — Área de mensagens (scroll vertical, flex-grow):**

- Scroll reverso (mensagens mais recentes embaixo)
- Mensagens da IA: alinhadas à esquerda, fundo com leve opacidade (slate-800/10% ou branco/5%), border-radius: 12px, max-width: 90%
- Mensagens do vendedor: alinhadas à direita, fundo azul sólido, texto branco, border-radius: 12px, max-width: 80%
- Separadores de data quando conversa cruza meia-noite
- Indicador de "digitando..." com animação de 3 pontos (Framer Motion)
- Mensagens suportam **Markdown renderizado**: negrito, itálico, listas, blocos de código, tabelas simples, links

**Zona 3 — Barra de input (fixa no rodapé, ~80px):**

- Campo de texto multilinha (auto-expandível, máx. 4 linhas, após isso scroll interno)
- Placeholder contextual (muda conforme tela):
    - Kanban de Pipes: "Pergunte sobre seus leads..."
    - Dentro de um card: "Pergunte sobre [Nome do Card]..."
    - Dashboard: "Como posso te ajudar hoje?"
    - Default: "Fale com a Intelligence..."
- **Botão de enviar:** ícone `Send` (Lucide). Habilitado quando há texto. Enter → envia. Shift+Enter → nova linha.
- **Comandos rápidos:** Ícone `/` à esquerda do input. Clique abre menu com ações rápidas (ver seção 3).
- **Limite:** 2.000 caracteres por mensagem. Contador visível a partir de 1.800.

### 2.2.3 Empilhamento com outros drawers

<aside>
⚙️

**Regra de coexistência:** A Intelligence pode coexistir com drawers de card (D1/D2). Quando ambos estão abertos, o drawer de card é empurrado para a esquerda, reduzindo sua largura para 50% (de 720px para 360px), mantendo ambos visíveis. Em telas < 1440px, o drawer de card é minimizado para uma barra fina (64px) com nome do card + botão de expandir. No mobile, apenas um drawer fica visível por vez — o mais recente tem prioridade.

**Hierarquia de z-index:** Modal D11 (seleção de cliente) > Drawer Intelligence > Drawer de card (D1/D2) > FAB > Conteúdo da página. O modal D11 usa o z-index padrão do shadcn/ui `Dialog` (acima de tudo), garantindo foco total na seleção mesmo com drawer aberto.

</aside>

| Resolução | Intelligence aberta + Card aberto | Intelligence aberta sozinha |
| --- | --- | --- |
| ≥ 1440px | Card: 360px (compacto) + Intelligence: 480px | Intelligence: 480px |
| 1024px – 1439px | Card: barra 64px + Intelligence: 480px | Intelligence: 480px |
| 768px – 1023px (tablet) | Último aberto visível, anterior fica em background | Intelligence: 100% |
| < 768px (mobile) | Último aberto visível, anterior fica em background | Intelligence: 100% |

## 2.3 Saudação inicial e seleção de cliente

Ao abrir o drawer da Intelligence (via FAB, atalho ou primeira vez no dia), a IA **sempre inicia a conversa com uma saudação contextual** seguida de um convite para selecionar um cliente do Pipe.

### 2.3.1 Mensagem de boas-vindas

A primeira mensagem da IA ao abrir uma **nova conversa** segue este template:

> ✨ **Olá, [Nome do vendedor]!** Sou a Menux Intelligence, seu braço direito comercial.
> 

> Quer falar sobre algum cliente específico? Selecione abaixo para eu carregar todo o contexto.
> 

> 
> 

> **[📋 Escolher cliente]**
> 

> 
> 

> Ou pode mandar sua dúvida direto — estou aqui pra ajudar.
> 

<aside>
💡

**Regras da saudação:**

- Se o vendedor **já tem um card aberto** no drawer D1/D2 no momento da abertura → a saudação inclui o contexto do card automaticamente: "Vi que você está com **[Card]** aberto. Quer que eu te ajude com esse lead ou prefere escolher outro?"
- Se for a **primeira abertura do dia** → combina com o resumo matinal: "Bom dia, [Nome]! Você tem [X] atividades hoje e [Y] leads quentes. Quer focar em algum cliente? [📋 Escolher cliente]"
- Se o vendedor **reabre o drawer** com conversa ativa → não repete a saudação. A conversa retoma de onde parou.
</aside>

### 2.3.2 Modal de seleção de cliente (D11)

| Propriedade | Valor | Racional |
| --- | --- | --- |
| **Componente** | shadcn/ui `Dialog` (modal centralizado) | Padrão de modal do Flow (D3/D4). |
| **Trigger** | Botão "📋 Escolher cliente" na mensagem de boas-vindas ou ícone 📋 no header do drawer (Zona 1, ao lado do badge de contexto) | Acesso rápido a qualquer momento da conversa. |
| **Largura** | 520px (desktop) · 90vw (mobile) | Espaço para lista com informações relevantes. |
| **Altura máxima** | 70vh | Lista longa sem cobrir tela inteira. |
| **Overlay** | Escurecimento padrão do Dialog. Z-index acima do drawer da Intelligence. | Foco total na seleção. |

**Estrutura do modal:**

1. **Header:** Título "Selecionar cliente" + botão fechar (`X`)
2. **Campo de busca:** Input com ícone `Search`, placeholder "Buscar por nome, CNPJ ou contato...". Busca incremental (debounce 300ms) filtrando a lista abaixo.
3. **Filtros rápidos (pills):**
    - **Por pipe:** Tabs/pills com os pipes disponíveis (Comercial, CS, etc.). Default: pipe ativo na tela.
    - **Por temperatura:** 🔥 Quente · 🌡️ Morno · ❄️ Frio — toggles opcionais para filtrar.
4. **Lista de cards:** Scroll vertical com os cards do vendedor (respeitando permissões de visibilidade).
    - Cada item exibe:
        - **Nome fantasia** (bold) + **Segmento** (muted)
        - **Etapa atual** (pill colorida) + **Temperatura** (emoji)
        - **Último contato:** data relativa ("há 3 dias")
        - **Valor:** MRR cotado (se houver)
    - Hover: fundo highlight sutil
    - Clique: seleciona o card e fecha o modal
5. **Footer:** Contagem de resultados: "Mostrando X de Y clientes"

**Comportamento após seleção:**

- O modal fecha automaticamente
- O **badge de contexto** no header do drawer (Zona 1) atualiza com o nome do card selecionado + temperatura
- A IA envia mensagem confirmando: "✅ Contexto carregado: **[Card]** ([Etapa] · [Temperatura]). Como posso te ajudar com esse lead?"
- Todos os dados do card são injetados no contexto (mesma lógica da seção 4.1.1)
- O vendedor pode trocar o cliente a qualquer momento clicando no ícone 📋 no header ou digitando no chat "quero falar sobre [nome]"

<aside>
⚙️

**Ordenação da lista:** Cards são ordenados por relevância: (1) cards com atividade vencida, (2) cards quentes, (3) último interagido, (4) alfabético. A busca por texto sobrepõe essa ordenação com match relevance.

</aside>

---

# 3. Comandos Rápidos (Slash Commands)

O vendedor pode digitar `/` no input ou clicar no ícone `/` para acessar uma lista de **ações rápidas** categorizadas. Cada comando gera um prompt estruturado que a IA processa com contexto automático.

## 3.1 Lista de comandos

| Comando | Label | Descrição | Requer card aberto? | Disponível para |
| --- | --- | --- | --- | --- |
| `/briefing` | 📋 Briefing do Lead | Gera resumo completo do card: contexto, objeções, histórico, próximo passo sugerido | ✅ Sim | Comercial, CS, Admin, Master |
| `/objecao` | 🛡️ Quebrar Objeção | Solicita a objeção recebida e retorna contra-argumento + mensagem pronta para WhatsApp | ❌ Não (mas enriquece se houver) | Comercial, CS |
| `/mensagem` | 💬 Escrever Mensagem | Ghostwriting de mensagem para WhatsApp/email com tom e contexto do lead | ❌ Não (mas enriquece se houver) | Comercial, CS |
| `/pitch` | 🎯 Pitch Personalizado | Gera 2-3 argumentos matadores baseados no perfil do lead (segmento, mesas, dores) | ✅ Sim | Comercial |
| `/funil` | 📊 Resumo do Funil | Visão consolidada do pipeline: quentes, parados, em risco, próximas ações | ❌ Não | Comercial, Admin, Master |
| `/analise` | 🔍 Analisar Card | Diagnóstico completo: temperatura, score, risco, sugestão de próximo passo | ✅ Sim | Comercial, CS, Admin, Master |
| `/comparar` | ⚔️ Comparativo | Menux vs concorrente citado — apenas pontos oficiais e documentados | ❌ Não | Comercial |
| `/planos` | 💰 Planos e Preços | Consulta rápida sobre Assist, Sales, Control — preços, features, setup | ❌ Não | Todos |
| `/followup` | 🔄 Gerar Follow-up | Cria mensagem de follow-up baseada na última interação do card | ✅ Sim | Comercial, CS |
| `/ajuda` | ❓ O que você pode fazer? | Lista capacidades da Intelligence com exemplos | ❌ Não | Todos |

## 3.2 Comportamento do menu de comandos

- **Trigger:** Digitar `/` no input (primeiro caractere) ou clicar no ícone `/`
- **Aparência:** Menu dropdown acima do input, com busca incremental (filtra conforme digita)
- **Agrupamento:** Comandos agrupados em "Mais usados" (baseado em frequência do vendedor) + "Todos"
- **Seleção:** Clicar ou Enter seleciona o comando. O comando é substituído por um chip visual (pill azul com o ícone + label)
- **Após seleção:** Se o comando requer input adicional (ex: `/objecao` precisa da objeção), o placeholder do input muda para orientar (ex: "Qual objeção você recebeu?")
- **Comando sem card quando exige card:** Mensagem da IA: "Para usar este comando, abra o card do lead primeiro. Posso te ajudar com outra coisa?"

---

# 4. Capacidades da IA

## 4.1 Contexto automático

A Intelligence coleta contexto automaticamente e o injeta em toda interação. O vendedor **não precisa repetir informações** que já estão no sistema.

### 4.1.1 Dados capturados automaticamente

| Fonte | Dados capturados | Quando é injetado |
| --- | --- | --- |
| **Card aberto (se houver)** | Nome fantasia, CNPJ, contatos (nome + cargo + é decisor?), etapa do funil, temperatura, lead score, score de patente, plano cotado, valor setup/MRR, tags, última atividade, atividades vencidas, notas da timeline (últimas 10), objeções registradas | Sempre que um card está aberto no drawer D1/D2 |
| **Perfil do vendedor** | Nome, perfil de acesso (Comercial/CS/Admin/Master), cards atribuídos, taxa de conversão, metas ativas | Em toda interação |
| **Pipeline atual** | Quantidade de cards por etapa, cards com atividade vencida, cards quentes sem atividade, cards parados > 7 dias | Quando o vendedor pede resumo do funil ou está no Dashboard |
| **Tela ativa** | Em qual módulo o vendedor está (Dashboard, Pipes, Clientes, Atividades, Financeiro) | Sempre — define o placeholder e o comportamento contextual |
| **Base de conhecimento Menux** | Documentação de planos, pricing, funcionalidades, comparativos com concorrentes, tom de voz, casos de uso | Quando a pergunta requer dados do produto |
| **Card selecionado via modal (D11)** | Todos os dados do card selecionado no modal de seleção de cliente: mesmos campos do "Card aberto" acima (nome fantasia, CNPJ, contatos, etapa, temperatura, lead score, plano cotado, notas, objeções, etc.) | Quando o vendedor seleciona um cliente via modal D11 (seção 2.3.2) — equivale a injetar contexto do card sem necessidade de drawer D1/D2 aberto |

### 4.1.2 Indicador de contexto

Quando a IA está usando dados do card, ela exibe um **badge de contexto** no topo da resposta:

- 📋 "Baseado no card: **Pizzaria Bella Napoli** (Negociação · 🔥 Quente)"
- Clicável → foca o drawer do card

Quando não há card aberto, respostas são genéricas (sem dados específicos de lead).

## 4.2 Detalhamento das capacidades

### 4.2.1 Briefing do Lead (`/briefing`)

Gera um resumo executivo do card para preparação rápida antes de reunião ou ligação.

**Output estruturado:**

- **Contexto rápido:** Quem é, segmento, porte (mesas), cidade
- **Onde estamos:** Etapa atual + tempo na etapa + temperatura
- **Contatos:** Lista com cargo e score de patente — destaca decisor
- **Histórico resumido:** Últimas 5 interações (tipo + data + resultado)
- **Objeções ativas:** Se houver objeções registradas nas notas
- **Valor:** Plano cotado + Setup + MRR
- **Risco:** Atividades vencidas, tempo parado, sinais de esfriamento
- **Próximo passo sugerido:** Ação recomendada com base no estágio e contexto

<aside>
💡

**Boas práticas:** O briefing é gerado em formato scannable — títulos em negrito, bullets curtos, emojis como marcadores visuais. O vendedor deve conseguir absorver o briefing em 30 segundos antes de discar.

</aside>

### 4.2.2 Quebrar Objeção (`/objecao`)

O vendedor informa a objeção recebida e a IA retorna:

1. **Análise da objeção:** Classifica em categoria (Preço, Concorrente, Timing, Falta de necessidade, Desconfiança, Técnica)
2. **Contra-argumento:** 2-3 linhas diretas de resposta
3. **Pergunta de avanço:** 1 pergunta para retomar o controle da conversa
4. **Mensagem pronta (copiável):** Bloco de texto formatado para copiar e colar no WhatsApp, com no máximo 280 caracteres

**Regras da resposta:**

- Nunca inventar dados, números ou funcionalidades
- Se a objeção for sobre algo fora do escopo Menux → "Essa funcionalidade não faz parte do escopo atual. Posso sugerir uma abordagem diferente?"
- Se houver card aberto → personaliza com dados do lead (ex: "Com 40 mesas, o impacto estimado no Lovina seria...")
- Tom: direto, como colega de equipe — sem formalidade excessiva

### 4.2.3 Ghostwriting de Mensagem (`/mensagem`)

Cria mensagens personalizadas para canais de comunicação do vendedor.

**Fluxo:**

1. IA pergunta (se não informado): "Qual o canal? (WhatsApp / Email / Ligação)" + "Qual o objetivo? (Primeiro contato / Follow-up / Reagendamento / Pós-reunião / Proposta / Fechamento)"
2. Se card aberto → usa contexto automático
3. Se sem card → pede nome e contexto mínimo

**Output por canal:**

| Canal | Limite | Tom | Formato |
| --- | --- | --- | --- |
| **WhatsApp** | 280 caracteres | Informal mas profissional. 1-2 emojis max. | Bloco de código (copiável) |
| **Email** | 500 caracteres (corpo) | Profissional, direto. Sem jargões. | Assunto + Corpo (copiável separadamente) |
| **Roteiro de ligação** | 5 bullets | Conversacional, objetivo. | Bullets com pontos-chave + pergunta de abertura |

### 4.2.4 Pitch Personalizado (`/pitch`)

Gera argumentos de venda específicos para o perfil do lead.

**Requer card aberto.** Usa dados como segmento, porte, dores identificadas, concorrentes mapeados.

**Output:**

- **Perfil resumo:** 1 linha descrevendo o lead
- **2-3 pontos de valor:** Cada um com: Dor identificada → Argumento Menux → Prova/case similar (se houver)
- **Pergunta de abertura:** Para iniciar a conversa
- **Frase de fechamento:** Para conduzir ao próximo passo

### 4.2.5 Resumo do Funil (`/funil`)

Visão consolidada do pipeline do vendedor.

**Output:**

- **Contagem por temperatura:** 🔥 X quentes · 🌡️ Y mornos · ❄️ Z frios
- **Total no funil:** X oportunidades · R$ Y.YYY em MRR potencial
- **Ações imediatas:** Top 3 cards que precisam de ação agora (vencidos, quentes sem atividade, em risco)
- **Cards parados:** Lista de cards sem atividade > 7 dias com sugestão
- **Previsão:** Cards com maior probabilidade de fechar no mês

<aside>
⚙️

**Permissão:** Comercial vê apenas seus cards. Admin e Master veem todos os cards e podem pedir resumo por vendedor específico ("me mostra o funil do Giovane").

</aside>

### 4.2.6 Análise de Card (`/analise`)

Diagnóstico profundo de um card específico.

**Requer card aberto.** Output:

- **Saúde do deal:** Score numérico (0-100) com breakdown dos 5 componentes do Lead Score
- **Temperatura atual:** Com justificativa (ex: "Morno porque não há atividade há 5 dias apesar do valor alto")
- **Score de patente:** Com análise ("Você está falando com um Gerente (60pts). Para maximizar chances, tente alcançar o Proprietário.")
- **Gargalos:** O que está travando o avanço (campos faltantes, atividades vencidas, falta de decisor)
- **Timeline analysis:** Padrão identificado (ex: "O lead responde rápido por WhatsApp mas some por email")
- **Próximo passo recomendado:** Ação específica + tipo de atividade sugerida + data recomendada
- **Probabilidade de fechamento:** Estimativa baseada em estágio, temperatura, atividade e valor

### 4.2.7 Consulta à Base Menux (`/planos` e perguntas livres)

Toda pergunta sobre produto, preços, funcionalidades, processos ou concorrentes é respondida consultando a base de conhecimento do Menux.

**Fontes consultadas (em ordem de prioridade):**

1. Pricing Book Interno
2. Casos de Uso
3. Conteúdo e Tom de Voz
4. Fluxo UX da Mesa
5. Concorrentes
6. Contratos (termos padrão)

**Regras:**

- Se a informação não estiver na base: "Não encontrei essa informação nos documentos oficiais. Recomendo confirmar com a gestão antes de comunicar ao lead."
- Nunca inventar preços, prazos ou funcionalidades
- Se for pergunta sobre funcionalidade futura: "Essa funcionalidade está no roadmap mas ainda não tem data confirmada. Posso ajudar com o que temos disponível hoje?"

---

# 5. Sugestões Proativas

A Intelligence não espera apenas ser acionada. Em determinados eventos, ela **sinaliza proativamente** que tem algo relevante.

## 5.1 Eventos que geram sugestão proativa

| Evento | Sinalização | Mensagem ao abrir |
| --- | --- | --- |
| Card aberto tem atividade vencida há > 4h | Dot vermelho no FAB | "⚠️ [Card] tem uma atividade vencida há [X] horas. Quer que eu sugira uma abordagem de retomada?" |
| Card quente sem atividade há > 3 dias | Dot vermelho no FAB | "🔥 [Card] está quente mas sem atividade há [X] dias. Posso preparar um follow-up?" |
| Vendedor abre card em etapa Negociação/Fechamento | Mensagem automática no chat (se aberto) | "📋 Vi que você abriu [Card]. Quer um briefing rápido antes de prosseguir?" |
| Início do dia (primeira vez que abre o Flow) | Dot azul no FAB | **Absorvido pela saudação inicial (seção 2.3.1).** Ao abrir o drawer pela primeira vez no dia, a saudação matinal já inclui resumo de atividades + cards quentes + botão de seleção de cliente. O dot azul no FAB permanece como indicador visual de que há resumo disponível. |
| Card movido para etapa sem campos obrigatórios preenchidos | Mensagem no chat (se aberto) | "Antes de avançar [Card] para [Etapa], complete: [lista de campos]. Posso te ajudar?" |

## 5.2 Regras das sugestões proativas

- **Frequência máxima:** 3 sugestões proativas por dia. Após isso, apenas quando solicitado.
- **Horário:** Respeita o horário de silêncio configurado nas preferências de notificação do vendedor (seção 27 do Flow).
- **Dismissível:** Toda sugestão pode ser dispensada com "Agora não" — a IA não repete a mesma sugestão no mesmo dia.
- **Prioridade:** Se houver múltiplas sugestões pendentes, o dot mostra a mais urgente. As demais aparecem em sequência ao abrir o chat.

---

# 6. Mensagens Copiáveis e Ações Sugeridas

## 6.1 Blocos copiáveis

Quando a IA gera conteúdo para o vendedor copiar (mensagem WhatsApp, email, pitch), o output é exibido em um **bloco especial copiável**:

- **Aparência:** Card com fundo levemente diferenciado, borda sutil, ícone do canal (💬 WhatsApp, ✉️ Email)
- **Botão "Copiar":** No canto superior direito do bloco. Ao clicar: conteúdo copiado para clipboard + feedback visual (ícone muda para ✅ por 2 segundos) + toast "Copiado!"
- **Contador de caracteres:** Abaixo do bloco: "237/280 caracteres" (verde se dentro do limite, vermelho se exceder)
- **Edição inline:** O vendedor pode clicar no texto do bloco e editar antes de copiar

## 6.2 Botões de ação sugerida

Quando a IA sugere uma ação do CRM (criar atividade, mover card, registrar nota), ela exibe **botões de ação** abaixo da mensagem:

| Ação sugerida | Botão | Comportamento ao clicar |
| --- | --- | --- |
| Criar atividade | "📅 Criar atividade" (botão secondary) | Abre modal D4 com campos pré-preenchidos pela sugestão da IA (tipo, data, descrição) |
| Registrar nota | "📝 Salvar na timeline" (botão secondary) | Adiciona o conteúdo sugerido como nota na timeline do card aberto. Confirmação: "Nota adicionada à timeline de [Card]." |
| Agendar follow-up | "🔄 Agendar follow-up" (botão secondary) | Abre modal D4 com tipo Follow-up, data sugerida, descrição pré-preenchida |
| Ver card | "👁️ Abrir card" (botão ghost) | Abre drawer D1/D2 do card mencionado |

<aside>
🔴

**Importante:** Botões de ação são **atalhos**, não execuções automáticas. O vendedor sempre revisa e confirma a ação no modal/drawer correspondente. A IA nunca altera dados diretamente.

</aside>

---

# 7. Conversas e Histórico

## 7.1 Modelo de conversas

| Conceito | Descrição | Limite |
| --- | --- | --- |
| **Conversa ativa** | Thread corrente entre o vendedor e a IA. Uma conversa por vez. | Máx. 100 mensagens por conversa |
| **Nova conversa** | Botão "Nova conversa" no header limpa o contexto e inicia do zero. | — |
| **Histórico** | Conversas anteriores ficam acessíveis por 30 dias. | Máx. 50 conversas armazenadas por vendedor |
| **Contexto de sessão** | A IA mantém contexto dentro da mesma conversa (lembra o que já foi discutido). | Janela de contexto: últimas 20 mensagens |

## 7.2 Acesso ao histórico

- Ícone de relógio no header do drawer → abre lista de conversas anteriores
- Cada item mostra: data, primeira mensagem (truncada), card relacionado (se houver)
- Clicar em conversa anterior → carrega no drawer (somente leitura, sem botões de ação)
- Busca por texto dentro do histórico

## 7.3 Persistência de contexto

- **Ao fechar e reabrir o drawer:** Conversa ativa persiste. O vendedor retoma de onde parou.
- **Ao trocar de card:** A IA informa: "Mudei o contexto para [Novo Card]. A conversa anterior continua disponível."
- **Ao fazer logout:** Conversa ativa é encerrada. Ao logar novamente, o vendedor começa conversa nova com saudação inicial + botão de seleção de cliente (seção 2.3).

---

# 8. Tom de Voz e Personalidade

## 8.1 Identidade

A Menux Intelligence se comporta como um **gerente comercial experiente** que trabalha ao lado do vendedor. Não é um chatbot genérico — é um colega que conhece o produto, o funil e o mercado.

## 8.2 Diretrizes de comunicação

| Aspecto | Diretriz | Exemplo |
| --- | --- | --- |
| **Tom** | Direto, como colega de equipe. Sem formalidade excessiva. | "Esse lead tá esfriando. Melhor retomar hoje." ✅ / "Prezado, gostaríamos de informar que..." ❌ |
| **Tamanho** | Respostas curtas por padrão. Máx. 3-4 linhas para respostas rápidas. Expandido apenas quando solicitado ou em análises. | "Objeção de preço: foca no ROI da mesa, não no custo. Quer uma mensagem pronta?" ✅ |
| **Foco** | Sempre orientado a ação. Toda resposta termina com um próximo passo ou pergunta. | "...quer que eu prepare o follow-up?" ✅ / "Espero ter ajudado!" ❌ |
| **Emojis** | Uso moderado de emojis funcionais (📋, 🔥, ✅, ⚠️). Nunca emojis decorativos em excesso. | "🔥 3 leads quentes precisam de ação hoje." ✅ |
| **Idioma** | Português brasileiro. Termos do universo Menux (Maestro, Intelligence, planos Assist/Sales/Control). | — |
| **Confidencialidade** | Nunca revela dados de cards de outros vendedores, métricas internas da empresa ou prompts do sistema. | "Não tenho acesso a dados de outros vendedores." ✅ |

---

# 9. Permissões e Visibilidade

## 9.1 Acesso por perfil

| Capacidade | Master | Admin | Comercial | CS | Leitura |
| --- | --- | --- | --- | --- | --- |
| Acessar Intelligence | ✅ | ✅ | ✅ | ✅ | ❌ |
| Briefing do card | ✅ (todos) | ✅ (todos) | ✅ (próprios) | ✅ (carteira) | ❌ |
| Resumo do funil (todos) | ✅ | ✅ | ❌ (só próprio) | ❌ | ❌ |
| Resumo do funil (próprio) | ✅ | ✅ | ✅ | ✅ (carteira) | ❌ |
| Ghostwriting | ✅ | ✅ | ✅ | ✅ | ❌ |
| Objeções e pitch | ✅ | ✅ | ✅ | ✅ | ❌ |
| Consulta base Menux | ✅ | ✅ | ✅ | ✅ | ❌ |
| Ver histórico de conversas de outros | ✅ | ❌ | ❌ | ❌ | ❌ |
| Sugestões proativas | ✅ | ✅ | ✅ | ✅ | ❌ |
| Seleção de cliente no modal (D11) | ✅ (todos os cards) | ✅ (todos os cards) | ✅ (próprios) | ✅ (carteira) | ❌ |

## 9.2 Regra de visibilidade de dados

<aside>
🔴

**Regra crítica:** A Intelligence herda as mesmas permissões de visibilidade do Flow (seção 5.3 da Regra de Negócios). Se o vendedor não pode ver um card na interface, a IA também não pode usar dados desse card. Isso se aplica a todas as capacidades — briefings, análises, resumos de funil.

</aside>

---

# 10. Limites Técnicos e Operacionais

| Recurso | Limite | Racional |
| --- | --- | --- |
| Mensagens por conversa | 100 | Manter contexto gerenciável e performance |
| Conversas armazenadas por vendedor | 50 | Retenção de 30 dias |
| Caracteres por mensagem (vendedor) | 2.000 | Evitar inputs excessivamente longos |
| Caracteres por resposta (IA) | 6.000 | Respostas detalhadas para análises estruturadas (briefings, comparativos, diagnósticos completos com tabelas) |
| SLA de resposta (simples) | < 5 segundos | Objeções e mensagens rápidas |
| SLA de resposta (complexa) | < 15 segundos | Briefings, análises, resumo de funil |
| Sugestões proativas por dia | 3 | Evitar fadiga de notificação |
| Consultas por vendedor/hora | 60 | Rate limiting para proteger infra |
| Janela de contexto (memória da conversa) | 20 mensagens | Balance entre contexto e custo de processamento |
| Retenção de histórico | 30 dias | Conformidade + otimização de storage |

---

# 11. Estados e Edge Cases

| Cenário | Comportamento esperado |
| --- | --- |
| Vendedor envia mensagem sem card aberto para comando que exige card | IA responde: "Para usar [comando], abra o card do lead primeiro. Quer que eu te ajude a encontrar um card?" Se vendedor informa nome → IA busca e sugere: "Encontrei [Card]. [Abrir card]" |
| IA não encontra resposta na base de conhecimento | "Não encontrei essa informação nos documentos oficiais do Menux. Recomendo confirmar com a gestão antes de comunicar ao lead." |
| Vendedor pede para IA executar ação direta ("mova o card para Proposta") | "Não consigo mover cards diretamente, mas posso te ajudar a preparar: [lista de campos obrigatórios para a etapa]. Quer que eu gere o conteúdo?" |
| Rate limit atingido (60 consultas/hora) | "Você atingiu o limite de consultas nesta hora. O limite será resetado às [HH:MM]. Enquanto isso, suas conversas e histórico continuam disponíveis." |
| Erro na API de IA (timeout ou falha) | Mensagem com ícone de erro: "Ops, tive um problema ao processar sua mensagem. [Tentar novamente]" (botão de retry). Após 3 falhas consecutivas: "Estou com instabilidade no momento. Tente novamente em alguns minutos." |
| Vendedor perfil Leitura tenta acessar | FAB não aparece. Atalho `Ctrl+I` não funciona. Se URL for acessada diretamente → redirect para Dashboard. |
| Conversa atinge 100 mensagens | IA: "Atingimos o limite desta conversa. [Iniciar nova conversa]". Conversa atual vai para histórico. |
| Vendedor envia áudio ou imagem | "Por enquanto, consigo processar apenas texto. Descreva sua dúvida por escrito que eu te ajudo!" (fase 2: suporte a áudio via transcrição) |
| Conexão cai durante resposta da IA | Resposta parcial exibida com indicador "Resposta incompleta — reconectando..." Ao reconectar: tenta completar. Se falhar: "A resposta foi interrompida. [Tentar novamente]". |
| Vendedor pergunta sobre dados de outro vendedor | "Não tenho acesso a dados de cards de outros vendedores. Posso te ajudar com os seus cards?" |
| Card aberto é de módulo Clientes (CS) mas vendedor é Comercial | Se o vendedor não tem permissão para ver o card → contexto não é injetado. IA responde sem dados do card. |
| Múltiplos vendedores usando Intelligence simultaneamente | Cada vendedor tem sessão isolada. Nenhuma interferência entre sessões. Dados nunca são compartilhados entre sessões. |
| Modal D11 aberto mas vendedor tem 0 cards no pipe | Lista vazia com empty state: "Você ainda não tem clientes neste pipe. Pode me fazer perguntas gerais ou consultar a base Menux." Botão "Fechar" disponível. |
| Busca no modal D11 não retorna resultados | Empty state na lista: "Nenhum cliente encontrado para '[busca]'. Tente outro nome, CNPJ ou limpe os filtros." Botão "Limpar filtros" visível. |
| Card selecionado via D11 é deletado/arquivado durante a conversa | Badge de contexto exibe ícone ⚠️ + "Card indisponível". IA: "O card [Nome] foi removido ou arquivado. Quer selecionar outro cliente? [📋 Escolher cliente]" Contexto é limpo automaticamente. |
| Vendedor seleciona card de pipe ao qual não tem permissão total (ex: CS vê card de Comercial) | Card aparece na lista apenas se o vendedor tiver permissão de visualização (herda regras da seção 5.3 da RN Flow). Cards sem permissão não são listados no modal. |

---

# 12. Métricas e KPIs

## 12.1 Métricas de uso

| Métrica | Cálculo | Visível para |
| --- | --- | --- |
| **Consultas por vendedor/dia** | Total de mensagens enviadas pelo vendedor à IA no dia | Admin, Master |
| **Comandos mais usados** | Ranking de slash commands por frequência | Admin, Master |
| **Blocos copiados** | Quantidade de vezes que "Copiar" foi clicado em blocos copiáveis | Admin, Master |
| **Ações sugeridas aceitas** | (Ações executadas via botão de ação / Ações sugeridas) × 100 | Admin, Master |
| **Tempo médio de resposta (IA)** | Média de tempo entre envio do vendedor e primeira resposta da IA | Admin, Master |
| **Taxa de adoção** | (Vendedores que usaram Intelligence no mês / Total de vendedores ativos) × 100 | Master |
| **Taxa de seleção de cliente** | (Conversas iniciadas com seleção de cliente via D11 / Total de conversas iniciadas) × 100 | Admin, Master |

## 12.2 Métricas de impacto (fase 2)

- **Correlação IA × Conversão:** Taxa de conversão de vendedores que usam Intelligence vs. que não usam
- **Tempo de resposta a leads:** Variação no tempo médio de follow-up após adoção da Intelligence
- **Qualidade de pipeline:** Variação nos scores de leads e taxa de atividades concluídas

---

# 13. Roadmap de Fases

| Fase | Escopo | Status |
| --- | --- | --- |
| **v1.0 (MVP)** | Drawer + Chat + Saudação inicial + Modal de seleção de cliente (D11) + 10 slash commands + Contexto de card + Blocos copiáveis + Ações sugeridas + Histórico básico | 🔵 Atual |
| **v1.1** | Sugestões proativas + Badge de contexto + Resumo matinal automático | ⏳ Planejado |
| **v2.0** | Áudio (transcrição automática) + Integração com WhatsApp Business (envio direto) + Métricas de impacto | ⏳ Futuro |
| **v2.1** | Treinamento por feedback (thumbs up/down nas respostas) + Personalização de tom por vendedor | ⏳ Futuro |
| **v3.0** | Modo automático (processamento de formulários de visita) + Scoring de fechamento preditivo | ⏳ Futuro |

---

# 14. Integração com o Zustand Store

<aside>
⚙️

**Requisito técnico:** A Intelligence será gerenciada por uma nova store Zustand `useIntelligenceStore` — separada da `useUIStore` existente para isolar a complexidade de estado da IA, evitar re-renders desnecessários no layout global e facilitar lazy-loading do módulo Intelligence como feature flag — com os seguintes estados e ações:

- `isOpen: boolean` — controle de abertura/fechamento do drawer
- `activeConversation: Conversation | null` — conversa ativa
- `messages: Message[]` — mensagens da conversa ativa
- `isTyping: boolean` — indicador de digitação da IA
- `greetingSent: boolean` — flag que indica se a saudação inicial já foi enviada na sessão atual (evita repetição ao reabrir drawer com conversa ativa)
- `contextCard: Card | null` — card atualmente injetado como contexto
- `isClientPickerOpen: boolean` — controle de abertura/fechamento do modal de seleção de cliente (D11)
- `clientPickerSearch: string` — texto de busca no modal de seleção
- `clientPickerFilters: { pipeId?: string; temperature?: string[] }` — filtros ativos no modal
- `proactiveSuggestions: Suggestion[]` — sugestões proativas pendentes
- `history: Conversation[]` — histórico de conversas (últimas 50)
- `sendMessage(text: string): void` — envia mensagem e dispara processamento da IA
- `executeSlashCommand(command: string, payload?: object): void` — executa comando rápido
- `setContextCard(card: Card | null): void` — define card de contexto (usado após seleção no modal)
- `openClientPicker(): void` — abre o modal de seleção de cliente
- `closeClientPicker(): void` — fecha o modal de seleção de cliente
- `selectClient(card: Card): void` — seleciona um cliente no modal → chama `setContextCard` + `closeClientPicker` + envia mensagem de confirmação da IA
- `dismissSuggestion(id: string): void` — dispensa sugestão proativa
- `startNewConversation(): void` — inicia nova conversa + dispara saudação inicial
- `loadConversation(id: string): void` — carrega conversa do histórico

O drawer é renderizado no `(auth)/layout.tsx` junto com os outros drawers, reagindo ao `useIntelligenceStore.isOpen`.

</aside>

---

<aside>
⚠️

**Pendência — Wireframes v2.1:** O drawer da Intelligence e o modal de seleção de cliente (D11) ainda **não estão representados** no documento de Wireframes v2.1 do Flow. É necessário adicionar:

- **T13** — Tela/componente do drawer da Intelligence (Sheet lateral direita)
- **D11** — Dialog modal de seleção de cliente

Responsável: Design/Produto. Referência: seções 2.2 e 2.3 deste documento.

</aside>

---

**Fim do Documento**

*Última atualização: 13/02/2026 14:37 (America/Fortaleza) — Versão 1.1*