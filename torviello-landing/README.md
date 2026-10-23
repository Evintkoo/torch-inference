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
  slice-one design sheets in `torviello-design/specifications/`. Stylesheets in
  `web/src/styles/` consume semantic `--tv-*` tokens only; a raw value where a
  token exists is a review finding.
- Components: `web/src/components/ui/` — slice-one atoms (Button, NavLink,
  SectionLabel, TerminalLine) and molecules (NavBar, GlassCard, FeatureItem,
  AudienceCard), each with Bun server-render tests. The A5 logo lockup is
  deferred pending the brand SVG asset.
- Page: `web/src/components/organisms/` (HeroSection, FeatureStrip,
  AudienceRow), `web/src/components/sections/` (TerminalDemo, SiteFooter),
  `web/src/template/LandingTemplate.svelte`, and `web/src/pages/LandingPage.svelte`
  assemble the full board composition with verbatim copy and product /
  use-cases / community anchors. Webfonts (Inter, JetBrains Mono) load locally
  via fontsource.
- `web/src/console/` — React inference-demo scaffold inherited from the engine
  scaffold. It is not landing scope; relocation to a console unit awaits an
  owner decision.

## Packaging

Per [GOV-12](../torviello-enforcer/governance/rules/12-independent-unit-packaging.md), this unit is packageable as an independent, versioned artifact (site build artifact); its packaging manifest, version, and build command live inside this unit, never at the repository root. Status: partial — the web app builds inside the unit (`web/` manifest, `bun run build` to `web/dist/`), but no versioned package manifest or packaging evidence exists yet.

## Validation

From `web/`:

- `bun test` — component suite (server-render semantics and class contracts).
- `bun run typecheck` — `tsc --noEmit` over the app sources.
- `bun run build` — Vite production build.

Repository-wide: `uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles`, `uv run ruff check .`, and `uv run python -m torviello_roles check`. The React console demo has its own suite wired into the repository-root `npm test`.

## Status

Slice one implemented end to end: design tokens, atoms, molecules, organisms,
template, and the assembled page with tests and a green build — the site
renders from `bun run dev`. Follow-ups: the A5 logo lockup awaits the brand
SVG asset, audience-card photos await media assets, and the F-02 install route
(#install) must resolve to the docs install page when routing lands.
