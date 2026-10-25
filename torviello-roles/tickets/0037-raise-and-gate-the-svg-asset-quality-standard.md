+++
id = "0037"
title = "Raise and gate the svg asset quality standard"
status = "done"
priority = "P1"
owner = "designer"
created = "2026-10-24"
updated = "2026-10-25"
requirements = ["PDL-013"]
controls = ["GOV-12", "GOV-08", "GOV-10"]
depends_on = ["0036"]
labels = ["design", "packaging"]
+++
## Outcome

brand svg assets meet a defined quality bar: the mark is vectorized from the board at maximum practical resolution with high-precision curve fitting, every brand svg passes structural checks (viewBox, no embedded rasters, size budgets, token-safe or brand-fixed fills) and an objective render-parity gate proving the vector matches the board crop

## Acceptance

- [ ] the quality standard is written into the design sheets and the designer role rules with measurable thresholds
- [ ] the sync contract test enforces the structural checks and the render-parity gate with the tool prerequisite recorded
- [ ] the canonical mark is re-vectorized at eight times the board crop with hundredth-unit curve precision and the regenerated twins and favicon keep the sync contract green
- [ ] the full gate set stays green with the new quality gates failing before the improved asset lands

## Log

- 2026-10-24 — created
- 2026-10-24 — started
- 2026-10-25 — quality standard codified: designer document 04 gains the svg asset quality bar (viewBox, no embedded rasters, size budgets, measured brand palette only, board render parity IoU >= 0.80 rasterized by a real browser engine) and the design sheets sheet-discipline section cites it; the normative gate lives in the design unit sync contract test
- 2026-10-25 — re-vectorization: the canonical mark was re-traced from the board lockup at eight-times Lanczos resolution with potrace hundredth-unit curve fitting (superseding the four-times trace), gradient stops measured from board pixels (FA8E5B F7734A FC6E41 ramp, shard F5F4F4), and the transform frame-locked to the reference crop ink box; logo-mark.ts and favicon.svg regenerated from the same geometry (favicon at size-appropriate 2x geometry, 1.4KB)
- 2026-10-25 — diagnostics recorded: the parity gate initially reported 0.538-0.749 for three non-obvious causes — ImageMagick's internal MSVG renderer cannot resolve the nested potrace transforms (gate now rasterizes through Chrome via the landing playwright toolchain), a 16-bit gray dump broke byte comparison (fixed with -depth 8), and the asset transform ignored the trace ink offset (fixed by frame-locking to the measured ink box); final board parity 0.951 against the committed reference crop fixture
- 2026-10-25 — evidence: RED first — structural bar failed on off-palette fills and parity failed at 0.538-0.749 before the improved asset landed; after: uv run --locked pytest torviello-design/tests — 13 passed (6 sync-and-quality contract tests); cd torviello-landing/web && bun test src — 64 passed 0 failed with the fork guard updated to pin the 8x geometry and forbid the 0023 0034 predecessors; interaction — 3 passed; typecheck clean; build green; visual QA PASS at all five widths; live nav screenshot reviewed; enforcer configuration security packaging roles — 57 passed; uv run ruff check . — clean (2 unsafe-fix hints, no violations); root npm test and build — clean; torviello_roles check — ok: 37 tickets
- 2026-10-25 — evidence: svg quality bar codified and gated; mark re-vectorized at 8x with 0.951 board parity; all unit and root gates green
- 2026-10-25 — cleanup append-only: the chrome render script and host html moved to a tempfile so the gate leaves no transient files in the design unit; the committed .parity-render.ts artifact was removed; subprocess import lifted to module level; suite re-run green after cleanup
- 2026-10-25 — evidence: design 13 passed after cleanup; landing 64+3 and root gates verified earlier in the ticket; store check ok 37 tickets
