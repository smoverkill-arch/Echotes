# Tech Debt Report: 002-note-echo-flows

**Generated**: 2026-05-06
**Feature**: `specs/002-note-echo-flows`
**Spec Reference**: `specs/002-note-echo-flows/spec.md`

## Executive Summary

| Severity | Count | Immediate Action Required |
|----------|-------|---------------------------|
| Critical | 0 | None |
| Large | 0 | None; TD006 was remediated with a forward Supabase migration in TD014, TD008 was remediated in the targeted Tech Debt pass and TD015 now performs query-boundary pagination |
| Medium | 0 | None; TD011, TD013, TD016 and TD017 were remediated with stateful shared mock coverage |
| Small | 0 | None |

## Large Issues Requiring Analysis

### ISSUE-001: Candidate pagination contract is not settled

**Status**: Resolved on 2026-05-06 by implementing stable cursor pagination in
`listNoteCandidates` and covering first page, next page, selected-day priority
and `Eco ja existe` marking in `tests/unit/notes/note-echo-api.test.ts`.

**Category**: Architecture / Design
**Location**: `src/features/notes/api/list-note-candidates.ts`
**Related Spec**: FR-023 and `contracts/note-relations.md`
**Constitution Impact**: Principle II requires preserving the day-centered surface; Principle IV requires critical coverage for persistence and Reader-related behavior.

#### Problem Description

At cleanup time, Phase 2 marked T010 as complete, but `listNoteCandidates`
accepted a cursor and returned `nextCursor` while always loading the first
range. The implementation also cut the page before applying the selected-day
priority. That meant the visible first page could omit selected-day candidates,
and the next page could repeat the first page.

The feature contract requires a stable candidate cursor and day-context anchoring. That makes this more than a small patch: the team needs to choose how the data contract should express "selected day first, then other recent notes" under pagination.

#### Impact if Not Addressed

- `carregar mais` can repeat the same candidates instead of advancing.
- Notes from the selected day can be excluded from the first visible batch even though the UI contract says they have priority.
- Disabled `Eco ja existe` states can be computed over an unstable page, making manual echo creation harder to reason about.
- Tests in later US2 tasks can pass against a simplified mock while production pagination still violates the contract.

#### Options

**Option 1: Two-group pagination (Recommended)**
- **Approach**: Treat selected-day candidates and other-day candidates as two deterministic groups. Page through selected-day candidates first using `(created_at, id)`, then page through other days using `(day, created_at, id)`. Encode group state in the cursor.
- **Pros**: Preserves the day-centered UX directly; cursor matches visible order; no RPC required for the first cut.
- **Cons**: More client-side query orchestration; cursor shape must be explicit and tested.
- **Effort**: M
- **Risk**: Medium

**Option 2: Database/RPC-backed candidate query**
- **Approach**: Move the selected-day priority and stable seek pagination into a SQL function or view-like query that returns candidates in the exact UI order.
- **Pros**: One authoritative order; easier to keep pagination consistent once implemented; better fit if candidate volume grows.
- **Cons**: Adds SQL/migration work outside the intended Phase 2 scope; may conflict with the current decision to keep SQL for T041/T039.
- **Effort**: L
- **Risk**: Medium

**Option 3: Reduce T010 formally**
- **Approach**: Change T010 to support only first-page loading for Phase 2 and move real cursor pagination to a later task before US2.
- **Pros**: Honest scope; smaller immediate implementation; avoids pretending cursor is done.
- **Cons**: US2 cannot claim `carregar mais` until the follow-up task is complete.
- **Effort**: S
- **Risk**: Low, if documented clearly

#### Recommendation

Use Option 1 unless implementation pressure requires formal scope reduction. The current API already exposes a cursor type, so the least disruptive path is to make that cursor true: selected-day group first, deterministic seek keys, and tests proving first page, next page, and `Eco ja existe` across page boundaries.

If Option 1 is not implemented before US1/T015+, mark T010 as partially complete and add an explicit task before US2 candidate-picker work.

## Medium Issues Recorded Before Correction

**Source**: `/speckit.review.run "code errors tests"` after the first tech debt remediation pass.
**Recorded**: 2026-05-06
**Status**: Completed in the targeted Tech Debt pass. Follow-up audit reopened
TD006, TD008 and TD011; the final remediation closed TD006, TD008, TD011 and
TD013 before US1/T015+.

| Task | Review Finding | Location | Required Action |
|------|----------------|----------|-----------------|
| TD006 | P1 Owner field still comes from client state | `src/features/notes/api/create-note-echo.ts` | Stop sending client-derived owner fields or move manual echo creation behind a server-derived owner path; test that the payload has no `created_by_user_id` or user id. |
| TD007 | P1 Broad duplicate classification | `src/features/notes/api/create-note-echo.ts` | Accept only structured unique violation signals such as `code = 23505`; test that textual `unique`/`duplicate` technical errors remain retryable. |
| TD008 | P1 Access errors become retryable | `src/features/notes/api/create-note-echo.ts`, `delete-note-echo.ts`, `list-note-candidates.ts`, `list-note-echoes.ts` | Add shared error classification so auth/JWT/RLS/permission errors are not treated as retryable transport failures. |
| TD009 | P1 Missing related note is treated as transient | `src/features/notes/api/list-note-echoes.ts` | Do not label omitted rows from a successful details query as `transient_unavailable` without prior endpoint authorization evidence; update tests that currently allow this. |
| TD010 | P2 Read preflight tests are incomplete | `tests/unit/notes/note-echo-api.test.ts` | Add tests for `listNoteCandidates` without session and config-error paths for read APIs. |
| TD011 | P2 Adjacent relation behavior is not proven | `tests/unit/notes/note-echo-api.test.ts` | Add behavioral A-B/A-C test through the shared mock proving adjacent relations are preserved. |

These tasks intentionally record the review findings before correction. Later
`/speckit.review.run "code errors tests"` passes found that TD006, TD008 and
TD011 were not fully closed. The final targeted pass closed TD006, TD008, TD011
and TD013.

## Latest Review Findings Recorded Before Correction

**Source**: `/speckit.review.run "code errors tests"` after TD006-TD011 remediation.
**Recorded**: 2026-05-06
**Status**: Completed after this audit. TD006, TD008, TD011 and TD013 were
closed in the targeted Tech Debt pass; TD012 remains closed.

| Task | Review Finding | Location | Required Action |
|------|----------------|----------|-----------------|
| TD006 / TD014 | P1 Manual insert became incompatible with existing remote databases | `src/features/notes/api/create-note-echo.ts`, `supabase/migrations/001_auth_day_surface.sql`, `supabase/migrations/002_note_echo_owner_default.sql` | Completed: client no longer sends owner fields, baseline 001 documents server-derived ownership for fresh databases, and forward migration 002 applies `default auth.uid()` to existing projects while RLS still checks `created_by_user_id = auth.uid()`. |
| TD008 | P1 Read APIs still lose auth/RLS classification | `src/features/notes/api/list-note-echoes.ts`, `src/features/notes/api/list-note-candidates.ts` | Completed: read APIs use shared note echo error classification for 401, 403, JWT, RLS and permission failures. |
| TD008 | P1 Reconciliation failures are always retryable | `src/features/notes/api/create-note-echo.ts`, `src/features/notes/api/delete-note-echo.ts` | Completed: duplicate-create and delete reconciliation now propagate classified reload statuses. |
| TD012 | P2 Read-query auth/RLS tests are missing | `tests/unit/notes/note-echo-api.test.ts` | Completed: tests enqueue 401, 403, JWT, RLS and permission errors from read queries after preflight succeeds. |
| TD011 | P2 Adjacent relation test only checks the OR string | `tests/unit/notes/note-echo-api.test.ts`, `tests/support/supabase-note-echo-mock.ts` | Completed through TD013: shared mock now maintains real `note_echoes` rows and proves A-C survives deleting A-B. |

## Latest Worker Review Findings

**Source**: Worker reviewer executing `/speckit.review.run "code errors tests"` for implemented TD011 and TD012 only.
**Recorded**: 2026-05-06
**Status**: TD012 closed; TD011 and TD013 closed in the final targeted Tech
Debt pass.

| Task | Review Finding | Location | Required Action |
|------|----------------|----------|-----------------|
| TD011 | P2 Adjacent A-C preservation is still preprogrammed by the queued mock response instead of proven through a stateful shared mock delete/list operation | `tests/unit/notes/note-echo-api.test.ts`, `tests/support/supabase-note-echo-mock.ts` | Completed: the shared mock now applies exact semantic pair matching over stored rows and the regression no longer enqueues the post-delete result manually. |
| TD012 | No finding | `tests/unit/notes/note-echo-api.test.ts` | Keep closed: coverage includes 401, 403, JWT, RLS and permission errors for listNoteEchoes, listRelatedNoteDetails and listNoteCandidates after preflight succeeds. |

## Latest Branch Review Findings Recorded Before Correction

**Source**: `/speckit.review.run` scoped to this branch after Supabase local and
remote migration setup.
**Recorded**: 2026-05-06
**Status**: Completed before US1/T015+.

| Task | Review Finding | Location | Required Action |
|------|----------------|----------|-----------------|
| TD015 | P1 T010 still paginated in memory after reading all accessible notes | `src/features/notes/api/list-note-candidates.ts` | Completed: candidate loading now uses selected-day and other-day groups with `range(0, pageSize)` and cursor filters before mapping rows. |
| TD016 | P2 shared Supabase mock ignored `neq` in stateful paths | `tests/support/supabase-note-echo-mock.ts` | Completed: the mock now applies `eq`, `neq`, `in`, cursor `or`, ordering and range over stored rows. |
| TD017 | P2 integration duplicated Supabase mock behavior | `tests/integration/day/day-surface-same-day.test.tsx` | Completed: same-day integration now uses `createSupabaseNoteEchoMock` with deterministic insert/RPC handlers. |
| TD018 | P2 runbook omitted hardening migration and manual migration history repair | `RUNBOOKS.md`, `specs/002-note-echo-flows/quickstart.md` | Completed: operational docs list migration 003 and require `supabase migration repair` after manual console application. |
| TD019 | P2 read failure status remained optional in types | `src/features/notes/api/list-note-echoes.ts`, `src/features/notes/api/list-note-candidates.ts` | Completed: read results are discriminated unions and failures require `SupabaseNoteEchoFailure`. |
| TD020 | P2 invalid payload coverage was incomplete | `src/features/notes/api/create-note-echo.ts`, `src/features/notes/api/delete-note-echo.ts`, `tests/unit/schemas/note.schema.test.ts` | Completed: malformed create/delete inputs return `invalid_input` before Supabase and schemas cover required persisted fields. |
| TD021 | P2 plain-object Supabase errors could lose their message text | `src/features/notes/api/note-echo-errors.ts`, `tests/unit/notes/note-echo-api.test.ts` | Completed: error message extraction now handles Error instances and Supabase-style plain objects. |

## Full speckit-review-run Findings — Recorded Before Correction

**Source**: `/speckit-review-run` (6 agentes: code, errors, types, tests, comments, simplify) sobre o diff completo da branch `002-note-echo-flows` vs `main`.
**Recorded**: 2026-05-06
**Status**: Aberto — aguardando correção antes de US1/T015+.

### Críticos — devem ser corrigidos antes do merge

| Task | Agente | Arquivo | Linha | Finding |
|------|--------|---------|-------|---------|
| TD022 | code | `src/features/notes/api/list-note-candidates.ts` | 57–61 | `String(row.id/day/title/created_at)` converte `undefined` → `"undefined"` que passa validação UUID/date do Zod — injeta IDs e datas corrompidas no sistema. Usar `typeof` guards. |
| TD023 | code | `src/features/notes/utils/note-echo-relations.ts` | 78–102 | `sortRelatedNotes` acessa `left.day`/`right.day` sem null-guard; o tipo `UnavailableRelatedNote` tem `day: null` — crash em runtime quando construído. |
| TD024 | errors | `src/features/notes/api/note-echo-errors.ts` | 29–56 | `classifySupabaseNoteEchoError` nunca retorna `invalid_input`; FK violations (23503), NOT NULL (23502) e erros 400 caem em `retryable_failure`. |
| TD025 | errors | `src/features/notes/api/note-echo-errors.ts` | 67–76 | `preflightNoteEchoSupabaseAccess` retorna `retryable_failure` para config ausente; ausência de config não resolve com retry — deve ser `not_accessible`. |
| TD026 | errors | `src/features/notes/api/create-note-echo.ts`, `delete-note-echo.ts` | 77–88, 61–72 | Falha em `listNoteEchoes` durante reconciliação não indica se o INSERT/DELETE primário ocorreu — estado ambíguo para o chamador. |

### Importantes — devem ser corrigidos

| Task | Agente | Arquivo | Linha | Finding |
|------|--------|---------|-------|---------|
| TD027 | errors | `src/features/notes/api/list-note-echoes.ts`, `list-note-candidates.ts` | 114–122, 207–216, 178–201 | Throws Zod dentro do try-block caem no catch genérico → classificados como `retryable_failure` quando são erros de integridade de dado. |
| TD028 | errors | `src/features/notes/api/list-note-candidates.ts` | 165–175 | Segunda chamada `fetchGroup()` sem catching individual — resultado parcial do primeiro grupo descartado em falha. |
| TD029 | types | `src/features/notes/api/create-note-echo.ts`, `delete-note-echo.ts` | 23–28, 19–23 | `CreateNoteEchoResult` e `DeleteNoteEchoResult` usam `ok: boolean` (Pattern B); TypeScript não faz narrowing de `echo: NoteEcho \| null`. Converter para Pattern A (`ok: true \| false`) como os tipos `List*`. |
| TD030 | tests | `tests/unit/notes/note-echo-api.test.ts` | — | GAP (9/10): `listRelatedNoteDetails` nunca constrói `UnavailableRelatedNote`; auth expiration perde o eco ao invés de marcá-lo como `transient_unavailable`. |
| TD033 | tests | `tests/unit/notes/note-echo-api.test.ts` | — | GAP (8/10): nenhum teste cobre transição de cursor entre grupo same-day e other-day — boundary crítico do `carregar mais`. |
| TD032 | tests | `tests/unit/notes/note-echo-api.test.ts` | — | GAP (8/10): `context_note_id` e `context_day` defaults nunca verificados — metadados de rastreabilidade de continuidade podem ser perdidos silenciosamente. |

### Médios — qualidade e cobertura

| Task | Agente | Arquivo | Linha | Finding |
|------|--------|---------|-------|---------|
| TD031 | tests | `tests/unit/notes/note-echo-api.test.ts` | — | GAP (8/10): deleção com eco invertido (B→A) não testada — `isSameSemanticNotePair` bidirecional sem cobertura explícita na verificação pós-delete. |
| TD034 | tests | `tests/unit/notes/note-echo-api.test.ts` | — | GAP (7/10): `isAlreadyConnected` não testado quando apenas eco B→A existe — usuário pode ver candidata como não-conectada e criar duplicata. |
| TD035 | tests | `tests/unit/notes/build-continue-note-brief.test.ts` | — | GAP (7/10): normalização de whitespace (tabs, `\n\n`, espaços consecutivos, brief all-whitespace) não coberta — saída determinística não garantida. |
| TD036 | tests | `tests/unit/notes/note-echo-api.test.ts` | — | GAP (7/10): eco malformado retornado pelo `listNoteEchoes` durante reconciliação 23505 não testado — falha de schema deve propagar como `retryable_failure`, não crash. |
| TD037 | simplify | `src/features/notes/api/list-note-candidates.ts` | 162–176 | Ternários aninhados violam constituição ("No nested ternaries — prefer if/else or early returns"); extrair `hasEnoughSameDayRows`, `otherDaysCursor`, `remainingSlots`. |
| TD038 | comments | `DATA-MODEL.md` | 12–13 | Comment rot: afirma que fluxos de eco "ainda pertencem a fases futuras" — branch implementa tudo. Enganoso para contribuidores futuros. |

## Cross-References

- **Specification**: `specs/002-note-echo-flows/spec.md`
- **Implementation Plan**: `specs/002-note-echo-flows/plan.md`
- **Tasks**: `specs/002-note-echo-flows/tasks.md`
- **Constitution**: `.specify/memory/constitution.md`

## Next Steps

1. Re-run `/speckit.review.run "code errors tests"` after remediation if a fresh
   audit pass is required before US1/T015+.
2. Re-run `/speckit.cleanup` to verify no remaining medium or large issues.
3. Use the stable cursor coverage in `tests/unit/notes/note-echo-api.test.ts`
   as the regression guard before US2 candidate-picker work.
