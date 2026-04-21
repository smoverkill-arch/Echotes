# Tarefas: Superfície Diária Autenticada

**Entrada**: Documentos de desenho em `/specs/001-auth-day-surface/`
**Pré-requisitos**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Testes**: Esta feature exige testes explícitos porque a spec e a constituição
marcam autenticação, configuração de ambiente, invariantes temporais e
derivação da timeline como áreas críticas.

**Organização**: As tarefas estão agrupadas por história do usuário para
permitir implementação e verificação independentes de cada fatia.

## Formato: `[ID] [P?] [História] Descrição`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência direta)
- **[História]**: A qual história do usuário pertence (`[US1]`, `[US2]`, `[US3]`)
- Toda descrição inclui caminhos de arquivo concretos

## Convenções de Caminho

- App mobile: `app/`, `src/`, `supabase/`, `tests/`
- Use os caminhos planejados nesta feature; não introduza estruturas paralelas

## Fase 1: Configuração (Infraestrutura Compartilhada)

**Objetivo**: Inicializar o projeto Expo/TypeScript e fixar as convenções
operacionais do Echotes.

- [x] T001 Criar a base do app Expo em `package.json`, `tsconfig.json`, `app.json`, `babel.config.js` e `metro.config.js`
- [x] T002 Configurar scripts, lint e testes com `pnpm` em `package.json`, `eslint.config.js` e `jest.config.js`
- [x] T003 [P] Consolidar a base de ambiente em `.env.example`, `.gitignore` e `src/lib/env.ts`

---

## Fase 2: Base (Pré-requisitos Bloqueantes)

**Objetivo**: Entregar a infraestrutura central que precisa existir antes de
qualquer história do usuário.

**⚠️ CRÍTICO**: Nenhuma história do usuário começa antes desta fase

- [x] T004 Criar a migração inicial e políticas do Supabase em `supabase/migrations/001_auth_day_surface.sql`
- [x] T005 [P] Criar tipos e schemas canônicos em `src/types/auth.ts`, `src/types/note.ts`, `src/types/task.ts`, `src/types/timeline.ts`, `src/schemas/auth.schema.ts`, `src/schemas/note.schema.ts` e `src/schemas/task.schema.ts`
- [x] T006 [P] Configurar cliente Supabase e persistência de sessão em `src/lib/supabase.ts`, `src/features/auth/session-storage.ts` e `src/stores/auth-store.ts`
- [x] T007 [P] Criar utilitários de data e derivação base da timeline em `src/utils/date.ts`, `src/features/tasks/utils/build-scheduled-at.ts` e `src/features/timeline/utils/derive-timeline-nodes.ts`
- [x] T008 Criar stores compartilhadas do dia e navegação temporal em `src/stores/calendar-store.ts`, `src/stores/navigation-store.ts` e `src/stores/ui-store.ts`
- [x] T009 Configurar a casca de navegação e guarda básica do app em `app/_layout.tsx` e `app/index.tsx`

**Ponto de validação**: Base pronta; a autenticação e a superfície do dia já
podem começar a ser encaixadas em paralelo.

---

## Fase 3: História do Usuário 1 - Entrar e acessar o dia (Prioridade: P1) 🎯 MVP

**Objetivo**: Permitir cadastro, login, restauração de sessão e acesso ao dia
protegido com possibilidade de logout.

**Teste independente**: Criar conta, entrar, fechar e reabrir o app, confirmar
que a sessão é restaurada e encerrar sessão com retorno ao fluxo público.

### Testes da História do Usuário 1 ⚠️

- [x] T010 [P] [US1] Adicionar testes de ambiente e sessão em `tests/unit/lib/env.test.ts` e `tests/integration/auth/auth-session-flow.test.tsx`

### Implementação da História do Usuário 1

- [x] T011 [P] [US1] Implementar ações de autenticação em `src/features/auth/api/sign-up.ts`, `src/features/auth/api/sign-in.ts`, `src/features/auth/api/sign-out.ts` e `src/features/auth/api/restore-session.ts`
- [x] T012 [P] [US1] Criar formulários e telas públicas de autenticação em `src/components/auth/auth-form.tsx`, `src/components/auth/auth-error-banner.tsx`, `app/(auth)/sign-in.tsx` e `app/(auth)/sign-up.tsx`
- [x] T013 [US1] Implementar bootstrap de sessão e redirecionamento protegido em `src/features/auth/hooks/use-auth-session.ts`, `app/_layout.tsx` e `app/index.tsx`
- [x] T014 [US1] Criar a superfície protegida mínima do dia com ação de sair em `app/day/[date].tsx` e `src/components/day/day-shell.tsx`
- [x] T015 [US1] Integrar feedback de configuração ausente e expiração de sessão em `src/stores/auth-store.ts`, `src/components/auth/auth-error-banner.tsx` e `app/day/[date].tsx`

**Ponto de validação**: A pessoa usuária já consegue entrar, voltar ao app
autenticada e sair do contexto protegido. Este é o MVP sugerido.

---

## Fase 4: História do Usuário 2 - Registrar o dia com nota e tarefa (Prioridade: P2)

**Objetivo**: Permitir criação de nota e tarefa do mesmo dia e exibir a
timeline com os nós corretos de criação e agendamento.

**Teste independente**: Entrar no app, abrir um dia válido, criar uma nota, uma
tarefa sem horário e uma tarefa com horário no mesmo dia, confirmando a
renderização correta na timeline.

### Testes da História do Usuário 2 ⚠️

- [x] T016 [P] [US2] Adicionar testes de derivação e fluxo do mesmo dia em `tests/unit/timeline/same-day-nodes.test.ts` e `tests/integration/day/day-surface-same-day.test.tsx`

### Implementação da História do Usuário 2

- [x] T017 [P] [US2] Implementar leitura do dia e composição da timeline em `src/features/day/hooks/use-day-entries.ts` e `src/features/day/hooks/use-day-timeline.ts`
- [x] T018 [P] [US2] Implementar criação de nota e tarefa do mesmo dia em `src/features/notes/api/create-note.ts` e `src/features/tasks/api/create-task.ts`
- [x] T019 [P] [US2] Criar os componentes visuais da timeline do mesmo dia em `src/components/timeline/timeline-view.tsx`, `src/components/timeline/timeline-plus-button.tsx`, `src/components/cards/note-card-real.tsx`, `src/components/cards/task-card-real.tsx`, `src/components/cards/task-creation-marker.tsx` e `src/components/cards/task-card-timed.tsx`
- [x] T020 [P] [US2] Criar as superfícies contextuais de leitura e edição em `src/components/reader/note-reader.tsx`, `src/components/reader/task-reader.tsx`, `src/components/forms/note-editor.tsx` e `src/components/forms/task-editor.tsx`
- [x] T021 [US2] Integrar criação, leitura e edição do mesmo dia em `app/day/[date].tsx`, `src/components/day/day-header.tsx` e `src/stores/ui-store.ts`

**Ponto de validação**: Nota e tarefa do mesmo dia já são criadas e lidas no
contexto diário, incluindo o caso com marcador de criação + item agendado.

---

## Fase 5: História do Usuário 3 - Projetar tarefa para outro dia e navegar com contexto (Prioridade: P3)

**Objetivo**: Completar a projeção temporal de tarefas com ghost card,
navegação ao destino e retorno contextual à origem.

**Teste independente**: Criar tarefa futura, ver o ghost card no dia de origem,
abrir o item real no dia de destino e retornar ao contexto original sem perder
o vínculo temporal.

### Testes da História do Usuário 3 ⚠️

- [ ] T022 [P] [US3] Adicionar testes de projeção temporal e retorno contextual em `tests/unit/timeline/projected-task-nodes.test.ts` e `tests/integration/day/ghost-navigation.test.tsx`

### Implementação da História do Usuário 3

- [ ] T023 [P] [US3] Estender persistência e validação de tarefas futuras em `src/features/tasks/api/create-task.ts`, `src/features/tasks/api/update-task.ts`, `src/schemas/task.schema.ts` e `src/features/tasks/utils/build-scheduled-at.ts`
- [ ] T024 [P] [US3] Implementar a UI de ghost card, breadcrumb e eixo visual da timeline em `src/components/cards/task-card-ghost.tsx`, `src/components/day/breadcrumb-bar.tsx`, `src/components/timeline/timeline-view.tsx` e `src/components/timeline/timeline-item-wrapper.tsx`, garantindo `note -> direita` e `task_* -> esquerda`
- [ ] T025 [US3] Integrar navegação temporal entre origem e destino em `app/day/[date].tsx`, `src/features/day/hooks/use-day-timeline.ts` e `src/stores/navigation-store.ts`
- [ ] T026 [US3] Garantir abertura contextual do item real após ghost navigation em `src/components/reader/task-reader.tsx`, `src/components/forms/task-editor.tsx` e `app/day/[date].tsx`

**Ponto de validação**: A projeção temporal de tarefas está completa, o retorno
ao dia de origem funciona com contexto preservado e a timeline final exibe
notas à direita e tarefas à esquerda sem quebrar o eixo temporal.

---

## Fase 6: Polimento e Itens Transversais

**Objetivo**: Fechar documentação, regressões e acabamento dos estados
compartilhados.

- [ ] T027 [P] Atualizar documentação operacional em `README.md` e `specs/001-auth-day-surface/quickstart.md`
- [ ] T028 [P] Reforçar regressões transversais em `tests/integration/day/day-surface-regression.test.tsx` e `tests/unit/timeline/derive-timeline-nodes-regression.test.ts`
- [ ] T029 Revisar estados vazios, erro e acabamento final em `src/components/day/day-shell.tsx`, `src/components/timeline/timeline-view.tsx` e `src/components/auth/auth-error-banner.tsx`

---

## Dependências e Ordem de Execução

### Dependências entre fases

- Configuração (Fase 1): sem dependências
- Base (Fase 2): depende da Configuração; bloqueia todas as histórias
- História do Usuário 1 (Fase 3): depende da Base
- História do Usuário 2 (Fase 4): depende da Base e usa a casca autenticada entregue na US1
- História do Usuário 3 (Fase 5): depende da Base e das primitivas de tarefa/timeline já entregues na US2
- Polimento (Fase 6): depende das histórias escolhidas para entrega

### Dependências entre histórias

- **US1 (P1)**: primeira entrega recomendada; não depende de outras histórias
- **US2 (P2)**: usa o contexto autenticado de US1, mas continua verificável de forma isolada após esse shell existir
- **US3 (P3)**: estende a lógica de tarefas e timeline já criada em US2

### Dentro de cada história

- Testes críticos vêm antes da implementação da história correspondente
- APIs e tipos vêm antes da integração em tela
- Hooks/stores compartilhados vêm antes dos componentes que dependem deles
- A história deve estar completa antes de avançar para o polimento transversal

## Oportunidades de Paralelismo

- Fase 1: `T003` pode rodar em paralelo a `T001`/`T002`
- Fase 2: `T005`, `T006` e `T007` podem avançar em paralelo após `T004` definir a base de persistência
- US1: `T010`, `T011` e `T012` podem avançar em paralelo antes da integração final em `T013`
- US2: `T016`, `T017`, `T018`, `T019` e `T020` podem avançar em paralelo antes da integração final em `T021`
- US3: `T022`, `T023` e `T024` podem avançar em paralelo antes da integração final em `T025`
- Polimento: `T027` e `T028` podem avançar em paralelo antes da revisão final em `T029`

## Exemplo de Paralelismo por História

### US1

```text
T010 tests/unit/lib/env.test.ts + tests/integration/auth/auth-session-flow.test.tsx
T011 src/features/auth/api/sign-up.ts + sign-in.ts + sign-out.ts + restore-session.ts
T012 src/components/auth/auth-form.tsx + auth-error-banner.tsx + app/(auth)/sign-in.tsx + app/(auth)/sign-up.tsx
```

### US2

```text
T016 tests/unit/timeline/same-day-nodes.test.ts + tests/integration/day/day-surface-same-day.test.tsx
T017 src/features/day/hooks/use-day-entries.ts + use-day-timeline.ts
T018 src/features/notes/api/create-note.ts + src/features/tasks/api/create-task.ts
T019 src/components/timeline/* + src/components/cards/*
T020 src/components/reader/* + src/components/forms/*
```

### US3

```text
T022 tests/unit/timeline/projected-task-nodes.test.ts + tests/integration/day/ghost-navigation.test.tsx
T023 src/features/tasks/api/update-task.ts + src/schemas/task.schema.ts + src/features/tasks/utils/build-scheduled-at.ts
T024 src/components/cards/task-card-ghost.tsx + src/components/day/breadcrumb-bar.tsx + src/components/timeline/timeline-view.tsx + src/components/timeline/timeline-item-wrapper.tsx
```

## Estratégia de Implementação

### MVP primeiro

1. Concluir Configuração + Base
2. Entregar US1
3. Validar login, restauração de sessão, guarda de rotas e logout
4. Demonstrar a superfície diária protegida mínima

### Entrega incremental

1. US1 entrega o acesso protegido
2. US2 entrega o registro básico do dia
3. US3 entrega a projeção temporal característica do produto
4. Cada fase acrescenta valor sem reabrir o domínio canônico

## Notas

- Total de tarefas: 29
- Tarefas da US1: 6
- Tarefas da US2: 6
- Tarefas da US3: 5
- Escopo de MVP sugerido: concluir até a US1
- Todas as tarefas seguem o formato obrigatório com checkbox, ID, rótulos e caminhos de arquivo
