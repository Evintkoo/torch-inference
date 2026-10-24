+++
id = "0025"
title = "Implement the slice-two audience actions"
status = "done"
priority = "P1"
owner = "engineer"
created = "2026-10-24"
updated = "2026-10-24"
requirements = ["PDL-013"]
controls = ["GOV-12", "GOV-09", "GOV-10"]
depends_on = ["0024"]
labels = ["frontend", "design"]
+++
## Outcome

each audience card on the landing page renders the slice-two action specified on sheet M4: one ghost-styled link per card with fixed copy and destination, safe external attributes, failing-first tests, and a dated evaluation report recording the QA outcomes

## Acceptance

- [ ] AudienceCard renders exactly one action link below the body with the M4 copy label href relationship and A2 styling and no other interactive surface
- [ ] the three cards resolve to the install page the docs home and the GitHub repository with target _blank and rel noopener noreferrer on external destinations
- [ ] AudienceRow passes the action prop through and the LandingPage wires the three M4 destinations with tests asserting the resolved hrefs
- [ ] bun tests typecheck and build stay green with the new tests failing first before implementation
- [ ] the visual QA driver passes at 320 390 768 1024 1440 with no horizontal overflow and a dated evaluation report records the outcomes

## Log

- 2026-10-24 — created
- 2026-10-24 — started
- 2026-10-24 — started: contract approved first as ticket 0024 (functional design F-06 and sheets M4 A2 O3 updated in fe7c45e) before any test or implementation work per GOV-09.07
- 2026-10-24 — RED evidence: 5 server-render tests plus 1 interaction test written against the approved 0024 contract fail with the action absent — audience card renders-no-link, row pass-through, page wiring, and the mounted-DOM reachability test; 47 pre-existing tests still pass, so the failures isolate the new behavior
- 2026-10-24 — GREEN: AudienceCard gains the optional action prop rendering exactly one ghost anchor with target and rel only when external, AudienceRow passes the action through, LandingPage wires the three M4 destinations, molecules.css adds the token-only tv-audience-card__action block; two page-test assertions corrected during green — the primary-actions test now scopes to tv-button--primary anchors (its stated intent) and the destination counts include the pre-existing nav and footer links; no assertion weakened, both tests assert more than before; the superseded slice-one non-interactive card test is replaced by the exactly-one-action invariant from the approved contract
- 2026-10-24 — evidence: cd torviello-landing/web && bun test src — 52 passed 0 failed; SVELTE_COMPILE_MODE=client bun test tests/interaction.test.ts — 3 passed 0 failed; bun run typecheck — clean; bun run build — green; bun run scripts/visual-qa.ts — VISUAL QA PASS 0px overflow at 320 390 768 1024 1440 h1 count 1; molecules.css raw-value grep clean; root npm test — 3 passed; root npm run build — clean; uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles — 45 passed; uv run ruff check . — clean; torviello_roles check — ok: 25 tickets; screenshots visually reviewed at 1440 and 390 — actions render inside the cards with no clipping; dated evaluation report 2026-10-24-landing-slice-two-actions.md records commands metrics per-threshold outcomes the TDD record and the placeholder-host assumption
- 2026-10-24 — evidence: bun test src 52 passed; interaction 3 passed; typecheck build visual-qa root gates pytest ruff and roles check all green; evaluation report 2026-10-24-landing-slice-two-actions.md committed with screenshots
