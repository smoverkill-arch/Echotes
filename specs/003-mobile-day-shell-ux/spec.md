# Especificacao da Feature: Upgrade Mobile da Superficie do Dia

**Branch da feature**: `003-mobile-day-shell-ux`
**Criada em**: 2026-05-12
**Status**: Rascunho executavel
**Entrada**: Descricao do usuario: "Precisamos de um upgrade UI/UX para o Echotes, usando ui-ux-pro-max corretamente, para deixar de parecer telas default Expo e permitir testar a branch no S21 com calendario semanal/mensal, shell temporal e Reader de nota claro."

## User Scenarios *(obrigatorio)*

### Historia do Usuario 1 - Navegar entre dias sem ficar ilhado (Prioridade: P1)

Como usuario autenticado no S21, quero trocar de dia por uma superficie temporal persistente para validar notas, tarefas, ecos e continuacoes em datas diferentes sem depender de rotas manuais.

**Por que esta prioridade**: Sem troca de dia, os fluxos cross-day de ecos, ghost cards e continuacao ficam praticamente intestaveis no aparelho.

**Teste independente**: Abrir o dia atual, tocar em dias da semana visivel, navegar para semana anterior/proxima, voltar para Hoje e abrir seletor mensal para escolher outro dia.

**Cenarios de aceite**:

1. **Dado** o dia atual aberto, **Quando** o usuario toca em outro dia da strip semanal, **Entao** a tela navega para aquele dia e marca visualmente o novo dia selecionado.
2. **Dado** uma data fora da semana atual, **Quando** o usuario escolhe essa data no seletor mensal, **Entao** a rota do dia muda, a semana visivel passa a conter a data escolhida e Hoje continua distinguivel.
3. **Dado** uma data que nao e hoje, **Quando** o usuario toca em Hoje, **Entao** o app retorna ao dia real do relogio.

---

### Historia do Usuario 2 - Entender o dia como superficie de trabalho (Prioridade: P1)

Como usuario, quero que `Timeline`, `Tarefas` e `Notas` sejam lentes do dia selecionado, para nao confundir navegacao temporal com visualizacao do conteudo do dia.

**Por que esta prioridade**: O produto e centrado no dia; as tabs nao podem substituir o calendario nem esconder o contexto temporal.

**Teste independente**: Trocar entre as tabs apos escolher datas diferentes e confirmar que a data selecionada permanece a mesma.

**Cenarios de aceite**:

1. **Dado** um dia selecionado, **Quando** o usuario troca de `Timeline` para `Notas`, **Entao** o dia selecionado permanece igual.
2. **Dado** qualquer tab ativa, **Quando** o usuario troca de dia pelo calendario, **Entao** a tab ativa e preservada e o conteudo passa a refletir o novo dia.

---

### Historia do Usuario 3 - Usar Reader e ecos sem confusao (Prioridade: P2)

Como usuario lendo uma nota, quero ver ecos, continuacao e navegacao cross-day com hierarquia clara para entender se estou abrindo uma nota do mesmo dia, outro dia ou criando uma continuacao.

**Por que esta prioridade**: A feature `002-note-echo-flows` depende de Reader compreensivel para validacao manual e uso real.

**Teste independente**: Abrir nota com eco, abrir nota conectada de outro dia, remover eco com confirmacao e iniciar `Continuar desta nota`.

**Cenarios de aceite**:

1. **Dado** uma nota com relacao em outro dia, **Quando** o usuario abre a relacao, **Entao** o app navega ao dia correto e abre o Reader contextual.
2. **Dado** uma nota com ecos, **Quando** o usuario avalia as acoes do Reader, **Entao** `Continuar desta nota`, `Adicionar eco`, `Editar` e remocao destrutiva aparecem com prioridades visuais distintas.

---

### Historia do Usuario 4 - Ter aparencia de app mobile real (Prioridade: P2)

Como usuario no S21, quero uma interface com hierarquia, toque e estados consistentes para reconhecer o Echotes como app de produtividade diario, nao como telas padrao do Expo.

**Por que esta prioridade**: A experiencia atual parece prototipo bruto e reduz confianca na validacao do produto.

**Teste independente**: Verificar shell, tabs, calendario, botoes e Reader no S21 sem textos sobrepostos, alvos pequenos ou controles sem estado.

**Cenarios de aceite**:

1. **Dado** a tela do dia aberta no S21, **Quando** o usuario inspeciona os controles principais, **Entao** todos os alvos de toque criticos tem area confortavel e feedback pressionado.
2. **Dado** estados selecionado, hoje, carregando, desabilitado e destrutivo, **Quando** eles aparecem, **Entao** cada estado e distinguivel sem depender apenas de texto pequeno.

---

### Historia do Usuario 5 - Executar smoke S21 completo (Prioridade: P3)

Como validador da branch, quero um roteiro de smoke mobile que cubra a nova casca temporal e os fluxos de ecos para decidir merge com evidencia.

**Por que esta prioridade**: O smoke atual e parcial porque a UI nao permite navegar temporalmente.

**Teste independente**: Seguir o quickstart da feature em um S21 conectado.

**Cenarios de aceite**:

1. **Dado** o app aberto no S21, **Quando** o roteiro e executado, **Entao** ele cobre hoje, ontem, amanha, outra semana, outro mes, eco manual, remocao de eco e continuacao cross-day.

### Casos de Borda

- Data invalida na rota deve redirecionar para um dia valido sem quebrar a superficie.
- Escolher data de outro mes deve recalcular a semana visivel corretamente.
- Usuario sem sessao continua sendo redirecionado para autenticacao.
- Falha de carregamento do dia nao deve consumir acao pendente de Reader indevidamente.
- Controles de calendario devem continuar utilizaveis em largura de telefone pequeno.

## Requirements *(obrigatorio)*

### Requisitos Funcionais

- **FR-001**: O sistema DEVE exibir um calendario semanal persistente no topo da superficie autenticada do dia.
- **FR-002**: O calendario semanal DEVE iniciar a semana no domingo.
- **FR-003**: O sistema DEVE distinguir visualmente o dia real do relogio e o dia selecionado pelo usuario.
- **FR-004**: O sistema DEVE permitir navegar para semana anterior e proxima.
- **FR-005**: O sistema DEVE permitir retornar ao dia real do relogio por uma acao visivel `Hoje`.
- **FR-006**: O sistema DEVE oferecer seletor mensal para escolher datas fora da semana visivel.
- **FR-007**: A rota `/day/[date]` DEVE continuar sendo a fonte navegavel do dia selecionado.
- **FR-008**: `Timeline`, `Tarefas` e `Notas` DEVEM ser lentes do dia selecionado, preservando o contexto temporal.
- **FR-009**: O Reader de nota DEVE separar acoes primarias, secundarias e destrutivas.
- **FR-010**: Relacoes de eco no Reader DEVEM comunicar mesmo dia, outro dia e indisponibilidade.
- **FR-011**: A UI DEVE manter alvos de toque confortaveis para controles criticos em telefone Android.
- **FR-012**: A UI DEVE usar linguagem visual consistente por tokens ou constantes compartilhadas nos componentes tocados.
- **FR-013**: O roteiro de smoke DEVE cobrir navegacao temporal semanal, mensal e fluxos de nota/eco cross-day.

### Entidades-Chave

- **SelectedDayContext**: dia selecionado, dia real do relogio e semana visivel que contem o dia selecionado.
- **CalendarMode**: modo de interacao do calendario, inicialmente `week` e `month`.
- **CalendarDayCell**: representacao de uma data clicavel com estados `selected`, `today`, `outsideMonth` e `disabled`.
- **ReaderRelationItem**: relacao de nota exibida no Reader com data, disponibilidade e acao de abertura contextual.
- **MobileActionState**: estado visual de controle pressionado, selecionado, desabilitado, carregando ou destrutivo.

## Success Criteria *(obrigatorio)*

### Resultados Mensuraveis

- **SC-001**: Um validador consegue mudar de hoje para ontem, amanha, outra semana e outro mes no S21 em menos de 90 segundos.
- **SC-002**: O smoke S21 cobre ao menos 8 passos cross-day sem edicao manual de rota.
- **SC-003**: Todos os controles criticos de calendario, tabs e Reader tem estado visual de selecionado, pressionado ou desabilitado quando aplicavel.
- **SC-004**: A branch nao e considerada merge-ready sem `doc:guard`, `lint`, `test` e `typecheck` verdes quando a implementacao for tocada.

## Premissas

- A feature herda o WIP de `002-note-echo-flows` ao nascer da branch atual.
- O upgrade visual inicial prioriza a superficie autenticada do dia e o Reader de nota; telas de auth podem receber tokens, mas nao sao o centro do corte.
- Mencoes inline `@nota` e visualizacao em grafo continuam fora do corte.
- O trabalho nao adiciona `side` ao `TimelineNode` e nao altera semantica de ghost card.
