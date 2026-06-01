# Quickstart: Verificar UI/UX Improvement

**Branch**: `005-ui-ux-improvement` | **Spec**: [spec.md](./spec.md)

Roteiro para validar o corte entregue, por testes automatizados e por smoke
manual.

## Gates Automatizados

```bash
corepack pnpm run lint
corepack pnpm run typecheck
corepack pnpm run test
corepack pnpm run doc:guard
```

Todos devem ficar verdes.

## Testes desta Feature

```bash
corepack pnpm exec jest tests/unit/onboarding tests/unit/home tests/unit/ui
corepack pnpm exec jest tests/integration/day/continue-note-flow.test.tsx
corepack pnpm exec jest tests/integration/day/note-echo-navigation.test.tsx
corepack pnpm exec jest tests/unit/day/day-header-calendar.test.tsx
```

Cobertura por requisito:

| Requisito          | Teste |
|--------------------|-------|
| `UI-ONBOARDING-001`| `tests/unit/onboarding/index-routing.test.tsx`, `tests/unit/onboarding/onboarding-store.test.ts` |
| `UI-DASHBOARD-001` | `tests/unit/home/home-dashboard.test.tsx` |
| `UI-BRAND-001`     | `tests/unit/ui/primitives.test.tsx` |
| `UI-PRIMITIVE-001` | `tests/unit/ui/primitives.test.tsx` |
| `UI-HEADER-001`    | `tests/unit/day/day-header-calendar.test.tsx` |
| `UI-READER-ROUTE-001/002` | `tests/integration/day/note-echo-navigation.test.tsx`, `tests/integration/day/continue-note-flow.test.tsx` |

## Smoke Manual

1. Apague o app / limpe storage para zerar `echotes-onboarding`.
2. Abra o app: deve cair em `/onboarding`. Percorra os paineis; toque `Comecar`.
3. Faca login. Deve cair em `/home` com o resumo do dia.
4. Confira contagens (tarefas/notas/ecos) e o card de proxima tarefa agendada.
5. Toque `Abrir o dia`: vai para `/day/[hoje]`.
6. Toque num card de nota: abre `/day/[hoje]/note/[id]` como tela.
7. Em uma nota com eco cross-day, abra a relacao: empurra a rota do dia destino.
8. Use `Continuar desta nota` para um dia futuro: ao salvar, abre a nova nota.
9. Feche o Reader: volta na pilha, sem estado residual.
10. Reinicie o app: nao deve reaparecer o onboarding.

## Observacoes de Ambiente

- Os testes nao dependem de `.env`. O `tests/unit/lib/env.test.ts` isola
  `process.env` por chave (sem reatribuir o objeto), evitando reinjecao do
  `.env` pelo `@expo/env` durante a transformacao do Babel.
