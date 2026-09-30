# Próxima tarefa

Atualizado em: 2026-09-30T17:14:28Z

Responsável: Codex/ECC

Base inspecionada: `ddd1bb97f20783b93970aa57e3e2bfaefc0446f2` (`origin/main`)

ID: TASK-002

Status: proposta

Responsável previsto: Codex/ECC

Executor reservado: nenhum

Branch de execução: a definir ao iniciar

Base: atualizar origin/main e registrar SHA antes da execução

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
