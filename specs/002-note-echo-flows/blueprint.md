# Blueprint: Fluxos de Eco de Nota

**Branch**: `002-note-echo-flows` | **Date**: 2026-05-11
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
  canones executaveis em `docs-canonical/*`, docs de governanca/status da raiz,
  revisao de drift/migracao, comandos exatos e evidencia da migration/RPC ->
  T055.

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

## Phase 5: Historia do Usuario 3 - Continuar desta nota em outro momento

### Pre-completed Tasks

| Task | File | Status |
|------|------|--------|
| T037: Adicionar testes unitarios de buildContinueNoteBrief | `tests/unit/notes/build-continue-note-brief.test.ts` | Already complete - cobre prioridade de `brief`, fallback para `content`, fallback canonico por titulo, normalizacao de whitespace e limite de 180 caracteres. |
| T043: Integrar acao Continuar desta nota ao NoteReader | `src/components/reader/note-reader.tsx` e `src/components/day/day-shell.tsx` | Already complete - `NoteReader` ja renderiza `Continuar desta nota` quando recebe `onContinueNote`, e `DayShell` ja encaminha o handler opcional. |

---

### T041: Criar migration da RPC atomica continue_note

**File**: `supabase/migrations/002_note_echo_flows.sql` (new)

**Requirements**:

FR-016, FR-018, FR-020, SC-005.

**Dependencies**:

Nenhuma.

```sql
-- 002_note_echo_flows.sql
-- RPC atomica para Continuar desta nota.

create or replace function public.continue_note(
  source_note_id uuid,
  new_note_day date,
  title text,
  brief text,
  content text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  source_note public.notes%rowtype;
  inserted_note public.notes%rowtype;
  inserted_echo public.note_echoes%rowtype;
begin
  if current_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if source_note_id is null then
    raise exception 'source note is required' using errcode = '23502';
  end if;

  if new_note_day is null then
    raise exception 'new note day is required' using errcode = '23502';
  end if;

  if title is null or length(btrim(title)) = 0 then
    raise exception 'title is required' using errcode = '23502';
  end if;

  if brief is null or length(btrim(brief)) = 0 then
    raise exception 'brief is required' using errcode = '23502';
  end if;

  select *
    into source_note
    from public.notes
   where id = source_note_id
     and user_id = current_user_id;

  if not found then
    raise exception 'source note is not accessible' using errcode = '42501';
  end if;

  if new_note_day < source_note.day::date then
    raise exception 'new note day cannot be before source note day'
      using errcode = '23514';
  end if;

  insert into public.notes (
    user_id,
    day,
    title,
    content,
    brief,
    tag_id,
    color,
    is_color_overridden
  )
  values (
    current_user_id,
    new_note_day,
    btrim(title),
    nullif(btrim(coalesce(content, '')), ''),
    btrim(brief),
    source_note.tag_id,
    source_note.color,
    source_note.is_color_overridden
  )
  returning * into inserted_note;

  insert into public.note_echoes (
    from_note_id,
    to_note_id,
    created_by_user_id,
    context_note_id,
    context_day,
    kind,
    metadata
  )
  values (
    source_note.id,
    inserted_note.id,
    current_user_id,
    source_note.id,
    source_note.day,
    'continue_note',
    null
  )
  returning * into inserted_echo;

  return jsonb_build_object(
    'newNote', to_jsonb(inserted_note),
    'noteEcho', to_jsonb(inserted_echo)
  );
end;
$$;

revoke all on function public.continue_note(uuid, date, text, text, text) from public;
revoke all on function public.continue_note(uuid, date, text, text, text) from anon;
grant execute on function public.continue_note(uuid, date, text, text, text) to authenticated;

-- Reversao:
-- drop function if exists public.continue_note(uuid, date, text, text, text);
```

**Verification**:

`corepack pnpm run test -- documentation-contracts`.

---

### T013: Criar API de continuacao atomica via rpc

**File**: `src/features/notes/api/continue-note.ts` (new)

**Requirements**:

FR-014, FR-015, FR-016, FR-017, FR-020, SC-005.

**Dependencies**:

T006, T008, T041.

```typescript
import {
  continueNoteInputSchema,
  noteSchema,
  persistedNoteEchoSchema,
} from "../../../schemas/note.schema";
import type { ContinueNoteInput, Note, NoteEcho } from "../../../types/note";
import { getSupabaseClient } from "../../../lib/supabase";
import {
  classifySupabaseNoteEchoError,
  getSupabaseNoteEchoErrorMessage,
  preflightNoteEchoSupabaseAccess,
  type SupabaseNoteEchoFailure,
} from "./note-echo-errors";

type ContinueNoteFailure = SupabaseNoteEchoFailure | "invalid_input";

export type ContinueNoteResult =
  | {
      ok: true;
      newNote: Note;
      noteEcho: NoteEcho;
      errorMessage: null;
      status: "created";
    }
  | {
      ok: false;
      newNote: null;
      noteEcho: null;
      errorMessage: string;
      status: ContinueNoteFailure;
    };

const getPayloadField = (payload: unknown, key: string) =>
  typeof payload === "object" && payload !== null && key in payload
    ? (payload as Record<string, unknown>)[key]
    : null;

export const continueNote = async (
  input: ContinueNoteInput,
): Promise<ContinueNoteResult> => {
  const preflight = preflightNoteEchoSupabaseAccess();

  if (!preflight.ok) {
    return {
      ok: false,
      newNote: null,
      noteEcho: null,
      errorMessage: preflight.errorMessage,
      status: preflight.status,
    };
  }

  const parsedInput = continueNoteInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      newNote: null,
      noteEcho: null,
      errorMessage:
        parsedInput.error.issues[0]?.message ??
        "Informe os dados da continuacao corretamente.",
      status: "invalid_input",
    };
  }

  try {
    const { data, error } = await getSupabaseClient().rpc("continue_note", {
      source_note_id: parsedInput.data.sourceNoteId,
      new_note_day: parsedInput.data.newNoteDay,
      title: parsedInput.data.title,
      brief: parsedInput.data.generatedBrief,
      content: parsedInput.data.content,
    });

    if (error) {
      throw error;
    }

    const parsedNote = noteSchema.safeParse(getPayloadField(data, "newNote"));
    const parsedEcho = persistedNoteEchoSchema.safeParse(
      getPayloadField(data, "noteEcho"),
    );

    if (!parsedNote.success || !parsedEcho.success) {
      return {
        ok: false,
        newNote: null,
        noteEcho: null,
        errorMessage: "Continuacao criada com resposta invalida.",
        status: "retryable_failure",
      };
    }

    return {
      ok: true,
      newNote: parsedNote.data,
      noteEcho: parsedEcho.data,
      errorMessage: null,
      status: "created",
    };
  } catch (error) {
    return {
      ok: false,
      newNote: null,
      noteEcho: null,
      errorMessage: getSupabaseNoteEchoErrorMessage(
        "Nao foi possivel continuar a nota.",
        error,
      ),
      status: classifySupabaseNoteEchoError(error),
    };
  }
};
```

**Verification**:

`corepack pnpm run test -- continue-note`.

---

### T039: Adicionar teste de contrato da migration RPC

**File**: `tests/unit/docs/documentation-contracts.test.ts` (modify)

**Requirements**:

FR-016, FR-018, FR-020, SC-005.

**Dependencies**:

T041.

**Before** (line 76):

```typescript
    const hardeningSql = readFileSync(
      resolve(root, "supabase/migrations/003_harden_note_echo_surface.sql"),
      "utf8",
    );
    const runbooks = readFileSync(resolve(root, "RUNBOOKS.md"), "utf8");
```

**After**:

```typescript
    const hardeningSql = readFileSync(
      resolve(root, "supabase/migrations/003_harden_note_echo_surface.sql"),
      "utf8",
    );
    const continueNoteSql = readFileSync(
      resolve(root, "supabase/migrations/002_note_echo_flows.sql"),
      "utf8",
    );
    const runbooks = readFileSync(resolve(root, "RUNBOOKS.md"), "utf8");
```

**Before** (line 101):

```typescript
    expect(runbooks).toContain("003_harden_note_echo_surface.sql");
    expect(runbooks).toContain("supabase migration repair <version> --status applied");
  });
});
```

**After**:

```typescript
    expect(continueNoteSql).toContain("create or replace function public.continue_note");
    expect(continueNoteSql).toContain("security definer");
    expect(continueNoteSql).toContain("set search_path = public");
    expect(continueNoteSql).toContain("auth.uid()");
    expect(continueNoteSql).toContain("insert into public.notes");
    expect(continueNoteSql).toContain("insert into public.note_echoes");
    expect(continueNoteSql).toContain("'continue_note'");
    expect(continueNoteSql).toContain(
      "drop function if exists public.continue_note",
    );
    expect(continueNoteSql).not.toContain("service_role");
    expect(runbooks).toContain("003_harden_note_echo_surface.sql");
    expect(runbooks).toContain("supabase migration repair <version> --status applied");
  });
});
```

**Verification**:

`corepack pnpm run test -- documentation-contracts`.

---

### T038: Adicionar testes unitarios de continueNote rpc

**File**: `tests/unit/notes/continue-note.test.ts` (new)

**Requirements**:

FR-014, FR-015, FR-016, FR-017, FR-020, SC-005.

**Dependencies**:

T002, T013, T041.

```typescript
import { continueNote } from "../../../src/features/notes/api/continue-note";
import { useAuthStore } from "../../../src/stores/auth-store";
import type { AuthenticatedSession } from "../../../src/types/auth";
import {
  buildNote,
  buildNoteEcho,
  NOTE_ECHO_FIXTURE_USER_ID,
  NOTE_ECHO_SOURCE_DAY,
  NOTE_ECHO_TARGET_DAY,
} from "../../support/note-echo-fixtures";
import { createSupabaseNoteEchoMock } from "../../support/supabase-note-echo-mock";

const mockSupabase = createSupabaseNoteEchoMock();

jest.mock("../../../src/lib/supabase", () => ({
  getSupabaseClient: () => mockSupabase.client,
  getSupabaseConfigurationError: () => null,
  isSupabaseConfigured: true,
}));

const authenticatedSession: AuthenticatedSession = {
  userId: NOTE_ECHO_FIXTURE_USER_ID,
  email: "pessoa@echotes.app",
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

describe("continueNote", () => {
  beforeEach(() => {
    mockSupabase.reset();
    useAuthStore.setState({
      status: "authenticated",
      session: authenticatedSession,
      errorMessage: null,
      hasHydrated: true,
      isRestoring: false,
      isAuthenticated: true,
    });
  });

  it("chama RPC atomica com new_note_day, context_day fica no servidor", async () => {
    const sourceNoteId = "10000000-0000-4000-8000-000000000001";
    const newNote = buildNote({
      id: "10000000-0000-4000-8000-000000000099",
      day: NOTE_ECHO_TARGET_DAY,
      title: "Continuidade",
      brief: "Briefing gerado",
    });
    const noteEcho = buildNoteEcho({
      id: "30000000-0000-4000-8000-000000000099",
      from_note_id: sourceNoteId,
      to_note_id: newNote.id,
      context_note_id: sourceNoteId,
      context_day: NOTE_ECHO_SOURCE_DAY,
      kind: "continue_note",
    });
    mockSupabase.enqueueRpcResult(
      "continue_note",
      mockSupabase.ok({ newNote, noteEcho }),
    );

    const result = await continueNote({
      sourceNoteId,
      newNoteDay: NOTE_ECHO_TARGET_DAY,
      title: "Continuidade",
      generatedBrief: "Briefing gerado",
      content: "Texto editado",
    });

    expect(result.ok).toBe(true);
    expect(result.newNote?.day).toBe(NOTE_ECHO_TARGET_DAY);
    expect(result.noteEcho?.kind).toBe("continue_note");
    expect(mockSupabase.rpcCalls).toEqual([
      {
        name: "continue_note",
        payload: {
          source_note_id: sourceNoteId,
          new_note_day: NOTE_ECHO_TARGET_DAY,
          title: "Continuidade",
          brief: "Briefing gerado",
          content: "Texto editado",
        },
      },
    ]);
  });

  it("falha sem declarar sucesso parcial quando a RPC falha", async () => {
    mockSupabase.enqueueRpcResult(
      "continue_note",
      mockSupabase.error("rollback", { status: 503 }),
    );

    const result = await continueNote({
      sourceNoteId: "10000000-0000-4000-8000-000000000001",
      newNoteDay: NOTE_ECHO_SOURCE_DAY,
      title: "Continuidade",
      generatedBrief: "Briefing gerado",
      content: "",
    });

    expect(result).toMatchObject({
      ok: false,
      newNote: null,
      noteEcho: null,
      status: "retryable_failure",
    });
  });

  it("bloqueia sessao expirada antes de chamar a RPC", async () => {
    useAuthStore.setState({
      status: "unauthenticated",
      session: null,
      errorMessage: null,
      hasHydrated: true,
      isRestoring: false,
      isAuthenticated: false,
    });

    const result = await continueNote({
      sourceNoteId: "10000000-0000-4000-8000-000000000001",
      newNoteDay: NOTE_ECHO_SOURCE_DAY,
      title: "Continuidade",
      generatedBrief: "Briefing gerado",
      content: "",
    });

    expect(result.status).toBe("not_accessible");
    expect(mockSupabase.rpcCalls).toEqual([]);
  });
});
```

**Verification**:

`corepack pnpm run test -- continue-note`.

---

### T042: Implementar formulario/modal de continuacao

**File**: `src/components/forms/continue-note-editor.tsx` (new)

**Requirements**:

FR-014, FR-015, FR-017, FR-018.

**Dependencies**:

T008, T037.

```typescript
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { buildContinueNoteBrief } from "../../features/notes/utils/build-continue-note-brief";
import type { ContinueNoteInput, Note } from "../../types/note";

interface ContinueNoteEditorProps {
  visible: boolean;
  selectedDay: string;
  sourceNote: Note | null;
  errorMessage: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (draft: ContinueNoteInput) => Promise<void> | void;
}

export function ContinueNoteEditor({
  visible,
  selectedDay,
  sourceNote,
  errorMessage,
  isSubmitting,
  onClose,
  onSubmit,
}: ContinueNoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [generatedBrief, setGeneratedBrief] = useState("");
  const [newNoteDay, setNewNoteDay] = useState(selectedDay);
  const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !sourceNote) {
      return;
    }

    setTitle(sourceNote.title);
    setContent("");
    setGeneratedBrief(buildContinueNoteBrief(sourceNote));
    setNewNoteDay(selectedDay);
    setLocalErrorMessage(null);
  }, [selectedDay, sourceNote, visible]);

  if (!visible || !sourceNote) {
    return null;
  }

  const handleSubmit = async () => {
    if (newNoteDay < sourceNote.day) {
      setLocalErrorMessage("Dia da nota precisa ser igual ou posterior a origem.");
      return;
    }

    await onSubmit({
      sourceNoteId: sourceNote.id,
      newNoteDay,
      title,
      generatedBrief,
      content,
    });
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.eyebrow}>Continuar desta nota</Text>
          <Text style={styles.meta}>Dia selecionado: {selectedDay}</Text>

          <Text style={styles.label}>Titulo</Text>
          <TextInput
            placeholder="Titulo da nova nota"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            testID="continue-note-title-input"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Dia da nota</Text>
          <TextInput
            placeholder="AAAA-MM-DD"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            testID="continue-note-day-input"
            value={newNoteDay}
            onChangeText={setNewNoteDay}
          />

          <Text style={styles.label}>Briefing</Text>
          <TextInput
            multiline
            placeholder="Briefing da continuacao"
            placeholderTextColor="#9ca3af"
            style={[styles.input, styles.multiline]}
            testID="continue-note-brief-input"
            value={generatedBrief}
            onChangeText={setGeneratedBrief}
          />

          <Text style={styles.label}>Conteudo</Text>
          <TextInput
            multiline
            placeholder="Escreva a continuacao"
            placeholderTextColor="#9ca3af"
            style={[styles.input, styles.multiline]}
            testID="continue-note-content-input"
            value={content}
            onChangeText={setContent}
          />

          {localErrorMessage || errorMessage ? (
            <Text style={styles.errorText}>{localErrorMessage ?? errorMessage}</Text>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              style={styles.secondaryButton}
              testID="continue-note-cancel-button"
              onPress={onClose}
            >
              <Text style={styles.secondaryLabel}>Cancelar</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              style={styles.primaryButton}
              testID="continue-note-save-button"
              onPress={() => {
                void handleSubmit();
              }}
            >
              <Text style={styles.primaryLabel}>
                {isSubmitting ? "Salvando..." : "Salvar continuacao"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.48)",
    padding: 24,
  },
  sheet: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    padding: 18,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#6b7280",
  },
  meta: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748b",
  },
  label: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  input: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  errorText: {
    marginTop: 12,
    fontSize: 13,
    color: "#b91c1c",
  },
  actions: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  primaryButton: {
    borderRadius: 10,
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  secondaryButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
});
```

**File**: `src/components/day/day-shell.tsx` (modify)

**Before** (line 12):

```typescript
import { NoteEditor } from "../forms/note-editor";
import { NoteEchoPicker } from "../reader/note-echo-picker";
```

**After**:

```typescript
import { ContinueNoteEditor } from "../forms/continue-note-editor";
import { NoteEditor } from "../forms/note-editor";
import { NoteEchoPicker } from "../reader/note-echo-picker";
```

**Before** (line 3):

```typescript
import type { Note, NoteEcho, NoteEchoCandidate, RelatedNote } from "../../types/note";
```

**After**:

```typescript
import type {
  ContinueNoteInput,
  Note,
  NoteEcho,
  NoteEchoCandidate,
  RelatedNote,
} from "../../types/note";
```

**Before** (line 35):

```typescript
  isEchoPickerVisible: boolean;
  echoFeedbackMessage: string | null;
```

**After**:

```typescript
  isEchoPickerVisible: boolean;
  isContinueNoteEditorVisible: boolean;
  isContinuingNote: boolean;
  echoFeedbackMessage: string | null;
  continueNoteErrorMessage: string | null;
```

**Before** (line 49):

```typescript
  onRemoveEcho?: (relatedNote: RelatedNote) => void;
  onContinueNote?: () => void;
```

**After**:

```typescript
  onRemoveEcho?: (relatedNote: RelatedNote) => void;
  onContinueNote?: () => void;
  onCloseContinueNoteEditor: () => void;
  onSubmitContinueNote: (draft: ContinueNoteInput) => Promise<void> | void;
```

**Before** (line 78):

```typescript
  isEchoPickerVisible,
  echoFeedbackMessage,
```

**After**:

```typescript
  isEchoPickerVisible,
  isContinueNoteEditorVisible,
  isContinuingNote,
  echoFeedbackMessage,
  continueNoteErrorMessage,
```

**Before** (line 91):

```typescript
  onRemoveEcho,
  onContinueNote,
```

**After**:

```typescript
  onRemoveEcho,
  onContinueNote,
  onCloseContinueNoteEditor,
  onSubmitContinueNote,
```

**Before** (line 149):

```typescript
      <NoteEchoPicker
        visible={isEchoPickerVisible}
        sourceNote={activeNote}
        selectedDay={date}
        existingEchoes={activeNoteEchoes}
        onClose={onCloseEchoPicker}
        onSelectCandidate={onSelectEchoCandidate}
      />
```

**After**:

```typescript
      <NoteEchoPicker
        visible={isEchoPickerVisible}
        sourceNote={activeNote}
        selectedDay={date}
        existingEchoes={activeNoteEchoes}
        onClose={onCloseEchoPicker}
        onSelectCandidate={onSelectEchoCandidate}
      />

      <ContinueNoteEditor
        visible={isContinueNoteEditorVisible}
        selectedDay={date}
        sourceNote={activeNote}
        errorMessage={continueNoteErrorMessage}
        isSubmitting={isContinuingNote}
        onClose={onCloseContinueNoteEditor}
        onSubmit={onSubmitContinueNote}
      />
```

**Verification**:

`corepack pnpm run typecheck`.

---

### T044: Integrar fluxo de continuacao, rpc, reload e navegacao

**File**: `app/day/[date].tsx` (modify)

**Requirements**:

FR-014, FR-015, FR-016, FR-017, FR-018, FR-020.

**Dependencies**:

T013, T042, T043.

**Before** (line 8):

```typescript
import { createNoteEcho } from "../../src/features/notes/api/create-note-echo";
import { deleteNoteEcho } from "../../src/features/notes/api/delete-note-echo";
```

**After**:

```typescript
import { continueNote } from "../../src/features/notes/api/continue-note";
import { createNoteEcho } from "../../src/features/notes/api/create-note-echo";
import { deleteNoteEcho } from "../../src/features/notes/api/delete-note-echo";
```

**Before** (line 16):

```typescript
import type { NoteEchoCandidate, RelatedNote } from "../../src/types/note";
```

**After**:

```typescript
import type {
  ContinueNoteInput,
  NoteEchoCandidate,
  RelatedNote,
} from "../../src/types/note";
```

**Before** (line 84):

```typescript
  const [isEchoPickerVisible, setIsEchoPickerVisible] = useState(false);
  const [echoFeedbackMessage, setEchoFeedbackMessage] = useState<string | null>(
    null,
  );
```

**After**:

```typescript
  const [isEchoPickerVisible, setIsEchoPickerVisible] = useState(false);
  const [isContinueNoteEditorVisible, setIsContinueNoteEditorVisible] =
    useState(false);
  const [isContinuingNote, setIsContinuingNote] = useState(false);
  const [continueNoteErrorMessage, setContinueNoteErrorMessage] = useState<
    string | null
  >(null);
  const [echoFeedbackMessage, setEchoFeedbackMessage] = useState<string | null>(
    null,
  );
```

**Before** (line 224):

```typescript
  useEffect(() => {
    setIsEchoPickerVisible(false);
    setEchoFeedbackMessage(null);
  }, [activeNote?.id, resolvedDate]);
```

**After**:

```typescript
  const handleContinueNote = useCallback(
    async (draft: ContinueNoteInput) => {
      if (!activeNote || !session?.userId) {
        return;
      }

      setIsContinuingNote(true);
      setContinueNoteErrorMessage(null);

      try {
        const result = await continueNote(draft);

        if (!result.ok) {
          setContinueNoteErrorMessage(result.errorMessage);
          return;
        }

        setIsContinueNoteEditorVisible(false);
        setEchoFeedbackMessage("Nota continuada.");

        if (result.newNote.day === resolvedDate) {
          await reload();
          openReader("note", result.newNote.id);
          return;
        }

        closeReader();
        closeEditor();
        setPendingReaderOpen({
          noteId: result.newNote.id,
          noteDay: result.newNote.day,
          requestId: `${result.newNote.id}:${Date.now()}`,
          sessionUserId: session.userId,
          actionOrigin: "continue_note_created",
        });
        router.push(`/day/${result.newNote.day}`);
      } finally {
        setIsContinuingNote(false);
      }
    },
    [
      activeNote,
      closeEditor,
      closeReader,
      openReader,
      reload,
      resolvedDate,
      router,
      session?.userId,
      setPendingReaderOpen,
    ],
  );

  useEffect(() => {
    setIsEchoPickerVisible(false);
    setIsContinueNoteEditorVisible(false);
    setContinueNoteErrorMessage(null);
    setEchoFeedbackMessage(null);
  }, [activeNote?.id, resolvedDate]);
```

**Before** (line 440):

```typescript
      onAddEcho={() => {
        setEchoFeedbackMessage(null);
        setIsEchoPickerVisible(true);
      }}
```

**After**:

```typescript
      onAddEcho={() => {
        setEchoFeedbackMessage(null);
        setIsEchoPickerVisible(true);
      }}
      onContinueNote={() => {
        setContinueNoteErrorMessage(null);
        setIsContinueNoteEditorVisible(true);
      }}
      isContinueNoteEditorVisible={isContinueNoteEditorVisible}
      isContinuingNote={isContinuingNote}
      continueNoteErrorMessage={continueNoteErrorMessage}
      onCloseContinueNoteEditor={() => {
        setIsContinueNoteEditorVisible(false);
      }}
      onSubmitContinueNote={handleContinueNote}
```

**Verification**:

`corepack pnpm run test -- continue-note-flow note-echo-navigation`.

---

### T040: Adicionar teste de integracao para Continuar desta nota

**File**: `tests/integration/day/continue-note-flow.test.tsx` (new)

**Requirements**:

FR-014, FR-015, FR-016, FR-017, FR-018, SC-005, SC-006.

**Dependencies**:

T038, T042, T043, T044.

```typescript
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import ProtectedDayRoute from "../../../app/day/[date]";
import { useAuthStore } from "../../../src/stores/auth-store";
import { useCalendarStore } from "../../../src/stores/calendar-store";
import { useNavigationStore } from "../../../src/stores/navigation-store";
import { useUIStore } from "../../../src/stores/ui-store";
import type { AuthenticatedSession } from "../../../src/types/auth";
import {
  buildNote,
  buildNoteEcho,
  NOTE_ECHO_FIXTURE_USER_ID,
  NOTE_ECHO_SOURCE_DAY,
  NOTE_ECHO_TARGET_DAY,
} from "../../support/note-echo-fixtures";
import { createSupabaseNoteEchoMock } from "../../support/supabase-note-echo-mock";

const mockRouter = { replace: jest.fn(), push: jest.fn() };
const mockSearchParams: { date?: string | string[] } = { date: NOTE_ECHO_SOURCE_DAY };
const mockSupabase = createSupabaseNoteEchoMock();

jest.mock("expo-router", () => {
  const React = jest.requireActual("react");
  const { Text } = jest.requireActual("react-native");

  return {
    Redirect: ({ href }: { href: string }) =>
      React.createElement(Text, { testID: "redirect-target" }, String(href)),
    useLocalSearchParams: () => mockSearchParams,
    useRouter: () => mockRouter,
  };
});

jest.mock("../../../src/lib/supabase", () => ({
  getSupabaseClient: () => mockSupabase.client,
  getSupabaseConfigurationError: () => null,
  isSupabaseConfigured: true,
}));

jest.mock("../../../src/features/auth/api/sign-out", () => ({
  signOut: jest.fn(async () => ({
    ok: true,
    status: "unauthenticated",
    errorMessage: null,
  })),
}));

const authenticatedSession: AuthenticatedSession = {
  userId: NOTE_ECHO_FIXTURE_USER_ID,
  email: "pessoa@echotes.app",
  accessToken: "access-token",
  refreshToken: "refresh-token",
};

const sourceNote = buildNote({
  id: "10000000-0000-4000-8000-000000000001",
  title: "Nota aberta",
  day: NOTE_ECHO_SOURCE_DAY,
});

const sameDayNote = buildNote({
  id: "10000000-0000-4000-8000-000000000099",
  title: "Continuidade mesmo dia",
  day: NOTE_ECHO_SOURCE_DAY,
});

const futureNote = buildNote({
  id: "10000000-0000-4000-8000-000000000100",
  title: "Continuidade futura",
  day: NOTE_ECHO_TARGET_DAY,
});

const flushMicrotasks = async (passes = 5) => {
  for (let pass = 0; pass < passes; pass += 1) {
    await act(async () => {
      await Promise.resolve();
    });
  }
};

const openSourceReader = async () => {
  jest.useFakeTimers();
  fireEvent.press(screen.getByTestId(`timeline-node-${sourceNote.id}:note`));
  await act(async () => {
    jest.advanceTimersByTime(250);
  });
  jest.useRealTimers();
  await flushMicrotasks();
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParams.date = NOTE_ECHO_SOURCE_DAY;
  mockSupabase.reset();
  mockSupabase.setTableRows("notes", [sourceNote]);
  mockSupabase.setTableRows("tasks", []);
  mockSupabase.setTableRows("note_echoes", []);
  useCalendarStore.setState({
    selectedDate: NOTE_ECHO_SOURCE_DAY,
    clockDate: NOTE_ECHO_SOURCE_DAY,
  });
  useNavigationStore.setState({
    temporalNavigationContext: null,
    pendingReaderOpen: null,
  });
  useUIStore.setState({
    activeTab: "timeline",
    readerState: { kind: null, id: null, isOpen: false },
    editorState: { mode: null, kind: null, id: null, isOpen: false },
  });
  useAuthStore.setState({
    status: "authenticated",
    session: authenticatedSession,
    errorMessage: null,
    hasHydrated: true,
    isRestoring: false,
    isAuthenticated: true,
  });
});

afterEach(() => {
  cleanup();
  jest.useRealTimers();
});

describe("continue note flow", () => {
  it("salva continuacao no mesmo dia e abre Reader da nota criada", async () => {
    mockSupabase.enqueueRpcResult(
      "continue_note",
      mockSupabase.ok({
        newNote: sameDayNote,
        noteEcho: buildNoteEcho({
          from_note_id: sourceNote.id,
          to_note_id: sameDayNote.id,
          kind: "continue_note",
        }),
      }),
    );

    render(<ProtectedDayRoute />);
    await flushMicrotasks();
    await openSourceReader();

    fireEvent.press(screen.getByTestId("note-reader-continue-note-button"));
    fireEvent.changeText(screen.getByTestId("continue-note-title-input"), sameDayNote.title);
    fireEvent.changeText(screen.getByTestId("continue-note-brief-input"), "Briefing editado");
    fireEvent.press(screen.getByTestId("continue-note-save-button"));

    await waitFor(() => {
      expect(screen.getByText("Nota continuada.")).toBeTruthy();
    });
    expect(mockSupabase.rpcCalls[0].payload).toMatchObject({
      new_note_day: NOTE_ECHO_SOURCE_DAY,
      title: sameDayNote.title,
      brief: "Briefing editado",
    });
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("navega para dia futuro com pendingReaderOpen de consumo unico", async () => {
    mockSupabase.enqueueRpcResult(
      "continue_note",
      mockSupabase.ok({
        newNote: futureNote,
        noteEcho: buildNoteEcho({
          from_note_id: sourceNote.id,
          to_note_id: futureNote.id,
          kind: "continue_note",
        }),
      }),
    );

    render(<ProtectedDayRoute />);
    await flushMicrotasks();
    await openSourceReader();

    fireEvent.press(screen.getByTestId("note-reader-continue-note-button"));
    fireEvent.changeText(screen.getByTestId("continue-note-day-input"), NOTE_ECHO_TARGET_DAY);
    fireEvent.press(screen.getByTestId("continue-note-save-button"));

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(`/day/${NOTE_ECHO_TARGET_DAY}`);
    });
    expect(useNavigationStore.getState().pendingReaderOpen).toMatchObject({
      noteId: futureNote.id,
      noteDay: NOTE_ECHO_TARGET_DAY,
      sessionUserId: authenticatedSession.userId,
      actionOrigin: "continue_note_created",
    });
  });
});
```

**Verification**:

`corepack pnpm run test -- continue-note-flow`.

---

### T045: Garantir que notas continuadas nao criam ghost card nem campos de tarefa

**File**: `tests/unit/timeline/derive-timeline-nodes-regression.test.ts` (modify)

**Requirements**:

FR-018, SC-006.

**Dependencies**:

T021, T044.

**Before** (line 151):

```typescript
});
```

**After**:

```typescript
  // @req 002-note-echo-flows:FR-018
  // @req 002-note-echo-flows:SC-006
  it("mantem nota continuada como node note sem ghost card ou campos de tarefa", () => {
    const continuedNote = buildNote({
      id: "10000000-0000-4000-8000-000000000099",
      day: targetDay,
      title: "Nota continuada",
      created_at: `${targetDay}T09:00:00+00:00`,
      updated_at: `${targetDay}T09:00:00+00:00`,
    });

    const nodes = deriveTimelineNodes({
      selectedDay: targetDay,
      notes: [continuedNote],
      tasks: [],
    });

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      type: "note",
      itemKind: "note",
      itemId: continuedNote.id,
      scheduledAt: null,
    });
    expect(nodes[0]).not.toHaveProperty("source_day");
    expect(nodes[0]).not.toHaveProperty("target_day");
    expect(nodes[0]).not.toHaveProperty("scheduled_at");
    expect(nodes[0]).not.toHaveProperty("side");
  });
});
```

**Verification**:

`corepack pnpm run test -- derive-timeline-nodes-regression projected-task-nodes`.

---

## Phase 6: Polimento e Itens Transversais

**Terreno antes da Phase 6**:

- Phase 5 esta fechada em `tasks.md` ate T045, incluindo a correcao de
  `pendingReaderOpen` para dia futuro.
- A fase e documental/transversal por padrao. Nao adicionar nova capacidade de
  produto nesta fase.
- `001-auth-day-surface` permanece baseline fechado. Tags e testes herdados do
  baseline podem continuar existindo, mas nao provam rastreabilidade desta
  feature sem o prefixo `002-note-echo-flows:`.

### T046: Normalizar @req feature-scoped dos testes novos

**File**:

- `tests/unit/notes/note-echo-relations.test.ts`
- `tests/unit/day/use-day-entries.test.tsx`
- `tests/unit/timeline/timeline-view.test.tsx`
- `tests/unit/notes/note-reader-relations.test.tsx`
- `tests/integration/day/note-echo-navigation.test.tsx`
- `tests/unit/notes/list-note-candidates.test.ts`
- `tests/unit/notes/create-note-echo.test.ts`
- `tests/unit/notes/delete-note-echo.test.ts`
- `tests/integration/day/note-echo-management.test.tsx`
- `tests/unit/notes/build-continue-note-brief.test.ts`
- `tests/unit/docs/documentation-contracts.test.ts`
- `tests/unit/notes/continue-note.test.ts`
- `tests/integration/day/continue-note-flow.test.tsx`
- `tests/unit/timeline/derive-timeline-nodes-regression.test.ts`
- `tests/unit/notes/note-echo-api.test.ts`, se o arquivo ainda guardar
  contratos tecnicos da feature apos os debitos ja fechados.

**Requirements**:

FR-001 a FR-024, SC-001 a SC-006.

**Dependencies**:

T015 a T040.

**Implementation**:

Converter ou adicionar os comentarios dos testes da feature para o formato
`@req 002-note-echo-flows:FR-014` e `@req 002-note-echo-flows:SC-005`,
preservando uma tag por linha. Nao converter em massa suites herdadas do
baseline; converter apenas asserts que provam comportamento de
`002-note-echo-flows`.

Mapa minimo de rastreabilidade por suite:

| Suite | Requisitos esperados |
|-------|----------------------|
| `note-echo-relations.test.ts` | FR-003, FR-005, FR-008, SC-002 |
| `use-day-entries.test.tsx` | FR-001, FR-002, FR-003, FR-004, SC-001 |
| `timeline-view.test.tsx` | FR-002, FR-003, FR-019, FR-020, SC-001, SC-006 |
| `note-reader-relations.test.tsx` | FR-004, FR-010, FR-011, FR-021, SC-001 |
| `note-echo-navigation.test.tsx` | FR-011, FR-012 |
| `list-note-candidates.test.ts` | FR-022, FR-023, SC-004 |
| `create-note-echo.test.ts` | FR-006, FR-007, FR-008, FR-010, SC-002 |
| `delete-note-echo.test.ts` | FR-009, SC-003 |
| `note-echo-management.test.tsx` | FR-006, FR-009, FR-013, FR-022, FR-023, SC-003, SC-004 |
| `build-continue-note-brief.test.ts` | FR-014, FR-017, SC-005 |
| `documentation-contracts.test.ts` | FR-016, FR-018, SC-005 |
| `continue-note.test.ts` | FR-014, FR-015, FR-016, FR-017, FR-018, SC-005 |
| `continue-note-flow.test.tsx` | FR-014, FR-015, FR-016, FR-017, FR-018, SC-005, SC-006 |
| `derive-timeline-nodes-regression.test.ts` | FR-018, FR-023, FR-024, SC-006 |

Cobertura obrigatoria dos criterios de sucesso:

| Criterio | Evidencia minima feature-scoped |
|----------|---------------------------------|
| `SC-001` | `use-day-entries.test.tsx`, `timeline-view.test.tsx` e `note-reader-relations.test.tsx` devem cobrir que ecos carregados no dia aparecem como contagem direta visivel na timeline e levam ao Reader contextual de notas conectadas. Como o tempo de 30 segundos depende de QA humano, Phase 6 deve registrar a evidencia automatizada como proxy e explicitar se QA cronometrado foi executado ou nao. |
| `SC-002` | `note-echo-relations.test.ts` e `create-note-echo.test.ts` devem cobrir auto-relacao, duplicidade direta/invertida, ausencia de conexao invalida e feedback `Eco ja existe`. |
| `SC-003` | `delete-note-echo.test.ts` e `note-echo-management.test.tsx` devem cobrir confirmacao, remocao apenas da relacao e preservacao das notas. |
| `SC-004` | `list-note-candidates.test.ts` e `note-echo-management.test.tsx` devem cobrir candidata ja conectada desabilitada, lote acima de 50 e `carregar mais`. Como o tempo de 1 minuto depende de QA humano, Phase 6 deve registrar a evidencia automatizada como proxy e explicitar se QA cronometrado foi executado ou nao. |
| `SC-005` | `build-continue-note-brief.test.ts`, `documentation-contracts.test.ts`, `continue-note.test.ts` e `continue-note-flow.test.tsx` devem cobrir mesmo dia, dia futuro, relacao visivel ao final e falha sem nota orfa. Como o tempo de 2 minutos depende de QA humano, Phase 6 deve registrar a evidencia automatizada como proxy e explicitar se QA cronometrado foi executado ou nao. |
| `SC-006` | `timeline-view.test.tsx`, `continue-note-flow.test.tsx` e `derive-timeline-nodes-regression.test.ts` devem cobrir contagem direta na timeline e ausencia de ghost card, `source_day`, `target_day`, `scheduled_at` ou comportamento de tarefa para notas. |

Se `FR-024` ou `SC-006` estiverem cobertos apenas por
`tests/integration/day/ghost-navigation.test.tsx`, manter a suite como
regressao de baseline e adicionar cobertura feature-scoped em
`derive-timeline-nodes-regression.test.ts` ou em uma suite de integracao da
feature. A Phase 6 nao deve depender de tags sem prefixo.

**Verification**:

Executar:

```powershell
rg -n "@req 002-note-echo-flows:(FR|SC)-" tests/unit tests/integration/day
rg -n "@req 002-note-echo-flows:SC-00[1-6]" tests/unit tests/integration/day
rg -n "@req (FR|SC)-" tests/unit/notes tests/unit/day tests/unit/timeline tests/integration/day/continue-note-flow.test.tsx tests/integration/day/note-echo-management.test.tsx tests/integration/day/note-echo-navigation.test.tsx
```

O primeiro comando precisa listar as suites da tabela. O segundo comando deve
conter pelo menos uma ocorrencia feature-scoped para cada `SC-001`..`SC-006`;
ausencia de qualquer SC bloqueia T046 e deve ser corrigida na suite apropriada,
nao justificada por cobertura baseline-only. O terceiro comando deve ser
revisado: qualquer match em suite nova da feature precisa ser convertido ou
justificado no bloco de evidencia final como tag herdada fora do escopo.

---

### T047: Atualizar canon vigente

**File**: canones executaveis em `docs-canonical/`:
`REQUIREMENTS.md`, `ARCHITECTURE.md`, `DATA-MODEL.md`, `TEST-SPEC.md` e
`SECURITY.md` quando RLS/RPC for afetado (modify). Documentos de
governanca/status da raiz aplicaveis: `README.md`, `CURRENT-STATE.md`,
`ROADMAP.md`, `CHANGELOG.md` e `DRIFT-LOG.md` (modify if needed).

**Requirements**:

FR-001 a FR-024, SC-001 a SC-006.

**Dependencies**:

Historias implementadas e verificadas.

**Implementation**:

Atualizar o canon vigente conforme a constituicao 2.1.0: os canones
executaveis vivem em `docs-canonical/*`; a raiz guarda governanca, status,
operacao e historico; `docs/` permanece acervo historico. Usar
`specs/002-note-echo-flows/spec.md`, `plan.md`, `contracts/continue-note.md`,
codigo e testes como base. Nao usar `docs/` como autoridade para reabrir o
corte nem deixar que um documento de raiz substitua o conteudo executavel dos
canones em `docs-canonical/*`.

Conteudo esperado por arquivo:

| Arquivo | Atualizacao esperada |
|---------|----------------------|
| `README.md` | Registrar `002-note-echo-flows` como comportamento entregue no fluxo do dia, com Reader, ecos diretos, Adicionar eco, Remover eco e Continuar desta nota. |
| `CURRENT-STATE.md` | Mover US1, US2 e US3 para estado implementado, citando que Phase 6 e fechamento transversal e nao nova feature. |
| `ROADMAP.md` | Retirar o corte de backlog futuro e manter `@nota` inline como fora de escopo. |
| `docs-canonical/DATA-MODEL.md` | Documentar `note_echoes`, proveniencias internas `manual_link` e `continue_note`, `context_day` como proveniencia da acao, `notes.day` como unico dia de destino da nota continuada e ausencia de campos de tarefa. |
| `docs-canonical/ARCHITECTURE.md` | Descrever carregamento relacional em `useDayEntries`, derivacao de contagem direta, Reader contextual, navegacao cross-day e consumo unico de `pendingReaderOpen` apos a nota existir no dia carregado. |
| `docs-canonical/REQUIREMENTS.md` | Registrar os requisitos entregues de ecos diretos, gerenciamento manual, continuacao atomica e a exclusao de mencoes inline. |
| `docs-canonical/TEST-SPEC.md` | Listar as suites feature-scoped e os gates `lint`, `test`, `typecheck`, `doc:guard` e `doc:score`. |
| `docs-canonical/SECURITY.md` | Registrar trust boundary da RPC `public.continue_note`: `SECURITY DEFINER` com checks por `auth.uid()`, `search_path` fixo, grant minimo para usuario autenticado, falha unauthenticated/cross-user sem escrita parcial e ausencia de `service_role` no cliente. |

Se um documento de raiz resumir uma decisao tambem descrita em
`docs-canonical/*`, ele deve apontar para o canon executavel em vez de
contradize-lo ou substitui-lo. `docs/` nao deve ser alterado nesta Phase 6
salvo decisao explicita de auditoria documental, que deve ser registrada em
`CANON-MIGRATION-COVERAGE.md`.

**Verification**:

Executar revisao textual antes de T053/T054:

```powershell
rg -n "002-note-echo-flows|Continuar desta nota|Adicionar eco|Remover eco|note_echoes|continue_note|pendingReaderOpen|@nota|service_role" README.md CURRENT-STATE.md ROADMAP.md docs-canonical/REQUIREMENTS.md docs-canonical/ARCHITECTURE.md docs-canonical/DATA-MODEL.md docs-canonical/TEST-SPEC.md docs-canonical/SECURITY.md
```

O output precisa mostrar o comportamento entregue nos canones corretos e
manter `@nota` inline como fora de escopo. `service_role` nao pode aparecer
como requisito de cliente.

---

### T048: Consolidar CHANGELOG

**File**: `CHANGELOG.md` (modify)

**Requirements**:

Politica operacional do repo.

**Dependencies**:

T047.

**Implementation**:

Consolidar a entrada da feature sem duplicar historico ja registrado por
correcoes da Phase 5. A entrada deve citar:

- ecos diretos visiveis no fluxo do dia;
- Reader com notas conectadas e navegacao cross-day;
- `Adicionar eco`, candidatas desabilitadas, paginacao e `Remover eco`;
- `Continuar desta nota` por RPC atomica;
- preservacao de nota versus tarefa, sem ghost card, `source_day`,
  `target_day`, `scheduled_at` ou projecao temporal;
- gates executados em T050 a T054.

**Verification**:

```powershell
rg -n "002-note-echo-flows|Continuar desta nota|Adicionar eco|Remover eco|doc:score" CHANGELOG.md
```

---

### T049: Revisar DRIFT-LOG e CANON-MIGRATION-COVERAGE

**File**: `DRIFT-LOG.md`, `CANON-MIGRATION-COVERAGE.md` (modify if needed)

**Requirements**:

Politica operacional do repo.

**Dependencies**:

T047, T048.

**Implementation**:

Abrir os dois arquivos e decidir com evidencia:

- `DRIFT-LOG.md`: alterar somente se Phase 6 deixar desalinhamento temporario
  entre codigo executavel e canon vigente.
- `CANON-MIGRATION-COVERAGE.md`: alterar somente se T047 absorver ou
  reinterpretar conteudo historico vindo de `docs/`.

Se nenhum patch for necessario, nao fabricar entrada. Registrar no bloco final
que os arquivos foram revisados e permaneceram sem mudanca.

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

Executar:

```powershell
corepack pnpm run lint
```

Corrigir apenas violacoes causadas pela feature ou pela Phase 6.

**Verification**:

Exit code 0 e output real preservado para T055.

---

### T051: Executar test

**File**: `package.json` script `test` (already present)

**Requirements**:

Gate tecnico.

**Dependencies**:

T001 a T050.

**Implementation**:

Executar:

```powershell
corepack pnpm run test
```

Corrigir apenas regressoes no escopo de `002-note-echo-flows`.

**Verification**:

Exit code 0 e contagem de suites/testes preservada para T055.

---

### T052: Executar typecheck

**File**: `package.json` script `typecheck` (already present)

**Requirements**:

Gate tecnico.

**Dependencies**:

T001 a T051.

**Implementation**:

Executar:

```powershell
corepack pnpm run typecheck
```

Corrigir apenas erros TypeScript relacionados ao corte.

**Verification**:

Exit code 0 e output real preservado para T055.

---

### T053: Executar doc:guard

**File**: `package.json` script `doc:guard` (already present)

**Requirements**:

Gate documental.

**Dependencies**:

T047, T048, T049.

**Implementation**:

Executar:

```powershell
corepack pnpm run doc:guard
```

Guard vermelho bloqueia fechamento. A linha avulsa do Windows
`O sistema nao pode encontrar o caminho especificado.` so pode ser tratada como
ruido se o exit code for 0 e o relatorio DocGuard estiver PASS.

**Verification**:

PASS com exit code 0 e output real preservado para T055.

---

### T054: Executar doc:score

**File**: `package.json` script `doc:score` (already present)

**Requirements**:

Maturidade documental.

**Dependencies**:

T053.

**Implementation**:

Executar:

```powershell
corepack pnpm run doc:score
```

Preservar o output real no resumo final, sem mascarar score baixo se houver.

**Verification**:

Exit code e score real reportados em T055.

---

### T055: Registrar bloco de evidencia concreta de fechamento

**File**: resumo da PR/entrega (write outside source tree or PR body)

**Requirements**:

Politica de fechamento da branch.

**Dependencies**:

T047, T048, T049, T050, T051, T052, T053, T054.

**Implementation**:

Registrar no resumo da PR ou entrega, fora dos arquivos de codigo, um bloco com
estes itens:

- status de T046, incluindo suites com tags `@req 002-note-echo-flows:*`;
- paths de canones executaveis alterados em `docs-canonical/*`;
- paths de docs de governanca/status da raiz alterados em T047;
- resultado da revisao de `DRIFT-LOG.md` e `CANON-MIGRATION-COVERAGE.md`;
- comandos exatos de T050 a T054, exit code, contagem de testes e score;
- evidencia de que `public.continue_note` cria nota e eco em transacao atomica
  e que falhas nao deixam nota orfa;
- confirmacao de que DocGuard PASS foi necessario, mas nao usado como prova
  unica de alinhamento semantico;
- confirmacao explicita de que Phase 6 nao implementou Phase 7 nem reabriu
  `001-auth-day-surface`.

**Verification**:

O bloco existe antes de declarar a branch fechada ou merge-ready e referencia
os outputs reais produzidos nesta fase.

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
- [X] T015: Adicionar testes unitarios de contagem direta, par invertido e ordenacao
- [X] T016: Adicionar teste de useDayEntries carregando note_echoes ligados as notas do dia
- [X] T017: Adicionar teste de NoteCardReal exibindo badge Ecos somente quando directEchoCount maior que zero
- [X] T018: Adicionar teste de Reader com notas conectadas, item indisponivel e recarregar
- [X] T019: Adicionar teste de integracao para abrir nota conectada de outro dia e reabrir Reader no destino
- [X] T020: Atualizar useDayEntries para carregar note_echoes relacionados as notas do dia
- [X] T021: Atualizar useDayTimeline para derivar directEchoCount e dados relacionais sem alterar TimelineNode.side
- [X] T022: Atualizar NoteCardReal para receber e renderizar badge Ecos com contagem direta
- [X] T023: Atualizar TimelineView para repassar contagem direta para cards de nota
- [X] T024: Atualizar NoteReader para exibir lista de notas conectadas, item indisponivel e acao de recarregar
- [X] T025: Adicionar estado pendente de abertura de nota conectada em navigation-store
- [X] T026: Integrar navegacao cross-day de nota conectada e reabertura do Reader
- [X] T027: Atualizar DayShell para passar dados e handlers relacionais ao Reader
- [ ] T028: Adicionar testes unitarios de listagem paginada e candidatas desabilitadas
- [ ] T029: Adicionar testes unitarios de createNoteEcho para self-link, duplicidade invertida e kind original
- [ ] T030: Adicionar testes unitarios de deleteNoteEcho para confirmacao e remocao sem apagar notas
- [ ] T031: Adicionar teste de integracao do fluxo Adicionar eco, carregar mais, Eco ja existe e Remover eco
- [ ] T032: Implementar seletor de candidatas com lotes de 50, carregar mais e candidatos desabilitados
- [ ] T033: Integrar acao Adicionar eco ao NoteReader
- [ ] T034: Implementar confirmacao de Remover eco no NoteReader
- [ ] T035: Integrar createNoteEcho, deleteNoteEcho, reload e feedback Eco ja existe
- [ ] T036: Garantir que remocao de eco atualiza contagem e lista sem apagar notas
- [X] T037: Adicionar testes unitarios de buildContinueNoteBrief
- [ ] T041: Criar migration da RPC atomica continue_note
- [ ] T013: Criar API de continuacao atomica via rpc
- [ ] T039: Adicionar teste de contrato da migration RPC
- [ ] T038: Adicionar testes unitarios de continueNote rpc sucesso e falha sem nota orfa
- [ ] T040: Adicionar teste de integracao para Continuar desta nota no mesmo dia e em dia futuro
- [ ] T042: Implementar formulario modal de continuacao com newNoteDay editavel e generatedBrief
- [X] T043: Integrar acao Continuar desta nota ao NoteReader
- [ ] T044: Integrar fluxo de continuacao, rpc, reload e navegacao ao dia destino
- [ ] T045: Garantir que notas continuadas nao criam ghost card, source_day ou target_day
- [ ] T046: Atualizar @req dos novos testes com tags feature-scoped 002-note-echo-flows
- [ ] T047: Atualizar canon vigente quando o comportamento estiver implementado
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
