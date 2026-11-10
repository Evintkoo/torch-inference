# Landing link and rail fix evaluation — 2026-11-10

**Owner:** engineer (ticket [0049](../../../torviello-roles/tickets/0049-fix-broken-landing-links-and-tighten-the-landing-layout-rhyt.md))
**Scope:** third amendment of
[`specifications/landing-redesign.md`](../../specifications/landing-redesign.md)
— LP-11 (link reachability), LP-12 (content rail), LP-02 (distinct rail
glyphs), and the phone card-scrim defect.
**Outcome:** pass. Implemented and verified against the amendment. This is
not a release approval, and nothing has been published.

## Environment

- macOS (darwin), Bun 1.3.14, Svelte 5.57, Vite 8, TypeScript 7
- Google Chrome (locally installed) driven through playwright-core (CDP)
- Target: Vite dev server, http://localhost:5173/

## Defects found (link audit with curl and the GitHub API, 2026-11-10)

| Link | Observation | Fix |
|---|---|---|
| `https://github.com/torviello` (nav GitHub, hero, card 3, CTA) | HTTP 404: the organization does not exist | the public repository `Evintkoo/torch-inference` |
| footer Discussions | `has_discussions=false` on the repository | footer **Issues** (`/issues`, HTTP 200) |
| footer API Reference | pointed at the generic docs tree | `torviello-engine/contracts/openapi.yaml` |
| docs and install links (`torviello-docs/...` on `main`) | HTTP 404 *today*: `origin/main` lags the local monorepo main by 50 commits | no change. They resolve once the owner pushes main (a push needs owner approval) |

## Layout defects (1440/390 screenshots)

| Defect | Fix |
|---|---|
| sections ran edge to edge (1496px at 1536) while the nav pill sat on a 1242px rail | the canvas sections and the nav pill share one 1200px rail (border-box); the footer content sits on the same rail |
| "Torviello for every stage." touched its cards (0px gap) | a title followed directly by content keeps `--tv-space-8` |
| DEVELOP/DEPLOY chips looked identical (`box` and `package` share 3 of their 4 paths) | DEVELOP uses `sliders` |
| extra 32px dead gap between the hero art and "Why Torviello" | dropped the redundant `.tv-values` top padding |
| at ≤767px the card copy sat over the photos' bright centers | a top-weighted phone scrim, placed after the 1279 step so it wins the cascade |

## Results

| Check | Result |
|---|---|
| `bun test src` | 93 pass / 0 fail (RED first: 4 failing before the fix) |
| `bun run test:interaction` | 7 pass / 0 fail |
| `bun run typecheck` | clean |
| `bun run build` | green; built `index.html` links no `github.com/torviello` |
| `bun run scripts/visual-qa.ts` | VISUAL QA PASS at 1536/1440/1280/1024/768/390/375/320: 0px overflow, rail offset ≤2px at ≥1280, title gaps 32/32. RED first: 8 widths failing on the new LP-12 probes before the fix |
| `uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles` | 50 passed, 1 failed. The failure was already there: `test_favicon_lives_in_the_design_unit` trips on the gitignored `web/public/favicon.svg` that `prebuild` generates (ticket 0045). It passes on a tree that has not been built |

Screenshots: `2026-11-10-landing-link-and-rail-fix/<width>.png`.

## Limitations

- The docs links return 404 on GitHub until the local main is pushed.
- The live GitHub Pages site still serves the previous build. Republishing
  `gh-pages` is an outward-facing step that needs owner approval.
