# Plano Pre-Spec: Upgrade Mobile da Superficie do Dia

**Data**: 2026-05-12
**Branch proposta**: `003-mobile-day-shell-ux`
**Diretorio proposto da feature**: `specs/003-mobile-day-shell-ux/`
**Status**: Registro operacional pre-spec

> Este arquivo preserva o plano discutido antes da criacao formal de
> `spec.md`, `plan.md` e `tasks.md`. Ele nao substitui o fluxo Spec Kit.
> Quando a feature for aberta oficialmente, este conteudo deve ser convertido
> em spec, plan, research, contracts, quickstart e tasks.

## Diagnostico

A UI atual do Echotes executa parte dos fluxos, mas ainda se comporta como MVP
visual pobre: o usuario fica preso no dia atual, a navegacao temporal nao e
descobrivel e o Reader de nota mistura acoes importantes sem hierarquia clara.

Isso bloqueia validacao manual honesta no S21, especialmente para fluxos
cross-day de ecos, notas relacionadas e `Continuar desta nota`.

O problema nao e apenas cosmetico. A arquitetura canonica ja descreve
`calendarStore` com `selectedDate`, `calendarMode`, strip semanal, semana
iniciando no domingo e recalculo da faixa visivel ao trocar de data. A
implementacao atual ainda nao materializa esse shell temporal na UI.

## Decisao de Rota

Nao criar uma constituicao nova do zero como primeira acao.

A constituicao vigente ja e a autoridade correta. O trabalho deve:

- emendar a constituicao para `2.2.0` com um guardrail explicito de qualidade
  mobile/UX;
- abrir uma nova feature Spec Kit para o shell temporal e upgrade visual;
- preservar a branch `002-note-echo-flows` como escopo de ecos, sem misturar
  silenciosamente o redesign dentro dela.

## Bloqueio Inicial

A branch `002-note-echo-flows` esta com mudancas pendentes. Antes de implementar
o upgrade, escolher uma rota operacional:

1. Preferido: fechar/checkpointar `002-note-echo-flows` primeiro, com status
   claro e commit.
2. Aceitavel: criar `003-mobile-day-shell-ux` a partir da branch atual carregando
   esse estado, registrando que ela herda WIP da `002`.
3. Nao recomendado: continuar adicionando UX nova em `002-note-echo-flows` sem
   spec separada.

## Fase 0: Governanca e Escopo

- Emendar `.specify/memory/constitution.md` para `2.2.0`.
- Adicionar guardrail de qualidade mobile nativa:
  - app-first, sem aparencia default Expo;
  - touch targets minimos;
  - safe area respeitada;
  - hierarquia visual consistente;
  - calendario persistente quando a feature tocar contexto do dia.
- Atualizar templates Spec Kit para exigirem secao de UX mobile quando a feature
  tocar superficies visiveis.
- Atualizar `CHANGELOG.md`.
- Atualizar `CANON-MIGRATION-COVERAGE.md` somente se o trabalho absorver conteudo
  historico de `docs/`.

## Fase 1: Spec

Criar `specs/003-mobile-day-shell-ux/spec.md` com estas historias:

### US1 P1: Navegar entre dias sem ficar ilhado

O usuario deve conseguir trocar de dia por uma strip semanal persistente,
identificando claramente hoje, o dia selecionado, semana anterior/proxima e
acesso ao seletor mensal.

### US2 P1: Entender o dia como superficie de trabalho

`Timeline`, `Tarefas` e `Notas` devem ser lentes do mesmo dia selecionado, nao
substitutos do calendario nem mecanismos confusos de navegacao temporal.

### US3 P2: Usar Reader e ecos sem confusao

O Reader de nota deve organizar acoes por prioridade, mostrar relacoes com
chips de data e deixar claro quando uma nota conectada pertence a outro dia.

### US4 P2: Aparencia de app mobile real

A interface deve usar tokens de cor, espaco, raio, tipografia, estados de
interacao e safe area para deixar de parecer tela default Expo.

### US5 P3: Smoke S21 documentado

O quickstart deve permitir validar no S21: ontem, amanha, outra semana, outro
mes, abrir nota, adicionar eco, remover eco, continuar nota cross-day, abrir
Reader contextual e retornar ao dia de origem.

## Fase 2: Plan

Gerar `plan.md`, `research.md`, `data-model.md`, `contracts/` e `quickstart.md`.

Contratos propostos:

- `contracts/day-navigation.md`
- `contracts/mobile-shell-ui.md`
- `contracts/reader-echo-ux.md`
- `contracts/s21-smoke.md`

Entidades de UI propostas:

- `CalendarMode`: `week | month`
- `VisibleWeek`
- `CalendarDayCell`
- `SelectedDayContext`
- `DayTab`
- `ReaderRelationItem`
- `MobileActionState`

## Fase 3: Implementacao Base

- Criar `src/theme/` com tokens de cor, spacing, radius, typography e elevation.
- Remover hex solto gradualmente dos componentes tocados.
- Expandir `src/stores/calendar-store.ts` com `calendarMode`, semana visivel e
  helpers de navegacao.
- Criar utilitarios de data para semana iniciando no domingo, faixa semanal,
  mes visivel e labels curtos.

## Fase 4: Shell Temporal

Substituir o header atual por um shell do dia com:

- topo compacto;
- data selecionada;
- botao `Hoje`;
- navegacao semanal;
- strip de 7 dias;
- seletor mensal em modal/sheet;
- tabs abaixo do calendario.

A rota `/day/[date]` continua sendo fonte de verdade navegavel.

## Fase 5: Reader e Ecos

- Reorganizar `src/components/reader/note-reader.tsx`.
- Definir hierarquia de acoes:
  - primaria: `Continuar desta nota`;
  - secundaria: `Adicionar eco`, `Editar`;
  - destrutiva: remover relacao, separada e confirmada.
- Mostrar relacoes com data, estado indisponivel, mesmo dia/outro dia e destino
  claro.

## Fase 6: Visual App-First

Direcao visual recomendada: app de produtividade diario, calmo, denso e
elegante. Nao criar landing page, hero, tela branca generica ou botoes pretos
soltos como linguagem principal.

Paleta recomendada:

- base clara neutra;
- texto forte;
- accent verde/teal para dia ativo;
- azul contido para notas/ecos;
- ambar para tarefas/projecoes;
- vermelho apenas para acoes destrutivas.

Evitar interface dominada por apenas uma familia de cor, especialmente tudo
slate, tudo bege ou tudo azul.

## Fase 7: Verificacao

Obrigatorio antes de considerar fechado:

- `corepack pnpm run doc:guard`
- `corepack pnpm run lint`
- `corepack pnpm run test`
- `corepack pnpm run typecheck`
- smoke manual no S21 usando `quickstart.md`

## Criterio de Merge

Nao considerar merge enquanto:

- nao for possivel trocar de dia por semana e mes no S21;
- o Reader de nota nao deixar claro o que e eco, continuacao e navegacao
  cross-day;
- touch targets e safe area nao estiverem aceitaveis;
- canon/docs nao refletirem o novo comportamento;
- `doc:guard`, `lint`, `test` e `typecheck` nao estiverem verdes.

## Proximo Passo Recomendado

1. Fazer checkpoint honesto da `002-note-echo-flows`.
2. Criar a branch `003-mobile-day-shell-ux`.
3. Emendar constituicao/templates.
4. Gerar `spec.md` e checklist de qualidade.
5. Gerar `plan.md`, `research.md`, `contracts/`, `quickstart.md` e `tasks.md`.
6. Implementar primeiro o shell temporal semanal/mensal.
