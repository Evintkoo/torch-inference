+++
id = "0008"
title = "Require atomic design sheets and functional design"
status = "done"
priority = "P1"
owner = "designer"
created = "2026-10-23"
updated = "2026-10-23"
requirements = ["PDL-010", "PDL-013"]
controls = ["GOV-11"]
depends_on = []
labels = ["docs", "process"]
+++
## Outcome

Every atom and molecule and organism and template and page is designed through a required sheet and the designer role adds functional design that defines what each capability does before any visual work.

## Acceptance

- [ ] each atomic level has a required design sheet format with anatomy and tokens and states
- [ ] components without a completed design sheet cannot enter a specification
- [ ] designer role has a functional design document defining capabilities and interaction contracts and acceptance mapping
- [ ] designer README and roles README index the changes
- [ ] store check and pytest and ruff pass

## Log

- 2026-10-23 — created
- 2026-10-23 — evidence: design-sheet requirement added to document 04 — every atom molecule organism template and page needs a completed sheet with anatomy tokens states and contract before entering a spec; new document 05-functional-design.md — capability statements numbered functions interaction contracts data needs exceptions and acceptance mapping; designer docs now 5; check — ok: 8 tickets; pytest torviello-roles + enforcer + governance/test_11 — 23 passed; ruff clean
- 2026-10-23 — evidence: uv run pytest torviello-roles torviello-enforcer/test_ticket_store.py governance/test_11 — 23 passed; torviello_roles check — ok: 8 tickets; ruff check torviello-roles — clean
