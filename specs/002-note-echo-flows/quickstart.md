# Guia Rapido: Fluxos de Eco de Nota

## Objetivo

Validar localmente a feature `002-note-echo-flows`: badge `Ecos` na timeline,
Reader com notas conectadas, criacao manual de eco e `Continuar desta nota`
com navegacao correta entre dias.

## Pre-requisitos

1. `pnpm` instalado no ambiente.
2. Projeto Supabase existente com as migrations versionadas de
   `supabase/migrations/` aplicadas ou registradas conforme `RUNBOOKS.md`.
3. Credenciais publicas do Supabase configuradas localmente.
4. Pelo menos duas notas existentes para o mesmo usuario; para validar
   navegacao entre dias, pelo menos uma delas deve pertencer a outro dia.

## Preparacao do Banco

1. Confirmar que `001_auth_day_surface.sql`,
   `002_note_echo_owner_default.sql` e `003_harden_note_echo_surface.sql`
   aparecem em `corepack pnpm run db:migrations`.
2. Confirmar que `public.notes` e `public.note_echoes` existem.
3. Confirmar que RLS continua habilitado em ambas as tabelas.
4. Confirmar que o indice semantico de `note_echoes` continua presente.
5. Aplicar a futura migration de US3 quando T041 criar a RPC atomica de
   `Continuar desta nota`.

## Configuracao de Ambiente

1. Criar `.env` local a partir de `.env.example`, se ainda nao existir.
2. Preencher:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Confirmar que nenhuma chave `service_role` foi adicionada ao cliente.

## Execucao Local

1. Instalar dependencias com `corepack pnpm install`.
2. Iniciar o app com `corepack pnpm expo start`.
3. Abrir o app no simulador ou dispositivo.
4. Entrar com usuario que ja tenha notas em mais de um dia.

## Validacao Funcional

### US1 - Continuidade visivel

1. Abrir um dia com pelo menos uma nota conectada.
2. Confirmar que o card da nota mostra badge `Ecos` com a contagem direta
   correta.
3. Abrir o Reader da nota e conferir a lista de notas conectadas.
4. Abrir uma nota conectada do mesmo dia e confirmar troca de Reader sem sair
   da superficie.
5. Abrir uma nota conectada de outro dia e confirmar navegacao para o dia de
   destino com reabertura do Reader.

### US2 - Conectar notas existentes

1. Abrir uma nota sem o eco desejado.
2. Usar `Adicionar eco`.
3. Confirmar que o seletor mostra ate 50 notas recentes e oferece `carregar
   mais` quando houver proximo lote.
4. Confirmar que notas ja conectadas aparecem desabilitadas com `Eco ja existe`.
5. Escolher uma nota candidata habilitada da lista.
6. Confirmar aumento da contagem direta e presenca da nova relacao no Reader.
7. Repetir a mesma conexao, confirmar que nenhuma duplicata e criada e que a
   UX informa `Eco ja existe`.
8. Remover a relacao criada, confirmar o dialogo de remocao e verificar que
   apenas o eco desaparece, sem apagar nenhuma das notas.
9. Tentar conectar a nota a ela mesma e confirmar bloqueio com feedback claro.

### US3 - Continuar desta nota

1. Abrir uma nota existente.
2. Usar `Continuar desta nota`.
3. Confirmar que o draft abre com `title` inicial, `newNoteDay` editavel e
   `brief` automatico preenchido.
4. Salvar uma continuacao para o mesmo dia e confirmar abertura do Reader da
   nova nota.
5. Salvar outra continuacao para dia futuro e confirmar navegacao ao destino
   com a relacao visivel ao final.
6. Simular falha da RPC e confirmar que nenhuma nota continuada fica criada sem
   eco correspondente.
7. Simular falha de carregamento de uma nota conectada e confirmar item
   indisponivel com acao de recarregar no Reader.

## Regressao Tecnica

Antes de considerar a feature pronta localmente, rodar:

```bash
corepack pnpm run doc:guard
corepack pnpm run lint
corepack pnpm run test
corepack pnpm run typecheck
```

## Falhas Esperadas

- Sem `EXPO_PUBLIC_SUPABASE_URL` ou `EXPO_PUBLIC_SUPABASE_ANON_KEY`, o app deve
  falhar com mensagem clara de configuracao.
- Tentativas de eco entre a mesma nota devem ser bloqueadas.
- Tentativas de eco duplicado nao devem criar nova relacao semantica e devem
  informar `Eco ja existe`.
- Remover eco deve exigir confirmacao e nao deve apagar nenhuma nota.
- `Continuar desta nota` nao deve permitir dia anterior ao da nota de origem.
- Falha na RPC de `Continuar desta nota` nao deve deixar nota orfa.
