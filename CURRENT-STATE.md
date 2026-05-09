# Current State

## Delivered Baseline

`001-auth-day-surface` esta fechada e define o baseline funcional atual do
produto neste repositorio.

Entregue hoje:

- auth por email e senha
- restauracao local de sessao
- rota protegida do dia
- nota e tarefa same-day
- tarefa projected com ghost navigation e breadcrumb
- cobertura automatizada do corte

## Canon Status

O canon vigente vive na raiz do repositorio. A absorcao material dos tres
arquivos antigos de `docs/` esta registrada em `CANON-MIGRATION-COVERAGE.md`.

Hoje:

- a raiz contem a estrutura compatibilizada com DocGuard
- `docs/` e acervo historico, nao fonte material obrigatoria
- capacidades futuras absorvidas do canon historico continuam separadas do que o
  baseline atual entrega

## Technical Status

- validacao de ambiente existe em `src/lib/env.ts`
- bootstrap do cliente Supabase existe em `src/lib/supabase.ts`
- migration base existe em `supabase/migrations/001_auth_day_surface.sql`
- `002-note-echo-flows` tem US1 e US2 implementadas no codigo: leitura de ecos,
  Reader com notas conectadas, criacao manual, bloqueio de duplicidade,
  paginacao de candidatas e remocao confirmada
- testes cobrem auth, same-day, projected flow, timeline e regresses chave

## Deferred Areas

Ainda nao consolidados como entrega do baseline:

- fluxos completos de ecos de nota, porque `continue_note` ainda nao esta
  fechado
- mencoes inline persistidas com semantica completa
- deploy e release de producao

## Operational Gate

O gate minimo do repo continua sendo:

- `doc:guard`
- `lint`
- `test`
- `typecheck`
