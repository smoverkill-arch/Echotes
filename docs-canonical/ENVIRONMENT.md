# Environment & Configuration

## Prerequisites

- Node.js 18+
- Corepack habilitado para uso de `pnpm`
- Docker Desktop para o Supabase local
- Supabase CLI versionado como dependencia de desenvolvimento
- um projeto Supabase remoto para desenvolvimento compartilhado

## Environment Variables

Variaveis publicas exigidas pelo cliente:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Essas variaveis sao validadas por `src/lib/env.ts` durante o bootstrap da app.

## Configuration Files

- `.env.example`
  - modelo versionado das variaveis publicas
- `.env`
  - configuracao local privada
- `package.json`
  - scripts do repositorio
- `.docguard.json`
  - configuracao local do DocGuard
- `supabase/config.toml`
  - configuracao local do Supabase CLI
- `supabase/migrations/`
  - migrations versionadas do banco

## Local API Surface

A API local do Supabase expoe apenas o schema `public`.
GraphQL fica fora do contrato local.
GraphQL so volta quando virar interface explicita do produto.

## Setup Steps

1. Rode `corepack pnpm install`.
2. Crie `.env` a partir de `.env.example`.
3. Preencha as duas variaveis publicas do Supabase.
4. Suba o Supabase local com `corepack pnpm run supabase:start`.
5. Confirme migrations com `corepack pnpm run db:migrations`.
6. Inicie a app com `corepack pnpm expo start`.

## Supabase Workflow

- local Docker: `corepack pnpm run supabase:start`
- local reset from migrations: `corepack pnpm run db:local:reset`
- migration status: `corepack pnpm run db:migrations`
- remote dry run: `corepack pnpm run db:remote:dry-run`
- remote apply by CLI: `corepack pnpm run db:remote:push`
- remote CLI operations usam a senha de banco pedida pelo Supabase CLI

Quando aplicar migration pelo console web do Supabase, use o SQL versionado.
Depois valide com `corepack pnpm run db:migrations`.

## Operational Notes

- a sessao do cliente usa a chave local `echotes.auth.session`
- variaveis validas permitem bootstrap do cliente com feedback previsivel de
  configuracao
- as migrations versionadas definem schema, indexes, triggers, RLS e defaults
  operacionais do banco

## Revision History

- 2026-05-06 - Supabase CLI/Docker e workflow remoto registrados para
  migrations versionadas.
- 2026-04-25 - Canon consolidado para a raiz apos o fechamento de
  `001-auth-day-surface`
