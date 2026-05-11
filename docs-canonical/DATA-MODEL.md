# Data Model

## Modeling Strategy

O baseline usa tabelas separadas para tarefas e notas.
Essa escolha preserva clareza de dominio.

- tarefa guarda acao e projecao temporal.
- nota guarda registro do dia.
- eco vive em tabela propria.

`note_echoes` ja existe em schema e modelagem.
Os fluxos CRUD de eco (criar, listar, remover, candidatas) e a continuacao
atomica por RPC `continue_note` estao implementados em `002-note-echo-flows`.

## Entities

O baseline usa quatro tabelas:

- `tags`.
- `tasks`.
- `notes`.
- `note_echoes`.

## Schema Definitions

### `tags`

- `id`.
- `user_id`.
- `name`.
- `color`.
- `created_at`.

### `tasks`

- `id`.
- `user_id`.
- `title`.
- `content`.
- `tag_id`.
- `color`.
- `is_color_overridden`.
- `source_day`.
- `target_day`.
- `created_at`.
- `scheduled_at`.
- `status`.
- `completed_at`.
- `updated_at`.

Regras principais:

- `title` exige texto util.
- `scheduled_at` e opcional.
- `scheduled_at`, quando existir, fica depois de `created_at`.

### `notes`

- `id`.
- `user_id`.
- `day`.
- `title`.
- `content`.
- `brief`.
- `tag_id`.
- `color`.
- `is_color_overridden`.
- `created_at`.
- `updated_at`.

### `note_echoes`

- `id`.
- `from_note_id`.
- `to_note_id`.
- `created_by_user_id`.
- `created_at`.
- `context_note_id`.
- `context_day`.
- `kind`.
- `metadata`.

Regras principais:

- `from_note_id` e `to_note_id` sempre apontam para notas diferentes.
- o par de notas preserva unicidade semantica.
- `created_by_user_id` e derivado no banco por `default auth.uid()` em inserts
  autenticados; o cliente nao envia user id nem `created_by_user_id` para criar
  eco manual.
- `kind = manual_link` representa eco criado pela acao explicita de adicionar
  eco.
- `kind = continue_note` representa eco criado pela continuacao de uma nota.
- `context_day` registra o dia em que a relacao foi criada ou continuada.
- `metadata` pode guardar provenance auxiliar, mas nao substitui a relacao.

### RPC `continue_note`

`public.continue_note` cria nova nota e eco `continue_note` na mesma transacao.

Entrada:

- nota de origem.
- dia da nova nota.
- titulo.
- conteudo.
- briefing inicial.

Saida:

- nova nota.
- eco criado.

Regras:

- a origem precisa pertencer ao usuario autenticado.
- a nova nota nasce com `user_id = auth.uid()`.
- o eco nasce com `created_by_user_id = auth.uid()`.
- falha em qualquer etapa impede persistencia parcial.

## Relationships

- `tasks.tag_id -> tags.id`.
- `notes.tag_id -> tags.id`.
- `note_echoes.from_note_id -> notes.id`.
- `note_echoes.to_note_id -> notes.id`.

## RLS and Ownership

Todas as tabelas do baseline usam RLS.
Ownership por usuario autenticado protege o acesso.

Cobertura da migration:

- `tags` usa select, insert, update e delete por ownership.
- `tasks` usa select, insert, update e delete por ownership.
- `notes` usa select, insert, update e delete por ownership.
- `note_echoes` usa select, insert, update e delete com ownership das notas ligadas.

## SQL Contract Summary

A migration base preserva:

- `create extension if not exists pgcrypto`.
- tabelas `tags`, `tasks`, `notes` e `note_echoes`.
- triggers `trg_tasks_updated_at` e `trg_notes_updated_at`.
- funcao `set_updated_at()`.
- check de `tasks.status in ('open', 'done', 'cancelled')`.
- check de titulo util para `tasks` e `notes`.
- check de relacao valida em `note_echoes`.

O SQL executavel vive em `supabase/migrations/001_auth_day_surface.sql`.
Esse arquivo e a fonte operacional para o banco.
O fluxo de continuacao vive em `supabase/migrations/002_note_echo_flows.sql`.
O default de ownership para projetos existentes vive em
`supabase/migrations/002_note_echo_owner_default.sql`.
Hardening incremental de grants, policies, funcao auxiliar e GraphQL vive em
`supabase/migrations/003_harden_note_echo_surface.sql`.
Este canon descreve o contrato que novas migrations devem manter.

## Indexes

O baseline cria indexes para:

- tarefas por `user_id + target_day`.
- tarefas por `user_id + source_day`.
- tarefas por `user_id + created_at`.
- tarefas por `user_id + scheduled_at`.
- notas por `user_id + day`.
- notas por `user_id + created_at`.
- ecos por `from_note_id`.
- ecos por `to_note_id`.
- par semantico de `note_echoes`.

## Day Queries

Consultas base do dia:

- tarefas em `source_day = selectedDay`.
- tarefas em `target_day = selectedDay`.
- notas em `day = selectedDay`.
- ecos ligados a notas do dia quando a tela precisar de contagem ou detalhe.

## Runtime Types

Tipos atuais:

- `src/types/task.ts`.
- `src/types/note.ts`.
- `src/types/timeline.ts`.

Contratos relevantes:

- `TaskStatus = open | done | cancelled`.
- `TimelineNodeType = note | task_untimed | task_creation_marker | task_timed | task_ghost`.
- `TaskFormValues` usa `scheduled_time` como input de UI.
- `scheduled_at` segue como campo persistido.

## Validation and Composition Rules

Schemas locais:

- `src/schemas/task.schema.ts`.
- `src/schemas/note.schema.ts`.
- `src/schemas/auth.schema.ts`.

Regras canonicas:

- `scheduled_time` pertence ao formulario.
- `scheduled_at` pertence ao registro persistido.
- `scheduled_at` nasce de `target_day + scheduled_time`.
- a composicao roda antes da validacao temporal.
- a composicao roda antes da persistencia.

### Base Zod Contracts

- `dateStringSchema` aceita `YYYY-MM-DD`.
- `timeStringSchema` aceita `HH:mm`.
- `colorSchema` aceita `#RGB` e `#RRGGBB`.
- `taskFormSchema` valida titulo, dias, horario, status e campos de tag/cor.
- `noteFormSchema` valida titulo, dia, brief e campos de tag/cor.
- `noteEchoSchema` valida ids, `kind`, contexto e metadata.

### Tag and Color Rules

- tag guarda `id`, `user_id`, `name`, `color` e `created_at`.
- a selecao de tag aplica a cor da tag.
- override manual marca `is_color_overridden = true`.
- override manual preserva a cor escolhida em trocas futuras de tag.

### Echo Metadata Rules

`metadata` guarda contexto auxiliar.
`metadata` nao substitui a relacao semantica.

Metadata sugerida para mencao inline:

- `origin = "content_mention"`.
- `label`.
- `noteId`.
- `sourceRange`.
- `tokenId`.
- `labelSnapshot`.

## Temporal Rules by Domain

### Tasks

- `created_at` registra o momento real de criacao.
- `source_day` registra o dia visto na criacao.
- `target_day` registra o dia de destino.
- tarefa sem `scheduled_at` entra pela posicao de `created_at`.
- tarefa same-day com horario rende marker e item real.
- tarefa projected rende ghost na origem e item real em `target_day`.

### Notes

- `day` define o pertencimento temporal principal.
- `created_at` define a posicao intradiaria.
- notas usam tabela de ecos separada.

## Utility Rules

Helpers canonicos usados pelo repo:

- composicao de `scheduled_at`.
- extracao do componente de hora.
- construcao de `sortAt` local ao dia.
- validacao temporal de `scheduled_at`.
- contagem de ecos diretos.

## Migration Strategy

O schema atual nasce de:

- `supabase/migrations/001_auth_day_surface.sql`.
- `supabase/migrations/002_note_echo_flows.sql`.
- `supabase/migrations/002_note_echo_owner_default.sql`.
- `supabase/migrations/003_harden_note_echo_surface.sql`.

Novas migrations devem preservar:

- separacao entre tarefas e notas.
- ownership via RLS.
- superficie de cliente limitada a sessoes autenticadas e grants minimos.
- ghost card como representacao derivada.
- `note_echoes` como relacao dedicada.

## Defaults and Form Behavior

Defaults de criacao:

- nova tarefa nasce com `source_day = selectedDay`.
- nova tarefa nasce com `target_day = selectedDay`.
- nova tarefa nasce com `scheduled_time = null`.
- nova tarefa nasce com `status = open`.
- nova nota nasce com `day = selectedDay`.
- edicao usa o item existente como fonte.

## Implementation Checklist

Checklist canonico ativo:

1. Aplicar SQL do schema.
2. Configurar RLS.
3. Criar tipos TypeScript.
4. Criar schemas Zod.
5. Criar CRUD de tasks.
6. Criar CRUD de notes.
7. Criar CRUD de note_echoes.
8. Implementar `deriveTimelineNodes`.
9. Implementar contagem de ecos diretos.
10. Implementar fluxo de continuar nota.
11. Validar `scheduled_at > created_at`.
12. Renderizar timeline unificada.

## Revision History

- 2026-05-11 - Registrado `continue_note` atomico, `manual_link` e
  `continue_note` como provenance entregue por `002-note-echo-flows`.
- 2026-05-06 - Atualizado status dos fluxos de eco: CRUD implementado em `002-note-echo-flows`.
- 2026-05-06 - Contrato de hardening Supabase documentado para grants,
  policies, funcao auxiliar e GraphQL.
- 2026-05-01 - Texto simplificado e secoes reorganizadas para leitura rapida.
- 2026-04-26 - Modelo ampliado com estrategia de modelagem, RLS, queries, regras de composicao e diferenciacao temporal por dominio.
