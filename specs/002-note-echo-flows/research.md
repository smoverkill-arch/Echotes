# Pesquisa: Fluxos de Eco de Nota

> Documento consolidado a partir do canon vigente e da revisao do usuario em
> 2026-05-01 para fechar semantica de eco, duplicidade e remocao.

## Decisao: carregar `note_echoes` junto das notas do dia e manter detalhes cruzados sob demanda

**Justificativa**: a timeline precisa conhecer a contagem direta de ecos no
momento em que renderiza cada nota. Para isso, o recorte diario deve incluir os
ecos ligados as notas do dia. Ja os detalhes completos das notas conectadas em
outros dias podem ser buscados apenas quando o Reader precisar deles, evitando
expandir a carga inicial do dia com o historico inteiro da pessoa.

**Alternativas consideradas**:

- Adicionar contador denormalizado em `notes`.
- Buscar toda a rede de notas conectadas sempre que um dia abrir.

## Decisao: derivar a contagem direta de ecos em memoria, sem alterar o modelo soberano de `Note`

**Justificativa**: o canon ja separa nota de relacao. A contagem direta e
derivada de `note_echoes` e nao deve virar campo persistido nem poluir a
entidade `Note`. Isso preserva a modelagem limpa e evita drift entre o que esta
no banco e o que e exibido na UI.

**Alternativas consideradas**:

- Persistir `echo_count` em `notes`.
- Estender `Note` com atributos derivados e reaproveita-lo como modelo de tela.

## Decisao: reutilizar `readerState` para abrir nota conectada em outro dia

**Justificativa**: diferentemente da navegacao temporal de tarefa, a feature de
notas nao precisa de breadcrumb nem de retorno contextual de origem. Ao trocar
o `readerState` para a nota de destino e navegar para `/day/[date]`, a
superficie do dia permanece soberana e o Reader reabre naturalmente quando a
nota do destino estiver carregada, preservando a estrategia atual de
navegacao.

**Alternativas consideradas**:

- Criar um segundo store dedicado de navegacao de nota.
- Transformar Reader de nota em rota propria.

## Decisao: `Adicionar eco` usa seletor dedicado de notas existentes, ordenado por recencia

**Justificativa**: a acao manual precisa ser simples e coerente com o corte. Um
seletor dedicado de notas do usuario, excluindo a nota de origem e ordenado das
mais recentes para as mais antigas, entrega valor imediato sem abrir a
complexidade de busca textual, chips inline ou parser de mencoes.

**Alternativas consideradas**:

- Implementar busca textual/autocomplete nesta fase.
- Restringir a conexao manual apenas a notas do dia atual.

## Decisao: incluir remocao explicita de eco no mesmo corte

**Justificativa**: a revisao do usuario fechou que remocao nao e luxo de MVP,
mas necessidade operacional para corrigir conexoes criadas por engano. A
remocao deve apagar apenas a relacao escolhida, sem remover notas nem
transformar eco em hierarquia.

**Alternativas consideradas**:

- Adiar remocao e apenas documentar a limitacao operacional.
- Exigir manutencao manual no banco para desfazer relacao incorreta.

## Decisao: `Continuar desta nota` sera um fluxo guiado de criacao antes da persistencia

**Justificativa**: a spec pede briefing automatico e ajuste imediato antes de
concluir. O melhor encaixe no app atual e abrir um draft de nota em modo de
criacao, com `newNoteDay` editavel, `title` inicial baseado na nota de origem e
`brief` automatico pronto para revisao. So depois da confirmacao a nova nota e
persistida e o eco `continue_note` e criado. Essa origem nao cria um tipo novo
de nota; registra apenas a proveniencia inicial da mesma relacao `Eco`.

**Alternativas consideradas**:

- Persistir a nova nota imediatamente e abrir edicao depois.
- Criar a nota por backend antes de a pessoa revisar o briefing.

## Decisao: tratar duplicidade de eco como no-op com feedback explicito e preservar a primeira proveniencia

**Justificativa**: o schema ja protege a unicidade semantica do par de notas
com `least/greatest`. A revisao do usuario fechou que a UX deve informar
`Eco ja existe`, preservar a relacao unica ja registrada e manter o `kind`
original apenas como proveniencia da criacao inicial. Assim, `manual_link` e
`continue_note` nao competem como subtipos de eco.

**Alternativas consideradas**:

- Reescrever `kind` a cada nova tentativa sobre o mesmo par.
- Permitir duplicatas logicas e deduplicar apenas na renderizacao.

## Decisao: gerar o `brief` inicial de continuacao de forma deterministica no cliente

**Justificativa**: a feature nao precisa de IA, fila ou servico adicional para
produzir um resumo inicial util. O cliente pode derivar o `generatedBrief`
priorizando `brief` existente da nota de origem, depois um trecho util de
`content` e, por fim, o `title`. Isso torna o comportamento previsivel,
testavel e suficiente para o corte.

**Alternativas consideradas**:

- Exigir que a pessoa escreva o `brief` do zero em toda continuacao.
- Introduzir um gerador remoto de resumo ja nesta fase.
