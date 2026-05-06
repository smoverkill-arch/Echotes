# Security

## Authentication

O baseline usa Supabase Auth com email e senha.

- login e cadastro vivem no fluxo publico em `app/(auth)/`
- restauracao de sessao acontece no bootstrap da app
- a sessao autenticada e persistida localmente com AsyncStorage
- o cliente inicia e interrompe auto-refresh de token conforme o estado da app

Arquivos principais:

- `src/features/auth/api/sign-in.ts`
- `src/features/auth/api/sign-up.ts`
- `src/features/auth/api/restore-session.ts`
- `src/features/auth/api/sign-out.ts`
- `src/features/auth/hooks/use-auth-session.ts`
- `src/lib/supabase.ts`

## Authorization

O acesso ao dia protegido depende de sessao valida.

- ausencia de sessao valida em `/day/[date]` redireciona para o fluxo publico
- o banco aplica RLS por ownership nas tabelas do baseline
- o cliente trabalha exclusivamente com chaves publicas do Supabase

RLS esta definida em `supabase/migrations/001_auth_day_surface.sql`.
Hardening incremental vive em `supabase/migrations/003_harden_note_echo_surface.sql`.

## RLS Contract

O contrato de RLS absorvido do starter pack e:

- `tags`: usuario autenticado so acessa linhas com `auth.uid() = user_id`
- `tasks`: usuario autenticado so acessa linhas com `auth.uid() = user_id`
- `notes`: usuario autenticado so acessa linhas com `auth.uid() = user_id`
- `note_echoes`: acesso exige ownership das notas envolvidas
- insert de `note_echoes` deriva `created_by_user_id` no banco com
  `default auth.uid()` e mantem check `created_by_user_id = auth.uid()`

Novas policies precisam preservar essas garantias.

## Database Surface

O cliente usa REST/PostgREST com sessao autenticada.

- grants diretos para `anon` nas tabelas do dominio sao revogados
- grants de tabela para `authenticated` ficam limitados a select, insert,
  update e delete
- policies de ownership sao direcionadas para `authenticated`
- funcoes auxiliares de trigger usam `search_path` fixo
- a extensao GraphQL do banco e removida enquanto o app nao usar GraphQL como
  interface de produto

## Secrets Management

O cliente usa apenas:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Regras:

- `.env` e local
- `.env.example` e versionado
- `service_role` fica fora do cliente Expo
- segredos sensiveis ficam fora do codigo e da documentacao operacional

## Security Rules

1. Mantenha `service_role` fora do app Expo.
2. Proteja a rota autenticada com sessao valida.
3. Trate expiracao de sessao como retorno ao fluxo publico com feedback.
4. Preserve RLS como fonte de autorizacao do banco.
5. Atualize este canon e `ENVIRONMENT.md` quando a configuracao de auth mudar.
6. Trate alertas Security do Supabase Advisor como bloqueio ate haver
   correcao, decisao registrada ou falso positivo demonstrado.

## Revision History

- 2026-05-06 - Hardening de superficie Supabase registrado para grants,
  policies, funcao de trigger e GraphQL.
- 2026-04-25 - Canon consolidado na raiz apos o fechamento de
  `001-auth-day-surface`
