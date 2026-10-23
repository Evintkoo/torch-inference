+++
id = "0011"
title = "Add unit packaging rule and clean repository root"
status = "done"
priority = "P1"
owner = "engineer"
created = "2026-10-23"
updated = "2026-10-23"
requirements = ["CSC-005", "ED-011", "ED-042", "ENG-026", "PDL-013"]
controls = ["GOV-11", "GOV-12"]
depends_on = []
labels = ["process", "packaging"]
+++
## Outcome

Every torviello unit is required to be independently packageable under GOV-12 with packaging manifests inside units and the repository root holds only its fixed file set and named exceptions.

## Acceptance

- [ ] governance rule GOV-12 with numbered clauses requires packageable units and root hygiene
- [ ] generated conformance test enforces unit packaging declarations and root routing
- [ ] all torviello unit READMEs declare packaging status
- [ ] empty legacy root directories removed and canvas blueprint named as approved root artifact
- [ ] rule corpus count and indexes updated and governance tests pass

## Log

- 2026-10-23 — created
- 2026-10-23 — evidence: GOV-12 rule added with six numbered clauses; generator gained the unit_packaging bundle and governance override; tests regenerated; rule corpus count 155 -> 156; nine unit READMEs declare packaging status; root README and AGENTS state the packaging requirement and 240-test figure; empty legacy root dirs assets media dashboards removed; canvas/data.json kept as named approved root artifact; governance + rules-format + ticket-store + roles suites — 46 passed; enforcer collects 240 tests; test_status_tester.py modification is pre-existing user work and stays uncommitted
- 2026-10-23 — evidence: uv run --locked pytest torviello-enforcer/governance torviello-enforcer/test_rules_format.py torviello-enforcer/test_ticket_store.py torviello-roles — 46 passed; generated test_12 enforces unit packaging declarations and root routing; enforcer collect-only — 240 tests
