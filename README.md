# Echotes

Echotes e um app centrado no dia que mistura tarefas e notas em uma timeline
unica, preservando dois mecanismos canônicos do produto:

- tarefas usam projecao temporal e `ghost card`
- notas usam continuidade conceitual por `ecos`

## Canonicos

Os documentos soberanos do projeto ficam em `docs/`:

- `echotes_domain_decisions_final.md`
- `echotes_codex_mvp_technical_spec.md`
- `echotes_schema_types_zod_starter_pack.md`

Qualquer planejamento ou implementacao nova deve partir desses arquivos e da
constituicao em `.specify/memory/constitution.md`.

## Fluxo Speckit

O fluxo padrao do projeto e:

1. `constitution`
2. `specify`
3. `plan`
4. `tasks`
5. `implement`

A primeira feature aberta neste repositório e `001-auth-day-surface`.

## Convencoes

- gestor de pacotes: `pnpm`
- segredos locais: `.env`
- exemplo versionado: `.env.example`
- chaves publicas do cliente: `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` nunca entra no cliente
