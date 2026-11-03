# Landing board composition — specification

**Unit:** torviello-landing
**Ticket:** [0038](../../../torviello-roles/tickets/0038-assemble-the-full-board-composition-on-the-landing-page.md)
**Design source:** the approved brand board
([reference-board.png](../../../torviello-design/brand/reference-board.png)) and the
board-composition task direction (2026-10-25)
**Sheets:** [`torviello-design/specifications/landing-design-sheets.md`](../../../torviello-design/specifications/landing-design-sheets.md)
**Functional design:** [`torviello-design/specifications/landing-functional-design.md`](../../../torviello-design/specifications/landing-functional-design.md)
**Status:** approved for implementation on ticket 0038; amended on
[ticket 0040](../../../torviello-roles/tickets/0040-drop-the-brand-sheet-free-the-hero-and-move-the-terminal-bel.md)
(owner direction 2026-10-25: the design-standard brand sheet comes off the
public site and the terminal example leaves the card row)

This specification completes the board composition on top of slices 1–2: the
page becomes the board canvas — a full-width hero panel, a three-card audience
row, and the illustrative terminal band beneath it — instead of the stacked
single-column rhythm shipped in slice one. The brand identity sheet drawn on the
board is internal design documentation; it is not website content (ticket 0040).

## Use cases

- UC-BC-1 — A first-time visitor reads the hero promise and sees the
  develop → deploy → infer flow artwork to the right, inside one bordered hero
  panel that spans the canvas width and also carries the navigation, the two
  actions, and the value strip along its bottom edge.
- UC-BC-2 — A visitor weighing installation reads the illustrative pip/serve
  example in its own full-width band below the audience row, with the visible
  illustrative label and the four-step status rail.
- UC-BC-3 — A evaluating visitor scans the three showcase cards (for builders,
  for AI teams, for real-world AI) and reaches the docs, install, and GitHub
  destinations from their actions.
- UC-BC-4 — A visitor at any viewport from 320px to the 1536px reference keeps
  the content hierarchy: full-width hero with the copy/flow split at desktop,
  three audience cards in one row at desktop, stacked cards below that, the
  terminal band full width, and the accessible menu on mobile.

## Functional requirements

- BC-01 — The page composes into a 12px-gapped panel canvas: a full-width hero
  panel, then the three-card audience row, then the terminal band, then the
  footer. Panels carry a 1px hairline border and the panel radius.
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
- BC-04 — Withdrawn on ticket 0040 (owner direction 2026-10-25). The page
  renders no brand identity or design-standard section: no logo variations,
  palette swatches, or typeface samples ship on the website. The brand sheet
  remains internal design documentation in `torviello-design/`.
- BC-05 — The showcase row renders exactly three equal-height audience cards
  (FOR BUILDERS / "From idea to impact.", FOR AI TEAMS / "Build, deploy, scale
  together.", FOR REAL-WORLD AI / "Models in motion.") with eyebrow, heading,
  body, one M4 action each over a decorative photo or illustration. The
  terminal execution card renders below the row in its own full-width band
  (between the row and the footer) with the window chrome, two prompt lines,
  and the four-step status rail with orange markers joined by a connector line;
  the console window is centered at a readable measure inside the band.
- BC-06 — The terminal band presents the pip/serve example as an illustrative
  example: a visible mono caption labels it, so no command is presented as
  verified engine behavior (task direction 2026-10-25, refining the 0026 owner
  direction for this card).
- BC-07 — Breakpoints: ≥1280px shows the full-width hero and the three-column
  audience row with the terminal band below; <1280px stacks the audience cards
  in a single column and keeps the terminal band full width; <768px is single
  column with the menu button, 40–46px hero heading, and 20–24px content
  padding. No breakpoint produces horizontal overflow.

## Edge cases

- Reduced motion: the flow stream and every hover/glow transition render
  static and complete; no animation loops.
- Missing photos: cards keep the glass surface and scrim so text stays
  readable without imagery.
- Narrow desktop (1280–1439px): the three cards keep equal heights and their
  copy wraps without clipping.
- No design-standard content: nothing on the page presents logo variations,
  palette swatches, or typeface samples; if the brand sheet is needed it stays
  in `torviello-design/`.
- Keyboard-only: the in-panel nav, both hero actions, and the three card
  actions are reachable in DOM order; focus rings survive the artwork.
- Ultra-wide (above 1600px): the canvas caps at 1600px and centers so panel
  proportions stay within the reference ratios.

## Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-BC-1 | the 1536px reference viewport | the page renders | the hero panel spans the canvas width (no second column), exactly three equal-height audience cards render below it, and the terminal band follows the row before the footer |
| AC-BC-2 | the rendered page | the page content is inspected | no brand identity or design-standard section is present: no logo variations, palette swatches, or typeface samples |
| AC-BC-3 | the rendered page | the flow artwork is inspected | exactly three stages render in DEVELOP → DEPLOY → INFER order, the stream SVG is aria-hidden, and animation declarations sit behind no-preference motion queries |
| AC-BC-4 | the terminal band | its content is read | the pip and serve prompt lines and the four status rail steps render in the band below the audience row, and a visible illustrative-example label precedes or accompanies them |
| AC-BC-5 | the three audience cards | an action is activated | builders → install docs, AI teams → docs, real-world AI → GitHub; external ones open a new tab with safe rel attributes |
| AC-BC-6 | any width in 320…1536 | the page renders | scrollWidth − clientWidth ≤ 0 and no card content clips |
| AC-BC-7 | the documented engine session truthfulness rule | the page is inspected | the real engine session remains the only transcript presented as verified behavior; the pip/serve example carries the illustrative label |
