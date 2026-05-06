# Modelo de Dados: Fluxos de Eco de Nota

## Visao Geral

Esta feature ativa, na UI do Echotes, o modelo de `note_echoes` que ja existe
no baseline. Nenhuma tabela nova e esperada. O corte adiciona leitura diaria de
ecos, contagem direta por nota, criacao manual de relacao, remocao contextual e
continuacao guiada de nota por RPC atomica.

## Nota

**Objetivo**: representar um registro textual pertencente a um dia.

**Campos**:

- `id`
- `user_id`
- `day`
- `title`
- `content`
- `brief`
- `tag_id`
- `color`
- `is_color_overridden`
- `created_at`
- `updated_at`

**Regras de validacao**:

- `title` nao pode ser vazio.
- `day` define o pertencimento temporal soberano da nota.
- Nota nunca recebe `source_day`, `target_day` ou ghost card.

## Eco de Nota

**Objetivo**: representar uma conexao conceitual direta entre duas notas.

**Campos**:

- `id`
- `from_note_id`
- `to_note_id`
- `created_by_user_id`
- `created_at`
- `context_note_id`
- `context_day`
- `kind`
- `metadata`

**Valores canonicos de `kind`**:

- `manual_link`
- `continue_note`

`kind` registra apenas a proveniencia inicial da criacao da relacao. O primeiro
valor persistido para o par e preservado; a UI continua tratando ambos apenas
como `Eco`.

**Regras de validacao**:

- `from_note_id` e `to_note_id` sempre apontam para notas diferentes.
- O par semantico entre duas notas deve permanecer unico, independentemente da
  ordem dos ids.
- Inserts, deletes e leituras de `note_echoes` precisam ser constrained por
  endpoints acessiveis ao `auth.uid()` atual; ownership enviado pelo cliente nao
  autoriza nenhuma operacao.
- `context_note_id` precisa apontar para nota acessivel ao mesmo usuario no
  momento da escrita, normalmente a propria nota de origem da acao.
- A UI trata o eco como relacao sem direcao visivel, embora a persistencia use
  `from_note_id` e `to_note_id` de forma deterministica.
- Tentativas posteriores sobre o mesmo par nao reescrevem `kind`; retornam
  feedback e preservam a relacao existente.
- Conflito de unicidade no par semantico so pode ser convertido em `Eco ja
  existe` depois de buscar a relacao existente sob o acesso atual do usuario.
- Se essa relacao existente nao puder ser lida, o estado da operacao e falha
  recuperavel de acesso/reload; a UI nao deve presumir sucesso nem criar copia
  local otimista.

**Convencao deste corte**:

- `Adicionar eco`: `from_note_id` recebe a nota de origem aberta no Reader e
  `to_note_id` recebe a nota escolhida.
- `Continuar desta nota`: `from_note_id` recebe a nota de origem e `to_note_id`
  recebe a nova nota criada.
- `context_note_id` recebe a nota de origem da acao.
- `context_day` registra o dia em que a acao foi disparada a partir da
  superficie aberta.
- `context_day` e proveniencia/auditoria. Ele nunca define rota, reload de dia,
  `notes.day` da nota criada nem destino de abertura do Reader.

## Resumo Direto de Ecos

**Objetivo**: representar a derivacao usada pela timeline para exibir o badge
`Ecos`.

**Campos derivados**:

- `noteId`
- `directCount`

**Regras de derivacao**:

- `directCount` soma apenas ecos em que a nota participa diretamente.
- A derivacao nunca expande a rede inteira da familia.
- O badge nao aparece quando `directCount = 0`.

## Nota Relacionada para Reader

**Objetivo**: representar a forma minima de uma nota conectada exibida no
Reader de outra nota.

**Campos**:

- `id`
- `day`
- `title`
- `brief`
- `created_at`
- `kind`
- `availability`

**Regras de leitura**:

- Se a nota relacionada ja pertencer ao dia carregado, os dados locais do dia
  podem abastecer a lista.
- Se a nota relacionada estiver fora do dia atual, seus detalhes minimos podem
  ser buscados sob demanda quando o Reader abrir, em lote por conjunto distinto
  de ids relacionados.
- `kind` pode existir como metadado interno de proveniencia, mas nao altera a
  semantica visivel da relacao para a UI.
- Se os detalhes da nota relacionada autorizada falharem por carga transitoria,
  o Reader representa a conexao como item indisponivel com acao de recarregar.
- `availability = transient_unavailable` representa apenas falha tecnica
  recuperavel depois de a relacao e seus endpoints terem passado por checagem
  de acesso atual.
- Negacao por RLS, ownership, sessao ausente ou sessao expirada nao vira item
  indisponivel; a relacao e removida da derivacao autorizada e o feedback nao
  revela se a nota ou a relacao existem.
- `directCount` e `relatedNotes` nunca contam linhas cuja nota endpoint atual
  nao tenha sido confirmada como acessivel ao usuario autenticado.
- A ordenacao de `relatedNotes` usa `activeNote.day` como referencia de mesmo
  dia. Primeiro entram notas com `day = activeNote.day`, por `created_at desc`
  e `id desc`; depois entram as demais por `day desc`, `created_at desc` e
  `id desc`.
- O cache de detalhe minimo e subordinado a relacao carregada. Falha de detalhe
  limpa `title`, `brief` e `created_at` stale daquele item, preservando apenas a
  identidade da relacao ate o proximo reload autoritativo de ecos.
- `availability = stale_detail` pode existir apenas durante reconciliacao local
  de reload; nao permite abrir Reader nem remover eco sem nova confirmacao do
  estado autoritativo.

## Draft de Continuacao de Nota

**Objetivo**: representar a nota que ainda sera criada a partir de
`Continuar desta nota`.

**Campos**:

- `sourceNoteId`
- `newNoteDay`
- `title`
- `generatedBrief`
- `content`

**Defaults deste corte**:

- `newNoteDay` nasce com o dia atualmente em foco na superficie.
- `title` nasce com o titulo da nota de origem.
- `content` nasce vazio.
- `generatedBrief` segue esta ordem:
  1. `brief` existente da nota de origem, se houver texto util
  2. primeiro trecho util de `content`, normalizado em uma linha
  3. fallback baseado no `title` da origem

**Regras de validacao**:

- `newNoteDay` precisa ser igual ou posterior ao `day` da nota de origem.
- `newNoteDay` e o unico valor temporal do draft que vira `notes.day` da nota
  criada. Ele nao cria `target_day`, `source_day`, `scheduled_at` ou qualquer
  campo de tarefa.
- `generatedBrief` precisa existir antes da confirmacao.
- O usuario pode editar `title` e `generatedBrief` antes de salvar.

## Candidata a Eco Manual

**Objetivo**: representar uma nota elegivel para `Adicionar eco`.

**Campos**:

- `id`
- `day`
- `title`
- `brief`
- `created_at`
- `isAlreadyConnected`

**Regras de elegibilidade**:

- Nao pode ser a mesma nota que originou a acao.
- Precisa pertencer ao mesmo usuario autenticado.
- A elegibilidade do seletor e apenas pre-selecao; `createNoteEcho` precisa
  revalidar origem, candidata e `context_note_id` no servidor no momento da
  confirmacao.
- A lista prioriza candidatas em que `day` corresponde ao dia selecionado e usa
  ordenacao deterministica: grupo do dia selecionado por `created_at desc`,
  `id desc`; demais notas por `day desc`, `created_at desc`, `id desc`.
- A paginacao usa cursor estavel `(isSelectedDayGroup, day, created_at, id)`.
- A lista carrega lotes recentes de 50 itens e oferece `carregar mais` para o
  proximo lote.
- Notas ja conectadas permanecem visiveis como desabilitadas com `Eco ja existe`.

## RPC de Continuacao Atomica

**Objetivo**: criar a nota de destino e a relacao `continue_note` na mesma
transacao.

**Entrada planejada**:

- `source_note_id`
- `new_note_day`
- `title`
- `brief`
- `content`

**Saida planejada**:

- `newNote` criada em formato compativel com `Note`, incluindo `id` e `day`
- `noteEcho` criado com `kind = continue_note`
- indicacao transacional de falha quando nenhuma escrita foi persistida

**Regras de persistencia**:

- A funcao valida que a nota de origem pertence ao usuario autenticado usando
  `auth.uid()` server-side.
- A funcao usa `SECURITY DEFINER` com `search_path` fixo e checks equivalentes
  a RLS antes de qualquer escrita.
- O dono da nova nota e o criador do eco sao derivados no servidor; nenhum campo
  de dono enviado pelo cliente e aceito.
- Chamada unauthenticated, cross-user ou com nota de origem inacessivel falha
  sem escrita parcial e sem revelar existencia indevida.
- Grants da funcao ficam limitados ao role autenticado necessario; cliente e
  migration desta feature nao usam `service_role`.
- A funcao cria a nova nota e o eco `continue_note` em uma unica transacao.
- A funcao persiste `new_note_day` somente em `notes.day` da nota criada.
- Se qualquer etapa falhar, nenhuma nota continuada deve permanecer criada sem
  eco correspondente.
- Depois de sucesso da RPC, falha de reload, navegacao ou abertura do Reader nao
  desfaz a persistencia. O cliente deve reconciliar por `newNote.id` e
  `newNote.day`, sem reenviar a RPC cegamente.

## Estado Pendente de Abertura do Reader

**Objetivo**: representar a reabertura cross-day de nota conectada sem permitir
estado stale indefinido.

**Campos**:

- `noteId`
- `noteDay`
- `requestId`
- `sessionUserId`
- `actionOrigin`

**Regras de consumo**:

- `noteDay` e o dia esperado da nota a abrir; em continuacao de nota ele e igual
  a `newNoteDay`.
- `actionOrigin` aceita `connected_note_tap` e `continue_note_created`.
- O estado e consumido uma unica vez quando `routeDay === noteDay`,
  `note.id === noteId`, `note.day === noteDay` e
  `session.userId === sessionUserId`.
- O estado e limpo em sucesso, reload falho, nota ausente, mismatch de rota/dia,
  logout, troca de usuario, navegacao manual, cancelamento explicito ou novo
  request concorrente.
- Enquanto pendente, ele nao autoriza abrir Reader em outro dia nem em outra
  sessao.

## Estado de Recuperacao de Continuacao

**Objetivo**: representar commit persistido de `Continuar desta nota` quando a
etapa posterior de reload/navegacao/Reader falha.

**Campos**:

- `newNoteId`
- `newNoteDay`
- `sourceNoteId`
- `contextDay`
- `requestId`
- `sessionUserId`

**Regras de reconciliacao**:

- O estado nasce apenas depois de a RPC retornar sucesso persistido.
- A recuperacao recarrega `newNoteDay`, busca `newNoteId` e confirma relacao
  direta com `sourceNoteId`.
- Nova submissao do mesmo draft permanece bloqueada enquanto esse estado existir.
- Logout, troca de usuario ou perda de acesso a `newNoteId` limpam o estado e
  mostram feedback recuperavel sem criar nova nota.

## Resultados de Mutacao de Eco Manual

**Objetivo**: fechar idempotencia persistente para criar e remover ecos.

**Resultados de `createNoteEcho`**:

- `created`: insert confirmado, relacao lida e estado reconciliado.
- `already_exists`: conflito unico reconciliado por fetch acessivel da relacao
  existente, preservando o `kind` original.
- `not_accessible`: endpoint ou relacao existente nao acessivel; nenhum sucesso
  de UX e declarado.
- `retryable_failure`: falha tecnica antes de reconciliar estado autoritativo.

**Resultados de `deleteNoteEcho`**:

- `deleted`: uma relacao removida e reload autoritativo confirma ausencia do par.
- `already_removed`: zero linhas ou par ausente reconciliado por reload
  autoritativo; contagens e lista refletem ausencia.
- `not_accessible`: relacao ou endpoint inacessivel sob acesso atual.
- `retryable_failure`: falha tecnica exige reload antes de nova acao destrutiva.

## Estado do Dia com Ecos

**Objetivo**: estender o recorte diario sem alterar a soberania da superficie
do dia.

**Campos**:

- `tasks`
- `notes`
- `echoes`

**Regras de carga**:

- `tasks` continuam usando `source_day` e `target_day`.
- `notes` continuam usando `day = selectedDay`.
- `echoes` carregam apenas relacoes ligadas as notas presentes no dia atual.

## Transicoes Relevantes

### Eco Manual

- `reader_open` -> `picker_open`
- `picker_open` -> `echo_created`
- `picker_open` -> `echo_already_exists_reconciled`
- `picker_open` -> `candidate_disabled`
- `reader_open` -> `echo_removed`
- `reader_open` -> `echo_already_removed_reconciled`
- `picker_open` -> `cancelled`
- `echo_created` -> `day_reloaded`
- `echo_removed` -> `day_reloaded`
- `echo_removed` -> `reload_required_before_retry`

### Continuacao de Nota

- `reader_open` -> `continue_draft_prepared`
- `continue_draft_prepared` -> `continue_draft_edited`
- `continue_draft_edited` -> `note_created_and_linked`
- `note_created_and_linked` -> `continue_committed_pending_open`
- `continue_committed_pending_open` -> `day_reloaded`
- `continue_committed_pending_open` -> `reader_open`
- `continue_committed_pending_open` -> `recovery_feedback`
- `continue_draft_prepared` -> `cancelled`

## Impacto no Schema

- Uma migration nova e planejada para a RPC atomica de `Continuar desta nota`.
- Nenhuma tabela nova e planejada para esta feature.
- O corte depende do schema e das policies de `note_echoes` ja presentes em
  `supabase/migrations/001_auth_day_surface.sql`.
