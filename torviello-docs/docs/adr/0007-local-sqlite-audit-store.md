# ADR 0007: Local SQLite audit store

## Status

Accepted. Date: 2026-10-22. Owner: engine-data.

## Context

The engine must run local-first and offline, but security-relevant actions
still need a durable audit trail. A separate database server would violate the
offline deployment model and add operational cost for single-container and
systemd installs. RP-031 and the persistence domain require an explicit data
store, bounded schema migration, and a retention policy before persistence is
claimed.

## Decision

Use an embedded SQLite database through `sqlx` for local persistence. The
database URL defaults to `sqlite://data/engine.db` and is configurable
with `database_url` or `TORCH_DATABASE_URL`. The `persistence` feature remains
optional so the minimal profile stays small; the `full` bundle enables it.

Startup opens the database and applies embedded migrations before the listener
accepts traffic, with a 60-second migration bound. The process fails closed if
the database cannot be opened or migrated. WAL journalling and a five-second
busy timeout are set on every pool connection. Audit inserts are synchronous:
the intent row is written before the side effect, and a request that cannot
write it fails rather than performing an unaudited action. The outcome update
after the side effect is logged if it fails, leaving the intent row durable.

The initial scope records `download`, `load`, `unload`, and `inference`
actions with the authenticated actor, or `local` when authentication is
disabled for an open local route. Each row carries the request ID, actor,
`org_id`, `jti`, action, model, outcome, and error code. Records older than
`retention_max_age_days` are purged at startup and hourly thereafter.
Readiness checks the audit connection when persistence is enabled. The
`model_registry` table is created for a later registry slice but is not yet
written by the engine.

## Consequences

- No database server, network dependency, or cloud account is required.
- SQLite allows one writer at a time. WAL reduces reader blocking, but sustained
  inference auditing can still become a throughput ceiling; benchmark before
  claiming high-throughput audit capacity.
- The database file is local state and needs a persistent volume in containers
  and a backup/restore procedure in operations.
- Hosted deployments may later replace the store behind the same port, but this
  ADR does not authorize a hosted database.
