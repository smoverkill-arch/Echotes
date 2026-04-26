# Echotes

Echotes é um app centrado no dia que combina tarefas e notas em uma timeline
única. A primeira feature implementada (`001-auth-day-surface`) entrega o corte
operacional de autenticação, superfície diária protegida e registro básico do
dia.

Neste corte, a experiência cobre:

- cadastro, entrada, restauração de sessão e logout por email/senha
- acesso protegido à superfície diária
- criação, leitura e edição de notas e tarefas
- tarefas do mesmo dia com ou sem horário
- tarefas projetadas para outro dia com `ghost card`, navegação ao destino e
  breadcrumb de retorno
- eixo visual da timeline com notas à direita e itens de tarefa à esquerda

## Canônicos

Os documentos soberanos do projeto ficam em `docs/`:

- `echotes_domain_decisions_final.md`
- `echotes_codex_mvp_technical_spec.md`
- `echotes_schema_types_zod_starter_pack.md`

Qualquer planejamento ou implementacao nova deve partir desses arquivos e da
constituicao em `.specify/memory/constitution.md`.

## Operação local

1. Criar `.env` local a partir de `.env.example`.
2. Preencher `EXPO_PUBLIC_SUPABASE_URL` e
   `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
3. Aplicar `supabase/migrations/001_auth_day_surface.sql` no projeto Supabase
   usado para desenvolvimento.
4. Instalar dependências com `pnpm install`.
5. Iniciar o app com `pnpm expo start`.

Para validação operacional da feature fechada, siga
`specs/001-auth-day-surface/quickstart.md`.

## Fluxo Speckit

O fluxo padrao do projeto e:

1. `constitution`
2. `specify`
3. `plan`
4. `tasks`
5. `implement`

A primeira feature aberta neste repositório e `001-auth-day-surface`.

## Convenções

- gestor de pacotes: `pnpm`
- segredos locais: `.env`
- exemplo versionado: `.env.example`
- chaves publicas do cliente: `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` nunca entra no cliente
- regressão básica: `pnpm lint`, `pnpm test` e `pnpm typecheck`
