# RouteFlow — Development State

Updated: 2026-09-07 20:16 BRT
Target: RouteFlow 1.0 Commercial Beta
Branch: `main`

## Mission
Deliver a mobile-first routing SaaS that turns delivery spreadsheets into an optimized, executable route with navigation, proof of delivery, cloud persistence and recurring commercial plans. Development continues without stopping at micro-gates. Human input is required only for external credentials/contracts or physical field validation.

## Completed core
- Excel import preserving source columns.
- Physical-stop grouping for multiple packages at the same coordinates.
- Directed road-network matrix and route optimization.
- Manual stop ordering and recalculation.
- Distance, service-time and ETA estimates.
- Internal RouteFlow navigator with numbered stops and GPS.
- Route position separated from original package number.
- Current-location start option and WhatsApp contact action.
- Address registry with place type and operational metadata.
- Authentication and PostgreSQL backend.
- Active-route persistence, cross-device reconciliation and automatic resume.
- Route and delivery history.
- Proof of Delivery model and migration.
- Proof UI with delivered/failed, recipient, failure reason, notes, GPS and optional photo selection.
- One terminal Delivery record per spreadsheet package.
- Stable/idempotent delivery client IDs per route/package.
- Backend Proof of Delivery upsert/update semantics.
- Offline delivery outbox with automatic retry after connectivity returns.
- SaaS entitlement fields and production migration.
- Recurring SaaS business plan.
- Installable PWA shell and same-origin offline cache.
- Commercial readiness CI workflow including Prisma, JS, PWA and release-artifact validation.
- Technical Terms of Use and LGPD Privacy Policy drafts, explicitly pending legal/entity completion.
- Environment contract for production routing, private object storage and recurring billing adapters.

## Current engineering priorities
1. Per-package Proof UI for mixed outcomes when multiple packages share one physical stop.
2. Private photo-storage adapter and confirmed upload state; external storage credentials remain required for live persistence.
3. Production routing adapter/proxy, timeout/retry and provider health; external provider/instance remains required for production SLA.
4. Address-quality validation and suspicious-coordinate handling.
5. Server-side SaaS usage limits/entitlements and provider-neutral billing webhook boundary.
6. Security/operations hardening: auth throttling, request limits, readiness and observability hooks.
7. Route/delivery reporting and commercial metrics.
8. Automated smoke tests and release checklist.

## External blockers before public paid launch
- Persistent private object storage credentials/provider for delivery photos.
- Production routing provider or hosted routing infrastructure.
- Recurring payment provider account/credentials.
- Production-grade database/API resources, backup/restore and monitoring configuration.
- Final Terms of Use / Privacy Policy review and real controller/company data.
- Physical Android/iPhone field validation and at least one real end-to-end route.

## Continuity rule
This file is the durable handoff. A new development session must read it, inspect current `main`, inspect failing GitHub Actions, continue all executable work, update this state when priorities materially change, and stop only for a genuine external blocker or a build worth physical user testing.
