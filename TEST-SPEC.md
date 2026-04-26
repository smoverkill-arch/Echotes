# Test Specification

## Test Categories

- unitarios de utilitarios de data e validacao
- unitarios de schemas e APIs de nota/tarefa
- unitarios de derivacao da timeline
- unitarios de comportamento de toque e pending press
- integracao de auth e rota protegida
- integracao da superficie diaria same-day
- integracao da navegacao temporal por ghost card

## Coverage Rules

- toda regressao de regra temporal precisa de teste unitario ou de integracao
- toda mudanca em ghost navigation precisa preservar origem, destino e retorno
- mudanca que toque auth deve preservar bootstrap, restauracao e logout
- mudanca em schema ou contrato de formulario exige atualizar testes de schema e
  os canones relevantes
- mudanca na orientacao visual da timeline deve preservar a regra
  `note -> direita` e `task_* -> esquerda` sem contaminar `TimelineNode`

## Mandatory Canonical Cases

### Tarefas

1. criar tarefa sem horario para o mesmo dia
2. criar tarefa com horario para o mesmo dia
3. criar tarefa futura sem horario
4. criar tarefa futura com horario
5. impedir agendamento para o passado
6. impedir `scheduled_at <= created_at`
7. navegar por ghost card
8. retornar pelo breadcrumb

### Notas

1. criar nota independente
2. renderizar nota na timeline pelo horario intradiario de `created_at`
3. abrir Reader de nota
4. manter badge de ecos como contagem direta

Os cenarios fechados de ecos, `continue_note` e mencoes inline seguem como
material de canon absorvido, mas ainda nao como baseline entregue do repo.

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
- `app/day/[date].tsx` e fluxo do shell
  - `tests/integration/day/day-surface-same-day.test.tsx`
  - `tests/integration/day/ghost-navigation.test.tsx`
  - `tests/integration/day/day-surface-regression.test.tsx`
- auth flow
  - `tests/integration/auth/auth-session-flow.test.tsx`

## Critical User Journeys

- US1: entrar, restaurar sessao, proteger rota e sair com feedback correto
- US2: criar nota e tarefa same-day e ver a timeline coerente
- US3: projetar tarefa para outro dia, navegar pelo ghost e voltar pelo
  breadcrumb

Hoje esses journeys estao cobertos por testes de integracao em Jest/RTL. Ainda
nao existe suite E2E dedicada fora desse escopo.

## Canary Tests (Pre-Merge Gates)

- `corepack pnpm run doc:guard`
- `corepack pnpm run lint`
- `corepack pnpm run test`
- `corepack pnpm run typecheck`

## Recommended Test Patterns

- congele datas com `tests/support/mock-system-date.ts`
- prefira validar comportamento final da timeline, nao detalhes acidentais
- em regressao de ghost navigation, cubra origem, destino e retorno
- preserve a diferenca entre horario local exibido e timestamp persistido
- quando o problema envolver tap simples vs double tap, valide cancelamento de
  press pendente

## Traceability Notes

- US1 -> `tests/integration/auth/auth-session-flow.test.tsx`
- US2 -> `tests/integration/day/day-surface-same-day.test.tsx`
- US3 -> `tests/integration/day/ghost-navigation.test.tsx` e
  `tests/integration/day/day-surface-regression.test.tsx`

## Revision History

- 2026-04-26 - Especificacao de testes ampliada com casos canonicos de tarefa,
  nota e navegacao temporal
