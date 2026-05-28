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

## Delivered Feature 002

`002-note-echo-flows` tem US1, US2 e US3 implementadas. A Phase 6 fecha apenas
documentacao, rastreabilidade e gates; ela nao adiciona nova capacidade de
produto.

Entregue pela feature:

- contagem direta de ecos em notas do dia
- Reader com notas conectadas e degradacao de detalhe inacessivel
- navegacao contextual para nota conectada de outro dia
- criacao manual de eco `manual_link` com bloqueio de duplicidade
- busca paginada de candidatas e candidatas ja conectadas desabilitadas
- remocao confirmada de eco selecionado
- continuacao atomica por RPC `continue_note`

## Delivered Feature 004

`004-dual-timeline-nav` divide a superfície diária em duas páginas de timeline
por tipo, com navegação horizontal por swipe.

Entregue pela feature:

- Task Timeline: eixo à esquerda, cards de tarefa em largura total
- Note Timeline: eixo à direita, cards de nota em largura total
- Navegação por swipe horizontal (`react-native-pager-view`) e bottom bar
- FAB central Material 3 (56 px, elevation 6) perfurando a borda da bar
- FAB sempre abre sheet de escolha; auto-switch de página após criação
- `useSafeAreaInsets` integrado — elimina a "moldura invisível" de tela
- `useDayTimeline` retorna `taskNodes` e `noteNodes` separados

## Delivered UI Appearance

O design v2 do handoff foi absorvido como linguagem visual mobile dark-first,
mantendo as funcionalidades existentes plugadas aos mesmos fluxos.

Entregue:

- tema local claro/escuro
- cor de destaque local (`green`, `slate`, `amber`)
- densidade da timeline (`compact`, `normal`, `airy`)
- preferencias persistidas em AsyncStorage
- cards, calendario, bottom bar, FAB, breadcrumb e Ajustes alinhados ao v2

## Canon Status

Os seis canones executaveis vivem em `docs-canonical/`. A raiz guarda
governanca, status, operacao e historico. A absorcao material dos tres arquivos
antigos de `docs/` esta registrada em `CANON-MIGRATION-COVERAGE.md`.

Hoje:

- a raiz contem a estrutura compatibilizada com DocGuard
- `docs/` e acervo historico, nao fonte material obrigatoria
- capacidades futuras absorvidas do canon historico continuam separadas do que o
  baseline atual entrega

## Technical Status

- validacao de ambiente existe em `src/lib/env.ts`
- bootstrap do cliente Supabase existe em `src/lib/supabase.ts`
- migration base existe em `supabase/migrations/001_auth_day_surface.sql`
- testes cobrem auth, same-day, projected flow, timeline e regresses chave
- testes cobrem Ajustes locais de aparencia

## Deferred Areas

Ainda nao consolidados como entrega do baseline:

- mencoes inline persistidas com semantica completa
- deploy e release de producao

## Operational Gate

O gate minimo do repo continua sendo:

- `doc:guard`
- `lint`
- `test`
- `typecheck`
