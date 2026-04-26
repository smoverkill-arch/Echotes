# Contrato: Sessão de Autenticação

## Objetivo

Definir o contrato funcional da autenticação para a primeira fatia do Echotes.

## Ambiente Obrigatório

| Chave | Obrigatória | Visibilidade | Regra |
|-------|-------------|--------------|-------|
| `EXPO_PUBLIC_SUPABASE_URL` | sim | cliente público | DEVE existir antes de inicializar fluxos autenticados |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | sim | cliente público | DEVE existir antes de inicializar fluxos autenticados |

## Estados da Sessão

| Estado | Descrição | Transições permitidas |
|--------|-----------|-----------------------|
| `unauthenticated` | usuário sem sessão válida | `authenticating` |
| `authenticating` | cadastro, login ou restauração em andamento | `authenticated`, `unauthenticated`, `config_error` |
| `authenticated` | usuário apto a acessar a superfície diária | `signing_out`, `session_expired` |
| `signing_out` | encerramento de sessão em andamento | `unauthenticated` |
| `session_expired` | sessão perdida durante fluxo protegido | `unauthenticated`, `authenticating` |
| `config_error` | ambiente obrigatório ausente | terminal até correção local |

## Ações do Usuário

### Cadastro

- Entrada: email válido + senha válida
- Sucesso: cria conta, inicia sessão e libera a superfície diária
- Falha: mantém estado público com feedback claro

### Entrada

- Entrada: email válido + senha válida
- Sucesso: inicia sessão e libera a superfície diária
- Falha: mantém estado público com feedback claro

### Restauração de Sessão

- Entrada: sessão local previamente persistida
- Sucesso: reabre diretamente a superfície diária protegida
- Falha: volta ao estado público sem expor superfície protegida

### Encerrar Sessão

- Entrada: usuário autenticado
- Sucesso: remove acesso protegido e retorna ao fluxo público

## Contrato de Guarda de Rotas

- Superfícies protegidas exigem estado `authenticated`.
- Qualquer tentativa de abrir superfície protegida em outro estado redireciona
  para o fluxo público.
- Se a sessão expirar no meio de uma ação protegida, a pessoa recebe feedback e
  retorna ao fluxo público sem persistir operações inválidas.
