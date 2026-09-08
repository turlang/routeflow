# RouteFlow — Development State

Updated: 2026-09-08
Target: RouteFlow 1.0 Commercial Beta
Branch: `main`

## Status
The repository has reached the software-complete commercial-candidate boundary. All work that can be safely completed without third-party production accounts/credentials or physical mobile validation is implemented. Remaining launch items are external activation and field-validation gates, not unfinished core application features.

## Completed product core
- Excel import preserving source columns, coordinate validation and physical-stop grouping.
- Directed road-network optimization, manual ordering, route statistics and internal GPS navigator.
- RouteFlow API routing gateway with input validation, dedicated quota, timeout/error classification and configurable provider endpoint.
- Address intelligence/registry, authentication, PostgreSQL persistence, route/delivery history and cross-device active-route resume.
- Proof of Delivery model with delivered/failed, GPS, recipient, occurrence notes and independent multi-package outcomes/failure reasons.
- Offline delivery outbox, automatic retry and visible sync state/manual retry.
- Private Proof storage boundary with account-scoped object keys and configuration detection. Actual bytes cannot be persisted until storage credentials/provider exist.
- SaaS plans and server-side entitlements, provider-neutral subscription lifecycle and authenticated billing webhook boundary. Checkout cannot become live until a payment provider/account exists.
- Operational dashboard for 30-day deliveries, success/failure, routes and planned kilometers.
- Request IDs, structured JSON logs, API/auth/routing throttles, payload limits and database readiness.
- PWA installation metadata/icon, standalone mode and hardened offline shell cache v5.
- Production operations runbook and technical Terms/LGPD Privacy drafts.

## Automated quality/release gates
- Prisma schema validation and client generation.
- Syntax validation for all backend/frontend modules and service worker.
- Backend unit suite covering entitlements, billing normalization, metrics, routing input/error classification, rate limiting, observability and storage boundaries.
- Production dependency audit blocks critical runtime vulnerabilities.
- Release-artifact/PWA checks.
- Scheduled/on-demand deployed-production smoke workflow validates health, database readiness and routing status every six hours.

## External activation gates before public paid launch
1. Configure private object storage credentials and provider, then enable/validate real Proof photo upload.
2. Configure a production routing provider/self-hosted instance with SLA in `ROUTING_BASE_URL`; public OSRM remains fallback/development infrastructure.
3. Select/configure recurring payment provider, products/prices and credentials; then activate provider-specific checkout/native webhook verification.
4. Move/confirm API and database on paid-grade production resources, enable provider backups/alerts/monitoring and perform a restore drill.
5. Replace technical legal drafts with reviewed company/controller information.
6. Validate Android Chrome, iPhone Safari and at least one real end-to-end delivery route including GPS movement, offline/reconnect, restart/resume, delivered/failed, multi-package and photo proof.

## Infrastructure note
A Render connection is available, but production resource mutations require explicit confirmation of the Render workspace before actions can be executed. Do not guess the workspace.

## Continuity rule
Treat this file as the durable handoff. Do not reopen completed core work unless a regression is found. The next phase is external service activation plus physical release validation.
