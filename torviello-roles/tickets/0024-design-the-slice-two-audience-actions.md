+++
id = "0024"
title = "Design the slice-two audience actions"
status = "done"
priority = "P1"
owner = "designer"
created = "2026-10-24"
updated = "2026-10-24"
requirements = ["PDL-013"]
controls = ["GOV-12", "GOV-07"]
depends_on = ["0023"]
labels = ["design", "frontend"]
+++
## Outcome

the design specification closes the slice-two gap that sheet O3 defers: each audience card gains a specified call to action with copy targets states and accessibility criteria recorded in the functional design and the design sheets so implementation cannot improvise

## Acceptance

- [ ] the functional design F-06 contract names the per-card action trigger response outcome and invariants with concrete targets resolvable within the recorded placeholder hosts
- [ ] the design sheets M4 sheet gains the action states and accessibility criteria and the slice-one non-interactive contract is superseded in place with dated discipline
- [ ] design token contract tests and the landing build stay green after the specification change

## Log

- 2026-10-24 — created
- 2026-10-24 — started
- 2026-10-24 — started slice-two design: scope is the per-card action deferred by sheet O3; targets stay within the recorded placeholder hosts assumption from 0023 (docs.torviello.dev, github.com/torviello)
- 2026-10-24 — specification: functional design F-06 gains the per-card action contract (trigger response outcome action invariants) with destinations builders to the install page AI teams to the docs home real-world AI to GitHub under the 0023 placeholder-host assumption; design sheets retitle to slices 1-2, A2 gains the per-card purpose, M4 gains the action token states and accessibility block with copy and hrefs fixed per card, O3 contract superseded to one action per card; sheet discipline preserved by citing 0024 in the sheet header
- 2026-10-24 — evidence: uv run --locked pytest torviello-design/tests — 7 passed 0 failed (token contract and contrast recomputation unaffected); cd torviello-landing/web && bun test src — 47 passed 0 failed; specification change is additive to F-06 and M4 with no threshold or contract weakened
- 2026-10-24 — evidence: pytest torviello-design/tests 7 passed; bun test src 47 passed; functional design F-06 and sheets M4/A2/O3 updated with the specified action
