# Echotes

Echotes e um app Expo/React Native centrado em cada dia.
O produto organiza notas e tarefas em uma timeline diaria.
O baseline entregue hoje e `001-auth-day-surface`.
O pacote `002-note-echo-flows` entrega os fluxos de ecos e continuacao de nota
sobre esse baseline.

## Baseline Atual

O corte atual entrega:

- cadastro, login, restauracao de sessao e logout com Supabase Auth.
- rota protegida do dia em `app/day/[date].tsx`.
- criacao e edicao basica de notas e tarefas do mesmo dia.
- tarefas projected com ghost card, navegacao ao destino e breadcrumb.
- leitura de ecos diretos, Reader com notas conectadas, `Adicionar eco`,
  remocao confirmada e `Continuar desta nota`.
- derivacao da timeline a partir do estado real do dia.
- regressao automatizada para auth, timeline, navegacao temporal e contratos temporais.

## Estrutura do Canon

O repo usa dois grupos principais de documentos.

- `docs-canonical/` guarda os seis canones executaveis usados pelo DocGuard.
- a raiz guarda governanca, status, operacao e historico do repo.
- `docs/` segue como acervo historico.
- `specs/001-auth-day-surface/` preserva a feature que definiu o baseline.

Ordem de autoridade: `.specify/memory/constitution.md`, depois os seis canones
em `docs-canonical/`, depois o pacote ativo em `specs/<feature>/`, e por fim o
codigo e os testes como estado executavel atual.

## Canones do DocGuard

- `docs-canonical/REQUIREMENTS.md`.
- `docs-canonical/ARCHITECTURE.md`.
- `docs-canonical/DATA-MODEL.md`.
- `docs-canonical/SECURITY.md`.
- `docs-canonical/ENVIRONMENT.md`.
- `docs-canonical/TEST-SPEC.md`.

## Docs de Governanca na Raiz

- `AGENTS.md`.
- `CURRENT-STATE.md`.
- `ROADMAP.md`.
- `DEPLOYMENT.md`.
- `RUNBOOKS.md`.
- `TROUBLESHOOTING.md`.
- `KNOWN-GOTCHAS.md`.
- `CHANGELOG.md`.
- `DRIFT-LOG.md`.
- `CANON-MIGRATION-COVERAGE.md`.

## Setup Local

1. Instale dependencias com `corepack pnpm install`.
2. Crie `.env` a partir de `.env.example`.
3. Preencha `EXPO_PUBLIC_SUPABASE_URL`.
4. Preencha `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
5. Aplique as migrations em `supabase/migrations/` na ordem numerica.
6. Inicie o app com `corepack pnpm expo start`.

`pnpm` direto tambem funciona quando ja estiver disponivel.

## Validacao

O gate local usa estes comandos:

- `corepack pnpm run doc:guard`.
- `corepack pnpm run lint`.
- `corepack pnpm run test`.
- `corepack pnpm run typecheck`.
- `corepack pnpm run validate`.

## Usage

- iniciar desenvolvimento: `corepack pnpm expo start`.
- validar o canon: `corepack pnpm run doc:guard`.
- validar o repo inteiro: `corepack pnpm run validate`.
- consultar o estado atual: `CURRENT-STATE.md`.

## Leitura Rapida

- produto e regras fechadas: `docs-canonical/REQUIREMENTS.md`.
- arquitetura, rotas, stores e timeline: `docs-canonical/ARCHITECTURE.md`.
- schema, queries, tipos e RLS: `docs-canonical/DATA-MODEL.md`.
- setup e bootstrap: `docs-canonical/ENVIRONMENT.md`.
- auth, segredos e acesso: `docs-canonical/SECURITY.md`.
- testes e gates: `docs-canonical/TEST-SPEC.md`.
- status consolidado: `CURRENT-STATE.md`.
- cobertura da migracao: `CANON-MIGRATION-COVERAGE.md`.

## Arquivos Operacionais

- `.docguard.json` define validadores e arquivos obrigatorios.
- `.docguardignore` exclui artefatos locais gerados pelo DocGuard, como
  `commands/`, das metricas documentais.
- `.agents/` guarda skills do projeto.
- `.agent/` e `commands/` podem surgir por automacao.
- `.clinerules`, `.cursor/`, `.gemini/` e `.windsurfrules` registram regras
  para ferramentas auxiliares de desenvolvimento usadas esporadicamente.
- `app.json`, `babel.config.js`, `metro.config.js` e `tsconfig.json` definem o bootstrap do app.
- `eslint.config.js` e `jest.config.js` definem os gates tecnicos.
- `.expo/` guarda estado local do Expo durante desenvolvimento.
- `.expo-export-audit/` guarda artefatos locais de auditoria de export.
- `.expo-web.log` registra sessoes locais do servidor web.
- `.expo-web.err.log` registra falhas locais do servidor web.

## Historico

Arquivos preservados em `docs/`:

- `docs/echotes_domain_decisions_final.md`.
- `docs/echotes_codex_mvp_technical_spec.md`.
- `docs/echotes_schema_types_zod_starter_pack.md`.

## License

Este repositorio segue a politica definida pelo proprietario do projeto.
Se um arquivo formal de licenca surgir depois, este README deve apontar para ele.
