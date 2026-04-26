# Echotes

Echotes e um app centrado no dia que combina tarefas e notas em uma timeline
unica. O corte funcional atual do repositorio e o baseline consolidado da
feature fechada `001-auth-day-surface`.

O baseline entregue cobre:

- cadastro, login, restauracao de sessao e logout com Supabase Auth
- rota protegida do dia em `app/day/[date].tsx`
- criacao, leitura e edicao de notas e tarefas
- tarefas do mesmo dia com ou sem horario
- tarefas projetadas para outro dia com ghost card, navegacao ao destino e
  breadcrumb de retorno
- timeline com notas e tarefas derivadas do estado real do dia

## Canon Soberano

O canon soberano do projeto agora vive na raiz do repositorio:

- `README.md`
- `AGENTS.md`
- `ARCHITECTURE.md`
- `DATA-MODEL.md`
- `SECURITY.md`
- `TEST-SPEC.md`
- `ENVIRONMENT.md`
- `REQUIREMENTS.md`
- `CHANGELOG.md`
- `DRIFT-LOG.md`
- `ROADMAP.md`
- `DEPLOYMENT.md`
- `RUNBOOKS.md`
- `TROUBLESHOOTING.md`
- `KNOWN-GOTCHAS.md`
- `CURRENT-STATE.md`

`.specify/memory/constitution.md` continua soberana como constituicao do
projeto.

`specs/001-auth-day-surface/` continua no repositorio como registro da feature
que definiu o baseline atual. Nao trate esse pacote como trabalho em aberto.

Os arquivos historicos em `docs/` deixaram de ser canon vigente. Eles existem
apenas como fonte historica de migracao e nao devem voltar a ser usados como
fonte soberana para novas decisoes.

## Operacao Local

1. Instale dependencias com `corepack pnpm install`.
2. Crie `.env` a partir de `.env.example`.
3. Preencha `EXPO_PUBLIC_SUPABASE_URL` e
   `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
4. Aplique `supabase/migrations/001_auth_day_surface.sql` no projeto Supabase
   usado para desenvolvimento.
5. Inicie o app com `corepack pnpm expo start`.

Se o shell ja tiver `pnpm` no PATH, `pnpm install` e `pnpm expo start` tambem
funcionam.

## Validacao

As validacoes basicas do repositorio sao:

- `corepack pnpm run doc:guard`
- `corepack pnpm run lint`
- `corepack pnpm run test`
- `corepack pnpm run typecheck`
- `corepack pnpm run validate`

O gate real de merge passa por CI e inclui DocGuard, lint, testes e typecheck.

## Fluxo Spec Kit

O fluxo padrao continua sendo:

1. `constitution`
2. `specify`
3. `plan`
4. `tasks`
5. `implement`

O Spec Kit continua gerando e mantendo os artifacts operacionais em
`specs/<feature>/`. O DocGuard passa a fiscalizar o canon soberano do repo e a
consistencia dele com o estado do codigo e dos testes.

## Usage

- iniciar desenvolvimento: `corepack pnpm expo start`
- validar o canon: `corepack pnpm run doc:guard`
- validar o repo inteiro: `corepack pnpm run validate`

## Arquivos de Configuracao e Automacao

Arquivos e diretorios relevantes para a operacao do repo:

- `.docguard.json` define o layout e os validadores do DocGuard
- `.agents/` guarda skills do Codex/Spec Kit instaladas por projeto
- `.agent/` e `commands/` podem ser gerados por automacao do DocGuard
- `app.json`, `babel.config.js`, `metro.config.js` e `tsconfig.json` definem o
  bootstrap do app Expo/TypeScript
- `eslint.config.js` define lint
- `jest.config.js` define a suite de testes
- `.expo/`, `.expo-export-audit/`, `.expo-web.log` e `.expo-web.err.log` sao
  artefatos locais de desenvolvimento e nao fazem parte do canon soberano

## Leitura Rapida por Papel

- produto e contrato funcional: `REQUIREMENTS.md`
- arquitetura, rotas e fluxo de dados: `ARCHITECTURE.md`
- entidades e schema: `DATA-MODEL.md`
- setup local e configuracao: `ENVIRONMENT.md`
- testes e gates: `TEST-SPEC.md`
- estado entregue hoje: `CURRENT-STATE.md`
- regras para agentes: `AGENTS.md`

## License

Este repositorio permanece sob a politica de licenciamento definida pelo
proprietario do projeto. Se um arquivo de licenca formal for adicionado, este
README deve ser atualizado para apontar para ele explicitamente.
