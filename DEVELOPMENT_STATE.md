# RouteFlow — Development State

Updated: 2026-09-09
Target: RouteFlow 1.0 Commercial Beta
Branch: `main`

## Status
The repository has reached the software-complete commercial-candidate boundary for the current beta scope. Core routing, delivery operation, SaaS entitlements and the Mercado Pago Pix test lifecycle are implemented. Remaining launch items are production credentials/infrastructure, private proof-photo storage, production routing SLA and physical mobile/route validation.

## Completed product core
- Excel import preserving source columns, coordinate validation and physical-stop grouping.
- Directed road-network optimization, manual ordering, route statistics and internal GPS navigator.
- RouteFlow API routing gateway with input validation, dedicated quota, timeout/error classification and configurable provider endpoint.
- Address intelligence/registry, authentication, PostgreSQL persistence, route/delivery history and cross-device active-route resume.
- Proof of Delivery model with delivered/failed, GPS, recipient, occurrence notes and independent multi-package outcomes/failure reasons.
- Offline delivery outbox, automatic retry and visible sync state/manual retry.
- Private Proof storage boundary with account-scoped object keys and configuration detection. Actual photo bytes still require an external private object-storage provider/credentials.
- SaaS plans and server-side entitlements, subscriber area, plan limits, billing history and automatic plan activation after confirmed payment.
- Mercado Pago Checkout Transparente / Orders API Pix integration in test mode: order creation, test QR/payment flow, authoritative order polling, checkout persistence and plan activation were validated end-to-end. A real test purchase changed the account plan from Motorista to Pro.
- Mercado Pago webhook simulator is validated with `200 OK` using the official SDK signature validator.
- Mercado Pago sandbox order notifications are hardened for the observed test-signature mismatch: production keeps strict HMAC validation; only in non-production may an `ORDTST...` notification with a mismatched signature proceed when its order ID already belongs to a local BillingCheckout, and the final state is then fetched authoritatively from `GET /v1/orders/{id}` using the server-side Access Token. Unrecognized test IDs remain unauthorized.
- Webhook secret configuration now supports dedicated `MERCADOPAGO_WEBHOOK_SECRET_TEST` and `MERCADOPAGO_WEBHOOK_SECRET_PRODUCTION`, with the existing `MERCADOPAGO_WEBHOOK_SECRET` retained as compatibility fallback.
- Card recurring remains on the already-working Asaas path during the financial migration.
- Operational dashboard for 30-day deliveries, success/failure, routes and planned kilometers.
- Request IDs, structured JSON logs, API/auth/routing throttles, payload limits and database readiness.
- PWA installation metadata/icon, standalone mode and hardened offline shell cache.
- Production operations runbook and technical Terms/LGPD Privacy drafts.

## Automated quality/release gates
- Prisma schema validation and client generation.
- Syntax validation for all backend/frontend modules and service worker.
- Backend unit tests include Mercado Pago webhook-environment policy coverage: dedicated test/production secret selection, ORDTST recognition, sandbox fallback constraints and explicit prohibition of that fallback in production.
- Production dependency audit is recorded in CI; do not apply forced dependency downgrades without migration-compatibility validation.
- Release-artifact/PWA checks.
- Scheduled/on-demand deployed-production smoke workflow validates health, database readiness and routing status.
- GitHub Actions `RouteFlow Commercial Readiness` run #154 for commit `7ed76ab3b2e061613c533e616598954939c32846` completed successfully.
- GitHub Pages deployment for the same commit completed successfully.

## Verified Render state
- Workspace explicitly authorized by owner: `My Workspace`.
- API service: `routeflow-api`, Virginia, public URL active, main branch, manual deployment because auto-deploy is disabled.
- Current deployed candidate: `7ed76ab3b2e061613c533e616598954939c32846`.
- Render deploy `dep-dagpf2afngtc73fidt00` completed successfully and is live.
- Production startup runs `prisma migrate deploy`; current schema is applied.
- Structured startup/request logging is active in Render.
- Mercado Pago Pix order creation returned `201` in the validated sandbox purchase; authoritative order reads returned `200`; the user plan was activated successfully.
- Earlier sandbox order Webhooks exposed a Mercado Pago test-signature mismatch even though the simulator validated correctly. The current backend addresses this only for locally-known `ORDTST...` orders by re-fetching the resource from Mercado Pago before any reconciliation; production does not permit this fallback.
- Database `routeflow-db`: PostgreSQL 17, Virginia, free plan, no HA/connection pool/disk autoscaling. Render reports expiration on 2026-10-07, so it is not acceptable as the final paid-customer database.
- Render's connector-side direct SQL query still fails because that connector attempts a non-TLS connection while the database requires TLS. This is a connector limitation, not evidence of an application DB failure; Prisma migrations and application reads/writes are operational.

## External activation gates before public paid launch
1. Configure private object storage credentials/provider, then enable and validate real Proof photo upload.
2. Configure a production routing provider/self-hosted instance with SLA in `ROUTING_BASE_URL`; public OSRM remains fallback/development infrastructure.
3. Mercado Pago: switch from test to production Access Token only when production credentials are ready, configure `MERCADOPAGO_WEBHOOK_SECRET_PRODUCTION` directly in Render, keep production HMAC validation strict, then perform one controlled real Pix purchase/refund validation. Do not reuse sandbox credentials in production.
4. Decide whether Mercado Pago will also replace Asaas for recurring card; until that migration is validated, keep the working Asaas recurring-card path.
5. Approve paid-grade API/database resources, backups/alerts/monitoring and perform a restore drill. Current Render free Postgres expires and has no HA.
6. Replace technical legal drafts with reviewed company/controller information.
7. Validate the APK/Android device and at least one real end-to-end delivery route including GPS movement, offline/reconnect, restart/resume, delivered/failed, multi-package and photo proof.

## Continuity rule
Treat this file as the durable handoff. Do not reopen completed core work unless a regression is found. The next phase is production service activation plus physical release validation.
