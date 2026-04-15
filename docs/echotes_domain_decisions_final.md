# Echotes — Decisões Fechadas do Domínio (Base Canônica)

Este documento consolida as decisões fechadas do domínio antes da revisão dos documentos de produto, design e engenharia.

---

## 1. Princípios estruturais

### D-001
O **dia** é a unidade principal de organização do app.

### D-002
Cada dia possui uma página própria e independente.

### D-003
A **timeline** é a visualização principal do dia.

### D-004
A timeline mistura **tarefas** e **notas** no mesmo eixo temporal.

### D-005
A sensação da timeline deve ser a de **avançar pelo dia**.

### D-006
Tudo entra na timeline pela **posição intradiária derivada do horário de `created_at`**, e não pela data completa de `created_at`.

### D-007
Tarefas com horário podem adicionar um segundo ponto temporal real em `scheduled_at`.

### D-008
Notas e tarefas usam mecanismos diferentes de relação temporal/conceitual:
- tarefas usam **projeção temporal**;
- notas usam **ecos**.

---

## 2. Domínio de tarefas

### T-001
Tarefa é um item acionável de um dia.

### T-002
Toda tarefa possui os seguintes campos temporais:
- `created_at`
- `source_day`
- `target_day`
- `scheduled_at` (opcional)

### T-003
`created_at` registra o momento real em que a tarefa foi criada.

### T-004
`source_day` registra a página/dia que o usuário estava vendo ao criar a tarefa.

### T-005
`target_day` registra o dia ao qual a tarefa pertence de fato.

### T-006
`scheduled_at` é exclusivo de tarefas.

### T-007
Quando a tarefa não possui `scheduled_at`, ela entra na timeline pela posição temporal do `created_at`.

### T-008
Quando a tarefa possui `scheduled_at` e `source_day == target_day`, ela continua tendo registro em `created_at` e ganha um item real em `scheduled_at`.

### T-009
Se `source_day == target_day` e não houver `scheduled_at`, a tarefa existe apenas como tarefa real naquele dia.

### T-010
Se `source_day == target_day` e houver `scheduled_at`, o sistema mostra:
- um registro de criação em `created_at`
- um item real em `scheduled_at`

### T-011
Se `source_day != target_day`, existe projeção temporal da tarefa.

### T-012
Na projeção temporal, o sistema mostra um **ghost card** em `source_day`.

### T-013
O ghost card é posicionado em `source_day` conforme a **posição intradiária derivada de `created_at`**.

### T-014
O ghost card representa que a tarefa foi criada naquele contexto, mas pertence a outro dia.

### T-015
Quando `source_day != target_day`, o dia de origem mostra apenas o **ghost card**, e não um marcador de criação separado.

### T-016
O item real da tarefa existe em `target_day`.

### T-017
Se a tarefa projetada tiver `scheduled_at`, o item real em `target_day` é posicionado por esse horário. Se não tiver `scheduled_at`, o item real em `target_day` entra no fluxo temporal pela **posição intradiária derivada de `created_at`**.

### T-018
O ghost card navega de `source_day` para `target_day`.

### T-019
Ao navegar por um ghost card, o sistema deve oferecer caminho claro de retorno ao dia de origem.

### T-020
Ghost card é um mecanismo exclusivo de tarefas.

### T-021
Tarefas não podem ser agendadas para o passado.

### T-022
O sistema deve impedir qualquer `scheduled_at` anterior a `created_at`.

### T-023
Se a tarefa for criada para o mesmo dia, `scheduled_at` deve ser posterior ao momento real da criação.

### T-023-A
`scheduled_time` pode existir como input de interface, mas o campo persistido da tarefa é `scheduled_at`, sempre derivado de `target_day + scheduled_time`.

### T-023-B
Se `scheduled_time` for nulo, `scheduled_at` também é nulo.

### T-023-C
A composição de `scheduled_at` acontece antes da validação temporal e antes da persistência.

### T-024
Editar `target_day`, `scheduled_at` ou ambos deve recalcular automaticamente a representação temporal da tarefa.

### T-025
Excluir uma tarefa remove todas as suas representações derivadas:
- item real
- ghost card
- registro de criação, quando existir

---

## 3. Domínio de notas

### N-001
Nota é um registro textual do dia.

### N-002
Nota entra na timeline pela posição temporal do seu `created_at`.

### N-003
Nota não usa ghost card.

### N-004
Nota não usa projeção temporal como tarefa.

### N-005
Nota pode se conectar conceitualmente a outras notas por meio de **ecos**.

### N-006
Eco é uma conexão direta, não hierárquica, entre notas.

### N-007
Eco não representa dependência, pai-filho nem direção obrigatória na interface.

### N-008
Uma nota pode ter zero, um ou vários ecos.

### N-009
Uma nota pode ter ecos com notas do passado, do mesmo dia ou do futuro.

### N-010
As conexões entre notas formam um **grafo de continuidade conceitual ao longo do tempo**.

### N-011
O usuário pode criar conexões entre notas por três entradas no MVP:
- por menção no conteúdo via `@nota`
- por ação explícita `Adicionar eco`
- por ação explícita `Continuar desta nota`

### N-012
A ação principal é **Criar nota**.

### N-013
**Adicionar eco** é uma ferramenta dentro da criação/edição da nota.

### N-014
A ação **continuar desta nota** sempre cria uma **nova nota**.

### N-015
Essa nova nota já nasce conectada por eco à nota de origem.

### N-016
A nota criada por continuação não copia integralmente o conteúdo da nota anterior.

### N-017
A nota criada por continuação nasce com um **preview/resumo automático** da nota ligada.

### N-018
O usuário pode editar esse briefing imediatamente, se desejar.

### N-019
A nova nota continua mantendo link para abrir o conteúdo completo da nota ligada.

### N-020
No MVP, a menção no conteúdo usa a sintaxe `@nota` e conecta apenas a nota atual a uma nota já existente. Ao ser confirmada, a menção cria um eco do tipo `manual_link` e deve ser representada no conteúdo salvo/renderizado como chip inline clicável. A criação de uma nova nota conectada continua exclusiva do fluxo `Continuar desta nota`, que cria um eco do tipo `continue_note`.

### N-020-A
A menção `@nota` é persistida no `content` como token estruturado no formato `@[label](note:<note_id>)`.

### N-020-B
Esse token é renderizado como chip inline clicável no conteúdo da nota.

### N-020-C
O `content` é a fonte de verdade da posição e da presença inline da menção.

### N-020-D
`note_echoes` com `kind = manual_link` é a fonte de verdade da relação semântica entre a nota atual e a nota mencionada.

### N-020-E
Se a mesma nota for mencionada mais de uma vez no mesmo `content`, todas as ocorrências inline são preservadas, mas a relação em `note_echoes` continua sendo uma só por par de notas.

### N-020-F
O label persistido no token inline não precisa mudar automaticamente se a nota-alvo for renomeada depois.

### N-021
Se o usuário quiser um registro sem conexão com outras notas, deve criar uma nota independente.

### N-022
Na timeline, a nota deve mostrar apenas um indicador discreto de ecos.

### N-023
Esse indicador deve mostrar a quantidade de **ecos diretos** da nota.

### N-024
A contagem não deve representar o total da família/rede inteira.

### N-025
Os detalhes dos ecos aparecem ao abrir a nota, e não no fluxo principal da timeline.

### N-026
O modelo de dados das notas pode ser simplificado em relação ao das tarefas.

### N-027
Para notas, a modelagem temporal recomendada é:
- `day`
- `created_at`
- relações de eco em tabela separada

### N-028
Notas não precisam reutilizar `source_day` e `target_day` da lógica de tarefas para manter sua funcionalidade principal.

### N-029
Excluir uma nota remove apenas:
- a própria nota
- os ecos diretamente ligados a ela

### N-030
A exclusão de uma nota não deve interferir nos ecos próprios e diversos que as outras notas da mesma família possam ter entre si.

### N-031
A conexão entre notas pode guardar metadata própria da conexão.

### N-032
Essa metadata deve ser armazenada em estrutura separada da nota.

### N-033
No futuro, a estrutura de ecos deve permitir visualização em mapa/rede da família de notas.

---

## 4. Domínio da timeline e navegação

### TL-001
A timeline é um eixo único misto.

### TL-002
Esse eixo mistura:
- notas
- tarefas sem horário
- registros de criação de tarefas com horário
- itens reais de tarefas agendadas
- ghost cards de tarefas projetadas

### TL-003
A ordenação visual do eixo deve respeitar a sucessão temporal do dia usando posições **locais ao dia exibido**.

### TL-004
Se um item usa `created_at` para se posicionar na timeline, deve ser considerada sua **posição intradiária** (horário), e não a data completa de `created_at`.

### TL-005
O usuário deve sentir que vive e registra o próprio dia, inclusive quando cria planejamentos futuros e ideias conectadas.

### TL-006
No fim da timeline existe um sinal persistente de `+`.

### TL-007
Ao tocar no `+`, o usuário escolhe criar:
- uma tarefa
- ou uma nota

### TL-008
O calendário persistente no topo controla o dia/contexto ativo.

### TL-009
O calendário é semanal por padrão, com expansão para mensal.

### TL-010
O dia selecionado no app pode ser diferente do dia real do relógio.

### TL-011
O sistema deve distinguir o dia real do relógio do dia/contexto que o usuário está visualizando.

### TL-011-A
No calendário semanal, a semana deve começar no domingo.

### TL-011-B
A strip semanal deve sempre mostrar a semana que contém o `selectedDate`.

### TL-011-C
Se o usuário selecionar um dia fora da semana atualmente visível, a strip semanal deve trocar imediatamente para a semana que contém o novo `selectedDate`.

### TL-012
As abas derivadas do dia são:
- Timeline
- Tarefas
- Notas

### TL-013
Essas abas não mudam o domínio do dado; apenas mudam a visualização do mesmo contexto diário.

### TL-014
Clique simples abre Reader.

### TL-015
Double tap abre Editor.

### TL-015-A
Reader e Editor são superfícies contextuais sobrepostas ao dia atual, não destinos de navegação.

### TL-015-B
Essas superfícies valem igualmente na Timeline, na lente Tarefas e na lente Notas.

### TL-015-C
Fechar Reader ou Editor não leva o usuário para outro lugar; apenas devolve foco total à superfície subjacente já aberta.

### TL-015-D
Existe Reader de nota, Reader de tarefa, Editor de nota e Editor de tarefa. A lente de origem não cria variação de superfície.

### TL-016
A timeline não deve exibir a complexidade total do grafo de notas no fluxo principal.

### TL-017
A complexidade relacional das notas pertence ao Reader.

### TL-018
O ghost card funciona como rastro temporal e atalho de navegação, não como item real.

### TL-019
Ghost cards são exclusivos de tarefas.

### TL-020
A coexistência entre tarefa e nota é estrutural ao produto e não deve ser diluída em módulos isolados.

---

## 5. Modelagem recomendada de alto nível

### M-001
Tarefas e notas compartilham o mesmo espaço da timeline, mas não precisam compartilhar exatamente a mesma lógica relacional/temporal no banco.

### M-002
A recomendação é manter a modelagem de tarefas separando claramente:
- contexto de criação
- dia de pertencimento
- horário agendado

### M-003
A recomendação é manter a modelagem de notas baseada em:
- nota
- tabela de ecos
- metadata da conexão

### M-004
A interface pode tratar ecos como relações sem direção visível, mesmo que o sistema internamente preserve metadata adicional para navegação, histórico ou futuras visualizações.

### M-005
A visualização em mapa/rede das famílias de notas é funcionalidade futura, mas a modelagem atual já deve permitir sua evolução.

---

## 6. Linguagem de interface fechada

### L-001
Ação principal de nota: **Criar nota**

### L-002
Ferramenta relacional de nota: **Adicionar eco**

### L-003
Ação contextual de continuidade: **Continuar desta nota**

### L-004
Indicador no card da nota: **Ecos**

### L-005
Ação principal de tarefa: **Criar tarefa**

### L-006
O termo **eco** nomeia a conexão, não um tipo de nota.

### L-007
Ghost card nomeia apenas a projeção temporal de tarefas.

---

## 7. Separação conceitual final

### S-001
**Tarefas** tratam de ação e projeção temporal.

### S-002
**Notas** tratam de registro e continuidade conceitual.

### S-003
Tarefas usam **ghost card**.

### S-004
Notas usam **ecos**.

### S-005
Essa separação deve se manter em produto, design, engenharia e linguagem de interface.
