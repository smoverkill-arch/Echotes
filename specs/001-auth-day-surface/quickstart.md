# Guia Rápido: Superfície Diária Autenticada

## Objetivo

Validar localmente a feature `001-auth-day-surface` fechada: autenticação,
superfície diária protegida, criação/leitura/edição de notas e tarefas,
projeção temporal com ghost card, retorno contextual e eixo visual final da
timeline.

## Pré-requisitos

1. `pnpm` instalado no ambiente.
2. Projeto Supabase existente com email/senha habilitado em Auth.
3. Credenciais públicas do projeto Supabase em mãos.

## Preparação do Supabase

1. Abrir o SQL Editor do projeto Supabase real.
2. Executar integralmente `supabase/migrations/001_auth_day_surface.sql`.
3. Confirmar no dashboard:
   - `public.tags`, `public.tasks`, `public.notes` e `public.note_echoes`
     existem
   - RLS está habilitado nas quatro tabelas
   - as policies de ownership foram criadas
   - os triggers `trg_tasks_updated_at` e `trg_notes_updated_at` existem

## Configuração de Ambiente

1. Criar `.env` local a partir de `.env.example`.
2. Preencher:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Confirmar que nenhuma chave `service_role` foi adicionada ao cliente.

## Execução Local

1. Instalar dependências com `pnpm install`.
2. Iniciar o app com `pnpm expo start`.
3. Abrir o app no simulador ou dispositivo.

## Validação funcional

### US1 - Autenticação e superfície protegida

1. Criar conta com email e senha.
2. Encerrar e reabrir o app para validar restauração de sessão.
3. Encerrar sessão e confirmar bloqueio das superfícies protegidas.

### US2 - Registro do mesmo dia

1. Criar uma nota independente no dia atual.
2. Abrir a nota, editar o conteúdo e confirmar persistência.
3. Criar uma tarefa sem horário para o mesmo dia.
4. Criar uma tarefa com horário para o mesmo dia e confirmar marcador de
   criação + item real.
5. Abrir uma tarefa, editar seus dados e confirmar persistência.

### US3 - Projeção temporal e navegação contextual

1. Criar uma tarefa para outro dia e confirmar ghost card no dia de origem.
2. Abrir o ghost card, navegar para o item real no dia de destino e confirmar
   abertura contextual do item.
3. Usar o breadcrumb para retornar ao dia de origem.
4. Confirmar eixo visual da timeline com notas à direita e itens de tarefa à
   esquerda.

## Regressão técnica

Antes de considerar a feature fechada no checkout local, rodar:

```bash
pnpm lint
pnpm test
pnpm typecheck
```

Para alterações documentais isoladas, `pnpm lint` e `git diff --check` são a
validação mínima esperada.

## Falhas Esperadas

- Sem `EXPO_PUBLIC_SUPABASE_URL` ou `EXPO_PUBLIC_SUPABASE_ANON_KEY`, o app deve
  falhar com mensagem clara de configuração.
- Tentativas de persistir tarefa com horário inválido devem ser bloqueadas antes
  do salvamento.
