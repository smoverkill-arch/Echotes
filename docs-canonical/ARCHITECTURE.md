# Architecture

## System Overview

Echotes usa Expo, React Native, Expo Router, Zustand, Zod e Supabase.
Cada rota representa um dia.
A timeline e a vista principal.

O baseline atual entrega auth por email e senha.
O baseline atual entrega superficie diaria protegida.
O corte atual inclui CRUD basico de notas e tarefas.
O corte atual inclui tarefa projected com ghost card e breadcrumb.
`002-note-echo-flows` entrega leitura de ecos diretos, Reader contextual,
criacao/remocao manual de eco e continuacao atomica de nota.
O repo tambem guarda regressao automatizada.

## Product Truths

- O dia e a unidade principal do produto.
- Cada dia expoe duas paginas de timeline separadas por tipo: Task Timeline
  (tarefas, eixo a esquerda) e Note Timeline (notas, eixo a direita).
- As duas paginas sao navegaveis por swipe horizontal (react-native-pager-view)
  e pela bottom bar; o icone ativo reflete a pagina visivel.
- `created_at` define a posicao intradiaria base.
- `scheduled_at` cria um segundo ponto real para tarefas com horario.
- Tarefas usam projecao temporal.
- Notas usam ecos.

## Component Map

- `app/index.tsx` inicia a sessao e redireciona o app.
- `app/(auth)/sign-in.tsx` e `app/(auth)/sign-up.tsx` formam o fluxo publico.
- `app/day/[date].tsx` entrega a rota protegida do dia.
- `src/components/day/day-shell.tsx` compoe a superficie diaria.
- `src/components/day/day-bottom-tabs.tsx` mantem as lentes do dia na bottom
  bar persistente.
- `src/components/timeline/*` renderiza eixo, wrappers de pagina e acao
  principal. `TimelinePageView` e `TimelinePageItem` encapsulam o layout
  de tipo unico (eixo esquerdo ou direito, card full-width).
- `src/components/cards/*` renderiza cards reais, marker e ghost.
- `src/components/reader/*` abre overlays de leitura.
  O Reader de nota organiza acao primaria, acoes secundarias e acao destrutiva
  separadamente para preservar clareza em mobile.
- `src/components/forms/*` abre overlays de criacao e edicao.
- `src/features/day/hooks/*` carrega entradas e monta a timeline.
- `src/features/tasks/*` concentra regras e APIs de tarefa.
- `src/features/notes/*` concentra regras e APIs de nota.
- `src/theme/*` guarda tokens compartilhados de cor, espaco, raio, tipografia
  e alvos de toque para a superficie mobile.
- `src/utils/*` guarda helpers de data, sort local e formatacao do dia.

## Layer Boundaries

- `app/` compoe rotas e redirecionamentos.
- `src/components/` renderiza UI e traduz eventos de toque.
- `src/features/` implementa comportamento de dominio por feature.
- `src/stores/` guarda estado de calendario, auth, navegacao e UI.
- `src/schemas/` e `src/types/` definem contratos locais.
- `src/theme/` centraliza constantes visuais reutilizaveis; componentes podem
  compor estilos locais, mas nao devem recriar linguagem visual global quando
  houver token aplicavel.
- `src/utils/` oferece helpers puros usados por formularios e timeline.
- `supabase/migrations/` preserva schema e RLS.

`TimelineNode` pertence ao dominio.
A orientacao esquerda ou direita pertence apenas a camada de renderizacao.

## Tech Stack

- TypeScript 5.x.
- Expo 54.
- React 19.
- React Native 0.81.
- Expo Router 6.
- Zustand 5.
- Zod 4.
- Supabase JS 2.
- Jest com Testing Library React Native.

## External Dependencies

- Supabase Auth para email e senha.
- Supabase Postgres para `tags`, `tasks`, `notes` e `note_echoes`.
- AsyncStorage para persistencia local da sessao.

## Routes

- `/` faz bootstrap e redirecionamento.
- `/(auth)/sign-in` abre a entrada publica.
- `/(auth)/sign-up` abre o cadastro publico.
- `/day/[date]` abre a superficie diaria protegida.

## Stores

### `calendarStore`

- Guarda `selectedDate`.
- Guarda `clockDate`.
- Guarda `calendarMode`.
- Em modo semanal, a semana sempre comeca aos domingos.
- A strip semanal acompanha a semana que contem `selectedDate`.
- O modo mensal expande o grid do mes inline no proprio header e recolhe ao
  selecionar um dia.
- Uma troca de data fora da semana recalcula a faixa visivel.
- A interface deve distinguir o dia real do relogio e o dia selecionado pelo
  usuario.

### `navigationStore`

- Guarda `sourceDate`.
- Guarda `destinationDate`.
- Guarda `sourceTaskId`.
- Guarda `returnScrollOffset`.
- Guarda `isTemporalNavigationActive`.
- Guarda `pendingReaderOpen` para abrir uma nota depois de navegacao entre dias.

Esse store sustenta a navegacao temporal de tarefas e a abertura contextual
one-shot de nota conectada ou continuada em outro dia.

### `uiStore`

- Guarda `activeDayTab`.
- Guarda `readerState`.
- Guarda `editorState`.

O Reader abre apenas item existente.
O Editor opera em `create` e `edit`.
`create` usa item novo.
`edit` exige `id`.

## Data Strategy

Para `selectedDate = D`, a tela carrega:

- tarefas com `source_day = D`.
- tarefas com `target_day = D`.
- notas com `day = D`.
- ecos ligados a notas do dia para contagem direta e detalhes do Reader.

Esse desenho preserva dominios separados.
O baseline evita tabela generica unica.

## Timeline Derivation

Entrada:

- `selectedDay`.
- `tasks[]`.
- `notes[]`.

Saida:

- `TimelineNode[]`.

Regras:

- nota do dia gera `note` com `sortAt` derivado de `created_at`.
- tarefa sem horario em `target_day` gera `task_untimed`.
- tarefa same-day com horario gera `task_creation_marker`.
- a mesma tarefa same-day com horario gera `task_timed`.
- tarefa projected gera `task_ghost` em `source_day`.
- tarefa projected gera o item real em `target_day`.
- projected com horario usa apenas ghost na origem.

Ordenacao:

- `created_at` define a posicao local de notas.
- `created_at` define a posicao local de tarefas sem horario.
- `scheduled_at` define a posicao local de tarefas agendadas.
- o dia exibido sempre usa horario local derivado para ordenar.

## Reader and Editor

Reader e Editor vivem sobre a superficie do dia.
Eles nao viram rotas proprias.

- clique simples abre Reader.
- double tap abre Editor em `edit`.
- o Reader tambem oferece botao de editar.
- nota e tarefa compartilham a ideia de sheet mobile sobre a superficie do dia.
- cada dominio usa formulario e leitura proprios.
- o header/calendario vivem como overlay sobre a timeline/listas: recolhem
  visualmente durante scroll vertical, deixam o conteudo rolar por tras e
  voltam quando a rolagem entra em repouso sem reocupar altura de layout.
- as lentes `TIME LINE`, `TAREFAS` e `NOTAS` ficam na bottom bar persistente,
  separadas do calendario.

## Creation and Editing Flows

### Main `+` Action

O `+` abre uma escolha simples.
A pessoa escolhe entre criar tarefa e criar nota.
Depois disso, o app abre o editor correto em modo `create`.
A escolha e os editores usam sheets mobile com tokens compartilhados, feedback
de pressao/desabilitado e alvos de toque confortaveis.

### Task Creation

O editor de tarefa permite:

- definir `target_day`.
- ajustar `target_day` por controles de dia anterior, dia seguinte e hoje.
- informar `scheduled_time` opcional.
- compor `scheduled_at` a partir de `target_day + scheduled_time`.
- validar `scheduled_at > created_at` antes de persistir.

### Note and Echo Flows

Nota independente, eco manual e `Continuar desta nota` estao no corte entregue
por `002-note-echo-flows`.

- `useDayEntries` carrega ecos ligados as notas do dia.
- A timeline deriva badge pela contagem de ecos diretos.
- Cards de nota em timeline e aba Notas exibem titulo, indicadores e preview
  curto; conteudo completo pertence ao Reader.
- O Reader mostra notas conectadas e degrada detalhes inacessiveis sem quebrar
  a relacao.
- O Reader separa o corpo da nota da secao `Ecos` por bloco visual proprio.
- `Adicionar eco` usa lista paginada de candidatas e desabilita notas ja
  conectadas. A superficie visual e um sheet mobile acionado pelo Reader, com
  origem explicita, chip de mesmo dia/outro dia e feedback de erro/vazio.
- Criacao de nota tambem oferece `Eco inicial`, listando candidatas antes do
  save. O app cria a nota primeiro, tenta criar o eco manual em seguida, abre o
  Reader da nota criada e preserva a nota se apenas o eco falhar.
- Criacao manual usa `kind = manual_link`.
- Remocao exige confirmacao e apaga somente a relacao selecionada.
- Notas conectadas de outro dia navegam para `/day/[date]` e usam
  `pendingReaderOpen` para abrir o Reader uma unica vez.
- `Continuar desta nota` preserva o contrato `newNoteDay` em `YYYY-MM-DD`, mas
  apresenta controles mobile de dia anterior, dia seguinte e hoje antes de
  chamar a RPC atomica `continue_note`.

Mencao inline com `@nota` permanece fora do corte entregue.

### Content Mention Flow

Fluxo canonico:

- a pessoa digita `@`.
- o app abre busca de notas existentes.
- a selecao vira chip inline clicavel.
- o save cria ou atualiza eco `manual_link`.

Formato persistido:

- `@[Label da Nota](note:<note_id>)`.

### Continue Note Flow

Ao continuar uma nota, o sistema:

- cria nova nota em um dia escolhido.
- gera briefing automatico.
- permite editar o briefing logo em seguida.
- cria eco `continue_note`.
- preserva o link com a nota de origem.
- executa criacao de nota e eco de forma atomica via RPC `continue_note`.
- quando o dia escolhido e diferente, navega ao destino e abre a nova nota com
  `pendingReaderOpen`.

## Visual States

O baseline precisa destes estados:

- nota real com badge de ecos diretos.
- tarefa sem horario.
- marker de criacao para tarefa same-day com horario.
- tarefa agendada.
- ghost card.
- breadcrumb de retorno.

## Current Baseline Boundaries

Implementado hoje:

- auth por email e senha.
- superficie protegida do dia.
- nota e tarefa same-day.
- tarefa projected com ghost e breadcrumb.
- leitura, criacao manual, remocao e navegacao contextual de ecos diretos.
- continuacao atomica de nota por RPC `continue_note`.
- regressao automatizada do corte.

Canon absorvido para fases futuras:

- mencoes inline persistidas como chip.
- release e deploy de producao.

## Configuration Surface

- `.docguard.json` regula o enforcement documental.
- `.agents/` guarda skills do projeto.
- `.agent/` e `commands/` podem surgir por automacao.
- `app.json`, `babel.config.js`, `metro.config.js` e `tsconfig.json` sustentam runtime e build local.
- `eslint.config.js` e `jest.config.js` sustentam os gates tecnicos.

## Diagrams

```mermaid
flowchart TD
  A["Expo Router"] --> B["Auth Flow"]
  A --> C["Protected Day Route"]
  C --> D["DayShell"]
  D --> E["useDayTimeline"]
  E --> F["useDayEntries"]
  F --> G["Supabase Client"]
  D --> H["calendarStore / navigationStore / uiStore"]
  D --> I["TimelineView + cards + overlays"]
  G --> J["Supabase Auth"]
  G --> K["Postgres + RLS"]
```

## Revision History

- 2026-05-13 - Correcoes do smoke S21 em `003-mobile-day-shell-ux`: bottom bar,
  calendario mensal inline, chrome colapsavel, preview de notas e eco inicial
  na criacao de nota.
- 2026-05-12 - Criacao, edicao de nota/tarefa e Reader de tarefa em
  `003-mobile-day-shell-ux` atualizados para sheets mobile com tokens.
- 2026-05-12 - Fluxos abertos pelo Reader em `003-mobile-day-shell-ux`
  atualizados para sheets mobile com tokens e controles de data guiados.
- 2026-05-12 - `003-mobile-day-shell-ux` iniciou shell temporal mobile,
  `src/theme/` e calendario semanal/mensal para a superficie do dia.
- 2026-05-11 - Arquitetura atualizada para `002-note-echo-flows`: ecos
  diretos, Reader contextual, `pendingReaderOpen` e RPC `continue_note`.
- 2026-05-01 - Texto simplificado, `src/utils/` documentado e fluxos reagrupados por responsabilidade.
- 2026-04-26 - Arquitetura ampliada com stores, estrategia de dados, algoritmo da timeline e estado honesto de migracao do canon.
