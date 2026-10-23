+++
id = "0012"
title = "Consolidate monitoring into torviello-serve"
status = "done"
priority = "P1"
owner = "engineer"
created = "2026-10-23"
updated = "2026-10-23"
requirements = ["ED-011", "ENG-026"]
controls = ["GOV-12"]
depends_on = []
labels = ["process", "packaging"]
+++
## Outcome

The monitoring deployment artifacts live inside the torviello-serve unit and the dashboards conformance check accepts the consolidated home so the repository root loses a legacy deployment directory.

## Acceptance

- [ ] monitoring directory moved into torviello-serve with history preserved
- [ ] dashboards conformance bundle accepts torviello-serve/monitoring and tests regenerate green
- [ ] root README legacy list refreshed
- [ ] benchmarks and web and models consolidation recorded as blocked pending uncommitted justfile and CI and config work
- [ ] governance and observability and rules-format suites pass

## Log

- 2026-10-23 — created
- 2026-10-23 — evidence: git mv monitoring -> torviello-serve/monitoring (3 files, history preserved); dashboards bundle extended to accept torviello-serve/monitoring and tests regenerated; root README legacy list refreshed; ticket 0013 opened blocked on owner WIP for benchmarks web models config containers; observability + governance + rules-format + ticket-store + roles — 52 passed; ruff clean
- 2026-10-23 — evidence: uv run --locked pytest torviello-enforcer/observability governance test_rules_format test_ticket_store torviello-roles — 52 passed; ruff check torviello-roles — clean; torviello_roles check — ok: 13 tickets
