# Test Specification

## Test Categories

- unitarios de utilitarios de data e validacao
- unitarios de schemas e APIs de nota/tarefa
- unitarios de derivacao da timeline
- unitarios de comportamento de UI sensivel a toque
- integracao de auth e rota protegida
- integracao da superficie diaria same-day e projected

## Coverage Rules

- toda regressao de regra temporal precisa de teste unitario ou de integracao
- toda mudanca em ghost navigation precisa preservar breadcrumb e retorno ao
  contexto de origem
- mudanca que toque auth precisa manter cobertura do fluxo de bootstrap,
  restauracao e logout
- mudanca em schema ou contrato de formulario exige atualizar testes de schema
  e os canones relevantes

## Service-to-Test Map

- `src/lib/env.ts`
  - `tests/unit/lib/env.test.ts`
- `src/features/tasks/api/create-task.ts`
  - `tests/unit/tasks/task-temporal-validation.test.ts`
- `src/features/notes/api/update-note.ts`
  - `tests/unit/notes/update-note.test.ts`
- `src/features/timeline/utils/derive-timeline-nodes.ts`
  - `tests/unit/timeline/same-day-nodes.test.ts`
  - `tests/unit/timeline/projected-task-nodes.test.ts`
  - `tests/unit/timeline/derive-timeline-nodes-regression.test.ts`
- `src/components/timeline/timeline-view.tsx`
  - `tests/unit/timeline/timeline-view.test.tsx`
- `app/day/[date].tsx` e fluxo do shell do dia
  - `tests/integration/day/day-surface-same-day.test.tsx`
  - `tests/integration/day/ghost-navigation.test.tsx`
  - `tests/integration/day/day-surface-regression.test.tsx`
- auth flow
  - `tests/integration/auth/auth-session-flow.test.tsx`

## Critical User Journeys (E2E Required)

Journeys criticos do baseline:

- US1: entrar, restaurar sessao, proteger rota e sair com feedback correto
- US2: criar nota e tarefa no mesmo dia e ver a timeline coerente
- US3: projetar tarefa para outro dia, navegar pelo ghost e voltar pelo
  breadcrumb

Hoje esses journeys estao cobertos por testes de integracao em Jest/RTL. Ainda
nao existe suite E2E dedicada fora desse escopo.

## Canary Tests (Pre-Deploy Gates)

Antes de merge:

- `corepack pnpm run doc:guard`
- `corepack pnpm run lint`
- `corepack pnpm run test`
- `corepack pnpm run typecheck`

## Recommended Test Patterns

- congele datas com `tests/support/mock-system-date.ts` em vez de depender do
  relogio real
- prefira validar comportamento final da timeline, nao detalhes acidentais da
  implementacao
- em regressao de ghost navigation, cubra origem, destino e retorno ao contexto
- para flows temporais, preserve a diferenca entre horario local exibido e
  timestamp persistido

## Traceability Notes

- US1 -> `tests/integration/auth/auth-session-flow.test.tsx`
- US2 -> `tests/integration/day/day-surface-same-day.test.tsx`
- US3 -> `tests/integration/day/ghost-navigation.test.tsx` e
  `tests/integration/day/day-surface-regression.test.tsx`

## Revision History

- 2026-04-25 - Canon consolidado na raiz apos o fechamento de
  `001-auth-day-surface`
