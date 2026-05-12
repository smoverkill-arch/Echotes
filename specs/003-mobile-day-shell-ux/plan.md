# Plano de Implementacao: Upgrade Mobile da Superficie do Dia

**Branch**: `003-mobile-day-shell-ux` | **Data**: 2026-05-12 | **Spec**: [spec.md](./spec.md)
**Entrada**: Especificacao da feature em `/specs/003-mobile-day-shell-ux/spec.md`

## Summary

Entregar um upgrade mobile da superficie autenticada do dia para remover a
sensacao de telas default Expo e permitir smoke real no S21. A fatia inicial
fecha o shell temporal semanal/mensal, preserva tabs como lentes do dia e
reorganiza o Reader de nota para ecos e continuacao ficarem compreensiveis.

## Technical Context

**Idioma/Versao**: TypeScript 5.x
**Dependencias principais**: Expo 54, React 19, React Native 0.81, Expo Router 6, Zustand 5, Supabase JS 2, Zod 4, Jest com React Native Testing Library
**Gestor de pacotes**: pnpm
**Armazenamento**: Supabase Postgres existente; esta feature nao introduz tabela nova
**Testes**: Jest, React Native Testing Library, smoke manual no S21
**Plataforma-alvo**: Android/iOS via Expo; validacao principal no Samsung S21
**Tipo de projeto**: app mobile
**Metas de performance**: trocar dias pelo shell sem bloqueio perceptivel; manter abertura quente do dia em ate 2 segundos
**Restricoes**: sem `service_role` no cliente; preservar separacao entre notas e tarefas; nao adicionar `side` ao `TimelineNode`; manter `/day/[date]` como rota do dia; semana inicia domingo
**Escala/Escopo**: superficie autenticada do dia, calendario semanal/mensal, tabs, Reader de nota e roteiro de smoke S21

## Constitution Check

- [x] Os canones executaveis em `docs-canonical/` e os docs de governanca/status da raiz foram revisados e citados quando originam decisoes.
- [x] A navegacao centrada no dia e a timeline diaria continuam como interacao principal.
- [x] Os comportamentos de tarefa e nota continuam distintos; nenhuma abstracao enfraquece ghost cards ou ecos.
- [x] Os invariantes temporais e cenarios criticos tem cobertura explicita de verificacao.
- [x] `pnpm`, `.env.example`, as chaves publicas do cliente Supabase e a politica de segredos do cliente foram respeitados.

## Project Structure

### Documentacao

```text
specs/003-mobile-day-shell-ux/
├── spec.md
├── plan.md
├── quickstart.md
├── tasks.md
└── ux-upgrade-plan.md
```

### Codigo

```text
app/day/[date].tsx
src/components/day/day-header.tsx
src/components/day/day-shell.tsx
src/components/reader/note-reader.tsx
src/stores/calendar-store.ts
src/theme/tokens.ts
src/utils/date.ts
tests/integration/
tests/unit/
```

## Design Decisions

- O shell temporal vive no topo da superficie do dia e controla `/day/[date]`.
- A strip semanal sempre inicia no domingo.
- O seletor mensal abre como sheet/modal e volta ao modo semanal apos escolher uma data.
- `Timeline`, `Tarefas` e `Notas` sao tabs/lentes do dia selecionado.
- `src/theme/tokens.ts` concentra a linguagem visual compartilhada para componentes tocados.
- O Reader de nota diferencia acao primaria (`Continuar desta nota`), secundarias (`Adicionar eco`, `Editar`, `Fechar`) e destrutiva (`Remover eco`).

## Minimum Coverage

- Semana renderiza domingo a sabado com dia selecionado e hoje distinguiveis.
- Semana anterior/proxima e botao Hoje disparam mudanca de data.
- Seletor mensal permite escolher data fora da semana visivel.
- Tabs nao mudam o dia selecionado.
- Reader mostra relacoes com chip de mesmo dia/outro dia/indisponivel.
- Gates obrigatorios: `doc:guard`, `lint`, `test`, `typecheck`.

## Complexity Tracking

Nenhuma violacao da constituicao e esperada.
