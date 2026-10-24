+++
id = "0034"
title = "Slice the true brand mark and drop the redundant label arrows"
status = "done"
priority = "P1"
owner = "designer"
created = "2026-10-24"
updated = "2026-10-24"
requirements = ["PDL-013"]
controls = ["GOV-12"]
depends_on = ["0033"]
labels = ["design", "frontend"]
+++
## Outcome

the brand mark is re-sliced from the board as the folded ribbon T with its white slash shard replacing the off-brand triangle interpretation across the logo asset the nav lockup and the favicon, action labels drop the text arrow now that every action carries an icon per owner direction, and the mistaken token divergence finding is retracted with zoomed board evidence

## Acceptance

- [ ] the canonical logo-mark asset the nav lockup and the favicon all render the ribbon T interpretation verified visually against the board crop
- [ ] no action label contains the arrow character and tests assert the clean labels with the icon carrying the direction
- [ ] the D2 finding is corrected append-only on ticket 0033 with the board palette labels as evidence and the full gate set stays green

## Log

- 2026-10-24 — created
- 2026-10-24 — started
- 2026-10-24 — owner direction 2026-10-24: the brand icon is wrong and the label arrow is still there; zoomed board crops show the true mark is a folded ribbon T (orange top ribbon with curled left tip, orange leg tapering to a point, warm-white slash shard between) and show the palette labels reading 0B1020 FF683B F7F8FA 22D3C5 which match the shipped tokens exactly, so 0033 D2 was a misreading of the low-resolution board and is retracted
- 2026-10-24 — implementation: the canonical torviello-design/brand/logo-mark.svg is re-sliced as the folded ribbon T (ascending bar with curled fold into the left-leaning tapered leg plus the warm-white slash shard), traced iteratively against zoomed board crops over four render-compare passes; Logo.svelte inlines the same vector with token-pure gradient stops (color-mix over action-primary, hover, and text-primary per the established raw-value rules) and the favicon applies the mark on midnight; action labels drop the text arrow everywhere per owner direction since every action now carries a directional icon
- 2026-10-24 — evidence: cd torviello-landing/web && bun test src — 62 passed 0 failed; SVELTE_COMPILE_MODE=client bun test tests/interaction.test.ts — 3 passed 0 failed; bun run typecheck — clean; bun run build — green; bun run scripts/visual-qa.ts — VISUAL QA PASS 0px overflow at all five widths; live nav and full-page screenshots reviewed at 1440 showing the ribbon mark and arrow-free labels; arrow-character grep over src is zero outside restored code comments; uv run --locked pytest — 45 passed; uv run ruff check . — clean; root npm test — 3 passed; root npm run build — clean; torviello_roles check — ok: 34 tickets; 0033 D2 retraction recorded append-only with the board palette labels as evidence
- 2026-10-24 — evidence: 62+3 tests green; mark verified visually against the board crop; labels arrow-free; all gates green
