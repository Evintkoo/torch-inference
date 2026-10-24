+++
id = "0029"
title = "Slice the board icon set into brand icon assets"
status = "done"
priority = "P1"
owner = "designer"
created = "2026-10-24"
updated = "2026-10-24"
requirements = ["PDL-013"]
controls = ["GOV-12"]
depends_on = ["0028"]
labels = ["design", "frontend"]
+++
## Outcome

the board iconography becomes a canonical sliced asset set under torviello-design/brand/icons with a designed icon atom sheet and the button molecule and feature card sheets requiring asset-provenanced icons so page code never improvises iconography again

## Acceptance

- [ ] the nine used icons exist as currentColor svg assets in torviello-design/brand/icons matching the board iconography
- [ ] the design sheets gain the A7 icon atom and amend A1 A2 M2 M3 to require icons from the asset set with aria-hidden decoration and the icon-bearing action rule
- [ ] design contract tests stay green after the specification change

## Log

- 2026-10-24 — created
- 2026-10-24 — started
- 2026-10-24 — specification: nine icons sliced into torviello-design/brand/icons as currentColor svg assets with provenance comments (zap layers sliders users box package github arrow-right book-open); sheets gain A7 Icon atom (asset is source of truth, aria-hidden, currentColor, 24 viewBox) and A1 A2 gain the house-rule-10 icon pairing line; M2 M3 cite the asset names; M4 action lists its icon per card
- 2026-10-24 — evidence: uv run --locked pytest torviello-design/tests — 7 passed 0 failed; sheets amended with ticket citations per sheet discipline
- 2026-10-24 — evidence: icons/* svg assets committed under torviello-design/brand/icons; A7 sheet added; pytest 7 passed
