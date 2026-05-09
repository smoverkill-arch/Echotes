# Changelog

All notable changes to this project will be documented in this file.

The format follows Keep a Changelog and the project uses semantic versioning for
versioned releases when they start to exist.

## [Unreleased]

### Added

- root canon for Echotes with operational CDD documents
- project-pinned DocGuard configuration and validation scripts
- `supabase:doctor` and a local Supabase wrapper that reports ports,
  containers and restart policies
- CI workflow for DocGuard, lint, test and typecheck
- migration coverage checklist for absorption of legacy `docs/`
- expanded root canon content for notes, echoes, timeline navigation, SQL/RLS,
  Zod contracts, tag color inheritance and implementation checklist
- behavioral tests for TD030–TD036: `UnavailableRelatedNote` graceful degradation,
  semantic-pair delete direction, context field defaults, pagination cursor boundary
  transition, inverted echo `isAlreadyConnected`, whitespace normalization in brief,
  and reconciliation schema-validation reclassification

### Changed

- `001-auth-day-surface` is now treated as the closed baseline of the product
- root canon is now explicitly treated as a consolidation target, not a fully
  closed migration
- root canon promoted after material absorption of the three legacy `docs/`
  sources
- Spec Kit constitution and templates now treat the root canon as the current
  authority and `docs/` as historical archive
- README and canonical docs now use shorter sections and a clearer doc layout
- TEST-SPEC now describes test suites without fragile file-level references
- DocGuard config now disables the cross-platform `Docs-Diff` file-path
  heuristic and tracks generated assistant artifacts with `.docguardignore`
- `DATA-MODEL.md`: updated note_echoes status — CRUD flows implemented in
  `002-note-echo-flows`; revision history reordered chronologically
- `listRelatedNoteDetails` now degrades gracefully on `not_accessible` errors:
  returns `ok: true` with `UnavailableRelatedNote` entries instead of `ok: false`
- `deleteNoteEcho` verification now checks the specific deleted echo by ID when
  `echoId` is provided, preventing false `retryable_failure` when B→A echo remains
- `createNoteEcho` reconciliation reclassifies `invalid_input` from
  `listNoteEchoes` as `retryable_failure` (schema failures on fetched data are
  not caller input errors)
- `listNoteCandidates` now surfaces failures from the other-day query even when
  same-day rows were already loaded, avoiding silent pagination truncation
- `listRelatedNoteDetails` now applies `sortRelatedNotes` in the
  `not_accessible` graceful-degradation path to keep ordering stable between
  loaded and unavailable states
- `specs/002-note-echo-flows/data-model.md` now matches implemented fallback:
  access-denied detail loads degrade to `stale_detail` with relation identity
  preserved
- `specs/002-note-echo-flows/research.md` now uses `newNoteDay` naming for
  continuation draft day selection

### Fixed

- Spec Kit DocGuard integration no longer depends on `docguard-cli@latest`
- requirement traceability now links canonical IDs to the real test suites
- documentation contracts now verify DocGuard gates and RLS coverage
- note echo manual creation now relies on server-derived ownership instead of
  sending `created_by_user_id` from the client
- a forward Supabase migration now applies the `note_echoes.created_by_user_id`
  `default auth.uid()` contract to existing remote projects
- Supabase database hardening now revokes domain-table access from `anon`,
  limits `authenticated` grants, targets RLS policies to authenticated sessions,
  fixes the trigger function search path and disables GraphQL execution for
  client roles until GraphQL becomes an explicit product interface
- canon-guard CI now runs `corepack enable` before the `pnpm` cache setup so
  the package manager is available to `actions/setup-node`
- Supabase local development now uses the dedicated `55420..55429` port range
  and forces Echotes containers to `restart=no` after startup

### Removed

- the false claim that the canon migration was already complete
