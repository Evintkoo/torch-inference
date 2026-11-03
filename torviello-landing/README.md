# torviello-landing

Public landing page and marketing site. Brand message: The execution layer for AI.

## Layout

- `domain/` — domain model, invariants, and ownership.
- `specifications/` — use cases, requirement IDs, and acceptance criteria.
- `contracts/` — machine-readable interfaces and event schemas.
- `src/` — production implementation.
- `tests/` — unit, contract, and integration tests.
- `evaluations/` — plans, datasets, reports, and release decisions.
- `web/` — the landing web app: Svelte 5 components, Bun tooling, Vite build.

## Web app

- Stack: Svelte 5 (runes), Bun 1.3 (test and scripts), Vite 8 (build),
  TypeScript 7 for typechecking, happy-dom for future interaction tests.
- Design source of truth: `torviello-design/contracts/design-tokens.json` and the
  design sheets in `torviello-design/specifications/` (slices 1–3). Brand assets
  (icons, mark, favicon) are imported from `torviello-design` via the
  `@torviello/design/*` alias and showcase photography from `torviello-media`
  via `@torviello/media/*` (GOV-12.07) — never copied into this unit.
  Stylesheets in `web/src/styles/` consume semantic `--tv-*` tokens only; a raw
  value where a token exists is a review finding.
- Components: `web/src/components/ui/` — slice-one atoms (Button, NavLink,
  SectionLabel, TerminalLine, Logo) and molecules (NavBar, GlassCard,
  FeatureItem, AudienceCard), each with Bun server-render tests.
- Page: `web/src/components/organisms/` (HeroPanel, InferenceFlow, ShowcaseGrid,
  FeatureStrip), `web/src/components/sections/` (TerminalCard, SiteFooter),
  `web/src/template/LandingTemplate.svelte`, and
  `web/src/pages/LandingPage.svelte` assemble the board composition (tickets
  0038/0039/0040): a full-width hero panel, the three-card audience row with
  product / use-cases / community anchors, and the illustrative terminal band
  below the row. The design-standard brand sheet drawn on the board is internal
  design documentation and is not rendered on the site (ticket 0040). The three
  audience cards carry the showcase photography imported from
  `torviello-media/assets/landing` (sliced from the approved reference board);
  the terminal band presents the board's pip/serve example under a visible
  ILLUSTRATIVE label; every transcript presented as real behavior stays the
  documented engine session. Webfonts (Inter, JetBrains Mono) load locally via
  fontsource.
- `web/src/console/` — React inference-demo scaffold inherited from the engine
  scaffold. It is not landing scope; relocation to a console unit awaits an
  owner decision.

## Packaging

Per [GOV-12](../torviello-enforcer/governance/rules/12-independent-unit-packaging.md), this unit is packageable as an independent, versioned artifact (site build artifact); its packaging manifest, version, and build command live inside this unit, never at the repository root. Status: partial — the web app builds inside the unit (`web/` manifest, `bun run build` to `web/dist/`), but no versioned package manifest or packaging evidence exists yet.

## Validation

From `web/`:

- `bun test` — component suite (server-render semantics and class contracts).
- `bun run test:interaction` — DOM interaction category; requires the dev
  dependencies of the stack only, runs with `SVELTE_COMPILE_MODE=client`.
- `bun run typecheck` — `tsc --noEmit` over the app sources.
- `bun run build` — Vite production build.
- `bun run scripts/visual-qa.ts <out-dir>` — visual and overflow QA against a
  running dev server on :5173 (drives the locally installed Chrome).

Evaluation reports with screenshot evidence live in `evaluations/reports/`.
Repository-wide: `uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles`, `uv run ruff check .`, and `uv run python -m torviello_roles check`. The React console demo has its own suite wired into the repository-root `npm test`.

## Status

Slice three implemented on tickets 0038, 0039, and 0040: the board composition —
full-width hero panel (in-panel nav, promise, inference-flow artwork, feature
strip), the three-card audience row with torviello-media photography sliced from
the approved board, and the illustrative terminal band beneath the row — with
desktop, tablet, and mobile behavior. The design-standard brand sheet is not part
of the site (ticket 0040). Slice one and slice two history:
[2026-10-24-landing-slice-one-qa.md](evaluations/reports/2026-10-24-landing-slice-one-qa.md),
[2026-10-24-landing-slice-two-actions.md](evaluations/reports/2026-10-24-landing-slice-two-actions.md);
showcase-photography evaluation:
[2026-10-25-landing-showcase-photos.md](evaluations/reports/2026-10-25-landing-showcase-photos.md);
re-composition evaluation:
[2026-10-25-landing-recomposition.md](evaluations/reports/2026-10-25-landing-recomposition.md).
Follow-ups: confirm the placeholder domains (docs.torviello.dev,
github.com/torviello), replace the vector-interpreted logo mark when official
brand files exist, and run the screen-reader pass (designer role evidence).
