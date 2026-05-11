# Plano de Implementação: [FEATURE]

**Branch**: `[###-nome-da-feature]` | **Data**: [DATE] | **Spec**: [link]
**Entrada**: Especificação da feature em `/specs/[###-feature-name]/spec.md`

**Observação**: Este template é preenchido pelo comando `/speckit.plan`. Use a
constituição do projeto, os seis canones executáveis em `docs-canonical/` e os
docs de governança/status da raiz antes de fechar qualquer decisão técnica.

## Resumo

[Extrair da spec: requisito principal + abordagem técnica derivada da pesquisa]

## Contexto Técnico

<!--
  AÇÃO NECESSÁRIA: Substitua o conteúdo desta seção por detalhes concretos.
  Planos do Echotes DEVEM explicitar o gestor de pacotes, a política de ambiente
  do Supabase e os invariantes do dia/timeline que impactam a implementação.
-->

**Idioma/Versão**: [ex.: TypeScript 5.x ou NEEDS CLARIFICATION]
**Dependências principais**: [ex.: Expo, Expo Router, Zustand, Supabase JS ou NEEDS CLARIFICATION]
**Gestor de pacotes**: [pnpm]
**Armazenamento**: [ex.: Supabase Postgres + persistência local de sessão ou NEEDS CLARIFICATION]
**Testes**: [ex.: Jest + React Native Testing Library + validação manual de cenários críticos ou NEEDS CLARIFICATION]
**Plataforma-alvo**: [ex.: iOS/Android via Expo ou NEEDS CLARIFICATION]
**Tipo de projeto**: [ex.: app mobile]
**Metas de performance**: [ex.: tela do dia utilizável em até 2 segundos em conectividade móvel comum]
**Restrições**: [ex.: sem service_role no cliente, preservar separação task/note, garantir invariantes temporais]
**Escala/Escopo**: [ex.: primeira fatia vertical autenticada da superfície do dia]

## Checagem da Constituição

*BLOQUEIO: deve passar antes da Fase 0 de pesquisa. Revalidar após a Fase 1 de desenho.*

- [ ] Os canones executáveis em `docs-canonical/` e os docs de governança/status da raiz foram revisados e citados quando originam decisões.
- [ ] A navegação centrada no dia e a timeline diária continuam como interação principal.
- [ ] Os comportamentos de tarefa e nota continuam distintos; nenhuma abstração enfraquece ghost cards ou ecos.
- [ ] Os invariantes temporais e cenários críticos têm cobertura explícita de verificação.
- [ ] `pnpm`, `.env.example`, as chaves públicas do cliente Supabase e a política de segredos do cliente foram respeitados.

## Estrutura do Projeto

### Documentação (desta feature)

```text
specs/[###-feature]/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
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
├── features/
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

**Decisão de estrutura**: manter um único app Expo com superfícies por rota em
`app/`, regras de domínio em `src/` e artefatos SQL/Supabase em `supabase/`.

## Rastreamento de Complexidade

Use esta tabela apenas quando a feature exigir uma exceção explícita à
constituição. Caso contrário, substitua o conteúdo por
`Nenhuma violação da constituição é esperada.`

| Violação | Por que é necessária | Alternativa mais simples rejeitada porque |
|----------|----------------------|-------------------------------------------|
| [ex.: adaptador temporário] | [necessidade atual] | [por que a rota canônica foi insuficiente] |
