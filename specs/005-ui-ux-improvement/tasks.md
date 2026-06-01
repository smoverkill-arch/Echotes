# Tarefas: UI/UX Improvement (relato do entregue)

**Branch**: `005-ui-ux-improvement` | **Spec**: [spec.md](./spec.md)

Registro do trabalho efetivamente realizado na branch. Todas as tarefas abaixo
estao concluidas e cobertas por gates verdes.

## Phase 1: Entrada do app

- [x] T001 Criar `src/stores/onboarding-store.ts` com `hasSeen`/`hasHydrated`
      persistido em AsyncStorage (`echotes-onboarding`). (`UI-ONBOARDING-001`)
- [x] T002 Criar `app/onboarding.tsx` com paineis via `react-native-pager-view`,
      acoes `Pular`/`Comecar` persistindo `hasSeen`. (`UI-ONBOARDING-001`)
- [x] T003 Reescrever `app/index.tsx` como gate de roteamento
      (onboarding/home/sign-in) respeitando hidratacao. (`UI-ONBOARDING-001`)
- [x] T004 Criar `app/home.tsx` com resumo do dia, proxima tarefa, estado vazio,
      CTA e redirecionamento sem sessao. (`UI-DASHBOARD-001`)

## Phase 2: Reader como rota

- [x] T005 Criar `app/day/[date]/_layout.tsx` (Stack: index, note, task).
- [x] T006 Migrar a superficie do dia para `app/day/[date]/index.tsx` (host do
      `DayShell`), removendo `app/day/[date].tsx`.
- [x] T007 Criar `app/day/[date]/note/[id].tsx` e `app/day/[date]/task/[id].tsx`
      como rotas de Reader. (`UI-READER-ROUTE-001`)
- [x] T008 Extrair `src/features/day/hooks/use-note-reader-controller.ts` (ecos,
      picker, continuacao) consumido pela rota de nota.
- [x] T009 Remover `pendingReaderOpen` e acoes correlatas do
      `navigation-store.ts`; remover o tipo `PendingReaderOpen` de
      `types/note.ts`. (`UI-READER-ROUTE-002`)
- [x] T010 Ajustar push de navegacao cross-day e de continuacao para empurrar a
      rota da nota de destino. (`UI-READER-ROUTE-002`)

## Phase 3: Marca e primitivas

- [x] T011 Criar `src/components/brand/brand-mark.tsx`. (`UI-BRAND-001`)
- [x] T012 Criar `src/components/ui/{primary-action,secondary-action,chip,section-label}.tsx`.
      (`UI-PRIMITIVE-001`)
- [x] T013 Aplicar marca/toggle de calendario no header do dia. (`UI-HEADER-001`)

## Phase 4: Testes e migracao de testes existentes

- [x] T014 `tests/unit/onboarding/{index-routing,onboarding-store}.test.tsx`.
- [x] T015 `tests/unit/home/home-dashboard.test.tsx`.
- [x] T016 `tests/unit/ui/primitives.test.tsx`.
- [x] T017 Migrar testes de integracao do dia para as rotas aninhadas
      (auth-session-flow, day-surface-same-day, ghost-navigation,
      note-echo-management, note-echo-navigation, continue-note-flow).
- [x] T018 Ajustar `tests/unit/day/day-header-calendar.test.tsx` para
      `UI-HEADER-001`.

## Phase 5: Higiene e documentacao

- [x] T019 Corrigir `tests/unit/lib/env.test.ts` para isolar `process.env` por
      chave (sem reatribuir o objeto), evitando reinjecao do `.env`.
- [x] T020 Limpar lint sem workarounds (imports ao topo, remover import nao
      usado, `jest.requireActual` no factory, `.remember/*` em `globalIgnores`).
- [x] T021 Atualizar `docs-canonical/ARCHITECTURE.md` (rotas, Reader-como-rota,
      remocao de `pendingReaderOpen`, `uiStore`, fluxos, diagrama).
- [x] T022 Atualizar `CHANGELOG.md` com o corte `005-ui-ux-improvement`.
- [x] T023 Criar este pacote `specs/005-ui-ux-improvement/`.

## Gate Final

- [x] `lint` verde (0 problemas)
- [x] `typecheck` verde
- [x] `test` verde (43 suites / 191 testes)
- [x] `doc:guard` verde
