# RouteFlow — Development State

Updated: 2026-09-07 21:30 BRT
Target: RouteFlow 1.0 Commercial Beta
Branch: `main`

## Mission
Deliver a mobile-first routing SaaS that turns delivery spreadsheets into an optimized, executable route with navigation, proof of delivery, cloud persistence and recurring commercial plans. Development continues without stopping at micro-gates. Human input is required only for external credentials/contracts or physical field validation.

## Completed core
- Excel import preserving source columns and physical-stop grouping.
- Directed road-network optimization, manual ordering, route stats and internal GPS navigator.
- Address registry, authentication, PostgreSQL backend, route history and cross-device active-route resume.
- Proof of Delivery model, migration and idempotent cloud upsert.
- One terminal Delivery record per spreadsheet package with stable client IDs.
- Per-package Proof editor for multi-package physical stops, including independent delivered/failed outcome, recipient and mandatory failure reason.
- Offline delivery outbox and automatic retry.
- SaaS plans/entitlements with server-side monthly route and stop limits.
- API throttling, stricter auth throttling, payload limits and database readiness endpoint.
- Address/coordinate validation before routing.
- Provider-configurable routing gateway with timeout and explicit development fallback.
- Installable PWA shell and same-origin offline cache.
- Recurring SaaS business plan, technical Terms and LGPD Privacy drafts.
- Commercial readiness CI validates Prisma, every backend/frontend JS module, unit tests, PWA and release artifacts.

## Current engineering priorities
1. Wire frontend routing calls through the backend production gateway while retaining explicit development fallback.
2. Private Proof photo storage adapter and confirmed upload state; external credentials required for live persistence.
3. Provider-neutral billing webhook boundary and subscription lifecycle enforcement.
4. Route/delivery reporting and commercial metrics.
5. Security/operations: structured request logging, monitoring hooks, backup/restore runbook and dependency audit remediation.
6. Automated API smoke tests and final release checklist.

## External blockers before public paid launch
- Persistent private object storage credentials/provider for delivery photos.
- Production routing provider or hosted routing infrastructure.
- Recurring payment provider account/credentials.
- Production-grade database/API resources, backup/restore and monitoring configuration.
- Final Terms/Privacy legal review and real controller/company data.
- Physical Android/iPhone field validation and at least one real end-to-end route.

## Continuity rule
This file is the durable handoff. A new development session must read it, inspect current `main`, inspect failing GitHub Actions, continue all executable work, update this state when priorities materially change, and stop only for a genuine external blocker or a build worth physical user testing.
