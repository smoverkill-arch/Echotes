# Current State

## Delivered Baseline

`001-auth-day-surface` is closed and defines the current product baseline.

Delivered today:

- auth by email and password
- local session restore
- protected day route
- same-day notes and tasks
- projected tasks with ghost navigation and breadcrumb
- automated regression coverage for the baseline

## Canon Status

The sovereign canon now lives in the repo root. Legacy files in `docs/` are
historical migration sources only.

## Technical Status

- environment validation exists in `src/lib/env.ts`
- Supabase client bootstrap exists in `src/lib/supabase.ts`
- baseline migration exists in `supabase/migrations/001_auth_day_surface.sql`
- tests cover auth, same-day flow, projected flow, timeline derivation and key
  regressions

## Deferred Areas

Not delivered in the current baseline:

- user-facing note echo workflows
- deployment automation
- broader roadmap commitments beyond the closed day-surface cut

## Operational Gate

The minimum merge gate is:

- `doc:guard`
- `lint`
- `test`
- `typecheck`
