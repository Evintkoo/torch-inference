+++
id = "0016"
title = "Verify the migrated layout against CI jobs"
status = "done"
priority = "P1"
owner = "engineer"
created = "2026-10-23"
updated = "2026-10-23"
requirements = ["ED-010", "ENG-026"]
controls = ["GOV-12"]
depends_on = []
labels = ["process", "packaging"]
+++
## Outcome

Every CI job command passes at the migrated layout so the consolidation is proven rather than assumed.

## Acceptance

- [ ] packaging validate passes at the new path
- [ ] web lint and build and test pass from the root package
- [ ] rust fmt clippy and workspace tests pass within repository bounds or failures are pre-existing owner WIP
- [ ] remaining enforcer domains pass except the known CQ-02 oversized owner files
- [ ] mdbook build runs or its absence is recorded

## Log

- 2026-10-23 — created
- 2026-10-23 — started
- 2026-10-23 — evidence: packaging validate — valid torviello-engine 1.0.0 (2 profiles); npm lint fixed via eslint target ignores then clean; npm build (tsc) clean; mdbook build torviello-docs/docs — OK; cargo fmt clean after wrapping migration-lengthened config defaults and aligning model_root default to torviello-engine/models; cargo test --workspace — 142 passed 0 failed after depth-fixing include_str and fs contract paths in the moved crate; clippy -D warnings — clean; enforcer api change-mgmt configuration observability operations 32 passed; performance persistence portability verification 27 passed; ruff clean; check ok 16 tickets
- 2026-10-23 — evidence: cargo test --workspace --locked -j 2 — 142 passed 0 failed; cargo clippy --workspace --all-targets --all-features -D warnings — clean; npm run lint/build — clean; mdbook build — OK; packaging validate — valid; enforcer domain sweep — 59 passed (api change-mgmt configuration observability operations performance persistence portability verification); ruff check . — clean
