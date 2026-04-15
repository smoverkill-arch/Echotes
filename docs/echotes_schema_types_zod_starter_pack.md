# Echotes — Starter Pack de Dados (SQL + TypeScript + Zod)

## 1. Objetivo

Este documento fornece uma base inicial de implementação alinhada às decisões fechadas do domínio.

Ele separa corretamente:
- **tarefas** → ação + projeção temporal
- **notas** → registro + ecos

A modelagem foi reescrita para evitar forçar a mesma lógica sobre ambos os domínios.

---

## 2. Estratégia de modelagem

## 2.1 Tarefas
Tarefas precisam armazenar:
- momento real de criação
- dia/contexto em que foram criadas
- dia ao qual pertencem
- horário real de execução, quando houver

## 2.2 Notas
Notas precisam armazenar:
- dia ao qual pertencem
- momento real de criação
- conteúdo / briefing
- conexões com outras notas em uma tabela separada de ecos

## 2.3 Conclusão
A recomendação do MVP é **não** modelar tudo numa tabela genérica única se isso comprometer clareza. Separar tarefas e notas simplifica a implementação e preserva o domínio.

---

## 3. Supabase SQL — schema inicial

```sql
create extension if not exists pgcrypto;

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  color text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  content text,
  tag_id uuid references public.tags(id) on delete set null,
  color text,
  is_color_overridden boolean not null default false,
  source_day date not null,
  target_day date not null,
  created_at timestamptz not null default now(),
  scheduled_at timestamptz,
  status text not null check (status in ('open', 'done', 'cancelled')),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),

  constraint tasks_title_not_empty check (char_length(trim(title)) > 0),
  constraint tasks_scheduled_not_in_past check (
    scheduled_at is null or scheduled_at > created_at
  )
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  day date not null,
  title text not null,
  content text,
  brief text,
  tag_id uuid references public.tags(id) on delete set null,
  color text,
  is_color_overridden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint notes_title_not_empty check (char_length(trim(title)) > 0)
);

create table if not exists public.note_echoes (
  id uuid primary key default gen_random_uuid(),
  from_note_id uuid not null references public.notes(id) on delete cascade,
  to_note_id uuid not null references public.notes(id) on delete cascade,
  created_by_user_id uuid not null,
  created_at timestamptz not null default now(),
  context_note_id uuid references public.notes(id) on delete set null,
  context_day date,
  kind text not null check (kind in ('manual_link', 'continue_note')),
  metadata jsonb,

  constraint note_echoes_not_self check (from_note_id <> to_note_id)
);

create unique index if not exists idx_note_echoes_unique_pair
  on public.note_echoes (
    least(from_note_id, to_note_id),
    greatest(from_note_id, to_note_id)
  );

create index if not exists idx_tasks_user_target_day
  on public.tasks (user_id, target_day);

create index if not exists idx_tasks_user_source_day
  on public.tasks (user_id, source_day);

create index if not exists idx_tasks_user_created_at
  on public.tasks (user_id, created_at);

create index if not exists idx_tasks_user_scheduled_at
  on public.tasks (user_id, scheduled_at);

create index if not exists idx_notes_user_day
  on public.notes (user_id, day);

create index if not exists idx_notes_user_created_at
  on public.notes (user_id, created_at);

create index if not exists idx_note_echoes_from
  on public.note_echoes (from_note_id);

create index if not exists idx_note_echoes_to
  on public.note_echoes (to_note_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON public.tasks;
create trigger trg_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

DROP TRIGGER IF EXISTS trg_notes_updated_at ON public.notes;
create trigger trg_notes_updated_at
before update on public.notes
for each row
execute function public.set_updated_at();
```

---

## 4. RLS sugerido

```sql
alter table public.tags enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.note_echoes enable row level security;

create policy "tags_select_own"
on public.tags for select
using (auth.uid() = user_id);

create policy "tags_insert_own"
on public.tags for insert
with check (auth.uid() = user_id);

create policy "tags_update_own"
on public.tags for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "tags_delete_own"
on public.tags for delete
using (auth.uid() = user_id);

create policy "tasks_select_own"
on public.tasks for select
using (auth.uid() = user_id);

create policy "tasks_insert_own"
on public.tasks for insert
with check (auth.uid() = user_id);

create policy "tasks_update_own"
on public.tasks for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "tasks_delete_own"
on public.tasks for delete
using (auth.uid() = user_id);

create policy "notes_select_own"
on public.notes for select
using (auth.uid() = user_id);

create policy "notes_insert_own"
on public.notes for insert
with check (auth.uid() = user_id);

create policy "notes_update_own"
on public.notes for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "notes_delete_own"
on public.notes for delete
using (auth.uid() = user_id);

create policy "note_echoes_select_own"
on public.note_echoes for select
using (
  exists (
    select 1
    from public.notes n
    where n.id = from_note_id
      and n.user_id = auth.uid()
  )
  and
  exists (
    select 1
    from public.notes n
    where n.id = to_note_id
      and n.user_id = auth.uid()
  )
);

create policy "note_echoes_insert_own"
on public.note_echoes for insert
with check (
  created_by_user_id = auth.uid()
  and exists (
    select 1 from public.notes n where n.id = from_note_id and n.user_id = auth.uid()
  )
  and exists (
    select 1 from public.notes n where n.id = to_note_id and n.user_id = auth.uid()
  )
);

create policy "note_echoes_delete_own"
on public.note_echoes for delete
using (
  exists (
    select 1 from public.notes n where n.id = from_note_id and n.user_id = auth.uid()
  )
  and exists (
    select 1 from public.notes n where n.id = to_note_id and n.user_id = auth.uid()
  )
);
```

---

## 5. Queries base do dia

## 5.1 Tarefas do dia selecionado
```sql
select *
from public.tasks
where user_id = :user_id
  and (
    source_day = :selected_day
    or target_day = :selected_day
  )
order by created_at asc;
```

## 5.2 Notas do dia selecionado
```sql
select *
from public.notes
where user_id = :user_id
  and day = :selected_day
order by created_at asc;
```

## 5.3 Ecos das notas do dia
```sql
select *
from public.note_echoes
where from_note_id in (:note_ids)
   or to_note_id in (:note_ids);
```

---

## 6. Tipos TypeScript — domínio

```ts
export type TaskStatus = 'open' | 'done' | 'cancelled'
export type CalendarMode = 'week' | 'month'
export type DayTab = 'timeline' | 'tasks' | 'notes'

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

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

export type NoteEchoKind = 'manual_link' | 'continue_note'

export interface NoteEcho {
  id: string
  from_note_id: string
  to_note_id: string
  created_by_user_id: string
  created_at: string
  context_note_id: string | null
  context_day: string | null
  kind: NoteEchoKind
  metadata: Record<string, unknown> | null
}
```

---

## 7. Tipos TypeScript — timeline

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
  itemKind: 'note' | 'task'
  itemId: string
  sortAt: string
  createdAt: string
  scheduledAt: string | null
  data: Note | Task
}
```

---

## 8. Tipos TypeScript — formulários

```ts
export interface BaseStyledFormValues {
  title: string
  content: string
  tag_id: string | null
  color: string | null
  is_color_overridden: boolean
}

export interface TaskFormValues extends BaseStyledFormValues {
  source_day: string
  target_day: string
  scheduled_time: string | null
  status: TaskStatus
}

export interface NoteFormValues extends BaseStyledFormValues {
  day: string
  brief: string
}

export interface ContinueNoteInput {
  sourceNoteId: string
  targetDay: string
  generatedBrief: string
  title?: string
}

export interface CreateEchoInput {
  from_note_id: string
  to_note_id: string
  kind: NoteEchoKind
  context_note_id?: string | null
  context_day?: string | null
  metadata?: Record<string, unknown> | null
}

export interface ReaderSurfaceState {
  kind: 'task' | 'note' | null
  id: string | null
}

export interface EditorSurfaceState {
  mode: 'create' | 'edit' | null
  kind: 'task' | 'note' | null
  id: string | null
}
```

---

## 9. Zod — utilitários base

```ts
import { z } from 'zod'

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato YYYY-MM-DD')

export const timeStringSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Use o formato HH:mm')

export const colorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor inválida em hexadecimal')
```

---

## 10. Zod — tag

```ts
export const tagSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  name: z.string().trim().min(1, 'Nome da tag é obrigatório'),
  color: colorSchema,
  created_at: z.string().optional(),
})
```

---

## 11. Zod — tarefa

```ts
export const taskFormSchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório'),
  content: z.string().trim().optional().default(''),
  tag_id: z.string().uuid().nullable().optional().default(null),
  color: colorSchema.nullable().optional().default(null),
  is_color_overridden: z.boolean().default(false),
  source_day: dateStringSchema,
  target_day: dateStringSchema,
  scheduled_time: timeStringSchema.nullable().optional().default(null),
  status: z.enum(['open', 'done', 'cancelled']).default('open'),
})

export type TaskFormSchema = z.infer<typeof taskFormSchema>
```

### Validação refinada de tarefa

```ts
export const refinedTaskFormSchema = taskFormSchema.superRefine((data, ctx) => {
  if (!data.target_day) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Dia de destino é obrigatório',
      path: ['target_day'],
    })
  }
})
```

Observação:
- a validação de “não agendar para o passado” depende do `created_at` real e deve ser complementada em runtime e no banco

---

## 12. Zod — nota

```ts
export const noteFormSchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório'),
  content: z.string().trim().optional().default(''),
  brief: z.string().trim().optional().default(''),
  tag_id: z.string().uuid().nullable().optional().default(null),
  color: colorSchema.nullable().optional().default(null),
  is_color_overridden: z.boolean().default(false),
  day: dateStringSchema,
})

export type NoteFormSchema = z.infer<typeof noteFormSchema>
```

---

## 13. Zod — eco

```ts
export const noteEchoSchema = z.object({
  from_note_id: z.string().uuid(),
  to_note_id: z.string().uuid(),
  kind: z.enum(['manual_link', 'continue_note']),
  context_note_id: z.string().uuid().nullable().optional().default(null),
  context_day: dateStringSchema.nullable().optional().default(null),
  metadata: z.record(z.string(), z.unknown()).nullable().optional().default(null),
}).refine((data) => data.from_note_id !== data.to_note_id, {
  message: 'Uma nota não pode criar eco com ela mesma',
  path: ['to_note_id'],
})

export type NoteEchoSchema = z.infer<typeof noteEchoSchema>
```

---

## 14. Funções utilitárias

```ts
export function buildScheduledAt(targetDay: string, scheduledTime: string | null) {
  if (!scheduledTime) return null
  return `${targetDay}T${scheduledTime}:00`
}

export function extractTimePart(iso: string) {
  return iso.slice(11, 19)
}

export function buildInDaySortAt(day: string, iso: string) {
  return `${day}T${extractTimePart(iso)}`
}

export function validateScheduledAtNotInPast(params: {
  createdAtIso: string
  scheduledAtIso: string | null
}) {
  const { createdAtIso, scheduledAtIso } = params
  if (!scheduledAtIso) return true
  return new Date(scheduledAtIso).getTime() > new Date(createdAtIso).getTime()
}

export function countDirectEchoes(noteId: string, echoes: NoteEcho[]) {
  return echoes.filter(
    (echo) => echo.from_note_id === noteId || echo.to_note_id === noteId
  ).length
}
```

Regra canônica:
- `buildScheduledAt(targetDay, scheduledTime)` é a transformação canônica entre o input de formulário e o campo persistido `scheduled_at`
- toda validação temporal deve usar o valor de `scheduled_at` já composto
- a composição de `scheduled_at` acontece antes de qualquer validação temporal e antes da persistência

---

## 14.1 Helpers sugeridos para calendário semanal

O calendário semanal deve seguir estas regras:
- a semana começa no domingo
- a strip semanal deve sempre mostrar a semana que contém o `selectedDay`
- se o `selectedDay` mudar para um dia fora da semana visível, a semana exibida deve ser recalculada imediatamente

Helpers sugeridos:
- `getStartOfWeekSunday(date)`
- `getWeekRangeForSelectedDay(date)`

A lógica de UI do calendário semanal deve derivar a semana visível a partir do `selectedDay`, e não de um intervalo persistido independentemente dele.

---

## 15. Herança de cor por tag

```ts
export function applyTagColor(params: {
  tagColor: string
  isColorOverridden: boolean
  setValue: (name: any, value: any) => void
}) {
  const { tagColor, isColorOverridden, setValue } = params

  if (isColorOverridden) return

  setValue('color', tagColor)
}
```

Regra:
- se houver override manual, trocar a tag não sobrescreve automaticamente a cor

---

## 16. Derivação da timeline

A derivação da timeline deve usar posições **locais ao dia exibido**.

Regras:
- nós baseados em criação usam a posição intradiária derivada de `created_at`
- nós agendados usam a posição intradiária derivada de `scheduled_at`
- tarefa projetada com horário não gera marcador de criação separado no `source_day`; gera apenas ghost card

```ts
// TimelineNode não possui campo 'side'.
// O nó carrega apenas dados e posição temporal.
// O posicionamento visual em left/right é responsabilidade da camada de renderização.
export function deriveTimelineNodes(params: {
  selectedDay: string
  tasks: Task[]
  notes: Note[]
}): TimelineNode[] {
  const { selectedDay, tasks, notes } = params
  const nodes: TimelineNode[] = []

  for (const note of notes) {
    nodes.push({
      id: `${note.id}:note`,
      type: 'note',
      itemKind: 'note',
      itemId: note.id,
      sortAt: buildInDaySortAt(selectedDay, note.created_at),
      createdAt: note.created_at,
      scheduledAt: null,
      data: note,
    })
  }

  for (const task of tasks) {
    const isSourceDay = task.source_day === selectedDay
    const isTargetDay = task.target_day === selectedDay
    const isTimed = !!task.scheduled_at
    const isProjected = task.source_day !== task.target_day

    if (isTargetDay && !isTimed) {
      nodes.push({
        id: `${task.id}:task_untimed`,
        type: 'task_untimed',
        itemKind: 'task',
        itemId: task.id,
        sortAt: buildInDaySortAt(selectedDay, task.created_at),
        createdAt: task.created_at,
        scheduledAt: null,
        data: task,
      })
    }

    if (isSourceDay && isTargetDay && isTimed) {
      nodes.push({
        id: `${task.id}:task_creation_marker`,
        type: 'task_creation_marker',
        itemKind: 'task',
        itemId: task.id,
        sortAt: buildInDaySortAt(selectedDay, task.created_at),
        createdAt: task.created_at,
        scheduledAt: task.scheduled_at,
        data: task,
      })
    }

    if (isTargetDay && isTimed) {
      nodes.push({
        id: `${task.id}:task_timed`,
        type: 'task_timed',
        itemKind: 'task',
        itemId: task.id,
        sortAt: buildInDaySortAt(selectedDay, task.scheduled_at!),
        createdAt: task.created_at,
        scheduledAt: task.scheduled_at,
        data: task,
      })
    }

    if (isSourceDay && isProjected) {
      nodes.push({
        id: `${task.id}:task_ghost`,
        type: 'task_ghost',
        itemKind: 'task',
        itemId: task.id,
        sortAt: buildInDaySortAt(selectedDay, task.created_at),
        createdAt: task.created_at,
        scheduledAt: null,
        data: task,
      })
    }
  }

  return nodes.sort((a, b) => a.sortAt.localeCompare(b.sortAt))
}
```

---

## 17. Continuação de nota

## Comportamento esperado
- cria nova nota no dia escolhido
- gera brief automático
- permite editar imediatamente
- cria eco do tipo `continue_note`

```ts
export interface ContinueNoteResult {
  note: Note
  echo: NoteEcho
}
```

## Sugestão de helper

```ts
export function buildContinueNoteBrief(params: {
  title: string
  content: string | null
}) {
  const { title, content } = params
  const source = [title, content ?? ''].filter(Boolean).join('\n\n').trim()
  return source.slice(0, 280)
}
```

---

## 18. Menção no conteúdo

## Comportamento esperado
- a sintaxe oficial do MVP é `@nota`
- a menção no conteúdo conecta apenas notas já existentes
- ao selecionar a nota alvo, o editor converte a menção em chip inline
- ao salvar, o sistema cria um eco do tipo `manual_link`

## Regras
- menção no conteúdo não cria nota nova
- criação de nota nova conectada continua exclusiva de `continue_note`
- o conteúdo salvo/renderizado deve preservar a menção como chip inline clicável
- `content` continua sendo `string` no MVP
- a forma canônica persistida da menção inline no `content` é `@[label](note:<note_id>)`
- o token inline é a forma persistida da menção no conteúdo
- ao salvar, o sistema deve parsear o `content`, extrair os `note_id` mencionados e manter um `manual_link` por `note_id` distinto
- quando um token inline desaparecer do `content`, o sistema remove apenas `manual_link` com `metadata.origin = "content_mention"` correspondente àquela menção
- se a mesma nota aparecer mais de uma vez no mesmo `content`, todas as ocorrências inline são preservadas, mas a relação semântica continua sendo uma só por par de notas
- o label persistido no token não precisa ser reescrito automaticamente quando a nota-alvo mudar de título

## Metadata sugerida para `manual_link`
A `metadata` do eco é auxiliar e não é a fonte de verdade da posição inline. Ela pode armazenar informações auxiliares, por exemplo:
- `origin = "content_mention"`
- `label`
- `noteId`
- `sourceRange`
- `tokenId`
- `labelSnapshot`

---

## 19. Exclusão

## Nota
Ao excluir uma nota:
- excluir a própria nota
- remover os ecos diretamente ligados a ela
- não interferir nos ecos próprios que outras notas da família possuam entre si

## Tarefa
Ao excluir uma tarefa:
- remover a própria tarefa
- a timeline recalcula automaticamente ghost, marcador de criação e item real

---

## 20. Defaults sugeridos

### Nova tarefa
```ts
const defaultTaskValues: TaskFormValues = {
  title: '',
  content: '',
  tag_id: null,
  color: null,
  is_color_overridden: false,
  source_day: selectedDay,
  target_day: selectedDay,
  scheduled_time: null,
  status: 'open',
}
```

### Nova nota
```ts
const defaultNoteValues: NoteFormValues = {
  title: '',
  content: '',
  brief: '',
  tag_id: null,
  color: null,
  is_color_overridden: false,
  day: selectedDay,
}
```

Regra de uso:
- `defaultTaskValues` e `defaultNoteValues` são consumidos pelo `Editor` em modo `create`
- em modo `edit`, o `Editor` consome o item já existente e não reaplica defaults de criação

---

## 21. Checklist inicial de implementação

1. rodar SQL do schema
2. configurar RLS
3. criar tipos TS
4. criar schemas Zod
5. criar CRUD de tasks
6. criar CRUD de notes
7. criar CRUD de note_echoes
8. implementar `deriveTimelineNodes`
9. implementar contagem de ecos diretos
10. implementar fluxo de continuar nota
11. validar `scheduled_at > created_at`
12. renderizar timeline unificada

---

## 22. Definição final do starter pack

Este starter pack assume:

1. a timeline é única, mas o domínio de tarefa e nota não precisa ser idêntico;
2. tarefas usam projeção temporal e ghost card;
3. notas usam ecos e rede conceitual;
4. a modelagem deve preservar essa separação para manter clareza de produto e simplicidade de implementação.
