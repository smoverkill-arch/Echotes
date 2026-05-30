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
- testes unitarios e de integracao para `002-note-echo-flows`.

## Coverage Rules

- Toda regressao temporal precisa de teste unitario ou de integracao.
- Toda mudanca em ghost navigation precisa cobrir origem, destino e retorno.
- Toda mudanca em auth precisa preservar bootstrap, restauracao e logout.
- Toda mudanca em schema precisa atualizar suite de schema e canon associado.
- Toda mudanca na camada visual precisa preservar `note -> direita` e `task_* -> esquerda`.
- Toda mudanca em Ajustes de aparencia precisa provar que preferencias locais
  mudam tema/destaque/densidade sem afetar fluxos do dia.
- Toda mudanca em gate documental precisa preservar o contrato do DocGuard.

## Mandatory Canonical Cases

### Appearance

1. Alternar modo claro/escuro.
2. Selecionar cor de destaque.
3. Selecionar densidade da timeline.
4. Fechar Ajustes sem acionar criacao, Reader, Editor ou navegacao temporal.

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
4. Manter badge de ecos como contagem direta.
5. Listar notas conectadas no Reader.
6. Criar eco manual sem duplicar par semantico.
7. Remover eco com confirmacao.
8. Continuar nota criando nova nota e eco `continue_note` atomicamente.

Mencoes inline com `@nota` seguem fora do corte entregue.

## Suite Map

- `src/lib/env.ts` usa a suite de ambiente em `tests/unit/lib/`.
- `src/features/auth/api/*` usa suites em `tests/unit/auth/` e `tests/integration/auth/`.
- `src/features/tasks/api/*` usa suites em `tests/unit/tasks/` e `tests/integration/day/`.
- `src/features/notes/api/*` usa suites em `tests/unit/notes/`, `tests/unit/schemas/` e `tests/integration/day/`.
- `src/features/timeline/utils/*` usa suites em `tests/unit/timeline/`.
- `src/components/timeline/*` usa suites em `tests/unit/timeline/`.
- `src/features/day/hooks/*` usa suites em `tests/unit/day/`.
- `src/stores/appearance-store.ts` e `src/components/day/settings-sheet.tsx`
  usam `tests/unit/day/settings-sheet.test.tsx`.
- `app/day/[date].tsx` usa suites em `tests/integration/day/`.
- `supabase/migrations/*` e `.docguard.json` usam a suite documental em `tests/unit/docs/`.
- `002-note-echo-flows` usa `@req 002-note-echo-flows:*` nas suites criadas
  ou modificadas pela feature.

## Critical User Journeys

- US1 cobre entrar, restaurar sessao, proteger rota e sair.
- US2 cobre criar nota e tarefa same-day com timeline coerente.
- US3 cobre projetar tarefa, abrir destino e voltar ao contexto de origem.
- `002-note-echo-flows` cobre Reader de notas conectadas, adicionamento manual,
  remocao confirmada e continuacao de nota.
- Ajustes de aparencia cobrem modo, destaque e densidade como estado local de
  UI, sem substituir as jornadas principais.
- A verificacao visual do Design v2 deve conferir header/calendario como bloco
  unico, bottom bar edge-to-edge, sheets sem containers aninhados e fontes
  carregadas pelo root Expo antes de declarar a branch pronta.

Jest e React Native Testing Library cobrem esses journeys hoje.
O repo ainda nao possui suite E2E separada.

## Canary Tests

- `corepack pnpm run doc:guard`.
- `corepack pnpm run lint`.
- `corepack pnpm run test`.
- `corepack pnpm run typecheck`.
- `corepack pnpm run doc:score` como relatorio de maturidade documental, sem
  substituir `doc:guard`.

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
- `002-note-echo-flows` vive nas suites `tests/unit/notes/`,
  `tests/unit/day/use-day-entries.test.tsx`,
  `tests/unit/timeline/timeline-view.test.tsx`,
  `tests/unit/timeline/derive-timeline-nodes-regression.test.ts`,
  `tests/unit/docs/documentation-contracts.test.ts`,
  `tests/integration/day/note-echo-navigation.test.tsx`,
  `tests/integration/day/note-echo-management.test.tsx` e
  `tests/integration/day/continue-note-flow.test.tsx`.
- Gate documental vive em `tests/unit/docs/`.

## Revision History

- 2026-05-27 - Casos de Ajustes de aparencia e mapa de suite registrados.
- 2026-05-11 - `002-note-echo-flows` registrado no mapa de suites, tags
  `@req` e gates de fechamento da Phase 6.
- 2026-05-01 - Mapa de suites simplificado, contrato documental explicitado e referencias reformuladas para leitura estavel pelo guard.
- 2026-04-26 - Especificacao de testes ampliada com casos canonicos de tarefa, nota e navegacao temporal.
