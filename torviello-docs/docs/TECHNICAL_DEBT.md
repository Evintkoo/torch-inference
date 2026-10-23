# Technical Debt Register

Copyright (c) 2026 Torviello.

| ID | Area | Debt | Impact | Owner | Review |
|---|---|---|---|---|---|
| TD-001 | persistence | SQLite adapter is single-writer | write throughput | engine-data | next minor |
| TD-002 | web | no visual regression suite | UI drift | web-team | next quarter |
| TD-003 | packaging | Windows service wrapper is basic | operational polish | release-team | next minor |

Debt is accepted only with an owner and review date. Breaking or unsafe debt
blocks release. Completed items record the change and removal evidence.
