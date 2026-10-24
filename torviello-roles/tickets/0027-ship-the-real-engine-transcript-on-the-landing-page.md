+++
id = "0027"
title = "Ship the real engine transcript on the landing page"
status = "done"
priority = "P1"
owner = "engineer"
created = "2026-10-24"
updated = "2026-10-24"
requirements = ["PDL-013"]
controls = ["GOV-12", "GOV-09"]
depends_on = ["0026"]
labels = ["frontend", "design"]
+++
## Outcome

the landing terminal block renders the documented engine session from ticket 0026 in place of the fictional pip serve and status lines with tests asserting the exact lines and the full gate set green

## Acceptance

- [ ] the transcript shows torviello-engine --help the TORCH_PORT run command and the JSON startup event and no pip serve or invented status prose remains
- [ ] tests asserting the transcript lines are updated to the 0026 contract and were failing against the old content before the data change
- [ ] bun tests typecheck build root gates and roles check stay green

## Log

- 2026-10-24 — created
- 2026-10-24 — started
- 2026-10-24 — started: contract 0026 approved and committed (4869e8e) before test changes per GOV-09.07
- 2026-10-24 — RED evidence: after retargeting the A6 and terminal tests to the 0026 contract fixtures the two LandingPage tests fail against the shipped page data because the page still renders the fictional pip and Ready lines; component structure tests updated with their fixtures to the same contract
- 2026-10-24 — GREEN: LandingPage terminalLines replaced with the documented session — torviello-engine --help, TORCH_PORT=8000 torviello-engine, and the real JSON startup event with elided correlation_id; no component changes needed since TerminalLine renders any text as nodes
- 2026-10-24 — evidence: cd torviello-landing/web && bun test src — 52 passed 0 failed; SVELTE_COMPILE_MODE=client bun test tests/interaction.test.ts — 3 passed 0 failed; bun run typecheck — clean; bun run build — green; bun run scripts/visual-qa.ts — VISUAL QA PASS 0px overflow at 320 390 768 1024 1440 with the JSON line wrapping inside the terminal window; screenshot reviewed at 1440; root npm test — 3 passed 0 failed; root npm run build — clean; uv run --locked pytest — 45 passed; uv run ruff check . — clean; torviello_roles check — ok: 27 tickets
- 2026-10-24 — evidence: bun test src 52 passed; typecheck build visual-qa root gates pytest ruff roles check green; page renders only documented engine commands and output
