# Environment & Configuration

## Prerequisites

- Node.js 18+
- Corepack habilitado para uso de `pnpm`
- um projeto Supabase para desenvolvimento local

## Environment Variables

Variaveis publicas exigidas pelo cliente:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Essas variaveis sao validadas por `src/lib/env.ts` no bootstrap da app.

## Configuration Files

- `.env.example`
  - modelo versionado das variaveis publicas
- `.env`
  - configuracao local nao versionada
- `package.json`
  - scripts do repositorio
- `.docguard.json`
  - configuracao local do DocGuard

## Setup Steps

1. Rode `corepack pnpm install`.
2. Crie `.env` a partir de `.env.example`.
3. Preencha as duas variaveis publicas do Supabase.
4. Aplique `supabase/migrations/001_auth_day_surface.sql`.
5. Inicie a app com `corepack pnpm expo start`.

## Operational Notes

- a sessao do cliente usa a chave local `echotes.auth.session`
- sem variaveis validas, o app deve falhar com mensagem clara de configuracao
- a migration atual define schema, indexes, triggers e RLS do baseline

## Revision History

- 2026-04-25 - Canon consolidado na raiz apos o fechamento de
  `001-auth-day-surface`
