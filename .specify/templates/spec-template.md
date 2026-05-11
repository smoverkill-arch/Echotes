# Especificação da Feature: [FEATURE NAME]

**Branch da feature**: `[###-nome-da-feature]`
**Criada em**: [DATE]
**Status**: Rascunho
**Entrada**: Descrição do usuário: "$ARGUMENTS"

> Antes de redigir, revise a constituição do Echotes e os documentos canônicos
> vigentes: os seis canones executáveis em `docs-canonical/` e os docs de
> governança/status da raiz. A spec DEVE preservar o modelo centrado no dia e
> a distinção entre tarefas, notas, ghost cards e ecos.

## Cenários do Usuário e Testes *(obrigatório)*

<!--
  IMPORTANTE: as histórias do usuário devem ser PRIORIZADAS como jornadas do
  usuário em ordem de importância. Cada história/jornada deve ser testável de
  forma INDEPENDENTE.
-->

### História do Usuário 1 - [Título breve] (Prioridade: P1)

[Descreva esta jornada em linguagem simples]

**Por que esta prioridade**: [Explique o valor e por que esta é a prioridade]

**Teste independente**: [Descreva como validar esta história sozinha]

**Cenários de aceite**:

1. **Dado** [estado inicial], **Quando** [ação], **Então** [resultado esperado]
2. **Dado** [estado inicial], **Quando** [ação], **Então** [resultado esperado]

---

### História do Usuário 2 - [Título breve] (Prioridade: P2)

[Descreva esta jornada em linguagem simples]

**Por que esta prioridade**: [Explique o valor e por que ela vem depois da P1]

**Teste independente**: [Descreva como validar esta história sozinha]

**Cenários de aceite**:

1. **Dado** [estado inicial], **Quando** [ação], **Então** [resultado esperado]

---

### História do Usuário 3 - [Título breve] (Prioridade: P3)

[Descreva esta jornada em linguagem simples]

**Por que esta prioridade**: [Explique o valor e por que ela pode vir depois]

**Teste independente**: [Descreva como validar esta história sozinha]

**Cenários de aceite**:

1. **Dado** [estado inicial], **Quando** [ação], **Então** [resultado esperado]

---

[Adicione mais histórias quando necessário, cada uma com sua prioridade]

### Casos de Borda

- O que acontece quando a configuração obrigatória de ambiente está ausente?
- Como o sistema lida com dados temporais inválidos ou ações que violam regras
  canônicas de tarefa/nota?
- O que acontece quando o usuário perde autenticação ao tentar uma ação
  protegida do dia?

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **FR-001**: O sistema DEVE descrever o comportamento em termos de valor ao
  usuário e de necessidade do produto, não de framework ou estrutura de código.
- **FR-002**: O sistema DEVE preservar o contexto diário como superfície
  principal do trabalho descrito pela feature.
- **FR-003**: O sistema DEVE declarar explicitamente, na seção de premissas, as
  capacidades canônicas adiadas que ficarem fora do corte.
- **FR-004**: O sistema DEVE identificar todas as restrições, validações e
  falhas visíveis ao usuário necessárias para testar a feature.
- **FR-005**: O sistema DEVE definir resultados de aceite verificáveis sem
  conhecimento de implementação.

### Entidades-Chave *(inclua se a feature envolver dados)*

- **[Entidade 1]**: [O que representa, atributos principais sem implementação]
- **[Entidade 2]**: [O que representa, relações relevantes]

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: [Métrica mensurável, ex.: "Usuários concluem a jornada principal em menos de 3 minutos"]
- **SC-002**: [Métrica mensurável, ex.: "90% dos usuários conseguem completar a tarefa na primeira tentativa"]
- **SC-003**: [Métrica operacional, ex.: "Ações inválidas são bloqueadas com feedback claro"]
- **SC-004**: [Métrica de uso ou negócio, ex.: "A atividade diária principal pode ser concluída sem ajuda externa"]

## Premissas

- [Premissa sobre limites de escopo, ex.: "A navegação avançada em grafo fica fora deste corte"]
- [Premissa sobre ambiente, ex.: "Ações protegidas exigem sessão autenticada"]
- [Premissa sobre dependências, ex.: "O projeto Supabase já existe e as credenciais públicas serão fornecidas localmente"]
