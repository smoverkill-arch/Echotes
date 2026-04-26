# Runbooks

## Bootstrap a New Local Environment

1. `corepack pnpm install`
2. create `.env` from `.env.example`
3. fill `EXPO_PUBLIC_SUPABASE_URL`
4. fill `EXPO_PUBLIC_SUPABASE_ANON_KEY`
5. apply `supabase/migrations/001_auth_day_surface.sql`
6. `corepack pnpm expo start`

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
4. confirm the migration has already been applied in Supabase
