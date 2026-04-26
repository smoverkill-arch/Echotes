# Canon Migration Coverage

## Status Legend

- `absorvida`
- `parcialmente absorvida`
- `ausente`

Este checklist acompanha a migracao real de `docs/` para os canones da raiz.
Todos os itens dos tres arquivos historicos estao marcados como `absorvida`.
`docs/` fica preservado como acervo historico. Itens absorvidos podem ainda
representar capacidade futura; nesse caso, o destino canonico tambem registra
que o baseline atual nao a entrega.

## `docs/echotes_domain_decisions_final.md`

| Secao original | Destino principal | Status | Nota |
|---|---|---|---|
| 1. Principios estruturais | `REQUIREMENTS.md`, `ARCHITECTURE.md` | absorvida | Verdades do produto e eixo temporal refletidos |
| 2. Dominio de tarefas | `REQUIREMENTS.md`, `DATA-MODEL.md`, `ARCHITECTURE.md` | absorvida | Regras de `source_day`, `target_day`, `scheduled_at`, ghost e exclusao refletidas |
| 3. Dominio de notas | `REQUIREMENTS.md`, `DATA-MODEL.md`, `ARCHITECTURE.md`, `CURRENT-STATE.md` | absorvida | Regras de eco, mencao e continuacao absorvidas; baseline atual registra que os fluxos completos ainda nao foram entregues |
| 4. Dominio da timeline e navegacao | `ARCHITECTURE.md`, `TEST-SPEC.md`, `KNOWN-GOTCHAS.md` | absorvida | Regras de eixo, ghost, breadcrumb, Reader/Editor e orientacao visual refletidas |
| 5. Modelagem recomendada de alto nivel | `DATA-MODEL.md`, `ARCHITECTURE.md` | absorvida | Separacao entre dominios refletida |
| 6. Linguagem de interface fechada | `REQUIREMENTS.md`, `CURRENT-STATE.md`, `ARCHITECTURE.md` | absorvida | Linguagem funcional do `+`, ghost, breadcrumb, tarefa, nota e timeline refletida |
| 7. Separacao conceitual final | `REQUIREMENTS.md`, `KNOWN-GOTCHAS.md` | absorvida | Distincao tarefa vs nota refletida |

## `docs/echotes_codex_mvp_technical_spec.md`

| Secao original | Destino principal | Status | Nota |
|---|---|---|---|
| 1. Objetivo | `README.md`, `CURRENT-STATE.md` | absorvida | Objetivo do baseline refletido |
| 2. Verdades centrais do produto | `REQUIREMENTS.md`, `ARCHITECTURE.md` | absorvida | Refletidas como verdades estruturais |
| 3. Regras fechadas - tarefas | `REQUIREMENTS.md`, `DATA-MODEL.md`, `ARCHITECTURE.md` | absorvida | |
| 4. Regras fechadas - notas | `REQUIREMENTS.md`, `ARCHITECTURE.md`, `CURRENT-STATE.md` | absorvida | Parte future-facing de ecos foi absorvida como canon; baseline atual explicita que ainda nao entrega todos os fluxos |
| 5. Arquitetura sugerida | `ARCHITECTURE.md`, `ROADMAP.md` | absorvida | Estrutura, boundaries, overlays e superficie sugerida refletidos |
| 6. Tipos de dominio | `DATA-MODEL.md` | absorvida | |
| 7. TimelineNode | `DATA-MODEL.md`, `ARCHITECTURE.md` | absorvida | |
| 8. Rotas | `ARCHITECTURE.md` | absorvida | |
| 9. Stores com Zustand | `ARCHITECTURE.md` | absorvida | |
| 10. Estrategia de dados | `ARCHITECTURE.md`, `DATA-MODEL.md` | absorvida | |
| 11. Algoritmo de derivacao da timeline | `ARCHITECTURE.md`, `TEST-SPEC.md` | absorvida | |
| 12. Criacao e edicao | `ARCHITECTURE.md`, `REQUIREMENTS.md`, `CURRENT-STATE.md` | absorvida | Tarefas, nota independente, ecos, mencoes e continuacao absorvidos; baseline entregue segue separado |
| 13. Reader e Editor | `ARCHITECTURE.md` | absorvida | |
| 14. Exclusao | `REQUIREMENTS.md`, `DATA-MODEL.md` | absorvida | |
| 15. Heranca de cor por tag | `DATA-MODEL.md`, `KNOWN-GOTCHAS.md` | absorvida | Regra de override persistente refletida |
| 16. Estados visuais minimos | `ARCHITECTURE.md`, `TEST-SPEC.md` | absorvida | |
| 17. Casos obrigatorios de teste | `TEST-SPEC.md` | absorvida | |
| 18. Criterios de aceite tecnicos | `REQUIREMENTS.md`, `TEST-SPEC.md` | absorvida | |
| 19. Ordem de implementacao sugerida | `ROADMAP.md`, historico de `specs/001-auth-day-surface/` | absorvida | Ordem historica preservada como orientacao, sem virar compromisso automatico |
| 20. Definicao final para o Codex | `AGENTS.md`, `ARCHITECTURE.md` | absorvida | |

## `docs/echotes_schema_types_zod_starter_pack.md`

| Secao original | Destino principal | Status | Nota |
|---|---|---|---|
| 1. Objetivo | `DATA-MODEL.md` | absorvida | |
| 2. Estrategia de modelagem | `DATA-MODEL.md` | absorvida | |
| 3. Supabase SQL - schema inicial | `DATA-MODEL.md`, `ENVIRONMENT.md`, `supabase/migrations/001_auth_day_surface.sql` | absorvida | Contrato refletido; SQL executavel vive na migration |
| 4. RLS sugerido | `DATA-MODEL.md`, `SECURITY.md`, `supabase/migrations/001_auth_day_surface.sql` | absorvida | Contrato de ownership e policies refletido; SQL executavel vive na migration |
| 5. Queries base do dia | `DATA-MODEL.md`, `ARCHITECTURE.md` | absorvida | |
| 6. Tipos TypeScript - dominio | `DATA-MODEL.md` | absorvida | |
| 7. Tipos TypeScript - timeline | `DATA-MODEL.md`, `ARCHITECTURE.md` | absorvida | |
| 8. Tipos TypeScript - formularios | `DATA-MODEL.md` | absorvida | |
| 9. Zod - utilitarios base | `DATA-MODEL.md` | absorvida | Contratos de data, hora e cor refletidos |
| 10. Zod - tag | `DATA-MODEL.md` | absorvida | Contrato de tag e cor refletido |
| 11. Zod - tarefa | `DATA-MODEL.md` | absorvida | |
| 12. Zod - nota | `DATA-MODEL.md` | absorvida | |
| 13. Zod - eco | `DATA-MODEL.md`, `CURRENT-STATE.md` | absorvida | Contrato refletido; baseline atual explicita que fluxos completos de eco seguem adiados |
| 14. Funcoes utilitarias | `DATA-MODEL.md`, `ARCHITECTURE.md` | absorvida | |
| 14.1 Helpers de calendario semanal | `ARCHITECTURE.md` | absorvida | |
| 15. Heranca de cor por tag | `DATA-MODEL.md`, `KNOWN-GOTCHAS.md` | absorvida | |
| 16. Derivacao da timeline | `ARCHITECTURE.md`, `TEST-SPEC.md` | absorvida | |
| 17. Continuacao de nota | `REQUIREMENTS.md`, `ARCHITECTURE.md`, `CURRENT-STATE.md` | absorvida | Canon absorvido; implementacao do baseline ainda nao cobre |
| 18. Mencao no conteudo | `REQUIREMENTS.md`, `ARCHITECTURE.md`, `CURRENT-STATE.md` | absorvida | Canon absorvido; implementacao do baseline ainda nao cobre |
| 19. Exclusao | `REQUIREMENTS.md`, `DATA-MODEL.md` | absorvida | |
| 20. Defaults sugeridos | `DATA-MODEL.md` | absorvida | |
| 21. Checklist inicial de implementacao | `DATA-MODEL.md`, `RUNBOOKS.md`, historico de `specs/001-auth-day-surface/` | absorvida | Mantido como checklist operacional e historico, nao como compromisso automatico |
| 22. Definicao final do starter pack | `DATA-MODEL.md`, `ARCHITECTURE.md` | absorvida | |

## Criterio de Fechamento da Migracao

A migracao material foi fechada em 2026-04-26 porque:

- todos os itens acima estao `absorvida`
- capacidades futuras foram absorvidas como canon sem serem confundidas com
  baseline entregue
- os docs da raiz agora sustentam planejamento, implementacao e auditoria sem
  depender materialmente dos tres arquivos antigos
