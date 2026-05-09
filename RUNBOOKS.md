# Runbooks

## Bootstrap a New Local Environment

1. `corepack pnpm install`
2. create `.env` from `.env.example`
3. fill `EXPO_PUBLIC_SUPABASE_URL`
4. fill `EXPO_PUBLIC_SUPABASE_ANON_KEY`
5. start the local Supabase stack with `corepack pnpm run supabase:start`
6. confirm local migrations with `corepack pnpm run db:migrations`
7. `corepack pnpm expo start`

## Run Supabase Locally with Docker

1. start Docker Desktop
2. run `corepack pnpm run supabase:start`
3. open Supabase Studio at `http://127.0.0.1:55423`
4. use the local API URL `http://127.0.0.1:55421` when testing against the
   local stack
5. run `corepack pnpm run supabase:doctor` to inspect ports, containers and
   restart policies
6. run `corepack pnpm run supabase:stop` when the local stack is no longer
   needed

The local Postgres port is `55422`, with shadow DB on `55420`. The wrapper used
by `supabase:start` applies `docker update --restart=no` to Echotes Supabase
containers after the Supabase CLI starts them. Docker Desktop should not start
the Echotes stack automatically after this policy is applied.

The local database is rebuilt from versioned files in `supabase/migrations/`.
Current local migrations are:

- `001_auth_day_surface.sql`
- `002_note_echo_owner_default.sql`
- `003_harden_note_echo_surface.sql`

## Apply Supabase Migrations Remotely

1. authenticate locally with the Supabase CLI
2. link the project with `corepack pnpm exec supabase link --project-ref <ref>`
3. export the database password variable requested by the Supabase CLI in the
   current shell when remote Postgres access is required
4. inspect pending remote changes with `corepack pnpm run db:remote:dry-run`
5. apply with `corepack pnpm run db:remote:push` only when the dry run is
   expected

If a migration will be applied manually in the Supabase web console, use the
exact SQL from `supabase/migrations/`, then record that version in Supabase CLI
history with `corepack pnpm exec supabase migration repair <version> --status applied`.
Afterward, verify with `corepack pnpm run db:migrations` and run
`corepack pnpm run db:remote:dry-run`; the dry run should not propose the
manually applied migration again.

## Validate the Repository Before Merge

1. `corepack pnpm run doc:guard`
2. `corepack pnpm run lint`
3. `corepack pnpm run test`
4. `corepack pnpm run typecheck`

## Update the Canon After a Closed Feature

1. treat the closed feature package as implementation record
2. compare the root canon with the relevant sections in `docs/`
3. update `CANON-MIGRATION-COVERAGE.md` with `absorvida`, `parcialmente absorvida`
   or `ausente`
4. update the root canon with the absorbed behavior and detail
5. update `CHANGELOG.md`
6. register temporary mismatch in `DRIFT-LOG.md` if needed
7. re-run `corepack pnpm run doc:guard`

## Promote a Partially Absorbed Canon Section

1. read the original section in `docs/`
2. identify the destination root canon
3. move the rule, behavior, schema or test expectation into the destination
4. update `CANON-MIGRATION-COVERAGE.md` from `parcialmente absorvida` to
   `absorvida`
5. keep baseline status honest in `CURRENT-STATE.md`
6. run `corepack pnpm run doc:guard`

## Recover from Missing Supabase Setup

If the app reports invalid environment configuration:

1. verify `.env` exists
2. verify the two public Supabase variables are filled
3. re-open the shell so the environment is reloaded if needed
4. confirm migrations with `corepack pnpm run db:migrations`

## Recover from Supabase Local Autostart or Port Conflicts

If Docker Desktop starts Echotes containers without an explicit command:

1. run `corepack pnpm run supabase:doctor`
2. confirm each Echotes Supabase container reports `restart=no`
3. run `corepack pnpm run supabase:stop`
4. reopen Docker Desktop and confirm the Echotes stack stays stopped

If Supabase fails to bind a local port, keep the dedicated range in
`supabase/config.toml`: `55420..55429`. Do not move the Echotes stack back to
the default `54320..54329` range unless the Windows/Docker port reservation has
been verified clear.
