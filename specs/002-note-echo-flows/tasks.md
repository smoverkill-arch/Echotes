# Tarefas: Fluxos de Eco de Nota

**Entrada**: Documentos de desenho em `/specs/002-note-echo-flows/`
**Pre-requisitos**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`
**Testes**: Obrigatorios nesta feature por envolver RLS/RPC, navegacao entre dias, separacao nota/tarefa, falhas recuperaveis e rastreabilidade DocGuard.

**Organizacao**: As tarefas estao agrupadas por historia do usuario para permitir implementacao e verificacao incremental. Cada historia deve continuar testavel de forma independente.

## Phase 1: Configuracao

**Objetivo**: Preparar fixtures e mocks de teste compartilhados antes das historias.

- [X] T001 Criar fixtures compartilhadas de notas e ecos em tests/support/note-echo-fixtures.ts
- [X] T002 [P] Adicionar helpers de mock Supabase para tabelas notes/note_echoes e rpc em tests/support/supabase-note-echo-mock.ts

**Nota de status**: T001 e T002 estao concluidas como support files. A verificacao comportamental desses helpers nao fecha aqui; ela permanece distribuida nos testes posteriores que importam as fixtures e exercitam insert, delete e rpc.

---

## Phase 2: Base

**Objetivo**: Infraestrutura central de tipos, schemas e servicos que bloqueia as historias.

**CRITICO**: Nenhum trabalho de historia deve comecar antes desta fase.

- [X] T004 Atualizar tipos de eco, nota relacionada, candidata e estado pendente de nota em src/types/note.ts
- [X] T005 Atualizar DayEntries e contratos de timeline sem adicionar side ao TimelineNode em src/types/timeline.ts
- [X] T006 [P] Atualizar schemas Zod de note_echoes, candidatas, notas relacionadas e entrada de continuacao em src/schemas/note.schema.ts
- [X] T007 [P] Criar utilitarios de relacao, contagem direta, par semantico e ordenacao em src/features/notes/utils/note-echo-relations.ts
- [X] T008 [P] Criar utilitario deterministico de generatedBrief em src/features/notes/utils/build-continue-note-brief.ts
- [X] T009 Criar APIs base de leitura de ecos e detalhes relacionados em src/features/notes/api/list-note-echoes.ts
- [X] T010 Criar API de listagem paginada de candidatas em src/features/notes/api/list-note-candidates.ts
- [X] T011 Criar API de criacao manual de eco em src/features/notes/api/create-note-echo.ts
- [X] T012 Criar API de remocao de eco em src/features/notes/api/delete-note-echo.ts
- [X] T014 Atualizar mocks de testes de integracao para suportar note_echoes, delete e rpc em tests/integration/day/day-surface-same-day.test.tsx

**Ponto de validacao**: Tipos, schemas, helpers e APIs base existem para que cada historia avance com testes proprios.

---

## Phase 3: Historia do Usuario 1 - Entender a continuidade de uma nota (Prioridade: P1) MVP

**Objetivo**: Exibir contagem direta de ecos na timeline, Reader com notas conectadas e navegacao para notas relacionadas.

**Teste independente**: Abrir um dia com notas conectadas, ver badge `Ecos`, abrir Reader, listar conexoes diretas e navegar para nota conectada do mesmo dia ou de outro dia.

### Testes da Historia do Usuario 1

- [ ] T015 [P] [US1] Adicionar testes unitarios de contagem direta, par invertido e ordenacao em tests/unit/notes/note-echo-relations.test.ts
- [ ] T016 [P] [US1] Adicionar teste de useDayEntries carregando note_echoes ligados as notas do dia em tests/unit/day/use-day-entries.test.tsx
- [ ] T017 [P] [US1] Adicionar teste de NoteCardReal exibindo badge Ecos somente quando directEchoCount > 0 em tests/unit/timeline/timeline-view.test.tsx
- [ ] T018 [P] [US1] Adicionar teste de Reader com notas conectadas, item indisponivel e recarregar em tests/unit/notes/note-reader-relations.test.tsx
- [ ] T019 [US1] Adicionar teste de integracao para abrir nota conectada de outro dia e reabrir Reader no destino em tests/integration/day/note-echo-navigation.test.tsx

### Implementacao da Historia do Usuario 1

- [ ] T020 [US1] Atualizar useDayEntries para carregar note_echoes relacionados as notas do dia em src/features/day/hooks/use-day-entries.ts
- [ ] T021 [US1] Atualizar useDayTimeline para derivar directEchoCount e dados relacionais sem alterar TimelineNode.side em src/features/day/hooks/use-day-timeline.ts
- [ ] T022 [US1] Atualizar NoteCardReal para receber e renderizar badge Ecos com contagem direta em src/components/cards/note-card-real.tsx
- [ ] T023 [US1] Atualizar TimelineView para repassar contagem direta para cards de nota em src/components/timeline/timeline-view.tsx
- [ ] T024 [US1] Atualizar NoteReader para exibir lista de notas conectadas, item indisponivel e acao de recarregar em src/components/reader/note-reader.tsx
- [ ] T025 [US1] Adicionar estado pendente de abertura de nota conectada em src/stores/navigation-store.ts
- [ ] T026 [US1] Integrar navegacao cross-day de nota conectada e reabertura do Reader em app/day/[date].tsx
- [ ] T027 [US1] Atualizar DayShell para passar dados e handlers relacionais ao Reader em src/components/day/day-shell.tsx

**Ponto de validacao**: US1 funciona sozinha com `corepack pnpm run test -- note-echo use-day-entries timeline-view note-echo-navigation`.

---

## Phase 4: Historia do Usuario 2 - Gerenciar ecos entre notas existentes (Prioridade: P2)

**Objetivo**: Criar eco manual, bloquear duplicidade com candidata desabilitada, paginar candidatas e remover eco com confirmacao.

**Teste independente**: Abrir uma nota, usar `Adicionar eco`, escolher candidata habilitada, ver a nova relacao, confirmar que candidata ja conectada fica desabilitada com `Eco ja existe`, carregar mais candidatas e remover a relacao apos confirmacao.

### Testes da Historia do Usuario 2

- [ ] T028 [P] [US2] Adicionar testes unitarios de listagem paginada e candidatas desabilitadas em tests/unit/notes/list-note-candidates.test.ts
- [ ] T029 [P] [US2] Adicionar testes unitarios de createNoteEcho para self-link, duplicidade invertida e preservacao de kind original em tests/unit/notes/create-note-echo.test.ts
- [ ] T030 [P] [US2] Adicionar testes unitarios de deleteNoteEcho para confirmacao e remocao sem apagar notas em tests/unit/notes/delete-note-echo.test.ts
- [ ] T031 [US2] Adicionar teste de integracao do fluxo Adicionar eco, carregar mais, Eco ja existe e Remover eco em tests/integration/day/note-echo-management.test.tsx

### Implementacao da Historia do Usuario 2

- [ ] T032 [US2] Implementar seletor de candidatas com lotes de 50, carregar mais e candidatos desabilitados em src/components/reader/note-echo-picker.tsx
- [ ] T033 [US2] Integrar acao Adicionar eco ao NoteReader em src/components/reader/note-reader.tsx
- [ ] T034 [US2] Implementar confirmacao de Remover eco no NoteReader em src/components/reader/note-reader.tsx
- [ ] T035 [US2] Integrar createNoteEcho, deleteNoteEcho, reload e feedback Eco ja existe em app/day/[date].tsx
- [ ] T036 [US2] Garantir que remocao de eco atualiza contagem e lista sem apagar notas em src/features/day/hooks/use-day-entries.ts

**Ponto de validacao**: US1 e US2 funcionam independentemente, sem duplicar pares e sem mudar o dominio de tarefas.

---

## Phase 5: Historia do Usuario 3 - Continuar desta nota em outro momento (Prioridade: P3)

**Objetivo**: Criar nova nota conectada por RPC atomica, com draft editavel, brief automatico e navegacao para o dia correto.

**Teste independente**: Abrir uma nota, acionar `Continuar desta nota`, revisar draft, salvar no mesmo dia e em dia futuro, confirmar Reader da nova nota e ausencia de nota orfa em falha da RPC.

### Pre-requisito tecnico da Historia do Usuario 3

- [ ] T041 [US3] Criar migration da RPC atomica continue_note em supabase/migrations/002_note_echo_flows.sql
- [ ] T013 [US3] Criar API de continuacao atomica via rpc em src/features/notes/api/continue-note.ts

### Testes da Historia do Usuario 3

- [ ] T037 [P] [US3] Adicionar testes unitarios de buildContinueNoteBrief em tests/unit/notes/build-continue-note-brief.test.ts
- [ ] T039 [P] [US3] Adicionar teste de contrato da migration RPC em tests/unit/docs/documentation-contracts.test.ts cobrindo existencia de supabase/migrations/002_note_echo_flows.sql, public.continue_note, security definer, auth.uid(), inserts em public.notes e public.note_echoes, kind = 'continue_note', rollback e ausencia de service_role
- [ ] T038 [P] [US3] Adicionar testes unitarios de continueNote rpc sucesso/falha sem nota orfa em tests/unit/notes/continue-note.test.ts, com casos separados para mesmo dia e dia futuro cobrindo payload `new_note_day`, persistencia em `notes.day`, `context_day = selectedDay`, rollback e ausencia de `source_day`, `target_day`, `scheduled_at` ou campos de tarefa
- [ ] T040 [US3] Adicionar teste de integracao para Continuar desta nota no mesmo dia e em dia futuro em tests/integration/day/continue-note-flow.test.tsx, com assercoes separadas para: mesmo dia sem navegacao, dia futuro navegando para `/day/[newNoteDay]`, `routeDay`, payload da RPC, `notes.day`, `context_day` como proveniencia e nao rota, Reader aberto apenas depois de `note.day` conferir, consumo unico de `pendingReaderOpen` e ausencia de campos temporais de tarefa

### Implementacao da Historia do Usuario 3

- [ ] T042 [US3] Implementar formulario/modal de continuacao com `newNoteDay` editavel e generatedBrief em src/components/forms/continue-note-editor.tsx, evitando vocabulario `targetDay`/`target_day` na UI e no estado de nota
- [ ] T043 [US3] Integrar acao Continuar desta nota ao NoteReader em src/components/reader/note-reader.tsx
- [ ] T044 [US3] Integrar fluxo de continuacao, rpc, reload, `pendingReaderOpen` de consumo unico e navegacao ao `newNoteDay` em app/day/[date].tsx, limpando pendencia em sucesso, falha, logout, cancelamento e navegacao manual
- [ ] T045 [US3] Garantir que notas continuadas nao criam ghost card, `source_day`, `target_day`, `scheduled_at` ou qualquer estado/campo de tarefa em src/features/timeline/utils/derive-timeline-nodes.ts

**Ponto de validacao**: Todas as historias funcionam com persistencia atomica de continuacao e sem estado parcial visivel.

---

## Phase 6: Polimento e Itens Transversais

**Objetivo**: Fechar rastreabilidade, documentacao canonica e gates.

- [ ] T046 [P] Atualizar @req dos novos testes para tags feature-scoped `@req 002-note-echo-flows:FR-001`..`@req 002-note-echo-flows:FR-024` e `@req 002-note-echo-flows:SC-001`..`@req 002-note-echo-flows:SC-006` nos arquivos novos em tests/unit/ e tests/integration/day/; tags legadas sem feature id, incluindo 001, nao contam para este gate
- [ ] T047 [P] Atualizar canon vigente da raiz quando o comportamento da feature estiver implementado: README.md, CURRENT-STATE.md, ROADMAP.md, DATA-MODEL.md, ARCHITECTURE.md, REQUIREMENTS.md, TEST-SPEC.md e SECURITY.md quando RLS/RPC for afetado; docs-canonical/* pode ser atualizado apenas como espelho historico/adicional, nunca como autoridade substituta
- [ ] T048 Atualizar CHANGELOG.md com a feature 002-note-echo-flows
- [ ] T049 Revisar DRIFT-LOG.md e CANON-MIGRATION-COVERAGE.md se houver desalinhamento temporario ou absorcao de acervo historico
- [ ] T050 Executar corepack pnpm run lint conforme scripts em package.json
- [ ] T051 Executar corepack pnpm run test conforme scripts em package.json
- [ ] T052 Executar corepack pnpm run typecheck conforme scripts em package.json
- [ ] T053 Executar corepack pnpm run doc:guard conforme scripts em package.json
- [ ] T054 Executar corepack pnpm run doc:score conforme scripts em package.json
- [ ] T055 Registrar bloco de evidencia concreta de fechamento no resumo da PR/entrega: paths de canon da raiz alterados, resultado da revisao de DRIFT-LOG.md e CANON-MIGRATION-COVERAGE.md, comandos exatos e outputs de lint/test/typecheck/doc:guard/doc:score, evidencia da migration/RPC aplicada ou contratualmente verificada, e confirmacao de que DocGuard PASS foi necessario mas nao usado como prova unica de alinhamento semantico

---

## Tech Debt Tasks (Generated by /speckit.cleanup)

**Generated**: 2026-05-06
**Source**: Post-implementation cleanup of `002-note-echo-flows` Phase 2 Base
**Priority**: Address before starting US1/T015+

### Detected Issues

- [X] TD001 Fix `deleteNoteEcho` in src/features/notes/api/delete-note-echo.ts so delete by `echoId` is constrained by the selected semantic pair before any destructive operation
- [X] TD002 Add explicit Supabase configuration and session preflight to read APIs in src/features/notes/api/list-note-echoes.ts and src/features/notes/api/list-note-candidates.ts, matching the `create-note.ts` pattern
- [X] TD003 Fix the note echo delete mock in tests/integration/day/day-surface-same-day.test.tsx so OR pair filters match exact semantic pairs and preserve adjacent relations such as A-B and A-C
- [X] TD004 Add Phase 2 Base coverage for new schemas, relation utilities, generated brief utility, read APIs, create idempotency, delete reconciliation, invalid payloads and unavailable related notes
- [X] TD005 Wire tests/integration/day/day-surface-same-day.test.tsx to the shared tests/support/supabase-note-echo-mock.ts helper, or explicitly reclassify T014 as not closed

---

## Dependencias e Ordem de Execucao

### Dependencias entre fases

- Fase 1 nao tem dependencias.
- Fase 2 depende da Fase 1 e bloqueia todas as historias.
- US1 depende da Fase 2 e e o MVP recomendado.
- US2 depende da Fase 2 e fica mais simples apos US1, porque reutiliza Reader, contagem e reload.
- US3 depende da Fase 2 e pode avancar em paralelo com US2 depois que a navegacao de nota da US1 estiver estavel.
- Polimento depende das historias escolhidas para entrega.

### Dependencias internas principais

- T020 depende de T004, T006, T007 e T009.
- T024 depende de T007, T009 e T018.
- T026 depende de T025 e T019.
- T032 depende de T010 e T028.
- T035 depende de T011, T012 e T031.
- T041 deve preceder T013, T039, T038 e T044.
- T039 roda depois de T041 para verificar a migration existente, antes dos testes de API que dependem da RPC.
- T044 depende de T013, T042 e T043.

## Oportunidades de Paralelismo

- Fase 1: T002 pode rodar depois de T001.
- Fase 2: T006, T007 e T008 podem rodar em paralelo depois de T004 e T005.
- US1: T015, T016, T017 e T018 podem rodar em paralelo antes da implementacao.
- US2: T028, T029 e T030 podem rodar em paralelo antes da integracao T031.
- US3: T037 pode rodar antes de T041; T041 precede T013; T039 roda depois de T041; T038 e T040 rodam depois da cobertura da migration quando seus demais pre-requisitos estiverem prontos.
- Polimento: T046 e T047 podem rodar em paralelo antes dos gates T050..T055.

## Estrategia de Implementacao

### MVP primeiro

1. Concluir Fases 1 e 2.
2. Implementar US1 ate o checkpoint independente.
3. Rodar testes focados de US1 e `corepack pnpm run doc:guard`.

### Entrega incremental

1. Adicionar US2 para criacao/remocao manual de ecos.
2. Adicionar US3 com RPC atomica.
3. Fechar polimento, canon da raiz, CHANGELOG, revisoes de drift/migracao e bloco de evidencia concreta.

## Resumo

- Total de tarefas: 54
- US1: 13 tarefas
- US2: 9 tarefas
- US3: 10 tarefas
- Setup/Base/Polimento: 22 tarefas
- MVP sugerido: Fases 1-3, entregando continuidade visivel com Reader e navegacao entre notas conectadas.
