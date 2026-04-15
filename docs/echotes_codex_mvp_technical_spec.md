# Echotes — Spec Técnica para Codex (MVP)

## 1. Objetivo

Este documento traduz as decisões fechadas do domínio em uma especificação técnica executável para implementação do MVP com a stack definida:

- Expo
- React Native
- TypeScript
- Expo Router
- Zustand
- Supabase JS
- React Hook Form
- Zod
- Legend List

O objetivo é permitir implementação consistente do produto sem reabrir ambiguidades conceituais.

---

## 2. Verdades centrais do produto

### 2.1 O dia é a unidade principal
Cada dia possui página própria e independente. O produto é organizado por dia, não por módulos isolados.

### 2.2 A timeline é o eixo principal
A timeline é a visualização principal do dia e mistura:
- notas
- tarefas sem horário
- registros de criação de tarefas com horário
- itens reais de tarefas agendadas
- ghost cards de tarefas projetadas

### 2.3 Tudo entra na timeline por `created_at`
A sensação do produto deve ser a de avançar pelo dia. Em termos visuais:
- tudo entra na timeline pela **posição intradiária derivada do horário de `created_at`**
- a data completa de `created_at` não deve ser usada para ordenar a página do dia
- tarefas com `scheduled_at` ganham um segundo ponto temporal real no horário agendado

### 2.4 Tarefas e notas usam mecanismos distintos
- **tarefas** usam projeção temporal e ghost card
- **notas** usam ecos e grafo de continuidade conceitual

Essa separação é estrutural e deve aparecer na modelagem, na renderização e na navegação.

---

## 3. Regras fechadas — tarefas

### 3.1 Campos temporais obrigatórios de tarefa
Toda tarefa possui:
- `created_at`
- `source_day`
- `target_day`
- `scheduled_at` opcional

### 3.2 Sem horário
Se a tarefa não possui `scheduled_at`, ela entra na timeline pela posição temporal do `created_at`.

### 3.3 Com horário
Se a tarefa possui `scheduled_at` e `source_day == target_day`, ela:
- mantém registro de criação em `created_at`
- ganha item real em `scheduled_at`

### 3.4 Projeção temporal
Se `source_day != target_day`:
- existe ghost card em `source_day`
- o ghost card é posicionado conforme a posição intradiária derivada de `created_at`
- o dia de origem mostra apenas o ghost card, e não um marcador de criação separado
- o item real existe em `target_day`
- o ghost card navega de `source_day` para `target_day`

### 3.5 Restrição temporal
Tarefas não podem ser agendadas para o passado.

Regra obrigatória:
- `scheduled_at` deve ser estritamente posterior a `created_at`

### 3.6 Exclusividade
Ghost card é mecanismo exclusivo de tarefas.

---

## 4. Regras fechadas — notas

### 4.1 Natureza
Nota é um registro textual do dia.

### 4.2 Posicionamento
Nota entra na timeline pela posição temporal de `created_at`.

### 4.3 Sem ghost card
Nota não usa ghost card e não usa projeção temporal no modelo das tarefas.

### 4.4 Ecos
Notas se conectam por **ecos**.

Definição:
- eco é uma conexão direta, não hierárquica, entre notas
- uma nota pode ter zero, um ou vários ecos
- uma nota pode ter ecos com notas do passado, do mesmo dia ou do futuro

### 4.5 Continuidade
A ação **continuar desta nota** cria uma **nova nota** já conectada por eco à nota de origem.

Essa nova nota:
- não copia integralmente o conteúdo anterior
- nasce com um preview/resumo automático
- permite edição imediata do briefing
- mantém link para o conteúdo completo da nota conectada

### 4.6 Exibição na timeline
Na timeline, a nota mostra apenas:
- um indicador discreto de ecos
- com a quantidade de ecos diretos

A complexidade relacional não deve aparecer no fluxo principal da timeline; ela pertence ao Reader.

### 4.7 Modelagem temporal simplificada
Notas não precisam reutilizar `source_day` e `target_day` do modelo de tarefas.

Modelagem recomendada para notas:
- `day`
- `created_at`
- tabela separada de ecos entre notas

---

## 5. Arquitetura sugerida

```text
app/
  _layout.tsx
  index.tsx
  day/
    [date].tsx

src/
  components/
    calendar/
      weekly-calendar.tsx
      monthly-calendar.tsx
      day-chip.tsx
    day/
      day-header.tsx
      day-tabs.tsx
      breadcrumb-bar.tsx
    timeline/
      timeline-view.tsx
      timeline-item-wrapper.tsx
      timeline-plus-button.tsx
    cards/
      task-card-real.tsx
      task-card-ghost.tsx
      task-card-timed.tsx
      note-card-real.tsx
      task-creation-marker.tsx
    forms/
      entry-editor.tsx
      note-editor.tsx
      task-editor.tsx
      note-echo-picker.tsx
      tag-picker.tsx
      color-picker.tsx
      date-picker-field.tsx
      time-picker-field.tsx
    reader/
      entry-reader.tsx
      note-reader.tsx
      task-reader.tsx
      note-echo-section.tsx

  features/
    day/
      hooks/
        use-day-entries.ts
        use-day-timeline.ts
    tasks/
      api/
        create-task.ts
        update-task.ts
        delete-task.ts
      utils/
        derive-task-nodes.ts
    notes/
      api/
        create-note.ts
        update-note.ts
        delete-note.ts
        create-note-echo.ts
        delete-note-echo.ts
      utils/
        derive-note-nodes.ts
        build-note-briefing.ts
    timeline/
      utils/
        derive-timeline-nodes.ts

  stores/
    calendar-store.ts
    navigation-store.ts
    ui-store.ts

  schemas/
    task.schema.ts
    note.schema.ts
    echo.schema.ts

  types/
    task.ts
    note.ts
    echo.ts
    timeline.ts
    navigation.ts

  lib/
    supabase.ts
    date.ts
    timeline.ts
```

Regras desta arquitetura sugerida:
- `entry-reader.tsx` e `entry-editor.tsx` são apenas cascas de coordenação da superfície contextual
- a UI concreta de leitura e edição deve ser separada por tipo de item
- não existe `entry-form.tsx` genérico unificando nota e tarefa
- nota e tarefa compartilham a superfície contextual, mas não compartilham o mesmo formulário ou a mesma leitura concreta

---

## 6. Tipos de domínio

## 6.1 Tarefa
```ts
export type TaskStatus = 'open' | 'done' | 'cancelled'

export interface Task {
  id: string
  user_id: string
  title: string
  content: string | null
  tag_id: string | null
  color: string | null
  is_color_overridden: boolean
  source_day: string
  target_day: string
  created_at: string
  scheduled_at: string | null
  status: TaskStatus
  completed_at: string | null
  updated_at: string
}
```

## 6.2 Nota
```ts
export interface Note {
  id: string
  user_id: string
  day: string
  title: string
  content: string | null
  brief: string | null
  tag_id: string | null
  color: string | null
  is_color_overridden: boolean
  created_at: string
  updated_at: string
}
```

## 6.3 Eco
```ts
export interface NoteEcho {
  id: string
  from_note_id: string
  to_note_id: string
  created_at: string
  created_by_user_id: string
  context_note_id: string | null
  context_day: string | null
  kind: 'manual_link' | 'continue_note'
  metadata: Record<string, unknown> | null
}
```

Observação:
- a interface não deve tratar eco como hierarquia
- porém a modelagem pode guardar metadata adicional para navegação, histórico e evolução futura

---

## 7. TimelineNode

```ts
export type TimelineNodeType =
  | 'note'
  | 'task_untimed'
  | 'task_creation_marker'
  | 'task_timed'
  | 'task_ghost'

export interface TimelineNode {
  id: string
  type: TimelineNodeType
  itemId: string
  itemKind: 'task' | 'note'
  sortAt: string
  createdAt: string
  scheduledAt: string | null
  data: Task | Note
}
```

---

## 8. Rotas

### 8.1 Rota inicial
`/`

Deve redirecionar para `/day/[today]`.

### 8.2 Rota do dia
`/day/[date]`

Responsável por:
- carregar contexto do dia
- sincronizar o dia ativo no store
- renderizar header, calendário, tabs e view ativa

---

## 9. Stores com Zustand

## `calendarStore`
Estado:
- `selectedDate`
- `calendarMode` → `week | month`

Regras:
- no modo semanal, a semana deve começar no domingo
- a strip semanal deve sempre refletir a semana que contém o `selectedDate`
- se o `selectedDate` mudar para um dia fora da semana visível, a strip semanal deve atualizar imediatamente para a nova semana correspondente

Ações:
- `setSelectedDate(date)`
- `setCalendarMode(mode)`
- `toggleCalendarMode()`

## 9.1 Regra de atualização da strip semanal
Sempre que `selectedDate` mudar, a UI do calendário semanal deve recalcular a semana visível com base no novo dia selecionado.

## `navigationStore`
Usado apenas para navegação por ghost card de tarefas.

Estado:
- `sourceDate`
- `destinationDate`
- `sourceTaskId`
- `returnScrollOffset`
- `isTemporalNavigationActive`

Ações:
- `setTemporalNavigationContext(payload)`
- `setReturnScrollOffset(offset)`
- `clearTemporalNavigationContext()`

## `uiStore`
Estado:
- `activeDayTab` → `timeline | tasks | notes`
- `readerItemId`
- `readerItemKind`
- `editorMode` → `create | edit | null`
- `editorItemKind`
- `editorItemId`

Ações:
- `setActiveDayTab(tab)`
- `openReader(kind, id)`
- `closeReader()`
- `openEditor({ mode, kind, id? })`
- `closeEditor()`

Regras:
- `Reader` abre apenas item existente, portanto sempre usa `kind + id`
- `Editor` opera em dois modos: `create` e `edit`
- em `create`, `id` não existe
- em `edit`, `id` é obrigatório

---

## 10. Estratégia de dados

## 10.1 Leitura do dia
Para `selectedDate = D`, a tela do dia deve consultar:
- tarefas em que `source_day = D` ou `target_day = D`
- notas em que `day = D`

Além disso, pode consultar ecos das notas do dia para exibir contagem direta e detalhes no Reader.

## 10.2 Separação recomendada
Não forçar uma única tabela genérica para tarefa e nota se isso piorar a clareza do domínio.

Recomendação para o MVP:
- modelagem específica de tarefas
- modelagem específica de notas
- timeline derivada unificando a renderização

---

## 11. Algoritmo de derivação da timeline

## Entrada
- `selectedDate`
- `tasks[]`
- `notes[]`

## Saída
- `TimelineNode[]`

## Regras

### 11.1 Notas
Para cada nota do dia:
- gerar um nó `note`
- `sortAt = created_at`
- lado recomendado: direita

### 11.2 Tarefas sem horário
Para cada tarefa com `target_day = selectedDate` e sem `scheduled_at`:
- gerar nó `task_untimed`
- `sortAt = created_at`
- lado recomendado: esquerda

### 11.3 Registro de criação de tarefa com horário
Para cada tarefa com:
- `source_day = selectedDate`
- `target_day = selectedDate`
- `scheduled_at != null`

Gerar:
- nó `task_creation_marker`
- `sortAt = posição intradiária derivada de created_at`

### 11.4 Item real de tarefa com horário
Para cada tarefa com `target_day = selectedDate` e `scheduled_at != null`:
- gerar nó `task_timed`
- `sortAt = scheduled_at`

### 11.5 Ghost card de tarefa
Para cada tarefa em que:
- `source_day = selectedDate`
- `target_day != selectedDate`

Gerar:
- nó `task_ghost`
- `sortAt = posição intradiária derivada de created_at`

## Regra final de ordenação
A timeline deve ser ordenada por posição temporal **local ao dia exibido**.

Regras:
- nós baseados em criação usam a **posição intradiária derivada de `created_at`**
- nós agendados usam a **posição intradiária derivada de `scheduled_at`**
- se a posição derivada de `created_at` antecede a de `scheduled_at`, o registro de criação deve anteceder visualmente também

---

## 12. Criação e edição

## 12.1 Ação principal pelo `+`
Ao tocar no `+`, o usuário escolhe:
- Criar tarefa
- Criar nota

Regra:
- o `+` abre o `Editor` em modo `create`

## 12.2 Nota
A criação e edição da nota devem permitir:
- criar nota independente
- adicionar ecos
- usar a ação `Continuar desta nota`
- criar ecos por menção no conteúdo usando a sintaxe `@nota`

### 12.2.1 Menção no conteúdo
No MVP, a menção no conteúdo usa a sintaxe `@nota`.

Fluxo:
- o usuário digita `@`
- o sistema abre busca/autocomplete de notas já existentes
- ao selecionar uma nota, o editor substitui a menção por um chip inline clicável
- ao salvar, o sistema cria um eco do tipo `manual_link` entre a nota atual e a nota selecionada

Formato canônico persistido no `content`:
- `@[Label da Nota](note:<note_id>)`

Regras:
- a menção no conteúdo conecta apenas notas já existentes
- a menção no conteúdo não cria nota futura nova
- a criação de nova nota conectada permanece exclusiva da ação `Continuar desta nota`
- o editor sempre normaliza menções para o formato `@[Label da Nota](note:<note_id>)`
- ao salvar, o sistema parseia o `content`, extrai os `note_id` mencionados e faz upsert de um `manual_link` por `note_id` distinto
- ao salvar, o sistema remove apenas `manual_link` com `metadata.origin = "content_mention"` quando o token inline correspondente desaparecer do `content`

## 12.3 Continuação de nota
Ao continuar uma nota:
- criar nova nota no dia escolhido
- gerar briefing automático
- permitir editar o briefing imediatamente
- criar conexão de eco com metadata da conexão

## 12.4 Tarefa
A criação da tarefa deve permitir:
- definir `target_day`
- definir `scheduled_time` opcional
- compor `scheduled_at` a partir de `target_day + scheduled_time`
- validar `scheduled_at > created_at` após a composição

---

## 13. Reader e Editor

Reader e Editor são overlays contextuais sobre a superfície atual do dia.

Regras gerais:
- a superfície subjacente do dia permanece soberana enquanto Reader ou Editor estiverem abertos
- Reader e Editor são únicos por tipo de item e não variam por lente
- clique simples abre Reader em item existente
- double tap abre Editor em modo `edit`
- o botão explícito `Editar` dentro do Reader abre Editor em modo `edit`

## 13.1 Reader
Clique simples abre Reader.

### Tarefa
Mostrar:
- título
- conteúdo
- status
- `source_day`
- `target_day`
- horário, se existir
- ações principais

### Nota
Mostrar:
- título
- conteúdo
- briefing, se existir
- chips inline de menções persistidas no conteúdo
- ecos diretos
- links para notas conectadas
- ação `Adicionar eco`
- ação `Continuar desta nota`

## 13.2 Editor
Double tap abre Editor.

Observação:
- o Reader deve continuar oferecendo botão explícito de editar
- o `Editor` é usado tanto para criação quanto para edição
- em `create`, o Editor consome os defaults apropriados do tipo do item
- em `edit`, o Editor consome item já existente identificado por `kind + id`

---

## 14. Exclusão

## 14.1 Tarefa
Excluir tarefa remove:
- item real
- ghost card
- marcador de criação, quando houver

## 14.2 Nota
Excluir nota remove:
- a própria nota
- os ecos diretamente ligados a ela

Sem interferir nos outros ecos que as demais notas da mesma família possuam entre si.

---

## 15. Herança de cor por tag

Regra:
- ao selecionar uma tag, aplicar automaticamente a cor da tag no item
- se o usuário alterar a cor manualmente, persistir `is_color_overridden = true`
- enquanto houver override manual, trocar a tag não deve sobrescrever automaticamente a cor

---

## 16. Estados visuais mínimos

## 16.1 Nota na timeline
- card real
- badge de ecos com contagem direta

## 16.2 Tarefa na timeline
- card real sem horário
- marcador de criação
- card real com horário
- ghost card

## 16.3 Navegação temporal
- breadcrumb de retorno ao navegar por ghost card de tarefa

---

## 17. Casos obrigatórios de teste

### Tarefa
1. criar tarefa sem horário para o mesmo dia
2. criar tarefa com horário para o mesmo dia
3. criar tarefa para dia futuro sem horário
4. criar tarefa para dia futuro com horário
5. impedir agendamento para o passado
6. navegar por ghost card
7. retornar pelo breadcrumb

### Nota
8. criar nota independente
9. criar eco entre notas existentes
10. continuar desta nota criando nova nota no mesmo dia
11. continuar desta nota criando nova nota em dia futuro
12. abrir Reader e ver ecos diretos
13. excluir nota sem romper ecos entre outras notas da família

---

## 18. Critérios de aceite técnicos

- a timeline deve respeitar `created_at` como eixo temporal principal
- tarefas com `scheduled_at` devem renderizar criação e ponto real
- ghost card deve ser exclusivo de tarefa
- notas devem usar ecos, não ghost card
- o Reader de nota deve exibir relações; a timeline deve exibir só a contagem direta
- o modelo de notas deve permitir múltiplos ecos e metadata da conexão
- o modelo de tarefas deve preservar `source_day`, `target_day` e `scheduled_at`

---

## 19. Ordem de implementação sugerida

### Fase 1 — Fundamentos
1. setup do projeto
2. client do Supabase
3. tipos e schemas
4. stores Zustand
5. rotas Expo Router

### Fase 2 — Notas
6. CRUD de notas
7. CRUD de ecos
8. criação por continuação
9. Reader de nota com ecos
10. badge de contagem direta

### Fase 3 — Tarefas
11. CRUD de tarefas
12. validação temporal
13. ghost card
14. breadcrumb de retorno
15. item real + marcador de criação

### Fase 4 — Timeline
16. derivação unificada
17. ordenação por `sortAt`
18. tabs derivadas
19. double tap

### Fase 5 — Refino
20. cores por tag
21. empty states
22. loading/error
23. testes dos cenários críticos

---

## 20. Definição final para o Codex

O Codex deve tratar este produto como um app de **timeline diária híbrida** com dois mecanismos estruturais distintos:

- **tarefas**: ação + projeção temporal
- **notas**: registro + continuidade conceitual

A timeline é una, mas a lógica de domínio não precisa ser igual para tudo. O que precisa ser único é a sensação do produto: o usuário avança pelo dia, registra o presente e conecta futuro e passado sem perder contexto.
