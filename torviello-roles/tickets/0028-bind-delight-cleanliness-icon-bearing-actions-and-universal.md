+++
id = "0028"
title = "Bind delight cleanliness icon-bearing actions and universal accessibility as house design rules"
status = "done"
priority = "P1"
owner = "designer"
created = "2026-10-24"
updated = "2026-10-24"
requirements = ["PDL-013"]
controls = ["GOV-12", "GOV-07"]
depends_on = ["0027"]
labels = ["design", "process"]
+++
## Outcome

the designer role rules gain four binding checkable house principles from owner direction 2026-10-24: every element earns a dopamine hit through visible feedback and visual energy, templates and positioning stay clean on a named grid, every button and action carries an icon from the sliced brand asset set, and every element ships accessibility criteria

## Acceptance

- [ ] roles designer document 04 carries the four principles as checkable rules with their constraints and conflict resolution
- [ ] the icon provenance defect is filed on the ticket with the twelve-section report structure
- [ ] role documentation change commits with the ticket per GOV-11.08

## Log

- 2026-10-24 — created
- 2026-10-24 — started
- 2026-10-24 — rules: document 04 gains the house principles section with four binding rules — 8 delight (dopamine hit: visible feedback on every interactive element, one moment of visual energy per section, subordinate to readability focus and reduced motion), 9 clean templates and positioning (one named grid, deliberate whitespace, every position a decision), 10 icon-bearing actions (every button and action pairs an icon from the sliced brand asset set, never improvised inline), 11 universal accessibility (every element ships accessible name and role or a recorded decorative justification)
- 2026-10-24 — defect filed per the twelve-section standard — 1 metadata: landing icon provenance finding, reported by owner 2026-10-24, severity proposed S4 priority P2 pending owner triage; 2 summary: feature and hero icons are hand-written inline svg strings in page code instead of sliced brand assets; 3 preconditions: slice-one landing page rendered; 4 reproduce: open torviello-landing/web/src/pages/LandingPage.svelte — the zap layers sliders users box and package icons are literal path strings; torviello-design/brand contains only logo-mark.svg; 5 expected: per the 0019 slicing discipline every board iconography enters the design unit as an asset that components consume with provenance; 6 actual: only the logo mark was sliced, the icons were improvised during 0021/0022; 7 reproducibility: always; 8 environment: torviello-landing/web at 8607a67; 9 evidence: LandingPage.svelte strokeIcons block, torviello-design/brand listing; 10 impact: brand drift, iconography unverifiable against the board, token theming coupled to page code; 11 investigation: sheets M2 and M3 name the icons semantically but never required asset provenance, so implementation improvised; 12 verification: icons exist as design-unit assets and landing components consume them with the provenance pattern established by Logo.svelte
- 2026-10-24 — evidence: roles/designer/04 updated with the four house principles; defect filed on the ticket log; committed with the ticket per GOV-11.08
