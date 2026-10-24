+++
id = "0036"
title = "Make design assets imported single-source artifacts and forbid forks"
status = "done"
priority = "P1"
owner = "engineer"
created = "2026-10-24"
updated = "2026-10-24"
requirements = ["PDL-013"]
controls = ["GOV-12", "GOV-08", "GOV-09"]
depends_on = ["0035"]
labels = ["design", "frontend", "packaging"]
+++
## Outcome

torviello-design becomes the single source of truth that consumers import: the icon set and brand mark exist as code twins of the canonical svg assets in the design unit with a normative sync contract test, the landing consumes them through a unit alias with no embedded vector data, the favicon moves into the design unit, and GOV-12 gains the import-dont-fork clause per owner direction 2026-10-24

## Acceptance

- [ ] GOV-12 carries the new clause that shared unit artifacts are consumed by import and embedded copies without a sync contract are a finding
- [ ] the design unit holds the code twins and the sync contract test proving they equal the canonical svg assets and that torviello-landing src contains no canonical vector data
- [ ] the landing nav lockup renders the canonical mark and the favicon resolves from the design unit with no copy in the landing public dir
- [ ] the full gate set including the new sync contract stays green with the new tests failing first

## Log

- 2026-10-24 — created
- 2026-10-24 — started
- 2026-10-24 — implementation: torviello-design/brand now publishes code twins (icons.ts, logo-mark.ts) generated from the canonical svg assets, and the favicon moved from the landing public dir into the design unit; a normative sync contract test (test_brand_assets.py) proves twins equal assets, the favicon lives in the design unit, and no canonical vector data is forked into torviello-landing src; the landing consumes everything through the @torviello/design alias declared in tsconfig paths and vite resolve.alias with lib/icons.ts and lib/brand.ts as thin re-exports, Logo.svelte renders the imported canonical mark, and main.ts injects the imported favicon url
- 2026-10-24 — evidence: RED first — sync contract 4 failed and the new Logo wiring test errored on the missing module before implementation; after: uv run --locked pytest torviello-design/tests — 11 passed (7 token contract + 4 sync contract); cd torviello-landing/web && bun test src — 64 passed 0 failed; SVELTE_COMPILE_MODE=client bun test tests/interaction.test.ts — 3 passed; bun run typecheck — clean after adding the svg?url module declaration; bun run build — green; bun run scripts/visual-qa.ts — VISUAL QA PASS at all five widths on a fresh dev server; live nav screenshot reviewed showing the imported ribbon-T; enforcer configuration security packaging plus roles — 55 passed plus SEC-05 green; root npm test and build — clean; torviello_roles check — ok: 36 tickets; rules updated: GOV-12.07 import-dont-fork clause, designer document 04 atomic rules amendment, sheets A7 amendment citing 0036, both unit READMEs
- 2026-10-24 — evidence: sync contract green 11 passed; landing 64+3 green with zero forked vector data; favicon single-sourced; GOV-12.07 and role rules updated with owner direction recorded
