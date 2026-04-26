# Data Model

## Entities

O baseline atual usa quatro tabelas em Supabase Postgres:

- `tags`
- `tasks`
- `notes`
- `note_echoes`

`note_echoes` existe no schema, mas o uso funcional dessa entidade permanece
adiado no corte atual.

## Schema Definitions

### tags

- `id`
- `user_id`
- `name`
- `color`
- `created_at`

### tasks

- `id`
- `user_id`
- `title`
- `content`
- `tag_id`
- `color`
- `is_color_overridden`
- `source_day`
- `target_day`
- `created_at`
- `scheduled_at`
- `status`
- `completed_at`
- `updated_at`

### notes

- `id`
- `user_id`
- `day`
- `title`
- `content`
- `brief`
- `tag_id`
- `color`
- `is_color_overridden`
- `created_at`
- `updated_at`

### note_echoes

- `id`
- `from_note_id`
- `to_note_id`
- `created_by_user_id`
- `created_at`
- `context_note_id`
- `context_day`
- `kind`
- `metadata`

## Relationships

- `tasks.tag_id -> tags.id`
- `notes.tag_id -> tags.id`
- `note_echoes.from_note_id -> notes.id`
- `note_echoes.to_note_id -> notes.id`

As tabelas principais pertencem ao usuario autenticado e sao protegidas por
RLS orientada a ownership.

## Indexes

O baseline inclui indexes para:

- tarefas por `user_id + target_day`
- tarefas por `user_id + source_day`
- tarefas por `user_id + created_at`
- tarefas por `user_id + scheduled_at`
- notas por `user_id + day`
- notas por `user_id + created_at`
- ecos por `from_note_id`
- ecos por `to_note_id`

## Migration Strategy

O schema atual e iniciado por:

- `supabase/migrations/001_auth_day_surface.sql`

Essa migration cria tabelas, indexes, triggers de `updated_at` e politicas RLS.
Novas migrations devem preservar o baseline atual como ponto de partida.

## Runtime Mapping

Tipos locais relevantes:

- `src/types/task.ts`
- `src/types/note.ts`
- `src/types/timeline.ts`

Validacao local:

- `src/schemas/task.schema.ts`
- `src/schemas/note.schema.ts`

## Domain Notes

- `source_day` representa o dia de origem da tarefa.
- `target_day` representa o dia em que a tarefa deve aparecer como item real.
- tarefa projected gera ghost no dia de origem e item real no destino.
- nota pertence a um unico `day`.
- `scheduled_at` e opcional, mas quando existe precisa respeitar as regras
  temporais do baseline.

## Revision History

- 2026-04-25 - Canon consolidado na raiz apos o fechamento de
  `001-auth-day-surface`
