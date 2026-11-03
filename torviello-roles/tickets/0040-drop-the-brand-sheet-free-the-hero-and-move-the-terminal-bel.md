+++
id = "0040"
title = "Drop the brand sheet, free the hero, and move the terminal below the cards"
status = "review"
priority = "P1"
owner = "engineer"
created = "2026-10-25"
updated = "2026-11-03"
requirements = ["PDL-013"]
controls = ["GOV-07", "GOV-09", "GOV-10"]
depends_on = ["0039"]
labels = ["frontend", "design"]
+++
## Outcome

the landing page stops shipping the design-standard brand sheet and re-composes like a marketing page: the hero panel takes the full canvas width, the use-cases row is exactly the three audience cards with board-matching photo treatment, and the illustrative terminal example moves out of the card row into its own full-width band below the cards, before the footer

## Acceptance

- [ ] the page renders no brand identity / design-standard section: no logo variations
- [ ] palette swatches
- [ ] or typeface samples appear on the site
- [ ] at desktop widths the hero panel spans the full canvas width (no second column)
- [ ] the use-cases row renders exactly three audience cards with equal heights; the terminal example renders in its own full-width band after the row and before the footer
- [ ] keeping the visible ILLUSTRATIVE label and its commands
- [ ] the audience cards match the approved board composition: left-weighted scrim so the photography is visible behind and beside the text
- [ ] cd torviello-landing/web: bun test src
- [ ] bun run test:interaction
- [ ] bun run typecheck
- [ ] and bun run build all pass
- [ ] visual qa passes with zero horizontal overflow at 1536 1440 1280 1024 768 390 375 320
- [ ] three equal cards
- [ ] and the terminal band present; screenshots archived as evaluation evidence
- [ ] uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles
- [ ] uv run ruff check . (pre-existing 5 findings only)
- [ ] and uv run python -m torviello_roles check pass

## Log

- 2026-10-25 — created
- 2026-10-25 — started
- 2026-11-03 — GREEN re-run 2026-11-03 on the uncommitted implementation: brand sheet removed (BrandPanel component/test/CSS deleted, tv-main-grid dropped so the hero is a canvas child), ShowcaseGrid reduced to the three audience cards, terminal example rendered in .tv-terminal-band between the row and the footer, left-weighted card scrim with re-cropped board photos (builders 776x346, teams 472x484); cd torviello-landing/web — bun test src 77 passed 0 failed, test:interaction 5 passed 0 failed, typecheck clean, build green (180ms); visual qa re-run with dev server on :5173 — VISUAL QA PASS, 0px overflow at 1536/1440/1280/1024/768/390/375/320, hero full-width 1496/1520, cards 3 at 386/386/386, terminal band present, screenshots re-archived at evaluations/reports/2026-10-25-landing-recomposition
- 2026-11-03 — repo-wide checks re-run 2026-11-03: uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles = 51 passed; uv run ruff check . = the same 5 pre-existing failures in torviello-design/tests/test_brand_assets.py (B905, S603 x2, S607 and one more B905) recorded as the ticket-0038 baseline, none introduced here; uv run --directory torviello-roles python -m torviello_roles check = ok: 40 tickets; note: an unrelated unstaged change in torviello-enforcer/test_status_tester.py (status-contract operation counts 32->35) is preserved but deliberately excluded from this ticket's commit
- 2026-11-03 — status -> review: implementation and all recorded acceptance checks pass (web suite, interaction suite, typecheck, build, visual qa at 8 widths, repo pytest, roles check); moved to review per the 0038/0039 pattern - independent review before close
