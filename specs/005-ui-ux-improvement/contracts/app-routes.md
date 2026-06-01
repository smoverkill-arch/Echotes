# Contrato: Rotas do App

**Branch**: `005-ui-ux-improvement` | **Spec**: [../spec.md](../spec.md)

Mapa de rotas apos a reestruturacao. As rotas de Reader sao a principal mudanca
estrutural desta feature.

## Mapa de Rotas

| Rota                          | Arquivo                          | Acesso       | Descricao |
|-------------------------------|----------------------------------|--------------|-----------|
| `/`                           | `app/index.tsx`                  | publico      | Gate: roteia para onboarding/home/sign-in |
| `/onboarding`                 | `app/onboarding.tsx`             | publico      | Onboarding inicial (uma vez) |
| `/home`                       | `app/home.tsx`                   | protegido    | Painel inicial com resumo do dia |
| `/(auth)/sign-in`             | `app/(auth)/sign-in.tsx`         | publico      | Entrada publica |
| `/(auth)/sign-up`             | `app/(auth)/sign-up.tsx`         | publico      | Cadastro publico |
| `/day/[date]`                 | `app/day/[date]/index.tsx`       | protegido    | Superficie do dia (host do DayShell) |
| `/day/[date]/note/[id]`       | `app/day/[date]/note/[id].tsx`   | protegido    | Reader de nota (rota empilhada) |
| `/day/[date]/task/[id]`       | `app/day/[date]/task/[id].tsx`   | protegido    | Reader de tarefa (rota empilhada) |

O `Stack` das telas do dia e definido por `app/day/[date]/_layout.tsx` com
`headerShown: false` e screens `index`, `note/[id]`, `task/[id]`.

## Contrato de Roteamento da Raiz (`/`)

Entrada (estado): `isBootstrapping`, `authStatus`, `isAuthenticated`,
`onboarding.hasSeen`, `onboarding.hasHydrated`.

Saida (decisao):

| Condicao                                                       | Resultado            |
|----------------------------------------------------------------|----------------------|
| `isBootstrapping` OU `!hasHydrated` OU `authStatus === "signing_out"` | loading (sem redirect) |
| `!hasSeen`                                                     | `Redirect → /onboarding` |
| `hasSeen` e `isAuthenticated`                                  | `Redirect → /home`   |
| `hasSeen` e `!isAuthenticated`                                 | `Redirect → signInHref` |

## Contrato de Navegacao do Reader

| Acao do usuario                              | Navegacao resultante                          |
|----------------------------------------------|-----------------------------------------------|
| Toca card de nota na timeline                | `push /day/[date]/note/[id]`                  |
| Toca card de tarefa na timeline              | `push /day/[date]/task/[id]`                  |
| Abre nota conectada (mesmo/outro dia)        | `push /day/[diaRelacionado]/note/[idRelacionada]` |
| Continua nota (mesmo dia ou futuro)          | `push /day/[novoDia]/note/[idNova]`           |
| Continuacao falha na RPC                     | sem navegacao; erro exibido no editor         |
| Fecha o Reader                               | `back` (volta na pilha)                        |
| Salva nota nova pela criacao (com `openReaderNoteId`) | `push /day/[date]/note/[idNova]`     |

## Invariantes

- Nenhuma navegacao depende de `pendingReaderOpen` (removido).
- `readerState` do `uiStore` nao participa da decisao de visibilidade do Reader.
- Rota de Reader com `id` inexistente nao quebra: o controlador retorna nota/
  tarefa nula e o componente de leitura degrada graciosamente.
- Sessao ausente em rota protegida redireciona para `signInHref`.
