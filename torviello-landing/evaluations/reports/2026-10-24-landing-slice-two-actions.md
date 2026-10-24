# Landing slice-two actions evaluation — 2026-10-24

**Owner:** engineer (ticket [0025](../../../../torviello-roles/tickets/0025-implement-the-slice-two-audience-actions.md))
**Scope:** torviello-landing slice two — the per-card audience actions from
sheet M4 (ticket 0024 design), dev server build at the 0025 working state.
**Outcome:** pass with recorded assumptions — slice two is ready for owner
review; this is not a release approval.

## Environment

- macOS (darwin), Bun 1.3.14, Svelte 5.57, Vite 8.3.5, TypeScript 7.0.2
- Google Chrome (locally installed) driven via playwright-core
- Target: Vite dev server, http://localhost:5173/

## Commands and results

| Command | Result |
|---|---|
| `cd torviello-landing/web && bun test src` | 52 passed, 0 failed (6 new slice-two tests, RED before implementation) |
| `SVELTE_COMPILE_MODE=client bun test tests/interaction.test.ts` | 3 passed, 0 failed (1 new: audience actions reachable and safe in the mounted DOM) |
| `bun run scripts/visual-qa.ts ./qa-out` | VISUAL QA PASS (5 widths) |
| `bun run typecheck` | tsc 7.0.2 clean |
| `bun run build` | green |
| molecules.css raw-value grep | no raw hex or rgb outside `color-mix` compositions |
| root `npm test` / `npm run build` | 3 passed / clean |
| `uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles` | 45 passed |
| `uv run ruff check .` | clean |
| `uv run python -m torviello_roles check` | ok: 25 tickets |

## Metrics and per-threshold outcomes

Thresholds are the same pre-established set as the slice-one evaluation
(2026-10-24-landing-slice-one-qa.md), re-run unchanged per GOV-10.05.

| Threshold | Target | Measured | Outcome |
|---|---|---|---|
| Horizontal overflow (F-08) | scrollWidth − clientWidth ≤ 0 at 320/390/768/1024/1440 | 0px at all widths | pass |
| Mobile menu behavior (F-08) | menu button hidden ≥768px, visible <768px, toggles `aria-expanded` | display none ≥768, flex <768; toggle verified in DOM (interaction test) | pass |
| Heading uniqueness (F-04) | exactly one `<h1>` per page | 1 at all widths | pass |
| Primary actions (F-02) | both Get Started actions navigate to the docs install page | `tv-button--primary` ×2, both resolving to `https://docs.torviello.dev/install` | pass (placeholder domain, see assumptions) |
| Audience actions (F-06, slice 2) | exactly one ghost action per card; builders → install, AI teams → docs, real-world AI → GitHub; external ones carry `target="_blank"` + `rel="noopener noreferrer"` | asserted in unit tests, page test, and the mounted-DOM interaction test | pass |
| External links (F-03) | `target="_blank"` + `rel="noopener noreferrer"` | asserted in suite for GitHub and Docs | pass |
| Terminal transcript (F-07) | real text nodes, static under reduced motion | unchanged from slice one; suite still asserts text nodes | pass |
| Contrast (WCAG 2.2 AA) | tokens ≥ 4.5:1 | measured in `torviello-design/tests/test_design_tokens.py`; the action reuses A2 tokens (`text-primary` on glass over base), no new color pair introduced | pass |
| Visual review | board fidelity, actions inside cards, no clipping, no overflow | screenshots reviewed at 1440 and 390; actions render left-aligned inside each card with the ghost hairline; no defect found this pass | pass |

Screenshots: [1440](2026-10-24-landing-slice-two-actions/1440.png) ·
[1024](2026-10-24-landing-slice-two-actions/1024.png) ·
[768](2026-10-24-landing-slice-two-actions/768.png) ·
[390](2026-10-24-landing-slice-two-actions/390.png) ·
[320](2026-10-24-landing-slice-two-actions/320.png)

## TDD record

1. Contract approved first: ticket 0024 updated F-06 and sheets M4/A2/O3
   (commit fe7c45e) before any test or implementation (GOV-09.07).
2. RED: 5 server-render tests + 1 interaction test written against the M4
   contract and confirmed failing (module absent / action not rendered).
3. GREEN: minimal implementation — `action` prop on M4/O3, ghost anchor,
   `tv-audience-card__action` token-only style, page wiring.
4. Two page-test count assertions corrected during GREEN: the original
   install-href count test scoped to primary buttons (its stated intent), and
   the destination counts now include the pre-existing nav and footer links.
   No assertion was weakened; both tests assert more than before.

## Assumptions and limitations

- `docs.torviello.dev` and `github.com/torviello` are designated placeholder
  hosts per the 0023 assumption; owner to confirm.
- Audience-card photographs are not shipped; actions render on the glass
  surface pending real media assets.
- Reduced-motion and hover states are verified by code review and CSS gating,
  not by automated screenshot diffing.
- Screen-reader pass (designer role evidence) has not been performed yet.
