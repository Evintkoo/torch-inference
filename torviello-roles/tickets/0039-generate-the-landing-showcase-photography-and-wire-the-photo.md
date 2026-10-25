+++
id = "0039"
title = "Generate the landing showcase photography and wire the photo slots"
status = "blocked"
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
