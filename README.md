# Echotes

Echotes e um app centrado no dia que combina tarefas e notas em uma timeline
unica. O corte funcional implementado hoje continua sendo a feature fechada
`001-auth-day-surface`.

## Baseline Entregue

O baseline atual cobre:

- cadastro, login, restauracao de sessao e logout com Supabase Auth
- rota protegida do dia em `app/day/[date].tsx`
- criacao, leitura e edicao de notas e tarefas do mesmo dia
- tarefas projetadas para outro dia com ghost card, navegacao ao destino e
  breadcrumb de retorno
- derivacao da timeline a partir do estado real do dia
- regressao automatizada para auth, timeline, navegacao temporal e contratos
  temporais

## Estado do Canon

A migracao material dos tres arquivos antigos de `docs/` foi absorvida nos
canones da raiz e registrada em `CANON-MIGRATION-COVERAGE.md`.

O estado correto agora e:

- `.specify/memory/constitution.md` continua soberana como constituicao
- os canones da raiz sao a fonte vigente de produto, modelagem, arquitetura,
  seguranca, ambiente e testes
- `docs/` permanece no repositorio como acervo historico, nao como fonte
  material obrigatoria para novas decisoes
- `specs/001-auth-day-surface/` continua como registro da feature que definiu o
  baseline atual

## Canon Vigente

- `README.md`
- `AGENTS.md`
- `ARCHITECTURE.md`
- `DATA-MODEL.md`
- `SECURITY.md`
- `TEST-SPEC.md`
- `ENVIRONMENT.md`
- `REQUIREMENTS.md`
- `CURRENT-STATE.md`
- `ROADMAP.md`
- `DEPLOYMENT.md`
- `RUNBOOKS.md`
- `TROUBLESHOOTING.md`
- `KNOWN-GOTCHAS.md`
- `CHANGELOG.md`
- `DRIFT-LOG.md`
- `CANON-MIGRATION-COVERAGE.md`

Arquivos historicos preservados em `docs/`:

- `docs/echotes_domain_decisions_final.md`
- `docs/echotes_codex_mvp_technical_spec.md`
- `docs/echotes_schema_types_zod_starter_pack.md`

## Operacao Local

1. Instale dependencias com `corepack pnpm install`.
2. Crie `.env` a partir de `.env.example`.
3. Preencha `EXPO_PUBLIC_SUPABASE_URL` e
   `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
4. Aplique `supabase/migrations/001_auth_day_surface.sql`.
5. Inicie o app com `corepack pnpm expo start`.

Se o shell ja tiver `pnpm` no PATH, `pnpm install` e `pnpm expo start` tambem
funcionam.

## Validacao

As validacoes basicas do repo sao:

- `corepack pnpm run doc:guard`
- `corepack pnpm run lint`
- `corepack pnpm run test`
- `corepack pnpm run typecheck`
- `corepack pnpm run validate`

O gate automatico do repo continua sendo DocGuard + lint + test + typecheck.

## Fluxo Spec Kit

O fluxo operacional continua:

1. `constitution`
2. `specify`
3. `plan`
4. `tasks`
5. `implement`

O Spec Kit continua gerando artifacts em `specs/<feature>/`. O DocGuard agora
fiscaliza a estrutura canonica e a consistencia documental do repo.

## Usage

- iniciar desenvolvimento: `corepack pnpm expo start`
- validar o canon atual: `corepack pnpm run doc:guard`
- validar o repo inteiro: `corepack pnpm run validate`
- verificar cobertura da migracao: `CANON-MIGRATION-COVERAGE.md`

## Arquivos de Configuracao e Automacao

- `.docguard.json` define o layout e os validadores do DocGuard
- `.agents/` guarda skills do Codex/Spec Kit instaladas por projeto
- `.agent/` e `commands/` podem ser gerados por automacao do DocGuard
- `app.json`, `babel.config.js`, `metro.config.js` e `tsconfig.json` definem o
  bootstrap do app Expo/TypeScript
- `eslint.config.js` define lint
- `jest.config.js` define a suite de testes
- `.expo/`, `.expo-export-audit/`, `.expo-web.log` e `.expo-web.err.log` sao
  artefatos locais de desenvolvimento e nao fazem parte do canon

## Leitura Rapida

- contrato funcional e regras fechadas: `REQUIREMENTS.md`
- arquitetura, rotas, stores e algoritmo da timeline: `ARCHITECTURE.md`
- schema, RLS, queries, tipos e validacoes: `DATA-MODEL.md`
- setup e ambiente: `ENVIRONMENT.md`
- auth, segredos e politicas de acesso: `SECURITY.md`
- testes e gates: `TEST-SPEC.md`
- status da consolidacao do canon: `CURRENT-STATE.md`
- checklist de absorcao de `docs/`: `CANON-MIGRATION-COVERAGE.md`

## License

Este repositorio segue a politica definida pelo proprietario do projeto. Se um
arquivo formal de licenca for adicionado, este README deve apontar para ele.
