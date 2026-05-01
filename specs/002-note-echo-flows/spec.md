# Especificacao da Feature: Fluxos de Eco de Nota

**Branch da feature**: `002-note-echo-flows`
**Criada em**: 2026-05-01
**Status**: Rascunho
**Entrada**: Descricao do usuario: "Ativar o proximo corte do Echotes para notas relacionais, com contagem direta de ecos, Reader com notas conectadas, acao Adicionar eco e Continuar desta nota, sem incluir mencoes inline neste corte."

> Esta spec deriva do canon vigente da raiz e do baseline fechado
> `001-auth-day-surface`.
> O corte preserva o dia como superficie soberana e mantem a separacao entre
> tarefas, notas, ghost cards e ecos.
> Esta feature ativa a continuidade conceitual de notas sem transformar a
> timeline em mapa de relacoes e sem reabrir as regras temporais de tarefas.

## Cenarios do Usuario e Testes / User Scenarios *(obrigatorio)*

### Historia do Usuario 1 - Entender a continuidade de uma nota (Prioridade: P1)

Como pessoa usuaria autenticada do Echotes, eu quero ver quando uma nota tem
ecos e abrir suas conexoes diretas para entender a continuidade daquela ideia
sem perder o contexto do meu dia.

**Por que esta prioridade**: antes de criar novas relacoes, o produto precisa
mostrar de forma clara que uma nota ja participa de uma continuidade conceitual.

**Teste independente**: esta historia pode ser validada sozinha ao abrir um dia
com notas conectadas, confirmar a contagem direta de ecos na timeline, abrir o
Reader de uma nota e navegar para uma nota conectada.

**Cenarios de aceite**:

1. **Dado** uma nota com um ou mais ecos diretos, **Quando** a timeline do dia
   e exibida, **Entao** a nota mostra um indicador discreto de ecos com a
   contagem direta correta.
2. **Dado** uma nota sem ecos diretos, **Quando** a timeline do dia e exibida,
   **Entao** o sistema nao comunica uma contagem enganosa nem sugere uma rede
   inexistente.
3. **Dado** uma nota com conexoes diretas, **Quando** a pessoa abre o Reader,
   **Entao** o sistema mostra as notas conectadas sem expor hierarquia ou mapa
   completo da familia.
4. **Dado** uma nota conectada localizada em outro dia, **Quando** a pessoa a
   abre a partir do Reader, **Entao** o sistema leva ao contexto correto dessa
   nota sem descaracterizar a superficie diaria.

---

### Historia do Usuario 2 - Gerenciar ecos entre notas existentes (Prioridade: P2)

Como pessoa usuaria autenticada, eu quero adicionar eco entre duas notas ja
existentes e remover uma conexao criada por engano para registrar continuidade
conceitual sem criar dependencia, subtarefa ou hierarquia.

**Por que esta prioridade**: depois de enxergar a continuidade, o proximo valor
e permitir que a pessoa explicite e corrija relacoes entre notas ja criadas.

**Teste independente**: esta historia pode ser validada sozinha ao abrir uma
nota existente, usar a acao `Adicionar eco`, escolher outra nota disponivel,
confirmar a nova contagem e a nova conexao no Reader e, depois, remover essa
mesma relacao sem apagar nenhuma das notas.

**Cenarios de aceite**:

1. **Dado** duas notas validas e acessiveis, **Quando** a pessoa adiciona um
   eco entre elas, **Entao** a relacao passa a aparecer como conexao direta nas
   duas extremidades relevantes da experiencia.
2. **Dado** uma tentativa de conectar uma nota a ela mesma, **Quando** a pessoa
   confirma a acao, **Entao** o sistema bloqueia a operacao com feedback claro.
3. **Dado** uma tentativa de repetir um eco ja existente entre o mesmo par de
   notas, **Quando** a pessoa confirma a acao, **Entao** o sistema evita
   duplicacao, preserva uma unica relacao semantica e informa `Eco ja existe`.
4. **Dado** um eco direto criado por engano, **Quando** a pessoa escolhe
   remove-lo a partir do fluxo contextual da nota, **Entao** o sistema apaga
   apenas a relacao, atualiza a contagem nas duas extremidades relevantes e
   preserva ambas as notas.

---

### Historia do Usuario 3 - Continuar desta nota em outro momento (Prioridade: P3)

Como pessoa usuaria autenticada, eu quero continuar uma nota criando uma nova
nota conectada para levar uma ideia adiante no mesmo dia ou em um dia futuro.

**Por que esta prioridade**: esta historia aprofunda o valor do dominio de
notas, mas depende de o produto ja conseguir mostrar e criar relacoes diretas
entre notas existentes.

**Teste independente**: esta historia pode ser validada sozinha ao abrir uma
nota, acionar `Continuar desta nota`, escolher o dia da nova nota, revisar o
briefing inicial e confirmar a criacao da nota conectada.

**Cenarios de aceite**:

1. **Dado** uma nota existente, **Quando** a pessoa escolhe `Continuar desta
   nota`, **Entao** o sistema prepara uma nova nota ja conectada a origem.
2. **Dado** uma continuacao em andamento, **Quando** a pessoa revisa a nova
   nota antes de concluir, **Entao** o sistema oferece briefing inicial
   automatico e permite ajuste imediato desse texto.
3. **Dado** uma continuacao criada para dia futuro, **Quando** a pessoa conclui
   a acao, **Entao** a nova nota passa a pertencer ao dia escolhido sem ganhar
   comportamento de ghost card.
4. **Dado** uma nota continuada, **Quando** a pessoa abre a origem ou a nova
   nota, **Entao** o sistema preserva a relacao entre ambas como eco direto.

---

### Casos de Borda

- O que acontece quando a configuracao obrigatoria do ambiente impede carregar a
  superficie autenticada do dia?
- Como o sistema reage quando a sessao expira enquanto a pessoa tenta adicionar
  um eco ou concluir uma continuacao?
- O que acontece quando a nota de destino deixa de estar acessivel entre a
  abertura do Reader e a confirmacao da acao?
- Como o sistema lida com tentativa de eco duplicado para o mesmo par de notas?
- Como a experiencia se comporta quando a nota conectada pertence a outro dia?
- O que acontece quando a pessoa tenta remover um eco que deixou de existir
  antes da confirmacao da acao?
- O que acontece quando a pessoa quer uma nota sem relacao alguma e decide nao
  usar `Adicionar eco` nem `Continuar desta nota`?

## Requisitos / Requirements *(obrigatorio)*

### Requisitos Funcionais

- **FR-001**: O sistema DEVE manter o dia como superficie principal da feature,
  sem deslocar a pessoa para um modulo separado de relacoes.
- **FR-002**: O sistema DEVE permitir que a pessoa identifique, na timeline do
  dia, quando uma nota possui ecos diretos.
- **FR-003**: O sistema DEVE comunicar apenas a contagem direta de ecos na
  timeline, sem representar o total da familia ou um grafo completo.
- **FR-004**: O sistema DEVE permitir abrir uma nota e inspecionar suas conexoes
  diretas em uma superficie contextual de leitura.
- **FR-005**: O sistema DEVE tratar eco como relacao conceitual direta e nao
  hierarquica entre notas, independentemente de a relacao ter nascido por
  continuacao ou conexao manual.
- **FR-006**: O sistema DEVE permitir criar eco manual entre duas notas
  existentes e acessiveis.
- **FR-007**: O sistema DEVE impedir criacao de eco entre uma nota e ela mesma.
- **FR-008**: O sistema DEVE evitar duplicacao de relacoes entre o mesmo par de
  notas e informar `Eco ja existe` quando a relacao ja estiver presente.
- **FR-009**: O sistema DEVE permitir remover explicitamente um eco direto a
  partir do fluxo contextual de nota sem apagar nenhuma das notas envolvidas.
- **FR-010**: O sistema DEVE tratar `manual_link` e `continue_note` apenas como
  proveniencias internas da mesma relacao `Eco`, sem criar subtipos visiveis de
  nota ou hierarquia na UI.
- **FR-011**: O sistema DEVE permitir abrir, a partir do Reader, uma nota
  conectada mesmo quando ela pertence a outro dia.
- **FR-012**: O sistema DEVE preservar o contexto diario da nota aberta ao
  navegar para uma nota conectada.
- **FR-013**: O sistema DEVE oferecer a acao `Adicionar eco` como ferramenta
  relacional de nota.
- **FR-014**: O sistema DEVE oferecer a acao `Continuar desta nota` como criacao
  de uma nova nota conectada a nota de origem.
- **FR-015**: O sistema DEVE permitir que a nova nota continuada pertença ao
  mesmo dia ou a um dia futuro escolhido pela pessoa usuaria.
- **FR-016**: O sistema DEVE iniciar a nota continuada com briefing automatico e
  permitir ajuste imediato desse texto pela pessoa usuaria.
- **FR-017**: O sistema DEVE preservar a diferenca entre nota e tarefa, de modo
  que notas continuadas nao ganhem ghost card, `source_day` ou `target_day`.
- **FR-018**: O sistema DEVE manter os detalhes relacionais de nota dentro do
  Reader ou do fluxo contextual, sem poluir o fluxo principal da timeline.
- **FR-019**: O sistema DEVE falhar com mensagem clara quando a pessoa perder
  autenticacao ou quando uma nota exigida para a acao nao estiver mais
  disponivel.
- **FR-020**: O sistema DEVE manter fora deste corte as mencoes inline `@nota`
  e seus chips persistidos.
- **FR-021**: O sistema DEVE manter fora deste corte visualizacoes em mapa ou
  rede da familia de notas.

### Entidades-Chave *(inclua se a feature envolver dados)*

- **Nota**: representa um registro textual pertencente a um dia especifico, com
  titulo, conteudo e briefing opcional.
- **Eco de nota**: representa uma relacao conceitual direta entre duas notas,
  sem hierarquia visivel para a pessoa usuaria, independentemente da origem da
  relacao.
- **Contagem direta de ecos**: representa a quantidade de conexoes imediatas de
  uma nota, sem somar toda a familia conceitual.
- **Continuacao de nota**: representa a criacao de uma nova nota conectada a
  outra nota de origem para prolongar a ideia em novo contexto.
- **Contexto do dia**: representa o dia em foco da experiencia e ancora a
  abertura, leitura e navegacao entre notas conectadas.

## Criterios de Sucesso / Success Criteria *(obrigatorio)*

### Resultados Mensuraveis

- **SC-001**: Em testes de QA interno, pessoas usuarias conseguem identificar se
  uma nota possui continuidade conceitual em menos de 30 segundos a partir da
  timeline do dia.
- **SC-002**: Em 100% dos testes deste corte, tentativas de auto-relacao ou de
  duplicacao entre o mesmo par de notas nao criam conexoes invalidas e retornam
  feedback claro.
- **SC-003**: Em 100% dos testes deste corte, remover um eco apaga apenas a
  relacao selecionada e preserva todas as notas envolvidas.
- **SC-004**: Em testes de QA interno, pessoas usuarias conseguem criar um eco
  manual entre duas notas existentes em menos de 1 minuto sem ajuda externa.
- **SC-005**: Em testes de QA interno, pessoas usuarias conseguem continuar uma
  nota para o mesmo dia ou para dia futuro em menos de 2 minutos, mantendo a
  relacao com a origem visivel ao final do fluxo.
- **SC-006**: Em 100% dos testes de regressao do corte, a timeline continua
  mostrando apenas a contagem direta de ecos para notas, sem introduzir ghost
  card ou comportamento de tarefa no dominio de notas.

## Premissas

- O baseline `001-auth-day-surface` continua sendo pre-requisito funcional e
  permanece fechado.
- A feature parte de uma superficie diaria autenticada ja existente e nao reabre
  o fluxo de autenticacao como escopo principal.
- Mencoes inline `@nota`, chips persistidos no conteudo e sincronizacao semantica
  entre texto e relacao ficam fora deste corte.
- Visualizacao em mapa ou rede de familias de notas fica fora deste corte.
- A UI continua tratando toda relacao apenas como `Eco`, mesmo quando a origem
  interna registrada em `kind` for `manual_link` ou `continue_note`.
- Remocao explicita de eco acontece apenas no fluxo contextual da nota; este
  corte nao cobre undo em lote, historico de remocoes ou restauracao de
  relacoes apagadas.
- Tarefas, ghost cards, breadcrumb temporal e regras de `scheduled_at`
  permanecem inalterados por esta feature.
