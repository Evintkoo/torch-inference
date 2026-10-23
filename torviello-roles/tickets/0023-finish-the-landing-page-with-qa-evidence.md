+++
id = "0023"
title = "Finish the landing page with QA evidence"
status = "done"
priority = "P1"
owner = "engineer"
created = "2026-10-24"
updated = "2026-10-24"
requirements = ["PDL-013"]
controls = ["GOV-12", "GOV-09", "GOV-10"]
depends_on = ["0022"]
labels = ["design", "frontend", "qa"]
+++
## Outcome

the landing page closes its slice-one gaps: the A5 logo lockup ships from a brand svg asset the install call to action resolves to the docs install page interaction behavior is covered in a real DOM the rendered page passes a visual pass at desktop and mobile widths and a dated evaluation report records the QA outcomes per GOV-10

## Acceptance

- [ ] brand logo mark svg exists in torviello-design and the NavBar brand renders the A5 lockup with the mark aria-hidden inside the single home link
- [ ] the primary Get Started actions navigate to the docs install page and the tests assert the resolved href
- [ ] an interaction test mounts the app in happy-dom and toggles the mobile menu with aria-expanded state changes
- [ ] headless browser screenshots at desktop laptop and mobile widths are recorded as evaluation evidence and visually reviewed
- [ ] a dated evaluation report with command scope environment metrics and per-threshold outcomes is recorded in evaluations/reports
- [ ] bun tests typecheck build and the repository gates stay green

## Log

- 2026-10-24 — created
- 2026-10-24 — started
- 2026-10-24 — assumption recorded: no canonical domains exist in the repository so docs.torviello.dev and github.com/torviello stay the designated placeholder hosts across nav hero and footer pending owner-provided real domains; the install call to action resolves to https://docs.torviello.dev/install as the F-02 target
- 2026-10-24 — implementation: brand logo mark svg recorded in torviello-design/brand with the A5 Logo lockup atom (mark aria-hidden inside the single home link) wired into the NavBar; both Get Started actions now resolve to the docs install page url; the svelte preload gained a client compile mode and the interaction category mounts the real app in happy-dom through the global registrator covering landmarks anchors and the mobile menu aria-expanded toggle; the visual qa driver scripts/visual-qa.ts drives the installed Chrome over playwright-core checking menu visibility across breakpoints horizontal overflow and heading uniqueness with full-page screenshots; visual review found and fixed three defects — inline svg icons had no intrinsic size and filled their containers, button-styled anchors showed the ua link underline, and the ribbon artwork hard-clipped at the hero edge and crossed the copy column (alpha-masked and biased right); dated evaluation report recorded with screenshots under evaluations/reports/2026-10-24-landing-slice-one-qa
- 2026-10-24 — evidence: cd torviello-landing/web && bun test src — 47 passed 0 failed; SVELTE_COMPILE_MODE=client bun test tests/interaction.test.ts — 2 passed 0 failed; bun run scripts/visual-qa.ts — VISUAL QA PASS menu visibility and 0px horizontal overflow at 320 390 768 1024 1440 with h1 count 1; bun run typecheck — tsc 7.0.2 clean; bun run build — vite green; root npm test — 3 passed 0 failed; root npm run build — clean; uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles — 45 passed; uv run ruff check . — clean; torviello_roles check — ok: 23 tickets; evaluation report 2026-10-24-landing-slice-one-qa.md records commands metrics per-threshold outcomes screenshots and the placeholder-domain assumption
