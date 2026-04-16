# Pesquisa: Superfície Diária Autenticada

## Decisão: usar um único app Expo com grupos de rota públicos e protegidos

**Justificativa**: o produto já está fechado como app mobile com Expo Router.
Separar a experiência em grupos de rotas públicas e protegidas reduz
complexidade cognitiva e mantém a superfície diária como destino autenticado
principal.

**Alternativas consideradas**:

- Criar um app local sem autenticação no primeiro corte.
- Separar autenticação e timeline em projetos independentes.

## Decisão: começar a autenticação apenas com email e senha

**Justificativa**: email + senha resolve cadastro, login, restauração de sessão
e logout sem depender de magic links ou fluxos adicionais de deep linking logo
no primeiro corte.

**Alternativas consideradas**:

- Magic link por email.
- Misturar email/senha com login social já no primeiro corte.

## Decisão: manter a configuração do cliente Supabase pública e local

**Justificativa**: o cliente mobile precisa apenas de
`EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Versionar apenas
`.env.example` protege o repositório e deixa o onboarding previsível.

**Alternativas consideradas**:

- Versionar o `.env` real.
- Introduzir `service_role` no cliente para acelerar o MVP.

## Decisão: preservar modelos separados para tarefa e nota desde o primeiro dia

**Justificativa**: o domínio do Echotes depende da separação entre
ação/projeção temporal e registro/continuidade conceitual. Mesmo no primeiro
corte, a timeline deve unir renderização, não forçar uma tabela ou formulário
genérico.

**Alternativas consideradas**:

- Unificar nota e tarefa em um único tipo genérico para ganhar velocidade.
- Adiar a lógica de ghost card para depois da criação básica.

## Decisão: limitar a primeira fatia a auth, superfície do dia e regras centrais da timeline

**Justificativa**: o melhor corte vertical entrega valor real com acesso
protegido, criação de nota, tarefa do mesmo dia, tarefa futura e navegação por
ghost card. Isso valida o eixo central do produto sem diluir o foco.

**Alternativas consideradas**:

- Tentar cobrir todo o MVP incluindo ecos, menções, tags e calendário expandido.
- Fazer somente infraestrutura técnica sem experiência de ponta a ponta.
