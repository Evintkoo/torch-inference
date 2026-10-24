+++
id = "0033"
title = "Sweep the landing unit for defects and file every finding"
status = "done"
priority = "P1"
owner = "quality-assurance"
created = "2026-10-24"
updated = "2026-10-24"
requirements = ["PDL-013"]
controls = ["GOV-12", "GOV-10"]
depends_on = ["0032"]
labels = ["qa", "frontend"]
+++
## Outcome

a systematic defect sweep of torviello-landing across semantics accessibility spec conformance stylesheet token discipline and build hygiene files every finding with the twelve-section standard on this ticket and fixes the confirmed in-scope defects with gates green

## Acceptance

- [ ] every finding is filed on the ticket with the twelve-section structure including severity proposed for owner triage
- [ ] confirmed defects are fixed with evidence and the full gate set stays green
- [ ] findings that need an owner decision or new scope are recorded as filed-not-fixed with their tickets

## Log

- 2026-10-24 — created
- 2026-10-24 — started
- 2026-10-24 — defects found and fixed — D1 heading hierarchy (twelve-section: 1 metadata: S3 P2 proposed; 2 summary: heading levels jump h1 to h3; 3 preconditions: any page render; 4 reproduce: inspect AudienceCard and FeatureItem markup; 5 expected: sequential heading levels per wcag structure guidance; 6 actual: three audience headings and four feature titles rendered h3 with no h2; 7 reproducibility: always; 8 environment: landing web at 7b1bd8c; 9 evidence: grep h3 output; 10 impact: screen-reader heading navigation skips a level and the outline misleads; 11 investigation: sheets specified size-heading without a semantic level; 12 verification: tests assert h2 and no h3 remains — fixed) — D3 terminal transcript not pre-based (S4 P2 proposed; sheet A6 says the block is a pre-based transcript but body was a div with spans; fixed with a pre body, span lines, mono token font and overflow-x scroll; verification test asserts the pre and no div inside it) — D4 no skip link (S4 P2 proposed; keyboard users had to tab through the whole nav; fixed with a focus-revealed skip link to main id main plus test and token-only css) — D5 favicon 404 (S4 P3 proposed; no icon asset or link existed; fixed with public/favicon.svg sliced from the brand mark and the link element; verified in dist)
- 2026-10-24 — defects filed not fixed, owner decision required — D2 brand token divergence (1 metadata: S3 P2 proposed, severity final call is the owner; 2 summary: the shipped token primitives do not match the board palette the design claims to capture; 3 preconditions: none; 4 reproduce: compare the board color swatch labels midnight 071219 tangerine FF5729 warm white F7F9FA spectral teal 3DDCCF with torviello-design/contracts/design-tokens.json and tokens.css which carry 0b1020 ff683b f7f8fa 22d3c5; 5 expected: contract primitives equal the approved board values per the 0019 outcome; 6 actual: every color was shifted without a recorded decision; 7 reproducibility: always; 8 environment: design unit at 30b8c09; 9 evidence: the two file listings; 10 impact: brand fidelity and the recorded contrast evidence 17.82 6.58 10.09 were computed from the shifted values, so the board claim and the measured numbers trace to different colors; 11 investigation: the shift is uniform and deliberate-looking but no ticket logs it; 12 verification: an owner decision picks canonical values and the contract, css, and contrast evidence are regenerated from it; blocked on the design owner — D8 share metadata absent (og and twitter meta never specified; filed low, needs owner input on share imagery — no action) — D7 idle aria-disabled false (valid ARIA state, recorded as no action)
- 2026-10-24 — evidence: cd torviello-landing/web && bun test src — 62 passed 0 failed (6 new failing-first assertions); SVELTE_COMPILE_MODE=client bun test tests/interaction.test.ts — 3 passed; bun run typecheck — clean; bun run build — green with favicon in dist; bun run scripts/visual-qa.ts — VISUAL QA PASS 0px overflow at all widths; screenshot reviewed at 1440; raw-value grep — only token primitives carry hex; {@html} audit — three sites, all static module content in aria-hidden spans; landmarks audit — header main footer plus new skip link
- 2026-10-24 — evidence: 62+3 tests green; four defects fixed with failing-first tests; D2 filed blocked on the design owner, D8 and D7 filed as no-action
