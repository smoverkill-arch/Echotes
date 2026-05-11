# Agent Instructions for Echotes

## Projeto

Echotes e um app Expo/React Native orientado ao dia. O baseline funcional
implementado hoje corresponde a `001-auth-day-surface`.

Nao trate `001-auth-day-surface` como backlog aberto. Use esse pacote como
registro do corte entregue e como referencia de rastreabilidade.

## Estado do Canon

O repo adotou `docs-canonical/` como sede dos seis canones executaveis usados
pelo DocGuard. A raiz guarda governanca, status, operacao e historico, com
cobertura de migracao registrada em `CANON-MIGRATION-COVERAGE.md`.

`docs/` permanece como acervo historico. Nao use `docs/` para reabrir ou
sobrescrever o canon vigente sem registrar uma decisao explicita.

## Ordem de Autoridade

1. `.specify/memory/constitution.md`
2. canones executaveis em `docs-canonical/`
3. o pacote ativo em `specs/<feature>/`, quando houver feature nova aberta
4. o codigo e os testes como estado executavel atual

Se um arquivo historico em `docs/` parecer contradizer o canon vigente, trate
isso como achado de auditoria documental, nao como autoridade automatica.

## Canones Executaveis

- `docs-canonical/REQUIREMENTS.md`
- `docs-canonical/ARCHITECTURE.md`
- `docs-canonical/DATA-MODEL.md`
- `docs-canonical/SECURITY.md`
- `docs-canonical/TEST-SPEC.md`
- `docs-canonical/ENVIRONMENT.md`

## Docs de Governanca, Status e Operacao na Raiz

- `README.md`
- `CURRENT-STATE.md`
- `ROADMAP.md`
- `DEPLOYMENT.md`
- `RUNBOOKS.md`
- `TROUBLESHOOTING.md`
- `KNOWN-GOTCHAS.md`
- `CHANGELOG.md`
- `DRIFT-LOG.md`
- `CANON-MIGRATION-COVERAGE.md`

## Regras Operacionais

1. Nao reabra `001-auth-day-surface` como se ainda estivesse em execucao.
2. Nao trate DocGuard como cerimonial. Guard vermelho significa trabalho nao
   fechado.
3. Nao use a migracao de canon para apagar detalhe relevante.
4. Nao adicione `side` ao `TimelineNode`; esquerda e direita pertencem apenas a
   camada de renderizacao.
5. Nao coloque `service_role` no cliente.
6. Atualize `CHANGELOG.md` quando o canon ou o comportamento mudarem.
7. Registre desvio temporario em `DRIFT-LOG.md` quando codigo e canon
   precisarem ficar desalinhados.

## Comandos de Trabalho

Use `corepack pnpm` quando `pnpm` nao estiver disponivel diretamente.

- `corepack pnpm install`
- `corepack pnpm expo start`
- `corepack pnpm run doc:guard`
- `corepack pnpm run doc:score`
- `corepack pnpm run lint`
- `corepack pnpm run test`
- `corepack pnpm run typecheck`
- `corepack pnpm run validate`

## Workflow Obrigatorio

1. Leia o canon relevante antes de mudar codigo ou docs.
2. Ao tocar canones executaveis ou docs de governanca/status da raiz, preserve
   a rastreabilidade em `CANON-MIGRATION-COVERAGE.md` quando a mudanca vier de
   auditoria documental.
3. Rode `corepack pnpm run doc:guard` antes de considerar o trabalho fechado.
4. Rode `corepack pnpm run lint`, `corepack pnpm run test` e
   `corepack pnpm run typecheck` quando a mudanca tocar implementacao.
5. Nao declare merge-ready com guard vermelho ou regressao tecnica aberta.

## Mudancas Sensiveis

Atualize o canon correspondente quando mexer em:

- auth, sessao ou protecao de rota -> `docs-canonical/SECURITY.md`,
  `docs-canonical/ARCHITECTURE.md`
- schema, queries, RLS ou entidades -> `docs-canonical/DATA-MODEL.md`
- setup, env ou bootstrap local -> `docs-canonical/ENVIRONMENT.md`,
  `RUNBOOKS.md`
- journeys, escopo de produto ou regras fechadas -> `docs-canonical/REQUIREMENTS.md`,
  `CURRENT-STATE.md`, `ROADMAP.md`
- stores, algoritmo da timeline ou overlays -> `docs-canonical/ARCHITECTURE.md`
- suite de testes ou gates -> `docs-canonical/TEST-SPEC.md`

## Politica de Fechamento

Uma branch nao esta fechada so porque o agente parou de iterar. O fechamento
aceitavel exige:

- canon atualizado de forma honesta
- `doc:guard` verde
- `lint`, `test` e `typecheck` verdes quando aplicavel
- `CHANGELOG.md` atualizado
- `CANON-MIGRATION-COVERAGE.md` revisado quando a mudanca tocar conteudo
  historico migrado de `docs/`
