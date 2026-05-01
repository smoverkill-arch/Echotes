# Test Specification

## Test Categories

- testes unitarios de utilitarios de data e validacao.
- testes unitarios de schemas e APIs de auth, nota e tarefa.
- testes unitarios de derivacao da timeline.
- testes unitarios de comportamento de toque e pending press.
- testes unitarios de contratos documentais do repo.
- testes de integracao para auth e rota protegida.
- testes de integracao para superficie diaria same-day.
- testes de integracao para navegacao temporal por ghost card.

## Coverage Rules

- Toda regressao temporal precisa de teste unitario ou de integracao.
- Toda mudanca em ghost navigation precisa cobrir origem, destino e retorno.
- Toda mudanca em auth precisa preservar bootstrap, restauracao e logout.
- Toda mudanca em schema precisa atualizar suite de schema e canon associado.
- Toda mudanca na camada visual precisa preservar `note -> direita` e `task_* -> esquerda`.
- Toda mudanca em gate documental precisa preservar o contrato do DocGuard.

## Mandatory Canonical Cases

### Tasks

1. Criar tarefa same-day sem horario.
2. Criar tarefa same-day com horario.
3. Criar tarefa projected sem horario.
4. Criar tarefa projected com horario.
5. Bloquear agendamento em data passada.
6. Bloquear `scheduled_at <= created_at`.
7. Navegar por ghost card.
8. Voltar pelo breadcrumb.

### Notes

1. Criar nota independente.
2. Posicionar nota pela hora intradiaria de `created_at`.
3. Abrir Reader de nota.
4. Manter badge de ecos como contagem direta quando a feature virar parte do corte.

Fluxos completos de eco, `continue_note` e mencoes inline seguem como canon absorvido.
Esses fluxos ainda nao pertencem ao baseline entregue.

## Suite Map

- `src/lib/env.ts` usa a suite de ambiente em `tests/unit/lib/`.
- `src/features/auth/api/*` usa suites em `tests/unit/auth/` e `tests/integration/auth/`.
- `src/features/tasks/api/*` usa suites em `tests/unit/tasks/` e `tests/integration/day/`.
- `src/features/notes/api/*` usa suites em `tests/unit/notes/`, `tests/unit/schemas/` e `tests/integration/day/`.
- `src/features/timeline/utils/*` usa suites em `tests/unit/timeline/`.
- `src/components/timeline/*` usa suites em `tests/unit/timeline/`.
- `src/features/day/hooks/*` usa suites em `tests/unit/day/`.
- `app/day/[date].tsx` usa suites em `tests/integration/day/`.
- `supabase/migrations/*` e `.docguard.json` usam a suite documental em `tests/unit/docs/`.

## Critical User Journeys

- US1 cobre entrar, restaurar sessao, proteger rota e sair.
- US2 cobre criar nota e tarefa same-day com timeline coerente.
- US3 cobre projetar tarefa, abrir destino e voltar ao contexto de origem.

Jest e React Native Testing Library cobrem esses journeys hoje.
O repo ainda nao possui suite E2E separada.

## Canary Tests

- `corepack pnpm run doc:guard`.
- `corepack pnpm run lint`.
- `corepack pnpm run test`.
- `corepack pnpm run typecheck`.

## Recommended Test Patterns

- Congele datas com `tests/support/mock-system-date.ts`.
- Valide comportamento final da timeline.
- Cubra origem, destino e retorno em ghost navigation.
- Preserve a diferenca entre horario local exibido e timestamp persistido.
- Em tap simples versus double tap, valide o cancelamento do press pendente.

## Traceability Notes

- US1 vive nas suites de auth em `tests/integration/auth/` e `tests/unit/auth/`.
- US2 vive nas suites same-day em `tests/integration/day/`, `tests/unit/schemas/` e `tests/unit/timeline/`.
- US3 vive nas suites de projected task em `tests/integration/day/` e `tests/unit/timeline/`.
- Gate documental vive em `tests/unit/docs/`.

## Revision History

- 2026-05-01 - Mapa de suites simplificado, contrato documental explicitado e referencias reformuladas para leitura estavel pelo guard.
- 2026-04-26 - Especificacao de testes ampliada com casos canonicos de tarefa, nota e navegacao temporal.
