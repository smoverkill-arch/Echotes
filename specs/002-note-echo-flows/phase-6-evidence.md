# Phase 6 Evidence

## Scope

Phase 6 closed documentation, traceability and gates for `002-note-echo-flows`.
No Phase 7 behavior was implemented. `001-auth-day-surface` remains a closed
baseline record, not reopened backlog.

## T046 Requirement Tags

Status: done.

Feature-scoped `@req 002-note-echo-flows:*` tags were added or confirmed in the
feature test suites:

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

Coverage check:

```powershell
All 002-note-echo-flows FR-001..FR-024 and SC-001..SC-006 tags found.
```

Legacy unscoped tags remain only in baseline-oriented suites or non-feature NFR
contracts.

## T047 Canon Updates

Executable canons changed:

- `docs-canonical/REQUIREMENTS.md`: `002-note-echo-flows` FR/SC set, delivered
  echo and continuation behavior, inline `@nota` out of scope.
- `docs-canonical/ARCHITECTURE.md`: echo loading, direct counts, Reader
  relations, `pendingReaderOpen`, contextual navigation and RPC flow.
- `docs-canonical/DATA-MODEL.md`: `note_echoes`, `manual_link`,
  `continue_note`, `context_day`, `continue_note` RPC and migrations.
- `docs-canonical/SECURITY.md`: `public.continue_note` trust boundary,
  `security definer`, `auth.uid()`, fixed `search_path`, authenticated grant,
  no `service_role`, no partial write.
- `docs-canonical/TEST-SPEC.md`: feature suite map, `@req` convention and
  `doc:score` as report-only maturity signal.

Root docs changed:

- `README.md`
- `CURRENT-STATE.md`
- `ROADMAP.md`
- `CHANGELOG.md`
- `CANON-MIGRATION-COVERAGE.md`

`DRIFT-LOG.md` was reviewed and did not need a new drift entry.

## RPC And Migration Evidence

Contract evidence:

```powershell
supabase/migrations/004_note_echo_flows.sql:12:security definer
supabase/migrations/004_note_echo_flows.sql:13:set search_path = public
supabase/migrations/004_note_echo_flows.sql:16:current_user_id uuid := auth.uid()
supabase/migrations/004_note_echo_flows.sql:81:created_by_user_id
supabase/migrations/004_note_echo_flows.sql:107:grant execute on function public.continue_note(uuid, date, text, text, text) to authenticated
supabase/migrations/004_note_echo_flows.sql:110:-- drop function if exists public.continue_note(uuid, date, text, text, text)
tests/unit/docs/documentation-contracts.test.ts:124:expect(noteEchoFlowsSql).not.toContain("service_role")
```

The local Phase 6 pass verified the SQL and contract tests. It did not apply a
local database reset or remote migration push.

## Rollback, Orphans And Performance

Rollback/orphan behavior is covered by:

- `tests/unit/docs/documentation-contracts.test.ts`
- `tests/unit/notes/continue-note.test.ts`
- `tests/integration/day/continue-note-flow.test.tsx`

SC-001, SC-004 and SC-005 remain verified by automated regression proxies. No
manual timed QA run was added in Phase 6.

## Gates

```powershell
corepack pnpm run lint
```

Exit code: 0.

```powershell
corepack pnpm run test
```

Exit code: 0.

Result:

```text
Test Suites: 29 passed, 29 total
Tests:       144 passed, 144 total
Snapshots:   0 total
```

```powershell
corepack pnpm run typecheck
```

Exit code: 0.

```powershell
corepack pnpm run doc:guard
```

Exit code: 0.

Result:

```text
PASS — All 181 checks passed
Badge: CDD_Guard-179/182_passed
```

The command still prints the known Windows line after the PASS:

```text
O sistema não pode encontrar o caminho especificado.
```

```powershell
corepack pnpm run doc:score
```

Exit code: 0.

Result:

```text
CDD Maturity Score: 96/100 (A+)
ALCOA+ Score: 100% (9/9 attributes)
```

DocGuard green is necessary but not treated as the only semantic proof. The
evidence above also records test coverage, canons changed, RPC contract checks
and explicit out-of-scope boundaries.
