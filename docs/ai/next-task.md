# Próxima tarefa

Atualizado em: 2026-10-01T15:27:49Z

Responsável: Codex/ECC

Base inspecionada: `077ac9fcbe17b3da3348242b2dd863877d47eee3` (`main` local)

ID: TASK-002

Status: proposta

Responsável previsto: Codex/ECC

Executor reservado: nenhum

Branch da proposta atual: codex/gate-a-stash-reconciliation; TASK-002 fisica ainda pendente

Base: atualizar origin/main e registrar SHA antes da execução

Passagem atual: TASK-003 concluída localmente em main, base 077ac9f, com alterações ainda sem commit. Ler PRG-003 antes de iniciar; preservar árvore conciliada e stash 8733be6. Não reaplicar o mesmo stash sobre esta árvore. Continuação física da TASK-002 ainda não executada; limites de diagnóstico abaixo continuam válidos para a próxima tarefa. Não publicar nem implantar sem autorização correspondente.

## Objetivo

Validar o Gate A com duas contas e dois dispositivos, começando pelos riscos de isolamento e sincronização offline registrados em [blockers](blockers.md). Esta é uma proposta de continuidade; não foi executada pela tarefa documental.

## Pré-requisitos e limites

Usar contas e dados sintéticos, API/PostgreSQL de teste e a revisão atual. Conferir instruções do repositório e acesso ao ambiente. Sem ambiente disponível, registrar o impedimento e concluir análise estática útil. Não modificar produção, código funcional, migrações ou o núcleo de roteamento nesta etapa de diagnóstico.

## Prompt de retomada

> Leia docs/ai/README.md, current-plan.md, progress.md, blockers.md e decisions.md, além de DEVELOPMENT_STATE.md e ROADMAP_COMMERCIAL.md na mesma revisão. Registre branch, SHA e responsável em next-task.md. Investigue o Gate A sem presumir falha nem conclusão. Reproduza primeiro troca de conta com histórico, fila pendente e rota ativa; depois criação, progresso e conclusão de rota offline com reconexão; por fim CORS e retomada entre dispositivos. Use dados sintéticos e registre esperado/obtido, evidências e limites. Preserve o núcleo de roteirização. Não implemente correções nesta etapa: entregue diagnóstico, plano incremental e testes de regressão propostos. Atualize os seis arquivos conforme necessário e publique uma passagem de contexto coerente.

## Matriz mínima

| Cenário | Resultado esperado |
| --- | --- |
| A sai, B entra; cache/fila/requisição de A pendente | B não vê nem envia dados de A; dados de A permanecem recuperáveis por A. |
| Rota iniciada, avançada e concluída offline | Após reconexão, servidor recebe uma única rota com estado final e entregas corretos. |
| Rota existente avança offline; retries repetidos | Progresso converge sem perda, duplicação nem regressão. |
| Login da mesma conta em outro dispositivo | Endereços, configurações, histórico e rota disponível correspondem à conta. |
| Fechar/reabrir; terminar rota em outro dispositivo | Retomada preserva progresso e não ressuscita rota encerrada. |
| Duas sessões avançam; snapshot antigo/incompleto | Conflito tratado de forma reproduzível, sem perda silenciosa. |
| CORS web/PWA/APK e origem não autorizada | Origem suportada funciona com preflight; origem não autorizada não recebe acesso CORS. |

## Entrega e conclusão

Entregar matriz preenchida com passou/falhou/não executado, ambiente/revisão, evidência sanitizada, causas confirmadas separadas de hipóteses e plano de correção. Atualizar BLK-001 a BLK-004 e registrar nova entrada PRG. Pedir participação do usuário apenas para acesso ausente, decisão de produto ou etapa física que realmente dependa dele. Não declarar Gate A concluído com cenários críticos não executados.

## Passagem anterior

TASK-001: criação da ponte documental concluída; ver PRG-001 em [progress](progress.md). Publicação/integração deve ser conferida no GitHub; estar nesta branch não significa estar em main.

Adendo de 2026-10-01T14:12:38Z: main local 077ac9f já contém o merge do PR #1 da ponte. TASK-003 conciliou nove conflitos e preservou arquivos novos; 29 testes frontend, núcleo, build, 33 unitários backend e integração PostgreSQL/HTTP aprovados. Ver PRG-003 e adendo de blockers. Próximos cenários: navegador real com A/B e interfaces adicionais; mesma conta em dois dispositivos; rota offline completa até reconexão; encerramento remoto que não ressuscita cache; CORS PWA/APK. Não repetir instalação/migração em banco normal e não declarar Gate A concluído a partir de mocks.

## TASK-004 - revisao e publicacao autorizadas

Data: 2026-10-01T15:27:49Z. Branch codex/gate-a-stash-reconciliation, base 077ac9f confirmada por fetch. Usuario autorizou commit, push e PR; nao autorizou merge/deploy. Ler PRG-004 e [roteiro manual](../../tests/manual-gate-a.md). Stash 8733be6 preservado, sem reaplicacao. Proxima execucao funcional continua TASK-002.
