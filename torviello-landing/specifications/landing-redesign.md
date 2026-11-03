# Landing redesign — conversion-focused product page

**Unit:** torviello-landing
**Role:** engineer (ticket [0041](../../../torviello-roles/tickets/0041-rebuild-the-landing-page-as-a-conversion-focused-product-pag.md))
**Owner authority:** repository owner, 2026-11-03 — "this template and ux and
structure is so bad"; chose a full redesign toward a conventional
high-conversion developer-tool page with honest pending placeholders for
absent metrics (GOV-07.05 recorded change)
**Supersedes:** the *layout* requirements of
[`landing-board-composition.md`](landing-board-composition.md) (BC-01, BC-02,
BC-05, BC-07) — the board's panel-grid composition is retired as page
structure; the board remains the brand source (colors, type, photography)
**Carried forward unchanged:** BC-04 (no design-standard brand sheet on the
site), BC-06 (the pip/serve example stays visibly ILLUSTRATIVE), AC-BC-7
(the documented engine session is the only transcript presented as verified
behavior), the M4 audience destinations, and the house accessibility rules
(one primary action per view region, 44px targets, focus rings, landmark
structure, `prefers-reduced-motion`)
**Functional design:** [`torviello-design/specifications/landing-functional-design.md`](../../../torviello-design/specifications/landing-functional-design.md)
**Tokens:** [`torviello-design/contracts/design-tokens.json`](../../../torviello-design/contracts/design-tokens.json) — components consume semantic tokens only

## Use cases

- UC-LP-1 — A first-time visitor lands on the page, reads a one-line promise
  as the h1, and sees the documented engine session in a real terminal window
  beside the copy as immediate proof the product runs.
- UC-LP-2 — A evaluating visitor scans a headed "why" section of four value
  cards, then a proof band whose metric slots are explicitly marked pending
  until the first benchmark publishes.
- UC-LP-3 — A visitor comparing audiences scans the three use-case cards and
  reaches the docs, install, and GitHub destinations from their actions.
- UC-LP-4 — A visitor weighing installation reads the illustrative pip/serve
  example beside explanatory copy in a two-column band, with the visible
  illustrative label intact.
- UC-LP-5 — A convinced visitor reaches a dedicated call-to-action band and a
  structured footer with Product and Community link columns.
- UC-LP-6 — A visitor at any viewport from 320px to the 1536px reference gets
  the full page with no horizontal overflow, a sticky nav that collapses to
  the accessible menu below 768px, and no animation under reduced motion.

## Functional requirements

- LP-01 — **Sticky nav.** The navigation renders once at the template level,
  above all sections, and stays pinned (CSS sticky) while the page scrolls.
  Content: brand anchor, four fixed-order links (Product, Use Cases, Docs,
  Community), GitHub ghost action, Get Started primary action. Below 768px
  the links collapse behind the menu button with `aria-expanded`/`aria-controls`
  (unchanged behavior). The hero renders no nested nav.
- LP-02 — **Hero.** An unboxed full-width section on the canvas: eyebrow, a
  single-promise h1 ("Built to **infer.**" — the brand name is not an h1
  line; it lives in the nav), the approved body copy, the primary Get Started
  and ghost View on GitHub actions, a factual trust line under the actions
  (open source, runs on the visitor's machine), and a compact inline
  DEVELOP → DEPLOY → INFER rail between copy and actions (flow-connected,
  in normal flow — no absolutely-positioned chips, nothing clips). The right
  half renders the documented engine session (`torviello-engine --help`,
  `TORCH_PORT=8000 torviello-engine`, the real startup JSON event) in a
  terminal window labeled "Documented engine session" — the only transcript
  presented as verified behavior.
- LP-03 — **Value section (`#product`).** A headed section ("Why Torviello")
  rendering the four approved value props (High Performance, Flexible
  Deployment, Developer & AI Native Friendly, Built for Real Teams) as equal
  glass cards in a four-column desktop grid, two-column below 1024px,
  single-column below 640px.
- LP-04 — **Proof band.** A headed section ("Numbers, not claims.") with
  three metric slots (p99 latency, throughput, cold start). Each slot shows
  an em-dash placeholder value and a visible "first benchmark pending" state;
  a section footnote states no performance number is claimed until the first
  benchmark run publishes. The band MUST NOT render invented figures.
- LP-05 — **Use-cases row (`#use-cases`).** A headed section rendering
  exactly three equal-height audience cards with the approved eyebrows,
  headings, bodies, M4 actions, and torviello-media photography. All three
  cards share one scrim system (left-weighted gradient + bottom fade) so the
  photography is visible behind and beside the copy with consistent contrast,
  and each action aligns to the card bottom.
- LP-06 — **Terminal band.** A two-column band between the use-cases row and
  the CTA: left column carries an h2 ("Up and running in minutes."), body
  copy, and a Read-the-docs link; right column carries the pip/serve example
  terminal with the visible ILLUSTRATIVE label, prompt lines, and four-step
  status rail (unchanged M8 content). One column below 1024px.
- LP-07 — **CTA band.** A full-width closing band with an orange brand
  gradient: h2 ("Start building today."), one line of supporting copy, and
  the Get Started primary plus View on GitHub ghost actions.
- LP-08 — **Footer (`#community`).** A structured footer: brand column
  (wordmark, tagline), a Product column (Install, Docs), a Community column
  (GitHub, Discussions — both resolve to the designated placeholder hosts),
  and a bottom bar with the copyright. All footer links are real anchors with
  safe external attributes; no invented destinations.
- LP-09 — **Invariants.** Exactly one h1 and no h3 on the page; every action
  pairs an icon with its label; section order is nav → hero → values → proof
  → use cases → terminal band → CTA → footer; no breakpoint from 320 to 1536
  produces horizontal overflow; all decorative artwork is `aria-hidden`;
  animation only under `prefers-reduced-motion: no-preference`.

## Edge cases

- Reduced motion: no drift, glow, or rail animations; the page is static and
  complete.
- Missing photos: cards keep the glass surface and scrim so text stays
  readable without imagery.
- Very narrow viewports (320–375px): the hero rail wraps instead of
  overflowing; the terminal transcript scrolls inside its window rather than
  pushing the page wider.
- No benchmark data: the proof band renders pending states indefinitely —
  slots are filled only when real evidence exists (ED rule: no claimed
  numbers).
- Keyboard-only: sticky nav links, both hero actions, the terminal-band docs
  link, card actions, CTA actions, and footer links are reachable in DOM
  order; the skip link still targets `#main`; focus rings survive the
  gradients and photography.
- Ultra-wide (above 1600px): the canvas caps at 1600px and centers.

## Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-LP-1 | the rendered page | the top of the DOM is inspected | the nav renders exactly once at template level inside a sticky wrapper, the hero section contains no nav, and the menu button collapses the links below 768px |
| AC-LP-2 | the hero section | its content is read | one h1 promising "Built to infer." with no brand-name line, the approved body copy, both actions, the trust line, the inline DEVELOP → DEPLOY → INFER rail in normal flow, and the documented engine session terminal with its startup JSON event |
| AC-LP-3 | the value section | its grid is inspected | the heading and all four value cards render; the grid is 4 columns ≥1024px, 2 columns below, 1 column below 640px |
| AC-LP-4 | the proof band | its slots are read | three metric slots each show a pending state and the footnote states no number is claimed before the first benchmark; no digits render as metric values |
| AC-LP-5 | the use-cases row | its cards are inspected | exactly three equal-height cards in one desktop row, one shared scrim system, actions at the card bottoms, destinations unchanged (install docs, docs, GitHub) |
| AC-LP-6 | the terminal band | its content is read | the h2, body, and docs link render left of the pip/serve terminal; the visible illustrative label, both prompt lines, and the four status steps are intact; one column below 1024px |
| AC-LP-7 | the CTA band and footer | their content is read | the CTA h2, supporting line, and both actions render on the brand gradient; the footer renders brand, Product, and Community columns plus the copyright bar |
| AC-LP-8 | the whole page | its landmarks and order are inspected | one h1, no h3, section order nav → hero → values → proof → use cases → terminal → CTA → footer, skip link to `#main` |
| AC-LP-9 | any width in 320…1536 | the page renders | scrollWidth − clientWidth ≤ 0, decorative artwork aria-hidden, animation declarations sit behind no-preference motion queries |

## Verification plan (GOV-07.04)

| Requirement | Check | Mode |
|---|---|---|
| LP-01, LP-09 | `LandingPage.test.ts`, `interaction.test.ts` (sticky wrapper, single nav, menu toggle) | automatic |
| LP-02 | `LandingPage.test.ts`, `HeroPanel.test.ts` (promise h1, trust line, rail order, documented session, no brand-name line, no clipped artwork) | automatic |
| LP-03 | `LandingPage.test.ts`, `FeatureStrip.test.ts` | automatic |
| LP-04 | `ProofBand.test.ts`, `LandingPage.test.ts` (pending states, no metric digits, footnote) | automatic |
| LP-05 | `LandingPage.test.ts`, `AudienceCard.test.ts`, visual QA card heights | automatic |
| LP-06 | `LandingPage.test.ts`, `interaction.test.ts` (illustrative label, prompts, rail) | automatic |
| LP-07 | `CtaBand.test.ts`, `LandingPage.test.ts` | automatic |
| LP-08 | `SiteFooter.test.ts` (columns, anchors, safe rel) | automatic |
| LP-09 | `bun run typecheck`, `bun run build`, visual QA overflow probe at 8 widths with screenshots | automatic + manual review |
| Repo health | `uv run --locked pytest …`, `uv run ruff check .` (5 pre-existing only), `torviello_roles check` | automatic |

Screenshots archive as evaluation evidence under
`torviello-landing/evaluations/reports/` on the ticket's report.
