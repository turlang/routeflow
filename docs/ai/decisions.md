# Registro de decisões

Atualizado em: 2026-09-30T17:10:47Z

Responsável: Codex/ECC

Base inspecionada: `ddd1bb97f20783b93970aa57e3e2bfaefc0446f2` (`origin/main`)

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

## Modelo para nova decisão

Copiar para uma nova entrada: ID DEC; timestamp; responsável; status proposta/aceita; problema; alternativas; escolha; motivo; consequências; evidências; decisão substituída (se houver). Ao aceitar uma substituição, acrescentar nota datada à antiga e criar a nova, preservando o texto original.
