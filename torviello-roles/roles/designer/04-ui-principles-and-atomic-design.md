# Designer UI principles and atomic composition

**Role:** designer  
**Document:** 04 of 04

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
- A component's spec is a contract: its states, props, and events — the same
  contract-first discipline the engineer role applies to APIs.
- The atomic breakdown appears in the design note so the implementation can be
  verified against the same structure.

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
