# Plano de Implementacao: Fluxos de Eco de Nota

**Branch**: `002-note-echo-flows` | **Data**: 2026-05-01 | **Spec**: [spec.md](./spec.md)
**Entrada**: Especificacao da feature em `/specs/002-note-echo-flows/spec.md`

**Observacao**: Este plano parte da constituicao do Echotes e dos canones
vigentes da raiz, em especial `REQUIREMENTS.md`, `ARCHITECTURE.md`,
`DATA-MODEL.md`, `TEST-SPEC.md`, `CURRENT-STATE.md`, `ROADMAP.md`,
`SECURITY.md` e `ENVIRONMENT.md`.

## Resumo / Summary

Entregar a feature `002-note-echo-flows` em tres historias incrementais:
**US1** ativa contagem direta de ecos na timeline e Reader com notas
conectadas; **US2** fecha a criacao manual de eco, o bloqueio de duplicidade
com feedback claro e a remocao explicita entre notas existentes; **US3** fecha
`Continuar desta nota` como criacao guiada de nova nota conectada. A abordagem
tecnica preserva o app Expo unico, ativa `note_echoes` na leitura do dia,
mantem os detalhes relacionais apenas nas superficies de nota, preserva a
estrategia atual de navegacao centrada no dia e evita introduzir ghost card,
`source_day` ou `target_day` no dominio de notas.

## Contexto Tecnico / Technical Context

**Idioma/Versao**: TypeScript 5.x
**Dependencias principais**: Expo 54, React 19, React Native 0.81, Expo Router 6, Zustand 5, Supabase JS 2, Zod 4, Jest com React Native Testing Library
**Gestor de pacotes**: pnpm
**Armazenamento**: Supabase Postgres para `notes` e `note_echoes` + persistencia local de sessao ja existente
**Testes**: Jest com jest-expo, React Native Testing Library, suites unitarias em `tests/unit/day/`, `tests/unit/notes/`, `tests/unit/schemas/` e suites de integracao em `tests/integration/day/`
**Plataforma-alvo**: iOS e Android via workflow gerenciado do Expo
**Tipo de projeto**: App mobile
**Metas de performance**: a superficie do dia continua utilizavel em ate 2 segundos em abertura quente; a contagem de ecos deve aparecer junto com a carga normal do dia; abrir uma nota conectada em outro dia deve concluir a transicao e reexibir o Reader em ate 1 segundo apos o carregamento do dia de destino
**Restricoes**: sem `service_role` no cliente; preservar separacao task/note; manter ghost card exclusivo de tarefa; mostrar apenas contagem direta na timeline; preservar a estrategia atual de navegacao sem breadcrumb novo; manter mencoes inline `@nota` fora do corte; nao introduzir nova migration de schema para ativar a feature
**Escala/Escopo**: experiencia autenticada de um usuario com historico pessoal de notas ao longo de varios dias, cobrindo leitura, conexao manual e continuacao de ideia

## Checagem da Constituicao

*BLOQUEIO: deve passar antes da Fase 0 de pesquisa. Revalidar apos a Fase 1 de desenho.*

- [x] Os canones vigentes da raiz foram revisados e citados quando originam decisoes.
- [x] A navegacao centrada no dia e a timeline diaria continuam como interacao principal.
- [x] Os comportamentos de tarefa e nota continuam distintos; nenhuma abstracao enfraquece ghost cards ou ecos.
- [x] Os invariantes temporais e cenarios criticos tem cobertura explicita de verificacao.
- [x] `pnpm`, `.env.example`, as chaves publicas do cliente Supabase e a politica de segredos do cliente foram respeitados.

## Estrutura do Projeto / Project Structure

### Documentacao (desta feature)

```text
specs/002-note-echo-flows/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── continue-note.md
│   └── note-relations.md
└── tasks.md
```

### Codigo-fonte (raiz do repositorio)

```text
app/
└── day/
    └── [date].tsx

src/
├── components/
│   ├── cards/
│   ├── day/
│   ├── forms/
│   ├── reader/
│   └── timeline/
├── features/
│   ├── day/
│   └── notes/
├── schemas/
├── stores/
├── types/
└── utils/

tests/
├── integration/
│   └── day/
└── unit/
    ├── day/
    ├── notes/
    ├── schemas/
    └── timeline/
```

**Decisao de estrutura**: manter um unico app Expo e estender o fluxo atual do
dia; `useDayEntries` continua sendo a porta de leitura do recorte diario,
enquanto as regras de eco e continuacao permanecem no dominio de notas em
`src/features/notes/`.

## Resumo da Pesquisa da Fase 0

- Ativar `note_echoes` no carregamento do dia, em vez de criar coluna
  denormalizada de contagem em `notes`.
- Hidratar detalhes de notas conectadas fora do dia atual apenas quando o
  Reader precisar delas, em lote por conjunto distinto de `note_id`, para nao
  ampliar a carga inicial da timeline nem cair em N+1.
- Tratar a navegacao para nota conectada de outro dia reutilizando `readerState`
  e a troca de rota para `/day/[date]`, sem criar breadcrumb temporal novo nem
  degradar a estrategia atual.
- Implementar `Adicionar eco` com seletor dedicado de notas existentes, ordenado
  das mais recentes para as mais antigas, sem busca textual neste corte.
- Ordenar notas conectadas no Reader com notas do mesmo dia primeiro e, dentro
  de cada grupo, da mais recente para a mais antiga.
- Implementar remocao explicita de eco no fluxo contextual de nota, apagando
  apenas a relacao selecionada.
- Implementar `Continuar desta nota` como fluxo de criacao guiada: preparar um
  draft editavel, persistir a nova nota e criar o eco `continue_note` na mesma
  confirmacao.
- Tratar duplicidade de eco como no-op com feedback `Eco ja existe`,
  preservando a relacao existente e o `kind` original como proveniencia
  inicial.
- Tratar `manual_link` e `continue_note` como proveniencias internas da mesma
  relacao `Eco`, sem diferenciar subtipos na UI.

## Estrategia de Entrega Faseada

- **US1 - Continuidade visivel**: carregar ecos do dia, derivar contagem
  direta, exibir badge `Ecos` no card de nota, mostrar conexoes diretas no
  Reader e permitir abrir nota conectada de outro dia.
- **US2 - Gerenciar ecos existentes**: adicionar acao `Adicionar eco` no
  Reader, abrir seletor de notas candidatas, criar eco `manual_link`, impedir
  repeticao com feedback `Eco ja existe`, permitir remover eco direto e
  recarregar o dia para atualizar contagem/relacoes sem duplicar pares.
- **US3 - Continuar desta nota**: abrir fluxo guiado de continuacao com dia
  editavel, `title` pre-preenchido, `brief` inicial automatico, persistir a
  nova nota e abrir o Reader da nota criada no dia correto.
- O layout `note -> direita` permanece responsabilidade da renderizacao; a
  feature adiciona badge e relacoes sem alterar `TimelineNode`.
- Nenhuma migration nova e esperada; a entrega usa `note_echoes` e RLS ja
  presentes no baseline.

## Cobertura Minima Obrigatoria

- Duplicidade invertida do mesmo par (`A-B` versus `B-A`) deve preservar uma
  unica relacao semantica.
- Reabertura do Reader apos navegacao para outro dia deve permanecer coberta
  como regressao obrigatoria.
- Falha parcial em `Continuar desta nota` nao pode resultar em sucesso
  silencioso sem relacao visivel entre origem e destino.
- Remocao de eco deve apagar apenas a relacao selecionada, preservando ambas as
  notas.

## Revalidacao da Constituicao apos o Desenho

- [x] A feature continua ancorada na superficie do dia e nao cria modulo
  paralelo de grafo ou mapa.
- [x] Ecos continuam exclusivos de notas; nenhuma regra de tarefa foi copiada
  para o dominio de notas.
- [x] O desenho preserva o banco publico e nao introduz segredo novo no
  cliente.
- [x] Os cenarios criticos de leitura, conexao manual, idempotencia e
  continuacao estao explicitados para testes.
- [x] O corte declara com clareza o que fica adiado: mencoes inline `@nota` e
  visualizacao em rede.

## Rastreamento de Complexidade

Nenhuma violacao da constituicao e esperada.
