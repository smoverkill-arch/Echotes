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
8. Expandir o calendario mensal inline, sem modal, e escolher uma data de outro
   mes.
9. Tocar em `Hoje` e confirmar retorno ao dia real.
10. Alternar pela bottom bar entre `TIME LINE`, `TAREFAS` e `NOTAS` sem perder
    o dia selecionado.
11. Tocar no botao `+`.
12. Confirmar que o menu de criacao abre como sheet com `Criar nota` e
    `Criar tarefa`.
13. Criar uma nota e confirmar que o editor abre como sheet com chip do dia.
14. Em criacao de nota, confirmar que `Eco inicial` lista candidatas existentes
    com chip `Mesmo dia` ou `Outro dia`.
15. Selecionar uma candidata, salvar e confirmar que o Reader da nota criada
    abre com feedback de eco.
16. Confirmar que uma falha apenas do eco nao remove a nota criada e mostra
    `Nota salva, mas o eco nao foi criado.` quando esse cenario ocorrer.
17. Editar uma nota existente e confirmar que o editor preserva o dia da nota.
18. Criar uma tarefa e confirmar que o editor mostra origem, destino e horario.
19. Usar `Dia anterior`, `Dia seguinte` e `Hoje` no destino da tarefa.
20. Abrir uma tarefa real e confirmar que o Reader de tarefa mostra status,
    origem, destino e horario como blocos escaneaveis.
21. Abrir uma tarefa projetada por ghost card, navegar ao destino e confirmar
    que o Reader de tarefa mostra o contexto de origem.
22. Confirmar que cards de nota na timeline e na aba `NOTAS` mostram apenas
    titulo, indicadores e preview curto; a nota completa aparece so no Reader.
23. Abrir uma nota.
24. Confirmar que o Reader abre como sheet mobile, com chip da data da nota.
25. Confirmar que ha separador visual entre o corpo da nota e a secao `Ecos`.
26. Confirmar que `Continuar desta nota` aparece como acao primaria.
27. Confirmar que `Adicionar eco` e `Editar` aparecem como acoes secundarias.
28. Confirmar que cada eco mostra `Mesmo dia`, `Outro dia` ou `Indisponivel`.
29. Tocar em `Adicionar eco`.
30. Confirmar que o picker abre como sheet com a nota de origem e chip do dia.
31. Confirmar que candidatas exibem `Mesmo dia` ou `Outro dia`.
32. Confirmar que candidata ja conectada continua visivel e desabilitada como
    `Eco ja existe`.
33. Usar `Carregar mais`, quando disponivel, e confirmar estado de carregamento.
34. Adicionar eco manual quando houver candidata disponivel.
35. Remover eco com confirmacao.
36. Usar `Continuar desta nota`.
37. Confirmar que o editor abre como sheet com nota de origem e dia original.
38. Usar `Dia anterior`, `Dia seguinte` e `Hoje` para alterar o campo
    `YYYY-MM-DD`.
39. Confirmar que dia anterior ao original mostra aviso e bloqueia submit.
40. Criar continuidade em outro dia com `Criar continuidade`.
41. Confirmar que o app navega ao dia da nova nota e abre o Reader contextual.
42. Rolar a timeline/listas para cima ou para baixo e confirmar que
    header/calendario e botao `+` somem durante o scroll enquanto a lista
    continua ocupando a tela.
43. Parar a rolagem e confirmar que header/calendario voltam como overlay por
    cima do conteudo, sem espremer ou deslocar a timeline.
44. Confirmar que o retorno ao contexto de origem permanece claro quando houver breadcrumb temporal.

## Gates Tecnicos

- `corepack pnpm run doc:guard`
- `corepack pnpm run lint`
- `corepack pnpm run test`
- `corepack pnpm run typecheck`
