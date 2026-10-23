+++
id = "0013"
title = "Consolidate remaining legacy root directories into units"
status = "blocked"
priority = "P2"
owner = "engineer"
created = "2026-10-23"
updated = "2026-10-23"
requirements = ["ED-011", "ENG-026"]
controls = ["GOV-12"]
depends_on = []
labels = ["process", "packaging"]
+++
## Outcome

benchmarks web models config and containers move into their owning torviello units with reference updates so the root holds only the fixed file set and named exceptions.

## Acceptance

- [ ] benchmarks moves to torviello-bench with justfile and CI and pyproject reference updates
- [ ] web moves to torviello-landing with package.json CI and generator bundle updates
- [ ] models moves to torviello-engine with model_root configuration update
- [ ] config and containers move to their owning units with deployment reference updates
- [ ] all affected suites pass at the new layout

## Log

- 2026-10-23 — created
- 2026-10-23 — blocked: blocked by uncommitted owner work: justfile ci.yml config/default.toml and services changes reference the current paths; committing the move now would either break HEAD or drag owner WIP into an unrelated commit; consolidate immediately after that work lands
