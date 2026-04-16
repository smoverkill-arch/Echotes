---

description: "Template de tarefas para implementação de feature"
---

# Tarefas: [FEATURE NAME]

**Entrada**: Documentos de desenho em `/specs/[###-feature-name]/`
**Pré-requisitos**: plan.md (obrigatório), spec.md (obrigatório para histórias do usuário), research.md, data-model.md, contracts/

**Testes**: Inclua tarefas explícitas de teste sempre que a spec ou a
constituição marcar regras temporais, autenticação/sessão, separação entre
tarefa e nota, ordenação da timeline ou validação de ambiente como críticas. No
Echotes, essas verificações normalmente são esperadas.

**Organização**: As tarefas são agrupadas por história do usuário para permitir
implementação e verificação independentes de cada fatia.

## Formato: `[ID] [P?] [História] Descrição`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[História]**: A qual história do usuário pertence (ex.: US1, US2, US3)
- Inclua caminhos de arquivo exatos nas descrições

## Convenções de Caminho

- App mobile: `app/`, `src/`, `supabase/`, `tests/`
- Use caminhos concretos do Echotes vindos de `plan.md`, não placeholders genéricos

## Fase 1: Configuração (Infraestrutura Compartilhada)

**Objetivo**: Inicialização do projeto e estrutura básica

- [ ] T001 Criar a estrutura do projeto conforme o plano de implementação
- [ ] T002 Inicializar o workspace Expo/TypeScript com `pnpm`
- [ ] T003 [P] Adicionar base de ambiente (`.env.example`, guardas de env do cliente, `.gitignore`)

---

## Fase 2: Base (Pré-requisitos Bloqueantes)

**Objetivo**: Infraestrutura central que DEVE estar pronta antes de qualquer história do usuário

**⚠️ CRÍTICO**: Nenhum trabalho de história do usuário começa antes desta fase

- [ ] T004 Configurar cliente Supabase e tratamento de sessão autenticada
- [ ] T005 [P] Criar tipos e schemas canônicos do domínio para a fatia
- [ ] T006 [P] Construir utilitários de derivação do dia/timeline usados por todas as histórias
- [ ] T007 Criar estado compartilhado para contexto do dia e superfícies Reader/Editor
- [ ] T008 Adicionar tratamento base de erro e empty state para fluxos protegidos

**Ponto de validação**: Base pronta - as histórias do usuário podem avançar em paralelo

---

## Fase 3: História do Usuário 1 - [Título] (Prioridade: P1) 🎯 MVP

**Objetivo**: [Descrição breve do que esta história entrega]

**Teste independente**: [Como verificar esta história sozinha]

### Testes da História do Usuário 1 ⚠️

> **OBSERVAÇÃO: escreva estes testes primeiro e confirme que eles falham antes da implementação**

- [ ] T009 [P] [US1] Adicionar cobertura de integração para a jornada principal da P1 em tests/
- [ ] T010 [P] [US1] Adicionar cobertura de validação para acesso protegido e falhas relevantes

### Implementação da História do Usuário 1

- [ ] T011 [P] [US1] Criar modelos/tipos necessários em src/
- [ ] T012 [US1] Implementar a lógica principal do serviço/feature em src/
- [ ] T013 [US1] Implementar a rota ou superfície visível ao usuário em app/
- [ ] T014 [US1] Adicionar validação e feedback de erro

**Ponto de validação**: A História do Usuário 1 está funcional e testável sozinha

---

## Fase 4: História do Usuário 2 - [Título] (Prioridade: P2)

**Objetivo**: [Descrição breve do que esta história entrega]

**Teste independente**: [Como verificar esta história sozinha]

### Testes da História do Usuário 2 ⚠️

- [ ] T015 [P] [US2] Adicionar cobertura para a jornada da P2 e seus casos de borda

### Implementação da História do Usuário 2

- [ ] T016 [P] [US2] Implementar as peças de domínio/UI necessárias em src/
- [ ] T017 [US2] Integrar a história à superfície do dia sem quebrar a P1

**Ponto de validação**: As Histórias 1 e 2 funcionam independentemente

---

## Fase 5: História do Usuário 3 - [Título] (Prioridade: P3)

**Objetivo**: [Descrição breve do que esta história entrega]

**Teste independente**: [Como verificar esta história sozinha]

### Testes da História do Usuário 3 ⚠️

- [ ] T018 [P] [US3] Adicionar cobertura para a jornada da P3 e regras sensíveis a regressão

### Implementação da História do Usuário 3

- [ ] T019 [P] [US3] Implementar as peças restantes da história em src/ e app/
- [ ] T020 [US3] Validar a integração com os fluxos já existentes e os invariantes do domínio

**Ponto de validação**: Todas as histórias do usuário estão funcionais de forma independente

---

## Fase N: Polimento e Itens Transversais

**Objetivo**: Melhorias que afetam múltiplas histórias do usuário

- [ ] T021 [P] Atualizar documentação em docs/ e README.md
- [ ] T022 Revisar cobertura de regressão temporal/autenticação contra a constituição
- [ ] T023 Validar o quickstart.md

---

## Dependências e Ordem de Execução

### Dependências entre fases

- Configuração (Fase 1): sem dependências
- Base (Fase 2): depende da Configuração; bloqueia todas as histórias
- Histórias do Usuário (Fase 3+): dependem da Base e podem seguir em ordem de prioridade
- Polimento: depende das histórias escolhidas para entrega

### Dentro de cada história do usuário

- Testes de comportamento crítico DEVEM falhar antes da implementação quando o plano exigir
- Tipos e schemas vêm antes das telas que dependem deles
- Lógica compartilhada de timeline/auth vem antes das integrações específicas da história
- A história deve estar completa antes do polimento transversal

### Oportunidades de paralelismo

- Tarefas marcadas com `[P]` podem rodar em paralelo quando não tocam os mesmos arquivos
- Depois da Base, histórias distintas podem avançar em paralelo desde que continuem independentes

## Notas

- Tarefas `[P]` = arquivos diferentes, sem dependências diretas
- Cada história deve continuar concluível e testável de forma independente
- Prefira incrementos verticais pequenos a grandes lotes de infraestrutura desconectada
- Pare nos checkpoints para verificar que os bloqueios da constituição continuam válidos
