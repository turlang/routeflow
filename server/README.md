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
