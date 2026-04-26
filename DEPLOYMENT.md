# Deployment

## Current Posture

The repository is currently validated for local development and CI quality
gates. There is no production deployment workflow codified in this repository
yet.

## Supported Operational Flow Today

- install dependencies with `corepack pnpm install`
- configure `.env`
- apply `supabase/migrations/001_auth_day_surface.sql`
- run `corepack pnpm expo start`

## Quality Gate Before Promotion

Any future promotion workflow must, at minimum, run:

- `corepack pnpm run doc:guard`
- `corepack pnpm run lint`
- `corepack pnpm run test`
- `corepack pnpm run typecheck`

## Future Release Work

No production mobile packaging, submission or environment promotion process is
declared here yet. When that changes, this file must be updated before the
process is treated as official.
