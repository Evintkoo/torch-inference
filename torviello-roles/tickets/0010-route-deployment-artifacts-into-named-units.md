+++
id = "0010"
title = "Route deployment artifacts into named units"
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

Deployment and operations artifacts always live inside the owning named torviello unit and are never created loose at the repository root.

## Acceptance

- [ ] root agents file routes deployment and operations artifacts into the owning torviello unit
- [ ] root readme routing table covers deployment artifacts and names the legacy deployment directories
- [ ] torviello-serve readme states deployment artifacts live inside the unit
- [ ] store check and pytest and ruff pass

## Log

- 2026-10-23 — created
- 2026-10-23 — evidence: root AGENTS.md now routes deployment and operations artifacts into the owning unit and keeps generated outputs gitignored; root README routing table adds the deployment row and names legacy deployment dirs config containers monitoring models; torviello-serve README states deployment artifacts live inside the unit; services/ and web/ intentionally not frozen since they hold active scaffold work; check — ok: 10 tickets; pytest torviello-roles + enforcer + governance/test_11 — 23 passed; ruff clean
- 2026-10-23 — evidence: uv run pytest torviello-roles torviello-enforcer/test_ticket_store.py governance/test_11 — 23 passed; torviello_roles check — ok: 10 tickets; ruff check torviello-roles — clean
