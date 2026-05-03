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
- A UI trata o eco como relacao sem direcao visivel, embora a persistencia use
  `from_note_id` e `to_note_id` de forma deterministica.
- Tentativas posteriores sobre o mesmo par nao reescrevem `kind`; retornam
  feedback e preservam a relacao existente.

**Convencao deste corte**:

- `Adicionar eco`: `from_note_id` recebe a nota de origem aberta no Reader e
  `to_note_id` recebe a nota escolhida.
- `Continuar desta nota`: `from_note_id` recebe a nota de origem e `to_note_id`
  recebe a nova nota criada.
- `context_note_id` recebe a nota de origem da acao.
- `context_day` registra o dia em que a acao foi disparada a partir da
  superficie aberta.

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

**Regras de leitura**:

- Se a nota relacionada ja pertencer ao dia carregado, os dados locais do dia
  podem abastecer a lista.
- Se a nota relacionada estiver fora do dia atual, seus detalhes minimos podem
  ser buscados sob demanda quando o Reader abrir, em lote por conjunto distinto
  de ids relacionados.
- `kind` pode existir como metadado interno de proveniencia, mas nao altera a
  semantica visivel da relacao para a UI.
- Se os detalhes da nota relacionada falharem ao carregar ou deixarem de estar
  acessiveis, o Reader representa a conexao como item indisponivel com acao de
  recarregar.

## Draft de Continuacao de Nota

**Objetivo**: representar a nota que ainda sera criada a partir de
`Continuar desta nota`.

**Campos**:

- `sourceNoteId`
- `targetDay`
- `title`
- `generatedBrief`
- `content`

**Defaults deste corte**:

- `targetDay` nasce com o dia atualmente em foco na superficie.
- `title` nasce com o titulo da nota de origem.
- `content` nasce vazio.
- `generatedBrief` segue esta ordem:
  1. `brief` existente da nota de origem, se houver texto util
  2. primeiro trecho util de `content`, normalizado em uma linha
  3. fallback baseado no `title` da origem

**Regras de validacao**:

- `targetDay` precisa ser igual ou posterior ao `day` da nota de origem.
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
- A lista e ordenada da mais recente para a mais antiga.
- A lista carrega lotes recentes de 50 itens e oferece `carregar mais` para o
  proximo lote.
- Notas ja conectadas permanecem visiveis como desabilitadas com `Eco ja existe`.

## RPC de Continuacao Atomica

**Objetivo**: criar a nota de destino e a relacao `continue_note` na mesma
transacao.

**Entrada planejada**:

- `source_note_id`
- `target_day`
- `title`
- `brief`
- `content`

**Saida planejada**:

- nota criada em formato compativel com `Note`
- eco criado ou indicacao transacional de falha

**Regras de persistencia**:

- A funcao valida que a nota de origem pertence ao usuario autenticado.
- A funcao cria a nova nota e o eco `continue_note` em uma unica transacao.
- Se qualquer etapa falhar, nenhuma nota continuada deve permanecer criada sem
  eco correspondente.

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
- `picker_open` -> `candidate_disabled`
- `reader_open` -> `echo_removed`
- `picker_open` -> `cancelled`
- `echo_created` -> `day_reloaded`
- `echo_removed` -> `day_reloaded`

### Continuacao de Nota

- `reader_open` -> `continue_draft_prepared`
- `continue_draft_prepared` -> `continue_draft_edited`
- `continue_draft_edited` -> `note_created_and_linked`
- `continue_draft_prepared` -> `cancelled`

## Impacto no Schema

- Uma migration nova e planejada para a RPC atomica de `Continuar desta nota`.
- Nenhuma tabela nova e planejada para esta feature.
- O corte depende do schema e das policies de `note_echoes` ja presentes em
  `supabase/migrations/001_auth_day_surface.sql`.
