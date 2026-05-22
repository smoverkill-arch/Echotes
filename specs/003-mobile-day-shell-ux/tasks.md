# Tarefas: Upgrade Mobile da Superficie do Dia

**Entrada**: `specs/003-mobile-day-shell-ux/spec.md`, `plan.md`, `quickstart.md`
**Pre-requisitos**: WIP da `002-note-echo-flows` herdado e preservado

## Phase 1: Setup e Governanca

- [x] T001 Criar `specs/003-mobile-day-shell-ux/ux-upgrade-plan.md`
- [x] T002 Criar `specs/003-mobile-day-shell-ux/spec.md`
- [x] T003 Criar `specs/003-mobile-day-shell-ux/quickstart.md`
- [x] T004 Atualizar `.specify/feature.json` para `specs/003-mobile-day-shell-ux`
- [x] T005 Documentar `src/theme/` em `docs-canonical/ARCHITECTURE.md`
- [x] T006 Atualizar `CHANGELOG.md` com a feature 003

## Phase 2: Base Visual e Temporal

- [x] T007 [P] Criar tokens compartilhados em `src/theme/tokens.ts`
- [x] T008 [P] Expandir helpers de data em `src/utils/date.ts`
- [x] T009 Expandir `src/stores/calendar-store.ts` com `calendarMode`

## Phase 3: US1 - Navegar entre dias sem ficar ilhado

- [x] T010 [US1] Implementar strip semanal em `src/components/day/day-header.tsx`
- [x] T011 [US1] Implementar semana anterior/proxima em `src/components/day/day-header.tsx`
- [x] T012 [US1] Implementar botao `Hoje` em `src/components/day/day-header.tsx`
- [x] T013 [US1] Integrar mudanca de data em `app/day/[date].tsx`
- [x] T014 [US1] Cobrir shell semanal em `tests/unit/day/day-header-calendar.test.tsx`

## Phase 4: US2 - Entender o dia como superficie de trabalho

- [x] T015 [US2] Manter tabs como lentes do dia em `src/components/day/day-header.tsx`
- [x] T016 [US2] Cobrir que tabs nao disparam mudanca de data em `tests/unit/day/day-header-calendar.test.tsx`

## Phase 5: US3 - Usar Reader e ecos sem confusao

- [x] T017 [US3] Reorganizar hierarquia de acoes em `src/components/reader/note-reader.tsx`
- [x] T018 [US3] Mostrar chip mesmo dia/outro dia/indisponivel em `src/components/reader/note-reader.tsx`
- [x] T019 [US3] Cobrir Reader reorganizado em `tests/unit/notes/note-reader-relations.test.tsx`

## Phase 6: US4 - Aparencia de app mobile real

- [x] T020 [US4] Aplicar tokens no Reader de nota em `src/components/reader/note-reader.tsx`
- [x] T021 [US4] Revisar touch targets e estados pressed/disabled dos controles tocados

## Phase 7: US5 - Smoke S21

- [x] T022 [US5] Registrar roteiro em `specs/003-mobile-day-shell-ux/quickstart.md`
- [x] T023 [US5] Atualizar roteiro apos validar Reader reorganizado

## Phase 8: Verificacao

- [x] T024 Rodar teste focado do calendario
- [x] T025 Rodar `corepack pnpm run lint`
- [x] T026 Rodar `corepack pnpm run typecheck`
- [x] T027 Rodar `corepack pnpm run test`
- [x] T028 Rodar `corepack pnpm run doc:guard`

## Phase 9: Fluxos Abertos pelo Reader

- [x] T029 [US3] Reorganizar `NoteEchoPicker` como sheet mobile com origem,
  contexto de dia, estados de erro/vazio e rodape de paginacao
- [x] T030 [US3] Reorganizar `ContinueNoteEditor` como fluxo guiado com origem,
  controles de dia anterior/proximo/hoje e aviso de data anterior
- [x] T031 [US3] Cobrir picker e continuacao em
  `tests/unit/notes/note-echo-picker.test.tsx` e
  `tests/unit/notes/continue-note-editor.test.tsx`
- [x] T032 [US5] Atualizar `quickstart.md`, `CHANGELOG.md` e canon de
  arquitetura para o smoke dos fluxos acionados pelo Reader

## Phase 10: Criacao, Edicao e Reader de Tarefa

- [x] T033 [US4] Reorganizar `TimelinePlusButton` como sheet de criacao com
  tokens, pressed/disabled states e touch targets minimos
- [x] T034 [US4] Reorganizar `NoteEditor` como sheet mobile com chip de dia,
  feedback de erro e CTA primario
- [x] T035 [US4] Reorganizar `TaskEditor` como fluxo guiado com origem,
  controles de dia anterior/proximo/hoje e feedback de erro
- [x] T036 [US4] Reorganizar `TaskReader` como sheet mobile com chips de
  status, origem, destino, horario e contexto de ghost card
- [x] T037 [US4] Cobrir menu `+`, editor de nota, editor de tarefa e reader de
  tarefa em testes unitarios focados
- [x] T038 [US5] Atualizar `quickstart.md`, `CHANGELOG.md` e canon de
  arquitetura para o smoke dos fluxos de criacao/edicao

## Phase 11: Correcoes do Smoke S21

- [x] T039 [US4] Truncar cards de nota na timeline e aba Notas para preview de
  duas linhas, mantendo leitura completa apenas no Reader
- [x] T040 [US3] Adicionar `Eco inicial` ao fluxo de criacao de nota, criando
  nota primeiro e eco manual em seguida com feedback quando apenas o eco falhar
- [x] T041 [US3] Separar visualmente conteudo da nota e secao `Ecos` no Reader
- [x] T042 [US4] Mover tabs para bottom bar persistente com icones e manter
  `testID`s `day-tab-*`
- [x] T043 [US1] Trocar seletor mensal modal por calendario mensal inline
  expandivel/recolhivel no header
- [x] T044 [US4] Colapsar header/calendario e botao `+` durante scroll vertical
  da timeline/listas e restaurar ao repouso
- [x] T045 [US5] Expandir cobertura unit/integracao e atualizar
  `quickstart.md`, `CHANGELOG.md` e canon de arquitetura para o novo smoke S21

## Dependencias

- Fase 2 bloqueia Fases 3 e 4.
- Fase 5 depende da feature `002-note-echo-flows` ja expor dados de relacao no Reader.
- Fase 8 deve ser repetida apos cada lote de implementacao, inclusive apos a
  Fase 9, a Fase 10 e a Fase 11.
