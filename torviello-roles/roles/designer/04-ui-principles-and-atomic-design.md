# Designer UI principles and atomic composition

**Role:** designer  
**Document:** 04 of 05

Every layout, component, and screen specification this role produces follows
these principles. They are checkable criteria, not taste: an acceptance check
may cite the principle it enforces. Primary references: Figma, "Seven essential
UI design principles"; Contentsquare, "What makes a good user interface"; Brad
Frost, "Atomic Design"; the W3C Design Tokens Community Group format.

## The seven UI principles, as checkable rules

1. **Hierarchy** — the most important element on a screen is identifiable at a
   glance. Size, weight, contrast, and spacing are chosen deliberately; the
   spec states what users see first and what they must scroll for. If two
   elements have the same visual weight but different importance, the spec is
   wrong.
2. **Progressive disclosure** — multi-step flows show only what the current
   step needs. Every flow longer than three steps shows orientation: where the
   user is and how much remains.
3. **Consistency** — the same action looks and behaves the same everywhere.
   Deviations from an established pattern require a recorded rationale on the
   ticket; "this screen is special" is not a rationale.
4. **Contrast** — visual weight directs attention: one primary action per
   view; destructive actions are visually distinct; secondary actions recede.
5. **Accessibility** — WCAG 2.2 AA holds in every state and every theme
   (document 03 carries the evidence table).
6. **Proximity** — things that belong together sit together (playback
   controls on one row; the destructive escape hatch far away). Grouping
   communicates relationship without a label.
7. **Alignment** — a grid exists and is named in the spec; elements align to
   it. Misalignment is a finding, not a style.

Pro tips that bind here: place elements to follow the user's task sequence;
make common tasks effortless (visible feedback on every interaction); provide
shortcuts for repeated expert actions; and test with users — no screen ships
on the designer's confidence alone.

## House principles (owner direction 2026-10-24, track 0028)

Binding on every spec this role produces, with the same checkable force as
the seven above:

8. **Delight (dopamine hit)** — every element earns its place by giving the
   visitor a small reward. Interactive elements answer activation with
   immediate visible feedback (hover, focus, press, state change, purposeful
   motion); every section carries at least one moment of visual energy (an
   accent, artwork, motion, or a distinctive composition). A page that only
   informs is a finding. Constraint: delight never degrades readability,
   focus visibility, or `prefers-reduced-motion`; document 03 wins conflicts.
9. **Clean templates and positioning** — every template is visually clean:
   one named grid, deliberate whitespace, nothing overlapping, crowding, or
   floating by accident. Every element's position is a decision (aligned,
   grouped, breathing); if the spec cannot say why an element sits where it
   sits, the spec is wrong.
10. **Icon-bearing actions** — every button and action link pairs an icon
    with its label. Icons come from the sliced brand asset set
    (`torviello-design/brand/icons/`), never improvised inline in page code;
    the icon is decorative (`aria-hidden`) and the label carries the name.
11. **Universal accessibility** — every element in a spec ships its
    accessibility criteria: an accessible name and role, or a recorded
    justification for being decorative. "It is just an icon/detail" is not a
    justification; it is the justification text.
12. **Truthful product surface** (owner direction 2026-10-24, track 0031) —
    every demo, transcript, and example on a screen shows only documented,
    runnable product behavior: real binary and command names, real
    configuration, real output format. A transcript that names a packaging
    path, subcommand, or log line the product does not have is a finding,
    even when the reference board shows it.
13. **No slop copy** (owner direction 2026-10-24, track 0031) — copy carries
    no machine-generated filler: no invented status prose, no decorative
    emojis, no generic hype lines that could describe any product. Every
    sentence states something specific about this product or it does not
    ship.

## Component taxonomy

Specify every element as one of the four classes, and name the class in the
spec so the inventory stays comparable across screens:

| Class | Examples | Spec must state |
|---|---|---|
| Input controls | buttons, fields, checkboxes, selects | states, validation, error copy |
| Navigational components | search, menus, icons, pagination | destination, active state |
| Informational components | notifications, tooltips, progress bars | trigger, timing, dismissal |
| Containers | accordions, cards, sidebars | max width, scoping, collapse behavior |

## Atomic composition

Build interfaces bottom-up from reusable parts; compose, do not fork:

- **Atoms** — the smallest styled units (a button, a label, an input). An atom
  consumes tokens only; it never hardcodes a color, size, or spacing value.
- **Molecules** — small compositions with one job (a labeled search field, a
  form row). They arrange atoms and add no new visual language.
- **Organisms** — self-contained sections (a header, a job card list) that
  compose molecules and own layout behavior.
- **Templates** — page skeletons that place organisms on the grid without
  real content.
- **Pages** — templates populated with real content and states.

Rules:

- Before specifying a new component, check the inventory: an existing atom or
  molecule that can be extended wins over a new component. A new component
  requires a one-line justification on the ticket.
- Brand assets are imported, never re-declared (GOV-12.07, owner direction
  2026-10-24, track 0036): a component consumes the owning unit's asset
  through its declared entry point; an embedded copy of a brand vector in a
  consuming unit is a finding unless the owning unit publishes that form with
  a sync test proving it equals the canonical asset.
- Svg asset quality bar (owner direction 2026-10-24, track 0037): brand svgs
  declare a viewBox, embed no rasters, stay within their size budgets, use
  only the measured brand palette, and the mark must pass a render-parity
  gate (shape IoU against the committed board crop, bar 0.80) rasterized by
  a real browser engine; hand-drawn interpretations do not meet the bar.
- A component's spec is a contract: its states, props, and events — the same
  contract-first discipline the engineer role applies to APIs.
- The atomic breakdown appears in the design note so the implementation can be
  verified against the same structure.

## Every level is designed: the design sheet

Designing is a deliverable, not an implication: each atom, molecule, organism,
template, and page that enters a specification has a completed **design
sheet** on the ticket. A component without its sheet does not enter a spec, a
review, or a build.

Every sheet carries: name and level, one-sentence purpose, anatomy (its parts
and the levels they come from), the tokens it consumes (semantic names, never
raw values), every state it can be in, its contract (props in, events out),
its accessibility criteria, and usage guidance with at least one "do" and one
"don't".

Level-specific requirements:

| Level | The sheet must additionally define |
|---|---|
| Atom | the base element; every visual property bound to a semantic token; all interactive states (default, hover, focus, active, disabled, loading) with per-state contrast evidence; accessible name; target size |
| Molecule | the composed atoms (by name and version); arrangement and spacing as tokens; the one job it performs; the events it emits upward |
| Organism | the molecules and atoms it composes; grid placement; responsive behavior per breakpoint; the data it needs and displays; its empty, loading, error, and degraded variants |
| Template | the grid regions; the organism slots; breakpoint behavior; no real content |
| Page | the template used; real content; every state from the states document (loading, empty, partial, error, degraded, unauthorized); entry and exit points of each flow |

Sheet discipline:

- Sheets live on the ticket, next to the acceptance checks they feed.
- Changing a sheet is a logged change: what moved, why, and which acceptance
  checks and downstream compositions it affects.
- A molecule or organism may not consume a raw value where a semantic token
  exists; that is a finding.
- Review verifies the build against the sheet, cell by cell — the sheet is the
  testable form of the design.

## Configurability through tokens

All visual values are design tokens — named decisions, not literals — using
the W3C design-token model:

- **Primitive tokens**: the raw scales (spacing steps, type sizes, color
  ramps). Defined once; referenced everywhere; never used directly in
  components.
- **Semantic aliases**: purpose-named tokens (`color.action.primary`,
  `space.control.gap`) that components consume. Components bind to semantics,
  so a retheme touches tokens only.
- **Themes**: light/dark, density, and platform adaptations (Material 3, Apple
  HIG where applicable) are token sets resolved at the semantic layer.

Configurability rules:

- A theme changes tokens, never behavior or structure; if a theme needs
  different behavior, that is a separate finding, not a token.
- Contrast is verified per theme, because semantic tokens resolve differently.
- A new visual value starts as a token or it does not enter the spec.
- Token changes are recorded on the ticket with the affected components.

## Process: research to verified interface

1. Anchor on the job-to-be-done and who performs it; state both in the ticket
   before any layout work.
2. Specify flows, then wireframe-level structure (the states in document 02).
3. Compose screens from the atomic inventory, applying the seven principles.
4. Prototype the risky paths (error, empty, degraded — not just the happy
   path).
5. Test with users at wireframe and hi-fi stages; a stall is a finding with
   its state and severity.
6. After release, verify with behavioral evidence where the product provides
   it (funnel drop-off, rage signals, session replays) — and log what was
   observed, not what was hoped.
