# Landing re-composition evaluation — 2026-10-25

**Owner:** engineer (ticket [0040](../../../../torviello-roles/tickets/0040-drop-the-brand-sheet-free-the-hero-and-move-the-terminal-bel.md))
**Scope:** torviello-landing page composition (BC-01, BC-04, BC-05, BC-06, BC-07)
— the design-standard brand sheet is off the public site, the hero panel spans
the canvas width, the use-cases row is the three audience cards with
board-matching photo treatment, and the illustrative terminal example moved out
of the card row into its own full-width band.
**Outcome:** pass — the owner direction of 2026-10-25 is implemented and
verified; this is not a release approval.

## Environment

- macOS (darwin), Bun 1.3, Svelte 5.57, Vite 8, TypeScript 7
- Google Chrome (locally installed) driven via playwright-core (CDP)
- Target: Vite dev server, http://localhost:5173/
- Source: `torviello-design/brand/reference-board.png` (1536×1024), showcase row
- Tooling: ImageMagick (`magick`) for the re-cropped photo slices

## Owner direction implemented

| Direction (2026-10-25) | Change |
|---|---|
| "why we have the design standard on the website, thats wrong" | `BrandPanel` removed from the page, its component/test/CSS deleted; BC-04 withdrawn, AC-BC-2 redefined as the absence check |
| "the cards are still not the same as the image" | Card scrim changed from a top-down 82% wash to a left-weighted gradient (88% → 70% at 45% → 0% at 78%) plus a 28% bottom fade; photos re-cropped for the wider three-card row |
| "the pip install stuff should be below or somewhere" | Terminal example removed from the showcase row and rendered in `.tv-terminal-band` after the row, before the footer, console centered at an 880px measure |

## Assets

| Asset | Size | Source crop (x,y,w,h) | Content |
|---|---|---|---|
| `torviello-media/assets/landing/builders.jpg` | 776×346 | 16,839 388×173 | builders card: laptop with the live dashboard under warm lamp light |
| `torviello-media/assets/landing/teams.jpg` | 472×484 | 630,770 236×242 | AI-teams card: three team members around a laptop |
| `torviello-media/assets/landing/city.jpg` | 676×356 | 880,834 338×178 | real-world card: dusk skyline with the orange inference line |

Crops remain text-free (the board's card copy sits top-left), Lanczos upscaled
2×, stripped, progressive JPEG quality 88. The new crops are landscape-leaning
to suit the wider cards created by moving the terminal out of the row.
Provenance and exact reproduction commands:
`torviello-media/assets/landing/README.md`.

## Commands and results

| Command | Result |
|---|---|
| `cd torviello-landing/web && bun test src` | 77 passed, 0 failed (BrandPanel suite removed with the component; page/showcase tests rewritten — RED first) |
| `bun run test:interaction` | 5 passed, 0 failed |
| `bun run typecheck` | tsc clean |
| `bun run build` | green (176ms) |
| `bun run scripts/visual-qa.ts ../evaluations/reports/2026-10-25-landing-recomposition` | VISUAL QA PASS — 0px overflow at 1536/1440/1280/1024/768/390/375/320 |
| `uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles` | 51 passed |
| `uv run ruff check .` | 5 pre-existing failures in `torviello-design/tests/test_brand_assets.py` (B905 ×2, S603 ×2, S607), identical to the ticket-0038 baseline — not introduced here |
| `uv run --directory torviello-roles python -m torviello_roles check` | ok: 40 tickets |

## Per-threshold outcomes

| Threshold | Target | Measured | Outcome |
|---|---|---|---|
| Brand sheet off the site (BC-04, AC-BC-2) | no logo variations, palette swatches, or typeface samples on the page | page suite asserts absence of brand identity landmarks, `LOGO VARIATIONS`, `APP ICON`, `COLOR PALETTE`, `JetBrains Mono`, `#FF683B`; DOM interaction test asserts no `aside[aria-label="Brand identity"]` | pass |
| Hero full width (BC-01, AC-BC-1) | hero spans the canvas width, no second column | 1496px hero inside a 1520px canvas (12px canvas padding each side) | pass |
| Audience row (BC-05) | exactly three equal-height cards | 3 cards, 386/386/386 px at 1536 | pass |
| Terminal band (BC-05, AC-BC-4) | own band after the row, before the footer, illustrative label and commands intact | `.tv-terminal-band` present; page test asserts row → band → footer order; label and both prompt lines asserted | pass |
| Board fidelity | photography visible behind the copy like the approved board | 1536 screenshot: laptop, team, and skyline stay visible right of and below the copy under the left-weighted scrim | pass |
| Overflow (AC-BC-6) | scrollWidth − clientWidth ≤ 0 at all 8 widths | 0px everywhere | pass |
| Motion/landmarks (AC-BC-3) | one h1, decorative flow aria-hidden, menu button below 768 | h1:1 at all widths; flow `aria-hidden="true"`; menu `none` ≥768, `flex` at 390/375/320 | pass |

Screenshots: [1536](2026-10-25-landing-recomposition/1536.png) ·
[1440](2026-10-25-landing-recomposition/1440.png) ·
[1280](2026-10-25-landing-recomposition/1280.png) ·
[1024](2026-10-25-landing-recomposition/1024.png) ·
[768](2026-10-25-landing-recomposition/768.png) ·
[390](2026-10-25-landing-recomposition/390.png) ·
[375](2026-10-25-landing-recomposition/375.png) ·
[320](2026-10-25-landing-recomposition/320.png)

## TDD record

1. RED: page and showcase tests rewritten first — full-width hero, brand-sheet
   absence, three-card row plus terminal band order, illustrative band label —
   and `ShowcaseGrid` rendered without its terminal prop, which failed the
   render. Confirmed failing before implementation.
2. GREEN: `BrandPanel` dropped from the page (component, test, and CSS block
   removed); `tv-main-grid` deleted so the hero is a canvas child;
   `ShowcaseGrid` reduced to the three audience cards; `.tv-terminal-band`
   added between the showcase row and the footer; scrim and photo crops
   reworked for board fidelity. 77/77 unit tests, 5/5 interaction tests,
   typecheck, and build pass.
3. QA caught a regression the unit suite cannot see: removing the upper grid
   left the hero as an implicit `auto` canvas column, whose min-content width
   forced 11px overflow at 375 and 66px at 320. `.tv-canvas` now declares
   `grid-template-columns: minmax(0, 1fr)` and the overflow probe plus the full
   QA run return 0px at every width.

## Assumptions and limitations

- **Provenance:** the photos remain board-derived crops, not generative media;
  the re-crop is a composition change, not new source material. They are
  decorative (aria-hidden, under the text scrim) and upscaled from card-scale
  board regions, so they are softer than native photography at very large
  viewports.
- The terminal band keeps the board's illustrative pip/serve example only; the
  documented engine session remains the sole transcript presented as verified
  behavior (BC-06/AC-BC-7).
- `BrandPanel` was deleted rather than parked as dead code. If the brand sheet
  is ever needed publicly it should return as a separate, deliberate page, not
  as a landing section.
- The screen-reader pass (designer role evidence) is still outstanding.
- `docs.torviello.dev` and `github.com/torviello` remain designated placeholder
  hosts.
- `uv run ruff check .` fails on HEAD for the pre-existing
  `test_brand_assets.py` defects recorded by ticket 0038; not fixed here.
