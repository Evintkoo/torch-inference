+++
id = "0013"
title = "Consolidate remaining legacy root directories into units"
status = "done"
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
- 2026-10-23 — unblocked by explicit owner instruction to migrate everything into torviello units immediately, accepting that path-adjacent uncommitted owner edits in justfile ci.yml config containers ride along in the migration commit
- 2026-10-23 — evidence: owner instructed full migration; moved benchmarks->torviello-bench web->torviello-landing models->torviello-engine config->torviello-engine containers->torviello-engine packaging->torviello-engine services->torviello-engine with history preserved; updated all references in justfile ci.yml release.yml Cargo.toml pyproject.toml package.json eslint tsconfig gitignore Dockerfile compose canvas packaging.toml engine config defaults and role docs; generator bundles boundaries monorepo atomic_components component_states media_assets updated and regenerated; packaging driver ROOT and MANIFEST_PATH fixed for the new depth; cargo metadata OK; npm test 2 passed; packaging+bench+roles suites 33 passed; architecture+monorepo+media+models+directory 30 passed; releases+portability+configuration 19 passed; docs domain fixed via media_assets bundle; ruff clean across the tree
- 2026-10-23 — status -> ready: owner instructed immediate migration; blocker resolved by explicit authorization
- 2026-10-23 — started
- 2026-10-23 — evidence: uv run ruff check . — clean; cargo metadata --offline — OK; npm test — 2 passed; pytest packaging/bench/roles — 33 passed; enforcer domain batches — 62 passed (architecture monorepo media-production models directory documentation-and-design releases portability configuration operations); governance+observability+rules-format+ticket-store+roles — 52 passed earlier this session; known remaining: CQ-02 oversized owner engine files, pre-existing
