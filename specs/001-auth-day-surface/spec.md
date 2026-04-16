# Especificação da Feature: Superfície Diária Autenticada

**Branch da feature**: `001-auth-day-surface`  
**Criada em**: 2026-04-15  
**Status**: Rascunho  
**Entrada**: Descrição do usuário: "Criar a primeira fatia vertical do Echotes com autenticação completa por email e senha, acesso protegido à superfície diária e criação básica de nota e tarefa na timeline do dia."

> Esta spec foi derivada da constituição do projeto e dos canônicos em `/docs`.
> O corte preserva o modelo centrado no dia e a separação entre tarefas e notas.

## Cenários do Usuário e Testes *(obrigatório)*

### História do Usuário 1 - Entrar e acessar o dia (Prioridade: P1)

Como pessoa usuária do Echotes, eu quero criar conta, entrar novamente e ter
minha sessão restaurada para voltar direto para a superfície diária protegida
sem repetir o fluxo de acesso toda vez.

**Por que esta prioridade**: sem acesso autenticado e restauração de sessão, o
produto não consegue proteger os dados do usuário nem sustentar o restante da
experiência do MVP.

**Teste independente**: esta história pode ser validada sozinha ao criar uma
conta, entrar, fechar e reabrir o app, confirmar o retorno ao dia protegido e
encerrar sessão com volta ao fluxo público.

**Cenários de aceite**:

1. **Dado** uma pessoa sem conta ativa, **Quando** ela conclui um cadastro
   válido, **Então** a conta é iniciada e a superfície diária protegida fica
   disponível.
2. **Dado** uma pessoa com credenciais válidas, **Quando** ela entra no app,
   **Então** o sistema abre a superfície do dia em contexto autenticado.
3. **Dado** uma sessão autenticada persistida, **Quando** o app é reaberto,
   **Então** a pessoa retorna diretamente ao seu dia sem passar novamente pela
   entrada pública.
4. **Dado** uma pessoa autenticada, **Quando** ela encerra a sessão, **Então** o
   sistema bloqueia as superfícies protegidas e retorna ao fluxo público.

---

### História do Usuário 2 - Registrar o dia com nota e tarefa (Prioridade: P2)

Como pessoa usuária autenticada, eu quero criar uma nota e uma tarefa no dia em
que estou para registrar meu contexto e minhas ações sem sair da timeline
principal.

**Por que esta prioridade**: depois do acesso, o próximo valor mínimo do
produto é permitir que a pessoa registre o próprio dia com os dois tipos
estruturais do Echotes.

**Teste independente**: esta história pode ser validada sozinha ao abrir a
superfície diária protegida, criar uma nota e uma tarefa para o mesmo dia e
confirmar que ambas aparecem na timeline em conformidade com suas regras de
posicionamento.

**Cenários de aceite**:

1. **Dado** uma pessoa autenticada vendo um dia válido, **Quando** ela cria uma
   nota independente, **Então** a nota aparece na timeline do dia pela posição
   intradiária derivada de sua criação.
2. **Dado** uma pessoa autenticada vendo um dia válido, **Quando** ela cria uma
   tarefa sem horário para o mesmo dia, **Então** a tarefa aparece como item
   real do dia pela posição intradiária derivada de sua criação.
3. **Dado** uma tarefa com horário criada para o mesmo dia, **Quando** o sistema
   salva o item, **Então** a timeline mostra tanto o registro de criação quanto
   o ponto real agendado.

---

### História do Usuário 3 - Projetar tarefa para outro dia e navegar com contexto (Prioridade: P3)

Como pessoa usuária autenticada, eu quero criar uma tarefa para outro dia e
usar a navegação contextual do Echotes para entender de onde ela nasceu e onde
ela realmente pertence.

**Por que esta prioridade**: esta história entrega o mecanismo mais
característico das tarefas no Echotes, mas pode vir depois de o acesso e o
registro básico do dia já estarem funcionando.

**Teste independente**: esta história pode ser validada sozinha ao criar uma
tarefa futura, ver o ghost card no dia de origem, abrir o item real no dia de
destino e usar o caminho de retorno ao contexto original.

**Cenários de aceite**:

1. **Dado** uma pessoa autenticada no dia de origem, **Quando** ela cria uma
   tarefa para outro dia sem horário, **Então** o dia de origem mostra apenas o
   ghost card e o dia de destino mostra o item real.
2. **Dado** uma tarefa futura com horário válido, **Quando** ela é salva,
   **Então** o ghost card continua representando a origem e o item real aparece
   no destino pelo horário agendado.
3. **Dado** uma pessoa navegando por um ghost card, **Quando** ela abre o item
   real no dia de destino, **Então** o sistema oferece um caminho claro de
   retorno ao dia de origem.
4. **Dado** uma tentativa de agendar tarefa no passado ou em horário não
   posterior à criação, **Quando** a pessoa tenta salvar, **Então** o sistema
   bloqueia a ação com feedback claro e nada inválido é persistido.

---

### Casos de Borda

- O que acontece quando `EXPO_PUBLIC_SUPABASE_URL` ou
  `EXPO_PUBLIC_SUPABASE_ANON_KEY` não estão configurados?
- Como o sistema reage quando a sessão expira enquanto a pessoa tenta abrir ou
  salvar uma ação protegida do dia?
- O que acontece quando a pessoa tenta criar uma tarefa com horário no passado
  ou igual/anterior ao momento real da criação?
- Como a timeline se comporta quando o mesmo dia possui nota, tarefa sem
  horário, marcador de criação e tarefa agendada em sequência próxima?

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **FR-001**: O sistema DEVE permitir cadastro com email e senha para novas
  pessoas usuárias do Echotes.
- **FR-002**: O sistema DEVE permitir entrada com email e senha para pessoas que
  já possuem conta válida.
- **FR-003**: O sistema DEVE restaurar automaticamente a sessão autenticada
  quando ela ainda for válida.
- **FR-004**: O sistema DEVE bloquear o acesso a superfícies protegidas quando
  não houver sessão autenticada válida.
- **FR-005**: O sistema DEVE permitir encerramento explícito de sessão a partir
  da experiência autenticada.
- **FR-006**: O sistema DEVE abrir a experiência autenticada diretamente na
  superfície diária do contexto selecionado após autenticação bem-sucedida.
- **FR-007**: O sistema DEVE tratar o dia como unidade principal da feature, com
  a timeline diária como visualização central do corte.
- **FR-008**: O sistema DEVE permitir criar nota independente no dia em contexto.
- **FR-009**: O sistema DEVE posicionar notas na timeline pela posição
  intradiária derivada de `created_at`.
- **FR-010**: O sistema DEVE permitir criar tarefa para o mesmo dia com horário
  opcional.
- **FR-011**: O sistema DEVE derivar o horário persistido da tarefa a partir da
  combinação entre dia de destino e horário informado.
- **FR-012**: O sistema DEVE impedir persistência de qualquer tarefa com horário
  no passado ou que não seja estritamente posterior ao momento real de criação.
- **FR-013**: O sistema DEVE exibir tarefa sem horário do mesmo dia como item
  real único da timeline.
- **FR-014**: O sistema DEVE exibir tarefa com horário no mesmo dia como dois
  registros distintos: criação e ponto real agendado.
- **FR-015**: O sistema DEVE permitir criar tarefa para outro dia e representar
  sua origem por ghost card no dia de criação.
- **FR-016**: O sistema DEVE exibir somente o ghost card no dia de origem quando
  `source_day` e `target_day` forem diferentes.
- **FR-017**: O sistema DEVE exibir o item real da tarefa no dia de destino,
  usando o horário agendado quando existir e a posição intradiária derivada da
  criação quando não existir.
- **FR-018**: O sistema DEVE permitir navegar do ghost card para o item real do
  dia de destino e oferecer caminho claro de retorno ao dia de origem.
- **FR-019**: O sistema DEVE abrir o Reader com gesto simples em item existente
  sem substituir a superfície diária subjacente.
- **FR-020**: O sistema DEVE abrir o Editor em modo de edição com gesto de
  double tap em item existente sem transformar Reader ou Editor em destinos de
  navegação.
- **FR-021**: O sistema DEVE falhar com mensagem clara de configuração quando as
  variáveis públicas obrigatórias do cliente não estiverem definidas.
- **FR-022**: O sistema DEVE manter a separação de domínio entre tarefas e notas
  mesmo quando ambas aparecem na mesma timeline.
- **FR-023**: O sistema DEVE considerar fora deste corte as capacidades
  avançadas de ecos, menções inline, `Continuar desta nota`, customização por
  tag/cor e modos mensal/abas derivadas, sem impedir sua evolução posterior.

### Entidades-Chave *(inclua se a feature envolver dados)*

- **Sessão autenticada**: representa a identidade ativa da pessoa usuária e
  controla o acesso a todas as superfícies protegidas do app.
- **Contexto do dia**: representa o dia em foco da experiência, inclusive quando
  o dia visualizado não coincide com o dia real do relógio.
- **Tarefa**: representa um item acionável de um dia, com origem, destino,
  momento real de criação e horário real opcional.
- **Nota**: representa um registro textual pertencente a um dia específico e
  posicionado pela sua criação.
- **Nó de timeline**: representa a forma visual derivada exibida no dia,
  incluindo nota, tarefa sem horário, marcador de criação, tarefa agendada e
  ghost card.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: Pessoas usuárias de teste conseguem concluir cadastro ou entrada e
  chegar à superfície diária protegida em menos de 3 minutos.
- **SC-002**: Em pelo menos 90% das tentativas de QA interno, a sessão
  autenticada é restaurada com sucesso ao reabrir o app sem exigir novo login.
- **SC-003**: Em 100% dos testes do corte, tentativas de criar tarefas com
  horário inválido são bloqueadas antes da persistência.
- **SC-004**: Pessoas usuárias de teste conseguem criar uma nota e pelo menos
  duas tarefas válidas no mesmo fluxo, visualizando cada representação correta
  na timeline sem ajuda externa.
- **SC-005**: Em 100% dos testes do ghost card, a navegação do dia de origem ao
  destino e o retorno ao contexto original permanecem claros e funcionais.

## Premissas

- O projeto Supabase do Echotes já existe e as credenciais públicas serão
  preenchidas manualmente em `.env` local a partir de `.env.example`.
- Recuperação de senha, login social, magic link e gestão de perfil ficam fora
  deste primeiro corte.
- Ecos, menções inline, `Continuar desta nota`, cores por tag, calendário mensal
  e lentes separadas de tarefas/notas ficam fora deste primeiro corte.
- O corte precisa entregar a experiência autenticada e a timeline diária de
  ponta a ponta antes de abrir novas capacidades de refinamento do produto.
