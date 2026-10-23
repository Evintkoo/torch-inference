+++
id = "0014"
title = "Decide the home of the normative repository layer"
status = "done"
priority = "P2"
owner = "product-manager"
created = "2026-10-23"
updated = "2026-10-23"
requirements = ["ED-011"]
controls = ["GOV-12"]
depends_on = []
labels = ["decision", "process"]
+++
## Outcome

The owner decides whether requirements docs and governance stay at the repository root as the named normative layer or move into a torviello unit with full reference migration.

## Acceptance

- [ ] owner decision recorded with rationale and scope
- [ ] if moved all control citations generated-test paths and trail mappings are updated in one commit
- [ ] root README and GOV-12 exceptions updated to match the decision

## Log

- 2026-10-23 — created
- 2026-10-23 — decision recorded by owner: docs migrates into the torviello-docs unit and governance merges into torviello-enforcer/governance as policies and records; requirements stays at the root as the named normative-layer exception in GOV-12
- 2026-10-23 — started
- 2026-10-23 — evidence: docs merged into torviello-docs/docs and governance policies and records merged into torviello-enforcer/governance per owner decision; organization people-and-work collaboration record domains 18 passed; product-discovery stakeholder vendor licensing documentation-and-design 31 passed; assurance register tests 4 passed after path fix
