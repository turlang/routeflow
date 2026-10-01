# Gate A regression tests

Run `npm.cmd test` on Windows or `npm test` on other platforms.
The suite uses Node's built-in runner and no extra packages. It covers account
isolation, obsolete global storage, verified quarantine migration, quota and
invalid contents, pending route replay, response loss, session races, and UI
session handlers with DOM/map/GPS doubles. It is not a real-browser E2E suite.

Account data keys use API URL + user ID. Guest data and legacy quarantine are
separate and are never adopted automatically after login. Legacy user profiles
are quarantined too; legacy tokens are never reused or included in exports.
Quota or invalid quarantine prevents removal of original data keys.

Route synchronization requires an authenticated account, including when a
route is started offline. An anonymous route stays in the guest scope. Pending
routes are saved independently of the active route and bounded history. They
are retried after login/startup, reconnection and transient errors. Validation
errors remain visible in the account panel. Web Locks serialize browser tabs;
older browsers use a lease, with server-side uniqueness as the final guarantee.

For PostgreSQL/HTTP integration use the dedicated `routeflow_gate_a_test`
database. See `server/README.md`. Tests refuse other database names and delete
only the test users they created. The application database is not used.

Browser scenarios: [manual Gate A checklist](manual-gate-a.md).

Active-route recovery distinguishes a confirmed JSON null from network/HTTP,
invalid JSON and invalid route responses. Confirmed absence clears only an
obsolete active cache without pending edits; history/outboxes remain intact.
Concurrent edits during GET and account switches are covered. A confirmed
remote terminal state closes navigation while preserving conflicting offline
snapshots in a blocked outbox for review.
