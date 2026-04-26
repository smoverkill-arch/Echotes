# Data Model

## Modeling Strategy

O MVP nao deve forcar uma tabela generica unica para nota e tarefa se isso
apagar clareza de dominio.

- tarefas armazenam acao + projecao temporal
- notas armazenam registro do dia + conexoes por ecos em tabela separada

## Entities

O baseline usa quatro tabelas:

- `tags`
- `tasks`
- `notes`
- `note_echoes`

`note_echoes` existe no schema e na modelagem, mas os fluxos completos de eco
nao estao consolidados como entrega do baseline atual.

## Schema Definitions

### `tags`

- `id`
- `user_id`
- `name`
- `color`
- `created_at`

### `tasks`

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

Restricoes fechadas:

- `title` nao pode ser vazio
- `scheduled_at` e opcional
- quando existe, `scheduled_at` deve ser estritamente posterior a `created_at`

### `notes`

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

### `note_echoes`

- `id`
- `from_note_id`
- `to_note_id`
- `created_by_user_id`
- `created_at`
- `context_note_id`
- `context_day`
- `kind`
- `metadata`

Regras:

- `from_note_id <> to_note_id`
- um mesmo par de notas nao deve gerar duplicacao semantica da relacao

## Relationships

- `tasks.tag_id -> tags.id`
- `notes.tag_id -> tags.id`
- `note_echoes.from_note_id -> notes.id`
- `note_echoes.to_note_id -> notes.id`

## RLS and Ownership

As tabelas principais usam ownership por usuario autenticado.

Cobertura atual da migration:

- select, insert, update e delete para `tags`
- select, insert, update e delete para `tasks`
- select, insert, update e delete para `notes`
- select, insert e delete para `note_echoes`

As policies de `note_echoes` verificam ownership das notas envolvidas.

## SQL Contract Summary

A migration base deve conter:

- `create extension if not exists pgcrypto`
- tabelas `tags`, `tasks`, `notes`, `note_echoes`
- triggers `trg_tasks_updated_at` e `trg_notes_updated_at`
- funcao `set_updated_at()`
- check de `tasks.status in ('open', 'done', 'cancelled')`
- check de titulo nao vazio em `tasks` e `notes`
- check de `note_echoes.from_note_id <> note_echoes.to_note_id`

O SQL completo executavel vive em `supabase/migrations/001_auth_day_surface.sql`.
Este arquivo e a fonte operacional para aplicar o banco; este canon descreve o
contrato que novas migrations devem preservar.

## Indexes

O baseline cria indexes para:

- tarefas por `user_id + target_day`
- tarefas por `user_id + source_day`
- tarefas por `user_id + created_at`
- tarefas por `user_id + scheduled_at`
- notas por `user_id + day`
- notas por `user_id + created_at`
- ecos por `from_note_id`
- ecos por `to_note_id`
- unicidade semantica do par de notas em `note_echoes`

## Day Queries

Consultas base do dia:

- tarefas onde `source_day = selectedDay` ou `target_day = selectedDay`
- notas onde `day = selectedDay`
- ecos ligados as notas do dia, quando necessario para contagem e detalhes

## Runtime Types

Tipos de dominio atuais:

- `src/types/task.ts`
- `src/types/note.ts`
- `src/types/timeline.ts`

Contratos relevantes:

- `TaskStatus = open | done | cancelled`
- `TimelineNodeType = note | task_untimed | task_creation_marker | task_timed | task_ghost`
- `TaskFormValues` usa `scheduled_time` como input de UI, mas o campo
  persistido continua sendo `scheduled_at`

## Validation and Composition Rules

Schemas locais:

- `src/schemas/task.schema.ts`
- `src/schemas/note.schema.ts`
- `src/schemas/auth.schema.ts`

Regras canônicas:

- `scheduled_time` pode existir no formulario, mas `scheduled_at` e o campo
  persistido
- `scheduled_at` e sempre derivado de `target_day + scheduled_time`
- a composicao de `scheduled_at` acontece antes da validacao temporal e antes da
  persistencia
- validacoes de "nao agendar no passado" dependem de runtime e do banco

### Base Zod Contracts

Contratos canonicos:

- `dateStringSchema`: `YYYY-MM-DD`
- `timeStringSchema`: `HH:mm`
- `colorSchema`: hexadecimal `#RGB` ou `#RRGGBB`
- `taskFormSchema`: titulo obrigatorio, `source_day`, `target_day`,
  `scheduled_time`, status e campos de tag/cor
- `noteFormSchema`: titulo obrigatorio, `day`, `brief` e campos de tag/cor
- `noteEchoSchema`: `from_note_id`, `to_note_id`, `kind`, contexto opcional e
  metadata opcional

### Tag and Color Rules

- tag possui `id`, `user_id`, `name`, `color`, `created_at`
- ao selecionar uma tag, aplicar automaticamente a cor da tag no item
- se o usuario alterar a cor manualmente, persistir `is_color_overridden = true`
- enquanto houver override manual, trocar a tag nao deve sobrescrever
  automaticamente a cor

### Echo Metadata Rules

`metadata` de eco pode armazenar informacao auxiliar, mas nao substitui a fonte
de verdade da relacao semantica.

Para mencao inline, metadata sugerida:

- `origin = "content_mention"`
- `label`
- `noteId`
- `sourceRange`
- `tokenId`
- `labelSnapshot`

## Temporal Rules by Domain

### Tasks

- `created_at` registra o momento real de criacao
- `source_day` registra o dia/contexto visto pelo usuario ao criar
- `target_day` registra o dia ao qual a tarefa pertence
- se nao houver `scheduled_at`, a tarefa entra pela posicao de `created_at`
- same-day com horario rende marker + item real
- projected rende ghost na origem e item real no destino

### Notes

- `day` e suficiente para o pertencimento temporal principal
- `created_at` define a posicao intradiaria
- notas nao reutilizam `source_day` e `target_day`

## Utility Rules

Helpers canonicos citados no starter pack e refletidos no codigo:

- composicao de `scheduled_at`
- extracao de componente de hora
- construcao de `sortAt` local ao dia
- validacao temporal de `scheduled_at`
- contagem de ecos diretos

## Migration Strategy

O schema atual nasce de:

- `supabase/migrations/001_auth_day_surface.sql`

Novas migrations devem preservar:

- separacao entre tarefas e notas
- ownership via RLS
- ghost card como mecanismo derivado, nao entidade persistida
- `note_echoes` como tabela separada de relacao

## Defaults and Form Behavior

Defaults de criacao esperados:

- nova tarefa nasce com `source_day = selectedDay`, `target_day = selectedDay`,
  `scheduled_time = null` e `status = open`
- nova nota nasce com `day = selectedDay`
- em `edit`, o editor consome o item existente e nao reaplica defaults de create

## Implementation Checklist

Checklist canonico absorvido do starter pack:

1. aplicar SQL do schema
2. configurar RLS
3. criar tipos TypeScript
4. criar schemas Zod
5. criar CRUD de tasks
6. criar CRUD de notes
7. criar CRUD de note_echoes quando ecos virarem entrega ativa
8. implementar `deriveTimelineNodes`
9. implementar contagem de ecos diretos quando ecos virarem entrega ativa
10. implementar fluxo de continuar nota quando essa capacidade entrar no corte
11. validar `scheduled_at > created_at`
12. renderizar timeline unificada

## Revision History

- 2026-04-26 - Modelo ampliado com estrategia de modelagem, RLS, queries,
  regras de composicao e diferenciacao temporal por dominio
