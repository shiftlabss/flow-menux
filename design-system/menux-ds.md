# Menux Design System — Contract Header (Powered by Orbit)

| Key | Value |
| :--- | :--- |
| **System Name** | Menux |
| **Version** | 2.0.0 (Derived from Orbit v1.1.0, expanded for Flow CRM) |
| **Framework** | React + Tailwind CSS v4 |
| **Status** | Specification Draft |
| **Last Updated** | 2026-02-06 |
| **Language** | TypeScript |

## Propósito do Documento
Este documento serve como a "Source of Truth" (Fonte da Verdade) absoluta e contratual para o Menux Design System. Ele descreve os tokens, componentes, padrões e regras que constituem a infraestrutura de interface do produto Menux.

## Regras de Não-Inferência
1. **O que não está escrito aqui não existe.**
2. Não assumir valores padrão de frameworks (ex: não assumir que `rounded-md` é aceitável só porque é padrão do Tailwind).
3. Qualquer desvio desta especificação é considerado um bug de implementação.
4. Estilos visuais são definidos explicitamente via tokens ou classes utilitárias literais permitidas.

---

## Design Principles

1. **Clareza Funcional**: A legibilidade e a função precedem qualquer decisão estética.
2. **Hierarquia Explícita**: Informação estruturada por posição e contraste.
3. **Comportamento Previsível**: Interações seguem padrões rígidos.
4. **Composição**: Interfaces complexas são construídas apenas pela combinação de componentes atômicos existentes.
5. **Acessibilidade Nativa**: Contraste, áreas de toque e navegação por teclado são requisitos técnicos obrigatórios.

---

## Design Tokens

### Color Tokens

**Primitives (Black, White, Zinc & Brand)**

| Token Name | Value | Description |
| :--- | :--- | :--- |
| `--color-black` | `#000000` | Botões, Headings, Focos |
| `--color-white` | `#ffffff` | Fundo, Texto Auxiliar |
| `--color-brand-primary` | `#7A55FD` | Roxo - Cor de Destaque |
| `--color-zinc-*` | `tailwind.colors.zinc` | Escala cinza de suporte |

**Semantic Aliases**

| Token Name | Reference | Usage |
| :--- | :--- | :--- |
| `--menux-bg-app` | `var(--color-white)` | Fundo global |
| `--menux-text-primary` | `var(--color-black)` | Headings, Títulos |
| `--menux-text-secondary` | `var(--color-zinc-600)` | Corpo de texto, labels |
| `--menux-brand` | `var(--color-brand-primary)` | Elementos de destaque |
| `--menux-border-base` | `var(--color-zinc-200)` | Bordas padrão |
| `--menux-border-focus` | `var(--color-brand-primary)` | Anel de foco (Opcional: ou Black) |

**Status Colors**

Cores de status usadas em alertas, Health Score, SLAs, temperature indicators e feedback do sistema.

| Token Name | Value | Usage |
| :--- | :--- | :--- |
| `--color-status-success` | `#16A34A` (green-600) | Ganho, Saudável, Pago, Confirmado |
| `--color-status-success-light` | `#F0FDF4` (green-50) | Fundo de alertas/badges positivos |
| `--color-status-warning` | `#D97706` (amber-600) | Atenção, Morno, Projetado |
| `--color-status-warning-light` | `#FFFBEB` (amber-50) | Fundo de alertas/badges de atenção |
| `--color-status-danger` | `#DC2626` (red-600) | Crítico, Perdido, Atrasado, Churn |
| `--color-status-danger-light` | `#FEF2F2` (red-50) | Fundo de alertas/badges críticos |
| `--color-status-info` | `#2563EB` (blue-600) | Informativo, links, Projetado |
| `--color-status-info-light` | `#EFF6FF` (blue-50) | Fundo de alertas/badges informativos |

**Semantic Status Aliases**

| Token Name | Reference | Usage |
| :--- | :--- | :--- |
| `--menux-health-good` | `var(--color-status-success)` | Health Score verde |
| `--menux-health-warning` | `var(--color-status-warning)` | Health Score amarelo |
| `--menux-health-critical` | `var(--color-status-danger)` | Health Score vermelho |
| `--menux-temp-hot` | `var(--color-status-danger)` | Temperatura quente |
| `--menux-temp-warm` | `var(--color-status-warning)` | Temperatura morna |
| `--menux-temp-cold` | `#2563EB` (blue-600) | Temperatura fria |
| `--menux-sla-ok` | `var(--color-status-success)` | Dentro do SLA |
| `--menux-sla-near` | `var(--color-status-warning)` | Próximo do limite |
| `--menux-sla-breach` | `var(--color-status-danger)` | SLA estourado |
| `--menux-commission-projected` | `var(--color-status-info)` | Comissão projetada |
| `--menux-commission-confirmed` | `var(--color-status-warning)` | Comissão confirmada |
| `--menux-commission-paid` | `var(--color-status-success)` | Comissão paga |

**Surface & Background Aliases**

| Token Name | Reference | Usage |
| :--- | :--- | :--- |
| `--menux-bg-app` | `var(--color-white)` | Fundo global (já definido acima) |
| `--menux-bg-sidebar` | `var(--color-white)` | Fundo da sidebar |
| `--menux-bg-header` | `var(--color-white)` | Fundo do header global |
| `--menux-bg-card` | `var(--color-white)` | Fundo de cards |
| `--menux-bg-muted` | `var(--color-zinc-50)` | Fundo de áreas secundárias |
| `--menux-bg-overlay` | `rgba(0, 0, 0, 0.5)` | Overlay de drawers e modais |
| `--menux-bg-kanban` | `var(--color-zinc-50)` | Fundo das colunas do kanban |

### Typography Tokens

**Font Families**

| Priority | Family Name | Source | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | `Bricolage Grotesque` | Google Fonts | Headings, Buttons, Display |
| **Secondary** | `Geist` | Google Fonts | Body, Inputs, UI Labels, Dense Text |

**Typography Scale**

| Token / Variant | Font Family | Size | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display` | `Bricolage Grotesque` | `36px` (2.25rem) | `40px` (2.5rem) | `700` (Bold) | Hero, números grandes no Dashboard |
| `h1` | `Bricolage Grotesque` | `30px` (1.875rem) | `36px` (2.25rem) | `700` (Bold) | Page Titles ("Dashboard", "Pipeline de Vendas") |
| `h2` | `Bricolage Grotesque` | `24px` (1.5rem) | `32px` (2rem) | `600` (Semibold) | Section Heads ("Alertas Críticos", "Pipeline") |
| `h3` | `Bricolage Grotesque` | `20px` (1.25rem) | `28px` (1.75rem) | `600` (Semibold) | Subsections, Card titles no Drawer |
| `h4` | `Bricolage Grotesque` | `16px` (1rem) | `24px` (1.5rem) | `600` (Semibold) | Kanban column headers, Widget titles |
| `button-lg` | `Bricolage Grotesque` | `16px` (1rem) | `24px` (1.5rem) | `600` (Semibold) | Botões grandes (primary CTAs) |
| `button-md` | `Bricolage Grotesque` | `14px` (0.875rem) | `20px` (1.25rem) | `500` (Medium) | Botões padrão |
| `button-sm` | `Bricolage Grotesque` | `13px` (0.8125rem) | `18px` (1.125rem) | `500` (Medium) | Botões pequenos, ações inline |
| `body-lg` | `Geist` | `16px` (1rem) | `24px` (1.5rem) | `400` (Regular) | Lead Paragraph, descrições longas |
| `body-md` | `Geist` | `14px` (0.875rem) | `20px` (1.25rem) | `400` (Regular) | Default UI Text, campos, labels |
| `body-sm` | `Geist` | `13px` (0.8125rem) | `18px` (1.125rem) | `400` (Regular) | Dense UI Text, tabelas, listas |
| `caption` | `Geist` | `12px` (0.75rem) | `16px` (1rem) | `400` (Regular) | Metadata, timestamps, helpers |
| `overline` | `Geist` | `11px` (0.6875rem) | `16px` (1rem) | `500` (Medium) | Labels em caps, categorias |

**Font Weight Reference**

| Weight Name | Value | Usage |
| :--- | :--- | :--- |
| Regular | `400` | Corpo de texto (Geist) |
| Medium | `500` | Labels, botões secundários, overlines |
| Semibold | `600` | Headings, botões primários |
| Bold | `700` | Display, h1, ênfases fortes |

### Radius Tokens

| Component Context | Value | Description |
| :--- | :--- | :--- |
| **Buttons** | `9999px` | Full Pill / Redondos |
| **Inputs** | `15px` | Arredondamento expressivo |
| **Cards / Containers** | `15px` | Padrão para superfícies |
| **Others (Badges, etc)** | `10px` | Componentes menores |

### Border Tokens

| Token | Value |
| :--- | :--- |
| Default Width | `1px` |
| Focus Width | `2px` (Destaque visual maior) |

### Spacing Tokens

Escala de espaçamento oficial. Toda margem, padding e gap deve usar exclusivamente estes valores.

| Token | Value | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| `--space-0` | `0px` | `p-0`, `m-0`, `gap-0` | Reset, elementos colados |
| `--space-1` | `4px` | `p-1`, `m-1`, `gap-1` | Espaço mínimo (entre ícone e texto) |
| `--space-2` | `8px` | `p-2`, `m-2`, `gap-2` | Padding interno de badges, pills |
| `--space-3` | `12px` | `p-3`, `m-3`, `gap-3` | Gap entre elementos em listas densas |
| `--space-4` | `16px` | `p-4`, `m-4`, `gap-4` | Padding interno de cards, gap padrão |
| `--space-5` | `20px` | `p-5`, `m-5`, `gap-5` | Padding de inputs, campos |
| `--space-6` | `24px` | `p-6`, `m-6`, `gap-6` | Padding de seções, área de conteúdo |
| `--space-8` | `32px` | `p-8`, `m-8`, `gap-8` | Separação entre seções do Dashboard |
| `--space-10` | `40px` | `p-10`, `m-10`, `gap-10` | Padding interno de modais |
| `--space-12` | `48px` | `p-12`, `m-12`, `gap-12` | Margens de página em desktop |
| `--space-16` | `64px` | `p-16`, `m-16`, `gap-16` | Altura do header global |

**Regras de Aplicação**

| Contexto | Spacing |
| :--- | :--- |
| Padding interno de página (desktop) | `24px` (space-6) |
| Padding interno de página (mobile) | `16px` (space-4) |
| Gap entre cards no kanban | `12px` (space-3) |
| Gap entre seções do Dashboard | `32px` (space-8) |
| Padding interno de card | `16px` (space-4) |
| Padding interno de modal | `32px–40px` (space-8 a space-10) |
| Padding interno de drawer | `24px` (space-6) |
| Gap entre campos de formulário | `16px` (space-4) |
| Gap entre label e input | `8px` (space-2) |
| Gap entre ícone e texto | `8px` (space-2) |

### Sizing Tokens

Dimensões fixas para componentes com altura padronizada.

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--size-header` | `64px` | Altura do Header Global |
| `--size-sidebar-expanded` | `240px` | Largura da sidebar expandida |
| `--size-sidebar-collapsed` | `64px` | Largura da sidebar colapsada |
| `--size-drawer` | `720px` | Largura do drawer de card (desktop) |
| `--size-modal-sm` | `440px` | Modal pequeno (Login, Convidar) |
| `--size-modal-md` | `480px` | Modal médio (Nova Oportunidade, Ganho) |
| `--size-filter-panel` | `320px` | Largura do painel de filtros |
| `--size-kanban-column` | `280px` | Largura mínima da coluna kanban |
| `--size-input-sm` | `36px` | Altura de inputs pequenos |
| `--size-input-md` | `40px` | Altura de inputs padrão |
| `--size-input-lg` | `48px` | Altura de inputs grandes |
| `--size-avatar-sm` | `32px` | Avatar em tabelas, cards |
| `--size-avatar-md` | `40px` | Avatar no header, listas |
| `--size-avatar-lg` | `96px` | Avatar no perfil do usuário |
| `--size-notification-dropdown` | `360px` | Largura do dropdown de notificações |

### Elevation Tokens

| Token | Class | Usage |
| :--- | :--- | :--- |
| None | `shadow-none` | Elementos planos (kanban columns, sidebar) |
| Base | `shadow-sm` | Inputs, Selects em repouso |
| Card | `shadow-md` | Cards flutuantes, dropdowns |
| Drawer | `shadow-lg` | Drawers (Sheet), painéis laterais |
| Modal | `shadow-xl` | Modais (Dialog), popovers |
| Overlay | `shadow-2xl` | Elementos de máxima elevação (tooltip no drag) |

**Regra:** Elevação implica hierarquia. Elemento mais elevado tem prioridade visual. Nunca empilhar dois elementos com a mesma elevação.

### Motion Tokens

Padrões de animação usados com Framer Motion e transições CSS.

**Duration**

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--duration-instant` | `100ms` | Hover states, toggles |
| `--duration-fast` | `150ms` | Tooltips, badges, estado de botão |
| `--duration-normal` | `200ms` | Dropdowns, popovers, colapso |
| `--duration-moderate` | `300ms` | Drawers (Sheet), modais, filtros |
| `--duration-slow` | `500ms` | Transições de página, celebração (confetti) |

**Easing**

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Transição padrão (ease-in-out) |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elementos saindo de tela |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elementos entrando em tela |
| `--ease-spring` | `type: "spring", stiffness: 300, damping: 24` | Drag-and-drop no kanban (Framer Motion) |

**Framer Motion Presets**

| Preset Name | Config | Usage |
| :--- | :--- | :--- |
| `fadeIn` | `initial: { opacity: 0 }, animate: { opacity: 1 }, duration: 200ms` | Conteúdo aparecendo (tabs, listas) |
| `slideInRight` | `initial: { x: "100%" }, animate: { x: 0 }, duration: 300ms, ease: ease-out` | Drawers (Sheet side=right) |
| `slideInBottom` | `initial: { y: 16, opacity: 0 }, animate: { y: 0, opacity: 1 }, duration: 200ms` | Dropdowns, popovers |
| `scaleIn` | `initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, duration: 200ms` | Modais (Dialog) |
| `collapseToggle` | `animate: { height: "auto" }, duration: 200ms` | Grupos colapsáveis (Atividades, Collapsible) |
| `reorderItem` | `layout: true, type: "spring", stiffness: 300, damping: 24` | Cards no kanban durante drag |
| `exitFade` | `exit: { opacity: 0 }, duration: 150ms` | Elementos sendo removidos (AnimatePresence) |

**Regras de Motion**

1. Toda animação deve ter propósito funcional (feedback, hierarquia, orientação espacial). Animação decorativa é proibida.
2. `AnimatePresence` obrigatório para elementos que entram/saem do DOM (modais, drawers, toasts, itens de lista).
3. Drag-and-drop no kanban usa `Reorder.Group` e `Reorder.Item` do Framer Motion com preset `reorderItem`.
4. Respeitar `prefers-reduced-motion`: se ativo, durations devem cair para `0ms`.

---

## Core Components

Componentes atômicos do sistema. Cada componente especifica variantes, sizing, estados e mapeamento para shadcn/ui.

### Button

Elemento de interação primário. Mapeado para `Button` do shadcn/ui.

**Variantes**

| Variant | Background | Text Color | Border | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `primary` | `--color-black` | `--color-white` | none | CTAs principais ("Entrar", "Criar oportunidade") |
| `secondary` | `--color-zinc-100` | `--color-black` | none | Ações secundárias ("Cancelar", "Exportar") |
| `brand` | `--color-brand-primary` | `--color-white` | none | Destaque ("Marcar como Ganho") |
| `outline` | `transparent` | `--color-black` | `1px zinc-200` | Ações terciárias ("Filtros") |
| `ghost` | `transparent` | `--color-zinc-600` | none | Ações sutis (sidebar items, ícones) |
| `destructive` | `--color-status-danger` | `--color-white` | none | Ações destrutivas ("Marcar como Perdido", "Desativar") |

**Sizing**

| Size | Height | Padding X | Font | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `sm` | `36px` | `16px` | `button-sm` (13px) | Ações inline, tabelas |
| `md` | `40px` | `20px` | `button-md` (14px) | Padrão |
| `lg` | `48px` | `24px` | `button-lg` (16px) | CTAs de página (login, formulários) |
| `icon` | `40px` (square) | `0` (centered) | — | Botões de ícone (fechar, menu) |

**Specs fixas**
*   **Radius**: `9999px` (rounded-full). Sem exceções.
*   **Typography**: Bricolage Grotesque em todas as variantes.
*   **Min-width**: Nenhum. Botão se adapta ao conteúdo + padding.
*   **Ícone + Texto**: Gap `8px` (space-2) entre ícone e label.
*   **Ícone**: Lucide React, `16px` (sm), `18px` (md), `20px` (lg).

**Estados**

| State | Treatment |
| :--- | :--- |
| Default | Conforme variante |
| Hover | Opacidade `90%` ou shift de luminosidade (ex: black → zinc-800) |
| Focus | Ring `2px` brand ou black, offset `2px` |
| Active | `scale(0.98)` com `--duration-instant` |
| Disabled | Opacidade `50%`, cursor `not-allowed` |
| Loading | Ícone `Loader2` (Lucide) com `animate-spin` substitui o label. Botão desabilitado. |

### Input

Campo de entrada de dados. Mapeado para `Input` do shadcn/ui. Integrado com React Hook Form via `FormField`.

**Specs fixas**
*   **Radius**: `15px`.
*   **Typography**: Geist, `body-md` (14px).
*   **Border**: `1px` `--menux-border-base` (zinc-200).
*   **Background**: `--color-white`.
*   **Placeholder**: `--color-zinc-400`.

**Sizing**

| Size | Height | Padding X | Usage |
| :--- | :--- | :--- | :--- |
| `sm` | `36px` | `12px` | Inputs dentro de tabelas, filtros |
| `md` | `40px` | `16px` | Padrão (formulários, drawers) |
| `lg` | `48px` | `16px` | Telas públicas (login, cadastro) |

**Estados**

| State | Treatment |
| :--- | :--- |
| Default | Border `zinc-200`, shadow `shadow-sm` |
| Hover | Border `zinc-300` |
| Focus | Border `--menux-border-focus` (brand), ring `2px`, shadow removido |
| Error | Border `--color-status-danger`, ring `2px` danger. Mensagem abaixo em `caption` danger. |
| Disabled | Background `zinc-50`, texto `zinc-400`, cursor `not-allowed` |
| Readonly | Background `zinc-50`, sem border change no focus |

**Variações**
*   **Password**: botão `ghost` com ícone `Eye`/`EyeOff` (Lucide) alinhado à direita, dentro do campo.
*   **Search**: ícone `Search` (Lucide) à esquerda, padding-left ajustado.
*   **Phone**: máscara automática de telefone.
*   **Currency**: prefixo "R$" fixo à esquerda.

### Select

Menu de seleção. Mapeado para `Select` do shadcn/ui (Radix UI Select).

**Specs fixas**
*   **Radius**: `15px` (trigger e content).
*   **Typography**: Geist, `body-md` (14px).
*   **Height**: Mesma escala do Input (`sm`/`md`/`lg`).
*   **Border**: `1px` zinc-200 no trigger.
*   **Chevron**: Ícone `ChevronDown` (Lucide), `16px`, zinc-400.
*   **Dropdown content**: Radius `15px`, shadow `shadow-md`, border zinc-200, bg white.
*   **Item hover**: Background `zinc-50`.
*   **Item selected**: Background `zinc-100`, texto `--color-black`, peso `500`.

### Checkbox

Marcação booleana. Mapeado para `Checkbox` do shadcn/ui (Radix UI Checkbox).

**Specs fixas**
*   **Size**: `18px` x `18px`.
*   **Radius**: `4px`.
*   **Border**: `1px` zinc-300 (unchecked).
*   **Checked**: Background `--color-black`, ícone check `--color-white`.
*   **Focus**: Ring `2px` brand.

### Card

Container de agrupamento. Mapeado para `Card` do shadcn/ui.

**Specs fixas**
*   **Radius**: `15px`.
*   **Border**: `1px` `--menux-border-base` (zinc-200).
*   **Background**: `--color-white`.
*   **Padding**: `16px` (space-4) padrão.

**Variantes**

| Variant | Treatment | Usage |
| :--- | :--- | :--- |
| `default` | Border zinc-200, bg white | Cards de conteúdo padrão |
| `metric` | Border zinc-200, bg white, padding `20px` | MetricCards no Dashboard |
| `alert-danger` | Border `danger`, bg `danger-light` | AlertCards críticos |
| `alert-warning` | Border `warning`, bg `warning-light` | AlertCards de atenção |
| `alert-success` | Border `success`, bg `success-light` | AlertCards positivos |
| `ghost` | Sem border, sem shadow, bg `transparent` | Agrupamento invisível |

### Badge

Etiqueta de status ou categoria. Mapeado para `Badge` do shadcn/ui.

**Specs fixas**
*   **Radius**: `10px`.
*   **Typography**: Geist, `caption` (12px), weight `500`.
*   **Padding**: `4px 10px` (vertical, horizontal).
*   **Height**: `24px`.

**Variantes**

| Variant | Background | Text | Usage |
| :--- | :--- | :--- | :--- |
| `default` | `zinc-100` | `zinc-700` | Tags neutras, contadores |
| `brand` | `#7A55FD/10%` | `--color-brand-primary` | Destaque brand |
| `success` | `success-light` | `--color-status-success` | Status positivo (Ativo, Pago) |
| `warning` | `warning-light` | `--color-status-warning` | Status atenção (Férias, Projetado) |
| `danger` | `danger-light` | `--color-status-danger` | Status negativo (Inativo, Atrasado) |
| `info` | `info-light` | `--color-status-info` | Status informativo |
| `outline` | `transparent` | `zinc-600` | Tags do card, pills removíveis |

### Switch

Toggle liga/desliga. Mapeado para `Switch` do shadcn/ui (Radix UI Switch).

**Specs fixas**
*   **Track size**: `44px` x `24px`.
*   **Thumb size**: `20px` x `20px`.
*   **Radius**: `9999px` (pill shape).
*   **Off**: Track `zinc-200`, thumb `white`.
*   **On**: Track `--color-black` (ou `--color-brand-primary`), thumb `white`.
*   **Transition**: `--duration-instant` (100ms).
*   **Focus**: Ring `2px` brand.

### Dialog / Modal

Janela sobreposta centrada. Mapeado para `Dialog` do shadcn/ui (Radix UI Dialog).

**Specs fixas**
*   **Container radius**: `20px`.
*   **Background**: `--color-white`.
*   **Border**: `1px` zinc-200.
*   **Shadow**: `shadow-xl`.
*   **Padding**: `32px` (space-8).
*   **Overlay**: `--menux-bg-overlay` (rgba(0,0,0,0.5)) com `backdrop-blur-sm`.
*   **Entry animation**: preset `scaleIn` (Framer Motion).
*   **Exit animation**: preset `exitFade` (Framer Motion).
*   **Close button**: Ícone `X` (Lucide), posicionado top-right, botão `ghost`.
*   **Max height**: `85vh` com scroll interno.

**Sizing**

| Size | Width | Usage |
| :--- | :--- | :--- |
| `sm` | `440px` | Login, Convidar Usuário, Marcar como Perdido |
| `md` | `480px` | Nova Oportunidade, Nova Atividade, Marcar como Ganho |

### AlertDialog

Confirmação destrutiva. Mapeado para `AlertDialog` do shadcn/ui (Radix UI AlertDialog).

**Specs fixas**
*   Herda todas as specs de `Dialog`.
*   **Diferença**: Não fecha ao clicar no overlay (Radix previne por padrão).
*   **Uso**: Ações irreversíveis (desativar usuário, confirmar perda, cancelar cliente).

### Sheet (Drawer)

Painel lateral deslizante. Mapeado para `Sheet` do shadcn/ui (Radix UI Dialog).

**Specs fixas**
*   **Side**: `right` (padrão no Flow).
*   **Width**: `720px` (desktop), `80%` (tablet), `100%` (mobile).
*   **Height**: `100vh`.
*   **Background**: `--color-white`.
*   **Border left**: `1px` zinc-200.
*   **Shadow**: `shadow-lg`.
*   **Overlay**: `--menux-bg-overlay` com `backdrop-blur-sm`.
*   **Entry animation**: preset `slideInRight` (Framer Motion, 300ms).
*   **Exit animation**: reverse slideInRight (150ms).
*   **Scroll**: Interno vertical, header fixo.
*   **Padding**: `24px` (space-6).
*   **Close button**: Ícone `X` (Lucide), posicionado top-right do header.

**Uso no Flow**: Drawer de Card Lead (D1), Drawer de Card Cliente (D2), Painel de Filtros (D10), Sidebar mobile.

### Tabs

Navegação por abas. Mapeado para `Tabs` do shadcn/ui (Radix UI Tabs).

**Specs fixas**
*   **Tab trigger**: Typography `body-md` (14px), Geist, weight `500`.
*   **Inactive**: Texto `zinc-500`, sem border.
*   **Active**: Texto `--color-black`, border-bottom `2px` `--color-black`.
*   **Hover**: Texto `zinc-700`.
*   **Height do trigger**: `40px`.
*   **Gap entre triggers**: `0` (contínuos).
*   **Border bottom da lista**: `1px` zinc-200 (linha base).
*   **Content padding-top**: `16px` (space-4).

**Uso no Flow**: Abas do Drawer (Empresa, Contatos, Valores, Tags / Timeline, Comentários, Anexos, Histórico), View toggle em Atividades.

### Table

Tabela de dados. Mapeado para `Table` do shadcn/ui.

**Specs fixas**
*   **Header**: Background `zinc-50`, texto `caption` (12px) em `overline` style (uppercase, weight 500, zinc-500).
*   **Row height**: `52px`.
*   **Row border**: `1px` zinc-100 (bottom).
*   **Row hover**: Background `zinc-50`.
*   **Cell padding**: `12px` horizontal, `8px` vertical.
*   **Typography**: Geist, `body-sm` (13px).
*   **Sort icon**: `ArrowUpDown` (Lucide), `14px`, zinc-400. Active: zinc-700.
*   **Pagination**: Botões `ghost` com `ChevronLeft`/`ChevronRight`, texto "Página X de Y".

**Uso no Flow**: Tabela de comissões (Financeiro), Tabela de usuários (Gestão).

### Popover

Dropdown flutuante ancorado. Mapeado para `Popover` do shadcn/ui (Radix UI Popover).

**Specs fixas**
*   **Radius**: `15px`.
*   **Border**: `1px` zinc-200.
*   **Shadow**: `shadow-md`.
*   **Background**: `--color-white`.
*   **Padding**: `16px` (space-4).
*   **Entry animation**: preset `slideInBottom` (Framer Motion).
*   **Max height**: `480px` com scroll interno.

**Uso no Flow**: Dropdown de Notificações (D8).

### DropdownMenu

Menu de ações contextual. Mapeado para `DropdownMenu` do shadcn/ui (Radix UI DropdownMenu).

**Specs fixas**
*   **Radius**: `15px`.
*   **Border**: `1px` zinc-200.
*   **Shadow**: `shadow-md`.
*   **Background**: `--color-white`.
*   **Item height**: `36px`.
*   **Item padding**: `8px 12px`.
*   **Item hover**: Background `zinc-50`.
*   **Item typography**: Geist, `body-sm` (13px).
*   **Separator**: `1px` zinc-100, margin vertical `4px`.
*   **Item destructive**: Texto `--color-status-danger`.

**Uso no Flow**: Menu do Usuário (D9), Ações em tabelas, Menu "..." no card.

### Toast

Feedback temporário. Implementado com Sonner (integrado ao shadcn/ui).

**Specs fixas**
*   **Radius**: `15px`.
*   **Border**: `1px` zinc-200.
*   **Shadow**: `shadow-lg`.
*   **Background**: `--color-white`.
*   **Padding**: `16px`.
*   **Position**: Bottom-right (desktop), bottom-center (mobile).
*   **Duration**: `4000ms` (padrão), `8000ms` (erro).
*   **Entry animation**: slide up + fade in.
*   **Typography**: Geist, `body-sm` (13px).
*   **Close**: Botão `X` ghost, ou dismiss automático.

**Variantes**: `default`, `success` (ícone check verde), `error` (ícone X vermelho), `warning` (ícone alerta amarelo).

### Tooltip

Informação contextual no hover. Mapeado para `Tooltip` do shadcn/ui (Radix UI Tooltip).

**Specs fixas**
*   **Radius**: `10px`.
*   **Background**: `--color-black`.
*   **Text**: `--color-white`, Geist, `caption` (12px).
*   **Padding**: `6px 12px`.
*   **Shadow**: `shadow-md`.
*   **Delay**: `300ms` para aparecer.
*   **Entry animation**: fade in `--duration-fast` (150ms).

**Uso no Flow**: Labels na sidebar colapsada, informações extras em cards.

### Skeleton

Placeholder de carregamento. Mapeado para `Skeleton` do shadcn/ui.

**Specs fixas**
*   **Background**: `zinc-100` com animação pulse.
*   **Radius**: Herda o radius do componente que substitui (card: 15px, badge: 10px, etc.).
*   **Animação**: Pulse opacity `0.5 → 1 → 0.5`, duration `2s`, infinite.

### Progress

Barra de progresso. Mapeada para `Progress` do shadcn/ui.

**Specs fixas**
*   **Track**: Height `8px`, radius `9999px`, background `zinc-100`.
*   **Indicator**: Radius `9999px`.
*   **Indicator colors**: Brand (default), success, warning, danger (conforme contexto).

**Uso no Flow**: StrengthIndicator (senha), barras de meta, progresso de kanban column.

---

## Layout & Grid

### Breakpoints

| Token | Value | Tailwind | Dispositivo | Layout |
| :--- | :--- | :--- | :--- | :--- |
| `--bp-mobile` | `< 768px` | default | Smartphone | Sidebar oculta, conteúdo full-width |
| `--bp-tablet` | `768px – 1023px` | `md:` | Tablet | Sidebar colapsada (64px), conteúdo adaptado |
| `--bp-desktop` | `>= 1024px` | `lg:` | Desktop | Sidebar expandida (240px), conteúdo completo |
| `--bp-wide` | `>= 1280px` | `xl:` | Desktop wide | Grid 12 colunas pleno |

### App Shell Layout

O layout autenticado do Flow segue a estrutura fixa:

```
┌──────────────────────────────────────────────┐
│                  Header (64px, fixed)         │
├──────────┬───────────────────────────────────┤
│          │                                    │
│ Sidebar  │         Content Area               │
│ (240px   │      (flex-1, scroll-y)            │
│  fixed)  │                                    │
│          │                                    │
├──────────┴───────────────────────────────────┤
```

**Header Global**
*   Altura: `64px` (fixed top, full-width).
*   Z-index: `50`.
*   Border-bottom: `1px` zinc-200.
*   Background: `--menux-bg-header` (white).
*   Padding horizontal: `24px` (desktop), `16px` (mobile).

**Sidebar**
*   Posição: Fixed left, abaixo do header.
*   Altura: `calc(100vh - 64px)`.
*   Largura expandida: `240px`.
*   Largura colapsada: `64px`.
*   Border-right: `1px` zinc-200.
*   Background: `--menux-bg-sidebar` (white).
*   Z-index: `40`.
*   Transição expand/collapse: `--duration-normal` (200ms) com `--ease-default`.
*   Mobile: Renderiza como `Sheet` (side=left) com overlay.

**Content Area**
*   Margin-left: `240px` (sidebar expandida), `64px` (colapsada), `0` (mobile).
*   Margin-top: `64px` (header).
*   Padding: `24px` (desktop), `16px` (mobile).
*   Scroll: Vertical independente.
*   Transição de margin: `--duration-normal` (200ms) com `--ease-default`.

### Content Grid

Dentro da Content Area, o conteúdo usa CSS Grid de 12 colunas.

*   **Desktop (lg+)**: `grid-cols-12`, `gap-6` (24px).
*   **Tablet (md)**: `grid-cols-8`, `gap-4` (16px).
*   **Mobile**: `grid-cols-4`, `gap-4` (16px).

**Padrões de grid por tela:**

| Tela | Layout Desktop |
| :--- | :--- |
| Dashboard: Métricas | 4 cards, `col-span-3` cada |
| Dashboard: Pipeline + Atividades | Pipeline `col-span-8` + Atividades `col-span-4` |
| Atividades | Lista `col-span-8` + Sidebar resumo `col-span-4` |
| Pipes / Clientes | Kanban horizontal, `overflow-x-auto`, sem grid |
| Financeiro: Resumo | 3 cards, `col-span-4` cada |
| Financeiro: Tabela | `col-span-12` |
| Configurações | Menu `col-span-3` + Conteúdo `col-span-9` |
| Perfil | Coluna única `max-w-[640px]` centralizada |

### Kanban Layout

Layout específico para Pipes e Clientes.

*   **Container**: `display: flex`, `overflow-x: auto`, `gap: 12px` (space-3), `padding: 4px` (para shadow não cortar).
*   **Column width**: `280px` min-width, fixa.
*   **Column height**: `calc(100vh - 64px - 80px)` (viewport - header - toolbar).
*   **Column scroll**: Vertical independente por coluna.
*   **Column header**: Sticky top dentro da coluna, bg white, z-index `10`.
*   **Card gap**: `8px` (space-2) entre cards verticalmente.

---

## Global Interaction States

| State | Visual Treatment |
| :--- | :--- |
| **Hover** | Opacidade reduzida ou shift de cor (Zinc-800 -> 700). |
| **Focus** | Ring visível (Preto ou Brand). |
| **Active** | Scale down sutil (opcional). |

---

## Protocolo de Expansão (AI Guardrails)

Esta seção dita como Agentes de IA ou Desenvolvedores devem criar novos componentes que ainda não existem no sistema. **O objetivo é eliminar a "criatividade visual" e forçar consistência sistêmica.**

### 1. Regra de Isomorfismo (Visual DNA Mapping)
Se for necessário criar um novo componente, ele **OBRIGATORIAMENTE** deve herdar o DNA visual de um componente "Pai" existente:

| Categoria | Componente Pai | Regras Forçadas |
| :--- | :--- | :--- |
| **Container / Surface** | Herda de `Card` | Radius `15px`, Borda `zinc-200`, Bg `white`. |
| **Interativo (Click)** | Herda de `Button` | Radius `9999px`, Fonte `Bricolage Grotesque`. |
| **Input de Dados** | Herda de `Input` | Radius `15px`, Fonte `Geist`, Altura `h-10` ou `h-12`. |
| **Seleção** | Herda de `Select` | Radius `15px`, Fonte `Geist`, Chevron `ChevronDown`. |
| **Overlay / Floating** | Herda de `Dialog` | Radius `20px`, Shadow `xl`, Border `zinc-200`. |
| **Side Panel** | Herda de `Sheet` | Largura `720px`, Shadow `lg`, Border left `zinc-200`, slide animation. |
| **Dropdown / Flyout** | Herda de `Popover` | Radius `15px`, Shadow `md`, Border `zinc-200`. |
| **Menu de Ações** | Herda de `DropdownMenu` | Radius `15px`, Shadow `md`, Items `36px` height. |
| **Status / Tag** | Herda de `Badge` | Radius `10px`, Fonte `Geist`, Height `24px`. |
| **Navegação por abas** | Herda de `Tabs` | Border-bottom `2px` active, Fonte `Geist` `body-md`. |
| **Dados tabulares** | Herda de `Table` | Header `zinc-50`, Row height `52px`, Fonte `Geist` `body-sm`. |
| **Feedback temporário** | Herda de `Toast` | Radius `15px`, Shadow `lg`, Position bottom-right. |
| **Info contextual** | Herda de `Tooltip` | Radius `10px`, Bg `black`, Fonte `caption`. |
| **Carregamento** | Herda de `Skeleton` | Bg `zinc-100`, Pulse animation, Radius herdado do componente substituído. |
| **Progresso / Indicador** | Herda de `Progress` | Track `8px`, Radius `9999px`, Bg `zinc-100`. |

### 2. Veto de Estilos (Proibições Absolutas)
A IA está **estritamente proibida** de gerar estilos que contenham:
*   ❌ **Gradientes**: Apenas cores sólidas (Flat Design).
*   ❌ **Sombras Coloridas**: Sombras devem ser baseadas em preto/alpha (padrão Tailwind).
*   ❌ **Bordas Grossas**: Nenhuma borda > 1px (exceto Focus Ring de 2px ou Active States).
*   ❌ **Fontes Terciárias**: Nunca importar fontes além de *Geist* e *Bricolage Grotesque*.
*   ❌ **Cores Arbitrárias**: Nunca usar hex codes fora do sistema. Usar APENAS: `--color-brand-primary`, `--color-black`, `--color-white`, escala `zinc-*`, e as **Status Colors** definidas neste documento (`success`, `warning`, `danger`, `info`).
*   ❌ **Radius Arbitrários**: Nunca usar radius fora dos 4 valores definidos: `9999px` (pill), `20px` (overlay), `15px` (cards/inputs), `10px` (badges). Exceção: `4px` para checkbox.
*   ❌ **Heights Arbitrários em Inputs/Buttons**: Usar apenas os sizes definidos (`sm: 36px`, `md: 40px`, `lg: 48px`).
*   ❌ **Animações Decorativas**: Toda animação deve ter propósito funcional. Sem bounces, wobbles ou efeitos que não comuniquem estado.
*   ❌ **Z-index Arbitrários**: Usar apenas a escala definida: `10` (kanban header), `40` (sidebar), `50` (header), `auto` (Radix gerencia overlays).

### 3. Hierarquia de Decisão
Ao implementar uma nova feature:
1.  Tente compor usando componentes existentes do Core (`Card`, `Button`, `Input`, `Badge`, `Tabs`, `Table`, etc.).
2.  Se falhar, crie um novo componente seguindo a tabela de Isomorfismo acima.
3.  Nunca crie "Variants" que mudam a geometria (ex: Um botão quadrado é proibido, pois botões são Pill).
4.  Novos componentes devem usar os Motion Presets definidos. Não inventar animações.
5.  Todo componente que entra/sai do DOM deve usar `AnimatePresence` do Framer Motion.

---

## Accessibility Standards

### Contraste (WCAG 2.1 AA)

| Combinação | Ratio Mínimo | Status |
| :--- | :--- | :--- |
| `--color-black` em `--color-white` | 21:1 | Passa |
| `--color-zinc-600` em `--color-white` | 5.74:1 | Passa (texto corpo) |
| `--color-zinc-500` em `--color-white` | 4.64:1 | Passa (texto grande) |
| `--color-zinc-400` em `--color-white` | 3.29:1 | Falha para texto. Usar apenas em placeholders e ícones decorativos. |
| `--color-brand-primary` (#7A55FD) em `--color-white` | 4.56:1 | Passa apenas para texto grande (18px+ bold). Não usar em texto regular pequeno. |
| `--color-status-success` (#16A34A) em `success-light` (#F0FDF4) | 4.88:1 | Passa |
| `--color-status-warning` (#D97706) em `warning-light` (#FFFBEB) | 4.75:1 | Passa |
| `--color-status-danger` (#DC2626) em `danger-light` (#FEF2F2) | 5.53:1 | Passa |

**Regras:**
*   Texto primário: sempre `--color-black` ou `--color-zinc-600` sobre fundo branco.
*   Brand (#7A55FD): usar em borders, badges, ícones e backgrounds. Para texto, apenas em tamanhos `h3`+ (20px+).
*   Status colors: usar o par `cor/cor-light` para badge text sobre badge background. Nunca status color sobre branco puro em texto `caption`.

### Toque e Interação

| Regra | Valor | Referência |
| :--- | :--- | :--- |
| Área mínima de toque (mobile) | `44px` x `44px` | WCAG 2.5.8 |
| Área mínima de clique (desktop) | `32px` x `32px` | — |
| Focus ring visível | `2px` offset `2px`, cor brand ou black | WCAG 2.4.7 |
| Skip to content | Link oculto, visível no focus | WCAG 2.4.1 |

### Navegação por Teclado

| Ação | Tecla |
| :--- | :--- |
| Navegar entre elementos focáveis | `Tab` / `Shift+Tab` |
| Ativar botão/link | `Enter` ou `Space` |
| Fechar modal/drawer/dropdown | `Esc` |
| Navegar dentro de Select/DropdownMenu | `Arrow Up` / `Arrow Down` |
| Busca global | `Ctrl+K` / `Cmd+K` |
| Selecionar item em lista | `Enter` |

**Nota**: Radix UI (base do shadcn/ui) implementa nativamente a maioria destes padrões. Não reimplementar.

### Reduced Motion

*   Respeitar `prefers-reduced-motion: reduce`.
*   Quando ativo: todas as `duration` caem para `0ms`.
*   Implementar via media query no CSS ou checagem no Framer Motion (`useReducedMotion()`).

### Aria & Semântica

*   Todos os formulários usam `Label` do shadcn/ui com `htmlFor` vinculado ao input.
*   Modais e drawers usam `aria-labelledby` (título) e `aria-describedby` (descrição) via Radix UI.
*   Badges de status incluem `aria-label` descritivo (ex: `aria-label="Health Score: Crítico"`).
*   Ícones decorativos: `aria-hidden="true"`. Ícones funcionais: `aria-label` descritivo.
*   Kanban columns: `role="region"` com `aria-label` da etapa.

---

## Versioning

*   **Base System**: Orbit v1.1.0
*   **Theme**: Menux v1.0
*   **Design System Version**: 2.0.0 (expandido para Flow CRM)
*   **Changelog**:
    *   `v1.0.0` — Especificação base derivada do Orbit (tokens, core components, AI guardrails).
    *   `v2.0.0` — Expansão para Flow CRM: Status Colors, Typography Scale numérica, Spacing Tokens, Sizing Tokens, Motion Tokens, componentes expandidos (Sheet, Tabs, Table, Toast, Tooltip, Popover, DropdownMenu, AlertDialog, Skeleton, Progress, Checkbox), Layout do App Shell, Kanban Layout, Accessibility Standards completos, Protocolo de Expansão atualizado com 15 categorias de isomorfismo.
