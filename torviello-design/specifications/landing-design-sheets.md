# Landing design sheets — slices 1–2

**Role:** designer  
**Unit:** torviello-design  
**Tokens:** [`torviello-design/contracts/design-tokens.json`](../contracts/design-tokens.json)  
**Functions:** [`landing-functional-design.md`](landing-functional-design.md)

Every atom, molecule, organism, template, and page that slices 1 and 2
introduce is designed here as a required sheet. Components consume **semantic
tokens only**; a raw value where a token exists is a review finding. Slice-2
additions (the M4 per-card action) carry their own state and accessibility
blocks and cite the ticket that designed them (0024).

## Atoms

### A1 Button — primary

- purpose: the single primary action of a view ("Get Started")
- tokens: `action-primary` fill, `action-label` text, `radius-control`,
  `space-2`/`space-4` padding, `font-family-sans` at `size-body`,
  `weight-semibold`
- icon (house rule 10, ticket 0029): pairs one A7 icon left of the label,
  aria-hidden, inheriting the label color; the icon nudges 2px toward its
  direction on hover and focus-visible, suppressed under reduced motion
  (house rule 8, ticket 0032)
- states: default; hover `action-primary-hover`; focus-visible 2px
  `focus-ring` outline offset 2px; active pressed (scale 0.98, no color change);
  disabled `surface-raised` fill with `text-muted` label
- contract: renders a real `<button>` or `<a>`; keyboard operable; `aria-busy`
  when loading
- accessibility: label on orange ≥ 4.5:1 (measured 6.58); target ≥ 44×44px;
  visible focus indicator survives the design
- do: one per view. don't: use two primary buttons side by side

### A2 Button — ghost

- purpose: secondary actions ("View on GitHub") and, from slice 2, the
  per-card audience action (keeps the primary A1 unique to the hero)
- tokens: transparent fill, 1px `border-glass` border, `text-primary` label,
  same geometry as A1
- icon: same A7 pairing rule as A1 (house rule 10, ticket 0029)
- states: hover `surface-glass` fill; focus/disabled as A1
- contract: may render an external link with `target="_blank"`
  `rel="noopener noreferrer"`
- accessibility: identical target size and focus treatment as A1
- do: pair with a primary button. don't: use ghost for the main call to action

### A3 NavLink

- purpose: top navigation item
- tokens: `text-primary` at `size-label` weight regular; hover `text-primary`
  underline with `action-primary` underline color
- states: default, hover, focus-visible ring, current-section (orange
  underline)
- contract: anchor with in-page hash or external docs link
- accessibility: nav landmark wraps the list; current page/section conveyed by
  `aria-current`
- don't: hide focus outlines to keep the hero "clean"

### A4 SectionLabel

- purpose: the small all-caps eyebrow ("AI-NATIVE INFERENCE ENGINE",
  "FOR BUILDERS")
- tokens: `text-muted` (or `action-primary` on dark hero), `size-label`,
  letter-spacing 0.2em, weight semibold
- accessibility: decorative casing — the underlying text stays sentence case for
  screen readers where practical

### A5 Logo lockup

- purpose: brand mark + "torviello" wordmark
- tokens: mark in `action-primary`; wordmark in `text-primary`; height 32px in
  the nav
- contract: single `<a href="#top" aria-label="Torviello home">`; the mark is
  decorative (`aria-hidden`), the word carries the name
- don't: recolor the mark per section

### A6 TerminalLine

- purpose: one line of the terminal transcript
- tokens: `font-family-mono` at `size-body`; `$` prompt and bullets in
  `accent-secondary`; command text `text-primary`; status text `text-muted`
- states: static (complete) and animated (typing/fade-in per line, skipped
  under reduced motion)
- content (slice 2 correction, ticket 0026): the transcript shows the
  documented engine session only — `$ torviello-engine --help`,
  `$ TORCH_PORT=8000 torviello-engine`, and the real JSON startup event
  (`{"event":"startup","version":"1.0.0","correlation_id":"…","message":"engine
  started"}`); no invented commands, status prose, or decorative emoji
- accessibility: the block is a `<pre>`-based transcript selectable as text;
  animation is decorative and suppressed by `prefers-reduced-motion`

### A7 Icon (tickets 0029 and 0036)

- purpose: one glyph from the sliced brand asset set
  (`torviello-design/brand/icons/*.svg`) rendered inline
- source of truth: the asset file plus its published code twin
  (`torviello-design/brand/icons.ts`), proven equal by the design unit's sync
  contract test; consumers import the twin (GOV-12.07) and never embed vector
  data. A path written directly in consuming-unit code is a finding
- tokens: inherits `currentColor` so the consuming element's `color` token
  drives the glyph (for example `action-primary` in M3, `text-primary` in
  A1/A2); sizing is the consuming atom's job, default 20px in actions
- contract: `name` prop resolving to an asset in the set; renders 24×24
  viewBox svg, `aria-hidden="true"`, `focusable="false"`; decorative by
  definition — the labeled element carries the accessible name (house rule
  11)
- states: none of its own; color and size come from the consumer's state
- accessibility: always `aria-hidden`; never the only carrier of meaning
- do: consume from the set. don't: recolor per instance outside tokens,
  improvise a new path, or use an icon without a label on the action

## Molecules

### M1 NavBar

- composed atoms: A5 + 4×A3 + A2 (GitHub) + A1 (Get Started)
- tokens: `surface-base` at 90% opacity with `border-glass` bottom hairline;
  `space-4` vertical, `space-16` horizontal (max-width 1200px centered)
- contract: emits nav landmark; menu button toggles the link list below 768px
  with `aria-expanded`
- states: sticky top; collapsed (mobile) with open/closed menu

### M2 GlassCard

- purpose: the hero's DEVELOP / DEPLOY / INFER cards
- tokens: `surface-glass` fill, `border-glass` 1px border, `radius-glass`,
  inner icon in `action-primary` from the A7 asset set (box, package, zap),
  title `text-primary`, caption `text-muted`
- states: hover lifts fill to `surface-raised` with a 1px `action-primary`
  border and a soft orange glow (decorative, suppressed under reduced motion);
  the cards are **not** interactive — no pointer cursor, no tab stop
- accessibility: purely decorative group; `aria-hidden` on the glow layer;
  sequence reads DEVELOP → DEPLOY → INFER in DOM order

### M3 FeatureItem

- purpose: one value-strip entry (icon + title + subcopy)
- tokens: icon `action-primary` from the A7 asset set (zap, layers, sliders,
  users), title `text-primary` semibold, subcopy `text-muted`; `space-3` gap;
  4-up grid ≥ 1024px, 2×2 below, stacked < 560px
- accessibility: icon `aria-hidden`; the pair reads title then subcopy

### M4 AudienceCard

- purpose: one audience card (eyebrow + heading + body over an image)
- tokens: `surface-glass` over the photo, gradient scrim to `surface-base` at
  the bottom, A4 eyebrow in `action-primary`, heading `text-primary` at
  `size-heading`, body `text-muted`
- action (slice 2, tickets 0024 and 0029): one A2-styled link below the body
  with an A7 icon —
  "Start building →" with arrow-right → `https://docs.torviello.dev/install`
  (builders), "Read the docs →" with book-open → `https://docs.torviello.dev`
  (AI teams), "See it on GitHub →" with the GitHub mark →
  `https://github.com/torviello` (real-world AI);
  external destinations carry `target="_blank" rel="noopener noreferrer"`
- states: card hover raises scrim opacity slightly (decorative); action hover
  `surface-glass` fill per A2, focus-visible 2px `focus-ring` outline offset
  2px; no card-level pointer cursor — only the action is interactive
- accessibility: the photo is `aria-hidden` background; text contrast holds on
  the scrim (measured against `surface-base` values, 0019 evidence); the
  action is a real link with a visible label (no icon-only target), target
  height ≥ 44px; DOM order reads eyebrow → heading → body → action

## Organisms

### O1 HeroSection

- composed: A4 eyebrow, display heading (two lines, "infer." in
  `action-primary`), body copy, A1 + A2, and 3×M2 with the flowing orange ribbon
  artwork behind
- tokens: `surface-base`; heading at `size-display` weight semibold;
  `space-16` vertical rhythm
- states: ribbon artwork animates subtly on load; static under reduced motion
- accessibility: heading is one `<h1>`; artwork `aria-hidden`; DOM order reads
  eyebrow → heading → copy → actions → cards

### O2 FeatureStrip

- composed: 4×M3 in a responsive grid
- contract: no interaction; pure content organism

### O3 AudienceRow

- composed: 3×M4 cards
- contract: cards are non-interactive in slice 1; from slice 2 (ticket 0024)
  each card renders exactly one M4 action link with the destinations fixed in
  the M4 sheet — no other interactive surface on the card

## Template and page

### T1 LandingTemplate

- template: fixed nav slot, stacked section slots (hero, value strip, audience
  row, terminal, footer), content max-width 1200px centered with `space-16`
  side padding; single dark theme
- states: breakpoints 1200 / 1024 / 768 / 560 / 320

### P1 LandingPage

- template T1 populated with O1 → O2 → O3 → terminal block → footer
- states: every state from the functional design renders (default, focus
  walk, mobile menu open, reduced motion)
- entry: `/` — exit: F-02 install route, F-03 GitHub, F-01 anchors

## Sheet discipline

- Sheets live here and are cited by the implementation ticket; changing one is
  a logged change on the owning ticket with the affected acceptance checks.
- Implementation is verified against these sheets cell by cell; a component
  built from a fork instead of this inventory is a finding.
- Accessibility evidence (keyboard walkthrough, contrast measurements in
  `test_design_tokens.py`, screen-reader pass) lands in the designer role's
  evidence table once the slice is implemented.
