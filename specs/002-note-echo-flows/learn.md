# What I Learned: Phase 3 - Ecos de Nota

**Feature**: `002-note-echo-flows`
**Escopo**: Phase 3 - Historia do Usuario 1
**Gerado em**: 2026-05-09
**Status da implementacao**: Phase 3 com 13/13 tarefas concluidas; a feature completa ainda segue parcial

---

## Decisoes-Chave

### 1. Carregar relacoes no recorte do dia, buscar detalhes sob demanda

O dia carrega notas, tarefas e relacoes diretas de eco pelo fluxo de `useDayEntries`.
Depois que as notas do dia sao conhecidas, `listNoteEchoes(noteIds)` busca apenas as relacoes necessarias para aquele recorte.

Isso evita carregar a rede inteira de notas conectadas quando a Timeline so precisa saber se existe contagem direta. Os detalhes completos de notas conectadas ficam para o Reader, onde existe intencao explicita do usuario.

Alternativas recusadas nesta fase:

- carregar toda a rede conectada ao abrir o dia
- denormalizar um contador dentro da entidade `Note`
- abrir uma rota propria para a rede de notas

O ganho principal e manter a superficie diaria leve sem perder rastreabilidade entre notas.

### 2. Derivar `directEchoCount` em memoria, sem mudar o dominio de `Note`

A contagem direta de ecos e derivada em `countDirectEchoes` e entra na Timeline como dado de apresentacao. A entidade `Note` continua soberana: ela nao recebe `echo_count`, `source_day`, `target_day`, `ghost card` nem `side`.

Essa escolha protege o modelo contra campos que pertencem a uma tela especifica. A Timeline pode mostrar badge de eco, mas o dado persistido continua sendo a relacao em `note_echoes`.

Use esse padrao quando:

- o valor pode ser recalculado a partir de dados canonicos
- o campo so existe para renderizacao
- persistir o valor criaria risco de divergencia

### 3. Preservar relacao mesmo quando o detalhe falha

Uma nota conectada indisponivel nao e tratada como relacao inexistente. Quando `listRelatedNoteDetails` nao consegue carregar o detalhe, ela preserva a conexao e marca o item como `stale_detail` ou `transient_unavailable`.

No Reader, isso aparece como item indisponivel com acao de recarregar, em vez de apagar a evidencia de que a relacao existe.

Essa decisao evita uma falha sutil: transformar erro temporario de rede, RLS ou detalhe ausente em "Nenhuma nota conectada". Para o usuario, isso seria uma mentira operacional.

### 4. Navegar cross-day com `pendingReaderOpen` de consumo unico

Quando a nota conectada pertence a outro dia, a rota muda para `/day/<date>` e grava um `pendingReaderOpen` com `noteId`, `noteDay`, `actionOrigin`, `requestId` e `userId`.

A abertura do Reader so acontece quando:

- a sessao corresponde ao usuario esperado
- o dia da rota corresponde ao dia da nota
- as notas do dia ja foram carregadas
- a nota existe no recorte carregado

Depois disso, o pending e consumido. Esse desenho evita abrir Reader no dia errado, evita reaproveitar estado antigo e dispensa breadcrumb ou rota nova nesta fase.

### 5. Comandos de fases futuras so aparecem quando existem handlers reais

`Adicionar eco` e `Continuar desta nota` pertencem a historias posteriores. Na Phase 3, o Reader so deve expor esses comandos se receber `onAddEcho` ou `onContinueNote`.

Isso evita botoes com handlers vazios e preserva a fronteira da fase. Um comando visivel comunica comportamento entregue; se a fase ainda nao entrega o comportamento, o botao nao deve existir.

---

## Conceitos Aprendidos

### Derivacao vs. persistencia

Nem todo dado exibido precisa virar campo persistido. A contagem direta de ecos e um bom exemplo: ela nasce de `note_echoes`, entra como resumo para renderizacao e nao contamina a entidade `Note`.

### Degradacao honesta

Falha ao carregar detalhe nao deve apagar conhecimento ja confirmado. O sistema sabe que a relacao existe, entao mostra indisponibilidade e recarregamento em vez de esconder o item.

### Container com regra, componente com apresentacao

`app/day/[date].tsx` concentra decisao de navegacao, pending state e carregamento de detalhes. `NoteReader` recebe dados e callbacks opcionais, renderizando apenas o que esta disponivel.

Essa separacao deixa o componente mais testavel e reduz risco de regra de rota espalhada pela UI.

### Estado pendente com escopo forte

`pendingReaderOpen` nao e apenas "abrir nota depois". Ele carrega usuario, dia, origem e request id. Esse escopo impede que uma navegacao atrasada abra conteudo de outra sessao ou outro dia.

### Testes como contrato de fase

Os testes desta fase nao verificam so "renderizou". Eles protegem fronteiras:

- badge de `Ecos` aparece para contagem direta
- navegacao cross-day abre Reader apenas no destino correto
- item indisponivel preserva relacao e oferece recarregar
- comandos de fases futuras nao aparecem sem handlers reais

---

## Mapa Rapido da Implementacao

`useDayEntries` carrega as notas do dia e busca relacoes diretas.

`note-echo-relations.ts` transforma relacoes em contagem direta e notas relacionadas ordenadas.

`useDayTimeline` injeta `directEchoCounts` nos nodes da Timeline sem alterar o dominio de `Note`.

`NoteReader` mostra ecos, notas conectadas, estados indisponiveis e comandos opcionais.

`app/day/[date].tsx` decide se a nota conectada abre no mesmo dia ou se precisa navegar para outro dia com `pendingReaderOpen`.

`navigation-store.ts` guarda o pending de forma consumivel e escopada.

---

## Glossario

**Eco**: relacao direta entre notas.

**Contagem direta**: numero de relacoes imediatas de uma nota, sem contar grafo expandido.

**Nota conectada**: nota relacionada por eco e exibida no Reader.

**`stale_detail`**: relacao existe, mas o detalhe da nota nao esta acessivel ou nao foi retornado.

**`transient_unavailable`**: relacao existe, mas houve falha temporaria ao buscar detalhe.

**`pendingReaderOpen`**: estado temporario usado para abrir o Reader depois de navegar para o dia correto.

**Reader**: superficie de leitura da nota selecionada.

---

## Sugestao Para a Proxima Revisao

Na Phase 4, revise primeiro se os comandos de criar/remover eco substituem a opcionalidade dos handlers sem reintroduzir botoes sem comportamento real.

---

# What I Learned: Phase 5 - Continuar Desta Nota

**Feature**: `002-note-echo-flows`  
**Feature curta**: fluxos de eco de nota, incluindo continuacao guiada de nota conectada  
**Gerado em**: 2026-05-11  
**Escopo**: Phase 5 - Historia do Usuario 3  
**Status da implementacao**: Phase 5 com 10/10 tarefas concluidas; Phase 6 segue aberta

---

## Decisoes-Chave

### 1. RPC atomica em vez de duas escritas pelo cliente

**O que fizemos**: `supabase/migrations/004_note_echo_flows.sql` cria `public.continue_note`, que insere a nova nota e o `note_echo` `continue_note` na mesma funcao transacional.

**Por que**: a promessa principal da Phase 5 e nao deixar nota orfa quando a criacao do eco falha. Se o cliente fizesse `insert notes` e depois `insert note_echoes`, queda de rede, RLS ou erro no segundo passo poderia declarar um estado que o produto nao sabe reconciliar com seguranca.

**Alternativas consideradas**:
| Abordagem | Por que nao foi escolhida |
|----------|----------------------------|
| Duas chamadas Supabase do cliente | Abre janela real para sucesso parcial e nota sem eco. |
| Criar a nota otimisticamente e reparar depois | Complica recuperacao e pode duplicar nota se o usuario reenviar. |

**Quando escolher diferente**: duas chamadas podem bastar quando as escritas sao independentes e cada uma tem valor proprio. Aqui elas formam uma unica unidade de dominio: continuidade so existe se nota e eco nascerem juntos.

### 2. Trust boundary no servidor, nao no formulario

**O que fizemos**: a RPC usa `auth.uid()` server-side, `security definer`, `set search_path = public`, checa ownership da nota fonte e deriva `user_id`/`created_by_user_id` no banco.

**Por que**: o cliente pode sugerir titulo, dia e conteudo, mas nao pode provar ownership. Essa prova pertence ao servidor porque RLS, sessao e acesso real mudam entre abrir o draft e confirmar.

**Alternativas consideradas**:
| Abordagem | Por que nao foi escolhida |
|----------|----------------------------|
| Enviar `user_id` do cliente | Viola a fronteira de seguranca e reabre risco de spoofing. |
| Confiar apenas nas policies de insert | A funcao precisa encapsular duas escritas e ainda aplicar checks equivalentes antes de escrever. |

**Quando escolher diferente**: se a mutacao fosse um insert simples de uma linha ja coberto por policy direta, uma API cliente comum seria suficiente. Para operacao composta com atomicidade, a regra fica melhor no servidor.

### 3. Draft editavel antes de persistir

**O que fizemos**: `ContinueNoteEditor` prepara `title`, `newNoteDay`, `generatedBrief` e `content` em memoria, usando `buildContinueNoteBrief` como default deterministico.

**Por que**: a historia pede revisao antes de salvar. Persistir primeiro e editar depois criaria um estado intermediario real no banco para algo que ainda e intencao.

**Alternativas consideradas**:
| Abordagem | Por que nao foi escolhida |
|----------|----------------------------|
| Criar nota imediatamente ao clicar | Gera registros reais para drafts abandonados. |
| Exigir briefing manual sempre | Remove valor do fluxo guiado e aumenta friccao. |

**Quando escolher diferente**: persistencia imediata faz sentido quando cada rascunho ja e um artefato de produto, como documento salvo automaticamente. Aqui, o rascunho so vira dominio depois da confirmacao.

### 4. `newNoteDay` pertence a nota, nao a tarefa

**O que fizemos**: a continuacao grava o dia apenas em `notes.day`; testes garantem ausencia de `source_day`, `target_day`, `scheduled_at` e ghost card.

**Por que**: o Echotes ja tem semantica temporal forte para tarefas projetadas. Copiar essa linguagem para nota continuada quebraria a separacao canonica entre tarefa e nota.

**Alternativas consideradas**:
| Abordagem | Por que nao foi escolhida |
|----------|----------------------------|
| Reusar `target_day` para nota futura | Mistura nota com tarefa e sugere ghost card indevido. |
| Criar um subtipo de nota continuada | A spec define `continue_note` como proveniencia do eco, nao subtipo visivel de nota. |

**Quando escolher diferente**: se o produto criasse um dominio de "itens programados" que unificasse nota e tarefa, os campos poderiam convergir. O canon atual diz o oposto: nota pertence a um dia, tarefa pode projetar.

### 5. Pending Reader como reconciliacao pos-commit

**O que fizemos**: depois de sucesso da RPC, `app/day/[date].tsx` grava `pendingReaderOpen` com `noteId`, `noteDay`, `requestId`, usuario e origem `continue_note_created`; o Reader so abre quando rota, sessao e nota carregada conferem.

**Por que**: a persistencia pode terminar antes da UI carregar o dia correto. O pending evita abrir Reader no dia errado e evita perder a intencao de abertura durante navegacao cross-day.

**Alternativas consideradas**:
| Abordagem | Por que nao foi escolhida |
|----------|----------------------------|
| Abrir Reader imediatamente apos a RPC | A nota pode ainda nao estar no recorte carregado. |
| Navegar sem pending e esperar o usuario encontrar a nota | Perde o fechamento natural do fluxo. |

**Quando escolher diferente**: para navegacao simples dentro da mesma lista ja carregada, abrir direto e suficiente. Quando ha reload/rota/sessao no meio, estado pendente escopado e mais robusto.

### 6. Testes como prova de invariantes, nao so de UI feliz

**O que fizemos**: a Phase 5 adiciona contrato SQL, teste unitario da API, fluxo de integracao same-day/future-day e regressao de timeline para nota continuada.

**Por que**: o risco principal nao era renderizar um modal; era quebrar atomicidade, trust boundary ou separacao nota/tarefa. Por isso os testes inspecionam payload, ausencia de campos de tarefa, consumo unico do pending e ausencia de `service_role`.

**Alternativas consideradas**:
| Abordagem | Por que nao foi escolhida |
|----------|----------------------------|
| Testar apenas o clique no botao | Nao prova atomicidade nem rota correta. |
| Depender apenas de DocGuard | Guard valida estrutura documental, nao comportamento de runtime. |

**Quando escolher diferente**: para mudanca visual isolada, snapshot ou teste de renderizacao pode bastar. Para fluxo que cruza banco, rota e store, teste precisa provar contrato.

---

## Conceitos Aprendidos

### Atomicidade de dominio

**O que e**: duas escritas devem ser tratadas como uma so operacao quando o dominio nao aceita uma sem a outra.

**Onde usamos**: `public.continue_note` cria `notes` e `note_echoes` junto.

**Por que importa**: sem atomicidade, erro parcial vira dado mentiroso: uma nota que parece continuacao na UI, mas nao tem eco persistido.

### Trust boundary

**O que e**: a divisao entre dados que o cliente pode fornecer e fatos que so o servidor pode garantir.

**Onde usamos**: `continueNote` envia `source_note_id`, `new_note_day`, titulo, brief e conteudo; a RPC deriva dono e valida acesso via `auth.uid()`.

**Por que importa**: sem essa fronteira, um payload de cliente poderia simular ownership ou criar relacao com nota inacessivel.

### Draft antes de commit

**O que e**: manter dados em memoria enquanto a pessoa ainda esta decidindo, e persistir apenas no momento de confirmacao.

**Onde usamos**: `ContinueNoteEditor` prepara a continuidade e chama `onSubmit` apenas no botao final.

**Por que importa**: evita lixo no banco e reduz necessidade de jobs de limpeza ou estados "rascunho abandonado".

### Reconciliacao por chave autoritativa

**O que e**: depois de uma mutacao persistida, a UI nao confia em posicao visual ou estado antigo; ela reabre o item usando `id` e `day` retornados pelo servidor.

**Onde usamos**: `pendingReaderOpen` abre a nota criada somente quando `note.id` e `note.day` conferem no dia carregado.

**Por que importa**: protege contra race de navegacao, reload atrasado e abertura em sessao errada.

### Invariante negativo

**O que e**: testar que algo nao aconteceu e tao importante quanto testar que algo aconteceu.

**Onde usamos**: `continue-note.test.ts` e `derive-timeline-nodes-regression.test.ts` verificam ausencia de `source_day`, `target_day`, `scheduled_at`, ghost card e `service_role`.

**Por que importa**: features novas frequentemente quebram dominio copiando conceitos parecidos do lugar errado.

---

## Architecture Overview

A Phase 5 ficou em quatro camadas. O editor monta um draft local; a API `continueNote` valida e chama a RPC; a RPC faz a escrita atomica e server-derived; o route container reconcilia o resultado com reload/navegacao e `pendingReaderOpen`. O Reader e o DayShell continuam componentes de apresentacao, recebendo callbacks e estados sem carregar regra de banco.

```text
NoteReader -> ContinueNoteEditor -> continueNote API -> public.continue_note RPC
                                      |
                                      v
                            newNote + noteEcho
                                      |
                                      v
                     app/day/[date].tsx reload/navigate/pending open
```

---

## Glossario

| Termo | Significado |
|------|-------------|
| RPC | Funcao chamada no banco como uma API, usada aqui para encapsular a transacao. |
| `security definer` | Modo de funcao Postgres que executa com privilegios do dono da funcao, exigindo checks explicitos no corpo. |
| `search_path` | Caminho de schemas que o Postgres usa para resolver nomes; fixar isso reduz risco de execucao ambigua. |
| `newNoteDay` | Dia escolhido para a nova nota continuada; vira apenas `notes.day`. |
| `context_day` | Proveniencia da acao de eco; nao define rota nem dia da nota criada. |
| `pendingReaderOpen` | Estado temporario para abrir Reader depois que a nota certa estiver carregada no dia certo. |

---

## Sugestao Para a Proxima Revisao

Na Phase 6, foque em rastreabilidade: transformar os `@req` em tags feature-scoped, atualizar canon completo de raiz e registrar evidencia de fechamento sem tratar DocGuard verde como prova unica de alinhamento semantico.
