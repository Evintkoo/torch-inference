+++
id = "0006"
title = "Rename QA role and raise engineer standards"
status = "done"
priority = "P1"
owner = "engineer"
created = "2026-10-23"
updated = "2026-10-23"
requirements = ["PDL-010", "PDL-013", "ED-010", "ED-053"]
controls = ["GOV-11"]
depends_on = []
labels = ["process", "docs"]
+++
## Outcome

The quality-assurance role replaces the qa id and the engineer role defines design-before-code craftsmanship and reliability and security standards written at the industry's highest bar.

## Acceptance

- [ ] quality-assurance replaces the qa role directory and id everywhere
- [ ] engineer role documents cover design before code and implementation craftsmanship and reliability and security and verification
- [ ] role documents cite the applicable industry standards explicitly
- [ ] roles README indexes the renamed and expanded roles
- [ ] store check and pytest and ruff pass

## Log

- 2026-10-23 — created
- 2026-10-23 — evidence: qa renamed to quality-assurance; engineer expanded to five documents with design-before-code and reliability-security-observability; role docs now cite ISO 25010, ISTQB techniques, ISO/IEC/IEEE 29119, OWASP ASVS L2 and WSTG, WCAG 2.2 AA, DORA four keys; check — ok: 6 tickets; pytest torviello-roles + enforcer + governance/test_11 — 23 passed; ruff clean
- 2026-10-23 — evidence: uv run pytest torviello-roles torviello-enforcer/test_ticket_store.py governance/test_11 — 23 passed; torviello_roles check — ok: 6 tickets; ruff check torviello-roles — clean
