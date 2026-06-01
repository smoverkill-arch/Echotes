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

### `002-note-echo-flows`

- `002-note-echo-flows:FR-001` O dia deve carregar notas com contagem direta de
  ecos.
- `002-note-echo-flows:FR-002` A timeline deve renderizar badge discreto para
  nota com eco direto.
- `002-note-echo-flows:FR-003` A contagem de ecos deve considerar apenas
  relacoes diretas da nota.
- `002-note-echo-flows:FR-004` O Reader de nota deve listar notas conectadas
  diretamente.
- `002-note-echo-flows:FR-005` Ecos devem ser relacoes nao hierarquicas entre
  duas notas.
- `002-note-echo-flows:FR-006` O Reader deve permitir adicionar eco manual.
- `002-note-echo-flows:FR-007` Criar eco manual deve persistir `kind =
  manual_link`.
- `002-note-echo-flows:FR-008` Criar eco manual deve bloquear duplicidade do par
  semantico.
- `002-note-echo-flows:FR-009` Remover eco deve exigir confirmacao e apagar
  apenas a relacao escolhida.
- `002-note-echo-flows:FR-010` Falha de detalhe por acesso deve degradar a
  relacao para estado indisponivel, sem perder identidade.
- `002-note-echo-flows:FR-011` Nota conectada de outro dia deve navegar para o
  dia dela e abrir o Reader contextual.
- `002-note-echo-flows:FR-012` A abertura contextual apos navegacao deve ser
  one-shot.
- `002-note-echo-flows:FR-013` Apos criar ou remover eco, o dia deve recarregar
  dados e feedback.
- `002-note-echo-flows:FR-014` O Reader deve permitir `Continuar desta nota`.
- `002-note-echo-flows:FR-015` A continuacao deve criar uma nova nota no dia
  escolhido.
- `002-note-echo-flows:FR-016` A nova nota deve nascer ligada a nota de origem
  por eco `continue_note`.
- `002-note-echo-flows:FR-017` A continuacao deve gerar briefing inicial
  editavel.
- `002-note-echo-flows:FR-018` A continuacao deve ser atomica no banco.
- `002-note-echo-flows:FR-019` Clique simples em nota segue abrindo Reader.
- `002-note-echo-flows:FR-020` Double tap em nota segue abrindo Editor.
- `002-note-echo-flows:FR-021` O Reader deve comunicar relacao indisponivel sem
  quebrar a tela.
- `002-note-echo-flows:FR-022` A busca de candidatas deve paginar em lotes de
  50 notas.
- `002-note-echo-flows:FR-023` Candidatas ja conectadas devem aparecer
  desabilitadas.
- `002-note-echo-flows:FR-024` A feature nao deve introduzir semantica inline
  `@nota`; isso permanece fora do corte entregue.

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
- `N-011` O dominio entregue admite `Adicionar eco` e `Continuar desta nota`.
  Mencao no conteudo com `@nota` segue fora do corte entregue.
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
- `UI-APPEARANCE-001` A superficie diaria deve oferecer Ajustes de aparencia
  locais para modo claro/escuro, cor de destaque e densidade da timeline.
- `UI-APPEARANCE-002` Ajustes de aparencia nao podem alterar dominio, dados,
  auth, criacao, Reader, Editor, ecos, ghost navigation ou ordenacao temporal.
- `UI-APPEARANCE-003` A densidade da timeline deve afetar somente espacamento,
  tamanho visual e exibicao de previews, preservando todos os itens e a
  orientacao `task -> esquerda` / `note -> direita`.
- `UI-ONBOARDING-001` O app deve apresentar onboarding inicial uma unica vez,
  persistir `hasSeen` localmente e rotear a raiz para onboarding, home ou
  sign-in conforme onboarding visto e estado de auth, respeitando a hidratacao.
- `UI-DASHBOARD-001` A home autenticada deve exibir o resumo do dia do relogio
  (contagens de tarefas, notas e ecos), destacar a proxima tarefa agendada,
  mostrar estado vazio quando aplicavel, oferecer atalho para abrir o dia e
  redirecionar para sign-in sem sessao.
- `UI-HEADER-001` O header do dia deve exibir a marca Echotes e o chip de hoje
  quando o dia selecionado for o do relogio e permitir alternar o calendario
  entre semana e mes.
- `UI-BRAND-001` A marca deve renderizar em tamanhos com wordmark opcional e
  permanecer consistente ao trocar modo e cor de destaque.
- `UI-PRIMITIVE-001` As primitivas de UI compartilhadas devem expor tons,
  respeitar `disabled` e disparar acao apenas quando habilitadas.
- `UI-READER-ROUTE-001` O Reader de nota e de tarefa devem ser rotas empilhadas
  (`/day/[date]/note/[id]` e `/day/[date]/task/[id]`); fechar volta na pilha.
- `UI-READER-ROUTE-002` A abertura de nota conectada de outro dia e a
  continuacao de nota devem empurrar a rota da nota de destino, sem estado
  one-shot global.

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
- `002-note-echo-flows:SC-001` Abrir um dia com notas conectadas mostra badge de
  eco direto e Reader com relacoes.
- `002-note-echo-flows:SC-002` Criar eco manual conecta duas notas sem duplicar
  par semantico.
- `002-note-echo-flows:SC-003` Remover eco apaga apenas a relacao selecionada e
  preserva outras relacoes da familia.
- `002-note-echo-flows:SC-004` A busca de candidatas pagina resultados e
  bloqueia candidatas ja conectadas.
- `002-note-echo-flows:SC-005` Continuar nota cria nota e eco `continue_note`
  atomicamente.
- `002-note-echo-flows:SC-006` Fluxos de eco e continuacao preservam Reader,
  Editor, orientacao visual e separacao entre nota e tarefa.

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
| Auth + protection | `app/index.tsx`, `app/(auth)/*`, `app/day/[date]/index.tsx`, `src/features/auth/*` | `tests/integration/auth/auth-session-flow.test.tsx` |
| Same-day notes/tasks | `src/features/notes/*`, `src/features/tasks/*`, `src/components/forms/*`, `src/components/reader/*` | `tests/integration/day/day-surface-same-day.test.tsx` |
| Projected tasks + breadcrumb | `src/features/timeline/utils/derive-timeline-nodes.ts`, `src/stores/navigation-store.ts`, `src/components/day/breadcrumb-bar.tsx` | `tests/integration/day/ghost-navigation.test.tsx`, `tests/integration/day/day-surface-regression.test.tsx` |
| Timeline derivation + render axis | `src/features/day/hooks/*`, `src/components/timeline/*` | `tests/unit/timeline/*`, `tests/unit/day/use-day-entries.test.tsx` |
| Note echo flows | `src/features/notes/api/*`, `src/features/notes/utils/*`, `src/components/reader/note-reader.tsx`, `src/components/forms/continue-note-editor.tsx`, `supabase/migrations/004_note_echo_flows.sql` | `tests/unit/notes/*`, `tests/integration/day/note-echo-*.test.tsx`, `tests/integration/day/continue-note-flow.test.tsx` |
| Appearance preferences | `src/stores/appearance-store.ts`, `src/components/day/settings-sheet.tsx`, `src/theme/tokens.ts` | `tests/unit/day/settings-sheet.test.tsx`, `tests/unit/day/day-header-calendar.test.tsx` |
| App entry + dashboard + UI primitives | `app/index.tsx`, `app/onboarding.tsx`, `app/home.tsx`, `src/stores/onboarding-store.ts`, `src/components/brand/*`, `src/components/ui/*` | `tests/unit/onboarding/*`, `tests/unit/home/home-dashboard.test.tsx`, `tests/unit/ui/primitives.test.tsx` |
| Reader as route | `app/day/[date]/_layout.tsx`, `app/day/[date]/note/[id].tsx`, `app/day/[date]/task/[id].tsx`, `src/features/day/hooks/use-note-reader-controller.ts` | `tests/integration/day/note-echo-navigation.test.tsx`, `tests/integration/day/continue-note-flow.test.tsx` |

## Revision History

- 2026-05-31 - `005-ui-ux-improvement` registrado: onboarding inicial, home
  autenticada, gate de roteamento na raiz, Reader de nota/tarefa como rotas
  empilhadas (remocao de `pendingReaderOpen`) e primitivas de UI/marca.
- 2026-05-11 - `002-note-echo-flows` registrado como entrega ativa para ecos
  manuais e `continue_note`; mencoes inline permanecem fora do corte.
- 2026-05-27 - Ajustes locais de aparencia registrados para modo, destaque e
  densidade sem alterar dominio do dia.
- 2026-04-26 - Requisitos ampliados com regras estruturais, dominio fechado de
  tarefas/notas e postura honesta de canon em consolidacao
