# Requirements

## Functional Requirements

- `FR-001` O usuario deve poder criar conta e entrar com email e senha usando
  Supabase Auth.
- `FR-002` O app deve restaurar sessao local valida e proteger a rota diaria.
- `FR-003` O usuario autenticado deve acessar a superficie diaria por
  `/day/[date]`.
- `FR-004` O usuario deve poder criar, ler e editar notas do dia selecionado.
- `FR-005` O usuario deve poder criar, ler e editar tarefas do dia com ou sem
  horario.
- `FR-006` Tarefas projected devem manter `source_day` e `target_day`,
  renderizar ghost na origem e item real no destino.
- `FR-007` A navegacao temporal deve abrir o destino com breadcrumb de retorno
  ao contexto original.
- `FR-008` A timeline deve ser derivada a partir de notas e tarefas validadas
  pelo contrato local.

## Non-Functional Requirements

- `NFR-001` O cliente deve usar apenas variaveis publicas do Supabase.
- `NFR-002` O banco deve aplicar RLS por ownership nas tabelas do baseline.
- `NFR-003` O contrato local deve validar ambiente, notas e tarefas com Zod.
- `NFR-004` O baseline deve manter regressao automatizada para auth, same-day,
  projected tasks e derivacao da timeline.
- `NFR-005` O canon soberano do repositorio deve permanecer consistente com o
  estado do codigo e dos testes.

## Success Criteria

- `SC-001` Usuario sem sessao valida nao acessa a superficie protegida.
- `SC-002` Usuario autenticado consegue abrir o dia selecionado e manter a
  sessao local.
- `SC-003` Criar nota e tarefa same-day atualiza a superficie diaria sem quebrar
  a ordenacao da timeline.
- `SC-004` Projetar tarefa para outro dia mantem ghost na origem, item real no
  destino e breadcrumb de retorno.
- `SC-005` `doc:guard`, `lint`, `test` e `typecheck` devem ser o gate minimo de
  merge.

## User Scenarios

### User Story 1 - Entrar e acessar o dia (Priority: P1)

Como usuario, quero entrar e restaurar minha sessao para abrir o meu dia sem
expor a superficie protegida quando a sessao for invalida.

### User Story 2 - Registrar o dia com nota e tarefa (Priority: P2)

Como usuario autenticado, quero criar nota e tarefa no mesmo dia para registrar
o que fiz e o que preciso fazer sem sair da superficie diaria.

### User Story 3 - Projetar tarefa para outro dia e navegar com contexto (Priority: P3)

Como usuario, quero projetar uma tarefa para outro dia, navegar ao destino e
voltar ao ponto de origem para manter contexto temporal.

## Traceability Matrix

| Requirement | Code | Tests |
|-------------|------|-------|
| `FR-001`, `FR-002`, `FR-003` | `app/index.tsx`, `app/(auth)/*`, `app/day/[date].tsx`, `src/features/auth/*` | `tests/integration/auth/auth-session-flow.test.tsx` |
| `FR-004` | `src/features/notes/*`, `src/components/forms/note-editor.tsx`, `src/components/reader/note-reader.tsx` | `tests/integration/day/day-surface-same-day.test.tsx`, `tests/unit/notes/update-note.test.ts` |
| `FR-005` | `src/features/tasks/*`, `src/components/forms/task-editor.tsx`, `src/components/reader/task-reader.tsx` | `tests/integration/day/day-surface-same-day.test.tsx`, `tests/unit/tasks/task-temporal-validation.test.ts`, `tests/unit/schemas/task.schema.test.ts` |
| `FR-006`, `FR-007` | `src/features/timeline/utils/derive-timeline-nodes.ts`, `src/stores/navigation-store.ts`, `src/components/day/breadcrumb-bar.tsx` | `tests/integration/day/ghost-navigation.test.tsx`, `tests/integration/day/day-surface-regression.test.tsx`, `tests/unit/timeline/projected-task-nodes.test.ts` |
| `FR-008` | `src/features/day/hooks/use-day-entries.ts`, `src/features/day/hooks/use-day-timeline.ts`, `src/components/timeline/timeline-view.tsx` | `tests/unit/day/use-day-entries.test.tsx`, `tests/unit/timeline/*`, `tests/integration/day/day-surface-regression.test.tsx` |

## Revision History

- 2026-04-25 - Canon consolidado na raiz apos o fechamento de
  `001-auth-day-surface`
