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

- sem sessao valida, `/day/[date]` redireciona para o fluxo publico
- o banco aplica RLS por ownership nas tabelas do baseline
- o cliente so trabalha com chaves publicas do Supabase

RLS esta definida em `supabase/migrations/001_auth_day_surface.sql`.

## Secrets Management

O cliente usa apenas:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Regras:

- `.env` e local
- `.env.example` e versionado
- `service_role` nao entra no cliente
- segredos sensiveis nao devem ser hardcoded no codigo nem documentados fora do
  contexto correto

## Security Rules

1. Nao introduza `service_role` no app Expo.
2. Nao exponha a rota protegida sem sessao valida.
3. Trate expiracao de sessao como retorno ao fluxo publico com feedback.
4. Preserve RLS como fonte de autorizacao do banco.
5. Atualize este canon e `ENVIRONMENT.md` quando a configuracao de auth mudar.

## Revision History

- 2026-04-25 - Canon consolidado na raiz apos o fechamento de
  `001-auth-day-surface`
