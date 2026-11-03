# Landing redesign evaluation — 2026-11-03

**Owner:** engineer (ticket [0041](../../../../torviello-roles/tickets/0041-rebuild-the-landing-page-as-a-conversion-focused-product-pag.md))
**Scope:** torviello-landing page structure and UX (LP-01…LP-09,
AC-LP-1…9 of
[`specifications/landing-redesign.md`](../../specifications/landing-redesign.md))
— the board's panel-grid composition is replaced by a conversion-focused
product page: sticky template-level nav, unboxed hero anchored by the
documented engine session, a headed value section, an honest pending-benchmark
proof band, three unified audience cards, a two-column illustrative terminal
band, a closing CTA band, and a structured footer.
**Outcome:** pass — implemented and verified against the redesign
specification; this is not a release approval.

## Environment

- macOS (darwin), Bun 1.3.14, Svelte 5.57, Vite 8, TypeScript 7
- Google Chrome (locally installed) driven via playwright-core (CDP)
- Target: Vite dev server, http://localhost:5173/
- Tooling: none new; existing `web/scripts/visual-qa.ts` probes extended

## Owner direction implemented

| Direction (2026-11-03) | Change |
|---|---|
| "this template and ux and structure is so bad" (diagnosed with the owner: box-in-box monotony, brand-name h1, clipped flow chips, buried value props, inconsistent card scrims, ~60% empty terminal band, no proof content, stub footer) | full redesign per the owner's choice of direction; board composition layout requirements superseded under GOV-07.05 with the decision recorded on the ticket |
| proof content with placeholders | the proof band renders three metric slots as pending states with an explicit footnote; no digits ship |

## Structure delivered

1. **Sticky nav (LP-01)** — once, at the template level (`.tv-topnav`, glass
   blur); the hero renders no nested nav; mobile menu behavior unchanged.
2. **Hero (LP-02)** — unboxed; promise h1 "Built to **infer.**" (no
   brand-name line); approved body copy; inline DEVELOP → DEPLOY → INFER rail
   in normal flow (the absolutely-positioned `InferenceFlow` artwork is
   deleted with its test — nothing can clip); factual trust line "MIT
   licensed · Runs on your machine"; right column shows the documented engine
   session (`torviello-engine --help`, `TORCH_PORT=8000 torviello-engine`,
   the real startup JSON event) labeled "Documented engine session".
3. **Values (LP-03)** — "Why Torviello" heading over the four approved value
   props as glass cards (4 / 2 / 1 columns).
4. **Proof band (LP-04)** — "Numbers, not claims." with p99 latency /
   throughput / cold start slots, each `data-pending` with an em-dash value
   and "First benchmark pending"; footnote states no number is claimed before
   the first benchmark run publishes.
5. **Use cases (LP-05)** — "Torviello for every stage." over exactly three
   equal-height cards; one shared scrim system; actions pinned to card
   bottoms; M4 destinations unchanged.
6. **Terminal band (LP-06)** — two columns: "Up and running in minutes." copy
   with a Read-the-docs action beside the pip/serve terminal, which keeps its
   visible ILLUSTRATIVE label, prompts, and four-step rail; one column below
   1024px.
7. **CTA band (LP-07)** — brand-orange gradient band with the inverse primary
   Get Started (new `.tv-button--inverse` atom, midnight fill for contrast)
   and a safe ghost GitHub action.
8. **Footer (LP-08)** — brand column, Product (Install, Docs) and Community
   (GitHub, Discussions) columns resolving only to the designated placeholder
   hosts, copyright bar.

## Commands and results

| Command | Result |
|---|---|
| `cd torviello-landing/web && bun test src` | 86 passed, 0 failed (contract rewritten RED-first: 25 failures + 2 missing-module errors confirmed against the old page before implementation) |
| `bun run test:interaction` | 6 passed, 0 failed |
| `bun run typecheck` | tsc clean |
| `bun run build` | green (148ms) |
| `bun run scripts/visual-qa.ts ../evaluations/reports/2026-11-03-landing-redesign` | VISUAL QA PASS — nav sticky, hero full-width 1496/1520, 3 cards at 386/386/386, proof band with 3 pending slots, terminal band, CTA band; 0px overflow at 1536/1440/1280/1024/768/390/375/320 |
| `uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles` | 51 passed |
| `uv run ruff check .` | the same 5 pre-existing findings in `torviello-design/tests/test_brand_assets.py` (B905 ×2, S603 ×2, S607) recorded as the ticket-0038 baseline — not introduced here |
| `uv run --directory torviello-roles python -m torviello_roles check` | ok: 41 tickets |

## Per-threshold outcomes

| Threshold | Target | Measured | Outcome |
|---|---|---|---|
| Sticky nav (AC-LP-1) | one nav, template level, sticky ≥ desktop; hero nests none | page suite asserts one `aria-label="Main"` inside `.tv-topnav` and none in the hero; QA reports `nav:sticky(ok)` at 1536; menu flex at 390/375/320, none above | pass |
| Hero (AC-LP-2) | promise h1 without brand-name line, trust line, flow rail order, documented session | h1 contains "Built to infer." only; rail orders DEVELOP → DEPLOY → INFER between copy and actions; session commands + startup JSON render; hero contains no "Illustrative example" | pass |
| Values (AC-LP-3) | headed section, four cards | "Why Torviello" + 4 `tv-feature-item` in the section | pass |
| Proof band (AC-LP-4) | three pending slots, no digits, footnote | 3 × `tv-proof__value[data-pending]` with "—"; interaction DOM check asserts no digits in slot text; footnote present | pass |
| Use cases (AC-LP-5) | three equal-height cards, unified scrim, bottom actions | 3 cards at 386/386/386 (1536); shared scrim mix; actions `margin-top: auto` | pass |
| Terminal band (AC-LP-6) | copy beside illustrative terminal | h2 + body + docs link precede the labeled example; prompts and rail intact; single column ≤1023px | pass |
| CTA + footer (AC-LP-7) | gradient CTA band; structured footer | inverse primary to /install, ghost GitHub safe; Product/Community columns, © bar | pass |
| Order and landmarks (AC-LP-8) | nav → hero → values → proof → use cases → terminal → CTA → footer; one h1, no h3 | order test asserts ascending positions; h1:1 at all 8 widths; no `</h3>` in the page | pass |
| Overflow/motion (AC-LP-9) | scrollWidth − clientWidth ≤ 0 at 8 widths; animation only under no-preference | 0px everywhere; drift/connector animations sit behind `prefers-reduced-motion: no-preference` | pass |
| Brand sheet absence (BC-04, carried) | no design-standard content on the page | page suite asserts no brand-identity landmarks | pass |

Screenshots: [1536](2026-11-03-landing-redesign/1536.png) ·
[1440](2026-11-03-landing-redesign/1440.png) ·
[1280](2026-11-03-landing-redesign/1280.png) ·
[1024](2026-11-03-landing-redesign/1024.png) ·
[768](2026-11-03-landing-redesign/768.png) ·
[390](2026-11-03-landing-redesign/390.png) ·
[375](2026-11-03-landing-redesign/375.png) ·
[320](2026-11-03-landing-redesign/320.png)

## TDD record

1. RED: `LandingPage.test.ts`, `HeroPanel.test.ts`, `SiteFooter.test.ts` and
   the interaction composition tests rewritten to the LP contract; new
   `ProofBand.test.ts`, `CtaBand.test.ts`; template test updated to the nav
   snippet. First run: 58 pass / 25 fail / 2 errors (missing components) —
   failures confirmed before implementation.
2. GREEN: template gained the sticky `.tv-topnav` nav slot; `HeroPanel`
   rewritten (nav removed, flow artwork and hero strip dropped, rail +
   documented-session terminal added); `ProofBand` and `CtaBand` created;
   `SiteFooter` restructured; `LandingPage` recomposed; `InferenceFlow`
   deleted with its test; `.tv-button--inverse` added; scrim and grids
   reworked in CSS. 86/86 unit, 6/6 interaction, typecheck, build green.
3. QA probe fix: the visual-qa hero selector moved from the retired
   `.tv-hero-panel` to `.tv-hero` and gained sticky-nav, proof, and CTA
   probes; thresholds (0px overflow, equal card heights, one h1) unchanged.

## Assumptions and limitations

- **Proof band is intentionally empty**: slots fill only when a real
  benchmark run publishes; the band must not gain invented figures (ED rule).
- The trust line states only verifiable facts (MIT `LICENSE` at the repo
  root; the engine runs locally per the documented session).
- `docs.torviello.dev` and `github.com/torviello` remain designated
  placeholder hosts; footer Discussions points at the GitHub host until a
  real destination exists.
- The screen-reader pass (designer role evidence) is still outstanding.
- `torviello-design/specifications/` sheets still describe the retired hero
  artwork and strip; the redesign spec and this report record the
  supersession — updating the design sheets needs a designer-role/owner
  decision (cross-unit).
- An unrelated unstaged change in `torviello-enforcer/test_status_tester.py`
  (status-contract operation counts) is preserved but excluded from this
  ticket's commit.
