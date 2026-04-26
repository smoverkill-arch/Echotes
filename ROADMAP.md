# Roadmap

## Current Baseline

The shipped baseline is `001-auth-day-surface`.

This baseline covers:

- auth by email and password
- protected day surface
- same-day notes and tasks
- projected tasks with ghost navigation

## Documentation Migration Track

Current migration goals:

- keep the sovereign canon in the repo root
- enforce canon health with DocGuard
- make CI the merge gate instead of agent discipline alone

## Product Areas Not Yet Committed

The following areas remain outside the current baseline and should not be
assumed delivered:

- operational use of `note_echoes`
- broader calendar behaviors beyond the current day-surface cut
- automated product workflows
- release and deployment automation for production mobile delivery

## Historical Implementation Order

The original MVP technical spec ordered work as:

1. foundations: project setup, Supabase client, types, schemas, stores and routes
2. notes: note CRUD, echoes, continuation, reader details and direct echo count
3. tasks: task CRUD, temporal validation, ghost card, breadcrumb and scheduled
   item behavior
4. timeline: unified derivation, `sortAt`, tabs and double tap
5. refinement: tag colors, empty states, loading/error and critical tests

This order is retained as historical guidance. Future commitments still require
a new Spec Kit feature.

## Planning Rule

Future roadmap items only become commitments after they are opened and closed
through the active Spec Kit flow.
