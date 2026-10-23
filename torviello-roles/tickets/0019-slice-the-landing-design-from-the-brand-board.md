+++
id = "0019"
title = "Slice the landing design from the brand board"
status = "done"
priority = "P1"
owner = "designer"
created = "2026-10-23"
updated = "2026-10-23"
requirements = ["PDL-010", "PDL-013"]
controls = ["GOV-12"]
depends_on = []
labels = ["design", "process"]
+++
## Outcome

The approved brand board becomes the design foundation: a machine-readable token contract a landing functional design and design sheets for slice one that the landing unit can implement.

## Acceptance

- [ ] design tokens contract captures the board palette typography and spacing in machine-readable form with semantic aliases
- [ ] tokens stylesheet mirrors the contract for the landing web unit
- [ ] landing functional design defines numbered functions with interaction contracts
- [ ] design sheets cover atoms molecules organisms template and page for slice one with states and accessibility criteria
- [ ] contrast ratios are measured and recorded against WCAG 2.2 AA
- [ ] token contract tests pass and landing web build stays green

## Log

- 2026-10-23 — created
- 2026-10-23 — evidence: brand board copied to torviello-design/brand/reference-board.png; design-tokens.json contract captures the four board colors as primitives with semantic aliases surfaces text actions focus typography spacing radius (W3C DTCG format); tokens.css mirrors the contract for the landing web unit with var() aliasing; measured WCAG ratios recorded warm-white on midnight 17.82 orange on midnight 6.58 midnight on orange 6.58 teal on midnight 10.09 hover 7.91 muted blended 9.44 — all AA, most AAA; landing functional design defines F-01 through F-08 with interaction contracts and acceptance mapping; design sheets cover 6 atoms 4 molecules 3 organisms template and page with states tokens and accessibility criteria; contract tests 7 passed including contrast recomputation and stylesheet parity; ruff clean; check ok 19 tickets
- 2026-10-23 — evidence: uv run --locked pytest torviello-design/tests packaging/tests roles — 45 passed; uv run ruff check . — clean; torviello_roles check — ok: 19 tickets; contrast values measured programmatically and asserted in the contract tests
