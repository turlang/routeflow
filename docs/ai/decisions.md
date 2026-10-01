# Registro de decisões

Atualizado em: 2026-10-01T15:49:26Z

Responsável: Codex/ECC

Base inspecionada: `077ac9fcbe17b3da3348242b2dd863877d47eee3` (`main` local)

Status: ativo

## DEC-001 — Ponte versionada

Data: 2026-09-30T17:10:47Z

Responsável: Codex/ECC

Status: aceita

Origem: solicitação explícita do usuário nesta tarefa.

Adotar os seis arquivos em docs/ai como interface de colaboração. Codex/ECC mantém execução e próxima tarefa; ChatGPT lê contexto estratégico e propõe planos. Consequência: continuidade auditável depende de publicação no GitHub e acesso de leitura; automação entre sessões não está instalada.

## DEC-002 — Preservar evidências e distinguir implementação de aceite

Data: 2026-09-30T17:10:47Z

Responsável: Codex/ECC

Status: aceita

Origem: regra documental desta ponte, baseada no roadmap e no checkpoint existente.

Preservar DEVELOPMENT_STATE como checkpoint geral e usar esta pasta para síntese operacional com referências. Não declarar Gate A concluído com base apenas no código ou em relatos históricos. Uma divergência exige adendo com evidência. Consequência: trabalho concluído não é reaberto sem hipótese verificável; lacunas de validação ficam explícitas.

## DEC-003 — Limite da entrega atual

Data: 2026-09-30T17:10:47Z

Responsável: Codex/ECC

Status: aceita

Origem: solicitação explícita de não alterar código funcional.

Modificar somente docs/ai/*.md. As hipóteses sobre contas, offline, CORS e retomada serão investigadas em TASK-002; sua inclusão no plano não autoriza correção funcional, deploy ou mudança de configuração nesta entrega.

Adendo de 2026-10-01T14:12:38Z: limite de DEC-003 aplicado à TASK-001 original; substituído para TASK-003 por DEC-004, conforme nova autorização explícita do usuário.

## DEC-004 — Conciliação local do Gate A com main

Data: 2026-10-01T14:12:38Z | Responsável: Codex/ECC | Status: aceita.

Origem: pedido explícito para resolver stash apply, preservar os dois trabalhos, testar e atualizar a ponte, sem apagar stash/push/deploy. Substitui o limite documental de DEC-003 apenas nesta tarefa.

Conciliar funcionalmente cada conflito. Manter o gateway, administração, billing, validações, quotas e comprovantes atuais e incorporar o storage por API/conta, migração em quarentena e outbox durável. A deduplicação e o limite comercial devem compartilhar o bloqueio de usuário: retry de rota existente não consome nova quota; criações concorrentes não ultrapassam a quota.

Preservar arquivos novos, testes e stash. Validação PostgreSQL restrita a routeflow_gate_a_test com contêiner temporário; recursos normais preservados. Evidências e limitações em PRG-003. Gate A permanece em_validacao.

## Modelo para nova decisão

Copiar para uma nova entrada: ID DEC; timestamp; responsável; status proposta/aceita; problema; alternativas; escolha; motivo; consequências; evidências; decisão substituída (se houver). Ao aceitar uma substituição, acrescentar nota datada à antiga e criar a nova, preservando o texto original.

## DEC-005 — Publicar proposta revisada sem integrar

Data: 2026-10-01T15:27:49Z | Responsável: Codex/ECC | Status: aceita.

Origem: nova autorização explícita do usuário para branch própria, commit, push e PR para main. Preservar stash; merge/deploy não autorizados. A restrição de publicação da TASK-003 é histórica; limites físicos/produção de DEC-004 continuam. Branch codex/gate-a-stash-reconciliation, base origin/main 077ac9f confirmada por fetch; evidências PRG-004. Gate A permanece em_validacao.

## DEC-006 — Ausência confirmada e conflito offline

Data: 2026-10-01T15:49:26Z | Responsável: Codex/ECC | Status: aceita.

Autorização: continuação explícita no PR #2, correção e checks, sem merge/deploy. Ausência de rota é somente JSON null de resposta HTTP bem-sucedida, nunca falha de rede/parsing. Aplicar resposta apenas se não houver edição pendente ou nova identidade durante a espera. Histórico/outboxes permanecem preservados. Quando o servidor confirma estado final conflitante, desabilitar retomada e conservar o snapshot pendente em fila bloqueada para revisão, em vez de apagar dados ou reabrir a rota. Evidência PRG-005; validação física permanece pendente.
