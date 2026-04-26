# Requirements

## Structural Product Truths

- `D-001` O dia e a unidade principal de organizacao do app.
- `D-002` Cada dia possui pagina propria e independente.
- `D-003` A timeline e a visualizacao principal do dia.
- `D-004` A timeline mistura tarefas e notas no mesmo eixo temporal.
- `D-005` A sensacao da timeline deve ser a de avancar pelo dia.
- `D-006` Tudo entra na timeline pela posicao intradiaria derivada da hora de
  `created_at`, e nao pela data completa.
- `D-007` Tarefas com horario podem adicionar um segundo ponto real em
  `scheduled_at`.
- `D-008` Tarefas usam projecao temporal; notas usam ecos.

## Functional Requirements

- `FR-001` O sistema deve permitir cadastro com email e senha.
- `FR-002` O sistema deve permitir entrada com email e senha.
- `FR-003` O sistema deve restaurar automaticamente a sessao autenticada quando
  valida.
- `FR-004` O sistema deve bloquear superfícies protegidas sem sessao valida.
- `FR-005` O sistema deve permitir logout explicito.
- `FR-006` O sistema deve abrir o contexto autenticado diretamente na superficie
  diaria.
- `FR-007` O sistema deve tratar o dia como unidade principal da feature.
- `FR-008` O sistema deve permitir criar nota independente no dia.
- `FR-009` Notas entram na timeline pela posicao intradiaria de `created_at`.
- `FR-010` O sistema deve permitir criar tarefa para o mesmo dia com horario
  opcional.
- `FR-011` `scheduled_at` deve ser derivado de `target_day + scheduled_time`.
- `FR-012` O sistema deve impedir persistencia de tarefa com horario invalido.
- `FR-013` Tarefa same-day sem horario existe apenas como item real do dia.
- `FR-014` Tarefa same-day com horario deve renderizar marker de criacao + item
  real agendado.
- `FR-015` Tarefa projected deve ser representada por ghost card na origem.
- `FR-016` Quando `source_day != target_day`, o dia de origem mostra apenas o
  ghost card, sem marker de criacao separado.
- `FR-017` O item real da tarefa projected existe em `target_day`.
- `FR-018` Ghost card deve navegar ao dia de destino e oferecer retorno claro ao
  contexto de origem.
- `FR-019` Clique simples abre Reader em item existente.
- `FR-020` Double tap abre Editor em modo `edit`.
- `FR-021` O sistema deve falhar com mensagem clara quando as variaveis publicas
  obrigatorias estiverem ausentes.
- `FR-022` O sistema deve manter separacao de dominio entre tarefas e notas.
- `FR-023` O layout da timeline deve manter notas a direita e itens de tarefa a
  esquerda, sem introduzir `side` no `TimelineNode`.

## Task Domain Rules

- `T-001` Tarefa e item acionavel de um dia.
- `T-002` Toda tarefa possui `created_at`, `source_day`, `target_day` e
  `scheduled_at` opcional.
- `T-003` `created_at` registra o momento real da criacao.
- `T-004` `source_day` registra a pagina vista ao criar.
- `T-005` `target_day` registra o dia ao qual a tarefa pertence.
- `T-006` `scheduled_at` e exclusivo de tarefas.
- `T-007` Sem `scheduled_at`, a tarefa entra pela posicao temporal de
  `created_at`.
- `T-008` Same-day com horario preserva `created_at` e ganha item real em
  `scheduled_at`.
- `T-011` Se `source_day != target_day`, existe projecao temporal.
- `T-012` A projecao usa ghost card em `source_day`.
- `T-013` O ghost card usa posicao intradiaria derivada de `created_at`.
- `T-015` O dia de origem mostra apenas o ghost card quando a tarefa e
  projected.
- `T-017` Se a projected tiver `scheduled_at`, o item real usa esse horario; se
  nao tiver, entra pelo horario intradiario derivado de `created_at`.
- `T-018` Ghost card navega de `source_day` para `target_day`.
- `T-019` A navegacao por ghost card deve oferecer retorno claro ao contexto de
  origem.
- `T-021` Tarefas nao podem ser agendadas para o passado.
- `T-022` `scheduled_at` deve ser estritamente posterior a `created_at`.
- `T-023` Para same-day, `scheduled_at` tambem deve ser posterior ao momento
  real de criacao.
- `T-023-A` `scheduled_time` e input de UI; o campo persistido continua sendo
  `scheduled_at`.
- `T-023-B` Se `scheduled_time` for nulo, `scheduled_at` tambem e nulo.
- `T-023-C` A composicao de `scheduled_at` acontece antes da validacao temporal
  e antes da persistencia.
- `T-024` Editar `target_day` ou `scheduled_at` recalcula a representacao
  temporal da tarefa.
- `T-025` Excluir tarefa remove todas as suas representacoes derivadas.

## Note Domain Rules

- `N-001` Nota e um registro textual do dia.
- `N-002` Nota entra na timeline pela posicao de `created_at`.
- `N-003` Nota nao usa ghost card.
- `N-004` Nota nao usa projecao temporal do modelo de tarefas.
- `N-005` Nota pode se conectar conceitualmente a outras notas por ecos.
- `N-006` Eco e conexao direta, nao hierarquica.
- `N-010` As conexoes entre notas formam grafo de continuidade conceitual ao
  longo do tempo.
- `N-011` O dominio fechado admite tres entradas de eco no MVP: mencao no
  conteudo, `Adicionar eco` e `Continuar desta nota`.
- `N-014` `Continuar desta nota` cria uma nova nota.
- `N-015` A nova nota ja nasce ligada por eco a nota de origem.
- `N-017` A nota criada por continuacao nasce com briefing/preview automatico.
- `N-020` Mencao no conteudo usa `@nota` e cria eco `manual_link`.
- `N-020-A` O token persistido no `content` e `@[label](note:<note_id>)`.
- `N-020-B` O token e renderizado como chip inline clicavel.
- `N-020-C` `content` e a fonte de verdade da presenca inline da mencao.
- `N-020-D` `note_echoes` com `kind = manual_link` e a fonte de verdade da
  relacao semantica.
- `N-022` Na timeline, a nota mostra apenas indicador discreto de ecos.
- `N-023` O indicador mostra quantidade de ecos diretos.
- `N-027` A modelagem temporal de nota usa `day`, `created_at` e tabela
  separada para ecos.
- `N-028` Notas nao precisam reutilizar `source_day` e `target_day`.
- `N-029` Excluir uma nota remove a propria nota e os ecos diretamente ligados a
  ela.
- `N-030` Excluir uma nota nao deve interferir nos ecos proprios que outras
  notas da mesma familia possuam entre si.
- `N-031` A conexao entre notas pode guardar metadata propria.
- `N-032` A metadata da conexao deve ficar separada da nota.
- `N-033` No futuro, ecos devem permitir visualizacao em mapa/rede da familia de
  notas.

## Timeline and Navigation Requirements

- `TL-001` A timeline e una, mas nao homogeneiza o dominio de tarefa e nota.
- `TL-002` A ordenacao deve respeitar a posicao temporal local ao dia exibido.
- `TL-003` Notas ficam visualmente a direita e itens de tarefa a esquerda.
- `TL-004` A orientacao visual nao entra no modelo `TimelineNode`.
- `TL-005` Ghost card deve deixar claro que o item pertence a outro dia.
- `TL-006` A navegacao por ghost card deve preservar contexto de origem.
- `TL-007` O breadcrumb de retorno pertence ao contexto temporal, nao ao item em
  si.
- `TL-008` Reader e Editor sao superficies contextuais sobre o dia, nao destinos
  de rota.
- `TL-009` Clique simples abre Reader; double tap abre Editor.
- `TL-010` O botao explicito de editar dentro do Reader tambem abre Editor.

## Interface Language Requirements

- A acao principal para registro do dia e o `+`.
- O `+` deve levar a escolha entre criar tarefa e criar nota.
- Nota deve comunicar registro textual do dia.
- Tarefa deve comunicar acao, destino temporal e horario quando houver.
- Ghost card deve comunicar origem e destino sem parecer item real daquele dia.
- Breadcrumb deve comunicar retorno ao dia de origem.
- A timeline deve reforcar a sensacao de avancar pelo dia, nao de navegar por
  uma lista generica.

## Non-Functional Requirements

- `NFR-001` O cliente deve usar apenas variaveis publicas do Supabase.
- `NFR-002` O banco deve aplicar RLS por ownership nas tabelas do baseline.
- `NFR-003` O contrato local deve validar ambiente, notas e tarefas com Zod.
- `NFR-004` O baseline deve manter regressao automatizada para auth, same-day,
  projected tasks, timeline e regras temporais.
- `NFR-005` O canon em consolidacao deve permanecer coerente com o codigo, os
  testes e as fontes materiais ainda ativas em `docs/`.

## Success Criteria

- `SC-001` Usuario sem sessao valida nao acessa a superficie protegida.
- `SC-002` Usuario autenticado consegue abrir o dia selecionado e manter a
  sessao local.
- `SC-003` Criar nota e tarefa same-day mantem a timeline coerente.
- `SC-004` Tarefa projected mantem ghost na origem, item real no destino e
  breadcrumb funcional.
- `SC-005` `doc:guard`, `lint`, `test` e `typecheck` formam o gate minimo do
  repo.

## User Scenarios

### User Story 1 - Entrar e acessar o dia (Priority: P1)

Como usuario, quero entrar e restaurar minha sessao para abrir meu dia sem
expor a superficie protegida quando a sessao estiver invalida.

### User Story 2 - Registrar o dia com nota e tarefa (Priority: P2)

Como usuario autenticado, quero criar nota e tarefa no mesmo dia para registrar
contexto e acao no fluxo principal.

### User Story 3 - Projetar tarefa para outro dia e navegar com contexto (Priority: P3)

Como usuario, quero projetar tarefa para outro dia, navegar ao destino e
retornar ao contexto original sem perder o vinculo temporal.

## Traceability Matrix

| Requirement group | Primary implementation | Primary verification |
|-------------|------|-------|
| Auth + protection | `app/index.tsx`, `app/(auth)/*`, `app/day/[date].tsx`, `src/features/auth/*` | `tests/integration/auth/auth-session-flow.test.tsx` |
| Same-day notes/tasks | `src/features/notes/*`, `src/features/tasks/*`, `src/components/forms/*`, `src/components/reader/*` | `tests/integration/day/day-surface-same-day.test.tsx` |
| Projected tasks + breadcrumb | `src/features/timeline/utils/derive-timeline-nodes.ts`, `src/stores/navigation-store.ts`, `src/components/day/breadcrumb-bar.tsx` | `tests/integration/day/ghost-navigation.test.tsx`, `tests/integration/day/day-surface-regression.test.tsx` |
| Timeline derivation + render axis | `src/features/day/hooks/*`, `src/components/timeline/*` | `tests/unit/timeline/*`, `tests/unit/day/use-day-entries.test.tsx` |

## Revision History

- 2026-04-26 - Requisitos ampliados com regras estruturais, dominio fechado de
  tarefas/notas e postura honesta de canon em consolidacao
