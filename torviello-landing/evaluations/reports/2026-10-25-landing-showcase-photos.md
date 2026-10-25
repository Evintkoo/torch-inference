# Landing showcase photography evaluation — 2026-10-25

**Owner:** engineer (ticket [0039](../../../../torviello-roles/tickets/0039-generate-the-landing-showcase-photography-and-wire-the-photo.md))
**Scope:** torviello-landing showcase photography (BC-05) — the three audience
cards now carry the torviello-media photos sliced from the approved reference
board, wired through the `@torviello/media` alias.
**Outcome:** pass — the photography slot that was pending on ticket 0038 is
delivered; this is not a release approval.

## Environment

- macOS (darwin), Bun 1.3, Svelte 5.57, Vite 8, TypeScript 7
- Google Chrome (locally installed) driven via playwright-core (CDP)
- Target: Vite dev server, http://localhost:5173/
- Source: `torviello-design/brand/reference-board.png` (1536×1024), showcase row
- Tooling: ImageMagick (`magick`) for the asset slices

## Assets

| Asset | Size | Source crop (x,y,w,h) | Content |
|---|---|---|---|
| `torviello-media/assets/landing/builders.jpg` | 338×746 | 235,639 169×373 | builders card: person at the laptop under warm lamp light |
| `torviello-media/assets/landing/teams.jpg` | 412×746 | 660,639 206×373 | AI-teams card: three team members around a laptop |
| `torviello-media/assets/landing/city.jpg` | 676×356 | 880,834 338×178 | real-world card: dusk skyline with the orange inference line |

Crops were chosen text-free (the board's card copy sits top-left), Lanczos
upscaled 2×, stripped, progressive JPEG quality 88. Provenance and exact
reproduction commands: `torviello-media/assets/landing/README.md`.

## Commands and results

| Command | Result |
|---|---|
| `cd torviello-landing/web && bun test src` | 81 passed, 0 failed (3 new page tests; RED before wiring) |
| `bun run test:interaction` | 5 passed, 0 failed |
| `bun run typecheck` | tsc clean |
| `bun run build` | green (208ms); photos hashed into `dist/assets/` |
| `bun run scripts/visual-qa.ts ../evaluations/reports/2026-10-25-landing-showcase-photos` | VISUAL QA PASS — 0px overflow at 1536/1440/1280/1024/768/390/375/320 |
| `uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles` | 51 passed |
| `uv run ruff check .` | 5 pre-existing failures in `torviello-design/tests/test_brand_assets.py` (B905 ×2, S603 ×2, S607), identical to the ticket-0038 baseline — not introduced here |
| `uv run python -m torviello_roles check` | ok: 39 tickets |

## Per-threshold outcomes

| Threshold | Target | Measured | Outcome |
|---|---|---|---|
| Photos wired (BC-05) | three audience cards render imported photos via `@torviello/media`, no copied bytes in torviello-landing | three `img.tv-audience-card__photo` in board order, imports resolved from `torviello-media/assets/landing`; no image files added to the landing unit | pass |
| Decorative semantics | every photo `aria-hidden`, empty alt, lazy | asserted per photo in the page suite | pass |
| Reference geometry (AC-BC-1) | hero:brand 2.26:1 ±5%; four equal cards ±2px at 1536 | 2.26:1; 386/386/386/386 | pass |
| Overflow (AC-BC-6) | scrollWidth − clientWidth ≤ 0 at all 8 widths | 0px everywhere | pass |
| Board fidelity | card art matches the approved board (photos, not substitutes) | 1536 screenshot shows the board photography on all three cards; the built-in city SVG is no longer rendered on the page | pass |

Screenshots: [1536](2026-10-25-landing-showcase-photos/1536.png) ·
[1440](2026-10-25-landing-showcase-photos/1440.png) ·
[1280](2026-10-25-landing-showcase-photos/1280.png) ·
[1024](2026-10-25-landing-showcase-photos/1024.png) ·
[768](2026-10-25-landing-showcase-photos/768.png) ·
[390](2026-10-25-landing-showcase-photos/390.png) ·
[375](2026-10-25-landing-showcase-photos/375.png) ·
[320](2026-10-25-landing-showcase-photos/320.png)

## TDD record

1. RED: three page-level tests added before wiring — 14 pass / 2 fail initially
   (the decorative-attribute test passed vacuously on an empty match and was
   tightened with a `toHaveLength(3)` assertion); failures were the missing
   photo elements and the still-rendered built-in city SVG.
2. GREEN: `LandingPage` imports `builders.jpg`, `teams.jpg`, and `city.jpg`
   through the alias and sets the `image` props; the page drops `art="city"`.
   The `AudienceCard` SVG illustration stays in the component for the
   documented missing-photo edge case.
3. One coordinate error during asset production (crop offset) was caught by
   viewing the slices and corrected before wiring; a text fragment in the teams
   slice was removed by shifting the crop right. Final assets were visually
   verified.

## Assumptions and limitations

- **Provenance:** the photos are board-derived crops, not generative-media
  output — the image-generation quota stayed exhausted, and the owner directed
  using existing material. They are the project's own approved board
  photography, so no third-party licensing applies. The slices are decorative
  (aria-hidden, under the text scrim) and are upscaled from card-scale board
  regions; at very large viewports they are softer than native photography.
- The real-world card now shows the board's dusk city photo (with the orange
  inference line baked into the board art); the built-in SVG remains the
  fallback when a photo is missing.
- The screen-reader pass (designer role evidence) is still outstanding.
- `docs.torviello.dev` and `github.com/torviello` remain designated placeholder
  hosts.
- `uv run ruff check .` fails on HEAD for the pre-existing
  `test_brand_assets.py` defects recorded by ticket 0038; not fixed here.
