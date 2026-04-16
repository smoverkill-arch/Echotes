# Modelo de Dados: Superfície Diária Autenticada

## Visão Geral

Esta feature usa o modelo canônico do Echotes, mas limita o primeiro corte a:

- sessão autenticada
- contexto do dia
- notas independentes
- tarefas do mesmo dia e de dia futuro
- nós derivados de timeline

Capacidades avançadas de `note_echoes` permanecem preservadas no modelo
canônico, mas ficam fora da UI deste corte.

## Sessão Autenticada

**Objetivo**: representar a identidade ativa no app e guardar o estado de acesso
às superfícies protegidas.

**Campos**:

- `userId`
- `email`
- `accessToken`
- `refreshToken`
- `isRestoring`
- `isAuthenticated`

**Regras de validação**:

- A sessão só é considerada válida quando existir usuário autenticado e tokens
  atuais.
- Ausência de configuração do cliente bloqueia a criação da sessão.

## Contexto do Dia

**Objetivo**: representar o dia atualmente em foco na experiência protegida.

**Campos**:

- `selectedDate`
- `clockDate`
- `activeTab`
- `readerState`
- `editorState`
- `temporalNavigationContext`

**Regras de validação**:

- `selectedDate` usa o formato diário canônico.
- `clockDate` é mantido separado de `selectedDate`.

## Tarefa

**Objetivo**: representar um item acionável com origem temporal e destino real.

**Campos**:

- `id`
- `user_id`
- `title`
- `content`
- `source_day`
- `target_day`
- `created_at`
- `scheduled_at`
- `status`
- `completed_at`
- `updated_at`

**Regras de validação**:

- `title` não pode ser vazio.
- `scheduled_at` é derivado de `target_day + scheduled_time` antes da
  persistência.
- `scheduled_at`, quando presente, DEVE ser estritamente posterior a
  `created_at`.
- Ghost card só existe quando `source_day != target_day`.

**Transições de estado**:

- `open -> done`
- `open -> cancelled`
- `done` e `cancelled` permanecem terminais no corte inicial

## Nota

**Objetivo**: representar um registro textual pertencente a um dia.

**Campos**:

- `id`
- `user_id`
- `day`
- `title`
- `content`
- `brief`
- `created_at`
- `updated_at`

**Regras de validação**:

- `title` não pode ser vazio.
- `day` define o pertencimento da nota.
- A posição de timeline é derivada de `created_at`.

## Entidade Canônica Adiada: Note Echo

**Objetivo**: preservar a continuidade conceitual entre notas no modelo soberano.

**Status nesta fatia**: fora da UI inicial, mas não removido do desenho de
dados do produto.

**Campos relevantes**:

- `from_note_id`
- `to_note_id`
- `kind`
- `metadata`
- `context_day`

## Nó de Timeline

**Objetivo**: forma visual derivada usada pela timeline diária.

**Campos**:

- `id`
- `type`
- `itemKind`
- `itemId`
- `sortAt`
- `createdAt`
- `scheduledAt`
- `data`

**Tipos permitidos**:

- `note`
- `task_untimed`
- `task_creation_marker`
- `task_timed`
- `task_ghost`

**Regras de derivação**:

- Notes usam `created_at` para posicionamento.
- Tarefas sem horário usam `created_at`.
- Tarefas com horário no mesmo dia geram marcador de criação + item real.
- Tarefas projetadas geram apenas ghost card no dia de origem.
- O item real no destino usa `scheduled_at` quando existir; caso contrário usa a
  posição intradiária derivada de `created_at`.
