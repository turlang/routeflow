# RouteFlow — Development State

Updated: 2026-09-07 22:37 BRT
Target: RouteFlow 1.0 Commercial Beta
Branch: `main`

## Mission
Deliver a mobile-first routing SaaS that turns delivery spreadsheets into an optimized, executable route with navigation, proof of delivery, cloud persistence and recurring commercial plans. Development continues without stopping at micro-gates. Human input is required only for external credentials/contracts or physical field validation.

## Completed core
- Excel import preserving source columns and physical-stop grouping.
- Directed road-network optimization, manual ordering, route stats and internal GPS navigator.
- Frontend optimization, route geometry and live rerouting now go through the RouteFlow backend routing gateway instead of calling public OSRM directly.
- Provider-configurable routing gateway with coordinate validation, timeout, status endpoint and explicit development fallback.
- Address registry, authentication, PostgreSQL backend, route history and cross-device active-route resume.
- Proof of Delivery model, migration and idempotent cloud upsert.
- One terminal Delivery record per spreadsheet package with stable client IDs.
- Per-package Proof editor for multi-package physical stops, including independent delivered/failed outcome, recipient and mandatory failure reason.
- Offline delivery outbox and automatic retry.
- SaaS plans/entitlements with server-side monthly route and stop limits.
- Provider-neutral subscription event normalization and authenticated billing webhook boundary; live provider remains disabled without credentials.
- API throttling, stricter auth throttling, payload limits and database readiness endpoint.
- Address/coordinate validation before routing.
- Operational route/delivery metrics pure module and automated tests.
- Installable PWA shell and same-origin offline cache.
- Recurring SaaS business plan, technical Terms and LGPD Privacy drafts.
- Commercial readiness CI validates Prisma, every backend/frontend JS module, unit tests, PWA and release artifacts.

## Current engineering priorities
1. Expose route/delivery reporting metrics through authenticated API and frontend reporting UI.
2. Private Proof photo storage adapter and confirmed upload state; external credentials required for live persistence.
3. Complete provider-specific checkout/customer creation when billing provider credentials exist.
4. Security/operations: structured request logging, monitoring hooks, backup/restore runbook and dependency audit remediation.
5. Automated API smoke tests, PWA hardening and final release checklist.

## External blockers before public paid launch
- Persistent private object storage credentials/provider for delivery photos.
- Production routing provider or hosted routing infrastructure with SLA.
- Recurring payment provider account/credentials for checkout and signed native webhooks.
- Production-grade database/API resources, backup/restore and monitoring configuration.
- Final Terms/Privacy legal review and real controller/company data.
- Physical Android/iPhone field validation and at least one real end-to-end route.

## Continuity rule
This file is the durable handoff. A new development session must read it, inspect current `main`, inspect failing GitHub Actions, continue all executable work, update this state when priorities materially change, and stop only for a genuine external blocker or a build worth physical user testing.
