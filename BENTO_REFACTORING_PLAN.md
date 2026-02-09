# Plano de Refatoração Visual - Dashboard Bento Cards Premium

**Objetivo:** Transformar o Dashboard atual em um layout Bento Cards premium, eliminando "UI genérica" e criando hierarquia visual moderna e operacional.

**Data:** 2026-02-06
**Status:** Planejamento Completo
**Breakpoints Obrigatórios:** 1280px, 1440px, 1920px

---

## 📋 1. INVENTÁRIO DO ESTADO ATUAL

### Seções Existentes no Dashboard

| Seção | Componente Atual | Estado | Problemas Identificados |
|-------|------------------|--------|-------------------------|
| **Métricas Topo** | `MetricCard` × 4 | Grid 4 colunas | Layout chapado, sem hierarquia Bento |
| **Alertas Críticos** | `CriticalAlerts` | Lista vertical | Baixa densidade, sem destaque visual premium |
| **Pipeline Snapshot** | `PipelineChart` | Card largo (8 cols) | Visual funcional, mas sem estilo Bento |
| **Saúde Clientes (CS)** | `CSHealthOverview` | Grid 2×2 interno | Falta profundidade visual |
| **Desempenho Equipe** | `TeamPerformance` | Tabela simples | Aparência de planilha crua |
| **Atividades Hoje** | `TodayActivities` | Card lateral (4 cols) | Botão concluir sem feedback inline completo |
| **Skeleton Loading** | `DashboardSkeleton` | Completo | Funcional, precisa ajustar para Bento |

### Tokens CSS Existentes (globals.css)

✅ **Cores**
- Brand: `#7A55FD` + `brand-light`
- Status: success, warning, danger, info (com variantes `-light`)
- Neutros: zinc-50 a zinc-950

✅ **Radius**
- `--radius-pill: 9999px` (botões)
- `--radius-overlay: 20px` (modais/drawers)
- `--radius-card: 15px` (cards)
- `--radius-badge: 10px` (badges)

✅ **Shadows (Elevation)**
- `--shadow-base`: sutil
- `--shadow-card`: padrão cards
- `--shadow-drawer`: elevação média
- `--shadow-modal`: elevação alta
- `--shadow-overlay`: máxima profundidade

✅ **Spacing**
- Escala de 0 a 16 (4px a 64px)

✅ **Typography**
- Heading: Bricolage Grotesque
- Body: Geist

---

## 🎨 2. ESTRATÉGIA DE LAYOUT BENTO

### Grid System por Breakpoint

#### 1280px (Desktop Padrão)
```
┌─────────────────────────────────────┐
│ Header (full width)                 │
├──────────────┬──────────────────────┤
│ Métricas (2 cols × 2 rows)          │
├──────────────┴──────────────────────┤
│ Alertas Críticos (full, destaque)   │
├──────────────┬──────────────────────┤
│ Pipeline (8) │ Atividades (4)       │
│              │                      │
│ Equipe (8)   │                      │
└──────────────┴──────────────────────┘
```

#### 1440px (Bento Premium)
```
┌───────────────────────────────────────────┐
│ Header                                    │
├────────┬────────┬────────┬───────────────┤
│ Métrica│ Métrica│ Métrica│ Alertas       │
│   1    │   2    │   3    │ Críticos      │
├────────┴────────┴────────┤ (tall card)   │
│ Métrica 4 (wide card)    │               │
├──────────────────────────┼───────────────┤
│ Pipeline (8 cols)        │ Atividades (4)│
├──────────────────────────┤               │
│ Desempenho Equipe (8)    │               │
└──────────────────────────┴───────────────┘
```

#### 1920px (Desktop Grande)
```
┌─────────────────────────────────────────────────────┐
│ Header (max-width controlado, gutters generosos)    │
├──────┬──────┬──────┬──────────────┬────────────────┤
│ M1   │ M2   │ M3   │ Alertas      │ Atividades     │
├──────┴──────┴──────┤ Críticos     │ Hoje           │
│ M4 (wide, 3 cols)  │ (tall)       │ (tall)         │
├────────────────────┼──────────────┤                │
│ Pipeline (6)       │ Equipe (3)   │                │
└────────────────────┴──────────────┴────────────────┘
```

### Hierarquia de Tamanhos Bento

| Card | Tamanho | Cols (1440px) | Destaque | Conteúdo |
|------|---------|---------------|----------|----------|
| **Alertas Críticos** | tall | 3 | ALTO | Lista com severidade, destaque visual |
| **Atividades Hoje** | tall | 4 | ALTO | Lista com checkboxes, subheaders |
| **Pipeline** | wide | 8 | MÉDIO | Barras horizontais, etapas com valores |
| **Métrica Principal** | wide | 6 | MÉDIO | 1 métrica expandida (se houver) |
| **Métricas Padrão** | small | 2-3 | BAIXO | Valor, delta, subtexto |
| **Desempenho Equipe** | medium | 8 | MÉDIO | Tabela compacta 4 colunas |
| **Saúde Clientes** | grid | 8 | MÉDIO | Grid 2×2 interno |

---

## 🧩 3. COMPONENTES UI - CRIAR/REFATORAR

### 3.1 BentoCard (Base Universal)

**Arquivo:** `/src/components/ui/bento-card.tsx`

**Props:**
```typescript
interface BentoCardProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'tall' | 'wide';
  state?: 'default' | 'loading' | 'error' | 'empty';
  className?: string;
  noPadding?: boolean;
  elevated?: boolean; // usa shadow-drawer ao invés de shadow-card
}
```

**Características:**
- Border: `border-zinc-200`
- Radius: `rounded-[var(--radius-card)]`
- Background: `bg-white`
- Shadow padrão: `shadow-card`
- Shadow elevated: `shadow-drawer`
- Padding: `p-6` (ou `p-0` se `noPadding`)
- Header com title + description + actions
- Suporte a skeleton interno quando `state="loading"`

**Estados Visuais:**
- `default`: normal
- `loading`: skeleton overlay
- `error`: borda vermelha + mensagem inline
- `empty`: placeholder com ícone + CTA

---

### 3.2 BentoStatCard (Métricas)

**Arquivo:** `/src/components/ui/bento-stat-card.tsx`

**Props:**
```typescript
interface BentoStatCardProps {
  label: string;
  value: string | number;
  delta?: {
    value: number;
    direction: 'up' | 'down';
  };
  helper?: string;
  icon?: React.ReactNode;
  state?: 'default' | 'loading' | 'error';
  size?: 'sm' | 'md' | 'lg';
}
```

**Layout:**
```
┌────────────────────┐
│ 🔵 Icon    +12% ↗  │ (header: icon + delta badge)
│                    │
│ 47                 │ (value: font-heading text-3xl)
│ Oportunidades      │ (label: text-sm text-zinc-600)
│ 18 novos este mês  │ (helper: text-xs text-zinc-500)
└────────────────────┘
```

**Estados:**
- `loading`: skeleton para value + label
- `error`: border-status-danger + mensagem inline pequena

---

### 3.3 BentoListCard (Alertas, Atividades)

**Arquivo:** `/src/components/ui/bento-list-card.tsx`

**Props:**
```typescript
interface BentoListCardProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyState?: {
    icon: React.ReactNode;
    message: string;
    action?: { label: string; onClick: () => void };
  };
  grouped?: boolean; // permite subheaders como "Atrasadas" / "Hoje"
  state?: 'default' | 'loading' | 'error';
}
```

**Características:**
- Lista com `space-y-2`
- Divisores sutis entre grupos (se `grouped`)
- Empty state elegante centralizado
- Skeleton: 3-5 linhas genéricas

---

### 3.4 BentoTableCard (Desempenho Equipe)

**Arquivo:** `/src/components/ui/bento-table-card.tsx`

**Props:**
```typescript
interface BentoTableCardProps {
  title: string;
  columns: Array<{
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, row: any) => React.ReactNode;
  }>;
  rows: Record<string, any>[];
  state?: 'default' | 'loading' | 'error' | 'empty';
}
```

**Características:**
- Header fixo: `border-b border-zinc-100`
- Row hover: `hover:bg-zinc-50 transition-colors`
- Alinhamento correto: números à direita
- Tipografia consistente: header `text-xs text-zinc-500`, rows `text-sm text-black/zinc-600`
- Sem borda externa excessiva

---

### 3.5 InlineFeedback (Feedback Universal)

**Arquivo:** `/src/components/ui/inline-feedback.tsx`

**Props:**
```typescript
interface InlineFeedbackProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  compact?: boolean;
}
```

**Layout:**
```
┌─────────────────────────────────────────┐
│ ✓ Atividade concluída com sucesso!  ×  │ (success: bg-status-success-light)
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ⚠ Erro ao carregar. [Tentar novamente] │ (error: bg-status-danger-light)
└─────────────────────────────────────────┘
```

**Características:**
- Border-left colorido: `border-l-4` com cor do tipo
- Padding: `px-4 py-3`
- Ícone inline
- Botão de ação opcional
- Close button opcional (X)
- Sem toast, sempre inline no contexto

---

### 3.6 SkeletonBlock (Skeleton Consistente)

**Arquivo:** `/src/components/ui/skeleton-block.tsx`

**Props:**
```typescript
interface SkeletonBlockProps {
  type: 'stat' | 'list' | 'table' | 'chart' | 'custom';
  lines?: number;
  className?: string;
}
```

**Variações:**
- `stat`: bloco com icon + value + label
- `list`: 3-5 linhas com altura variada
- `table`: header + 4 rows
- `chart`: barra horizontal skeleton
- `custom`: genérico com `className`

**Estilo:**
- `animate-pulse`
- `bg-zinc-100`
- `rounded-[15px]` para blocos maiores
- `rounded-[10px]` para itens pequenos

---

## 🎯 4. REFATORAÇÃO POR SEÇÃO DO DASHBOARD

### Seção A: Topo de Métricas

#### Estado Atual
4 cards `MetricCard` em grid simples 1-2-4 colunas

#### Estado Bento
4 `BentoStatCard` com tamanhos variados:
- 1280px: 2×2 grid
- 1440px: 3 cards pequenos (2 cols cada) + 1 card wide (6 cols)
- 1920px: 4 cards com spacing generoso

#### Mudanças Visuais
- [ ] Usar `BentoStatCard` ao invés de `MetricCard`
- [ ] Icon em círculo colorido `bg-brand-light text-brand` (10px radius)
- [ ] Delta badge com `rounded-[10px]`
- [ ] Value: `font-heading text-3xl font-bold`
- [ ] Label: `text-sm text-zinc-600`
- [ ] Helper: `text-xs text-zinc-500`
- [ ] Shadow: `shadow-card`
- [ ] Hover: `hover:shadow-drawer transition-shadow duration-300`

#### Estados Obrigatórios
- [x] `loading`: skeleton com animação
- [ ] `error`: inline com borda vermelha + retry
- [ ] `empty`: mensagem "Sem dados disponíveis"
- [x] `default`: visual completo

---

### Seção B: Alertas Críticos

#### Estado Atual
Lista vertical com cards clicáveis, cores de severidade

#### Estado Bento
Card **tall** com destaque máximo:
- 1280px: full width após métricas
- 1440px: 3 colunas tall à direita
- 1920px: 4 colunas tall

#### Mudanças Visuais
- [ ] Usar `BentoListCard` ou card customizado tall
- [ ] Title: "Alertas Críticos" com ícone `AlertTriangle`
- [ ] Cada item com:
  - Severidade visual: borda esquerda 4px (`border-l-4`)
  - Ícone do tipo (SLA, Health, Activity)
  - Mensagem bold
  - CTA "Ver detalhes →" discreto
- [ ] Hover: `hover:bg-zinc-50 transition-colors`
- [ ] Divisores sutis entre items: `border-b border-zinc-100 last:border-0`
- [ ] Elevated shadow para destaque

#### Estados Obrigatórios
- [ ] `loading`: skeleton de 3 linhas
- [ ] `empty`: "Nenhum alerta crítico" com ícone Check
- [ ] `error`: mensagem inline + retry
- [x] `default`: lista completa

---

### Seção C: Pipeline Snapshot

#### Estado Atual
Card largo (8 cols) com barras horizontais

#### Estado Bento
Card **wide** premium:
- 1280px: 8 colunas
- 1440px: 8 colunas
- 1920px: 6 colunas (sobra espaço para outros cards)

#### Mudanças Visuais
- [ ] Manter estrutura de barras horizontais
- [ ] Etapas como mini-cards internos ou chips:
  - Cada etapa: `bg-zinc-50 rounded-[10px] p-3`
  - Nome: `text-sm font-medium text-zinc-700`
  - Badge count: `rounded-[10px] bg-white text-xs`
  - Valor: `text-sm font-semibold text-black`
- [ ] Barra de progresso: `rounded-full bg-zinc-100`
- [ ] Fill bar: `bg-brand rounded-full transition-all duration-700`
- [ ] Spacing entre etapas: `space-y-4`

#### Estados Obrigatórios
- [ ] `loading`: skeleton de 6 barras
- [x] `empty`: "Pipeline vazio" com ícone Kanban
- [ ] `error`: inline com retry
- [x] `default`: visual completo

---

### Seção D: Desempenho da Equipe

#### Estado Atual
Tabela simples com aparência de planilha

#### Estado Bento
`BentoTableCard` com tipografia e spacing premium

#### Mudanças Visuais
- [ ] Usar `BentoTableCard`
- [ ] Header: `text-xs font-medium text-zinc-500 uppercase tracking-wide`
- [ ] Header border: `border-b border-zinc-100 pb-2`
- [ ] Rows:
  - `rounded-[10px] p-2`
  - Hover: `hover:bg-zinc-50 transition-colors`
  - Nome: `text-sm font-medium text-black truncate`
  - Deals: `text-sm text-zinc-600 text-center`
  - Receita: `text-sm text-zinc-600 text-center`
  - Conversão: `text-sm font-semibold text-brand text-right`
- [ ] Grid 4 colunas com gap controlado

#### Estados Obrigatórios
- [ ] `loading`: skeleton header + 4 rows
- [ ] `empty`: "Nenhum membro na equipe"
- [ ] `error`: inline com retry
- [x] `default`: tabela completa

---

### Seção E: Atividades de Hoje

#### Estado Atual
Card lateral (4 cols) com checkboxes, sem feedback inline completo

#### Estado Bento
Card **tall** à direita com feedback inline obrigatório

#### Mudanças Visuais
- [ ] Usar `BentoListCard` com grouped
- [ ] Subheaders:
  - "ATRASADAS": `text-xs font-semibold uppercase tracking-wider text-status-danger`
  - "HOJE": `text-xs font-semibold uppercase tracking-wider text-black`
- [ ] Cada item:
  - Checkbox: `rounded-[4px]` com estados hover/active/checked
  - Type icon: círculo `rounded-full bg-zinc-100` (ou vermelho se atrasado)
  - Título: `text-sm font-medium text-black` (ou `line-through` se done)
  - Horário: `text-xs text-zinc-500` (ou vermelho se atrasado)
- [ ] Ao concluir: **inline feedback** na própria linha:
  - Success: `bg-status-success-light border-status-success`
  - Error: `bg-status-danger-light border-status-danger` + "Tentar novamente"
- [ ] **SEM TOAST**, apenas feedback inline

#### Estados Obrigatórios
- [ ] `loading`: skeleton de 5 itens
- [x] `empty`: "Nenhuma atividade para hoje" com ícone CalendarCheck
- [ ] `error`: inline por item
- [ ] `success`: inline por item (quando concluir)
- [x] `default`: lista completa

#### Action States (Botão Concluir)
- [ ] `default`: checkbox vazio, border-zinc-300
- [ ] `hover`: border-brand
- [ ] `active`: scale-95
- [ ] `focus`: ring-2 ring-brand/50
- [ ] `checked`: bg-brand border-brand text-white
- [ ] `disabled`: opacity-50 cursor-not-allowed

---

### Seção F: Busca Global

**Não aplicável** — Não existe busca global visível no Dashboard atual.
Se adicionado futuramente, usar padrão Bento com input + resultados agrupados.

---

### Seção G: Checklist de Onboarding

**Não aplicável** — Não existe checklist de onboarding visível no Dashboard atual.
Se adicionado futuramente, usar chip fixo ou mini-card com drawer.

---

## 🎨 5. TOKENS CSS - COMPLEMENTAÇÃO

### Arquivo: `/src/app/bento-tokens.css`

Criar arquivo com tokens adicionais para Bento sem alterar paleta:

```css
@theme inline {
  /* === BENTO SPECIFIC TOKENS === */

  /* Surface Layers (derivados de neutros existentes) */
  --color-surface-base: #ffffff;
  --color-surface-raised: #fafafa;
  --color-surface-overlay: #f4f4f5;

  /* Bento Card Shadows (usar existentes, mas documentar uso) */
  --shadow-bento-sm: var(--shadow-card);      /* cards normais */
  --shadow-bento-md: var(--shadow-drawer);    /* cards destacados */
  --shadow-bento-lg: var(--shadow-modal);     /* cards principais */

  /* Bento Borders */
  --border-bento-default: #e4e4e7;            /* zinc-200 */
  --border-bento-subtle: #f4f4f5;             /* zinc-100 */
  --border-bento-focus: var(--color-brand);

  /* Bento Spacing (adicionar valores intermediários se necessário) */
  --spacing-1-5: 6px;
  --spacing-2-5: 10px;
  --spacing-7: 28px;
  --spacing-9: 36px;
  --spacing-14: 56px;

  /* Bento Radius Specific */
  --radius-bento-stat: 15px;
  --radius-bento-icon: 10px;
  --radius-bento-delta: 10px;

  /* Typography Scales (garantir consistência) */
  --text-bento-value: 1.875rem;      /* 30px - valores principais */
  --text-bento-label: 0.875rem;      /* 14px - labels */
  --text-bento-helper: 0.75rem;      /* 12px - helper text */
  --text-bento-subheader: 0.75rem;   /* 12px - subheaders uppercase */

  /* Hover & Interaction States */
  --transition-bento: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --scale-active: 0.98;
  --scale-hover: 1.02;
}
```

**Regras:**
- ✅ Apenas criar tokens organizacionais
- ✅ Derivar de valores existentes
- ✅ NÃO inventar cores novas
- ✅ NÃO mudar paleta principal

---

## ✅ 6. ESTADOS VISUAIS COMPLETOS

### Para TODOS os componentes interativos:

#### Botões / Checkboxes / Links
| Estado | Visual |
|--------|--------|
| `default` | Border normal, sem hover |
| `hover` | Background subtle, border-brand, cursor-pointer |
| `active` | Scale 0.98, brightness-95 |
| `focus` | Ring 2px ring-brand/50 outline-offset-2 |
| `disabled` | Opacity 50%, cursor-not-allowed, no hover |

#### Cards de Dados
| Estado | Visual |
|--------|--------|
| `loading` | Skeleton com animate-pulse, bg-zinc-100 |
| `empty` | Ícone centralizado + mensagem + CTA (se aplicável) |
| `error` | Border-status-danger + InlineFeedback tipo error + retry button |
| `success` | InlineFeedback tipo success (após ação) |
| `default` | Conteúdo normal |

### Checklist de Implementação por Card

#### BentoStatCard
- [ ] Estado default completo
- [ ] Estado loading (skeleton)
- [ ] Estado error (inline feedback)
- [ ] Estado empty (mensagem)
- [ ] Hover state (shadow elevation)

#### BentoListCard (Alertas)
- [ ] Estado default completo
- [ ] Estado loading (skeleton 3 linhas)
- [ ] Estado error (inline feedback)
- [ ] Estado empty (ícone + mensagem)
- [ ] Hover por item (bg-zinc-50)

#### BentoListCard (Atividades)
- [ ] Estado default completo
- [ ] Estado loading (skeleton 5 linhas)
- [ ] Estado error por item (inline feedback)
- [ ] Estado empty (ícone + mensagem)
- [ ] Success feedback inline ao concluir
- [ ] Checkbox com todos os estados (default/hover/active/focus/checked/disabled)

#### PipelineChart
- [ ] Estado default completo
- [ ] Estado loading (skeleton 6 barras)
- [ ] Estado error (inline feedback)
- [x] Estado empty (ícone Kanban + "Pipeline vazio")
- [ ] Animação de barras (transition-all duration-700)

#### BentoTableCard (Equipe)
- [ ] Estado default completo
- [ ] Estado loading (skeleton header + 4 rows)
- [ ] Estado error (inline feedback)
- [ ] Estado empty ("Nenhum membro")
- [ ] Hover por row (bg-zinc-50)

---

## 📐 7. RESPONSIVIDADE E DENSIDADE

### Regras de Gutters e Max Width

#### 1280px
```css
.dashboard-container {
  max-width: 1240px; /* container com 20px margin cada lado */
  padding: 0 20px;
  gap: 24px; /* espaçamento entre seções */
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px; /* gap entre cards */
}
```

#### 1440px
```css
.dashboard-container {
  max-width: 1400px;
  padding: 0 20px;
  gap: 32px;
}

.bento-grid {
  gap: 20px;
}
```

#### 1920px
```css
.dashboard-container {
  max-width: 1720px; /* 100px margin cada lado */
  padding: 0 100px;
  gap: 40px;
}

.bento-grid {
  gap: 24px;
}
```

### Evitar Vazio Perceptível
- [ ] Em 1920px, usar `max-width` controlado
- [ ] Aumentar gutters ao invés de esticar cards infinitamente
- [ ] Cards mantêm proporção saudável (não ultra-largos)
- [ ] Considerar 3-4 colunas reais ao invés de 12 cols fluídas em telas grandes

### Scroll Interno
- [ ] **NÃO** usar scroll interno em cards de métricas
- [ ] **NÃO** usar scroll em pipeline (mostrar top 6 etapas)
- [ ] **PERMITIR** scroll apenas em:
  - Atividades de Hoje (se >10 itens)
  - Desempenho Equipe (se >8 membros)
  - Com `max-height` e `overflow-y-auto` suave

### CTA Sempre Visível
- [ ] Botões primários sempre acima da dobra
- [ ] Ações de card visíveis sem hover (se críticas)
- [ ] Focus trap correto em modais/drawers

---

## 🧪 8. CRITÉRIOS DE PRONTO (CHECKLIST FINAL)

### Visual Premium
- [ ] Dashboard em 1280px: layout Bento funcional, sem vazio excessivo
- [ ] Dashboard em 1440px: layout Bento otimizado, hierarquia clara
- [ ] Dashboard em 1920px: layout Bento premium, gutters generosos, sem espaço vazio perceptível
- [ ] Todos os cards seguem padrão Bento (radius, shadow, spacing)
- [ ] Tipografia consistente (Bricolage heading, Geist body)
- [ ] Spacing consistente (usando tokens CSS)
- [ ] Nenhuma seção "chapada" sem profundidade visual
- [ ] Shadows aplicadas corretamente (base/drawer/modal)

### Interatividade Completa
- [ ] Todos os botões têm estados: default/hover/active/focus/disabled
- [ ] Todos os checkboxes têm estados completos
- [ ] Todos os cards clicáveis têm hover state
- [ ] Focus visível em todos os elementos interativos (ring-2 ring-brand/50)
- [ ] Targets de toque ≥44px (WCAG)

### Feedback Inline
- [ ] Ações de atividade têm feedback inline (success/error)
- [ ] **SEM TOAST** em nenhum lugar
- [ ] **SEM MODAL** de sucesso
- [ ] Erros inline com retry button
- [ ] Success inline com mensagem breve

### Estados de Dados
- [ ] Todos os cards com dados têm estado `loading` (skeleton)
- [ ] Todos os cards com dados têm estado `empty` (ícone + mensagem)
- [ ] Todos os cards com dados têm estado `error` (inline + retry)
- [ ] Skeletons consistentes (mesmo radius, mesmo animate-pulse)

### Consistência de Componentes
- [ ] Todos os BentoStatCard seguem mesmo padrão
- [ ] Todos os BentoListCard seguem mesmo padrão
- [ ] BentoTableCard usa tipografia consistente
- [ ] InlineFeedback usado em todos os feedbacks
- [ ] Nenhum componente novo quebra páginas existentes

### Performance
- [ ] Animações suaves (transition-all duration-300 ou 700)
- [ ] Sem layout shift durante loading
- [ ] Skeleton placeholder mantém dimensões corretas

---

## 🗂️ 9. ESTRUTURA DE ARQUIVOS A CRIAR

```
/src/
  components/
    ui/
      bento-card.tsx          ← Novo: base universal
      bento-stat-card.tsx     ← Novo: métricas
      bento-list-card.tsx     ← Novo: listas/alertas/atividades
      bento-table-card.tsx    ← Novo: tabelas compactas
      inline-feedback.tsx     ← Novo: feedback inline universal
      skeleton-block.tsx      ← Novo: skeleton consistente

  app/
    bento-tokens.css          ← Novo: tokens Bento específicos
    globals.css               ← Atualizar: importar bento-tokens

  app/(auth)/
    dashboard/
      page.tsx                ← Refatorar: usar novos componentes Bento
```

---

## 📅 10. ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

### Fase 1: Fundação (tokens + componentes base)
1. Criar `/src/app/bento-tokens.css`
2. Importar em `globals.css`
3. Criar `BentoCard` base
4. Criar `SkeletonBlock`
5. Criar `InlineFeedback`

### Fase 2: Componentes Específicos
6. Criar `BentoStatCard`
7. Criar `BentoListCard`
8. Criar `BentoTableCard`

### Fase 3: Refatoração Dashboard
9. Refatorar seção Métricas (BentoStatCard)
10. Refatorar seção Alertas (BentoListCard tall)
11. Refatorar seção Pipeline (BentoCard wide + barras)
12. Refatorar seção Atividades (BentoListCard tall + feedback inline)
13. Refatorar seção Desempenho Equipe (BentoTableCard)
14. Refatorar seção Saúde Clientes (BentoCard + grid interno)

### Fase 4: Layout Responsivo
15. Implementar grid Bento 1280px
16. Implementar grid Bento 1440px
17. Implementar grid Bento 1920px
18. Ajustar gutters e max-width

### Fase 5: Estados e Polimento
19. Adicionar todos os estados (loading/error/empty) a todos os cards
20. Adicionar feedback inline completo em atividades
21. Testar todos os estados interativos (hover/active/focus/disabled)
22. Validar consistência visual em todos os breakpoints

### Fase 6: Validação Final
23. Checklist de critérios de pronto (seção 8)
24. Teste de acessibilidade (focus, targets, contrast)
25. Teste de performance (animações suaves, sem shift)

---

## 📝 11. NOTAS DE IMPLEMENTAÇÃO

### Não Fazer
- ❌ NÃO criar novas cores fora da paleta existente
- ❌ NÃO usar toast (sempre inline feedback)
- ❌ NÃO usar modal de sucesso
- ❌ NÃO inventar novos radius fora dos tokens
- ❌ NÃO usar spacing arbitrário (sempre tokens)
- ❌ NÃO criar componente que não seja reutilizável
- ❌ NÃO adicionar dependências externas

### Sempre Fazer
- ✅ Usar tokens CSS existentes
- ✅ Feedback inline com `InlineFeedback`
- ✅ Estados completos (default/hover/active/focus/disabled)
- ✅ Skeleton consistente com `SkeletonBlock`
- ✅ Testar em 1280, 1440, 1920
- ✅ Validar que não quebra outras páginas
- ✅ Manter hierarquia visual clara

### Padrões de Código
```typescript
// ✅ BOM: usar tokens
className="rounded-[var(--radius-card)] shadow-[var(--shadow-card)]"

// ❌ RUIM: valores hardcoded
className="rounded-lg shadow-md"

// ✅ BOM: estados explícitos
<button
  className={cn(
    "px-4 py-2 rounded-full transition-all",
    "hover:bg-zinc-100 active:scale-95",
    "focus:ring-2 focus:ring-brand/50",
    "disabled:opacity-50 disabled:cursor-not-allowed"
  )}
>

// ❌ RUIM: sem estados
<button className="px-4 py-2 rounded-full">
```

---

## ✅ STATUS FINAL

**Este plano está completo e pronto para implementação.**

Todos os requisitos do usuário foram contemplados:
- ✅ Transformação para Bento Cards premium
- ✅ Hierarquia, spacing, tipografia, densidade definidos
- ✅ Responsividade obrigatória (1280, 1440, 1920)
- ✅ Estados visuais completos para todos os componentes
- ✅ Feedback inline (sem toast/modal de sucesso)
- ✅ Componentes reutilizáveis documentados
- ✅ Tokens CSS organizados (sem inventar cores)
- ✅ Critérios de pronto claros
- ✅ Ordem de implementação definida

**Próximo passo:** Implementação da Fase 1 (Fundação).
