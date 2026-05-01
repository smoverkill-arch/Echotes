<!--
Relatório de sincronização
Mudança de versão: 1.0.0 -> 2.0.0
Princípios modificados:
- I. Domínio Canônico Primeiro: fonte vigente agora é o canon da raiz; docs/ é acervo histórico
- Governança: checagem de conformidade passa a citar canon da raiz, não /docs como autoridade
Seções adicionadas:
- Nenhuma
Seções removidas:
- Nenhuma
Templates que exigiram atualização:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
Textos de apoio:
- ✅ CHANGELOG.md
- ✅ AGENTS.md, README.md e CURRENT-STATE.md verificados sem patch
Pendências:
- Nenhuma
-->
# Constituição do Echotes

## Princípios Centrais

### I. Domínio Canônico Primeiro
Todo trabalho de produto, design, engenharia e planejamento DEVE partir dos
documentos canônicos vigentes na raiz do repositório, depois desta
constituição. As decisões materialmente absorvidas em `README.md`,
`ARCHITECTURE.md`, `DATA-MODEL.md`, `SECURITY.md`, `TEST-SPEC.md`,
`ENVIRONMENT.md`, `REQUIREMENTS.md`, `CURRENT-STATE.md`, `ROADMAP.md`,
`DEPLOYMENT.md`, `RUNBOOKS.md`, `TROUBLESHOOTING.md`, `KNOWN-GOTCHAS.md`,
`CHANGELOG.md`, `DRIFT-LOG.md` e `CANON-MIGRATION-COVERAGE.md` não podem ser
reabertas localmente por conveniência de implementação. `docs/` permanece como
acervo histórico; contradições entre `docs/` e a raiz DEVEM ser tratadas como
achado de auditoria documental, não como autoridade automática.

Justificativa: o Echotes depende de um domínio não trivial, com regras
temporais e conceituais que se degradam rapidamente quando cada camada improvisa
sua própria interpretação. A raiz é o ponto vigente de consolidação do canon,
enquanto `docs/` preserva proveniência histórica.

### II. Integridade do Produto Centrado no Dia
O dia DEVE ser tratado como unidade principal do produto. Cada feature que toca
navegação, leitura, criação ou visualização de dados DEVE preservar a página do
dia como superfície soberana e a timeline mista como eixo principal. O sistema
DEVE manter a sensação de avançar pelo dia, usando posições intradiárias
derivadas do horário apropriado em vez de reordenar a experiência por critérios
secundários.

Justificativa: o valor central do Echotes é organizar continuidade e ação
dentro do contexto diário, não por módulos isolados.

### III. Separação entre Tarefas e Notas
Tarefas e notas DEVEM permanecer separadas em modelagem, comportamento e
linguagem de interface, mesmo quando compartilham a mesma timeline. Tarefas
tratam ação e projeção temporal; notas tratam registro e continuidade
conceitual. Ghost cards DEVEM ser exclusivos de tarefas. Ecos DEVEM ser
exclusivos de notas. Nenhuma abstração técnica pode diluir essa distinção se
isso reduzir a clareza do domínio.

Justificativa: a coexistência entre nota e tarefa é estrutural ao produto, mas
a lógica que sustenta cada uma é deliberadamente diferente.

### IV. Segurança Temporal e Cobertura Crítica
Toda mudança que toque regras temporais, autenticação, derivação da timeline,
renderização de ghost cards, superfícies de Reader/Editor ou persistência de
notas e tarefas DEVE vir acompanhada de cobertura de cenários críticos
proporcional ao risco. O sistema DEVE impedir representações temporais
inválidas, incluindo `scheduled_at <= created_at`, agendamento no passado e
derivações incompatíveis com `source_day`, `target_day` e `created_at`.

Justificativa: o produto depende de confiança temporal. Um erro pequeno nessa
área rompe diretamente a experiência central do usuário.

### V. Disciplina de Entrega com Expo + Supabase
O MVP DEVE ser planejado e implementado com Expo, React Native, TypeScript,
Expo Router, Zustand, Supabase JS, React Hook Form, Zod e Legend List, salvo
emenda explícita desta constituição. `pnpm` DEVE ser o gestor de pacotes
padrão. Segredos DEVEM permanecer fora do repositório; apenas `.env.example`
pode ser versionado. O app cliente DEVE usar apenas
`EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`; `service_role`
NÃO DEVE aparecer no cliente.

Justificativa: a stack já foi fechada para acelerar a execução do MVP e evitar
divergência operacional entre planejamento e implementação.

## Guardrails do Produto

- O primeiro corte de cada feature DEVE ser uma fatia vertical validável de
  ponta a ponta, não uma coleção de infraestrutura desconectada.
- A linguagem de interface DEVE preservar os termos canônicos do produto:
  `Criar nota`, `Adicionar eco`, `Continuar desta nota`, `Criar tarefa`, `Ecos`
  e `ghost card`.
- Specs e planos DEVEM declarar explicitamente o que está fora do corte quando
  uma capability canônica for adiada, para evitar falsa sensação de cobertura.
- O calendário e o contexto do dia DEVEM distinguir claramente o dia real do
  relógio e o dia selecionado pelo usuário quando a feature tocar navegação
  temporal.

## Fluxo de Entrega

- O fluxo padrão de planejamento DEVE seguir `constitution -> specify -> plan ->
  tasks -> implement`.
- Toda feature DEVE nascer em branch numerada do Spec Kit e ter seu diretório
  persistido em `.specify/feature.json`.
- `spec.md` DEVE focar em comportamento e valor ao usuário; `plan.md` DEVE
  traduzir o corte para implementação técnica sem contradizer os canones da
  raiz.
- Antes de iniciar implementação, o plano DEVE fechar: contratos essenciais,
  estratégia de dados, variáveis de ambiente, critérios de aceite e cenários de
  verificação.
- Mudanças que alterem convenções globais do projeto DEVEM atualizar templates,
  README e arquivos de contexto do agente na mesma rodada.

## Governança

Esta constituição prevalece sobre hábitos locais, prompts temporários e atalhos
de implementação. Emendas DEVEM documentar o motivo da mudança, os artefatos
impactados e o tipo de incremento de versão:

- MAJOR: remoção ou redefinição incompatível de princípios ou guardrails.
- MINOR: adição material de princípio, seção ou restrição nova.
- PATCH: clarificações editoriais sem mudança de direção.

Toda revisão de spec, plan, tasks ou código DEVE checar conformidade com:

- aderência à constituição e aos canones vigentes da raiz;
- preservação de `docs/` como acervo histórico, sem reabrir decisões absorvidas
  sem decisão explícita;
- preservação do modelo diário e da separação entre notas e tarefas;
- cobertura dos cenários críticos exigidos pela mudança;
- respeito às convenções de `pnpm`, `.env.example` e Supabase público no
  cliente.

Não há placeholders em aberto nesta versão. Quando um artefato violar esta
constituição, o trabalho DEVE parar para correção ou emenda explícita.

**Versão**: 2.0.0 | **Ratificada em**: 2026-04-15 | **Última emenda**: 2026-04-30
