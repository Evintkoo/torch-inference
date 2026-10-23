+++
id = "0009"
title = "Keep repository root clean via agents and readme rules"
status = "done"
priority = "P1"
owner = "engineer"
created = "2026-10-23"
updated = "2026-10-23"
requirements = ["PDL-010", "PDL-013"]
controls = ["GOV-11"]
depends_on = []
labels = ["process", "docs"]
+++
## Outcome

The root agents file and readme define the fixed root file set and route every new artifact into its owning torviello unit so the repository root stays clean.

## Acceptance

- [ ] root agents file defines the fixed root file set and forbids new loose root entries
- [ ] root readme documents the unit layout and where each kind of artifact belongs
- [ ] media and brand and demo artifacts are routed to torviello-media
- [ ] store check and pytest and ruff pass

## Log

- 2026-10-23 — created
- 2026-10-23 — evidence: root AGENTS.md gains the fixed-root-file-set rule; root README.md gains the root-hygiene section with the artifact routing table; torviello-media README now states media artifacts live in the unit; loose root dirs assets media canvas notes identified as legacy and left untouched (uncommitted user work present); check — ok: 9 tickets; pytest torviello-roles + enforcer + governance/test_11 — 23 passed; ruff clean
- 2026-10-23 — evidence: uv run pytest torviello-roles torviello-enforcer/test_ticket_store.py governance/test_11 — 23 passed; torviello_roles check — ok: 9 tickets; ruff check torviello-roles — clean
