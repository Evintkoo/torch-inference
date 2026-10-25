+++
id = "0038"
title = "Assemble the full board composition on the landing page"
status = "review"
priority = "P1"
owner = "engineer"
created = "2026-10-25"
updated = "2026-10-25"
requirements = ["PDL-013"]
controls = ["GOV-07", "GOV-08", "GOV-09", "GOV-10", "GOV-12"]
depends_on = ["0037"]
labels = ["frontend", "design"]
+++
## Outcome

the landing page renders the complete approved board composition: the hero panel with in-panel navigation, the luminous develop-deploy-infer flow artwork, and the feature strip beside the brand identity panel on top, and the four-card showcase (builders, ai teams, real-world ai, labeled-illustrative terminal) beneath, with desktop-tablet-mobile responsive behavior and the documented engine session truthfulness rules adapted to the labeled illustrative terminal card

## Acceptance

- [ ] the 1536px reference viewport shows the 2-column upper grid (hero panel plus brand panel) and the 4-column showcase row with equal card heights
- [ ] verified by dom measurements in the visual qa run
- [ ] the brand panel renders the primary lockup
- [ ] three logo variation previews
- [ ] the four palette swatches with hex values
- [ ] and the inter and jetbrains mono typography samples
- [ ] the inference flow renders three ordered stages (develop
- [ ] deploy
- [ ] infer) over decorative svg stream artwork that is aria-hidden and animates only where motion is welcome
- [ ] the terminal showcase card labels its pip and serve commands as an illustrative example so no fabricated command is presented as verified behavior
- [ ] bun test src
- [ ] bun run test:interaction
- [ ] bun run typecheck
- [ ] and bun run build pass in torviello-landing/web
- [ ] visual qa passes with zero horizontal overflow at 1536 1440 1280 1024 768 390 375 320 and screenshots are archived as evaluation evidence
- [ ] uv run --locked pytest torviello-design/tests torviello-roles and uv run ruff check . and torviello_roles check pass repository-wide

## Log

- 2026-10-25 — created
- 2026-10-25 — created from the board-composition task direction: full upper grid (hero panel plus brand panel) and four-card showcase; the board terminal copy (pip install torviello, torviello serve) returns as an explicitly labeled illustrative example per the task direction, which supersedes the 0026 owner direction for this card while keeping truthfulness via the visible label; photos for the builders and ai-teams cards and the dusk city will be generated assets owned by torviello-media
- 2026-10-25 — started
- 2026-10-25 — RED: new board-composition tests written first and confirmed failing — cd torviello-landing/web && bun test src = 63 pass / 10 fail / 5 errors across 73 tests; failures are the missing HeroPanel, InferenceFlow, BrandPanel, ShowcaseGrid, TerminalCard modules and the not-yet-restructured page composition
- 2026-10-25 — GREEN: implemented the full board composition — HeroPanel (in-panel nav, promise, InferenceFlow artwork, FeatureStrip), BrandPanel (lockup, variations, hex palette, typography), ShowcaseGrid (three M4 audience cards with city-art real-world card plus the M8 TerminalCard labeled ILLUSTRATIVE), canvas template, extended token contract mirrored in tokens.css; cd torviello-landing/web && bun test src = 78 passed 0 failed, test:interaction = 5 passed, typecheck clean, build green; visual qa driver extended to 1536/1440/1280/1024/768/390/375/320 — VISUAL QA PASS, 0px overflow everywhere, hero:brand ratio 2.26:1 and four equal card heights 386px at the reference viewport; uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles = 51 passed; torviello_roles check ok 38 tickets; root npm test and build clean; limitations recorded: builders and ai-teams photos pending (gemini daily quota exhausted, retry scheduled), real-world card ships the built-in dusk-city svg art, ruff shows 5 pre-existing HEAD failures in torviello-design/tests/test_brand_assets.py untouched by this ticket; evaluation report with screenshots at evaluations/reports/2026-10-25-landing-slice-three-board.md
- 2026-10-25 — status -> review
