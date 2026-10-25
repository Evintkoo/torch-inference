+++
id = "0039"
title = "Generate the landing showcase photography and wire the photo slots"
status = "review"
priority = "P1"
owner = "engineer"
created = "2026-10-25"
updated = "2026-10-25"
requirements = ["PDL-013"]
controls = ["GOV-07", "GOV-09", "GOV-10", "GOV-12"]
depends_on = ["0038"]
labels = ["frontend", "design", "media"]
+++
## Outcome

the three landing showcase cards render the torviello-media generated photography (builders, teams, city) behind their text scrims: the jpg assets exist in torviello-media/assets/landing with recorded provenance, the landing page sets the three image props on the showcase cards importing them through the @torviello/media alias, and the documented desktop-tablet-mobile responsive behavior and accessibility rules still hold with photos in place

## Acceptance

- [ ] torviello-media/assets/landing contains builders.jpg
- [ ] teams.jpg
- [ ] and city.jpg matching the specs in assets/landing/README.md (night coding scene
- [ ] team collaboration
- [ ] dusk cityscape) with the provenance record updated to delivered status
- [ ] the showcase cards on the landing page receive their image props via imports resolved through the @torviello/media alias with no copied asset bytes inside torviello-landing
- [ ] cd torviello-landing/web: bun test src
- [ ] bun run test:interaction
- [ ] bun run typecheck
- [ ] and bun run build all pass
- [ ] visual qa passes with zero horizontal overflow at 1536 1440 1280 1024 768 390 375 320 and screenshots are archived as evaluation evidence
- [ ] uv run --locked pytest torviello-design/tests torviello-roles
- [ ] uv run ruff check torviello-media torviello-landing
- [ ] and uv run python -m torviello_roles check pass

## Log

- 2026-10-25 — created
- 2026-10-25 — started
- 2026-10-25 — started — continuing the recorded pending slot from 0038: generate builders/teams/city photography in torviello-media/assets/landing and set the three image props on the showcase cards
- 2026-10-25 — blocked: the gemini free-tier image quota is exhausted (429 RESOURCE_EXHAUSTED on gemini-3.1-flash-image) — two generation attempts at 2026-10-25 18:05-18:11 WIB failed, including a NANOBANANA_MODEL=gemini-2.5-flash-image override that the extension still routed to the exhausted model; unblock condition: quota reset or a paid API key; missing input owner: repository owner (API key) — RED state prepared: three page-level photo tests written and confirmed failing in LandingPage.test.ts, page wiring and asset generation pending
- 2026-10-25 — retry at 2026-10-25 18:45-18:46 WIB (user-directed): still 429 RESOURCE_EXHAUSTED on gemini-3.1-flash-image; the free-tier quota has not reset since the midday exhaustion; blocked state stands — next step on unblock: generate the three photos, wire the image imports, run the recorded checks and visual qa, then move the ticket to review
- 2026-10-25 — RED: three page-level photo tests added to LandingPage.test.ts before wiring — initial run 14 pass / 2 fail (the decorative-attribute test passed vacuously on an empty match and was tightened with a length assertion), failures were the missing img.tv-audience-card__photo renders and the still-present built-in city SVG
- 2026-10-25 — unblocked by owner direction (2026-10-25, 'use whatever existing'): the showcase photography is sliced from the project's approved brand board (torviello-design/brand/reference-board.png, showcase row) with ImageMagick — text-free crops, Lanczos 2x upscale, progressive JPEG q88 — delivered as builders.jpg 338x746, teams.jpg 412x746, city.jpg 676x356 in torviello-media/assets/landing; provenance and reproduction commands recorded in assets/landing/README.md; no generation quota needed
- 2026-10-25 — GREEN: LandingPage imports the three photos through the @torviello/media alias and sets the image props on the showcase cards (the art='city' prop is dropped from the page; AudienceCard keeps the SVG capability for the missing-photo edge case); cd torviello-landing/web — bun test src 81 passed 0 failed, test:interaction 5 passed, typecheck clean, build green (208ms, photos hashed into dist/assets as builders/city/teams); visual qa at 1536/1440/1280/1024/768/390/375/320 = VISUAL QA PASS, 0px overflow, hero:brand 2.26:1, card heights 386/386/386/386, screenshots archived at evaluations/reports/2026-10-25-landing-showcase-photos
- 2026-10-25 — repo-wide checks: uv run --locked pytest torviello-design/tests torviello-engine/packaging/tests torviello-roles = 51 passed; uv run ruff check . = the same 5 pre-existing failures in torviello-design/tests/test_brand_assets.py recorded on 0038 (B905 x2, S603 x2, S607), none introduced by this ticket; torviello_roles check = clean; limitations: photos are board-derived crops (decorative, aria-hidden, behind the scrim), screen-reader pass still outstanding, placeholder domains unchanged
- 2026-10-25 — started
- 2026-10-25 — status -> review
