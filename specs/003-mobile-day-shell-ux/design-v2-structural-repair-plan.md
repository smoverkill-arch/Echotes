# Design v2 Structural Repair Plan

## Status

Plano para corrigir a implementacao visual do handoff `Echotes Design v2` na
branch atual `004-dual-timeline-nav`, sem criar branch/spec fake `005`.

Este plano ainda nao executa codigo. Ele define o caminho para substituir a
aplicacao superficial de cor por uma incorporacao estrutural do design.

## Problema Reformulado

A implementacao anterior preservou os fluxos do Echotes, mas absorveu o design
v2 principalmente como tema visual. Isso deixou partes importantes com cara de
Expo basico:

- header e calendario continuaram parecendo blocos separados;
- calendario foi tratado com cautela excessiva e nao recebeu a anatomia prevista
  pelo design;
- tipografia permaneceu sem personalidade real do handoff;
- bottom bar ficou flutuante/encaixada, sem tocar a edge inferior;
- sheets continuaram com aparencia de modal generico, com box dentro de box;
- varios componentes receberam "tinta" nova sem mudar container model.

O objetivo agora e redesenhar a anatomia das superficies principais sem perder
nenhuma funcionalidade ja entregue.

## Fontes de Verdade

1. `C:\Users\smove\Downloads\Echotes-handoff.zip`
2. `C:\tmp\Echotes-handoff-read\echotes\project\Echotes Design v2.html`
3. `C:\tmp\Echotes-handoff-read\echotes\project\echotes-ui-v2.jsx`
4. `C:\tmp\Echotes-handoff-read\echotes\project\echotes-screens-v2.jsx`
5. `docs-canonical/REQUIREMENTS.md`
6. `docs-canonical/ARCHITECTURE.md`
7. `docs-canonical/TEST-SPEC.md`
8. Codigo e testes atuais

Se houver conflito, a funcionalidade canonica do app vence; a solucao visual
deve adaptar o design sem desligar fluxos.

## Nao Objetivos

- Nao criar branch nova.
- Nao criar feature/spec `005`.
- Nao mudar schema Supabase, RLS, migrations ou contratos de API.
- Nao trocar o modelo de dominio de notas, tarefas, ecos ou ghost navigation.
- Nao esconder falhas visuais atras de testes passando.
- Nao manter componente visual "fake" ou botao sem comportamento.

## Principios De Implementacao

- Anatomia antes de cor: primeiro mudar estrutura visual, depois ajustar tokens.
- Sem box-in-box: sheets devem usar planos, linhas, espaco e hierarquia, nao
  cartoes aninhados.
- Header/calendario sao uma unica superficie visual.
- Bottom bar toca a edge inferior e incorpora o FAB, sem parecer encaixada.
- Tipografia e parte do produto: usar Bitter/Cabin ou instalar o caminho correto
  para isso, sem fingir com peso/tamanho.
- Preservar testIDs e textos contratuais quando os testes ou canon dependem
  deles, como `Ecos N` e `Vai para DD-MM-AAAA`.
- Ajustes de aparencia continuam sendo preferencia local real, nao dominio.

## Sprint 0 — Congelamento Do Design E Inventario

### Objetivo

Transformar o handoff v2 em checklist visual verificavel antes de tocar codigo.

### Tarefas

1. Relistar componentes importados por `Echotes Design v2.html`.
2. Extrair tokens reais do v2:
   - dark background;
   - surface;
   - surface-muted;
   - border;
   - primary/accent;
   - note;
   - task;
   - ghost border;
   - hard shadow.
3. Extrair tipografia:
   - Bitter para marca/titulos;
   - Cabin para labels, corpo, botoes e controles;
   - tracking uppercase dos stamps;
   - tamanhos compactos usados em cards e chrome.
4. Criar inventario de superficies:
   - Auth;
   - Day header + calendario;
   - timeline pages;
   - note/task cards;
   - ghost card;
   - bottom bar + FAB;
   - creation sheet;
   - note reader;
   - echo picker;
   - note editor;
   - task editor;
   - continue note editor;
   - settings sheet.
5. Escrever uma tabela "design esperado vs atual" para cada superficie.

### Criterios De Saida

- Existe uma lista fechada de componentes a alterar.
- Existe uma lista fechada de textos/behaviors que nao podem mudar.
- O plano de teste visual nao depende apenas de snapshot mental.

## Sprint 1 — Tipografia Real E Tokens Estruturais

### Objetivo

Parar de simular personalidade tipografica com `fontWeight` e instalar/aplicar
a tipografia do handoff de forma honesta.

### Tarefas

1. Verificar se `expo-font` ja esta disponivel direta ou transitivamente.
2. Se faltar fonte/dependencia necessaria, pedir elevacao e instalar o pacote
   correto em vez de usar workaround.
3. Preferencia de implementacao:
   - `@expo-google-fonts/bitter`;
   - `@expo-google-fonts/cabin`;
   - ou asset local equivalente se o repo preferir fontes versionadas.
4. Criar tokens tipograficos claros:
   - `font.brand`;
   - `font.body`;
   - `type.stamp`;
   - `type.dayTitle`;
   - `type.cardTitle`;
   - `type.sheetTitle`;
   - `type.control`.
5. Aplicar carregamento de fonte no root layout sem quebrar auth/session.
6. Garantir fallback sem tela em branco se fonte ainda estiver carregando.
7. Atualizar testes apenas se houver dependencia de texto/estrutura, nao para
   mascarar visual.

### Criterios De Saida

- Titulos e marca usam Bitter ou fallback definido.
- Corpo, labels e controles usam Cabin ou fallback definido.
- Nenhum componente principal permanece com tipografia default por acidente.

## Sprint 2 — Header + Calendario Como Bloco Unico

### Objetivo

Transformar `DayHeader` em uma unica superficie integrada, como no v2, sem
separar identidade e calendario em cartoes distintos.

### Tarefas

1. Redesenhar `src/components/day/day-header.tsx` para conter:
   - linha de identidade;
   - email;
   - `Ajustes` e `Sair`;
   - seletor de mes;
   - semana;
   - status `hoje`/dia selecionado;
   - grid mensal expandido quando `calendarMode === "month"`.
2. Remover visual de `calendarPanel` como card isolado.
3. Manter comportamento:
   - semana com domingo inicial;
   - hoje;
   - selecao de dia;
   - expandir/recolher mes;
   - navegar semana/mes se mantido pelo canon atual;
   - `onCalendarModeChange("week")` ao selecionar dia.
4. Garantir que o header continue sobrepondo a timeline sem comprimir layout.
5. Ajustar `contentTopInset` se a altura visual mudar.

### Criterios De Saida

- Header e calendario parecem um unico bloco.
- Expandir calendario mensal funciona e parece previsto, nao remendo.
- Timeline nao pula quando o chrome aparece/desaparece.

## Sprint 3 — Bottom Bar Edge-To-Edge + FAB Integrado

### Objetivo

Fazer a bottom bar tocar a edge inferior e parecer parte nativa da superficie,
com FAB central integrado ao desenho.

### Tarefas

1. Reestruturar `src/components/day/day-bottom-tabs.tsx`.
2. Remover wrapper arredondado que cria aparencia de barra solta.
3. Usar largura total, `borderTopWidth`, fundo da surface e padding inferior de
   safe area no lugar certo.
4. Garantir que o FAB:
   - nao pareca colado por cima de outro card;
   - rotacione/indique sheet aberto se mantido;
   - abra choice sheet real;
   - respeite estado disabled/loading.
5. Preservar tabs:
   - `TAREFAS`;
   - `NOTAS`;
   - estados selected;
   - testIDs existentes.

### Criterios De Saida

- Barra toca a edge da tela.
- Nao ha moldura externa desnecessaria.
- FAB parece parte do componente e nao overlay improvisado.

## Sprint 4 — Sheets Sem Box-In-Box

### Objetivo

Eliminar o aspecto de "Expo modal generico" nos fluxos de sheet.

### Tarefas

1. Criar primitivos visuais compartilhados:
   - `SheetSurface`;
   - `SheetHandle`;
   - `SheetHeader`;
   - `SheetFooter`;
   - `Stamp`;
   - `Chip`;
   - `PrimaryAction`;
   - `SecondaryAction`;
   - `InlineDivider`;
   - `SelectableRow`.
2. Refatorar sheets para usar a mesma linguagem:
   - creation sheet;
   - note reader;
   - note echo picker;
   - note editor;
   - task editor;
   - continue note editor;
   - settings sheet.
3. Remover containers aninhados quando eles so servem como moldura visual.
4. Usar separacao por:
   - linhas;
   - stamps;
   - spacing;
   - agrupamento textual;
   - rodape fixo simples.
5. Preservar comportamentos:
   - criar nota;
   - criar tarefa;
   - editar nota/tarefa;
   - adicionar eco;
   - remover eco;
   - continuar nota;
   - navegar para nota relacionada;
   - fechar/cancelar;
   - erros e loading.

### Criterios De Saida

- Nenhum sheet principal tem card dentro de card como estrutura visual base.
- Acoes primarias/secundarias/destrutivas tem hierarquia clara.
- Os sheets parecem parte do mesmo produto.

## Sprint 5 — Cards E Timeline Com Container Model Fiel

### Objetivo

Refinar timeline/cards para ficarem mais proximos do v2 e menos "card default".

### Tarefas

1. Revisar cards:
   - `note-card-real`;
   - `task-card-real`;
   - `task-card-timed`;
   - `task-card-ghost`;
   - `task-creation-marker`.
2. Manter borda lateral e hard shadow, mas ajustar:
   - densidade;
   - raio;
   - alinhamento;
   - chips;
   - stamps;
   - preview.
3. Garantir ghost card:
   - comunica destino;
   - mantem texto contratual `Vai para DD-MM-AAAA`;
   - nao parece item real daquele dia.
4. Garantir notas:
   - badge `Ecos N`;
   - preview curto;
   - lado direito na aba Notas.
5. Garantir tarefas:
   - lado esquerdo na aba Tarefas;
   - scheduled time visivel quando houver;
   - marker de criacao distinto.

### Criterios De Saida

- Timeline conserva dominio e orientacao visual.
- Cards nao parecem Expo basic.
- Densidade compact/normal/airy muda ritmo sem remover funcionalidade.

## Sprint 6 — Auth E Ajustes Como Superficies Coerentes

### Objetivo

Deixar auth e ajustes com a mesma linguagem do app, sem competir com o day
surface.

### Tarefas

1. Redesenhar `AuthForm` com:
   - marca forte;
   - formulario plano;
   - labels/stamps;
   - inputs sem card excessivo.
2. Revisar `SettingsSheet`:
   - manter controles reais;
   - evitar visual de painel administrativo;
   - preservar persistencia local;
   - garantir clareza de modo/acento/densidade.
3. Verificar loading screens de auth/day/index para nao destoarem.

### Criterios De Saida

- Auth parece porta de entrada do Echotes, nao tela starter Expo.
- Ajustes parece parte do produto, nao painel de demo.

## Sprint 7 — QA Visual, Funcional E Documental

### Objetivo

Provar que a segunda passada corrigiu fidelidade visual sem quebrar produto.

### Tarefas

1. Rodar gates tecnicos:
   - `corepack pnpm run test`;
   - `corepack pnpm run typecheck`;
   - `corepack pnpm run lint`;
   - `corepack pnpm run doc:guard`;
   - `git diff --check`.
2. Rodar app:
   - `corepack pnpm run web` para smoke visual quando Browser/IAB estiver
     disponivel;
   - Expo Go/dev build se necessario para verificar comportamento mobile real.
3. Criar ledger visual:
   - header/calendario;
   - bottom bar;
   - creation sheet;
   - note reader;
   - note editor;
   - task editor;
   - settings sheet.
4. Para cada item, registrar:
   - evidencia do v2;
   - estado renderizado;
   - diferenca corrigida;
   - diferenca aceita, se houver, com motivo.
5. Atualizar docs somente se comportamento/canon mudar.

### Criterios De Saida

- Gates verdes.
- DocGuard verde.
- Nenhum controle visual sem comportamento.
- Nenhuma funcionalidade atual perdida.
- Header/calendario, bottom bar e sheets passam em revisao visual.

## Ordem De Execucao Recomendada

1. Sprint 0.
2. Sprint 1.
3. Sprint 2.
4. Sprint 3.
5. Sprint 4.
6. Sprint 5.
7. Sprint 6.
8. Sprint 7.

Nao inverter Sprint 4 e Sprint 5: se os primitivos de sheet vierem depois, os
forms tendem a continuar com box-in-box.

## Arquivos Provavelmente Tocadas

- `app/_layout.tsx`
- `app/index.tsx`
- `app/(auth)/sign-in.tsx`
- `app/(auth)/sign-up.tsx`
- `app/day/[date].tsx`
- `src/theme/tokens.ts`
- `src/stores/appearance-store.ts`
- `src/components/auth/auth-form.tsx`
- `src/components/day/day-shell.tsx`
- `src/components/day/day-header.tsx`
- `src/components/day/day-bottom-tabs.tsx`
- `src/components/day/settings-sheet.tsx`
- `src/components/day/breadcrumb-bar.tsx`
- `src/components/cards/*.tsx`
- `src/components/timeline/*.tsx`
- `src/components/forms/*.tsx`
- `src/components/reader/*.tsx`
- `tests/unit/day/*.tsx`
- `tests/unit/cards/*.tsx`
- `tests/unit/timeline/*.tsx`
- `tests/unit/notes/*.tsx`
- `tests/unit/tasks/*.tsx`
- `tests/integration/day/*.tsx`

## Riscos E Mitigacoes

- Risco: instalar fonte de forma incompleta e quebrar boot.
  Mitigacao: verificar dependencia, instalar corretamente se necessario e
  preservar fallback.
- Risco: sheets compartilhados mudarem comportamento.
  Mitigacao: refatorar um sheet por vez e rodar testes-alvo.
- Risco: bottom bar edge-to-edge interferir em safe area.
  Mitigacao: validar com insets e manter padding inferior no lugar correto.
- Risco: calendario expandido voltar a comprimir timeline.
  Mitigacao: header overlay absoluto e timeline com inset estavel.
- Risco: testes passarem mas visual ainda ruim.
  Mitigacao: ledger visual obrigatorio antes do fechamento.

## Definition Of Done

- O app nao parece mais Expo starter nas superficies principais.
- Header e calendario formam um bloco unico.
- Calendario mensal expandido e visualmente previsto.
- Bottom bar toca a edge inferior.
- Sheets nao usam box-in-box como estrutura visual.
- Tipografia tem personalidade alinhada ao handoff.
- Todas as funcionalidades atuais seguem plugadas.
- Ajustes seguem reais e persistidos localmente.
- `doc:guard`, `test`, `typecheck`, `lint` e `git diff --check` passam ou tem
  bloqueio explicitamente documentado.
