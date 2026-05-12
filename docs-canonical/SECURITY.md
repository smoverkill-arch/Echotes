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
O RPC de continuacao de nota vive em
`supabase/migrations/004_note_echo_flows.sql`.
Hardening incremental vive em `supabase/migrations/003_harden_note_echo_surface.sql`.
Hardening de advisors Supabase vive em
`supabase/migrations/005_supabase_advisor_hardening.sql`.

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
- policies de RLS usam `(select auth.uid())` para evitar reavaliacao por linha
  apontada pelo Supabase Advisor

## Local Host Containment

No Windows, a stack local pode aparecer publicada pelo Docker Desktop em
`0.0.0.0` mesmo quando a rede Docker dedicada solicita bind em `127.0.0.1`.
Para smoke local em rede nao confiavel, a regra versionada em
`scripts/apply-echotes-supabase-firewall.ps1` bloqueia entrada TCP externa em
`55420..55429` e preserva uso por localhost.

## Note Continuation RPC

`public.continue_note` e a superficie autorizada para criar uma nota continuada
e seu eco `continue_note` de forma atomica.

Contrato de seguranca:

- roda como `security definer` com `search_path` fixo.
- exige `auth.uid()` nao nulo.
- valida ownership da nota de origem antes de criar qualquer linha.
- cria a nova nota com `user_id = auth.uid()`.
- cria o eco com `created_by_user_id = auth.uid()`.
- concede execucao apenas para `authenticated`.
- nao exige nem expõe `service_role` no cliente.
- falhas retornam sem persistencia parcial de nota ou eco.

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

- 2026-05-12 - Registrado hardening de advisors Supabase para RLS e indices de
  FKs, mantendo grants minimos e cliente sem `service_role`.
- 2026-05-12 - Registrada contencao por Windows Firewall para a faixa local
  Supabase quando Docker Desktop publica portas alem de localhost.
- 2026-05-11 - RPC `continue_note` documentado como superficie atomica e
  autenticada de `002-note-echo-flows`.
- 2026-05-06 - Hardening de superficie Supabase registrado para grants,
  policies, funcao de trigger e GraphQL.
- 2026-04-25 - Canon consolidado na raiz apos o fechamento de
  `001-auth-day-surface`
