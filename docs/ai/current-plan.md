# Plano atual

Atualizado em: 2026-09-30T17:10:47Z

Responsável: Codex/ECC

Base inspecionada: `ddd1bb97f20783b93970aa57e3e2bfaefc0446f2` (`origin/main`)

ID: PLAN-001

Status: em_validacao

## Objetivo

Consolidar a passagem de contexto e estabelecer evidências atuais do Gate A, sem reimplementar funcionalidades já existentes. O aceite original exige trocar de dispositivo mantendo endereços, configurações e histórico do mesmo usuário ([roadmap](../../ROADMAP_COMMERCIAL.md)).

## Estado conhecido

| Tema | Estado e evidência | Validação ainda necessária |
| --- | --- | --- |
| Gate A | API, autenticação, PostgreSQL e retomada constam como implementados no [checkpoint de 09/09](../../DEVELOPMENT_STATE.md). Relato documentado; não equivale a novo aceite. | Matriz integrada com duas contas e dois dispositivos. |
| Isolamento de contas | Backend filtra recursos por usuário; [api.js](../../src/api.js) limpa token/usuário no logout, enquanto caches e fila usam chaves locais globais. Observado no código. | Reprodução de A → logout → B, incluindo fila pendente e requisições em trânsito (BLK-001). |
| Offline | [history-sync.js](../../src/history-sync.js) possui fila de entregas, retry ao voltar online e importação do histórico. | Separar entrega offline de criação/progresso/finalização de rota offline (BLK-002). |
| CORS | [server.js](../../server/src/server.js) valida origens contra CORS_ORIGIN; [exemplo](../../server/.env.example) inclui localhost e https://turlang.github.io. | Origens efetivas de web/PWA/APK, preflight e configuração implantada (BLK-003). |
| Retomada | [route-session.js](../../src/route-session.js) recupera rota ativa; [main.js](../../src/main.js) restaura estado operacional. | Fechar/reabrir, mudar de dispositivo, concorrência, rota finalizada remotamente e dados antigos (BLK-004). |

Base remota atual ddd1bb9 restaura o otimizador anterior aos experimentos de GPS. Nenhuma alteração nesse núcleo faz parte desta tarefa. O checkpoint geral é anterior à base atual; sua descrição de deploy/CI é histórica, não verificação de produção em 30/09.

## Sequência e critérios

1. Ponte documental: criar os seis arquivos, verificar links e consistência e publicar proposta no GitHub.
2. TASK-002: reproduzir e documentar a matriz do Gate A em ambiente de teste, começando por isolamento; preservar dados sintéticos por conta.
3. Somente com evidência, propor correções incrementais e testes de regressão dentro de novo escopo autorizado.
4. Encerrar o Gate A apenas com evidências de: nenhuma leitura/envio cruzado entre contas; sincronização após reconexão sem perda/duplicação; retomada correta em outro dispositivo; endereços, configurações e histórico consistentes; CORS válido nas origens suportadas; importação e navegação preservadas.

Escopo executado nesta alteração: somente docs/ai/*.md. Não alterar código, migrações, infraestrutura, credenciais, roteamento ou documentos históricos.

## Pendências gerais fora deste escopo

O checkpoint mantém gates externos de storage privado, roteamento com SLA, infraestrutura, credenciais de produção e validação móvel. Registra expiração do banco gratuito em 2026-10-07: informação histórica a reconfirmar (BLK-005), sem presumir falha atual ou contratar recursos.
