# Troubleshooting

## The app says the environment configuration is invalid

- check `.env`
- verify `EXPO_PUBLIC_SUPABASE_URL`
- verify `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- compare with `.env.example`

## The protected route keeps redirecting to sign-in

- confirm the session was restored successfully
- verify the auth project and anon key belong to the same Supabase project
- inspect auth errors surfaced by the app

## The day route opens but nothing loads

- confirm `001_auth_day_surface.sql` was applied
- verify the authenticated user exists in Supabase Auth
- inspect whether `notes` and `tasks` queries are failing due to RLS or missing
  tables

## Supabase local starts when Docker Desktop opens

- run `corepack pnpm run supabase:doctor`
- verify Echotes Supabase containers show `restart=no`
- run `corepack pnpm run supabase:stop`
- keep volumes `supabase_db_Echotes` and `supabase_storage_Echotes` unless a
  full local data reset is intentional

## Supabase local cannot bind `54322`

- keep the Echotes local stack on the dedicated range `55420..55429`
- use local Postgres at `127.0.0.1:55422`
- use local API at `http://127.0.0.1:55421`
- use Studio at `http://127.0.0.1:55423`
- run `corepack pnpm run supabase:doctor` to confirm port availability before
  starting the stack again

## A projected task does not return to the source context

- confirm the navigation context was set before pushing the destination day
- confirm the destination task still exists in the loaded task lookup
- check the regression tests for ghost navigation before changing behavior
