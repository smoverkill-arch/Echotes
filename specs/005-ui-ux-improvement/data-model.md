# Modelo de Dados: UI/UX Improvement

**Branch**: `005-ui-ux-improvement` | **Spec**: [spec.md](./spec.md)

Esta feature **nao altera o schema do banco** nem RLS. Ela introduz apenas
estado local de UI e derivacoes de leitura. Abaixo, as entidades relevantes.

## Estado Local Persistido

### OnboardingState (`src/stores/onboarding-store.ts`)

Persistido em AsyncStorage sob a chave `echotes-onboarding`.

| Campo         | Tipo      | Persistido | Descricao                                                |
|---------------|-----------|------------|----------------------------------------------------------|
| `hasSeen`     | `boolean` | sim        | Marca se o onboarding inicial ja foi concluido ou pulado |
| `hasHydrated` | `boolean` | nao        | Marca runtime de que o estado persistido ja hidratou     |

Acoes:

- `setSeen()` — marca `hasSeen = true` (chamado por `Comecar` e `Pular`).
- `markHydrated()` — marca `hasHydrated = true` via `onRehydrateStorage`.

`partialize` salva apenas `hasSeen`; `hasHydrated` e sempre runtime para evitar
flicker de roteamento.

## Estado Local Volatil (sem mudanca de schema)

### NavigationStore (`src/stores/navigation-store.ts`) — apos remocao

| Campo                        | Tipo                              | Descricao                          |
|------------------------------|-----------------------------------|------------------------------------|
| `temporalNavigationContext`  | `TemporalNavigationContext | null`| Contexto de navegacao temporal de tarefa projetada |

**Removidos nesta feature**: o campo `pendingReaderOpen` e as acoes
`setPendingReaderOpen`, `consumePendingReaderOpen`, `clearPendingReaderOpen`. O
tipo `PendingReaderOpen` (e `PendingReaderOpenOrigin`) foi removido de
`src/types/note.ts`.

### UIStore (`src/stores/ui-store.ts`)

| Campo         | Tipo          | Descricao                                              |
|---------------|---------------|--------------------------------------------------------|
| `activeTab`   | `TimelineTab` | Lente ativa do dia                                     |
| `readerState` | `ReaderState` | **Legado**: mantido por compatibilidade; nao controla mais a visibilidade do Reader (agora a rota controla) |
| `editorState` | `EditorState` | Estado do Editor (overlay sobre a rota ativa)          |

## Derivacoes de Leitura

### HomeDaySummary (`app/home.tsx`)

Derivado em runtime a partir de `useDayTimeline(clockDate)`; nao persiste.

| Derivacao       | Origem                                                   |
|-----------------|----------------------------------------------------------|
| contagem tasks  | `tasks.length`                                           |
| contagem notes  | `notes.length`                                           |
| contagem echoes | `echoes.length`                                          |
| proxima tarefa  | tarefa com `scheduled_at` e `target_day === clockDate`, ordenada por `scheduled_at`, primeira |

## Componentes de UI (contratos de props)

### BrandMark (`src/components/brand/brand-mark.tsx`)

| Prop          | Tipo                   | Default | Descricao                          |
|---------------|------------------------|---------|------------------------------------|
| `size`        | `"sm" | "md" | "lg"`   | —       | Tamanho do simbolo                 |
| `showWordmark`| `boolean`              | `true`  | Exibe o wordmark "Echotes"         |

### PrimaryAction / SecondaryAction (`src/components/ui/*`)

| Prop               | Tipo                  | Descricao                              |
|--------------------|-----------------------|----------------------------------------|
| `label`            | `string`              | Texto da acao                          |
| `onPress`          | `() => void`          | Callback; nao dispara quando `disabled`|
| `disabled`         | `boolean` (opcional)  | Bloqueia o toque                       |
| `tone`             | `"danger" | ...`      | (SecondaryAction) comunica destrutivo  |
| `accessibilityLabel`| `string` (opcional)  | Rotulo de acessibilidade               |
| `testID`           | `string` (opcional)   | Identificador de teste                 |

### Chip / SectionLabel (`src/components/ui/*`)

| Prop    | Tipo                                 | Descricao                       |
|---------|--------------------------------------|---------------------------------|
| `label` | `string` (Chip)                      | Texto do chip                   |
| `tone`  | `"primary" | "note" | "task" | ...`  | Tom semantico, lido do tema     |
| `children` | `ReactNode` (SectionLabel)        | Conteudo do rotulo de secao     |
