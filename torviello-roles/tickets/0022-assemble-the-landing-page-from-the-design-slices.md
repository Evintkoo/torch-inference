+++
id = "0022"
title = "Assemble the landing page from the design slices"
status = "done"
priority = "P1"
owner = "engineer"
created = "2026-10-24"
updated = "2026-10-24"
requirements = ["PDL-013"]
controls = ["GOV-12", "GOV-09"]
depends_on = ["0021"]
labels = ["design", "frontend"]
+++
## Outcome

the landing page assembles from the design sheets: organisms O1 HeroSection O2 FeatureStrip O3 AudienceRow the terminal demo section the footer the T1 template and the P1 page with board-verbatim copy local fonts and section anchors so the site renders end to end

## Acceptance

- [ ] HeroSection renders the verbatim eyebrow heading with the orange infer emphasis subcopy and the Get Started plus View on GitHub actions with exactly one h1
- [ ] HeroSection composes the three glass cards DEVELOP DEPLOY INFER in DOM order over aria-hidden ribbon artwork
- [ ] FeatureStrip renders the four board value items with icon title subcopy
- [ ] AudienceRow renders the three board audience cards with eyebrow heading body
- [ ] TerminalDemo renders the board transcript as real text nodes with prompt and status markers
- [ ] LandingTemplate provides the nav main and footer slots with the 1200px container rhythm
- [ ] LandingPage composes nav hero strip audience terminal footer with resolvable product use-cases and community anchors
- [ ] Inter and JetBrains Mono load locally through fontsource without touching the token contract
- [ ] bun tests typecheck and build pass and the dev server renders the composed page

## Log

- 2026-10-24 — created
- 2026-10-24 — started
- 2026-10-24 — RED evidence: bun test over organisms sections template and pages — 7 suites fail with module-resolution errors before the components exist; copy is taken verbatim from the approved board image (hero two-line heading Torviello / Built to infer. body subcopy card captions four value items three audience cards terminal transcript Ready emoji)
- 2026-10-24 — GREEN: organisms template and page implemented — HeroSection (verbatim two-line heading with the orange infer emphasis one h1 paired actions three glass cards in DEVELOP DEPLOY INFER order aria-hidden ribbon svg with reduced-motion-safe drift), FeatureStrip (four board items), AudienceRow (three board cards), TerminalDemo (board transcript as real text nodes decorative chrome CSS-only status fade-in static under reduced motion), SiteFooter (minimal: brand line tagline safe GitHub and Docs links copyright — the sheets define the slot but not the copy), LandingTemplate (nav main footer slots), LandingPage (board copy verbatim anchors #product #use-cases #community install href on both primary actions per the board); molecule icon props extended to carry inline svg inside the existing aria-hidden spans; Inter and JetBrains Mono load locally via fontsource without touching the token contract; anchor-focus behavior stays native; audience photos deferred pending media assets; #install resolves when routing lands (F-02)
- 2026-10-24 — evidence: cd torviello-landing/web && bun test — 47 passed 0 failed 153 expect calls across atoms molecules organisms sections template page and the console Button suite; bun run typecheck — tsc 7.0.2 clean; bun run build — vite 8.3.5 green with local woff2 fonts; root npm test — 3 passed 0 failed; root npm run build — tsc clean; uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles — 45 passed; uv run ruff check . — clean; torviello_roles check — ok: 22 tickets; organisms.css and page.css token-only grep — no raw hex or rgb; dev server modules all return 200 (/, main.ts, App.svelte, LandingPage.svelte, HeroSection.svelte)
