# Especificacao da Feature: UI/UX Improvement — Entrada do App e Reader como Rota

**Branch da feature**: `005-ui-ux-improvement`
**Criada em**: 2026-05-31
**Status**: Relato de implementacao (registro do que foi entregue)
**Entrada**: Continuacao do upgrade de UI/UX iniciado em `003`/`004`, agora
focado em (a) primeira impressao do app (onboarding + home), (b) transformar o
Reader em rota navegavel de verdade e (c) consolidar uma camada de primitivas
de UI e marca reutilizaveis.

> Este pacote e um **relato**: documenta o corte que ja foi implementado e
> testado na branch, nao um backlog aberto. Serve como registro historico e
> base de rastreabilidade para os requisitos `UI-ONBOARDING-001`,
> `UI-DASHBOARD-001`, `UI-BRAND-001`, `UI-PRIMITIVE-001` e `UI-HEADER-001`.

## Contexto

Ate `004-dual-timeline-nav`, a superficie do dia era um unico arquivo monolitico
(`app/day/[date].tsx`, ~638 linhas) que hospedava timeline, Reader e Editor como
overlays. A abertura de nota conectada de outro dia dependia de um mecanismo
one-shot (`pendingReaderOpen`) no `navigationStore`, dificil de raciocinar e de
testar. Alem disso, o app abria direto na superficie protegida, sem nenhuma
camada de boas-vindas ou painel inicial — parecia um prototipo sem entrada.

Esta feature ataca esses tres pontos sem alterar o dominio (notas, tarefas,
ecos, timeline) nem a persistencia.

## User Scenarios *(obrigatorio)*

### Historia do Usuario 1 - Primeira impressao com onboarding (Prioridade: P1)

Como novo usuario, quero ver uma introducao curta na primeira vez que abro o
app para entender a proposta (dia como superficie, notas/ecos, tarefas/projecao)
antes de cair em telas de login ou no dia cru.

**Por que esta prioridade**: A entrada anterior ia direto para a superficie
protegida, sem contexto, reduzindo a clareza do produto.

**Teste independente**: Abrir o app com `onboarding.hasSeen = false` e confirmar
que o app roteia para `/onboarding`; concluir ou pular e confirmar que nao
reaparece.

**Cenarios de aceite**:

1. **Dado** que o onboarding ainda nao foi visto, **Quando** o app inicia,
   **Entao** a rota raiz redireciona para `/onboarding`.
2. **Dado** o onboarding aberto, **Quando** o usuario percorre os paineis e toca
   em `Comecar`, **Entao** o estado `hasSeen` e persistido e o app volta a rota
   raiz para re-rotear.
3. **Dado** o onboarding aberto, **Quando** o usuario toca em `Pular`, **Entao**
   o estado `hasSeen` e persistido da mesma forma.
4. **Dado** que o onboarding ja foi visto, **Quando** o app reinicia, **Entao**
   ele nao reaparece.

---

### Historia do Usuario 2 - Painel inicial do dia (home) (Prioridade: P1)

Como usuario autenticado, quero uma home com o resumo do meu dia (contagens de
tarefas, notas e ecos, e a proxima tarefa agendada) e atalhos diretos, para
decidir rapidamente o que fazer antes de entrar na timeline.

**Por que esta prioridade**: Da ao app um ponto de partida util pos-login em vez
de despejar o usuario direto na superficie densa do dia.

**Teste independente**: Autenticar, abrir `/home`, conferir contagens e o card
de proxima tarefa, e usar os atalhos.

**Cenarios de aceite**:

1. **Dado** um dia com itens, **Quando** a home abre, **Entao** ela mostra as
   contagens de tarefas, notas e ecos do dia do relogio.
2. **Dado** uma tarefa agendada no dia, **Quando** a home abre, **Entao** ela
   destaca a proxima tarefa agendada com horario.
3. **Dado** um dia vazio, **Quando** a home abre, **Entao** ela mostra estado
   vazio e nao renderiza o card de proxima tarefa.
4. **Dado** a home aberta, **Quando** o usuario toca em `Abrir o dia`, **Entao**
   o app navega para `/day/[clockDate]`.
5. **Dado** que o usuario nao esta autenticado, **Quando** a home tenta abrir,
   **Entao** ele e redirecionado para o fluxo publico de sign-in.

---

### Historia do Usuario 3 - Reader como rota navegavel (Prioridade: P1)

Como usuario lendo uma nota ou tarefa, quero que o Reader seja uma tela com
rota propria, para que voltar, navegar entre notas conectadas e continuar uma
nota se comportem como navegacao normal de app (pilha), sem overlays fragilizados
por estado global.

**Por que esta prioridade**: O Reader-overlay e o `pendingReaderOpen` eram a
fonte de complexidade e de testes fragilizados. Rotas reais simplificam o
modelo mental e o codigo.

**Teste independente**: Tocar num card abre `/day/[date]/note/[id]` (ou `task`);
abrir relacao cross-day empurra a rota do destino; continuar nota empurra a rota
da nova nota; fechar volta na pilha.

**Cenarios de aceite**:

1. **Dado** a superficie do dia, **Quando** o usuario toca num card de nota,
   **Entao** o app empurra `/day/[date]/note/[id]`.
2. **Dado** o Reader de nota com relacao em outro dia, **Quando** o usuario abre
   a relacao, **Entao** o app empurra `/day/[destino]/note/[idRelacionada]`.
3. **Dado** o Reader de nota, **Quando** o usuario conclui `Continuar desta
   nota`, **Entao** o app empurra `/day/[novoDia]/note/[idNova]`, no mesmo dia
   ou em dia futuro.
4. **Dado** que a RPC de continuacao falha, **Quando** o usuario submete,
   **Entao** o app nao navega e exibe o erro no editor de continuacao.
5. **Dado** o Reader aberto, **Quando** o usuario fecha, **Entao** a navegacao
   volta na pilha (`router.back`).

---

### Historia do Usuario 4 - Roteamento de entrada coerente (Prioridade: P2)

Como usuario, quero que a rota raiz decida para onde ir (onboarding, home ou
sign-in) de forma previsivel, considerando hidratacao de estado para nao piscar
telas erradas.

**Teste independente**: Variar `onboarding.hasSeen`, `hasHydrated` e estado de
auth e confirmar o destino.

**Cenarios de aceite**:

1. **Dado** onboarding nao visto, **Quando** a raiz resolve, **Entao** vai para
   `/onboarding`.
2. **Dado** onboarding visto e autenticado, **Quando** a raiz resolve, **Entao**
   vai para `/home`.
3. **Dado** onboarding visto e nao autenticado, **Quando** a raiz resolve,
   **Entao** vai para `/sign-in`.
4. **Dado** que o estado de onboarding ainda nao hidratou, **Quando** a raiz
   resolve, **Entao** ela mostra estado de carregamento e nao redireciona ainda.

---

### Historia do Usuario 5 - Marca e primitivas consistentes (Prioridade: P3)

Como usuario, quero que botoes, chips, rotulos de secao e a marca tenham
aparencia e comportamento consistentes em todas as telas novas, reagindo ao tema
ativo (modo/destaque).

**Teste independente**: Renderizar as primitivas, alternar tema e disparar
acoes; verificar `disabled` e tom destrutivo.

**Cenarios de aceite**:

1. **Dado** a `BrandMark`, **Quando** renderizada em tamanhos diferentes,
   **Entao** ela respeita o tamanho e o `showWordmark`.
2. **Dado** o tema ativo, **Quando** modo/destaque mudam, **Entao** a marca e as
   primitivas permanecem consistentes.
3. **Dado** `PrimaryAction` com `disabled`, **Quando** pressionada, **Entao**
   ela nao dispara `onPress`.
4. **Dado** `SecondaryAction` com `tone="danger"`, **Quando** pressionada,
   **Entao** ela dispara `onPress` com a comunicacao destrutiva correta.

### Casos de Borda

- Estado de onboarding nao hidratado nao pode causar flicker de redirecionamento.
- `id` de nota/tarefa inexistente na rota de Reader degrada sem quebrar (note
  nula -> Reader nao renderiza conteudo).
- Continuacao com falha de RPC nao navega e preserva o editor com erro.
- Sessao ausente em `/home` ou nas rotas de Reader redireciona para sign-in.
- Data invalida na rota do dia continua redirecionando para um dia valido.

## Requirements *(obrigatorio)*

### Requisitos Funcionais

Cada requisito funcional desta feature recebe um ID local `FR-NNN` e mapeia para
o ID canonico correspondente em `docs-canonical/REQUIREMENTS.md`.

- **FR-001** (`UI-ONBOARDING-001`): O app DEVE apresentar um onboarding inicial
  uma unica vez, com persistencia local de `hasSeen`, e a rota raiz DEVE rotear
  para onboarding, home ou sign-in conforme onboarding visto e estado de auth,
  respeitando a hidratacao do estado antes de redirecionar.
- **FR-002** (`UI-DASHBOARD-001`): A home autenticada DEVE exibir o resumo do
  dia do relogio (contagens de tarefas, notas e ecos), destacar a proxima tarefa
  agendada quando houver, mostrar estado vazio quando nao houver itens, oferecer
  atalho para abrir o dia e redirecionar para sign-in quando nao autenticado.
- **FR-003** (`UI-HEADER-001`): O header do dia DEVE exibir a marca Echotes e o
  chip de hoje quando o dia selecionado for o dia do relogio, e DEVE permitir
  alternar o calendario entre semana e mes por um toggle.
- **FR-004** (`UI-BRAND-001`): A `BrandMark` DEVE renderizar em tamanhos (`sm`,
  `md`, `lg`) com wordmark opcional e permanecer consistente ao trocar modo e
  cor de destaque do tema.
- **FR-005** (`UI-PRIMITIVE-001`): As primitivas de UI (`PrimaryAction`,
  `SecondaryAction`, `Chip`, `SectionLabel`) DEVEM expor tons (neutro/destrutivo,
  por dominio), respeitar `disabled` e disparar `onPress` apenas quando
  habilitadas.
- **FR-006** (`UI-READER-ROUTE-001`): O Reader de nota e o Reader de tarefa
  DEVEM ser rotas empilhadas (`/day/[date]/note/[id]` e
  `/day/[date]/task/[id]`); abrir um item empurra a rota e fechar volta na pilha.
- **FR-007** (`UI-READER-ROUTE-002`): A abertura de nota conectada de outro dia
  e a continuacao de nota DEVEM empurrar a rota da nota de destino, sem depender
  de estado one-shot global (`pendingReaderOpen` removido).

### Entidades-Chave

- **OnboardingState**: `hasSeen` (persistido) e `hasHydrated` (runtime) que
  governam o primeiro acesso e o roteamento da raiz.
- **HomeDaySummary**: derivacao de leitura sobre o dia do relogio com contagens
  de tarefas, notas e ecos e a proxima tarefa agendada.
- **UIPrimitive**: familia de componentes de acao/rotulo/chip/marca com tom e
  estado visual, plugados ao tema ativo.
- **ReaderRoute**: rota empilhada que hospeda o conteudo de leitura de nota ou
  tarefa, consumindo controladores de feature.

## Success Criteria *(obrigatorio)*

- **SC-005-001**: A rota raiz resolve para onboarding, home ou sign-in conforme
  os tres estados, sem piscar tela errada durante a hidratacao.
- **SC-005-002**: A home reflete contagens corretas e a proxima tarefa agendada
  do dia do relogio, com estado vazio quando aplicavel.
- **SC-005-003**: Abrir nota/tarefa, navegar cross-day e continuar nota se
  comportam como navegacao de pilha; fechar volta sem estado residual.
- **SC-005-004**: Nenhuma referencia a `pendingReaderOpen` permanece em codigo
  de runtime ou testes.
- **SC-005-005**: `doc:guard`, `lint`, `test` e `typecheck` permanecem verdes.

## Premissas

- Reaproveita o tema e os tokens de `003`/`004`; nao introduz tabela nova nem
  altera schema/RLS.
- Nao altera dominio de nota/tarefa/eco, derivacao da timeline nem semantica de
  ghost card.
- `readerState` permanece no `uiStore` por compatibilidade, mas nao controla
  mais a visibilidade do Reader.
- Mencoes inline `@nota` e deploy de producao continuam fora do corte.
