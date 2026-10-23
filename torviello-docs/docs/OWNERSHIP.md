# Module Ownership

Copyright (c) 2026 Torviello.

| Area | Path | Owner | Responsibility |
|---|---|---|---|
| API | `services/engine/src/api.rs` | engine-api | routes, errors, limits |
| Auth | `services/engine/src/auth.rs` | engine-security | identity, roles, audit |
| Domain | `services/engine/src/domain.rs` | engine-core | inference policy |
| Models | `services/engine/src/model.rs` | engine-models | registry, integrity |
| Persistence | `services/engine/src/persistence.rs` | engine-data | migrations, retention |
| Observability | `services/engine/src/observability.rs` | engine-ops | logs, metrics, traces |
| Web | `web/src` | web-team | operator console |
| Packaging | `packaging/` | release-team | install and rollback |

Ownership is enforced through [CODEOWNERS](../CODEOWNERS). Changes crossing
two areas require review from both owners.
