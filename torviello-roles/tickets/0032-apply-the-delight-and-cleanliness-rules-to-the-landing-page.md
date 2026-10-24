+++
id = "0032"
title = "Apply the delight and cleanliness rules to the landing page"
status = "done"
priority = "P1"
owner = "engineer"
created = "2026-10-24"
updated = "2026-10-24"
requirements = ["PDL-013"]
controls = ["GOV-12", "GOV-08", "GOV-10"]
depends_on = ["0030"]
labels = ["frontend", "design"]
+++
## Outcome

the landing page honors house rules 8 and 9 in its styles: every action answers hover and keyboard focus with a visible icon nudge, the terminal transcript cascades in line by line where motion is welcome, and anchored sections scroll cleanly past the sticky bar with smooth behavior only where motion is welcome

## Acceptance

- [ ] button icons nudge on hover and focus-visible with the motion suppressed under prefers-reduced-motion per the A7 and A1 A2 sheet amendment logged on this ticket
- [ ] terminal lines stagger their entrance and render static and complete under reduced motion per the F-07 invariant
- [ ] anchored sections carry scroll-margin clearing the sticky bar and smooth scroll is gated on no-preference motion
- [ ] visual QA passes at all five widths and the decorative css changes are verified by the visual qa driver and code review with the unit test limitation recorded

## Log

- 2026-10-24 — created
- 2026-10-24 — started
- 2026-10-24 — started: scope is decorative css feedback per house rules 8 and 9; TDD applicability — server-rendered unit tests cannot assert computed animations so the reduced-motion invariant is enforced by css gating and verified by the visual qa driver and code review, recorded as the limitation per the prior evaluation reports
- 2026-10-24 — implementation: atoms.css pairs the button icon nudge (2px translateX on hover and focus-visible, transition gated off under prefers-reduced-motion); page.css staggers the terminal status cascade per line, adds smooth anchor travel gated on no-preference motion, and gives anchored sections a scroll-margin of space-16 plus space-4 clearing the sticky bar; sheet discipline: the A1 icon line gains the nudge amendment citing this ticket
- 2026-10-24 — evidence: cd torviello-landing/web && bun test src — 59 passed 0 failed; bun run typecheck — clean; bun run build — green; bun run scripts/visual-qa.ts — VISUAL QA PASS 0px overflow at 320 390 768 1024 1440; uv run --locked pytest — 45 passed; uv run ruff check . — clean; root npm test — 3 passed 0 failed; root npm run build — clean; torviello_roles check — ok: 32 tickets; decorative css verified by the visual qa driver and code review with the server-render unit test limitation recorded at start
- 2026-10-24 — evidence: bun test src 59 passed; visual QA pass at all widths; gates green; motion fully gated by prefers-reduced-motion
