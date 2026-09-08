# RouteFlow Operations Runbook

## Health
- `GET /health`: processo HTTP ativo.
- `GET /ready`: banco acessível e estado de configuração de routing/billing.
- Em produção, monitore ambos externamente. `/ready` deve gerar alerta quando retornar 503.

## PostgreSQL backup
Use backups automáticos do provedor em produção e mantenha pelo menos uma cópia recuperável fora do processo da API. Antes de migrações destrutivas, gere backup manual. Nunca armazene `DATABASE_URL`, dumps ou credenciais no GitHub.

## Restore drill
1. Crie banco temporário isolado.
2. Restaure o backup mais recente.
3. Configure uma instância temporária da API para esse banco.
4. Execute `npx prisma migrate deploy`.
5. Valide `/ready`, autenticação, endereços, rota ativa, histórico e Proof of Delivery.
6. Registre data, duração e resultado do exercício.

Um backup sem restore testado não conta como estratégia de recuperação.

## Incident response
1. Identifique se a falha está em frontend, API, banco, routing, billing ou storage.
2. Preserve logs e horário do incidente sem registrar tokens, senhas ou conteúdo sensível desnecessário.
3. Se houver risco de corrupção, interrompa operações de escrita antes de restaurar dados.
4. Faça rollback para commit/deploy conhecido quando a falha vier de release.
5. Para indisponibilidade de routing, não anuncie rota como validada até o motor responder novamente.
6. Para billing, preserve o estado atual do usuário e reprocesse webhooks idempotentemente quando o provedor voltar.

## Secrets
Rotacione imediatamente qualquer segredo compartilhado fora do gerenciador de secrets. Produção deve manter JWT, banco, billing, routing privado e storage apenas nas variáveis protegidas da plataforma.

## Release gate
Antes de liberar versão paga: CI verde, migrações aplicadas, backup recente, restore drill realizado, monitoramento ativo, routing com SLA, storage privado funcionando, billing real validado e teste físico Android/iPhone concluído.
