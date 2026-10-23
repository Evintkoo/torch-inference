+++
id = "0015"
title = "Move requirements corpus into the enforcer"
status = "done"
priority = "P1"
owner = "engineer"
created = "2026-10-23"
updated = "2026-10-23"
requirements = ["ED-011"]
controls = ["GOV-12"]
depends_on = []
labels = ["process", "docs"]
+++
## Outcome

The requirements corpus lives inside torviello-enforcer as the normative corpus and the repository root keeps only the fixed file set the nine units and the canvas exception.

## Acceptance

- [ ] requirements directory moved into torviello-enforcer with history preserved
- [ ] ticket store validation trail tests and rules format resolve the new corpus path
- [ ] all requirement back-links and control citations updated to the new depth
- [ ] GOV-12 root exceptions reduced to the canvas blueprint
- [ ] affected suites pass and ruff and check are clean

## Log

- 2026-10-23 — created
- 2026-10-23 — started
- 2026-10-23 — evidence: requirements corpus moved into torviello-enforcer/requirements (170 items plus source and assurance documents) with history preserved; store_paths conftest test_ticket_store test_rules_format and the generated trail-test template resolve the new path; 169 item back-links re depth-corrected plus 136 md citations across engine bench roles and root files; GOV-12 exceptions reduced to the canvas blueprint; rules-format trails ticket-store and governance suites green; register test path fixed to its own directory; ruff clean; root now only fixed files nine units canvas and ignored notes
- 2026-10-23 — evidence: uv run --locked pytest enforcer trails (33) rules_format ticket_store roles (29) governance+organization (44) register (4) — all passed; uv run ruff check . — clean; torviello_roles check — ok: 16 tickets
