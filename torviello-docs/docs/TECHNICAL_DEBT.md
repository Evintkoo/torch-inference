# Technical Debt Register

Copyright (c) 2026 Torviello.

| ID | Area | Debt | Impact | Owner | Review |
|---|---|---|---|---|---|
| TD-001 | persistence | SQLite adapter is single-writer | write throughput | engine-data | next minor |
| TD-002 | web | no visual regression suite | UI drift | web-team | next quarter |
| TD-003 | packaging | Windows service wrapper is basic | operational polish | release-team | next minor |
| TD-005 | packaging | Container base images are pinned by tag, not digest | reproducibility and supply-chain drift | release-team | next release |
| TD-006 | packaging | Full container image is blocked on a packaged libtorch runtime | no GPU/TorchScript container | release-team | next release |

Debt is accepted only with an owner and review date. Breaking or unsafe debt
blocks release. Completed items record the change and removal evidence.
