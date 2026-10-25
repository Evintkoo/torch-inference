# Landing functional design

**Role:** designer  
**Unit:** torviello-design  
**Reference:** the approved brand board (`torviello-design/brand/reference-board.png`)  
**Status:** slices 1–2 — design prep, ready for implementation in `torviello-landing/web`
(slice 2 adds the per-card audience actions deferred by sheet O3; designed on
track 0024)

## Capability statement

> "A visitor can understand what Torviello is, what it promises, and how to
> start — and reach the docs, GitHub, and install path — from a single dark
> landing page that matches the approved brand board."

## Functions

### F-01 — Navigate the page

- trigger: visitor activates a nav item (Product, Use Cases, Docs, Community)
- response: the page scrolls to the linked section (or opens the docs site for Docs)
- outcome: the targeted section heading is in view; focus moves with the scroll for
  keyboard users
- invariants: nav order is fixed (Product, Use Cases, Docs, Community); Docs opens
  the documentation site in a new tab

### F-02 — Start using Torviello

- trigger: visitor activates the primary "Get Started" button (nav or hero)
- response: navigation to the install documentation
  (`torviello-docs/docs/INSTALL.md` route)
- outcome: the install page is displayed
- invariants: exactly one primary (orange) action per view

### F-03 — Open the repository

- trigger: visitor activates "GitHub" / "View on GitHub"
- response: the Torviello GitHub repository opens in a new tab
- outcome: no navigation away from the landing page; new tab carries
  `rel="noopener noreferrer"`

### F-04 — Read the hero promise

- trigger: page load
- response: hero renders eyebrow ("AI-NATIVE INFERENCE ENGINE"), heading
  ("Torviello Built to infer." with "infer." in orange), subcopy, and the two
  actions; the DEVELOP → DEPLOY → INFER glass cards render to the right
- outcome: the promise is readable without interaction; nothing blocks the text
- invariants: heading copy is verbatim from the board; glass cards are decorative
  context, not interactive

### F-05 — Scan the value strip

- trigger: scroll to the strip below the hero
- response: four feature items render (High Performance, Flexible Deployment,
  Developer & AI Native Friendly, Built for Real Teams) with icon, title, and
  one-line subcopy
- outcome: each item reads as title + subcopy without truncation at 320px width

### F-06 — Self-identify as an audience

- trigger: scroll to the audience row
- response: three cards render (FOR BUILDERS / "From idea to impact.", FOR AI
  TEAMS / "Build, deploy, scale together.", FOR REAL-WORLD AI / "Models in
  motion.") with eyebrow, heading, body copy, and one ghost action per card
  (slice 2)
- outcome: each card presents its audience label, promise, description, and a
  reachable next step
- action: activating a card action navigates to that audience's destination —
  builders and AI teams to the docs (`docs.torviello.dev/install` and
  `docs.torviello.dev`), real-world AI to the GitHub repository
  (`github.com/torviello`); external destinations open in a new tab with
  `rel="noopener noreferrer"`
- invariants: exactly one action per card; the action is a real link styled as
  A2 (the primary A1 stays unique to the hero); DOM order reads eyebrow →
  heading → body → action

### F-07 — Read the terminal demo

- trigger: scroll to the terminal block
- response: the block renders a JetBrains Mono transcript of the real engine
  session (owner direction 2026-10-24, track 0026, superseding the board's
  fictional pip/serve copy): `$ torviello-engine --help` (the documented
  verify step), then `$ TORCH_PORT=8000 torviello-engine`, then the JSON
  startup event the engine actually emits —
  `{"event":"startup","version":"1.0.0","correlation_id":"…","message":"engine
  started"}` — with teal bullet markers on the output line
- outcome: the transcript is copyable text (real text nodes, not images) and
  every command and log field in it is documented engine behavior
- invariants: status lines animate only if `prefers-reduced-motion` is not
  set; with reduced motion they render static and complete; the transcript
  names no packaging path, CLI subcommand, or log line that does not exist

### F-08 — Use the page at any size

- trigger: viewport from 320px to desktop
- response: sections stack single-column under 768px; the nav collapses to a
  menu button that opens and closes the link list
- outcome: no horizontal scroll; every function remains reachable

## Data needs

Static content only — no API calls in slice 1. Copy is embedded verbatim from
the board except the terminal transcript, which the owner replaced with the
documented engine session (track 0026). The terminal transcript is content,
not a live backend session.

## Exceptions

- Broken anchor target: nav item still focuses page top rather than erroring.
- Reduced motion: animations render static and complete (F-07 invariant).
- Missing Inter/JetBrains Mono webfonts: system fallbacks render; layout holds.

## Acceptance mapping

| Function | Acceptance check |
|---|---|
| F-01 | nav renders 4 links in order; anchors resolve to section ids |
| F-02 | primary button navigates to the install route |
| F-03 | GitHub links carry target=_blank and rel=noopener noreferrer |
| F-04 | heading contains "Torviello" and "Built to infer."; eyebrow verbatim |
| F-05 | 4 feature items with title and subcopy nodes |
| F-06 | 3 audience cards with eyebrow, heading, body; one action per card with the specified href, external attributes, and A2 styling |
| F-07 | transcript lines match the documented engine session; static rendering under reduced motion |
| F-08 | no horizontal overflow at 320px; menu toggles open/closed |

## Ordering

Functional design (this document) → design sheets (`landing-design-sheets.md`)
→ implementation in `torviello-landing/web` → accessibility and usability
evidence per the designer role.

---

## Amendment — board composition (ticket 0038, 2026-10-25)

The board-composition task direction completes the approved board on the
landing page. F-01…F-03 and F-08 remain in force. Amendments, all traceable to
[`torviello-landing/specifications/landing-board-composition.md`](../../../torviello-landing/specifications/landing-board-composition.md):

### F-04 (amended) — Read the hero promise

- the promise renders inside the hero panel (O4) with the navigation above and
  the inference-flow artwork (O5) on the right half; the strip of F-05 moves to
  the hero panel's bottom edge
- invariants unchanged: verbatim copy, one h1, decorative flow

### F-05 (amended) — Scan the value strip

- trigger: page load (the strip lives on the hero panel's bottom edge)
- invariants unchanged: four items, title + subcopy, no truncation at 320px

### F-06 (amended) — Self-identify as an audience

- the three audience cards render as showcase cards 1–3 (O7) in the four-card
  row, with the same eyebrows, headings, bodies, and M4 actions and
  destinations as slice 2
- invariant: exactly one action per audience card; DOM order eyebrow → heading
  → body → action

### F-07 (superseded on this card) — Terminal execution showcase

- trigger: the visitor reads showcase card 4 (M8)
- response: the card renders the window chrome, the pip/serve prompt lines, and
  the four-step status rail from the board
- outcome: the example reads as a design showcase, explicitly labeled
  `ILLUSTRATIVE EXAMPLE` in mono in the window header, so no command or status
  line is presented as verified engine behavior
- invariants: the label renders before any visitor relies on the commands;
  static and complete under reduced motion; the A6 truthfulness rule continues
  to govern any transcript presented as real behavior
- provenance: the board's terminal copy returns as an illustrative example per
  the task direction (2026-10-25) recorded on ticket 0038, refining the 0026
  owner direction, which remains binding for any non-labeled transcript

### F-09 — Read the brand identity panel

- trigger: the visitor views the upper-right panel (O6)
- response: the primary lockup, three logo-variation previews with captions,
  the four hex-labeled palette swatches, and the two typography samples render
- outcome: the brand panel matches the board; swatch hex values are exact text
- invariants: the mark is the canonical imported asset; no palette entry
  outside the token contract; the panel is non-interactive

### F-10 — Use the board at the reference size

- trigger: viewport 1536×1012 (the board reference)
- response: the upper grid splits ≈2.26 : 1 (hero ≈69% / brand ≈31%) and the
  showcase renders four equal-height cards in the board's 1.26 / 1.45 / 1.06 /
  1 ratio
- outcome: the composition mirrors the board geometry at the reference
  viewport and scales proportionally at other desktop widths
