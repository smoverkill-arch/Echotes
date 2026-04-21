# Plano de Implementação: Superfície Diária Autenticada

**Branch**: `001-auth-day-surface` | **Data**: 2026-04-15 | **Spec**: [spec.md](./spec.md)  
**Entrada**: Especificação da feature em `/specs/001-auth-day-surface/spec.md`

**Observação**: Este plano está ancorado na constituição do Echotes e nos três
documentos canônicos em `/docs`.

## Resumo

Entregar a feature `001-auth-day-surface` em três histórias incrementais:
**US1** fecha autenticação e superfície protegida; **US2** fecha criação,
leitura e edição do mesmo dia; **US3** fecha projeção temporal com ghost card,
breadcrumb, retorno contextual e o eixo visual final da timeline. A abordagem
técnica usa um único app Expo com Supabase Auth/Postgres, separando claramente
o domínio de tarefas e notas enquanto deriva a timeline mista por nós
canônicos.

## Contexto Técnico

**Idioma/Versão**: TypeScript 5.x
**Dependências principais**: Expo, React Native, Expo Router, Zustand, Supabase JS, React Hook Form, Zod, Legend List
**Gestor de pacotes**: pnpm
**Armazenamento**: Supabase Postgres para dados do produto + Supabase Auth com persistência local de sessão no dispositivo
**Testes**: Jest com jest-expo, React Native Testing Library e validação manual dos cenários críticos da spec
**Plataforma-alvo**: iOS e Android via workflow gerenciado do Expo
**Tipo de projeto**: App mobile
**Metas de performance**: Restauração de sessão leva a pessoa de volta ao dia em até 2 segundos em abertura quente; timeline do dia permanece utilizável com scroll fluido para volume diário típico do MVP
**Restrições**: Sem `service_role` no cliente; exigir `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`; preservar a separação task/note; manter Reader e Editor como superfícies contextuais; impedir `scheduled_at <= created_at`
**Escala/Escopo**: Primeira fatia vertical autenticada do produto, cobrindo acesso de um usuário, tela do dia e dezenas de entradas por dia

## Checagem da Constituição

*BLOQUEIO: deve passar antes da Fase 0 de pesquisa. Revalidar após a Fase 1 de desenho.*

- [x] As fontes canônicas em `/docs` foram revisadas e citadas quando originam decisões.
- [x] A navegação centrada no dia e a timeline diária continuam como interação principal.
- [x] Os comportamentos de tarefa e nota continuam distintos; nenhuma abstração enfraquece ghost cards ou ecos.
- [x] Os invariantes temporais e cenários críticos têm cobertura explícita de verificação.
- [x] `pnpm`, `.env.example`, as chaves públicas do cliente Supabase e a política de segredos do cliente foram respeitados.

## Estrutura do Projeto

### Documentação (desta feature)

```text
specs/001-auth-day-surface/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── auth-session.md
│   └── day-surface.md
└── tasks.md
```

### Código-fonte (raiz do repositório)

```text
app/
├── _layout.tsx
├── index.tsx
├── (auth)/
│   ├── sign-in.tsx
│   └── sign-up.tsx
└── day/
    └── [date].tsx

src/
├── components/
│   ├── auth/
│   ├── day/
│   ├── reader/
│   └── timeline/
├── features/
│   ├── auth/
│   ├── day/
│   ├── notes/
│   ├── tasks/
│   └── timeline/
├── lib/
├── schemas/
├── stores/
├── types/
└── utils/

supabase/
└── migrations/

tests/
├── integration/
└── unit/
```

**Decisão de estrutura**: manter um único app Expo com grupos de rotas para
superfícies públicas e protegidas, concentrando regras de domínio em `src/` e
SQL/Supabase em `supabase/`.

## Resumo da Pesquisa da Fase 0

- Confirmar o uso de `pnpm` como gestor de pacotes padrão e alinhar o contexto do
  agente a essa convenção.
- Fechar a política de ambiente: `.env` local não versionado, `.env.example`
  versionado, apenas chaves públicas do Supabase no cliente.
- Adotar email + senha como método inicial de autenticação para reduzir
  complexidade de deep linking no primeiro corte.
- Priorizar uma entrega faseada: auth na US1, caso de mesmo dia na US2,
  projeção temporal e acabamento visual da timeline na US3, antes de recursos
  avançados como ecos, menções inline e calendário expandido.

## Estratégia de Entrega Faseada

- US1: fluxo público mínimo com cadastro, login, restauração de sessão,
  sign-out e guarda de rotas protegidas.
- US2: superfície do dia limitada ao subset same-day, com nota e tarefa do
  mesmo dia, marcador de criação + item agendado e Reader/Editor contextuais.
- US3: extensão da superfície do dia para tarefas futuras, ghost card,
  breadcrumb, navegação temporal e fechamento do eixo visual da timeline.
- O layout `note -> direita` e `task_* -> esquerda` é responsabilidade da
  camada de renderização em `timeline-view`/wrapper, não de schemas, stores ou
  `TimelineNode`.
- A validação operacional com Supabase real é pré-requisito para o smoke do
  frontend, especialmente a partir da US2.

## Rastreamento de Complexidade

Nenhuma violação da constituição é esperada.
