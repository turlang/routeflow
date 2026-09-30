# Ponte de colaboração RouteFlow

Atualizado em: 2026-09-30T17:10:47Z

Responsável: Codex/ECC

Base inspecionada: `ddd1bb97f20783b93970aa57e3e2bfaefc0446f2` (`origin/main`)

Status: ativo como protocolo; publicação em main depende da integração desta alteração.

## Finalidade e leitura

Estes arquivos versionados são o ponto de entrada para contexto estratégico e passagem de trabalho entre ChatGPT e Codex/ECC. Leia nesta ordem: [plano](current-plan.md), [progresso](progress.md), [bloqueios](blockers.md), [decisões](decisions.md) e [próxima tarefa](next-task.md).

| Arquivo | Conteúdo e responsável |
| --- | --- |
| current-plan.md | Objetivo, escopo e critérios de aceite; Codex/ECC consolida propostas estratégicas aceitas. |
| progress.md | Execução, evidências e validações; Codex/ECC acrescenta entradas. |
| decisions.md | Decisões técnicas e histórico; Codex/ECC registra, ChatGPT pode propor alternativas. |
| blockers.md | Impedimentos, riscos, responsável e condição de desbloqueio; Codex/ECC mantém. |
| next-task.md | Uma tarefa concreta, limites e resultado esperado; Codex/ECC mantém, ChatGPT propõe a direção. |
| README.md | Protocolo compartilhado. |

O usuário define prioridades e resolve decisões de produto, acesso e testes físicos que dependam dele. ChatGPT consulta os arquivos na mesma revisão do GitHub, analisa estratégia e propõe prompts/planos. Codex/ECC verifica o código, executa somente o escopo autorizado e atualiza o conjunto ao terminar ou interromper uma tarefa. Uma proposta do ChatGPT não é uma decisão aceita nem autorização automática para executar alterações.

## Fonte de verdade e limites da ponte

O repositório é [turlang/routeflow](https://github.com/turlang/routeflow). A versão vigente da ponte é a integrada em main; versões em branches/PRs são propostas. Informe sempre branch e SHA lidos. Use links permanentes com SHA ao citar evidência técnica.

[DEVELOPMENT_STATE.md](../../DEVELOPMENT_STATE.md) continua sendo o checkpoint durável geral; [ROADMAP_COMMERCIAL.md](../../ROADMAP_COMMERCIAL.md) define os gates; [COMMERCIAL_READINESS.md](../../COMMERCIAL_READINESS.md) lista critérios comerciais. Esta pasta sintetiza e referencia esses documentos, sem substituir silenciosamente seu histórico. Se divergirem, registre a divergência com data e evidência. Código demonstra implementação, testes demonstram apenas os cenários executados e validação de produção requer evidência do ambiente.

A ponte compartilha contexto; não instala mensageria, automação, monitoramento nem garante que uma sessão leia ou execute outra sozinha. ChatGPT precisa de acesso autenticado ao GitHub e de uma invocação para ler os arquivos. Sem acesso, registrar a limitação e a última revisão conhecida, sem afirmar leitura atual. Alterações locais só ficam disponíveis a outras sessões após commit e push; propostas passam a vigorar após integração.

## Ciclo de trabalho e prevenção de conflitos

1. Atualizar referências remotas e ler os seis arquivos na mesma revisão, além das instruções aplicáveis do repositório. Conferir alterações locais e não descartar trabalho alheio.
2. Criar branch de tarefa a partir da main atual. Registrar ID, responsável, branch e SHA-base em next-task. Antes de executar trabalho concorrente, combinar um único executor por tarefa; a reserva em arquivo é informativa, não um bloqueio distribuído.
3. ChatGPT propõe objetivo, justificativa, critérios e limites em uma seção de proposta ou PR separado. Não sobrescrever o plano ativo durante execução. Codex/ECC incorpora somente a proposta aceita no escopo autorizado.
4. Ao concluir ou parar, atualizar progresso, bloqueios, decisões e próxima tarefa no mesmo commit coerente. Se houver mudança de objetivo, atualizar também o plano.
5. Antes de publicar, comparar a base com main e com a tarefa vigente. Se mudou, reler, reconciliar e validar. Em conflito, preservar ambas as evidências e resolver por ID; nunca usar sobrescrita cega, force-push ou apagar histórico para resolver divergência.
6. Publicar branch/PR com resumo e validação. Integrar conforme a política do projeto e autorização vigente. Outra sessão deve ler a revisão publicada, não assumir que um resultado local chegou à main.

## Metadados, estados e histórico

Usar timestamps ISO 8601 com fuso (preferir UTC, sufixo Z). Atualizar o cabeçalho somente quando o arquivo mudar. Cada entrada deve ter ID estável, data, autor/responsável, estado, evidência e próximo passo. Não trocar a data de um teste antigo pela data da leitura.

- Tarefa: proposta → pronta → em_andamento → concluida; usar bloqueada quando faltar pré-requisito e cancelada com justificativa.
- Gate: em_validacao ou concluido; existência de código não encerra gate.
- Bloqueio: aberto → resolvido, ou descartado com evidência.
- Decisão: proposta → aceita → substituida; uma nova decisão aponta a anterior.
- Evidência: observado_no_codigo, relato_documentado, validado_por_teste ou nao_verificado.

progress e decisions recebem novas entradas; não apagar entradas anteriores. Corrigir inexatidões com adendo datado. Ao substituir uma decisão, manter texto original, acrescentar nota de substituição e criar novo ID com motivo, consequências e referência cruzada. Em blockers, preservar resolução e data; em next-task, manter passagem da tarefa anterior com link ao progresso. O Git complementa, mas não substitui, esse histórico legível.

Não incluir tokens, senhas, dados pessoais de clientes, planilhas reais ou logs sensíveis. Evidências devem ser sanitizadas.

## Modelo de entrada reutilizável

```text
ID: <tipo-número>
Data: <ISO 8601 com fuso>
Responsável: <executor>
Status: <estado>
Base: <branch e SHA>
Objetivo/resultado: <descrição>
Evidência: <tipo, arquivo/commit/teste e resultado>
Limitações/bloqueios: <IDs ou nenhum>
Próximo passo: <ação e responsável>
```

Antes de publicar: conferir os seis arquivos, links relativos, estados, timestamps, ausência de segredos, conflitos e coerência entre plano, progresso e próxima tarefa. Não declarar testes funcionais aprovados quando apenas documentação foi validada.
