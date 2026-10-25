# Landing board composition — specification

**Unit:** torviello-landing
**Ticket:** [0038](../../../torviello-roles/tickets/0038-assemble-the-full-board-composition-on-the-landing-page.md)
**Design source:** the approved brand board
([reference-board.png](../../../torviello-design/brand/reference-board.png)) and the
board-composition task direction (2026-10-25)
**Sheets:** [`torviello-design/specifications/landing-design-sheets.md`](../../../torviello-design/specifications/landing-design-sheets.md)
**Functional design:** [`torviello-design/specifications/landing-functional-design.md`](../../../torviello-design/specifications/landing-functional-design.md)
**Status:** approved for implementation on ticket 0038

This specification completes the board composition on top of slices 1–2: the
page becomes the full board canvas (upper hero + brand grid, lower four-card
showcase) instead of the stacked single-column rhythm shipped in slice one.

## Use cases

- UC-BC-1 — A first-time visitor reads the hero promise and sees the
  develop → deploy → infer flow artwork to the right, inside one bordered hero
  panel that also carries the navigation, the two actions, and the value strip
  along its bottom edge.
- UC-BC-2 — A brand-curious visitor opens the brand identity panel beside the
  hero and reads the primary lockup, the three logo variations, the four
  palette swatches with exact hex values, and the two typeface samples.
- UC-BC-3 — A evaluating visitor scans the four showcase cards (for builders,
  for AI teams, for real-world AI, terminal execution) and reaches the docs,
  install, and GitHub destinations from the first three.
- UC-BC-4 — A visitor at any viewport from 320px to the 1536px reference keeps
  the content hierarchy: two-column upper grid at desktop, stacked brand panel
  and two-column showcase on tablet, single column with the accessible menu on
  mobile.

## Functional requirements

- BC-01 — The page composes into a 12px-gapped panel canvas: a main grid of
  hero panel (≈69% width at the 1536px reference) and brand panel (≈31%), then
  a four-card showcase row. Panels carry a 1px hairline border and the panel
  radius.
- BC-02 — The hero panel contains, in order: the navigation (brand anchor,
  four fixed-order links, GitHub ghost action, Get Started primary action),
  the hero copy (eyebrow, two-line heading with the orange-emphasized word,
  supporting paragraph, paired actions), the inference-flow artwork filling the
  right half, and the four-item feature strip along the bottom edge.
- BC-03 — The inference-flow artwork renders three ordered decorative stages —
  DEVELOP, DEPLOY, INFER — increasing in size and emphasis, over a luminous
  orange multi-stroke SVG stream that is `aria-hidden`, mask-faded at the
  edges, and animated only where `prefers-reduced-motion` is not set (7–12s
  cycles).
- BC-04 — The brand panel renders, in order: the primary lockup (canonical
  imported mark + lowercase wordmark), three logo-variation previews (dark
  orange/white, light orange, dark symbol-only app icon) with the
  LOGO VARIATIONS and APP ICON captions, the COLOR PALETTE section with four
  swatches (Midnight #0B1020, Torviello Orange #FF683B, Warm White #F7F8FA,
  Signal Teal #22D3C5) each labeled with name and hex, and the typography
  samples (Inter — Headings & UI; JetBrains Mono — Code & Technical).
- BC-05 — The showcase row renders four equal-height cards: three audience
  cards (FOR BUILDERS / "From idea to impact.", FOR AI TEAMS / "Build, deploy,
  scale together.", FOR REAL-WORLD AI / "Models in motion.") with eyebrow,
  heading, body, one M4 action each over a decorative photo or illustration,
  and the terminal execution card with the window chrome, two prompt lines,
  and the four-step status rail with orange markers joined by a connector line.
- BC-06 — The terminal card presents the pip/serve example as an illustrative
  example: a visible mono caption labels it, so no command is presented as
  verified engine behavior (task direction 2026-10-25, refining the 0026 owner
  direction for this card).
- BC-07 — Breakpoints: ≥1280px shows the two-column upper grid and
  four-column showcase; 768–1279px stacks the brand panel beneath the hero and
  shows the showcase in two columns; <768px is single column with the menu
  button, 40–46px hero heading, and 20–24px content padding. No breakpoint
  produces horizontal overflow.

## Edge cases

- Reduced motion: the flow stream and every hover/glow transition render
  static and complete; no animation loops.
- Missing photos: cards keep the glass surface and scrim so text stays
  readable without imagery.
- Narrow desktop (1280–1439px): the brand panel keeps ≥360px and wraps its
  palette swatches to a 2×2 grid before any text clips.
- Keyboard-only: the in-panel nav, both hero actions, and the three card
  actions are reachable in DOM order; focus rings survive the artwork.
- Ultra-wide (above 1600px): the canvas caps at 1600px and centers so panel
  proportions stay within the reference ratios.

## Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-BC-1 | the 1536px reference viewport | the page renders | the upper grid is two columns with the hero panel ≈2.26× the brand panel width and four equal-height showcase cards below |
| AC-BC-2 | the rendered page | the brand panel is inspected | the lockup, three variation previews, four hex-labeled swatches, and two typeface samples are present in order |
| AC-BC-3 | the rendered page | the flow artwork is inspected | exactly three stages render in DEVELOP → DEPLOY → INFER order, the stream SVG is aria-hidden, and animation declarations sit behind no-preference motion queries |
| AC-BC-4 | the terminal card | its content is read | the pip and serve prompt lines and the four status rail steps render, and a visible illustrative-example label precedes or accompanies them |
| AC-BC-5 | the three audience cards | an action is activated | builders → install docs, AI teams → docs, real-world AI → GitHub; external ones open a new tab with safe rel attributes |
| AC-BC-6 | any width in 320…1536 | the page renders | scrollWidth − clientWidth ≤ 0 and no card content clips |
| AC-BC-7 | the documented engine session truthfulness rule | the page is inspected | the real engine session remains the only transcript presented as verified behavior; the pip/serve example carries the illustrative label |
