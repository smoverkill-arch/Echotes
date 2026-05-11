# Canon Migration Coverage

## Status Legend

- `absorvida`
- `parcialmente absorvida`
- `ausente`

Este checklist acompanha a migracao real de `docs/` para os canones vigentes.
Os seis canones executaveis vivem em `docs-canonical/`; a raiz guarda
governanca, status, operacao e historico. Todos os itens dos tres arquivos
historicos estao marcados como `absorvida`. `docs/` fica preservado como acervo
historico. Itens absorvidos podem ainda representar capacidade futura; nesse
caso, o destino canonico tambem registra que o baseline atual nao a entrega.

## `docs/echotes_domain_decisions_final.md`

| Secao original | Destino principal | Status | Nota |
|---|---|---|---|
| 1. Principios estruturais | `docs-canonical/REQUIREMENTS.md`, `docs-canonical/ARCHITECTURE.md` | absorvida | Verdades do produto e eixo temporal refletidos |
| 2. Dominio de tarefas | `docs-canonical/REQUIREMENTS.md`, `docs-canonical/DATA-MODEL.md`, `docs-canonical/ARCHITECTURE.md` | absorvida | Regras de `source_day`, `target_day`, `scheduled_at`, ghost e exclusao refletidas |
| 3. Dominio de notas | `docs-canonical/REQUIREMENTS.md`, `docs-canonical/DATA-MODEL.md`, `docs-canonical/ARCHITECTURE.md`, `CURRENT-STATE.md` | absorvida | Regras de eco, mencao e continuacao absorvidas; baseline atual registra que os fluxos completos ainda nao foram entregues |
| 4. Dominio da timeline e navegacao | `docs-canonical/ARCHITECTURE.md`, `docs-canonical/TEST-SPEC.md`, `KNOWN-GOTCHAS.md` | absorvida | Regras de eixo, ghost, breadcrumb, Reader/Editor e orientacao visual refletidas |
| 5. Modelagem recomendada de alto nivel | `docs-canonical/DATA-MODEL.md`, `docs-canonical/ARCHITECTURE.md` | absorvida | Separacao entre dominios refletida |
| 6. Linguagem de interface fechada | `docs-canonical/REQUIREMENTS.md`, `CURRENT-STATE.md`, `docs-canonical/ARCHITECTURE.md` | absorvida | Linguagem funcional do `+`, ghost, breadcrumb, tarefa, nota e timeline refletida |
| 7. Separacao conceitual final | `docs-canonical/REQUIREMENTS.md`, `KNOWN-GOTCHAS.md` | absorvida | Distincao tarefa vs nota refletida |

## `docs/echotes_codex_mvp_technical_spec.md`

| Secao original | Destino principal | Status | Nota |
|---|---|---|---|
| 1. Objetivo | `README.md`, `CURRENT-STATE.md` | absorvida | Objetivo do baseline refletido |
| 2. Verdades centrais do produto | `docs-canonical/REQUIREMENTS.md`, `docs-canonical/ARCHITECTURE.md` | absorvida | Refletidas como verdades estruturais |
| 3. Regras fechadas - tarefas | `docs-canonical/REQUIREMENTS.md`, `docs-canonical/DATA-MODEL.md`, `docs-canonical/ARCHITECTURE.md` | absorvida | |
| 4. Regras fechadas - notas | `docs-canonical/REQUIREMENTS.md`, `docs-canonical/ARCHITECTURE.md`, `CURRENT-STATE.md` | absorvida | Parte future-facing de ecos foi absorvida como canon; baseline atual explicita que ainda nao entrega todos os fluxos |
| 5. Arquitetura sugerida | `docs-canonical/ARCHITECTURE.md`, `ROADMAP.md` | absorvida | Estrutura, boundaries, overlays e superficie sugerida refletidos |
| 6. Tipos de dominio | `docs-canonical/DATA-MODEL.md` | absorvida | |
| 7. TimelineNode | `docs-canonical/DATA-MODEL.md`, `docs-canonical/ARCHITECTURE.md` | absorvida | |
| 8. Rotas | `docs-canonical/ARCHITECTURE.md` | absorvida | |
| 9. Stores com Zustand | `docs-canonical/ARCHITECTURE.md` | absorvida | |
| 10. Estrategia de dados | `docs-canonical/ARCHITECTURE.md`, `docs-canonical/DATA-MODEL.md` | absorvida | |
| 11. Algoritmo de derivacao da timeline | `docs-canonical/ARCHITECTURE.md`, `docs-canonical/TEST-SPEC.md` | absorvida | |
| 12. Criacao e edicao | `docs-canonical/ARCHITECTURE.md`, `docs-canonical/REQUIREMENTS.md`, `CURRENT-STATE.md` | absorvida | Tarefas, nota independente, ecos, mencoes e continuacao absorvidos; baseline entregue segue separado |
| 13. Reader e Editor | `docs-canonical/ARCHITECTURE.md` | absorvida | |
| 14. Exclusao | `docs-canonical/REQUIREMENTS.md`, `docs-canonical/DATA-MODEL.md` | absorvida | |
| 15. Heranca de cor por tag | `docs-canonical/DATA-MODEL.md`, `KNOWN-GOTCHAS.md` | absorvida | Regra de override persistente refletida |
| 16. Estados visuais minimos | `docs-canonical/ARCHITECTURE.md`, `docs-canonical/TEST-SPEC.md` | absorvida | |
| 17. Casos obrigatorios de teste | `docs-canonical/TEST-SPEC.md` | absorvida | |
| 18. Criterios de aceite tecnicos | `docs-canonical/REQUIREMENTS.md`, `docs-canonical/TEST-SPEC.md` | absorvida | |
| 19. Ordem de implementacao sugerida | `ROADMAP.md`, historico de `specs/001-auth-day-surface/` | absorvida | Ordem historica preservada como orientacao, sem virar compromisso automatico |
| 20. Definicao final para o Codex | `AGENTS.md`, `docs-canonical/ARCHITECTURE.md` | absorvida | |

## `docs/echotes_schema_types_zod_starter_pack.md`

| Secao original | Destino principal | Status | Nota |
|---|---|---|---|
| 1. Objetivo | `docs-canonical/DATA-MODEL.md` | absorvida | |
| 2. Estrategia de modelagem | `docs-canonical/DATA-MODEL.md` | absorvida | |
| 3. Supabase SQL - schema inicial | `docs-canonical/DATA-MODEL.md`, `docs-canonical/ENVIRONMENT.md`, `supabase/migrations/001_auth_day_surface.sql` | absorvida | Contrato refletido; SQL executavel vive na migration |
| 4. RLS sugerido | `docs-canonical/DATA-MODEL.md`, `docs-canonical/SECURITY.md`, `supabase/migrations/001_auth_day_surface.sql` | absorvida | Contrato de ownership e policies refletido; SQL executavel vive na migration |
| 5. Queries base do dia | `docs-canonical/DATA-MODEL.md`, `docs-canonical/ARCHITECTURE.md` | absorvida | |
| 6. Tipos TypeScript - dominio | `docs-canonical/DATA-MODEL.md` | absorvida | |
| 7. Tipos TypeScript - timeline | `docs-canonical/DATA-MODEL.md`, `docs-canonical/ARCHITECTURE.md` | absorvida | |
| 8. Tipos TypeScript - formularios | `docs-canonical/DATA-MODEL.md` | absorvida | |
| 9. Zod - utilitarios base | `docs-canonical/DATA-MODEL.md` | absorvida | Contratos de data, hora e cor refletidos |
| 10. Zod - tag | `docs-canonical/DATA-MODEL.md` | absorvida | Contrato de tag e cor refletido |
| 11. Zod - tarefa | `docs-canonical/DATA-MODEL.md` | absorvida | |
| 12. Zod - nota | `docs-canonical/DATA-MODEL.md` | absorvida | |
| 13. Zod - eco | `docs-canonical/DATA-MODEL.md`, `CURRENT-STATE.md` | absorvida | Contrato refletido; `002-note-echo-flows` registra os fluxos de eco entregues |
| 14. Funcoes utilitarias | `docs-canonical/DATA-MODEL.md`, `docs-canonical/ARCHITECTURE.md` | absorvida | |
| 14.1 Helpers de calendario semanal | `docs-canonical/ARCHITECTURE.md` | absorvida | |
| 15. Heranca de cor por tag | `docs-canonical/DATA-MODEL.md`, `KNOWN-GOTCHAS.md` | absorvida | |
| 16. Derivacao da timeline | `docs-canonical/ARCHITECTURE.md`, `docs-canonical/TEST-SPEC.md` | absorvida | |
| 17. Continuacao de nota | `docs-canonical/REQUIREMENTS.md`, `docs-canonical/ARCHITECTURE.md`, `CURRENT-STATE.md` | absorvida | Canon absorvido; `002-note-echo-flows` registra `continue_note` entregue |
| 18. Mencao no conteudo | `docs-canonical/REQUIREMENTS.md`, `docs-canonical/ARCHITECTURE.md`, `CURRENT-STATE.md` | absorvida | Canon absorvido; implementacao do baseline ainda nao cobre |
| 19. Exclusao | `docs-canonical/REQUIREMENTS.md`, `docs-canonical/DATA-MODEL.md` | absorvida | |
| 20. Defaults sugeridos | `docs-canonical/DATA-MODEL.md` | absorvida | |
| 21. Checklist inicial de implementacao | `docs-canonical/DATA-MODEL.md`, `RUNBOOKS.md`, historico de `specs/001-auth-day-surface/` | absorvida | Mantido como checklist operacional e historico, nao como compromisso automatico |
| 22. Definicao final do starter pack | `docs-canonical/DATA-MODEL.md`, `docs-canonical/ARCHITECTURE.md` | absorvida | |

## Criterio de Fechamento da Migracao

A migracao material foi fechada em 2026-04-26 porque:

- todos os itens acima estao `absorvida`
- capacidades futuras foram absorvidas como canon sem serem confundidas com
  baseline entregue
- os seis canones executaveis em `docs-canonical/` e os docs de governanca da
  raiz agora sustentam planejamento, implementacao e auditoria sem depender
  materialmente dos tres arquivos antigos
