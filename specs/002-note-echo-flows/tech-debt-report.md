# Tech Debt Report: 002-note-echo-flows

**Generated**: 2026-05-06
**Feature**: `specs/002-note-echo-flows`
**Spec Reference**: `specs/002-note-echo-flows/spec.md`

## Executive Summary

| Severity | Count | Immediate Action Required |
|----------|-------|---------------------------|
| Critical | 0 | None |
| Large | 0 | ISSUE-001 resolved by implementation |
| Medium | 0 | TD001-TD005 completed in `tasks.md` |
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

## Cross-References

- **Specification**: `specs/002-note-echo-flows/spec.md`
- **Implementation Plan**: `specs/002-note-echo-flows/plan.md`
- **Tasks**: `specs/002-note-echo-flows/tasks.md`
- **Constitution**: `.specify/memory/constitution.md`

## Next Steps

1. Re-run `/speckit.review.run` for Phase 2 Base after remediation.
2. Re-run `/speckit.cleanup` to verify no remaining medium or large issues.
3. Use the stable cursor coverage in `tests/unit/notes/note-echo-api.test.ts`
   as the regression guard before US2 candidate-picker work.
