# Contrato: Relacoes de Nota na Superficie do Dia

## Objetivo

Definir o contrato funcional para leitura de ecos, exibicao de contagem direta
na timeline, Reader com notas conectadas, criacao manual de `manual_link` e
remocao explicita de relacoes diretas.

## Entradas

| Entrada | Descricao |
|---------|-----------|
| `selectedDay` | dia em foco da experiencia |
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
- A lista de notas conectadas ordena primeiro notas do mesmo dia e, dentro de
  cada grupo, da mais recente para a mais antiga.
- A UI trata toda conexao apenas como `Eco`; `kind` nao aparece como subtipo
  visivel de relacao.

## Contrato de Navegacao para Nota Conectada

- Ao tocar uma nota conectada do mesmo dia, o Reader troca para essa nota sem
  sair da superficie atual.
- Ao tocar uma nota conectada de outro dia, o app navega para `/day/[date]` do
  destino e reabre o Reader na nota solicitada assim que o dia carregar.
- Essa navegacao nao cria breadcrumb temporal novo e nao usa ghost card.

## Contrato de `Adicionar eco`

- A acao so parte de uma nota existente aberta no Reader.
- O seletor de nota candidata:
  - exclui a nota de origem
  - mostra notas do mesmo usuario
  - ordena da mais recente para a mais antiga
- Ao confirmar:
  - cria relacao `manual_link`
  - usa a nota aberta como `from_note_id`
  - usa a nota escolhida como `to_note_id`
  - registra `context_note_id` com a nota de origem
  - registra `context_day` com o dia da superficie aberta
- Se o par ja existir, a UX trata a acao como idempotente e atualiza o estado
  sem duplicar a relacao.
- Quando o par ja existir:
  - a UX informa `Eco ja existe`
  - a relacao atual e preservada
  - o `kind` original permanece como proveniencia inicial

## Contrato de `Remover eco`

- A acao parte de uma nota existente aberta no Reader e opera sobre uma relacao
  direta atualmente visivel.
- A remocao identifica o par semantico independentemente da ordem persistida em
  `from_note_id` e `to_note_id`.
- Ao confirmar:
  - remove a unica relacao `Eco` do par selecionado
  - preserva ambas as notas e seus demais vinculos
  - atualiza contagem, lista do Reader e estado relevante do dia
- Se a relacao nao existir mais no momento da confirmacao, a UX exibe feedback
  recuperavel sem derrubar a superficie inteira do dia.

## Invariantes

- Ecos permanecem exclusivos de notas.
- A timeline mostra apenas contagem direta, nao grafo ou mapa.
- A abertura de nota conectada nao converte Reader em rota propria.
- `manual_link` e `continue_note` registram apenas a proveniencia inicial da
  relacao, sem alterar a semantica visivel de `Eco`.
- Nenhum campo `side` e introduzido no dominio da timeline.
- Mencoes inline `@nota` permanecem fora deste contrato.
