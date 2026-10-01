# Progresso e evidências

Atualizado em: 2026-10-01T15:56:18Z

Responsável: Codex/ECC

Base inspecionada: `077ac9fcbe17b3da3348242b2dd863877d47eee3` (`main` local)

Status: em_andamento (TASK-005 checks remotos; Gate A em_validacao)

## PRG-001 — 2026-09-30T17:10:47Z — Codex/ECC

Tarefa: TASK-001 — criar ponte de colaboração.

Status: concluida quanto à criação documental.

Branch: codex/routeflow-ai-bridge.

- Localizado o repositório turlang/routeflow. A cópia original em main estava 196 commits atrás da referência remota; referências atualizadas e trabalho isolado na base ddd1bb97f20783b93970aa57e3e2bfaefc0446f2, preservando a cópia original.
- Inspecionados roadmap, README, DEVELOPMENT_STATE, COMMERCIAL_READINESS e módulos de autenticação, histórico, rota e CORS.
- Criados os seis arquivos desta ponte, com responsabilidades, protocolo de publicação, estados, histórico de decisões e próxima tarefa.
- Observado_no_codigo: fila offline de entregas e restauração de rota já existem. Chaves locais compartilhadas, limites da recuperação de rota sem serverId e ausência de validação atual de CORS foram registrados como riscos/pendências, sem afirmar reprodução.
- Relato_documentado: checkpoint de 2026-09-09 informa núcleo implementado e CI/deploy no commit 7ed76ab3b2e061613c533e616598954939c32846. Não reexecutados nem confirmados nesta tarefa.
- Limitações: nenhum teste com API/PostgreSQL, duas contas, dispositivos físicos ou produção foi executado. Gate A permanece em_validacao.
- Próximo passo: publicar a alteração documental e, em tarefa posterior, executar TASK-002 conforme next-task.

## Como continuar o registro

Acrescentar entradas PRG com timestamp, tarefa, SHA, ação, comando/cenário de validação, resultado real, limitações e próximo passo. Em falha, registrar resultado e BLK relacionado. Não substituir este checkpoint por um resumo sem histórico.

## PRG-002 — 2026-09-30T17:14:28Z — Codex/ECC

Tarefa: TASK-001. Status: concluida (validação documental).

Validados seis arquivos, timestamps e status, todos os links locais, ausência de marcadores de conflito e escopo exclusivo em docs/ai. git diff --cached --check aprovado após normalizar espaços de fim de linha. Nenhum teste funcional executado, pois esta alteração modifica somente documentação. Próxima ação: publicação da branch e PR; integração em main continua pendente.

## PRG-003 — 2026-10-01T14:12:38Z — Codex/ECC

Tarefa: TASK-003 — conciliar conflitos de git stash apply. Status: concluida localmente.

Base: main, `077ac9fcbe17b3da3348242b2dd863877d47eee3`. A base já contém a ponte documental via PR #1; as notas anteriores de integração pendente são históricas. Nenhuma atualização remota, commit, push ou deploy nesta tarefa.

ECC disponível nesta sessão: pacote 2.2.2 e skill git-workflow lida. README e os cinco arquivos da ponte foram lidos antes da resolução. Os estágios 2 (main) e 3 (stash), a base comum e os trechos sem conflito foram considerados; nenhuma seleção integral de ours/theirs foi usada como resultado final.

Conciliação dos nove arquivos:

| Arquivo | Resultado |
| --- | --- |
| server/package.json | Scripts check/db:validate, engines e Mercado Pago da main, mais test:integration local. |
| server/src/server.js | Administração, billing, roles, segurança, observabilidade, gateway, validações e comprovantes da main; criação/atualização de rotas por route-service, estado final offline e exportação para testes. Quotas verificadas sob o mesmo bloqueio de usuário, após deduplicação. |
| src/api.js | Sessão e requisições com escopo local; todos os exports de gateway, relatórios, administração e billing preservados. Default da API publicada preservado em storage. |
| src/auth-ui.js | Área do assinante/admin da main com migração, filas, mensagens e verificações de sessão do Gate A. |
| src/delivery-history-ui.js | Comprovantes por pacote e IDs estáveis da main em storage por conta, com atualização da UI no logout. |
| src/history-sync.js | Fila offline e campos FAILED/recebedor/motivo/foto da main com escopo por conta e descarte de respostas antigas; flush preserva novas entradas pendentes. |
| src/main.js | Gateway, importação que preserva a rota ativa, snapshots e comprovantes da main; proteção de continuações/GPS e limpeza da sessão local. Início adaptado ao contrato de beginRoute; progresso final e recebedor corrigidos na ligação entre os módulos. |
| src/route-history-ui.js | Histórico com snapshot, deduplicação por clientId/serverId e proteção de rotas pendentes do Gate A. |
| src/route-session.js | Outbox durável, cancelamento, retry e escopo do Gate A; atualização de snapshot ao avançar. |

Preservados os arquivos novos route-service, storage, legacy-migration, route-sync, tests/ e server/tests/, além de registry-ui, sync, package.json e server/README.md já modificados sem conflito. Acrescentado stash-reconciliation.test.mjs. O teste de UI foi adaptado aos controles atuais e verifica comprovante FAILED, recebedor, GPS e progresso final antes da troca de conta. O teste antigo do núcleo recebeu coordenadas sintéticas válidas, pois a main rejeita 0,0. precision-route-control recebeu apenas uma guarda para importação em Node; algoritmo de otimização em core.js preservado. .gitignore exclui dependências e artefatos locais gerados na validação.

Evidência validado_por_teste em 01/10:

- `npm.cmd test`: 29/29 testes Node e `core tests: OK`.
- `npm.cmd run build`: Vite aprovado, 29 módulos.
- `node --test server/test/*.test.js`: 33/33 aprovados no host Node 24.16.0.
- Integração e unitários em contêiner temporário Node 22.23.2/PostgreSQL 17: 34/34 aprovados (33 unitários + 1 teste integrado com múltiplos cenários). Código e testes atuais montados para leitura; dependências atuais instaladas e Prisma 6.19.3 gerado somente no contêiner temporário.
- Banco exclusivo preexistente `routeflow_gate_a_test`: aplicadas quatro migrações existentes que faltavam, totalizando seis; reexecução sem migrações pendentes. Nenhum banco normal ou serviço principal atualizado. Usuários sintéticos removidos pelo finally do teste.
- Integração: 12 criações simultâneas da mesma identidade geram uma rota; retry retorna 200; contas diferentes permanecem separadas; progresso não regride; rota concluída não reabre; quota FREE concorrente aceita duas de quatro rotas e rejeita as demais; replay continua permitido na quota; limite de 25 paradas preservado.
- CORS local: OPTIONS permitido retorna 204 com origem autorizada; origem rejeitada não recebe allow-origin e mantém o comportamento atual 500 da main. Isso não comprova CORS implantado/APK.

Falhas intermediárias corrigidas: importação de window no teste Node, mocks antigos da UI, dados 0,0 e composição inicial de exports. Dependências ausentes e acesso npm bloqueado pelo sandbox foram resolvidos com instalação autorizada. A imagem Docker antiga tinha somente duas migrações e não incluía Mercado Pago; a validação final utilizou esquema/dependências atuais. Nenhuma falha desses ensaios foi contabilizada como aprovação.

Stash preservado: `stash@{0}`, SHA `8733be6d1b05cbf2058ee1248d505d9e61121ef8`, “Trabalho local antes de atualizar main”. Checagem final: índice sem entradas não conciliadas, ausência de marcadores no código/docs/testes e diff --check sem erros. Alterações permanecem locais e preparadas no índice para revisão, sem commit.

Limitações: testes de UI usam doubles de DOM/mapa/GPS; não houve navegador real, PWA/APK, dois dispositivos físicos, produção, provedor viário externo nem pagamentos reais. Não encerram Gate A. Próxima ação: TASK-002 e pendências BLK-001 a BLK-005 com o código conciliado; ver next-task.

## PRG-004 — 2026-10-01T15:27:49Z — Codex/ECC

Tarefa: TASK-004 — revisar, criar branch, commit e PR para main, autorizada pelo usuário. Status: revisão concluída; publicação em andamento.

Branch: codex/gate-a-stash-reconciliation. Base local/remota após git fetch: 077ac9fcbe17b3da3348242b2dd863877d47eee3, sem avanço de origin/main. Revisados código conciliado, contratos, filas, migração, testes e registros; stash 8733be6 preservado.

Correção de revisão: CI de unitários agora usa `node --test test/*.test.js`, impedindo descoberta da integração sem banco nesse job. Integração continua obrigando banco dedicado quando invocada; não foi aprovada por skip. README do servidor atualizado para montar esquema/dependências atuais em contêiner temporário e usar variável de ambiente em vez de credenciais literais. Roteiro manual em [tests/manual-gate-a.md](../../tests/manual-gate-a.md).

Reexecução real nesta revisão: npm.cmd test 29/29 e núcleo OK; build aprovado; backend unitários 33/33; sintaxe de src/*.js e server/src/*.js aprovada. Contêiner temporário Node 22/PostgreSQL 17: 34/34 (unitários + integração HTTP), sem migrações pendentes e limpeza dos usuários sintéticos pelo teste. Evidências de 15:27Z, sem alteração no serviço principal.

Conteúdo revisado: sem entradas Git não conciliadas, sem marcadores e diff --check aprovado. Nenhum token/chave privada/JWT literal detectado por padrões de credenciais, seguido de revisão contextual; literais dos testes são sintéticos. node_modules, server/node_modules e dist ignorados; sem .env, log, backup, planilha real ou temporário no conjunto revisado. A verificação não substitui auditoria externa de segredos.

Não houve teste manual real nem aceite do Gate A. Persistem BLK-001 a BLK-005, especialmente controles adicionais da main e retomada de rota encerrada remotamente. Próximo passo: publicar branch e PR sem merge/deploy; depois TASK-002 conforme roteiro.

### Publicação confirmada — 2026-10-01T15:35:19Z

TASK-004 concluída: commit de código/revisão `244c6ad5de586cc0a79c27b674a2a0528c0a22a1` publicado na branch codex/gate-a-stash-reconciliation; [PR #2](https://github.com/turlang/routeflow/pull/2) aberto para main. Consulta via gh confirma OPEN, MERGEABLE, mergedAt null e autoMergeRequest null. Nenhum merge/deploy executado. Este adendo documental será publicado na mesma branch.

Os workflows atuais não disparam checks no PR/nessa branch: statusCheckRollup vazio. Resultados acima são execuções locais e integração em contêiner, não CI remoto aprovado. Stash `8733be6d1b05cbf2058ee1248d505d9e61121ef8` intacto; árvore limpa após o commit inicial, nenhuma entrada não conciliada. Próximo passo: usuário/testador executar [roteiro manual](../../tests/manual-gate-a.md) usando frontend/API desta branch em ambiente de teste, registrar resultado em TASK-002, revisar PR; Gate A permanece em_validacao.

## PRG-005 — 2026-10-01T15:49:26Z — Codex/ECC

Tarefa: TASK-005 — corrigir encerramento remoto e habilitar qualidade no PR #2. Status: implementação/validação local concluídas; checks remotos aguardando publicação.

Branch: codex/gate-a-stash-reconciliation. Base da tarefa: 11ca2c8d0bf5b0dcc906d4408f4873bdebc0d733; origin/main confirmado por fetch em 077ac9f. Escopo autorizado pelo usuário: correção incremental, regressões, workflow, documentação e publicação na mesma branch, sem merge/deploy. Stash 8733be6 preservado.

Correção: getActiveRoute aceita ausência somente com JSON válido null, rejeitando forma inválida; a API não converte erro de parsing bem-sucedido em ausência. syncActiveRoute preserva cache em falha de rede/HTTP/parsing e mantém fila pendente. Sem pendências da rota, ausência confirmada remove apenas cache ativo, preservando histórico/outras filas; edições e nova rota durante GET são conferidas novamente antes de aplicar a resposta. Resposta antiga de A não altera B.

Estado terminal confirmado na resposta do retry fecha a navegação/retomada, mas mantém o snapshot offline conflitante na outbox bloqueada, com mensagem de atenção. Não descarta alterações pendentes nem reabre a rota no servidor. Na UI, limpeza ocorre apenas para a identidade da rota exibida; planilha nova ainda não iniciada não é apagada por ausência da rota anterior. restoreOperational recusa estado terminal.

Regressões novas em active-route-recovery.test.mjs: null sem fila, histórico e outras filas preservados, falha de rede/HTTP, JSON/forma inválidos, fila offline, edição/nova rota durante GET, troca A/B e COMPLETED/CANCELLED conflitantes. Teste de UI ampliado verifica encerramento de navegador/GPS/retomada após ausência remota confirmada, com doubles.

Workflow commercial-readiness: pull_request para main, além de push main e workflow_dispatch; novo passo npm test (Gate A + núcleo). Preservados instalação backend, Prisma validate/generate, sintaxe frontend/backend/sw, 33 unitários backend, auditoria crítica de dependências e verificação de artefatos. Não adicionada ação de deploy.

Validação real local: 40/40 testes Gate A e core tests OK em Windows/Node 24.16.0; mesmos 40/40 e núcleo em contêiner temporário Linux/Node 22.23.2. Build Vite aprovado. Backend 33/33 unitários; sintaxe de src, server/src e sw aprovada; diff --check sem erros. Falha inicial de duas regressões por espera do timer do lease corrigida usando sinal explícito de requisição iniciada. Nenhuma falha intermediária foi contada como aprovação.

Não alterados backend/esquema/migrações; integração HTTP/PostgreSQL da PRG-004 permanece evidência histórica de sua execução, não foi reexecutada nesta tarefa. Novos testes e workflow não validam PWA/APK nem dois dispositivos físicos. Roteiro manual atualizado: comparar null confirmado com rede bloqueada e estado final com edição offline pendente. Gate A continua em_validacao, BLK-004 ainda exige reprodução física. Próximo passo: publicar e acompanhar checks remotos do PR; registrar resultado efetivo abaixo.

### Check remoto confirmado — 2026-10-01T15:56:18Z

Commit 59bc4a1dc88e35d16269966c35eaf1a4da77d21b publicado no PR #2. [Run 36887757820](https://github.com/turlang/routeflow/actions/runs/36887757820), evento pull_request: validate SUCCESS, concluído em 15:53:51Z. Passos Prisma validate/generate, sintaxe, 33/33 unitários backend, 40/40 Gate A e core OK, auditoria e artefatos todos success. Não houve job de deploy.

Auditoria manteve o critério existente `--audit-level=critical` e passou, porém reportou 3 achados high na cadeia deepmerge-ts → @prisma/config → prisma. Registrado BLK-006, sem executar audit fix --force nem mudar dependências nesta correção. Check verde não significa ausência de vulnerabilidades altas.

Conferência adicional: evento online também chama recoverActiveRoute para reconciliar cache após reconexão sem recarga. Teste de UI cobre essa reconciliação automática; novamente 40/40 e núcleo aprovados em Windows/Node 24 e Linux/Node 22, build aprovado. A alteração de reconexão segue em publicação na mesma branch; resultado remoto da nova revisão será confirmado antes da entrega.
