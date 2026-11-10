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
  `web/src/components/` holds the atomic UI layers (`ui/`, `sections/`,
  `organisms/`); `web/src/features/` holds behavior modules with their own
  tests (`reveal/` scroll reveal, `copy-command/` clipboard copy).
- `deploy/` — `deploy.ts` plus `remote-scripts.ts` (the runtime-built SSH
  command strings, GOV-13.03).
- `deploy/` (detail) — deployment of the built site to the Oracle server: `deploy.ts`
  (TypeScript on Bun; rsync-based release publishing with on-server checksum
  verification, atomic activation, and verified rollback),
  `Caddyfile` (server config
  source of truth), and the one-time OCI provisioning runbook
  [`deploy/server-setup.md`](deploy/server-setup.md). The interface is
  contracted in
  [`contracts/deployment/deploy-contract.json`](contracts/deployment/deploy-contract.json)
  and hermetically tested by `bun test tests/integration` (ticket 0043,
  [`specifications/landing-deployment.md`](specifications/landing-deployment.md)).
  CI deployment runs the same tooling through
  `.github/workflows/deploy-landing.yml`; the repository carries no committed
  shell scripts (GOV-13, ticket 0044).

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
- Page: `web/src/components/organisms/` (HeroPanel, ProofBand, CtaBand,
  ShowcaseGrid, FeatureStrip), `web/src/components/sections/` (TerminalCard,
  SiteFooter), `web/src/template/LandingTemplate.svelte`, and
  `web/src/pages/LandingPage.svelte` assemble the conversion-focused product
  page (ticket 0041, [`specifications/landing-redesign.md`](specifications/landing-redesign.md)):
  a sticky template-level nav, the unboxed hero with the documented engine
  session as its visual anchor, the value props as a headed section, the
  pending-benchmark proof band, the three-card audience row, the two-column
  illustrative terminal band, the closing CTA band, and the structured footer
  (#product / #use-cases / #community anchors). The design-standard brand
  sheet drawn on the board is internal design documentation and is not
  rendered on the site (ticket 0040). The three audience cards carry the
  showcase photography imported from `torviello-media/assets/landing` (sliced
  from the approved reference board); the terminal band presents the board's
  pip/serve example under a visible ILLUSTRATIVE label; the only transcript
  presented as real behavior stays the documented engine session. The proof
  band shows pending states only — no performance number is claimed until a
  benchmark run publishes. Webfonts (Inter, JetBrains Mono) load locally via
  fontsource.
- `web/src/console/` — React inference-demo scaffold inherited from the engine
  scaffold. It is not landing scope; relocation to a console unit awaits an
  owner decision.

## Packaging

Per [GOV-12](../torviello-enforcer/governance/rules/12-independent-unit-packaging.md), this unit is packageable as an independent, versioned artifact (site build artifact); its packaging manifest, version, and build command live inside this unit, never at the repository root. Status: partial — the web app builds inside the unit (`web/` manifest, `bun run build` to `web/dist/`), but no versioned package manifest or packaging evidence exists yet. The unit also owns its deployment artifact (GOV-12.04): the deploy kit in `deploy/` — release-publishing script, server configuration source, and provisioning runbook — is versioned with the unit and travels with it; deployment output and staging trees stay gitignored.

## Validation

From `web/`:

- `bun test` — component suite (server-render semantics and class contracts).

From the unit root:

- `bun test tests/integration` — hermetic deployment suite (contract validation plus deploy/rollback behavior against stubbed `ssh`/`rsync`/`bun`; no network) and the SEO suite, which builds into an isolated `dist-seo` and asserts the static head tags, `robots.txt`, `sitemap.xml`, JSON-LD, and byte-level sync of the published og/favicon assets with the owning units (ticket 0045, SEO-01…08).
- `bun run test:interaction` — DOM interaction category; requires the dev
  dependencies of the stack only, runs with `SVELTE_COMPILE_MODE=client`.
- `bun run typecheck` — `tsc --noEmit` over the app sources.
- `bun run build` — Vite production build.
- `bun run scripts/visual-qa.ts <out-dir>` — visual and overflow QA against a
  running dev server on :5173 (drives the locally installed Chrome).

Evaluation reports with screenshot evidence live in `evaluations/reports/`.
Repository-wide: `uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles`, `uv run ruff check .`, and `uv run python -m torviello_roles check`. The React console demo has its own suite wired into the repository-root `npm test`.

## Status

The landing page is the conversion-focused product page implemented on ticket
0041 ([landing-redesign specification](specifications/landing-redesign.md),
owner direction 2026-11-03): sticky nav, unboxed hero with the documented
engine session, value section, pending-benchmark proof band, three audience
cards, two-column illustrative terminal band, CTA band, structured footer —
with desktop, tablet, and mobile behavior and zero horizontal overflow from
320 to 1536. The design-standard brand sheet is not part of the site (ticket
0040). Earlier history: board composition on tickets 0038/0039/0040 (layout
superseded by the redesign), slice one and slice two:
[2026-10-24-landing-slice-one-qa.md](evaluations/reports/2026-10-24-landing-slice-one-qa.md),
[2026-10-24-landing-slice-two-actions.md](evaluations/reports/2026-10-24-landing-slice-two-actions.md);
showcase-photography evaluation:
[2026-10-25-landing-showcase-photos.md](evaluations/reports/2026-10-25-landing-showcase-photos.md);
re-composition evaluation:
[2026-10-25-landing-recomposition.md](evaluations/reports/2026-10-25-landing-recomposition.md);
redesign evaluation:
[2026-11-03-landing-redesign.md](evaluations/reports/2026-11-03-landing-redesign.md).
Follow-ups: confirm the placeholder domains (docs.torviello.dev,
github.com/torviello), fill the proof-band slots when the first benchmark run
publishes, replace the vector-interpreted logo mark when official
brand files exist, and run the screen-reader pass (designer role evidence).
