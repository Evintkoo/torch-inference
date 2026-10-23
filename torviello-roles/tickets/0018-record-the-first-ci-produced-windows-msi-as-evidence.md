+++
id = "0018"
title = "Record the first CI-produced Windows MSI as evidence"
status = "backlog"
priority = "P2"
owner = "engineer"
created = "2026-10-23"
updated = "2026-10-23"
requirements = ["ED-020", "ED-021"]
controls = ["REL-01", "GOV-12"]
depends_on = []
labels = ["packaging", "release"]
+++
## Outcome

The windows-installer CI job has run on a real Windows runner and its MSI artifact plus build log are recorded as packaging evidence on ticket 0017 and the engine unit.

## Acceptance

- [ ] windows-installer job green on ci with the msi artifact uploaded
- [ ] msi installs and the engine starts and answers health on a windows host
- [ ] evidence links recorded on ticket 0017 and engine README packaging status

## Log

- 2026-10-23 — created
- 2026-10-23 — linked: completes the windows acceptance of ticket 0017
