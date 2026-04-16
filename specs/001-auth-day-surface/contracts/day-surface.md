# Contrato: Superfície do Dia

## Objetivo

Definir o contrato funcional da superfície diária protegida do Echotes neste
primeiro corte.

## Entradas

| Entrada | Descrição |
|---------|-----------|
| `selectedDay` | dia em foco da experiência |
| `session.userId` | identidade autenticada dona dos dados |
| `tasks` | tarefas em que `source_day = selectedDay` ou `target_day = selectedDay` |
| `notes` | notas em que `day = selectedDay` |

## Saída da Timeline

| Tipo de nó | Quando aparece | Regra de ordenação |
|------------|----------------|--------------------|
| `note` | nota pertencente ao dia | posição intradiária derivada de `created_at` |
| `task_untimed` | tarefa do dia sem horário | posição intradiária derivada de `created_at` |
| `task_creation_marker` | tarefa do mesmo dia com horário | posição intradiária derivada de `created_at` |
| `task_timed` | item real de tarefa com horário no dia de destino | posição intradiária derivada de `scheduled_at` |
| `task_ghost` | tarefa criada em um dia e pertencente a outro | posição intradiária derivada de `created_at` |

## Contrato de Interação

### Criar Nota

- Cria nota independente no `selectedDay`
- Insere a nota na timeline do dia pela posição de `created_at`

### Criar Tarefa

- Permite `target_day` e `scheduled_time` opcional
- Compõe `scheduled_at` antes da validação
- Bloqueia persistência quando `scheduled_at` é inválido

### Abrir Reader

- Gesto simples em item existente
- Reader abre como sobreposição contextual
- A superfície do dia permanece soberana por baixo

### Abrir Editor

- Double tap em item existente
- Editor abre em modo de edição como sobreposição contextual

### Navegação por Ghost Card

- O ghost card abre o item real no dia de destino
- A experiência deve expor caminho claro de retorno ao dia de origem

## Invariantes

- Ghost card é exclusivo de tarefas.
- Notas não usam ghost card.
- Tarefas do mesmo dia com horário geram marcador de criação e item real.
- Tarefas projetadas mostram apenas ghost card na origem.
- Reader e Editor não viram destinos de navegação.
