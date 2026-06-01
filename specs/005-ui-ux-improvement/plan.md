# Plano de Implementacao: UI/UX Improvement — Entrada do App e Reader como Rota

**Branch**: `005-ui-ux-improvement` | **Data**: 2026-05-31 | **Spec**: [spec.md](./spec.md)
**Entrada**: Especificacao da feature em `/specs/005-ui-ux-improvement/spec.md`

> Relato de implementacao: descreve o desenho efetivamente entregue na branch.

## Summary

Reestruturar a entrada do app e a superficie do dia para um modelo de navegacao
baseado em rotas. O corte entrega: (1) onboarding inicial + home autenticada com
um gate de roteamento na raiz; (2) o Reader de nota e de tarefa como rotas
empilhadas, eliminando o overlay one-shot `pendingReaderOpen`; (3) uma camada de
primitivas de UI e marca reutilizaveis plugadas ao tema.

## Technical Context

**Idioma/Versao**: TypeScript 5.x
**Dependencias principais**: Expo 54, React 19, React Native 0.81, Expo Router 6,
Zustand 5, Supabase JS 2, Zod 4, Jest com React Native Testing Library,
`react-native-pager-view`, `react-native-safe-area-context`
**Gestor de pacotes**: pnpm
**Armazenamento**: Supabase Postgres existente + AsyncStorage; esta feature nao
introduz tabela nova; adiciona a chave local `echotes-onboarding` no AsyncStorage
**Testes**: Jest, React Native Testing Library
**Plataforma-alvo**: Android/iOS via Expo
**Tipo de projeto**: app mobile
**Restricoes**: sem `service_role` no cliente; preservar separacao nota/tarefa;
nao adicionar `side` ao `TimelineNode`; manter `/day/[date]` como rota do dia;
nao alterar schema/RLS

## Constitution Check

- [x] Canones executaveis e docs de governanca revisados; mudanca de arquitetura
      registrada em `docs-canonical/ARCHITECTURE.md` e `CHANGELOG.md`.
- [x] Navegacao centrada no dia preservada; home e atalho, nao substituto da
      superficie do dia.
- [x] Comportamentos de tarefa e nota permanecem distintos; ghost cards e ecos
      intactos.
- [x] Invariantes temporais e fluxos criticos mantem cobertura de teste.
- [x] `pnpm`, chaves publicas do Supabase e politica de segredos respeitados.

## Project Structure

### Documentacao

```text
specs/005-ui-ux-improvement/
├── spec.md
├── plan.md
├── data-model.md
├── quickstart.md
├── tasks.md
├── contracts/
│   └── app-routes.md
└── checklists/
    └── requirements.md
```

### Codigo (entregue)

```text
app/index.tsx                         # gate de roteamento (onboarding/home/sign-in)
app/onboarding.tsx                    # onboarding inicial (PagerView)
app/home.tsx                          # home autenticada com resumo do dia
app/day/[date]/_layout.tsx            # Stack das telas do dia
app/day/[date]/index.tsx              # superficie do dia (host do DayShell)
app/day/[date]/note/[id].tsx          # Reader de nota como rota
app/day/[date]/task/[id].tsx          # Reader de tarefa como rota
src/stores/onboarding-store.ts        # estado persistido de onboarding
src/features/day/hooks/use-note-reader-controller.ts
src/components/brand/brand-mark.tsx
src/components/ui/primary-action.tsx
src/components/ui/secondary-action.tsx
src/components/ui/chip.tsx
src/components/ui/section-label.tsx
```

### Codigo (removido)

```text
app/day/[date].tsx                    # monolito de 638 linhas, substituido pelas rotas aninhadas
src/stores/navigation-store.ts        # removido pendingReaderOpen e acoes correlatas
src/types/note.ts                     # removido tipo PendingReaderOpen
```

## Design Decisions

- **Gate de roteamento na raiz** (`app/index.tsx`): le `onboarding.hasSeen`,
  `onboarding.hasHydrated` e estado de auth. Enquanto bootstrapping ou onboarding
  nao hidratou, mostra loading; depois redireciona para onboarding, home ou
  sign-in. Evita flicker de tela errada.
- **Onboarding como rota dedicada**: usa `react-native-pager-view` com paineis
  estaticos; `Pular` e `Comecar` persistem `hasSeen` e voltam a raiz para
  re-rotear. Persistencia via `zustand/persist` + AsyncStorage com
  `partialize` salvando apenas `hasSeen`; `onRehydrateStorage` marca
  `hasHydrated`.
- **Home como atalho, nao substituto**: deriva o resumo do dia do relogio via
  `useDayTimeline(clockDate)`; nao duplica logica de dominio.
- **Reader como rota empilhada**: `app/day/[date]/_layout.tsx` define um `Stack`
  com `index`, `note/[id]` e `task/[id]`. Abrir um card faz `router.push`; fechar
  faz `router.back`. A logica do Reader de nota foi extraida para
  `use-note-reader-controller` (ecos, picker, continuacao) e consumida pela rota.
- **Remocao do `pendingReaderOpen`**: com Reader em rota, a abertura cross-day e
  a continuacao passam a empurrar diretamente `/day/[dia]/note/[id]`. O overlay
  one-shot e suas acoes (`setPendingReaderOpen`, `consumePendingReaderOpen`,
  `clearPendingReaderOpen`) e o tipo `PendingReaderOpen` foram removidos.
- **Primitivas de UI + marca**: `PrimaryAction`, `SecondaryAction`, `Chip`,
  `SectionLabel` e `BrandMark` centralizam acao/rotulo/identidade, lendo o tema
  ativo (`appearance-store`) para modo e cor de destaque.

## Minimum Coverage

- Roteamento da raiz cobre onboarding/home/sign-in + estado nao hidratado.
- Home cobre contagens, proxima tarefa, estado vazio, CTA e redirecionamento.
- Continuacao de nota cobre mesmo dia, dia futuro e falha de RPC (sem navegar).
- Navegacao de Reader cobre push da rota de nota e abertura cross-day.
- Primitivas cobrem render, tema, `disabled` e tom destrutivo.
- Store de onboarding cobre `setSeen` e `markHydrated`.
- Gates obrigatorios: `doc:guard`, `lint`, `test`, `typecheck`.

## Complexity Tracking

Nenhuma violacao da constituicao. A mudanca reduz complexidade ao remover estado
global one-shot em favor de navegacao por rotas.
