# RouteFlow API

Primeira fundação do Gate A: autenticação, PostgreSQL, endereços persistentes, entregas e rotas.

## Desenvolvimento
1. Copie `.env.example` para `.env`.
2. Configure um PostgreSQL em `DATABASE_URL`.
3. `npm install`
4. `npm run db:generate`
5. `npx prisma migrate dev --name init`
6. `npm run dev`

## Endpoints iniciais
- `GET /health`
- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `GET /v1/me`
- `GET /v1/addresses`
- `POST /v1/addresses/import`
- `PATCH /v1/addresses/:id`
- `GET /v1/deliveries`
- `POST /v1/deliveries`
- `GET /v1/routes`

A aplicação web atual continua funcional enquanto a sincronização é integrada progressivamente.

## Gate A: sincronização de rotas

`POST /v1/routes` aceita `status` (`ACTIVE`, `COMPLETED`, `CANCELLED`) e
`finishedAt`. Sem `status`, mantém o padrão `ACTIVE`. A sincronização sempre
envia um `clientId` estável. O servidor usa o usuário autenticado como `userId`;
criação e repetição são serializadas por bloqueio da linha do usuário e pela
restrição única existente `(userId, clientId)`. A primeira criação retorna 201;
repetições retornam 200 e a mesma rota, sem repetir cancelamentos.

Importar uma rota já concluída/cancelada não cancela a rota ativa. Atualizações
não reduzem progresso nem reabrem rotas terminadas. Não há nova migração SQL.

## Testes de integração

Use exclusivamente o banco `routeflow_gate_a_test`, com as migrações aplicadas.
Configure `DATABASE_URL` para esse banco e `JWT_SECRET` com pelo menos 24
caracteres. Execute `npm run test:integration` em `server/`.

Com a imagem Docker existente, configure GATE_A_TEST_DATABASE_URL para o banco
exclusivo routeflow_gate_a_test na rede Docker. Execute na raiz do projeto;
monte esquema e package.json atuais para evitar uma imagem desatualizada.

```powershell
docker compose run --rm --no-deps -e "DATABASE_URL=$env:GATE_A_TEST_DATABASE_URL" -v "${PWD}/server/package.json:/app/package.json:ro" -v "${PWD}/server/prisma:/app/prisma:ro" -v "${PWD}/server/src:/app/src:ro" -v "${PWD}/server/tests:/app/tests:ro" -v "${PWD}/server/test:/app/test:ro" --entrypoint sh api -c 'npm install --no-audit --no-fund && npx prisma generate && npx prisma migrate deploy && node --test tests/route-sync.integration.test.mjs test/*.test.js'
```

O teste cobre requisições HTTP concorrentes, repetição após resposta perdida,
isolamento entre usuários e preservação de outra rota ativa. O banco normal
`routeflow` não é utilizado. Os usuários e rotas criados pelo teste são removidos
ao final. Esses comandos não atualizam o contêiner principal da API.

O CI de testes unitarios usa `node --test test/*.test.js`; a integracao exige
banco dedicado e nao deve ser descoberta automaticamente nesse job.
