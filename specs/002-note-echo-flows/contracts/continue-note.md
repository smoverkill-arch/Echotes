# Contrato: Continuar Desta Nota

## Objetivo

Definir o contrato funcional para criar uma nova nota conectada a partir da
acao `Continuar desta nota`, preservando que `Eco` e a propria relacao entre
notas e nao um novo tipo de nota.

## Entradas

| Entrada | Descricao |
|---------|-----------|
| `sourceNote` | nota aberta no Reader que origina a continuacao |
| `selectedDay` | dia atualmente em foco na superficie |
| `draft.title` | titulo editavel da nova nota |
| `draft.targetDay` | dia ao qual a nova nota passara a pertencer |
| `draft.generatedBrief` | briefing inicial automatico, editavel antes do save |

## Preparacao do Draft

- A acao nasce a partir do Reader da nota de origem.
- O sistema prepara um draft antes de persistir qualquer dado.
- Defaults do draft:
  - `title = sourceNote.title`
  - `targetDay = selectedDay`
  - `content = ""`
  - `generatedBrief` derivado de `sourceNote.brief`, depois `sourceNote.content`
    e por fim `sourceNote.title`

## Validacoes

- `sourceNote` precisa continuar acessivel ao usuario autenticado.
- `targetDay` precisa ser igual ou posterior ao dia da nota de origem.
- `title` precisa continuar valido segundo o contrato atual de nota.
- `generatedBrief` precisa existir antes da confirmacao.

## Sequencia de Persistencia

1. Chamar RPC atomica de continuacao com os campos revisados no draft.
2. A RPC cria a nova nota no `targetDay` e um `note_echo` com:
   - `kind = continue_note`
   - `from_note_id = sourceNote.id`
   - `to_note_id = newNote.id`
   - `context_note_id = sourceNote.id`
   - `context_day = selectedDay`
3. Recarregar o estado do dia relevante.
4. Declarar sucesso para a pessoa usuaria apenas quando nota e relacao tiverem
   sido confirmadas como persistidas.

## Contrato de Atomicidade

- A criacao da nota continuada e do eco correspondente acontece em uma unica
  transacao.
- Se a nota de origem nao estiver acessivel ao usuario autenticado, a RPC falha
  sem criar nota.
- Se a criacao do eco falhar, a RPC falha a operacao inteira e nao deixa nota
  continuada orfa.
- A UI nao apresenta sucesso parcial para `Continuar desta nota`.

## Resultado Esperado

- Se `targetDay` for o dia atual, a superficie permanece no mesmo dia e abre o
  Reader da nota criada.
- Se `targetDay` for outro dia, a superficie navega para `/day/[targetDay]` e
  abre o Reader da nota criada apos a carga do destino.
- A nota de origem e a nota criada passam a se reconhecer como conexao direta.
- A UI continua tratando essa conexao apenas como `Eco`; `kind =
  continue_note` permanece como proveniencia interna da criacao inicial.

## Fora do Contrato

- Nenhuma copia integral de conteudo da nota de origem.
- Nenhuma criacao de ghost card ou projecao temporal.
- Nenhuma mencao inline `@nota`.
