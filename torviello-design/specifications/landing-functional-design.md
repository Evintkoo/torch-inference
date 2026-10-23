# Landing functional design

**Role:** designer  
**Unit:** torviello-design  
**Reference:** the approved brand board (`torviello-design/brand/reference-board.png`)  
**Status:** slice 1 — design prep, ready for implementation in `torviello-landing/web`

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
  motion.") with eyebrow, heading, and body copy
- outcome: each card presents its audience label, promise, and description

### F-07 — Read the terminal demo

- trigger: scroll to the terminal block
- response: the block renders a JetBrains Mono transcript: `$ pip install
  torviello`, `$ torviello serve --model my-model`, then status lines (Loading
  model… / Optimizing graph… / Starting inference server… / Ready 🚀) with teal
  bullet markers
- outcome: the transcript is copyable text (real text nodes, not images)
- invariants: status lines animate only if `prefers-reduced-motion` is not set;
  with reduced motion they render static and complete

### F-08 — Use the page at any size

- trigger: viewport from 320px to desktop
- response: sections stack single-column under 768px; the nav collapses to a
  menu button that opens and closes the link list
- outcome: no horizontal scroll; every function remains reachable

## Data needs

Static content only — no API calls in slice 1. Copy is embedded verbatim from
the board. The terminal transcript is content, not a live backend session.

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
| F-06 | 3 audience cards with eyebrow, heading, body |
| F-07 | terminal lines are text nodes; static rendering under reduced motion |
| F-08 | no horizontal overflow at 320px; menu toggles open/closed |

## Ordering

Functional design (this document) → design sheets (`landing-design-sheets.md`)
→ implementation in `torviello-landing/web` → accessibility and usability
evidence per the designer role.
