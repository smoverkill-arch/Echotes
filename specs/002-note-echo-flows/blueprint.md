# Blueprint: Fluxos de Eco de Nota

**Branch**: `002-note-echo-flows` | **Date**: 2026-05-05
**Mode**: doc-only
**Feature Tasks**: 54 | **Tech Debt Tasks**: TD001-TD038

Este blueprint traduz `spec.md`, `plan.md`, `data-model.md`, `contracts/` e
`tasks.md` em uma ordem de implementacao auditavel antes de rodar
`/speckit.implement`. Ele preserva o canon vigente: dia como superficie
soberana, ecos exclusivos de notas, ghost card exclusivo de tarefas, sem
`side` em `TimelineNode` e sem `service_role` no cliente.

## Key Decisions

- `Continuar desta nota` usa RPC atomica para criar nota e eco na mesma
  transacao, impedindo nota orfa e sucesso parcial -> T013, T038, T041, T044.
- Phase 1 e Phase 2 Base ja foram implementadas e auditadas ate T014; antes de
  iniciar US1/T015+, a fila de tech debt deve permanecer como gate explicito.
- O dia passa a carregar `note_echoes` ligados as notas do recorte e a timeline
  exibe apenas contagem direta, sem grafo nem mapa -> T005, T007, T016, T020,
  T021, T022, T023.
- O Reader concentra relacoes de nota, item indisponivel recuperavel,
  navegacao cross-day e acoes `Adicionar eco`, `Remover eco` e
  `Continuar desta nota` -> T018, T024, T025, T026, T027, T033, T034, T043.
- `Adicionar eco` usa candidatas recentes paginadas em lotes de 50, com notas
  ja conectadas visiveis e desabilitadas por `Eco ja existe` -> T010, T028,
  T032, T035.
- Duplicidade invertida preserva uma unica relacao semantica e o `kind`
  original como proveniencia inicial -> T007, T011, T015, T029.
- Remocao de eco exige confirmacao, apaga apenas a relacao selecionada e
  recarrega o estado do dia -> T012, T030, T031, T034, T036.
- A feature fecha com canon, changelog, rastreabilidade de testes e gates de
  DocGuard, lint, test e typecheck -> T046, T047, T048, T049, T050, T051,
  T052, T053, T054.
- O fechamento exige bloco de evidencia concreta alem de DocGuard PASS: paths de
  canon da raiz, revisao de drift/migracao, comandos exatos e evidencia da
  migration/RPC -> T055.

## Implementation Order

```text
Phase 1: T001 -> T002
Phase 2: T004, T005 -> T006, T007, T008 -> T009 -> T010 -> T011 -> T012 -> T014
Tech debt gate before US1: TD001..TD038 completed
US1 tests: T015, T016, T017, T018 -> T019
US1 implementation: T020 -> T021 -> T022 -> T023 -> T024 -> T025 -> T026 -> T027
US2 tests: T028, T029, T030 -> T031
US2 implementation: T032 -> T033 -> T034 -> T035 -> T036
US3 prereq/API: T041 -> T013
US3 tests: T037 -> T039 -> T038/T040
US3 implementation: T042 -> T043 -> T044 -> T045
Polimento: T046, T047 -> T048 -> T049 -> T050 -> T051 -> T052 -> T053 -> T054 -> T055
```

---

## Phase 1: Configuracao

### T001: Criar fixtures compartilhadas de notas e ecos

**File**: `tests/support/note-echo-fixtures.ts` (new)

**Requirements**:

FR-002, FR-003, FR-005, FR-008, FR-021, FR-022, FR-023.

**Dependencies**:

Nenhuma.

**Implementation**:

Criar builders deterministicas para `Note`, `NoteEcho`, candidata e nota
relacionada. Usar UUIDs fixos, dias `2026-05-01` e `2026-05-02`, usuario
`f3b86608-11f6-4df4-b902-3bc0b1d5b8bc`, e helpers `buildNote`,
`buildNoteEcho`, `buildConnectedPair`, `buildCandidatePage`. Exportar dados
para par invertido, nota indisponivel, candidato ja conectado e lote com 51
notas.

**Verification**:

Support file ja concluido. A verificacao comportamental permanece nos testes
posteriores que importam este helper; no minimo, confirmar em suite posterior
que `buildNoteEcho` nunca retorna `from_note_id` igual a `to_note_id`.

---

### T002: Adicionar helpers de mock Supabase para notes, note_echoes e rpc

**File**: `tests/support/supabase-note-echo-mock.ts` (new)

**Requirements**:

FR-006, FR-008, FR-016, FR-020.

**Dependencies**:

T001.

**Implementation**:

Criar um mock chainable compatavel com os usos existentes de Supabase no repo:
`from(table).select().eq().in().order().range()`, `insert().select().single()`,
`delete().eq()`, `rpc(name, payload)`. O helper deve permitir registrar
respostas por tabela, coluna e chamada RPC, alem de capturar payloads para
assertions. Manter mensagens de erro como `Error` reais para os testes
validarem feedback orientativo.

**Verification**:

Support file ja concluido. A verificacao comportamental permanece nos testes
posteriores; `create-note-echo.test.ts` e `continue-note.test.ts` devem provar
insert, delete e rpc usando este helper.

---

## Phase 2: Base

### T004: Atualizar tipos de eco, nota relacionada, candidata e continuacao

**File**: `src/types/note.ts` (modify)

**Requirements**:

FR-004, FR-010, FR-014, FR-021, FR-022, FR-023.

**Dependencies**:

T001.

**Implementation**:

Manter `NoteEcho` existente e acrescentar `DirectEchoSummary`,
`RelatedNoteStatus`, `RelatedNote`, `NoteEchoCandidate`,
`NoteCandidatePage`, `ContinueNoteDraft`, `ContinueNoteRpcInput` e
`ContinueNoteResult`. `RelatedNote` deve suportar `available` e `unavailable`
sem expor subtipo visual de `kind`. `ContinueNoteInput` deve incluir `title`,
`content` e `generatedBrief`, todos validados pelo schema em T006.

**Verification**:

Concluido. Validado por suites unitarias de schemas/API e `corepack pnpm run
typecheck` nos passes de Phase 2/tech debt.

---

### T005: Atualizar DayEntries e contratos de timeline sem adicionar side

**File**: `src/types/timeline.ts` (modify)

**Requirements**:

FR-001, FR-002, FR-003, FR-018.

**Dependencies**:

T004.

**Implementation**:

Adicionar `directEchoCount?: number` e `relatedNoteIds?: string[]` apenas como
metadados de `TimelineNode` ou em tipo auxiliar `NoteTimelineMetadata`. Nao
adicionar campo `side`. `DayEntries` deve continuar com `tasks`, `notes` e
`echoes`.

**Verification**:

Concluido. `TimelineNode.side` nao foi adicionado.

---

### T006: Atualizar schemas Zod de ecos, candidatas, relacionadas e continuacao

**File**: `src/schemas/note.schema.ts` (modify)

**Requirements**:

FR-007, FR-016, FR-020, FR-021, FR-022, FR-023.

**Dependencies**:

T004.

**Implementation**:

Expandir schemas com `relatedNoteSchema`, `noteEchoCandidateSchema`,
`noteCandidatePageSchema` e `continueNoteInputSchema` contendo
`sourceNoteId`, `newNoteDay`, `title`, `generatedBrief` e `content`. Preservar a
mensagem atual de self-link: `Uma nota nao pode criar eco com ela mesma.`

**Verification**:

Concluido. `tests/unit/schemas/note.schema.test.ts` cobre candidata, nota
relacionada disponivel/indisponivel, payloads invalidos e input de continuacao.

---

### T007: Criar utilitarios de relacao, contagem direta, par semantico e ordenacao

**File**: `src/features/notes/utils/note-echo-relations.ts` (new)

**Requirements**:

FR-003, FR-005, FR-008, FR-010, FR-021.

**Dependencies**:

T004.

**Implementation**:

Exportar funcoes puras: `buildSemanticEchoPair`, `isSameSemanticEchoPair`,
`countDirectEchoesByNoteId`, `getDirectEchoesForNote`, `getConnectedNoteId`,
`sortRelatedNotesForReader`, `markAlreadyConnectedCandidates`. O par semantico
deve ordenar os dois ids com `localeCompare`; a ordenacao do Reader deve por
notas do mesmo dia primeiro e depois `created_at` decrescente.

**Verification**:

Concluido como helper/base. Cobertura adicional de historia permanece em T015,
que segue aberto.

---

### T008: Criar utilitario deterministico de generatedBrief

**File**: `src/features/notes/utils/build-continue-note-brief.ts` (new)

**Requirements**:

FR-017.

**Dependencies**:

T004.

**Implementation**:

Exportar `buildContinueNoteBrief(note: Note): string`. Ordem: `brief` util,
primeiro trecho util de `content` normalizado em uma linha, fallback
`Continuidade de {title}`. Remover quebras repetidas, comprimir espacos e
limitar a 180 caracteres sem cortar palavra quando possivel.

**Verification**:

Concluido como helper/base. Cobertura adicional de US3 permanece em T037, que
segue aberto.

---

### T009: Criar APIs base de leitura de ecos e detalhes relacionados

**File**: `src/features/notes/api/list-note-echoes.ts` (new)

**Requirements**:

FR-002, FR-004, FR-011, FR-020, FR-021.

**Dependencies**:

T006, T007.

**Implementation**:

Criar `listNoteEchoesForNotes(noteIds: string[])` que consulta
`note_echoes` com `or(from_note_id.in, to_note_id.in)` se houver ids.
Criar `listRelatedNoteDetails(noteIds: string[])` que busca notas por lote
distinto de ids. Ambas seguem o padrao de `create-note.ts`: validar Supabase,
validar sessao, parsear com Zod e retornar `{ ok, data, errorMessage }`.

**Verification**:

Concluido. `tests/unit/notes/note-echo-api.test.ts` cobre preflight,
classificacao de erros, detalhes relacionados e falhas de leitura.

---

### T010: Criar API de listagem paginada de candidatas

**File**: `src/features/notes/api/list-note-candidates.ts` (new)

**Requirements**:

FR-013, FR-022, FR-023.

**Dependencies**:

T006, T007.

**Implementation**:

Implementado como `listNoteCandidates({ sourceNoteId, selectedDay,
existingEchoes, cursor, pageSize = 50 })`. A query pagina no limite do
Supabase com `range(0, pageSize)`, separando candidatas do dia selecionado das
demais e usando cursor composto por grupo, `day`, `created_at` e `id`. A origem
e excluida por `.neq("id", sourceNoteId)` e `isAlreadyConnected` compara pares
semanticos diretos, inclusive invertidos.

**Verification**:

Concluido para Base. `tests/unit/notes/note-echo-api.test.ts` cobre primeira
pagina, proxima pagina, transicao de grupo, `range`, exclusao da origem e
candidata ja conectada. T028 permanece aberto como cobertura propria da US2/UI.

---

### T011: Criar API de criacao manual de eco

**File**: `src/features/notes/api/create-note-echo.ts` (new)

**Requirements**:

FR-006, FR-007, FR-008, FR-010, FR-020.

**Dependencies**:

T006, T007.

**Implementation**:

Implementado como `createNoteEcho(input)` com validacao de self-link,
preflight de Supabase/sessao e insert direto em `note_echoes` sem enviar
`created_by_user_id` pelo cliente. Ownership vem do banco via default
`auth.uid()` e migration forward. Duplicidade usa apenas sinal estruturado
`code = 23505` e reconcilia a relacao existente sem reescrever `kind`.

**Verification**:

Concluido para Base. `tests/unit/notes/note-echo-api.test.ts` cobre self-link,
payload sem owner, duplicidade, classificacao de erro e preservacao de `kind`.
T029 permanece aberto como cobertura propria da US2.

---

### T012: Criar API de remocao de eco

**File**: `src/features/notes/api/delete-note-echo.ts` (new)

**Requirements**:

FR-009, FR-020.

**Dependencies**:

T007.

**Implementation**:

Implementado como `deleteNoteEcho(input)` com preflight, validacao de par,
delete restrito ao `echoId` quando informado e ao par semantico selecionado. A
API reconcilia apos a remocao, preserva notas e trata relacao ja ausente como
estado recuperavel.

**Verification**:

Concluido para Base. `tests/unit/notes/note-echo-api.test.ts` cobre remocao
sem apagar notas, par adjacente A-C preservado e erros de acesso. T030 segue
aberto para cobertura propria da US2.

---

### T014: Atualizar mocks de integracao para note_echoes, delete e rpc

**File**: `tests/integration/day/day-surface-same-day.test.tsx` (modify)

**Requirements**:

FR-002, FR-006, FR-009, FR-016.

**Dependencies**:

T002, T009, T011, T012.

**Implementation**:

Extrair mocks repetidos para `tests/support/supabase-note-echo-mock.ts` e
garantir que a suite same-day continue passando com `notes`, `tasks`,
`note_echoes`, `delete` e `rpc` disponiveis.

**Verification**:

Concluido. `tests/integration/day/day-surface-same-day.test.tsx` usa o helper
compartilhado `createSupabaseNoteEchoMock` em vez de manter query builder
paralelo.

---

## Phase 3: Historia do Usuario 1

### T015: Adicionar testes unitarios de contagem direta, par invertido e ordenacao

**File**: `tests/unit/notes/note-echo-relations.test.ts` (new)

**Requirements**:

FR-003, FR-005, FR-008, FR-010.

**Dependencies**:

T001, T007.

**Implementation**:

Testar que A-B e B-A geram o mesmo par semantico, que `directCount` soma ecos
em qualquer ponta, que o Reader ordena mesmo dia antes de outro dia e que
`kind` nao altera a semantica visual.

**Verification**:

`corepack pnpm run test -- note-echo-relations`.

---

### T016: Adicionar teste de useDayEntries carregando note_echoes

**File**: `tests/unit/day/use-day-entries.test.tsx` (modify)

**Requirements**:

FR-002, FR-003, FR-020.

**Dependencies**:

T002, T009, T020.

**Implementation**:

Atualizar o mock atual para registrar consulta a `note_echoes` apos retorno de
notas. Validar que ecos ligados as notas do dia entram em `entries.echoes` e
que resposta atrasada continua ignorada pelo `requestIdRef`.

**Verification**:

`corepack pnpm run test -- use-day-entries`.

---

### T017: Adicionar teste de NoteCardReal exibindo badge Ecos

**File**: `tests/unit/timeline/timeline-view.test.tsx` (modify)

**Requirements**:

FR-002, FR-003, SC-001, SC-006.

**Dependencies**:

T005, T022, T023.

**Implementation**:

Adicionar cenario com node de nota contendo `directEchoCount = 2` e validar
badge `Ecos 2`. Adicionar cenario com contagem zero sem badge.

**Verification**:

`corepack pnpm run test -- timeline-view`.

---

### T018: Adicionar teste de Reader com notas conectadas e item indisponivel

**File**: `tests/unit/notes/note-reader-relations.test.tsx` (new)

**Requirements**:

FR-004, FR-011, FR-019, FR-021.

**Dependencies**:

T001, T024.

**Implementation**:

Renderizar `NoteReader` com nota ativa, lista de relacionadas, uma relacionada
indisponivel e handler de recarregar. Validar titulo da secao `Ecos`, acao
`Adicionar eco`, acao `Continuar desta nota`, item indisponivel e botao
`Recarregar`.

**Verification**:

`corepack pnpm run test -- note-reader-relations`.

---

### T019: Adicionar teste de integracao para abrir nota conectada de outro dia

**File**: `tests/integration/day/note-echo-navigation.test.tsx` (new)

**Requirements**:

FR-011, FR-012, FR-021.

**Dependencies**:

T002, T025, T026.

**Implementation**:

Montar rota do dia com nota relacionada em outro dia, tocar no item do Reader,
validar `router.push("/day/2026-05-02")` e reabertura do Reader quando a nota
de destino estiver carregada.

**Verification**:

`corepack pnpm run test -- note-echo-navigation`.

---

### T020: Atualizar useDayEntries para carregar note_echoes

**File**: `src/features/day/hooks/use-day-entries.ts` (modify)

**Requirements**:

FR-001, FR-002, FR-003, FR-020.

**Dependencies**:

T006, T009, T016.

**Implementation**:

Apos parse de notas, coletar ids do dia e buscar ecos ligados a esses ids. Se
nao houver notas, retornar `echoes: []`. Manter protecao contra resposta
atrasada e mensagens de erro existentes.

**Verification**:

T016 e `corepack pnpm run typecheck`.

---

### T021: Atualizar useDayTimeline para derivar directEchoCount

**File**: `src/features/day/hooks/use-day-timeline.ts` (modify)

**Requirements**:

FR-002, FR-003, FR-018.

**Dependencies**:

T005, T007, T020.

**Implementation**:

Usar `countDirectEchoesByNoteId(dayEntries.echoes)` e enriquecer nodes de nota
com contagem direta. Nao alterar ordenacao temporal nem criar node novo para
eco.

**Verification**:

T017 e `rg -n "task_ghost|side" src/features/day/hooks/use-day-timeline.ts`.

---

### T022: Atualizar NoteCardReal para renderizar badge Ecos

**File**: `src/components/cards/note-card-real.tsx` (modify)

**Requirements**:

FR-002, FR-003, SC-001.

**Dependencies**:

T005, T017.

**Implementation**:

Adicionar prop opcional `directEchoCount`, renderizar badge somente quando for
maior que zero, com `testID="note-echo-badge-{note.id}"` e texto `Ecos {n}`.

**Verification**:

T017.

---

### T023: Atualizar TimelineView para repassar contagem direta

**File**: `src/components/timeline/timeline-view.tsx` (modify)

**Requirements**:

FR-002, FR-003.

**Dependencies**:

T022.

**Implementation**:

Ao renderizar node `note`, passar `directEchoCount` do node enriquecido para
`NoteCardReal`. Manter comportamento de toque simples, duplo toque e ghost
card intacto.

**Verification**:

T017.

---

### T024: Atualizar NoteReader para lista de notas conectadas

**File**: `src/components/reader/note-reader.tsx` (modify)

**Requirements**:

FR-004, FR-011, FR-013, FR-014, FR-019, FR-021.

**Dependencies**:

T018.

**Implementation**:

Adicionar props `relatedNotes`, `onOpenRelatedNote`, `onReloadRelatedNote`,
`onAddEcho`, `onRemoveEcho`, `onContinueNote`. Renderizar secao `Ecos` com
itens disponiveis e indisponiveis. Itens disponiveis abrem nota relacionada;
indisponiveis mostram `Item indisponivel` e acao `Recarregar`. Adicionar
botoes `Adicionar eco` e `Continuar desta nota`.

**Verification**:

T018.

---

### T025: Adicionar estado pendente de abertura de nota conectada

**File**: `src/stores/navigation-store.ts` (modify)

**Requirements**:

FR-011, FR-012.

**Dependencies**:

T019.

**Implementation**:

Adicionar `pendingOpenNoteId`, `pendingOpenNoteDay`, setters e consumer
similar ao fluxo existente de task. Manter breadcrumb temporal restrito a
tarefas projected.

**Verification**:

T019 e `corepack pnpm run typecheck`.

---

### T026: Integrar navegacao cross-day de nota conectada

**File**: `app/day/[date].tsx` (modify)

**Requirements**:

FR-011, FR-012, FR-018.

**Dependencies**:

T025.

**Implementation**:

Ao abrir relacionada de outro dia, fechar overlays, registrar pending note no
navigation-store e `router.push` para `/day/{relatedNote.day}`. Quando o dia
destino carregar, abrir Reader apenas se a nota existir nesse dia e consumir o
estado pendente uma unica vez.
Nao criar breadcrumb.

**Verification**:

T019.

---

### T027: Atualizar DayShell para passar dados relacionais ao Reader

**File**: `src/components/day/day-shell.tsx` (modify)

**Requirements**:

FR-004, FR-011, FR-013, FR-014.

**Dependencies**:

T024, T026.

**Implementation**:

Adicionar props relacionais calculadas pela rota e repassar ao `NoteReader`.
Preservar assinatura de `TaskReader`, `NoteEditor` e `TaskEditor`.

**Verification**:

T018 e T019.

---

## Phase 4: Historia do Usuario 2

### T028: Adicionar testes unitarios de listagem paginada e candidatas desabilitadas

**File**: `tests/unit/notes/list-note-candidates.test.ts` (new)

**Requirements**:

FR-022, FR-023.

**Dependencies**:

T001, T002, T010.

**Implementation**:

Validar pagina de 50, `hasNextPage`, exclusao da nota de origem, ordenacao por
recencia e candidata ja conectada com `isAlreadyConnected = true`.

**Verification**:

`corepack pnpm run test -- list-note-candidates`.

---

### T029: Adicionar testes unitarios de createNoteEcho

**File**: `tests/unit/notes/create-note-echo.test.ts` (new)

**Requirements**:

FR-006, FR-007, FR-008, FR-010, FR-020.

**Dependencies**:

T002, T011.

**Implementation**:

Cobrir criacao `manual_link`, bloqueio de self-link, duplicidade invertida
tratada como `Eco ja existe`, preservacao de `kind` original e sessao expirada.

**Verification**:

`corepack pnpm run test -- create-note-echo`.

---

### T030: Adicionar testes unitarios de deleteNoteEcho

**File**: `tests/unit/notes/delete-note-echo.test.ts` (new)

**Requirements**:

FR-009, FR-020, SC-003.

**Dependencies**:

T002, T012.

**Implementation**:

Cobrir remocao por par semantico, relacao ausente recuperavel, erro de sessao
e garantia de que nenhuma chamada delete ocorre em `notes`.

**Verification**:

`corepack pnpm run test -- delete-note-echo`.

---

### T031: Adicionar teste de integracao do fluxo Adicionar eco

**File**: `tests/integration/day/note-echo-management.test.tsx` (new)

**Requirements**:

FR-006, FR-008, FR-009, FR-013, FR-022, FR-023.

**Dependencies**:

T028, T029, T030, T032, T033, T034, T035.

**Implementation**:

Validar abrir Reader, acionar `Adicionar eco`, carregar mais, bloquear
candidata ja conectada, criar eco habilitado, ver feedback `Eco ja existe`,
remover eco com confirmacao e observar contagem atualizada.

**Verification**:

`corepack pnpm run test -- note-echo-management`.

---

### T032: Implementar seletor de candidatas

**File**: `src/components/reader/note-echo-picker.tsx` (new)

**Requirements**:

FR-013, FR-022, FR-023.

**Dependencies**:

T010, T028.

**Implementation**:

Criar modal com lista de candidatas, estados loading, empty e error, botao
`carregar mais`, item desabilitado com `Eco ja existe`, e callback
`onSelectCandidate` apenas para candidatas habilitadas.

**Verification**:

T028 e T031.

---

### T033: Integrar acao Adicionar eco ao NoteReader

**File**: `src/components/reader/note-reader.tsx` (modify)

**Requirements**:

FR-013, FR-022.

**Dependencies**:

T024, T032.

**Implementation**:

Adicionar botao `Adicionar eco` no Reader, abrir `NoteEchoPicker` e manter
Reader aberto apos sucesso ou duplicidade.

**Verification**:

T031.

---

### T034: Implementar confirmacao de Remover eco no NoteReader

**File**: `src/components/reader/note-reader.tsx` (modify)

**Requirements**:

FR-009, SC-003.

**Dependencies**:

T012, T024, T030.

**Implementation**:

Adicionar acao contextual `Remover eco` por relacao direta, dialogo de
confirmacao com texto claro e chamada a `onRemoveEcho` somente apos confirmar.

**Verification**:

T030 e T031.

---

### T035: Integrar createNoteEcho, deleteNoteEcho, reload e feedback

**File**: `app/day/[date].tsx` (modify)

**Requirements**:

FR-006, FR-008, FR-009, FR-013, FR-020.

**Dependencies**:

T011, T012, T031.

**Implementation**:

Conectar handlers de criar e remover eco, chamar `reload()` apos sucesso,
mostrar `Eco ja existe` quando a API indicar duplicidade e manter erro local
sem derrubar a superficie do dia.

**Verification**:

T031.

---

### T036: Garantir reload de contagem e lista apos remocao

**File**: `src/features/day/hooks/use-day-entries.ts` (modify)

**Requirements**:

FR-009, SC-003.

**Dependencies**:

T020, T035.

**Implementation**:

Preservar `reload` como fonte unica para atualizar notas, tarefas e ecos apos
criacao ou remocao. Garantir que contagem derivada nunca use cache antigo de
`echoes`.

**Verification**:

T031 e T016.

---

## Phase 5: Historia do Usuario 3

### T037: Adicionar testes unitarios de buildContinueNoteBrief

**File**: `tests/unit/notes/build-continue-note-brief.test.ts` (new)

**Requirements**:

FR-017.

**Dependencies**:

T001, T008.

**Implementation**:

Cobrir prioridade de `brief`, fallback para `content`, fallback para `title`,
normalizacao de espacos e limite de tamanho.

**Verification**:

`corepack pnpm run test -- build-continue-note-brief`.

---

### T041: Criar migration da RPC atomica continue_note

**File**: `supabase/migrations/002_note_echo_flows.sql` (new)

**Requirements**:

FR-016, SC-005.

**Dependencies**:

Nenhuma.

**Implementation**:

Criar `public.continue_note(source_note_id uuid, target_day date, title text,
brief text, content text)` em PL/pgSQL, `security definer`, com `set
search_path = public`. Validar `auth.uid()`, ownership da nota origem,
`target_day >= source.day`, titulo e brief nao vazios. Inserir a nota destino
e o eco `continue_note` na mesma funcao. Retornar a linha da nova nota.
Incluir estrategia de reversao com `drop function if exists public.continue_note`.

**Verification**:

Aplicacao local da migration em banco de desenvolvimento; T039 deve rodar
depois para provar o contrato da migration.

---

### T013: Criar API de continuacao atomica via rpc

**File**: `src/features/notes/api/continue-note.ts` (new)

**Requirements**:

FR-014, FR-015, FR-016, FR-017, FR-020.

**Dependencies**:

T006, T008, T041.

**Implementation**:

Criar `continueNote(input)` que valida draft, chama
`supabase.rpc("continue_note", { source_note_id, target_day, title, brief, content })`,
parseia a nota retornada e so retorna sucesso com nota criada confirmada. O
erro deve informar que nao foi possivel continuar a nota e nunca deve declarar
sucesso parcial.

**Verification**:

T038 cobre sucesso e falha sem nota orfa.

---

### T039: Adicionar teste de contrato da migration RPC

**File**: `tests/unit/docs/documentation-contracts.test.ts` (modify)

**Requirements**:

FR-016, SC-005.

**Dependencies**:

T041.

**Implementation**:

Adicionar cobertura documental que le
`supabase/migrations/002_note_echo_flows.sql` e garante existencia de
`public.continue_note`, uso de `security definer`, validacao por `auth.uid()`,
insert em `public.notes`, insert em `public.note_echoes` com
`kind = 'continue_note'`, rollback por
`drop function if exists public.continue_note` e ausencia de qualquer referencia
a `service_role`.

**Verification**:

`corepack pnpm run test -- documentation-contracts`.

---

### T038: Adicionar testes unitarios de continueNote rpc

**File**: `tests/unit/notes/continue-note.test.ts` (new)

**Requirements**:

FR-014, FR-015, FR-016, FR-017, FR-020, SC-005.

**Dependencies**:

T002, T013, T041.

**Implementation**:

Cobrir chamada RPC com payload correto, sucesso com nota parseada, falha da RPC
sem sucesso parcial, dia anterior rejeitado e sessao expirada.

**Verification**:

`corepack pnpm run test -- continue-note`.

---

### T040: Adicionar teste de integracao para Continuar desta nota

**File**: `tests/integration/day/continue-note-flow.test.tsx` (new)

**Requirements**:

FR-014, FR-015, FR-016, FR-017, FR-018.

**Dependencies**:

T038, T042, T043, T044.

**Implementation**:

Validar abrir Reader, acionar `Continuar desta nota`, editar draft, salvar no
mesmo dia, salvar em dia futuro, reabrir Reader da nota criada e simular falha
da RPC sem nota orfa.

**Verification**:

`corepack pnpm run test -- continue-note-flow`.

---

### T042: Implementar formulario/modal de continuacao

**File**: `src/components/forms/continue-note-editor.tsx` (new)

**Requirements**:

FR-014, FR-015, FR-017, FR-018.

**Dependencies**:

T008, T037.

**Implementation**:

Criar modal com `title`, `newNoteDay`, `generatedBrief` e `content`, usando
defaults do utilitario de brief. Validar dia igual ou posterior ao dia da
origem. Expor `onSubmit(draft)` e `onClose`. Nao usar campos de tarefa,
`source_day`, `target_day` de task ou ghost card.

**Verification**:

T040 e `corepack pnpm run typecheck`.

---

### T043: Integrar acao Continuar desta nota ao NoteReader

**File**: `src/components/reader/note-reader.tsx` (modify)

**Requirements**:

FR-014, FR-017.

**Dependencies**:

T024, T042.

**Implementation**:

Adicionar botao `Continuar desta nota` e abrir `ContinueNoteEditor` com a nota
ativa. Manter a semantica visual de `Eco` sem expor `continue_note`.

**Verification**:

T040.

---

### T044: Integrar fluxo de continuacao, rpc, reload e navegacao

**File**: `app/day/[date].tsx` (modify)

**Requirements**:

FR-014, FR-015, FR-016, FR-017, FR-018.

**Dependencies**:

T013, T042, T043.

**Implementation**:

Ao salvar continuacao, chamar `continueNote`, recarregar o dia relevante, abrir
Reader da nota criada no mesmo dia ou navegar para `/day/{newNoteDay}` com
`pendingReaderOpen` de consumo unico para outro dia. Em falha antes do commit,
mostrar erro local e nao fechar fluxo como sucesso; em falha apos commit,
reconciliar por `newNote.id` sem reenviar a RPC cegamente.

**Verification**:

T040 e T038.

---

### T045: Garantir que notas continuadas nao criam ghost card nem campos de tarefa

**File**: `src/features/timeline/utils/derive-timeline-nodes.ts` (modify)

**Requirements**:

FR-018, SC-006.

**Dependencies**:

T021, T044.

**Implementation**:

Adicionar regressao ou ajuste pequeno para provar que notas continuam gerando
apenas node `note` por `day` e `created_at`. Nao derivar `task_ghost` para
nota continuada.

**Verification**:

`corepack pnpm run test -- derive-timeline-nodes-regression projected-task-nodes`.

---

## Phase 6: Polimento e Itens Transversais

### T046: Atualizar @req dos novos testes

**File**: `tests/unit/` e `tests/integration/day/` (modify)

**Requirements**:

FR-001 a FR-024, SC-001 a SC-006.

**Dependencies**:

T015 a T040.

**Implementation**:

Adicionar comentarios `@req` feature-scoped em cada novo teste, mantendo
rastreabilidade entre FRs, SCs e suites. O formato aceito para esta feature e
`@req 002-note-echo-flows:FR-001` ou `@req 002-note-echo-flows:SC-001`.
Tags legadas sem feature id, incluindo `@req FR-*` de 001, nao contam.

**Verification**:

`rg -n "@req 002-note-echo-flows:(FR|SC)-" tests/unit tests/integration/day`.
Conferir tambem que os arquivos novos esperados da feature aparecem no output,
sem depender de matches de suites antigas.

---

### T047: Atualizar canon quando comportamento estiver implementado

**File**: `README.md`, `CURRENT-STATE.md`, `ROADMAP.md`,
`DATA-MODEL.md`, `ARCHITECTURE.md`, `REQUIREMENTS.md`, `TEST-SPEC.md`,
`SECURITY.md` quando RLS/RPC for afetado (modify). `docs-canonical/*` pode ser
atualizado apenas como espelho historico/adicional se necessario; a autoridade
continua no canon da raiz.

**Requirements**:

FR-001 a FR-024, SC-001 a SC-006.

**Dependencies**:

Historias implementadas e verificadas.

**Implementation**:

Mover `fluxos completos de eco` de futuro para comportamento entregue apenas
apos implementacao. Registrar RPC atomica, Reader com conexoes, seletor de
candidatas, remocao confirmada e exclusao de mencoes inline deste corte.
Atualizar primeiro os canones da raiz exigidos pela constituicao; nao fechar a
feature com apenas `docs-canonical/*` atualizado.

**Verification**:

Revisao textual dos paths de canon da raiz alterados, seguida por T053 e T054.
DocGuard PASS e necessario, mas nao substitui a verificacao semantica dos
canones alterados.

---

### T048: Atualizar CHANGELOG

**File**: `CHANGELOG.md` (modify)

**Requirements**:

Politica operacional do repo.

**Dependencies**:

T047.

**Implementation**:

Adicionar entrada de `002-note-echo-flows` com resumo de ecos diretos,
Adicionar eco, Remover eco, Continuar desta nota por RPC atomica e gates
executados.

**Verification**:

`rg -n "002-note-echo-flows|Continuar desta nota|Adicionar eco" CHANGELOG.md`.

---

### T049: Revisar DRIFT-LOG e CANON-MIGRATION-COVERAGE

**File**: `DRIFT-LOG.md`, `CANON-MIGRATION-COVERAGE.md` (modify if needed)

**Requirements**:

Politica operacional do repo.

**Dependencies**:

T047, T048.

**Implementation**:

Se houver desalinhamento temporario entre codigo e canon, registrar em
`DRIFT-LOG.md`. Se a feature absorver conteudo historico migrado, atualizar
`CANON-MIGRATION-COVERAGE.md`. Se nao houver mudanca necessaria, registrar no
resumo da PR que os arquivos foram revisados sem patch.

**Verification**:

Bloco de evidencia final informa se `DRIFT-LOG.md` e
`CANON-MIGRATION-COVERAGE.md` foram alterados ou revisados sem patch.

---

### T050: Executar lint

**File**: `package.json` script `lint` (already present)

**Requirements**:

Gate tecnico.

**Dependencies**:

T001 a T049.

**Implementation**:

Executar `corepack pnpm run lint` e corrigir violações no escopo da feature.

**Verification**:

Comando retorna exit code 0.

---

### T051: Executar test

**File**: `package.json` script `test` (already present)

**Requirements**:

Gate tecnico.

**Dependencies**:

T001 a T050.

**Implementation**:

Executar `corepack pnpm run test` e corrigir regressões no escopo da feature.

**Verification**:

Comando retorna exit code 0.

---

### T052: Executar typecheck

**File**: `package.json` script `typecheck` (already present)

**Requirements**:

Gate tecnico.

**Dependencies**:

T001 a T051.

**Implementation**:

Executar `corepack pnpm run typecheck` e corrigir erros TypeScript no escopo da
feature.

**Verification**:

Comando retorna exit code 0.

---

### T053: Executar doc:guard

**File**: `package.json` script `doc:guard` (already present)

**Requirements**:

Gate documental.

**Dependencies**:

T047, T048, T049.

**Implementation**:

Executar `corepack pnpm run doc:guard`. Guard vermelho bloqueia fechamento.

**Verification**:

Comando retorna PASS.

---

### T054: Executar doc:score

**File**: `package.json` script `doc:score` (already present)

**Requirements**:

Maturidade documental.

**Dependencies**:

T053.

**Implementation**:

Executar `corepack pnpm run doc:score` e preservar o output real no resumo
final, sem mascarar score baixo se houver.

**Verification**:

Comando conclui e o resultado e reportado.

---

### T055: Registrar bloco de evidencia concreta de fechamento

**File**: resumo da PR/entrega (write outside source tree or PR body)

**Requirements**:

Politica de fechamento da branch.

**Dependencies**:

T047, T048, T049, T050, T051, T052, T053, T054.

**Implementation**:

Registrar um bloco de evidencia que liste: paths de canon da raiz alterados,
resultado da revisao de `DRIFT-LOG.md` e `CANON-MIGRATION-COVERAGE.md`,
comandos exatos executados com output/exit code, evidencia da migration/RPC
aplicada ou contratualmente verificada, e nota explicita de que DocGuard PASS
foi necessario mas insuficiente sozinho para provar alinhamento semantico.

**Verification**:

O bloco existe antes de declarar a branch fechada ou merge-ready.

---

## Checklist

- [X] T001: Criar fixtures compartilhadas de notas e ecos
- [X] T002: Adicionar helpers de mock Supabase para tabelas notes, note_echoes e rpc
- [X] T004: Atualizar tipos de eco, nota relacionada, candidata e estado pendente de nota
- [X] T005: Atualizar DayEntries e contratos de timeline sem adicionar side ao TimelineNode
- [X] T006: Atualizar schemas Zod de note_echoes, candidatas, notas relacionadas e entrada de continuacao
- [X] T007: Criar utilitarios de relacao, contagem direta, par semantico e ordenacao
- [X] T008: Criar utilitario deterministico de generatedBrief
- [X] T009: Criar APIs base de leitura de ecos e detalhes relacionados
- [X] T010: Criar API de listagem paginada de candidatas
- [X] T011: Criar API de criacao manual de eco
- [X] T012: Criar API de remocao de eco
- [X] T014: Atualizar mocks de testes de integracao para suportar note_echoes, delete e rpc
- [ ] T015: Adicionar testes unitarios de contagem direta, par invertido e ordenacao
- [ ] T016: Adicionar teste de useDayEntries carregando note_echoes ligados as notas do dia
- [ ] T017: Adicionar teste de NoteCardReal exibindo badge Ecos somente quando directEchoCount maior que zero
- [ ] T018: Adicionar teste de Reader com notas conectadas, item indisponivel e recarregar
- [ ] T019: Adicionar teste de integracao para abrir nota conectada de outro dia e reabrir Reader no destino
- [ ] T020: Atualizar useDayEntries para carregar note_echoes relacionados as notas do dia
- [ ] T021: Atualizar useDayTimeline para derivar directEchoCount e dados relacionais sem alterar TimelineNode.side
- [ ] T022: Atualizar NoteCardReal para receber e renderizar badge Ecos com contagem direta
- [ ] T023: Atualizar TimelineView para repassar contagem direta para cards de nota
- [ ] T024: Atualizar NoteReader para exibir lista de notas conectadas, item indisponivel e acao de recarregar
- [ ] T025: Adicionar estado pendente de abertura de nota conectada em navigation-store
- [ ] T026: Integrar navegacao cross-day de nota conectada e reabertura do Reader
- [ ] T027: Atualizar DayShell para passar dados e handlers relacionais ao Reader
- [ ] T028: Adicionar testes unitarios de listagem paginada e candidatas desabilitadas
- [ ] T029: Adicionar testes unitarios de createNoteEcho para self-link, duplicidade invertida e kind original
- [ ] T030: Adicionar testes unitarios de deleteNoteEcho para confirmacao e remocao sem apagar notas
- [ ] T031: Adicionar teste de integracao do fluxo Adicionar eco, carregar mais, Eco ja existe e Remover eco
- [ ] T032: Implementar seletor de candidatas com lotes de 50, carregar mais e candidatos desabilitados
- [ ] T033: Integrar acao Adicionar eco ao NoteReader
- [ ] T034: Implementar confirmacao de Remover eco no NoteReader
- [ ] T035: Integrar createNoteEcho, deleteNoteEcho, reload e feedback Eco ja existe
- [ ] T036: Garantir que remocao de eco atualiza contagem e lista sem apagar notas
- [ ] T037: Adicionar testes unitarios de buildContinueNoteBrief
- [ ] T041: Criar migration da RPC atomica continue_note
- [ ] T013: Criar API de continuacao atomica via rpc
- [ ] T039: Adicionar teste de contrato da migration RPC
- [ ] T038: Adicionar testes unitarios de continueNote rpc sucesso e falha sem nota orfa
- [ ] T040: Adicionar teste de integracao para Continuar desta nota no mesmo dia e em dia futuro
- [ ] T042: Implementar formulario modal de continuacao com newNoteDay editavel e generatedBrief
- [ ] T043: Integrar acao Continuar desta nota ao NoteReader
- [ ] T044: Integrar fluxo de continuacao, rpc, reload e navegacao ao dia destino
- [ ] T045: Garantir que notas continuadas nao criam ghost card, source_day ou target_day
- [ ] T046: Atualizar @req dos novos testes com tags feature-scoped 002-note-echo-flows
- [ ] T047: Atualizar canon da raiz quando o comportamento estiver implementado
- [ ] T048: Atualizar CHANGELOG com a feature 002-note-echo-flows
- [ ] T049: Revisar DRIFT-LOG e CANON-MIGRATION-COVERAGE
- [ ] T050: Executar corepack pnpm run lint
- [ ] T051: Executar corepack pnpm run test
- [ ] T052: Executar corepack pnpm run typecheck
- [ ] T053: Executar corepack pnpm run doc:guard
- [ ] T054: Executar corepack pnpm run doc:score
- [ ] T055: Registrar bloco de evidencia concreta de fechamento

## Tech Debt Checklist

- [X] TD001: Constranger delete por echoId ao par semantico selecionado
- [X] TD002: Adicionar preflight de Supabase e sessao nas APIs de leitura
- [X] TD003: Corrigir mock de delete para preservar relacoes adjacentes
- [X] TD004: Ampliar cobertura de Phase 2 Base
- [X] TD005: Reutilizar mock Supabase compartilhado na integracao same-day
- [X] TD006: Remover owner derivado do cliente na criacao manual de eco
- [X] TD007: Restringir duplicidade a `code = 23505`
- [X] TD008: Classificar erros Supabase de auth, RLS, permissao e retry
- [X] TD009: Nao rotular detalhe ausente como indisponibilidade transiente sem evidencia
- [X] TD010: Cobrir preflight de leitura sem sessao/config
- [X] TD011: Provar A-B removido preservando A-C pelo mock compartilhado
- [X] TD012: Cobrir erros auth/RLS em queries de leitura
- [X] TD013: Tornar o mock compartilhado stateful para list/delete
- [X] TD014: Adicionar migration forward para default `auth.uid()` em `note_echoes`
- [X] TD015: Paginar candidatas no limite da query Supabase
- [X] TD016: Aplicar `neq`, `order`, `range` e cursor OR no mock stateful
- [X] TD017: Remover query builder Supabase paralelo da integracao same-day
- [X] TD018: Documentar migration 003 e repair de migration manual
- [X] TD019: Exigir status em falhas das APIs de leitura
- [X] TD020: Classificar payload invalido como `invalid_input`
- [X] TD021: Preservar mensagens de erro Supabase em objetos puros
- [X] TD022: Corrigir conversoes `String()` inseguras em `mapRowToCandidate`
- [X] TD023: Adicionar null-guard em `sortRelatedNotes`
- [X] TD024: Classificar FK, NOT NULL e 400 como `invalid_input`
- [X] TD025: Classificar config Supabase ausente como `not_accessible`
- [X] TD026: Diferenciar mensagens de falha primaria versus falha de verificacao
- [X] TD027: Evitar que falhas Zod sejam capturadas e classificadas genericamente
- [X] TD028: Capturar erro individual do segundo `fetchGroup`
- [X] TD029: Converter resultados de create/delete para unions discriminadas
- [X] TD030: Cobrir `transient_unavailable` por auth failure mid-session
- [X] TD031: Cobrir verificacao de delete com direcao invertida
- [X] TD032: Cobrir defaults/overrides de `context_note_id` e `context_day`
- [X] TD033: Cobrir fronteira de cursor entre grupo same-day e other-day
- [X] TD034: Cobrir `isAlreadyConnected` com eco invertido
- [X] TD035: Cobrir edge cases de normalizacao de whitespace no generatedBrief
- [X] TD036: Cobrir eco malformado na reconciliacao 23505
- [X] TD037: Remover ternarios aninhados em `list-note-candidates.ts`
- [X] TD038: Atualizar `DATA-MODEL.md` sobre CRUD de note echo
