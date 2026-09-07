# RouteFlow — Development State

Updated: 2026-09-07
Target: RouteFlow 1.0 Commercial Beta
Branch: `main`

## Mission
Deliver a mobile-first routing SaaS that turns delivery spreadsheets into an optimized, executable route with navigation, proof of delivery, cloud persistence and recurring commercial plans. Development should continue without stopping at micro-gates. Human input is required only for external credentials/contracts or physical field validation.

## Completed core
- Excel import preserving source columns.
- Physical-stop grouping for multiple packages at the same coordinates.
- Directed road-network matrix and route optimization.
- Manual stop ordering and recalculation.
- Distance, service-time and ETA estimates.
- Internal RouteFlow navigator with numbered stops and GPS.
- Route position separated from original package number.
- Current-location start option.
- WhatsApp contact action when spreadsheet has phone data.
- Address registry with place type and operational metadata.
- Authentication and PostgreSQL backend.
- Offline-first local history plus account synchronization.
- Active-route persistence, cross-device reconciliation and automatic resume.
- Route history.
- Proof of Delivery data model and migration.
- Proof UI: delivered/failed, recipient, failure reason, notes, GPS and optional photo selection.
- One terminal Delivery record per spreadsheet package.
- Stable/idempotent delivery client IDs per route/package.
- Recurring SaaS business plan.
- Commercial readiness CI workflow.

## Current engineering priorities
1. Keep CI green and fix every regression before release.
2. Strengthen Proof of Delivery cloud update semantics and photo-storage adapter.
3. Add offline outbox/retry visibility for terminal delivery records.
4. Production routing abstraction with public OSRM treated only as development fallback.
5. Address-quality validation and suspicious-coordinate handling.
6. SaaS entitlement/plan model and server-side usage limits.
7. Payment-provider adapter/webhook boundary, awaiting provider credentials for live billing.
8. PWA/installability and mobile resilience.
9. Security/operations hardening, health/readiness, rate limiting and observability hooks.
10. Automated smoke tests and release documentation.

## External blockers before public paid launch
- Persistent private object storage credentials/provider for delivery photos.
- Production routing provider or hosted routing infrastructure.
- Recurring payment provider account/credentials.
- Production-grade database/API resources, backup/restore and monitoring configuration.
- Final Terms of Use / Privacy Policy review for the real legal entity and data practices.
- Physical Android/iPhone field validation and at least one real end-to-end route.

## Continuity rule
This file is the durable handoff. A new development session must read it, inspect current `main`, inspect failing GitHub Actions, continue all executable work, update this state when priorities materially change, and stop only for a genuine external blocker or a build worth physical user testing.
