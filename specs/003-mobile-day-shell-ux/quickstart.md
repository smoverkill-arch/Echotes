# Quickstart: Smoke S21 do Upgrade Mobile

## Objetivo

Validar que o Echotes deixou de prender o usuario em um unico dia e que a
superficie mobile permite testar fluxos de ecos e continuacao cross-day.

## Roteiro Manual

1. Abrir o app autenticado no S21.
2. Confirmar que a tela do dia mostra calendario semanal no topo.
3. Confirmar que `Hoje` e o dia selecionado sao distinguiveis.
4. Tocar no dia anterior da strip semanal.
5. Tocar no dia seguinte da strip semanal.
6. Navegar para a semana anterior.
7. Navegar para a semana seguinte.
8. Abrir o seletor mensal e escolher uma data de outro mes.
9. Tocar em `Hoje` e confirmar retorno ao dia real.
10. Alternar entre `Timeline`, `Tarefas` e `Notas` sem perder o dia selecionado.
11. Tocar no botao `+`.
12. Confirmar que o menu de criacao abre como sheet com `Criar nota` e
    `Criar tarefa`.
13. Criar uma nota e confirmar que o editor abre como sheet com chip do dia.
14. Editar uma nota existente e confirmar que o editor preserva o dia da nota.
15. Criar uma tarefa e confirmar que o editor mostra origem, destino e horario.
16. Usar `Dia anterior`, `Dia seguinte` e `Hoje` no destino da tarefa.
17. Abrir uma tarefa real e confirmar que o Reader de tarefa mostra status,
    origem, destino e horario como blocos escaneaveis.
18. Abrir uma tarefa projetada por ghost card, navegar ao destino e confirmar
    que o Reader de tarefa mostra o contexto de origem.
19. Abrir uma nota.
20. Confirmar que o Reader abre como sheet mobile, com chip da data da nota.
21. Confirmar que `Continuar desta nota` aparece como acao primaria.
22. Confirmar que `Adicionar eco` e `Editar` aparecem como acoes secundarias.
23. Confirmar que cada eco mostra `Mesmo dia`, `Outro dia` ou `Indisponivel`.
24. Tocar em `Adicionar eco`.
25. Confirmar que o picker abre como sheet com a nota de origem e chip do dia.
26. Confirmar que candidatas exibem `Mesmo dia` ou `Outro dia`.
27. Confirmar que candidata ja conectada continua visivel e desabilitada como
    `Eco ja existe`.
28. Usar `Carregar mais`, quando disponivel, e confirmar estado de carregamento.
29. Adicionar eco manual quando houver candidata disponivel.
30. Remover eco com confirmacao.
31. Usar `Continuar desta nota`.
32. Confirmar que o editor abre como sheet com nota de origem e dia original.
33. Usar `Dia anterior`, `Dia seguinte` e `Hoje` para alterar o campo
    `YYYY-MM-DD`.
34. Confirmar que dia anterior ao original mostra aviso e bloqueia submit.
35. Criar continuidade em outro dia com `Criar continuidade`.
36. Confirmar que o app navega ao dia da nova nota e abre o Reader contextual.
37. Confirmar que o retorno ao contexto de origem permanece claro quando houver breadcrumb temporal.

## Gates Tecnicos

- `corepack pnpm run doc:guard`
- `corepack pnpm run lint`
- `corepack pnpm run test`
- `corepack pnpm run typecheck`
