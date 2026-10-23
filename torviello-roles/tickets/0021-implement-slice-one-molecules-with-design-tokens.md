+++
id = "0021"
title = "Implement slice-one molecules with design tokens"
status = "done"
priority = "P1"
owner = "engineer"
created = "2026-10-24"
updated = "2026-10-24"
requirements = ["PDL-013"]
controls = ["GOV-12", "GOV-09"]
depends_on = ["0020"]
labels = ["design", "frontend"]
+++
## Outcome

the slice-one molecules from the design sheets M1 NavBar M2 GlassCard M3 FeatureItem M4 AudienceCard become React components styled exclusively through the tv token contract with class and semantics tests and the landing build green

## Acceptance

- [ ] NavBar renders the nav landmark with the four links in fixed order and a menu button carrying aria-expanded
- [ ] NavBar pairs the GitHub ghost action with the Get Started primary action and safe external attributes
- [ ] GlassCard renders icon title caption in DOM order with the glow layer aria-hidden and no interactive elements
- [ ] FeatureItem reads title then subcopy with the icon aria-hidden
- [ ] AudienceCard renders eyebrow heading body over an aria-hidden photo layer
- [ ] molecules stylesheet consumes only tv tokens with the responsive grids and hover states from the sheets
- [ ] web tests and tsc build pass with the new tests wired into the test script

## Log

- 2026-10-24 — created
- 2026-10-24 — created after the first 0021 draft lacked requirement and control links; recreated through the CLI with the full metadata before any work started
- 2026-10-24 — started
- 2026-10-24 — stack decision by owner 2026-10-24: the landing web unit implements as Svelte 5 components tested with bun test and happy-dom and built with vite per the owner-approved stack; the outcome text's React wording is superseded by this entry; the four slice-one atoms from 0020 port to Svelte with equivalent test coverage and the token stylesheets are stack-agnostic and carry over unchanged; the NestJS and inertia server dependencies from the referenced manifest stay out because the landing is a static marketing page
- 2026-10-24 — RED evidence: bun test in torviello-landing/web — the 16 molecule tests across NavBar GlassCard FeatureItem AudienceCard fail with module-resolution errors because the components do not exist yet, while the 22 ported atom tests pass; the failing-first gate holds in the new stack
- 2026-10-24 — GREEN: molecules implemented per sheets M1-M4 — NavBar (nav landmark, fixed-order links, menu button with aria-expanded and aria-controls, brand anchor to #top, paired ghost GitHub and primary Get Started actions), GlassCard (decorative, glow aria-hidden, no interactive elements), FeatureItem (title then subcopy, icon aria-hidden), AudienceCard (accent eyebrow via SectionLabel, aria-hidden photo layer, non-interactive); molecules.css consumes only tv tokens with color-mix compositions for the base-90 bar fill glow and scrim (raw-value grep clean) and the sheet M3 grid breakpoints 1024/560; atoms ported to Svelte with string-prop APIs because createRawSnippet does not survive server rendering; stack notes: bunfig preload compiles svelte server-side for bun test, vite config lazy-imports the svelte plugin, unit tsconfig scopes typecheck to src; React originals of NavLink SectionLabel TerminalLine removed as superseded duplicates with the Svelte ports carrying equivalent assertions (0020 evidence remains in git history); the React Button and the console demo moved to web/src/console pending an owner relocation decision
- 2026-10-24 — evidence: cd torviello-landing/web && bun test — 30 passed 0 failed (16 molecule + 8 atom server-render tests + 3 React console tests); bun run typecheck — tsc 7.0.2 noEmit clean; bun run build — vite 8.3.5 production build green (dist gitignored); root npm test — 3 passed 0 failed; root npm run build — tsc --noEmit clean; uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles — 45 passed; uv run ruff check . — clean; torviello_roles check — ok: 21 tickets; molecules.css token-only grep — no raw hex or raw rgb values
