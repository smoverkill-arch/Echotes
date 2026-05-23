# Changelog

All notable changes to this project will be documented in this file.

The format follows Keep a Changelog and the project uses semantic versioning for
versioned releases when they start to exist.

## [Unreleased]

### Added — Frente A: Design System Foundation (UI/UX Upgrade)

- **`src/theme/tokens.ts`**: expansão completa do sistema de design tokens.
  Adicionados `colorsDark` (paleta dark mode Editorial Orgânica completa),
  `fontFamily` (Lora serif + Inter sans-serif), `shadow` (sm/md/lg),
  `lineHeight`, `letterSpacing`, `radius.xl/xxl`, `spacing.xxxl` e tokens
  semânticos faltantes: `noteBorder`, `taskBorder`, `taskTimed*`, `taskGhost*`,
  `dangerBorder`, `overlay`.

- **`app/_layout.tsx`**: carregamento de fontes customizadas via `useFonts`.
  Fontes registradas: `Lora_600SemiBold`, `Lora_700Bold`, `Inter_400Regular`,
  `Inter_500Medium`, `Inter_600SemiBold`, `Inter_700Bold`, `Inter_800ExtraBold`.
  `SplashScreen.preventAutoHideAsync()` mantém splash visível até fontes prontas.

- **`package.json`**: dependências adicionadas — `expo-font ~14.0.0`,
  `expo-splash-screen ~0.29.0`, `@expo-google-fonts/lora ^0.3.0`,
  `@expo-google-fonts/inter ^0.3.0`. Executar `corepack pnpm install`.

### Changed — Frente A: Design System Foundation (UI/UX Upgrade)

- **`src/components/cards/task-card-real.tsx`**: migrado de hardcodes para
  tokens (`colors.taskBorder`, `colors.taskSoft`, `fontFamily`, `shadow.sm`,
  `radius.xl`, `lineHeight`, `letterSpacing`). Copy corrigido: "Sem horário
  agendado".

- **`src/components/cards/task-card-timed.tsx`**: migrado para tokens
  `taskTimedBorder`, `taskTimedSoft`, `taskTimed`. Copy corrigido: "Horário:
  HH:MM".

- **`src/components/cards/task-card-ghost.tsx`**: migrado para tokens
  `taskGhostBorder`, `taskGhostSoft`, `taskGhost`. Eyebrow corrigido de **"Ghost
  card"** para **"Projetada"** (terminologia interna removida). Footer com "→"
  e acentuação correta.

- **`src/components/cards/note-card-real.tsx`**: aplicados `fontFamily`,
  `shadow.sm`, `radius.xl`, `noteBorder`, `lineHeight`, `letterSpacing`.
  Badge de eco com copy condicional singular/plural.

- **`src/components/timeline/timeline-item-wrapper.tsx`**: axis dot migrado
  de cor fixa `#94a3b8` para cor semântica por tipo de nó (`colors.note`,
  `colors.task`, `colors.taskTimed`, `colors.taskGhost`). Padding do eixo e
  `borderRadius` via tokens.

- **`src/components/timeline/timeline-view.tsx`**: todos os hardcodes de cor
  nos estados loading/error/empty e no axis rail migrados para tokens. Tipografia
  com `fontFamily` e `lineHeight`. Copy dos empty states reescrito.

- **`src/components/day/day-header.tsx`**: ícones `ChevronLeft`/`ChevronRight`
  do Lucide substituem os caracteres `"<"` e `">"`. Botão sign-out recebe ícone
  `LogOut` em lugar de texto. Tipografia completa com `fontFamily` (Lora no
  título do dia, Inter nas labels). Textos com acentuação correta.

- **`src/components/day/day-bottom-tabs.tsx`**: label "TIME LINE" corrigido
  para "Timeline". Ícones com `strokeWidth` dinâmico por estado ativo. Sombra
  `shadow.sm`. `fontFamily` com variação regular/extraBold por estado.

- **`src/components/day/breadcrumb-bar.tsx`**: migrado inteiramente para tokens.
  Estilo harmonizado com nota (usa `noteSoft`/`noteBorder`). Botão de retorno
  com `fontFamily.bodyBold`.

- **`src/components/timeline/timeline-plus-button.tsx`**: FAB com ícone `<Plus
  />` do Lucide substituindo o caractere `"+"`. Sheet redesenhada com ícones
  `StickyNote`/`CheckSquare` por opção, botão `<X />` de fechar no header,
  `shadow.md` no FAB, `borderRadius` `radius.xxl` no topo do sheet, overlay
  via `colors.overlay`.

### Fixed



- **`delete-note-echo.ts`**: lógica de falso positivo `already_removed` quando
  `echoId` não pertencia ao par `noteIdA/noteIdB`; adicionada verificação
  secundária por ID antes de concluir sucesso (Copilot review finding)
- **`ghost-navigation.test.tsx`** e **`day-surface-regression.test.tsx`**: mock
  de `note_echoes` usava `source_note_id`/`target_note_id`; corrigido para
  `from_note_id`/`to_note_id` alinhando com o schema real (Copilot review)
- **`landing.csv`**: linhas 27–30 malformadas (aspas não fechadas e campos
  fora de ordem); CSV restaurado à estrutura canônica de 8 colunas (Gemini
  critical finding)
- **`core.py` (BM25 tokenizer)**: filtro `len(w) > 2` excluía os termos "UI"
  e "UX"; corrigido para `len(w) >= 2` (Gemini high finding)
- **`load-config.sh`** e **`load-config.ps1`**: parsing de YAML via grep/tail
  era frágil quando a chave `max_findings` aparecia em mais de uma seção;
  substituído por awk/loop com escopo restrito ao bloco `report:` (Gemini
  medium findings)

### Added

- root canon for Echotes with operational CDD documents
- project-pinned DocGuard configuration and validation scripts
- `supabase:doctor` and a local Supabase wrapper that reports ports,
  containers and restart policies
- CI workflow for DocGuard, lint, test and typecheck
- migration coverage checklist for absorption of legacy `docs/`
- expanded root canon content for notes, echoes, timeline navigation, SQL/RLS,
  Zod contracts, tag color inheritance and implementation checklist
- behavioral tests for TD030–TD036: `UnavailableRelatedNote` graceful degradation,
  semantic-pair delete direction, context field defaults, pagination cursor boundary
  transition, inverted echo `isAlreadyConnected`, whitespace normalization in brief,
  and reconciliation schema-validation reclassification
- US2 note echo management in the active `002-note-echo-flows` feature: picker
  with 50-item candidate pages, disabled existing echoes, manual echo creation,
  remove confirmation, reload feedback and integration coverage
- US3 note continuation in `002-note-echo-flows`: atomic `continue_note` RPC,
  guided continuation modal, same-day reload/open flow, future-day navigation
  with one-shot pending Reader open, and rollback/contract coverage
- Phase 6 closure for `002-note-echo-flows`: feature-scoped `@req` tags,
  canonical documentation alignment and final evidence artifact for gates
- documented occasional auxiliary development tool rules in the root README
- `003-mobile-day-shell-ux` initial feature artifacts and S21 smoke quickstart
  for the mobile day-surface UX upgrade
- shared mobile UI tokens in `src/theme/` and a temporal day shell with weekly
  navigation, Today return and monthly selector

### Changed

- `001-auth-day-surface` is now treated as the closed baseline of the product
- root canon is now explicitly treated as a consolidation target, not a fully
  closed migration
- root canon promoted after material absorption of the three legacy `docs/`
  sources
- Spec Kit constitution and templates now treat the root canon as the current
  authority and `docs/` as historical archive
- README and canonical docs now use shorter sections and a clearer doc layout
- TEST-SPEC now describes test suites without fragile file-level references
- DocGuard config now disables the cross-platform `Docs-Diff` file-path
  heuristic and tracks generated assistant artifacts with `.docguardignore`
- `docs-canonical/DATA-MODEL.md`: updated note_echoes status — CRUD flows implemented in
  `002-note-echo-flows`; revision history reordered chronologically
- `listRelatedNoteDetails` now degrades gracefully on `not_accessible` errors:
  returns `ok: true` with `UnavailableRelatedNote` entries instead of `ok: false`
- `deleteNoteEcho` verification now checks the specific deleted echo by ID when
  `echoId` is provided, preventing false `retryable_failure` when B→A echo remains
- `createNoteEcho` reconciliation reclassifies `invalid_input` from
  `listNoteEchoes` as `retryable_failure` (schema failures on fetched data are
  not caller input errors)
- `listNoteCandidates` now surfaces failures from the other-day query even when
  same-day rows were already loaded, avoiding silent pagination truncation
- `listRelatedNoteDetails` now applies `sortRelatedNotes` in the
  `not_accessible` graceful-degradation path to keep ordering stable between
  loaded and unavailable states
- `specs/002-note-echo-flows/data-model.md` now matches implemented fallback:
  access-denied detail loads degrade to `stale_detail` with relation identity
  preserved
- `specs/002-note-echo-flows/research.md` now uses `newNoteDay` naming for
  continuation draft day selection
- governance docs now explicitly treat `docs-canonical/` as the home of the six
  executable DocGuard canons, with root docs reserved for governance, status,
  operation and history
- Phase 6 closure tasks now require feature-scoped `@req` tags for all tests
  created or modified by feature 002, define `phase-6-evidence.md` as the
  evidence destination and make T055 the final step after gates
- executable canons now treat manual note echoes and `continue_note` as
  delivered feature 002 behavior, while inline `@nota` remains future scope
- Supabase local startup now requests a localhost-bound Docker network and
  reports unsafe `0.0.0.0` or `[::]` port publication in `supabase:doctor`
- Windows Firewall containment script for Echotes Supabase local ports
  `55420..55429`
- authenticated day header now prioritizes the Echotes mobile shell, visible
  calendar navigation and day-level tabs instead of the former generic MVP
  header copy
- note Reader now uses the mobile token system, clearer action hierarchy and
  same-day/other-day/unavailable relation chips for note echoes
- Reader-launched `Adicionar eco` and `Continuar desta nota` now use mobile
  sheets, shared tokens, contextual day chips and clearer feedback states
- day-surface creation, note editing, task editing and task Reader surfaces now
  use mobile sheets, shared tokens, clearer metadata chips and guided date controls
- S21 smoke findings in `003-mobile-day-shell-ux` now drive a denser day shell:
  note cards show short previews, the note Reader separates body from echoes,
  tabs live in a persistent bottom bar, the monthly calendar expands inline and
  the header plus `+` action collapse during vertical scroll
- note creation now supports a required `Eco inicial` selection area and opens
  the created note Reader after save, preserving the note if only initial echo
  creation fails

### Fixed

- Spec Kit DocGuard integration no longer depends on `docguard-cli@latest`
- future-day `Continuar desta nota` no longer consumes `pendingReaderOpen`
  before the created note appears in the destination day reload
- requirement traceability now links canonical IDs to the real test suites
- documentation contracts now verify DocGuard gates and RLS coverage
- note echo manual creation now relies on server-derived ownership instead of
  sending `created_by_user_id` from the client
- a forward Supabase migration now applies the `note_echoes.created_by_user_id`
  `default auth.uid()` contract to existing remote projects
- Supabase database hardening now revokes domain-table access from `anon`,
  limits `authenticated` grants, targets RLS policies to authenticated sessions,
  fixes the trigger function search path and disables GraphQL execution for
  client roles until GraphQL becomes an explicit product interface
- canon-guard CI now runs `corepack enable` before the `pnpm` cache setup so
  the package manager is available to `actions/setup-node`
- Supabase local development now uses the dedicated `55420..55429` port range
  and forces Echotes containers to `restart=no` after startup
- Supabase migrations now use a unique `004_note_echo_flows.sql` version for
  the `continue_note` RPC and `005_supabase_advisor_hardening.sql` for advisor
  performance fixes

### Removed

- the false claim that the canon migration was already complete
