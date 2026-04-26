# Agent Instructions for Echotes

## Projeto

Echotes e um app Expo/React Native orientado ao dia. O baseline atual ja esta
fechado e corresponde a `001-auth-day-surface`.

Nao trate `001-auth-day-surface` como backlog aberto. Use esse pacote como
registro do corte entregue e como referencia para rastreabilidade.

## Ordem de Autoridade

Leia e siga nesta ordem:

1. `.specify/memory/constitution.md`
2. os canones soberanos da raiz do repo
3. o pacote ativo em `specs/<feature>/` quando houver uma nova feature aberta
4. o codigo e os testes como estado executavel atual

`docs/` antigo nao e mais canon vigente. Se ele divergir do canon da raiz, o
canon da raiz vence.

## Canon Soberano da Raiz

Os documentos abaixo sao a fonte de verdade do repo:

- `README.md`
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

## Regras Operacionais

1. Nao reabra `001-auth-day-surface` como se ainda estivesse em execucao.
2. Nao reintroduza dupla soberania documental.
3. Nao adicione `side` ao `TimelineNode`; esquerda e direita pertencem apenas a
   camada de renderizacao.
4. Nao coloque `service_role` no cliente.
5. Nao trate DocGuard como cerimonial. Se o guard falhar, o trabalho nao esta
   fechado.
6. Atualize `CHANGELOG.md` quando o canon ou o comportamento mudarem.
7. Registre desvio consciente em `DRIFT-LOG.md` quando codigo e canon precisarem
   ficar temporariamente desalinhados.

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
2. Se a mudanca tocar comportamento, confirme quais canones precisam ser
   atualizados.
3. Rode `corepack pnpm run doc:guard` antes de considerar o trabalho fechado.
4. Rode `corepack pnpm run lint`, `corepack pnpm run test` e
   `corepack pnpm run typecheck` quando a mudanca tocar implementacao.
5. Nao declare merge-ready com guard vermelho ou regressao tecnica aberta.

## Mudancas Sensiveis

Atualize o canon correspondente quando mexer em:

- auth, sessao ou protecao de rota -> `SECURITY.md`, `ARCHITECTURE.md`
- schema, queries, RLS ou entidades -> `DATA-MODEL.md`
- setup, env ou bootstrap local -> `ENVIRONMENT.md`, `RUNBOOKS.md`
- journeys de usuario ou escopo do produto -> `REQUIREMENTS.md`,
  `CURRENT-STATE.md`, `ROADMAP.md`
- suite de testes ou gates -> `TEST-SPEC.md`

## Politica de Fechamento

Uma branch nao esta fechada so porque o agente parou de iterar. O fechamento
aceitavel exige:

- canon soberano atualizado
- `doc:guard` verde
- `lint`, `test` e `typecheck` verdes quando aplicavel
- `CHANGELOG.md` atualizado
