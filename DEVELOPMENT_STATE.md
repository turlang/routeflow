# RouteFlow — Development State

Updated: 2026-09-07 23:25 BRT
Target: RouteFlow 1.0 Commercial Beta
Branch: `main`

## Mission
Deliver a mobile-first routing SaaS that turns delivery spreadsheets into an optimized, executable route with navigation, proof of delivery, cloud persistence and recurring commercial plans. Development continues without stopping at micro-gates. Human input is required only for external credentials/contracts or physical field validation.

## Completed core
- Excel import preserving source columns and physical-stop grouping.
- Directed road-network optimization, manual ordering, route stats and internal GPS navigator.
- Frontend optimization, route geometry and live rerouting go through the RouteFlow backend routing gateway instead of calling public OSRM directly.
- Provider-configurable routing gateway with coordinate validation, timeout, status endpoint and explicit development fallback.
- Address registry, authentication, PostgreSQL backend, route history and cross-device active-route resume.
- Proof of Delivery model, migration and idempotent cloud upsert.
- One terminal Delivery record per spreadsheet package with stable client IDs.
- Multi-package Proof editor now hides conflicting common status/recipient controls, resets state on close, parses package labels from the dedicated summary and enforces an independent failure reason for every failed package.
- Offline delivery outbox, automatic retry and visible History sync state with pending counter/manual retry.
- SaaS plans/entitlements with server-side monthly route and stop limits.
- Provider-neutral subscription event normalization and authenticated billing webhook boundary; live provider remains disabled without credentials.
- API throttling, stricter auth throttling, payload limits and database readiness endpoint.
- Address/coordinate validation before routing.
- Functional account reporting dashboard in History: 30-day deliveries, success rate, failed deliveries, completed/active routes and planned kilometers.
- Backend operational metrics/reporting modules and unit tests remain available for future server-side aggregation.
- Routing input normalization/OSRM serialization now has automated unit coverage.
- PWA shell cache hardened: navigation-only HTML fallback, package proof, reporting and sync-status modules cached; cache version v4.
- Production operations runbook covers health/readiness, backup, restore drill, incidents, secrets and release gate.
- Recurring SaaS business plan, technical Terms and LGPD Privacy drafts.
- Commercial readiness CI validates Prisma, every backend/frontend JS module, unit tests, PWA and release artifacts.

## Current engineering priorities
1. Private Proof photo storage adapter and confirmed upload state; external credentials required for live persistence.
2. Complete provider-specific checkout/customer creation when billing provider credentials exist.
3. Security/operations: structured request logging, monitoring hooks and dependency audit remediation.
4. Automated API smoke tests and final release checklist.
5. Production routing SLA/provider, then physical mobile route validation.

## External blockers before public paid launch
- Persistent private object storage credentials/provider for delivery photos.
- Production routing provider or hosted routing infrastructure with SLA.
- Recurring payment provider account/credentials for checkout and signed native webhooks.
- Production-grade database/API resources plus provider backup/monitoring configuration and a performed restore drill.
- Final Terms/Privacy legal review and real controller/company data.
- Physical Android/iPhone field validation and at least one real end-to-end route.

## Continuity rule
This file is the durable handoff. A new development session must read it, inspect current `main`, inspect failing GitHub Actions, continue all executable work, update this state when priorities materially change, and stop only for a genuine external blocker or a build worth physical user testing.
