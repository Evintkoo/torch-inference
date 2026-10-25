# Landing slice-three board composition evaluation — 2026-10-25

**Owner:** engineer (ticket [0038](../../../../torviello-roles/tickets/0038-assemble-the-full-board-composition-on-the-landing-page.md))
**Scope:** torviello-landing slice three — the full board composition from
[landing-board-composition.md](../../specifications/landing-board-composition.md)
(BC-01…BC-07): upper hero + brand panel grid, four-card showcase, responsive
behavior, and the labeled-illustrative terminal card.
**Outcome:** pass with recorded limitations — ready for owner review; this is
not a release approval.

## Environment

- macOS (darwin), Bun 1.3, Svelte 5.57, Vite 8, TypeScript 7
- Google Chrome (locally installed) driven via playwright-core (CDP)
- Target: Vite dev server, http://localhost:5173/
- Design reference: `torviello-design/brand/reference-board.png` (1536×1024)

## Commands and results

| Command | Result |
|---|---|
| `cd torviello-landing/web && bun test src` | 78 passed, 0 failed (15 new slice-three tests, RED before implementation) |
| `SVELTE_COMPILE_MODE=client bun test tests/interaction.test.ts` | 5 passed, 0 failed (2 new: board composition mounts; illustrative label present in the DOM) |
| `bun run typecheck` | tsc clean |
| `bun run build` | green (158ms, dist regenerated) |
| `bun run scripts/visual-qa.ts qa-out/slice-three` | VISUAL QA PASS — 0px overflow at 1536/1440/1280/1024/768/390/375/320; menu button hidden ≥768px, visible below |
| `uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles` | 51 passed |
| `uv run python -m torviello_roles check` | ok: 38 tickets |
| root `npm test` | passed (console demo, untouched) |
| root `npm run build` | clean |
| `uv run ruff check .` | **5 pre-existing failures** in `torviello-design/tests/test_brand_assets.py` (B905 ×2, S603 ×2, S607), identical on HEAD before this work — not introduced by ticket 0038, left unfixed |

## Per-threshold outcomes

Thresholds were fixed on ticket 0038 before implementation (GOV-10.01).

| Threshold | Target | Measured | Outcome |
|---|---|---|---|
| Reference geometry (AC-BC-1, BC-01) | at 1536×1012: hero panel / brand panel width ratio 2.26:1 ±5%; four showcase cards equal height (±2px) | measured 2.26:1; card heights 386/386/386/386 | pass |
| Composition order (BC-02, BC-04, BC-05) | nav → copy → flow → strip inside the hero panel; lockup → variations → palette → typography in the brand panel; builders → teams → real-world → terminal across the showcase | asserted in server-render page tests and visible in the 1536 screenshot | pass |
| Flow artwork (BC-03, AC-BC-3) | exactly three stages in DEVELOP → DEPLOY → INFER order; one aria-hidden SVG stream; animation only under `no-preference` | asserted in unit tests; drift/breathe loops are 8–10s and gated by `prefers-reduced-motion` | pass |
| Terminal truthfulness (BC-06, AC-BC-4, F-07 amendment) | pip/serve example carries a visible "Illustrative example" mono label rendered before the commands; rail animates only where motion is welcome | asserted in unit + interaction tests; visible in screenshots | pass |
| Audience actions (F-06) | one ghost action per audience card; install/docs/GitHub destinations; external links carry `target="_blank"` + `rel="noopener noreferrer"` | asserted in suite; unchanged destinations from slice two | pass |
| Overflow (BC-07, F-08) | scrollWidth − clientWidth ≤ 0 at all tested widths | 0px at all 8 widths (one 18px overflow found and fixed at 320px during QA: terminal transcript min-content) | pass |
| Contrast | no new text pair below WCAG AA | no new text tokens; new surfaces reuse text-primary/text-muted over darker fills (higher contrast than the measured midnight pairs) | pass |
| Design-token contract | stylesheet mirrors the contract; semantic aliases resolve | `uv run --locked pytest torviello-design/tests` 51 passed (incl. extended tokens: surface-canvas/elevated/card, border-panel(-strong), glow-orange, accent-orange-light/dark, size-small/micro, radius-panel) | pass |
| Visual review | board fidelity, no clipping, readable terminal | screenshots reviewed at 1536 and 390; brand panel typography block initially overflowed the panel edge and was fixed (flex column + overflow hidden) before this pass | pass |

Screenshots: [1536](2026-10-25-landing-slice-three-board/1536.png) ·
[1440](2026-10-25-landing-slice-three-board/1440.png) ·
[1280](2026-10-25-landing-slice-three-board/1280.png) ·
[1024](2026-10-25-landing-slice-three-board/1024.png) ·
[768](2026-10-25-landing-slice-three-board/768.png) ·
[390](2026-10-25-landing-slice-three-board/390.png) ·
[375](2026-10-25-landing-slice-three-board/375.png) ·
[320](2026-10-25-landing-slice-three-board/320.png)

## TDD record

1. Specification and sheets approved first: BC-01…BC-07 plus O4–O7/M8 sheets
   and the F-04…F-10 amendment, all citing ticket 0038, before any test.
2. RED: 15 server-render tests + 2 interaction tests written against the new
   composition; confirmed failing (63 pass / 10 fail / 5 module errors).
3. GREEN: HeroPanel, InferenceFlow, BrandPanel, ShowcaseGrid, TerminalCard,
   AudienceCard art, template canvas, page wiring, and the token mirror.
4. One test corrected during GREEN: the terminal-dot assertion matched the
   dots-container class; tightened to exact attribute matching (asserts the
   same intent, more precisely).

## Assumptions and limitations

- **Showcase photography not shipped.** The builders and AI-teams cards render
  on the glass surface (the approved slice-two state) and the real-world card
  uses a built-in dusk-city SVG illustration with the inference-line motif. The
  image-generation quota was exhausted (Gemini free tier, daily limit; retry
  window ≈2h). The media alias (`@torviello/media`) and the asset slots are
  wired and documented in `torviello-media/assets/landing/README.md`; dropping
  the three generated JPEGs in and setting the `image` props completes BC-05
  photography without further code changes. Disclosed as the main fidelity gap
  against the board.
- The board's classic traffic-light window dots are rendered in brand hues
  (orange / light orange / teal) to keep every color token-pure; a raw red/
  yellow/green would violate the token contract.
- The documented engine session transcript was replaced on this card by the
  labeled-illustrative pip/serve example per the task direction recorded on
  ticket 0038; any future transcript presented as real behavior remains bound
  by the F-07 invariants.
- `docs.torviello.dev` and `github.com/torviello` remain designated placeholder
  hosts (0023 assumption).
- Reduced-motion, hover, and glow states are verified by CSS gating and code
  review, not automated screenshot diffing.
- The screen-reader pass (designer role evidence) is still outstanding.
- `uv run ruff check .` fails on HEAD for pre-existing defects in
  `torviello-design/tests/test_brand_assets.py` (ticket 0037 artifact); this
  evaluation records them without fixing them here.
