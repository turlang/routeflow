# Bloqueios e pendências de validação

Atualizado em: 2026-09-30T17:10:47Z

Responsável: Codex/ECC

Base inspecionada: `ddd1bb97f20783b93970aa57e3e2bfaefc0446f2` (`origin/main`)

Status: aberto

Os itens abaixo impedem afirmar o aceite atual do Gate A ou a prontidão de lançamento. Não impediram criar esta documentação. Risco observado não significa incidente reproduzido.

## BLK-001 — Isolamento local entre contas

Data: 2026-09-30T17:10:47Z

Status: aberto | Prioridade: alta | Responsável: Codex/ECC

Evidência: observado_no_codigo.

[api.js](../../src/api.js) remove somente token e usuário em clearSession. [history-sync.js](../../src/history-sync.js), [route-session.js](../../src/route-session.js) e [sync.js](../../src/sync.js) usam chaves locais sem namespace de conta. O login chama sincronização do histórico. Hipótese: dados locais/pendentes de A podem aparecer ou ser enviados na sessão B; não reproduzido nesta tarefa.

Desbloqueio: teste A → logout → B com fila pendente, rota ativa e requisição em trânsito; verificar UI, payloads e persistência por usuário. Se falhar, registrar reprodução e propor correção isolada.

## BLK-002 — Ciclo de vida da rota offline

Data: 2026-09-30T17:10:47Z

Status: aberto | Prioridade: alta | Responsável: Codex/ECC

Evidência: observado_no_codigo.

A fila em history-sync é de entregas. Em route-session, beginRoute mantém estado local quando createRoute falha; markRouteProgress/finishRoute enviam apenas com serverId. syncActiveRoute busca rota remota e retorna estado local quando ela não existe; não há criação da rota local nesse caminho.

Desbloqueio: criar rota sem conexão, avançar e finalizar, reconectar e comprovar criação única e estado correto no servidor e em outro dispositivo. Testar também rota já sincronizada que avança offline. Não tratar retry de entregas como prova de retry de rotas.

## BLK-003 — CORS nos ambientes reais

Data: 2026-09-30T17:10:47Z

Status: aberto | Prioridade: média | Responsável: Codex/ECC; operador fornece acesso se necessário

Evidência: observado_no_codigo; configuração implantada nao_verificado.

CORS_ORIGIN contém lista de origens exatas no backend. O exemplo não comprova a configuração do Render nem a origem usada pelo APK.

Desbloqueio: registrar origem efetiva de cada cliente suportado, testar OPTIONS e requisição autenticada com Content-Type/Authorization; origem permitida deve funcionar e origem não permitida não receber autorização CORS. Diferenciar CORS de autenticação, indisponibilidade e rede. Não liberar wildcard como atalho.

## BLK-004 — Retomada e conflitos entre dispositivos

Data: 2026-09-30T17:10:47Z

Status: aberto | Prioridade: alta | Responsável: Codex/ECC (preparação), usuário/testador (dispositivos físicos)

Evidência: implementação observada; validação física atual nao_verificado.

Retomada existe; no syncActiveRoute, avanço local maior é enviado à nuvem para o mesmo clientId. Resposta remota sem rota ativa preserva a local. Validar se estado antigo pode reaparecer após finalização em outro dispositivo e se duas sessões preservam progresso.

Desbloqueio: mesma conta em desktop e celular, fechar/reabrir, reconexão, avanços concorrentes, finalização/cancelamento remoto e rota antiga sem snapshot. Incluir endereços, configurações e histórico do aceite original. Registrar versão, resultado esperado/obtido e evidência sanitizada.

## BLK-005 — Infraestrutura e checkpoint desatualizado

Data: 2026-09-30T17:10:47Z

Status: aberto | Prioridade: alta antes do lançamento | Responsável: operador; Codex/ECC verifica quando houver acesso

Evidência: relato_documentado em DEVELOPMENT_STATE de 2026-09-09.

O checkpoint registra PostgreSQL gratuito com expiração em 2026-10-07, deploy manual e gates externos pendentes. Estado atual não consultado nesta tarefa. Há descrições de pagamentos diferentes entre README e checkpoint; não extrapolar nenhuma delas como estado operacional atual.

Desbloqueio: reconfirmar disponibilidade, validade do banco e revisão implantada antes de teste em produção. Contratação, mudanças de infraestrutura e pagamentos ficam fora desta tarefa.

## Encerramento de um item

Preservar descrição original. Acrescentar data, responsável, status resolvido/descartado e teste/evidência que sustenta o encerramento, com referência ao progresso. Falta de reprodução isoladamente não prova correção.
