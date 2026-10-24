+++
id = "0030"
title = "Consume the sliced brand icons across the landing actions"
status = "done"
priority = "P1"
owner = "engineer"
created = "2026-10-24"
updated = "2026-10-24"
requirements = ["PDL-013"]
controls = ["GOV-12", "GOV-09"]
depends_on = ["0029"]
labels = ["frontend", "design"]
+++
## Outcome

the landing renders every action and feature icon from the sliced asset set through an icon atom: every button and audience action pairs an aria-hidden icon with its label per house rule 10 and page code no longer hand-writes icon paths

## Acceptance

- [ ] an icons module mirrors the nine brand assets with provenance and an Icon atom renders them aria-hidden with test coverage failing first
- [ ] nav hero and audience actions each render their sheet-specified icon beside the label
- [ ] feature strip and hero glass cards take icons by name from the module instead of inline literals
- [ ] bun tests typecheck build visual QA root gates and roles check stay green

## Log

- 2026-10-24 — created
- 2026-10-24 — started
- 2026-10-24 — started: contract 0029 approved and committed (30b8c09) before implementation per GOV-09.07
- 2026-10-24 — RED evidence: six tests written against the A7 contract fail first — the Icon atom test on the missing module, nav hero button and audience icon-pairing tests, and the page-level icon count; the 52 prior tests kept passing so failures isolate the new behavior
- 2026-10-24 — GREEN: src/lib/icons.ts mirrors the nine brand assets with per-asset provenance per the Logo.svelte pattern; the A7 Icon atom renders them aria-hidden; Button NavBar HeroSection and the M4 audience actions pair icons with labels (icon text adjacency asserted by the existing label tests); the page strip and glass cards take icons by name from the module and the improvised strokeIcons block is gone; molecules.css gains the token-only tv-icon block and a deliberate 1023px tablet rail step after the wider actions overflowed 768px by 6px — found by the visual QA driver and fixed at the root per house rule 9
- 2026-10-24 — evidence: cd torviello-landing/web && bun test src — 59 passed 0 failed; SVELTE_COMPILE_MODE=client bun test tests/interaction.test.ts — 3 passed 0 failed; bun run typecheck — clean; bun run build — green; bun run scripts/visual-qa.ts — VISUAL QA PASS 0px overflow at 320 390 768 1024 1440 after the tablet rail fix; screenshots reviewed at 1440 and 768 — every action pairs its sheet icon; root npm test — 3 passed 0 failed; root npm run build — clean; uv run --locked pytest — 45 passed; uv run ruff check . — clean; torviello_roles check — ok: 31 tickets
- 2026-10-24 — evidence: bun test src 59 passed; interaction 3 passed; typecheck build visual QA root gates pytest ruff and roles check green; icons flow only from the sliced asset module
