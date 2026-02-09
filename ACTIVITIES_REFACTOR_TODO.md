# 🔨 Refatoração Activities - Próximos Passos

**Data:** 2026-02-06
**Status:** Em Progresso (50% completo)
**Contexto:** Continuação da refatoração Bento iniciada no Dashboard

---

## ✅ O QUE JÁ FOI FEITO

### 1. Dashboard Bento (100% Completo)
- ✅ Todos os componentes Bento criados e funcionais
- ✅ Grid responsivo (1280/1440/1920)
- ✅ Feedback inline completo
- ✅ Shadows e hierarquia visual
- ✅ **TESTADO E FUNCIONAL** → http://localhost:3000/dashboard

### 2. Activities - Bugs Corrigidos
- ✅ **Bug crítico:** Tipo `visit` adicionado ao count de tipos (linha 501)
- ✅ **Bug crítico:** Tipo `visit` adicionado aos filtros default (linha 467)
- ✅ **Bug crítico:** Tipo `visit` adicionado ao UI de filtros (linha 634)

### 3. Activities - Infraestrutura
- ✅ Container Bento aplicado (linha 553: `<div className="bento-container mx-auto">`)
- ✅ Import `InlineFeedback` adicionado (linha 47)
- ✅ Componente `ActivityFilters` criado em `/src/app/(auth)/activities/components/activity-filters.tsx`

---

## 🎯 O QUE FALTA FAZER (Priorizado)

### **P0 - Crítico (fazer primeiro)**

#### 1. Integrar ActivityFilters (substitui Sheet lateral)
**Arquivo:** `/src/app/(auth)/activities/page.tsx`
**Localização:** Linha ~604-723 (Sheet atual de filtros)

**Ação:**
```tsx
// REMOVER (linhas 604-723):
<Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
  {/* todo o conteúdo do Sheet */}
</Sheet>

// SUBSTITUIR POR:
import { ActivityFilters } from "./components/activity-filters";

// No JSX (após View Toggle):
<ActivityFilters
  filterTypes={filterTypes}
  onToggleType={toggleFilterType}
  filterResponsible={filterResponsible}
  onChangeResponsible={setFilterResponsible}
  filterDateStart={filterDateStart}
  onChangeDateStart={setFilterDateStart}
  filterDateEnd={filterDateEnd}
  onChangeDateEnd={setFilterDateEnd}
  responsibles={responsibles}
  onClearAll={() => {
    setFilterTypes(new Set(["call", "email", "meeting", "visit", "task", "follow-up", "whatsapp"]));
    setFilterResponsible("all");
    setFilterDateStart("");
    setFilterDateEnd("");
  }}
  typeLabels={typeLabels}
  typeColors={typeColors}
  TypeIcon={TypeIcon}
/>
```

**Benefício:** Filtros inline com chips ativos visíveis (UX muito melhor)

---

#### 2. Adicionar Feedback Inline ao Completar Atividade
**Arquivo:** `/src/app/(auth)/activities/page.tsx`
**Localização:** ActivityRow component (linha ~1044)

**Problema Atual:** Usa Popover de sentimento sem feedback de sucesso/erro

**Solução:**

**a) Adicionar estados à Activity (já tem interface, só estender):**
```typescript
// Linha ~454: estender o useState
const [activities, setActivities] = useState<Activity[]>(
  mockActivities.map(a => ({
    ...a,
    loading: false,
    success: false,
    error: undefined
  }))
);
```

**b) Atualizar handleComplete (linha 523):**
```typescript
async function handleComplete(id: string) {
  // Set loading
  setActivities(prev => prev.map(a =>
    a.id === id ? { ...a, loading: true, success: false, error: undefined } : a
  ));

  // Simular delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simular sucesso (90% de chance)
  const success = Math.random() > 0.1;

  setActivities(prev => prev.map(a =>
    a.id === id ? {
      ...a,
      status: success ? "completed" as ActivityStatus : a.status,
      completedAt: success ? today().toISOString().split("T")[0] : a.completedAt,
      loading: false,
      success: success,
      error: success ? undefined : "Erro ao completar atividade. Tente novamente."
    } : a
  ));

  // Limpar feedback após 3s
  setTimeout(() => {
    setActivities(prev => prev.map(a =>
      a.id === id ? { ...a, success: false, error: undefined } : a
    ));
  }, 3000);
}
```

**c) Adicionar InlineFeedback no ActivityRow (após o card da atividade):**
```tsx
{/* Activity card aqui */}

{/* Inline Feedback - Success */}
{activity.success && (
  <InlineFeedback
    type="success"
    message="Atividade concluída com sucesso!"
    compact
  />
)}

{/* Inline Feedback - Error */}
{activity.error && (
  <InlineFeedback
    type="error"
    message={activity.error}
    actionLabel="Tentar novamente"
    onAction={() => handleComplete(activity.id)}
    compact
  />
)}
```

**Benefício:** Feedback claro, sem toast, inline no contexto

---

#### 3. Priorização Visual - Atrasadas Destacadas
**Arquivo:** `/src/app/(auth)/activities/page.tsx`
**Localização:** ActivityRow component (linha ~1044)

**Ação:** Adicionar border-left 4px vermelho em atividades atrasadas

```tsx
// No card da atividade:
<div
  className={cn(
    "rounded-[15px] border p-3 transition-colors",
    activity.status === "overdue" && !activity.completed
      ? "border-l-4 border-l-status-danger bg-status-danger-light"
      : "border-zinc-200 bg-white hover:bg-zinc-50"
  )}
>
```

**Benefício:** Urgência visual clara (igual alertas do Dashboard)

---

### **P1 - Importante (fazer depois)**

#### 4. Click em Card Abre Modal de Edição
**Arquivo:** `/src/app/(auth)/activities/page.tsx`
**Localização:** ActivityRow component

**Ação:**
```tsx
// Adicionar onClick no card da atividade:
<div
  onClick={() => openModal("new-activity", {
    activityId: activity.id,
    mode: "edit"
  })}
  className="cursor-pointer ..."
>
```

**Benefício:** Permite editar atividade (feature estava faltando)

---

#### 5. Remover Popover de Sentimento (confuso)
**Localização:** Linha ~1080-1170 (Popover de conclusão)

**Ação:** Remover completamente ou tornar opcional (quick complete: só checkbox)

**Benefício:** UX mais rápida, menos friction

---

### **P2 - Melhoria (opcional)**

#### 6. Quebrar Arquivo em Componentes
**Problema:** Arquivo com 1653 linhas é impossível manter

**Sugestão de estrutura:**
```
/activities/
  components/
    activity-filters.tsx (✅ já criado)
    activity-row.tsx
    list-view.tsx
    week-view.tsx
    month-view.tsx
    completion-feedback.tsx
  hooks/
    use-activity-filters.ts
    use-activity-actions.ts
  page.tsx (só layout principal)
```

**Benefício:** Manutenibilidade, testabilidade

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### Ordem Recomendada:
1. [ ] Integrar ActivityFilters (P0.1)
2. [ ] Adicionar feedback inline ao completar (P0.2)
3. [ ] Border-left atrasadas (P0.3)
4. [ ] Click para editar (P1.4)
5. [ ] Remover/simplificar popover sentimento (P1.5)
6. [ ] (Opcional) Quebrar em componentes (P2.6)

---

## 🐛 BUGS CONHECIDOS CORRIGIDOS

✅ **Erro TypeScript:** `Property 'visit' is missing in type Record<ActivityType>`
- **Corrigido em:** Linha 501, 467, 634
- **Status:** Resolvido

---

## 🎨 COMPONENTES BENTO DISPONÍVEIS

Todos criados e testados no Dashboard:

```typescript
// Já importados no projeto:
import { BentoCard } from "@/components/ui/bento-card";
import { BentoStatCard } from "@/components/ui/bento-stat-card";
import { BentoListCard } from "@/components/ui/bento-list-card";
import { BentoTableCard } from "@/components/ui/bento-table-card";
import { SkeletonBlock } from "@/components/ui/skeleton-block";
import { InlineFeedback } from "@/components/ui/inline-feedback";
```

**Usar conforme necessário** para melhorar cards e seções.

---

## 📐 DESIGN TOKENS

Arquivo: `/src/app/bento-tokens.css`

**Shadows:**
- `--shadow-bento-sm`: cards normais
- `--shadow-bento-md`: cards destacados
- `--shadow-bento-sm-hover`: hover effect

**Borders:**
- `--border-bento-default`: #e4e4e7
- `--border-bento-subtle`: #f4f4f5
- `--border-bento-error`: #DC2626

**Transitions:**
- `--transition-bento-fast`: 150ms
- `--transition-bento`: 200ms
- `--transition-bento-slow`: 300ms

**Container:**
- `.bento-container`: max-width responsivo
- `.bento-grid`: grid com gaps responsivos

---

## 🚀 COMO COMEÇAR A NOVA CONVERSA

**Cole isso no início:**

```
Vou continuar a refatoração Bento da página Activities.

Contexto:
- Dashboard Bento está 100% funcional
- Activities: bugs corrigidos, container aplicado, ActivityFilters criado
- Falta: integrar filtros inline, feedback ao completar, priorização visual

Leia o arquivo: /Users/fernandocalado/Desktop/Flow/Flow/ACTIVITIES_REFACTOR_TODO.md

Comece pela tarefa P0.1: Integrar ActivityFilters
```

---

## 📊 PROGRESSO GERAL

```
Dashboard:     ████████████████████ 100% ✅
Activities:    ██████████░░░░░░░░░░  50% 🔨
  - Bugs:      ████████████████████ 100% ✅
  - Container: ████████████████████ 100% ✅
  - Filtros:   ██████████░░░░░░░░░░  50% (criado, falta integrar)
  - Feedback:  ░░░░░░░░░░░░░░░░░░░░   0% (preparado, falta implementar)
  - Visual:    ░░░░░░░░░░░░░░░░░░░░   0%
  - Edição:    ░░░░░░░░░░░░░░░░░░░░   0%
```

---

## 💡 DICAS IMPORTANTES

1. **Não refazer o que já foi feito** - Dashboard está perfeito, não mexer
2. **Usar InlineFeedback** - já importado, só usar no ActivityRow
3. **Testar em 1280/1440/1920** - container Bento já está aplicado
4. **Commits incrementais** - fazer P0.1, testar, depois P0.2, etc.
5. **Arquivo gigante (1653 linhas)** - fazer mudanças cirúrgicas, quebrar depois

---

## 🎯 RESULTADO ESPERADO

Após completar todas as tarefas P0 e P1:

✅ Filtros inline com chips ativos visíveis
✅ Feedback success/error ao completar atividade
✅ Atrasadas destacadas (border-left vermelho)
✅ Click em card abre modal de edição
✅ UX rápida sem popover confuso
✅ Layout Bento consistente com Dashboard

**Estimativa:** 2-3h de trabalho focado

---

**Boa sorte! 🚀**
