+++
id = "0020"
title = "Implement slice-one atoms with design tokens"
status = "done"
priority = "P1"
owner = "engineer"
created = "2026-10-23"
updated = "2026-10-23"
requirements = ["PDL-013"]
controls = ["GOV-12", "GOV-09"]
depends_on = []
labels = ["design", "frontend"]
+++
## Outcome

The slice-one atoms from the design sheets are React components styled exclusively through the tv token contract with class-based styling tests and the landing build green.

## Acceptance

- [ ] Button supports primary and ghost variants styled through semantic tokens
- [ ] NavLink renders with aria-current and the nav link classes
- [ ] SectionLabel renders the eyebrow pattern with the section label classes
- [ ] TerminalLine renders prompt and status variants as selectable text
- [ ] atoms stylesheet consumes only tv tokens with focus hover and target-size states
- [ ] web tests and tsc build pass with the new tests wired into the test script

## Log

- 2026-10-23 — created
- 2026-10-23 — evidence: atoms implemented per design sheets A1 A2 A3 A4 A6 — Button gained primary and ghost variants (class tv-button tv-button--variant, sheet states preserved), new NavLink with aria-current and safe external links, SectionLabel with accent variant and anchor id, TerminalLine with prompt and status variants and hidden markers; atoms.css consumes only --tv tokens (no raw hex — grep verified) with 44px target size focus-visible and hover states; package.json test script fixed to the migrated torviello-landing path and wired to all four atom test files; npm test 11 passed 0 failed; tsc --noEmit clean; design token tests 7 passed; ruff clean; check ok 20 tickets; logo lockup atom deferred pending the brand SVG asset — recorded as follow-up
- 2026-10-23 — evidence: npm test — 11 passed 0 failed across Button NavLink SectionLabel TerminalLine; npm run build (tsc --noEmit) — clean exit 0; pytest design+packaging+roles — 45 passed; ruff check . — clean; torviello_roles check — ok: 20 tickets; atoms.css token-only consumption verified by grep
