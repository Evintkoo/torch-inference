+++
id = "0041"
title = "Rebuild the landing page as a conversion-focused product page"
status = "review"
priority = "P1"
owner = "engineer"
created = "2026-11-03"
updated = "2026-11-03"
requirements = ["PDL-013"]
controls = ["GOV-06", "GOV-07", "GOV-08", "GOV-09", "GOV-10"]
depends_on = []
labels = ["frontend", "design"]
+++
## Outcome

the landing page stops imitating the design board's panel grid and reads like a modern developer-tool product page: sticky nav, unboxed hero with the documented engine session as the visual anchor, the value props as a real section, an honest pending-benchmark proof band, unified audience cards, a two-column terminal band, a dedicated CTA band, and a structured footer

## Acceptance

- [ ] sticky nav renders at the template level with the mobile menu behavior preserved
- [ ] hero presents one h1 promise without the brand-name line
- [ ] a trust line
- [ ] the documented engine session terminal
- [ ] and an inline flow rail that cannot clip
- [ ] value props render as a headed four-card section
- [ ] proof band shows three metric slots marked pending with an explicit no-claimed-numbers footnote
- [ ] three audience cards keep equal heights with a unified scrim and bottom-aligned actions
- [ ] terminal band becomes two-column with copy and the pip/serve example still labeled illustrative
- [ ] cta band and structured footer render
- [ ] cd torviello-landing/web: bun test src
- [ ] bun run test:interaction
- [ ] bun run typecheck
- [ ] and bun run build all pass
- [ ] visual qa passes with zero horizontal overflow at 1536 1440 1280 1024 768 390 375 320 with screenshots archived as evaluation evidence
- [ ] uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles
- [ ] uv run ruff check . (pre-existing 5 findings only)
- [ ] and uv run --directory torviello-roles python -m torviello_roles check pass

## Log

- 2026-11-03 — created
- 2026-11-03 — owner direction 2026-11-03: 'this template and ux and structure is so bad' - reviewed the archived 1536/390 screenshots with the owner, diagnosed structural defects (box-in-box monotony, hero h1 wasted on the brand-name line, clipped floating flow chips, value props buried as a hero footnote strip, inconsistent card scrims, ~60 percent empty terminal band, no proof content, stub footer); owner chose full redesign toward a conventional high-conversion dev-tool page with honest pending placeholders for absent metrics - authority recorded per GOV-07.05; supersedes the board-composition layout requirements, carries forward brand-sheet absence and truthfulness rules
- 2026-11-03 — started
- 2026-11-03 — spec first (GOV-07): specifications/landing-redesign.md written before implementation with UC-LP-1..6, LP-01..LP-09, edge cases, AC-LP-1..9 and the verification plan; landing-board-composition.md status records the GOV-07.05 supersession (BC-01/02/05/07 layout superseded; BC-04/BC-06/AC-BC-7 carried)
- 2026-11-03 — RED first (GOV-09): LandingPage/HeroPanel/SiteFooter/interaction contract tests rewritten to the LP spec, ProofBand and CtaBand suites added, template test moved to the nav snippet - first run cd torviello-landing/web: bun test src = 58 pass / 25 fail / 2 errors (missing ProofBand/CtaBand modules), confirmed failing before implementation; GREEN: template gained the sticky tv-topnav nav slot, HeroPanel rewritten (nav out, InferenceFlow artwork + hero strip deleted with their tests, inline rail + documented-session terminal in), ProofBand/CtaBand created, SiteFooter restructured to columns, LandingPage recomposed, tv-button--inverse atom added, shared card scrim and grids reworked - 86/86 unit tests, 6/6 interaction tests, typecheck clean, build green (148ms)
- 2026-11-03 — qa + repo checks 2026-11-03: visual-qa probes extended (sticky nav, proof band pending slots, cta band) with thresholds unchanged - VISUAL QA PASS at 1536/1440/1280/1024/768/390/375/320, 0px overflow, nav sticky, hero full-width 1496/1520, cards 3 at 386/386/386, proof 3 pending, terminal band + cta present, screenshots archived at evaluations/reports/2026-11-03-landing-redesign; uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles = 51 passed; uv run ruff check . = the same 5 pre-existing test_brand_assets.py findings as the 0038 baseline; torviello_roles check = ok: 41 tickets; evidence report written and READMEs updated; unrelated unstaged torviello-enforcer/test_status_tester.py change preserved and excluded from this ticket's commit
- 2026-11-03 — status -> review: redesign implemented and verified against the LP spec: 86 unit + 6 interaction tests, typecheck, build, visual qa pass at 8 widths with screenshots, repo pytest and ruff baseline unchanged; moved to review per the 0038-0040 pattern - independent review before close
