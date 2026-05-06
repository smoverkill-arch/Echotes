# Contrato: Continuar Desta Nota

## Objetivo

Definir o contrato funcional para criar uma nova nota conectada a partir da
acao `Continuar desta nota`, preservando que `Eco` e a propria relacao entre
notas e nao um novo tipo de nota.

## Entradas

| Entrada | Descricao |
|---------|-----------|
| `sourceNote` | nota aberta no Reader que origina a continuacao |
| `selectedDay` | dia da rota/superficie em que a acao foi disparada |
| `draft.title` | titulo editavel da nova nota |
| `draft.newNoteDay` | dia que sera gravado em `notes.day` para a nova nota |
| `draft.generatedBrief` | briefing inicial automatico, editavel antes do save |

`selectedDay` e sempre o dia da superficie de origem. Ele nao muda para
acompanhar o destino escolhido no draft e nao deve ser usado como substituto de
`newNoteDay`.

## Preparacao do Draft

- A acao nasce a partir do Reader da nota de origem.
- O sistema prepara um draft antes de persistir qualquer dado.
- Defaults do draft:
  - `title = sourceNote.title`
  - `newNoteDay = selectedDay`
  - `content = ""`
  - `generatedBrief` derivado de `sourceNote.brief`, depois `sourceNote.content`
    e por fim `sourceNote.title`

## Validacoes

- A confirmacao exige sessao autenticada atual; sessao ausente ou expirada
  bloqueia o save antes da chamada RPC.
- `sourceNote` precisa continuar acessivel ao usuario autenticado.
- `newNoteDay` precisa ser igual ou posterior ao dia da nota de origem.
- `title` precisa continuar valido segundo o contrato atual de nota.
- `generatedBrief` precisa existir antes da confirmacao.
- O cliente nao envia nem deriva `user_id`, `created_by_user_id` ou qualquer
  campo de dono para a RPC.

## Sequencia de Persistencia

1. Fazer preflight de sessao e revalidar que a nota de origem ainda esta
   acessivel antes de habilitar confirmacao.
2. Chamar RPC atomica de continuacao com os campos revisados no draft.
3. A RPC cria a nova nota com `newNote.day = newNoteDay` e um `note_echo` com:
   - `kind = continue_note`
   - `from_note_id = sourceNote.id`
   - `to_note_id = newNote.id`
   - `context_note_id = sourceNote.id`
   - `context_day = selectedDay`
4. `context_day` registra apenas a proveniencia da acao. Ele nunca define rota,
   dia carregado ou destino de abertura do Reader.
5. A RPC retorna, no mesmo resultado persistido, `newNote.id`, `newNote.day` e
   a relacao criada.
6. Recarregar o estado do dia relevante.
7. Declarar sucesso para a pessoa usuaria apenas quando nota e relacao tiverem
   sido confirmadas como persistidas.

## Contrato de Atomicidade

- A criacao da nota continuada e do eco correspondente acontece em uma unica
  transacao.
- Se a nota de origem nao estiver acessivel ao usuario autenticado, a RPC falha
  sem criar nota.
- Se a criacao do eco falhar, a RPC falha a operacao inteira e nao deixa nota
  continuada orfa.
- A UI nao apresenta sucesso parcial para `Continuar desta nota`.

## Contrato de Trust Boundary da RPC

- `public.continue_note` deve ser `SECURITY DEFINER` apenas para encapsular a
  transacao atomica; o corpo precisa aplicar checks equivalentes a RLS usando
  `auth.uid()` antes de qualquer insert.
- A funcao deve declarar `set search_path = public` ou configuracao equivalente
  fixa, sem depender do `search_path` do chamador.
- `auth.uid()` precisa existir; chamada unauthenticated falha antes de escrever.
- A nota de origem e carregada server-side por `source_note_id` e
  `user_id = auth.uid()`; chamada cross-user falha sem indicar se a nota existe.
- O dono da nova nota e `created_by_user_id` do eco sao derivados no servidor a
  partir de `auth.uid()`, nunca de parametros do cliente.
- A migration deve revogar execute publico amplo e conceder execute apenas ao
  role minimo necessario para usuarios autenticados.
- A RPC e os clientes da feature nao podem usar `service_role`.
- Testes de contrato da migration devem cobrir sucesso, cross-user,
  unauthenticated, ausencia de escrita parcial e ausencia de `service_role`.

## Sessao Expirada Durante Draft

- Se a sessao expirar enquanto o draft estiver aberto, o app preserva o texto do
  draft em memoria local segura, desabilita confirmacao e mostra feedback
  distinto de sessao expirada.
- O app nunca chama a RPC apos resposta unauthenticated ou ausencia de sessao.
- Depois de reautenticacao, a nota de origem precisa ser revalidada antes de
  reabilitar a confirmacao; se estiver stale ou inacessivel, aplicar FR-020.

## Recuperacao Pos-Commit

- Depois que a RPC retorna sucesso, a operacao deixa de ser repetivel por
  submissao cega do draft. O estado local passa para `continueCommittedPendingOpen`,
  identificado por `newNote.id`, `newNote.day`, `sourceNote.id`, `context_day` e
  o `requestId` da acao.
- Se reload do dia, navegacao ou abertura do Reader falhar depois do commit, a UI
  deve mostrar estado recuperavel com acao para tentar recarregar/abrir a nota ja
  criada, sem reenviar a RPC automaticamente.
- A reconciliacao usa `newNote.id` como chave autoritativa. Ao recuperar, o app
  recarrega o dia de `newNote.day`, confirma a presenca da nota criada e da
  relacao direta com `sourceNote.id`, entao consome o estado pendente e abre o
  Reader.
- Enquanto `continueCommittedPendingOpen` estiver ativo, novas confirmacoes do
  mesmo draft ficam bloqueadas. Se a pessoa cancelar o estado recuperavel, o app
  preserva a persistencia ja feita e apenas abandona a tentativa automatica de
  abrir o Reader.
- Logout, troca de usuario ou perda de acesso a `newNote.id` limpam o estado
  pendente e exibem feedback recuperavel; nao devem criar nova nota nem nova
  relacao como tentativa de reparo.

## Resultado Esperado

- Se `newNoteDay` for igual a `selectedDay`, a superficie permanece no mesmo
  dia e abre o Reader da nota criada somente depois de confirmar que
  `newNote.day = selectedDay`.
- Se `newNoteDay` for diferente de `selectedDay`, a superficie navega para
  `/day/[newNoteDay]`, recarrega esse dia e abre o Reader da nota criada
  somente depois de confirmar que `routeDay = newNoteDay` e
  `newNote.day = newNoteDay`.
- A nota de origem e a nota criada passam a se reconhecer como conexao direta.
- A UI continua tratando essa conexao apenas como `Eco`; `kind =
  continue_note` permanece como proveniencia interna da criacao inicial.
- A continuacao de nota nunca cria `target_day`, `source_day`, `scheduled_at`,
  ghost card, projecao temporal ou estado de tarefa.

## Fora do Contrato

- Nenhuma copia integral de conteudo da nota de origem.
- Nenhuma criacao de ghost card ou projecao temporal.
- Nenhuma mencao inline `@nota`.
