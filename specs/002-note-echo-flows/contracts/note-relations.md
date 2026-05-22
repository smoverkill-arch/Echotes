# Contrato: Relacoes de Nota na Superficie do Dia

## Objetivo

Definir o contrato funcional para leitura de ecos, exibicao de contagem direta
na timeline, Reader com notas conectadas, criacao manual de `manual_link` e
remocao explicita de relacoes diretas.

## Entradas

| Entrada | Descricao |
|---------|-----------|
| `selectedDay` | dia da rota/superficie atualmente carregada |
| `session.userId` | identidade autenticada dona das notas |
| `notes` | notas em que `day = selectedDay` |
| `echoes` | relacoes de `note_echoes` ligadas as notas do dia |
| `readerState.noteId` | nota atualmente aberta no Reader, quando houver |

## Saidas Derivadas

| Saida | Origem | Regra |
|-------|--------|-------|
| `directEchoCount` | `echoes` | soma apenas relacoes diretas da nota |
| `relatedNotes` | `echoes` + notas conhecidas | lista notas conectadas sem hierarquia visivel |
| `echoBadgeVisible` | `directEchoCount` | aparece apenas quando a contagem for maior que zero |
| `candidatePage` | notas recentes | lote de ate 50 candidatas para `Adicionar eco` |
| `pendingReaderOpen` | navegacao cross-day | pedido efemero para abrir Reader apos carga do dia |

## Contrato de Leitura do Dia

- A carga do dia continua partindo de `selectedDay`.
- O dia traz `notes` do dia e `echoes` ligados a essas notas.
- A timeline recebe apenas a contagem direta derivada; nao recebe a rede
  completa de relacoes como estrutura visual.
- Nenhum elemento novo de timeline e criado para eco.

## Contrato do Card de Nota

- O card de nota continua sendo um item `note` da timeline.
- O card pode exibir o badge `Ecos` com contagem direta.
- O badge nao altera ordenacao temporal, lado visual nem gesto de abertura.

## Contrato do Reader de Nota

- O Reader continua sendo sobreposicao contextual sobre o dia.
- O Reader da nota passa a mostrar:
  - titulo
  - dia
  - `brief`, se existir
  - conteudo, se existir
  - lista de notas conectadas por eco direto
  - acao `Adicionar eco`
  - acao contextual `Remover eco` para cada relacao direta elegivel
  - acao `Continuar desta nota`
- A lista de notas conectadas nao representa hierarquia, arvore nem total da
  familia conceitual.
- A lista de notas conectadas define "mesmo dia" sempre em relacao a
  `activeNote.day`, nao a `selectedDay` da superficie anterior.
- A lista de notas conectadas ordena primeiro notas em que
  `relatedNote.day === activeNote.day`; dentro desse grupo usa
  `created_at desc`, `id desc`.
- As demais notas conectadas sao ordenadas por `day desc`, `created_at desc`,
  `id desc`. `updated_at` nao participa da ordenacao deste corte.
- A UI trata toda conexao apenas como `Eco`; `kind` nao aparece como subtipo
  visivel de relacao.
- A UI do Reader, cards, seletor e confirmacoes nao pode rotular relacoes como
  hierarquia, grafo, origem/destino, pai/filho, arvore, cadeia, continuacao ou
  subtipo; os labels visiveis usam apenas `Eco` e `nota conectada`.
- Quando uma nota conectada autorizada falhar por carga transitoria, o Reader
  mantem um item indisponivel para aquela relacao, com acao de recarregar
  detalhes.
- O item indisponivel so pode representar falha transitoria de carga de uma
  relacao cujos endpoints tenham passado por verificacao de acesso atual.
- Falha por RLS, ownership, sessao ausente ou sessao expirada nao gera linha
  indisponivel nem incrementa contagem; a UI mostra feedback recuperavel
  generico e recarrega a lista autorizada.
- Contagens e linhas de relacao sao derivadas apenas de ecos cujas duas notas
  endpoint estejam acessiveis ao usuario autenticado no momento da leitura.
- O recarregamento de detalhes de uma nota conectada e item-level: ele atualiza
  apenas o detalhe minimo daquela nota e nao remove a relacao enquanto uma carga
  autoritativa de ecos nao disser que a relacao deixou de existir.
- Falha transiente de detalhe, perda de acesso ao detalhe e relacao removida sao
  estados distintos. Falha transiente preserva a relacao e mostra `Recarregar`;
  perda de acesso limpa qualquer detalhe em cache e mostra feedback recuperavel;
  relacao removida so e refletida depois de reload autoritativo dos ecos.
- Ao sair do dia, abrir outra nota, navegar manualmente para outro dia ou falhar
  um reload de destino, o app limpa detalhes conectados stale que nao tenham sido
  confirmados na carga atual.

## Contrato de Navegacao para Nota Conectada

- Ao tocar uma nota conectada do mesmo dia, o Reader troca para essa nota sem
  sair da superficie atual.
- Ao tocar uma nota conectada de outro dia, o app fecha a leitura do dia atual
  para essa nota, navega para `/day/[date]` em que `[date] === relatedNote.day`,
  atualiza `selectedDay` para esse mesmo dia e so entao reabre o Reader na nota
  solicitada.
- Uma nota conectada de outro dia NUNCA e renderizada dentro da superficie do
  dia anterior; se a rota ou `selectedDay` ainda nao apontam para
  `relatedNote.day`, o Reader nao abre essa nota.
- Essa navegacao nao cria breadcrumb temporal novo e nao usa ghost card.
- A reabertura cross-day usa `pendingReaderOpen` escopado por:
  - `noteId`
  - `noteDay` da nota que deve abrir
  - `actionOrigin` (`connected_note_tap` ou `continue_note_created`)
  - `requestId`
  - `session.userId`
- `pendingReaderOpen.noteDay` e o dia esperado da nota a abrir. Para notas
  continuadas, ele e igual a `newNoteDay`.
- O pending e de consumo unico: uma tentativa bem-sucedida ou malsucedida de
  abrir o Reader encerra aquele `requestId`.
- O pending so pode ser consumido quando `routeDay === pendingReaderOpen.noteDay`,
  a nota carregada tiver `note.id === pendingReaderOpen.noteId` e
  `note.day === pendingReaderOpen.noteDay`, e `session.userId` ainda for o
  mesmo.
- O pending deve ser limpo em consumo bem-sucedido, falha de reload do destino,
  mismatch de rota/dia/nota, logout ou troca de usuario, navegacao manual para
  outro dia, cancelamento explicito ou novo pedido concorrente de abertura.

## Contrato de `Adicionar eco`

- A acao so parte de uma nota existente aberta no Reader.
- O seletor permanece preso ao Reader aberto e ao dia selecionado; ele nao vira
  modulo global de relacoes nem tela de navegacao independente.
- O seletor de nota candidata:
  - exclui a nota aberta
  - mostra notas do mesmo usuario
  - mostra o dia de cada candidata
  - prioriza candidatas em que `candidate.day === selectedDay`
  - depois lista outras notas recentes com o dia visivel
  - ordena o grupo de `selectedDay` por `created_at desc`, `id desc`
  - ordena as demais candidatas por `day desc`, `created_at desc`, `id desc`
  - carrega lotes de 50 notas recentes
  - oferece `carregar mais` enquanto houver proximo lote
  - mostra notas ja conectadas como desabilitadas com `Eco ja existe`
- Ao confirmar:
  - executa preflight de sessao autenticada imediatamente antes da mutacao
  - desabilita confirmacao se a sessao estiver ausente, expirada ou pendente de
    reautenticacao
  - revalida, no servidor, que `from_note_id`, `to_note_id` e
    `context_note_id` pertencem e estao acessiveis a `auth.uid()`
  - cria relacao `manual_link`
  - usa a nota aberta como `from_note_id`
  - usa a nota escolhida como `to_note_id`
  - registra `context_note_id` com a nota aberta
  - registra `context_day` com o dia da superficie aberta
- `from_note_id`, `to_note_id`, `context_note_id` e `context_day` sao campos
  internos de persistencia/auditoria; nenhum deles pode virar label de UI como
  origem, destino, pai, filho ou subtipo.
- `createNoteEcho` nao confia em `session.userId`, `created_by_user_id` ou dono
  enviado pelo cliente; a persistencia precisa depender de RLS ou RPC que faca
  checks equivalentes com `auth.uid()` no momento da confirmacao.
- `createNoteEcho` tenta inserir contra a unicidade do par semantico sem direcao.
  Conflito unico nao e, por si so, sucesso de UX.
- Quando o insert encontra conflito unico, a API precisa buscar a relacao
  existente acessivel ao usuario para o mesmo par antes de responder `Eco ja
  existe`.
- Se a relacao existente nao puder ser lida ou nao estiver acessivel, o resultado
  e falha recuperavel de acesso/reload, nao `Eco ja existe`.
- A reconciliacao de sucesso exige estado autoritativo: a relacao criada ou
  existente foi lida, o par esta presente uma unica vez, o `kind` original foi
  preservado, a contagem direta foi recalculada a partir de `echoes` e a lista do
  Reader foi atualizada.
- Se a candidata, a nota de origem ou o `context_note_id` ficarem stale,
  inacessiveis ou pertencerem a outro usuario apos a abertura do seletor, a
  mutacao falha sem insert e usa feedback FR-020.
- Se a sessao expirar com seletor aberto, o app preserva o estado local seguro
  do seletor/draft, mostra feedback distinto de sessao expirada e exige
  reautenticacao antes de habilitar nova confirmacao.
- Se o par ja existir, a UX trata a acao como idempotente e atualiza o estado
  sem duplicar a relacao.
- Quando o par ja existir:
  - a UX informa `Eco ja existe`
  - a relacao atual e preservada
  - o `kind` original permanece como proveniencia inicial
- Candidatas desabilitadas por eco existente nao podem ser confirmadas.
- A paginacao de candidatas usa cursor estavel composto por
  `(isSelectedDayGroup, day, created_at, id)`, preservando a mesma ordenacao
  entre paginas e mantendo candidatas desabilitadas na posicao determinada por
  esses campos.

## Contrato de `Remover eco`

- A acao parte de uma nota existente aberta no Reader e opera sobre uma relacao
  direta atualmente visivel.
- A remocao identifica o par semantico independentemente da ordem persistida em
  `from_note_id` e `to_note_id`.
- Ao confirmar:
  - solicita confirmacao explicita da pessoa usuaria
  - executa preflight de sessao autenticada imediatamente antes da mutacao
  - desabilita confirmacao se a sessao estiver ausente, expirada ou pendente de
    reautenticacao
  - revalida, no servidor, que as duas notas endpoint e a relacao continuam
    acessiveis a `auth.uid()`
  - remove a unica relacao `Eco` do par selecionado
  - preserva ambas as notas e seus demais vinculos
  - atualiza contagem, lista do Reader e estado relevante do dia
- A remocao deve usar id da relacao ou par semantico sempre constrained por
  joins/exists contra notas pertencentes ao usuario autenticado sob RLS ou RPC
  equivalente; nenhum dono vindo do cliente autoriza delete.
- A operacao de delete precisa verificar linhas afetadas. Exatamente uma linha
  removida confirma sucesso; zero linhas significa relacao stale, ja removida
  ou inacessivel e deve gerar feedback recuperavel sem revelar qual caso
  ocorreu.
- Se a relacao nao existir mais no momento da confirmacao, a UX exibe feedback
  recuperavel sem derrubar a superficie inteira do dia.
- Delete idempotente considera `already_removed` como reconciliacao bem-sucedida
  somente depois de recarregar os ecos relevantes e confirmar que o par nao esta
  mais presente para o usuario atual.
- Ao reconciliar remocao ou `already_removed`, o Reader remove o item da lista ou
  o marca como stale enquanto o reload autoritativo termina, recalcula contagens
  a partir do estado carregado e desabilita nova tentativa de remocao naquele item
  stale.
- Falha de rede/reload apos delete nao reativa o item como removivel. A UI
  preserva feedback recuperavel e exige reload autoritativo antes de permitir
  outra acao destrutiva sobre o mesmo par.

## Invariantes

- Ecos permanecem exclusivos de notas.
- A timeline mostra apenas contagem direta, nao grafo ou mapa.
- A abertura de nota conectada nao converte Reader em rota propria.
- `manual_link` e `continue_note` registram apenas a proveniencia inicial da
  relacao, sem alterar a semantica visivel de `Eco`.
- Nenhum campo `side` e introduzido no dominio da timeline.
- Mencoes inline `@nota` permanecem fora deste contrato.

## Vocabulario de UI

| Tipo | Permitido | Proibido |
|------|-----------|----------|
| Relacao | `Eco`, `Ecos`, `nota conectada`, `notas conectadas` | `grafo`, `rede`, `mapa`, `familia`, `arvore`, `cadeia` |
| Acao | `Adicionar eco`, `Remover eco`, `Recarregar`, `carregar mais` | `abrir origem`, `abrir destino`, `ver continuacao`, `criar subtipo` |
| Estado | `Eco ja existe`, `Item indisponivel`, `Nenhuma nota conectada` | `pai`, `filho`, `nota mae`, `nota filha`, `subnota`, `dependencia` |
| Dia | `Dia da nota`, `Dia selecionado` | `source day`, `target day`, `dia de origem`, `dia de destino` |
