# Tarefas: Fluxos de Eco de Nota

**Entrada**: Documentos de desenho em `/specs/002-note-echo-flows/`
**Pre-requisitos**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`
**Testes**: Obrigatorios nesta feature por envolver RLS/RPC, navegacao entre dias, separacao nota/tarefa, falhas recuperaveis e rastreabilidade DocGuard.

**Organizacao**: As tarefas estao agrupadas por historia do usuario para permitir implementacao e verificacao incremental. Cada historia deve continuar testavel de forma independente.

## Phase 1: Configuracao

**Objetivo**: Preparar fixtures e contratos de teste compartilhados antes das historias.

- [ ] T001 Criar fixtures compartilhadas de notas e ecos em tests/support/note-echo-fixtures.ts
- [ ] T002 [P] Adicionar helpers de mock Supabase para tabelas notes/note_echoes e rpc em tests/support/supabase-note-echo-mock.ts
- [ ] T003 [P] Adicionar cobertura documental da migration 002 e da RPC atomica em tests/unit/docs/documentation-contracts.test.ts

---

## Phase 2: Base

**Objetivo**: Infraestrutura central de tipos, schemas e servicos que bloqueia as historias.

**CRITICO**: Nenhum trabalho de historia deve comecar antes desta fase.

- [ ] T004 Atualizar tipos de eco, nota relacionada, candidata e estado pendente de nota em src/types/note.ts
- [ ] T005 Atualizar DayEntries e contratos de timeline sem adicionar side ao TimelineNode em src/types/timeline.ts
- [ ] T006 [P] Atualizar schemas Zod de note_echoes, candidatas, notas relacionadas e entrada de continuacao em src/schemas/note.schema.ts
- [ ] T007 [P] Criar utilitarios de relacao, contagem direta, par semantico e ordenacao em src/features/notes/utils/note-echo-relations.ts
- [ ] T008 [P] Criar utilitario deterministico de generatedBrief em src/features/notes/utils/build-continue-note-brief.ts
- [ ] T009 Criar APIs base de leitura de ecos e detalhes relacionados em src/features/notes/api/list-note-echoes.ts
- [ ] T010 Criar API de listagem paginada de candidatas em src/features/notes/api/list-note-candidates.ts
- [ ] T011 Criar API de criacao manual de eco em src/features/notes/api/create-note-echo.ts
- [ ] T012 Criar API de remocao de eco em src/features/notes/api/delete-note-echo.ts
- [ ] T013 Criar API de continuacao atomica via rpc em src/features/notes/api/continue-note.ts
- [ ] T014 Atualizar mocks de testes de integracao para suportar note_echoes, delete e rpc em tests/integration/day/day-surface-same-day.test.tsx

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

### Testes da Historia do Usuario 3

- [ ] T037 [P] [US3] Adicionar testes unitarios de buildContinueNoteBrief em tests/unit/notes/build-continue-note-brief.test.ts
- [ ] T038 [P] [US3] Adicionar testes unitarios de continueNote rpc sucesso/falha sem nota orfa em tests/unit/notes/continue-note.test.ts
- [ ] T039 [P] [US3] Adicionar teste de contrato da migration RPC em tests/unit/docs/documentation-contracts.test.ts
- [ ] T040 [US3] Adicionar teste de integracao para Continuar desta nota no mesmo dia e em dia futuro em tests/integration/day/continue-note-flow.test.tsx

### Implementacao da Historia do Usuario 3

- [ ] T041 [US3] Criar migration da RPC atomica continue_note em supabase/migrations/002_note_echo_flows.sql
- [ ] T042 [US3] Implementar formulario/modal de continuacao com targetDay editavel e generatedBrief em src/components/forms/continue-note-editor.tsx
- [ ] T043 [US3] Integrar acao Continuar desta nota ao NoteReader em src/components/reader/note-reader.tsx
- [ ] T044 [US3] Integrar fluxo de continuacao, rpc, reload e navegacao ao dia destino em app/day/[date].tsx
- [ ] T045 [US3] Garantir que notas continuadas nao criam ghost card, source_day ou target_day em src/features/timeline/utils/derive-timeline-nodes.ts

**Ponto de validacao**: Todas as historias funcionam com persistencia atomica de continuacao e sem estado parcial visivel.

---

## Phase 6: Polimento e Itens Transversais

**Objetivo**: Fechar rastreabilidade, documentacao canonica e gates.

- [ ] T046 [P] Atualizar @req dos novos testes para FR-001..FR-024 e SC-001..SC-006 nos arquivos em tests/unit/ e tests/integration/day/
- [ ] T047 [P] Atualizar README.md, CURRENT-STATE.md, ROADMAP.md, docs-canonical/DATA-MODEL.md, docs-canonical/ARCHITECTURE.md, docs-canonical/REQUIREMENTS.md e docs-canonical/TEST-SPEC.md quando o comportamento da feature estiver implementado
- [ ] T048 Atualizar CHANGELOG.md com a feature 002-note-echo-flows
- [ ] T049 Revisar DRIFT-LOG.md e CANON-MIGRATION-COVERAGE.md se houver desalinhamento temporario ou absorcao de acervo historico
- [ ] T050 Executar corepack pnpm run lint conforme scripts em package.json
- [ ] T051 Executar corepack pnpm run test conforme scripts em package.json
- [ ] T052 Executar corepack pnpm run typecheck conforme scripts em package.json
- [ ] T053 Executar corepack pnpm run doc:guard conforme scripts em package.json
- [ ] T054 Executar corepack pnpm run doc:score conforme scripts em package.json

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
- T041 deve preceder T013, T038 e T044.
- T044 depende de T013, T042 e T043.

## Oportunidades de Paralelismo

- Fase 1: T002 e T003 podem rodar em paralelo.
- Fase 2: T006, T007 e T008 podem rodar em paralelo depois de T004 e T005.
- US1: T015, T016, T017 e T018 podem rodar em paralelo antes da implementacao.
- US2: T028, T029 e T030 podem rodar em paralelo antes da integracao T031.
- US3: T037, T038 e T039 podem rodar em paralelo depois de T041.
- Polimento: T046 e T047 podem rodar em paralelo antes dos gates T050..T054.

## Estrategia de Implementacao

### MVP primeiro

1. Concluir Fases 1 e 2.
2. Implementar US1 ate o checkpoint independente.
3. Rodar testes focados de US1 e `corepack pnpm run doc:guard`.

### Entrega incremental

1. Adicionar US2 para criacao/remocao manual de ecos.
2. Adicionar US3 com RPC atomica.
3. Fechar polimento, canon, CHANGELOG e gates completos.

## Resumo

- Total de tarefas: 54
- US1: 13 tarefas
- US2: 9 tarefas
- US3: 9 tarefas
- Setup/Base/Polimento: 23 tarefas
- MVP sugerido: Fases 1-3, entregando continuidade visivel com Reader e navegacao entre notas conectadas.
