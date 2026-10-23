# Landing slice-one QA evaluation — 2026-10-24

**Owner:** engineer (ticket [0023](../../../../torviello-roles/tickets/0023-finish-the-landing-page-with-qa-evidence.md))
**Scope:** torviello-landing slice one — assembled landing page (P1) at commit
state of ticket 0023, dev server build.
**Outcome:** pass with recorded assumptions — slice one is ready for owner
review; this is not a release approval.

## Environment

- macOS (darwin), Bun 1.3.14, Svelte 5.57, Vite 8.3.5, TypeScript 7.0.2
- Google Chrome (locally installed) driven via playwright-core
- Target: Vite dev server, http://localhost:5173/

## Commands and results

| Command | Result |
|---|---|
| `cd torviello-landing/web && bun test src` | 47 passed, 0 failed |
| `SVELTE_COMPILE_MODE=client bun test tests/interaction.test.ts` | 2 passed, 0 failed |
| `bun run scripts/visual-qa.ts ./qa-out` | VISUAL QA PASS (5 widths) |
| `bun run typecheck` | tsc 7.0.2 clean |
| `bun run build` | green, local woff2 fonts bundled |
| root `npm test` / `npm run build` | 3 passed / clean |
| `uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles` | 45 passed |
| `uv run ruff check .` | clean |
| `uv run python -m torviello_roles check` | ok: 23 tickets |

## Metrics and per-threshold outcomes

| Threshold | Target | Measured | Outcome |
|---|---|---|---|
| Horizontal overflow (F-08) | scrollWidth − clientWidth ≤ 0 at 320/390/768/1024/1440 | 0px at all widths | pass |
| Mobile menu behavior (F-08) | menu button hidden ≥768px, visible <768px, toggles `aria-expanded` | display none ≥768, flex <768; toggle verified in DOM (interaction test) | pass |
| Heading uniqueness (F-04) | exactly one `<h1>` per page | 1 at all widths | pass |
| Section anchors (F-01) | `#product`, `#use-cases`, `#community` resolve to elements | present in DOM | pass |
| Primary actions (F-02) | both Get Started actions navigate to the docs install page | `https://docs.torviello.dev/install` ×2 | pass (placeholder domain, see assumptions) |
| External links (F-03) | `target="_blank"` + `rel="noopener noreferrer"` | asserted in suite for GitHub and Docs | pass |
| Terminal transcript (F-07) | real text nodes, static under reduced motion | text nodes asserted; animations CSS-only, gated by `prefers-reduced-motion` | pass |
| Contrast (WCAG 2.2 AA) | tokens ≥ 4.5:1 | measured in `torviello-design/tests/test_design_tokens.py` | pass |
| Visual review | board fidelity, no clipped artwork, icon scale | screenshots reviewed at 4 widths; icon sizing, button underline, and ribbon-clip defects found and fixed this pass | pass after fixes |

Screenshots: [1440](2026-10-24-landing-slice-one-qa/1440.png) ·
[1024](2026-10-24-landing-slice-one-qa/1024.png) ·
[390](2026-10-24-landing-slice-one-qa/390.png) ·
[320](2026-10-24-landing-slice-one-qa/320.png)

## Defects found and fixed during this evaluation

1. Inline SVG icons had no intrinsic size and filled their containers (feature
   icons ~400px, card icons ~90px) — pinned to 28px / 40px.
2. Button-styled anchors showed the UA link underline — `.tv-button` now
   resets `text-decoration`.
3. Ribbon artwork hard-clipped at the hero's bottom edge and crossed the copy
   column — alpha-masked edges and rightward bias.

## Assumptions and limitations

- `docs.torviello.dev` and `github.com/torviello` are designated placeholder
  hosts; no canonical domains exist in the repository. Owner to confirm.
- The logo mark is a vector interpretation of the board logo pending official
  brand files (torviello-design/brand/logo-mark.svg).
- Audience-card photographs are not shipped; cards render on the glass surface
  pending real media assets.
- Reduced-motion and hover states are verified by code review and CSS gating,
  not by automated screenshot diffing.
- Screen-reader pass (designer role evidence) has not been performed yet.
