# What I Learned: Phase 3 - Ecos de Nota

**Feature**: `002-note-echo-flows`
**Escopo**: Phase 3 - Historia do Usuario 1
**Gerado em**: 2026-05-09
**Status da implementacao**: Phase 3 com 13/13 tarefas concluidas; a feature completa ainda segue parcial

---

## Decisoes-Chave

### 1. Carregar relacoes no recorte do dia, buscar detalhes sob demanda

O dia carrega notas, tarefas e relacoes diretas de eco pelo fluxo de `useDayEntries`.
Depois que as notas do dia sao conhecidas, `listNoteEchoes(noteIds)` busca apenas as relacoes necessarias para aquele recorte.

Isso evita carregar a rede inteira de notas conectadas quando a Timeline so precisa saber se existe contagem direta. Os detalhes completos de notas conectadas ficam para o Reader, onde existe intencao explicita do usuario.

Alternativas recusadas nesta fase:

- carregar toda a rede conectada ao abrir o dia
- denormalizar um contador dentro da entidade `Note`
- abrir uma rota propria para a rede de notas

O ganho principal e manter a superficie diaria leve sem perder rastreabilidade entre notas.

### 2. Derivar `directEchoCount` em memoria, sem mudar o dominio de `Note`

A contagem direta de ecos e derivada em `countDirectEchoes` e entra na Timeline como dado de apresentacao. A entidade `Note` continua soberana: ela nao recebe `echo_count`, `source_day`, `target_day`, `ghost card` nem `side`.

Essa escolha protege o modelo contra campos que pertencem a uma tela especifica. A Timeline pode mostrar badge de eco, mas o dado persistido continua sendo a relacao em `note_echoes`.

Use esse padrao quando:

- o valor pode ser recalculado a partir de dados canonicos
- o campo so existe para renderizacao
- persistir o valor criaria risco de divergencia

### 3. Preservar relacao mesmo quando o detalhe falha

Uma nota conectada indisponivel nao e tratada como relacao inexistente. Quando `listRelatedNoteDetails` nao consegue carregar o detalhe, ela preserva a conexao e marca o item como `stale_detail` ou `transient_unavailable`.

No Reader, isso aparece como item indisponivel com acao de recarregar, em vez de apagar a evidencia de que a relacao existe.

Essa decisao evita uma falha sutil: transformar erro temporario de rede, RLS ou detalhe ausente em "Nenhuma nota conectada". Para o usuario, isso seria uma mentira operacional.

### 4. Navegar cross-day com `pendingReaderOpen` de consumo unico

Quando a nota conectada pertence a outro dia, a rota muda para `/day/<date>` e grava um `pendingReaderOpen` com `noteId`, `noteDay`, `actionOrigin`, `requestId` e `userId`.

A abertura do Reader so acontece quando:

- a sessao corresponde ao usuario esperado
- o dia da rota corresponde ao dia da nota
- as notas do dia ja foram carregadas
- a nota existe no recorte carregado

Depois disso, o pending e consumido. Esse desenho evita abrir Reader no dia errado, evita reaproveitar estado antigo e dispensa breadcrumb ou rota nova nesta fase.

### 5. Comandos de fases futuras so aparecem quando existem handlers reais

`Adicionar eco` e `Continuar desta nota` pertencem a historias posteriores. Na Phase 3, o Reader so deve expor esses comandos se receber `onAddEcho` ou `onContinueNote`.

Isso evita botoes com handlers vazios e preserva a fronteira da fase. Um comando visivel comunica comportamento entregue; se a fase ainda nao entrega o comportamento, o botao nao deve existir.

---

## Conceitos Aprendidos

### Derivacao vs. persistencia

Nem todo dado exibido precisa virar campo persistido. A contagem direta de ecos e um bom exemplo: ela nasce de `note_echoes`, entra como resumo para renderizacao e nao contamina a entidade `Note`.

### Degradacao honesta

Falha ao carregar detalhe nao deve apagar conhecimento ja confirmado. O sistema sabe que a relacao existe, entao mostra indisponibilidade e recarregamento em vez de esconder o item.

### Container com regra, componente com apresentacao

`app/day/[date].tsx` concentra decisao de navegacao, pending state e carregamento de detalhes. `NoteReader` recebe dados e callbacks opcionais, renderizando apenas o que esta disponivel.

Essa separacao deixa o componente mais testavel e reduz risco de regra de rota espalhada pela UI.

### Estado pendente com escopo forte

`pendingReaderOpen` nao e apenas "abrir nota depois". Ele carrega usuario, dia, origem e request id. Esse escopo impede que uma navegacao atrasada abra conteudo de outra sessao ou outro dia.

### Testes como contrato de fase

Os testes desta fase nao verificam so "renderizou". Eles protegem fronteiras:

- badge de `Ecos` aparece para contagem direta
- navegacao cross-day abre Reader apenas no destino correto
- item indisponivel preserva relacao e oferece recarregar
- comandos de fases futuras nao aparecem sem handlers reais

---

## Mapa Rapido da Implementacao

`useDayEntries` carrega as notas do dia e busca relacoes diretas.

`note-echo-relations.ts` transforma relacoes em contagem direta e notas relacionadas ordenadas.

`useDayTimeline` injeta `directEchoCounts` nos nodes da Timeline sem alterar o dominio de `Note`.

`NoteReader` mostra ecos, notas conectadas, estados indisponiveis e comandos opcionais.

`app/day/[date].tsx` decide se a nota conectada abre no mesmo dia ou se precisa navegar para outro dia com `pendingReaderOpen`.

`navigation-store.ts` guarda o pending de forma consumivel e escopada.

---

## Glossario

**Eco**: relacao direta entre notas.

**Contagem direta**: numero de relacoes imediatas de uma nota, sem contar grafo expandido.

**Nota conectada**: nota relacionada por eco e exibida no Reader.

**`stale_detail`**: relacao existe, mas o detalhe da nota nao esta acessivel ou nao foi retornado.

**`transient_unavailable`**: relacao existe, mas houve falha temporaria ao buscar detalhe.

**`pendingReaderOpen`**: estado temporario usado para abrir o Reader depois de navegar para o dia correto.

**Reader**: superficie de leitura da nota selecionada.

---

## Sugestao Para a Proxima Revisao

Na Phase 4, revise primeiro se os comandos de criar/remover eco substituem a opcionalidade dos handlers sem reintroduzir botoes sem comportamento real.
