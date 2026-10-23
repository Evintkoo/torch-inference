+++
id = "0005"
title = "Add QA and designer roles and PM report builder"
status = "done"
priority = "P1"
owner = "engineer"
created = "2026-10-23"
updated = "2026-10-23"
requirements = ["PDL-010", "PDL-013", "ED-010", "ED-053"]
controls = ["GOV-09", "GOV-11"]
depends_on = []
labels = []
+++
## Outcome

The PM can generate a defensible status report from the store, and two new hands-on roles exist: QA with a test strategy, evidence rules, and the defect standard, and a designer with interface-state specs and accessibility/usability evidence.

## Acceptance

- [ ] report command renders Markdown and JSON from the store
- [ ] report includes blocked, next, and done-since sections
- [ ] PM report-builder document defines sources, template, and claim rules
- [ ] QA role has numbered execution, strategy, evidence, and defect documents
- [ ] designer role has numbered execution, interface-state, and accessibility/usability documents
- [ ] ticket tests, store check, and ruff pass

## Log

- 2026-10-23 — created
- 2026-10-23 — repaired acceptance list (comma splitting had exploded each item into fragments) and expanded scope to include the designer role per owner instruction; title updated
- 2026-10-23 — evidence: report command added; uv run pytest torviello-roles torviello-enforcer/test_ticket_store.py governance/test_11 — 23 passed; torviello_roles check — ok: 5 tickets; ruff check torviello-roles — clean; report rendered for the live store
- 2026-10-23 — evidence: uv run pytest torviello-roles torviello-enforcer/test_ticket_store.py governance/test_11 — 23 passed; check ok: 5 tickets; ruff clean; report/brief verified against the live store
