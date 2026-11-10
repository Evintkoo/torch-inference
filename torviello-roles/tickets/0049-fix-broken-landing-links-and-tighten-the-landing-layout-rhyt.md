+++
id = "0049"
title = "Fix broken landing links and tighten the landing layout rhythm"
status = "review"
priority = "P1"
owner = "engineer"
created = "2026-11-10"
updated = "2026-11-10"
requirements = ["PDL-013"]
controls = ["GOV-07", "GOV-09", "GOV-10"]
depends_on = ["0041"]
labels = ["landing", "frontend"]
+++
## Outcome

every outbound landing link resolves to a reachable location on the published repository and the page sections share one centered content rail with consistent heading rhythm

## Acceptance

- [ ] no link targets the nonexistent github.com/torviello org or the disabled Discussions page
- [ ] API Reference resolves to the published OpenAPI contract
- [ ] sections share the nav content rail width and section titles keep a fixed gap above their content
- [ ] hero flow stages use three distinct icons
- [ ] bun test src and test:interaction and typecheck and build pass
- [ ] visual qa passes at all eight widths with screenshots archived

## Log

- 2026-11-10 — created
- 2026-11-10 — started
- 2026-11-10 — owner direction 2026-11-10: 'please fix and improve the landing page' - link audit (curl + GitHub API) found github.com/torviello 404 (nonexistent org; nav/hero/card/cta), footer Discussions dead (has_discussions=false), API Reference pointing at the generic docs tree, and torviello-docs links 404 because origin/main lags local main by 50 commits (resolves on owner-approved push, not changed); screenshots showed sections off the nav rail (1496 vs 1242px), use-cases title touching cards (0px), duplicate-looking DEVELOP/DEPLOY glyphs, extra hero gap, phone card copy over bright photo centers. Spec first: landing-redesign.md third amendment LP-11/LP-12/LP-02 + verification rows. RED: bun test src 89 pass/4 fail; visual-qa LP-12 probes 8 widths failing. GREEN: repo links + Issues + OpenAPI reference, sliders glyph, shared 1200px border-box rail for sections/nav/footer, title gap, phone scrim after the 1279 step. Verified: bun test src 93/0, test:interaction 7/0, typecheck clean, build green, VISUAL QA PASS 0px overflow at 8 widths with screenshots archived (evaluations/reports/2026-11-10-landing-link-and-rail-fix); repo pytest scope 50 passed + 1 pre-existing failure (test_favicon_lives_in_the_design_unit trips on the gitignored prebuild-generated web/public/favicon.svg; passes on an unbuilt tree); ruff findings are pre-existing untracked root scripts and test_brand_assets. Not republished to gh-pages (needs owner approval)
- 2026-11-10 — status -> review
