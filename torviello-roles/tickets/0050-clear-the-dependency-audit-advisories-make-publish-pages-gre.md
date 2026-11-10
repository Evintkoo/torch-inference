+++
id = "0050"
title = "Clear the dependency-audit advisories, make publish-pages green, and add production coverage headroom"
status = "in_progress"
priority = "P1"
owner = "engineer"
created = "2026-11-11"
updated = "2026-11-11"
requirements = ["ED-014", "SO-012"]
controls = ["GOV-02", "GOV-03", "GOV-05"]
depends_on = ["0048"]
labels = ["ci", "security"]
+++
## Outcome

cargo audit reports zero un-dispositioned advisories, the publish-pages job passes on a main push, and production-line coverage has real margin above the 95 percent threshold

## Acceptance

- [ ] every cargo-audit advisory is fixed by a version bump or explicitly dispositioned with owner authority and a review date
- [ ] publish-pages passes on a push to main touching torviello-landing and the live site serves the new build
- [ ] production-only coverage measured with cargo llvm-cov clears 95 percent by real tests
- [ ] no test weakened
- [ ] engine cargo test
- [ ] fmt
- [ ] clippy all-features
- [ ] and the performance job stay green after the upgrades

## Log

- 2026-11-11 — created
- 2026-11-11 — started
- 2026-11-11 — owner approval 2026-11-11 ('approved', responding to the three decisions surfaced with ticket 0048's review): D1 dependency-audit takes the upgrade path (tch 0.22->0.27, sqlx 0.8->0.9, tokio/rustls-webpki lockfile bumps); anything genuinely unfixable gets an explicit audit disposition with advisory ids, rationale, and review date recorded here, never a silent ignore; D2 publish-pages repo settings change authorized - Pages moves from legacy branch source to GitHub Actions source (matches the workflow as authored with deploy-pages; NOTE the GitHub-documented consequence: switching branch->actions source is one-way; the gh-pages branch stops being the serving source, site URL unchanged); D3 real production coverage work in the engine (acquisition.rs ~30, main.rs ~27, config.rs ~21 missed lines)
- 2026-11-11 — dependency-audit progress: baseline cargo audit (cargo-audit 0.23.0, advisory db 1446) = 9 vulnerabilities - RUSTSEC-2026-0384 tokio 1.54.0 (interval race, fix 1.54.1), RUSTSEC-2026-0382 rustls-webpki 0.103.15 (fix 0.103.16), RUSTSEC-2023-0071 rsa 0.9.10 Marvin (fix >=0.10), RUSTSEC-2026-0459 libsqlite3-sys 0.30.1 bundled SQLite CVE-2026-119375 (fix >=0.39), 5x zip 0.6.6 (fixes >=9.0.0). Applied: tokio 1.54.1 + rustls-webpki 0.103.16 lockfile-precise; tch 0.22->0.27 + sqlx 0.8->0.9 manifest bumps re-resolved the lock (zip 9.5.0, zstd 0.14.3; sqlx-mysql 0.9 DROPPED its rsa dependency so Marvin is gone entirely, no ignore needed); libsqlite3-sys semver ceiling is 0.37.0 (sqlx-sqlite 0.9.0 requirement rejects --precise 0.39.0) so RUSTSEC-2026-0459 is dispositioned in the new .cargo/audit.toml with the advisory's own exposure analysis (local crafted db+wal preconditions; engine sqlite is an engine-owned local audit log, parameterized queries, persistence not in the default build) + review trigger next sqlx 0.9.x or 2027-02-11. Post-fix audit: 0 vulnerabilities, 1 unmaintained warning (RUSTSEC-2024-0449 unsafe-libyaml, does not fail the job, left visible). publish-pages: repo Pages build_type flipped legacy->workflow via API (gh api .../pages PUT, verified readback) and deploy-landing.yml gained a publish_pages dispatch input (landing-deploy now requires publish_pages != true); NOTE branch->actions source switch is one-way (GitHub-documented). Pending: fmt/clippy/tests with the new tree (clippy --all-features downloads libtorch 2.15 for tch 0.27), CI performance job validates the 2.9-traced fixture on libtorch 2.15 (quality gate 1.0), dispatch verification of publish-pages after merge
- 2026-11-11 — compile+test verification of the new tree: cargo fmt --all --check ok; default-features clippy shows only the known default-feature-only unused_async trio (readiness_state/begin_audit/finish_audit - vanish under CI's --all-features, same finding as ticket 0048 task 2); all-features clippy re-verification deferred to CI (disk 674MB free - host limit reported, no more local builds this session). cargo test --workspace --locked: 16 suites ok, lib unittests 93 passed / 0 failed (87 prior + 5 new acquisition + 1 new config). NEW COVERAGE TESTS (behavioral, not line-chasing): start() DownloadInProgress guard via a concurrency-0 fixture (new Fixture::new_with), start() installed-asset idempotency, chunked no-content-length oversize rejection incl. staging-file removal (accumulated-bytes defense - the content-length precheck was already covered), commit-time tamper detection (model.digest_mismatch) + capacity-prune integration on retry, prune_terminal live-job retention; config env helpers split into pure parsers parse_bool/parse_allowlist/parse_value (edition-2024 set_var is unsafe and the workspace forbids unsafe, so present-value branches were untestable) with a new parser test. macOS link fix: zip 9.5 -> zstd-sys C objects built for macOS 26.5 vs rustc's 11.0 link target - pinned MACOSX_DEPLOYMENT_TARGET=11.0 in the new .cargo/config.toml (applies to CI macOS too); torch-sys 0.27's macOS arm64 PyPI lookup is broken upstream (PyPI renamed the wheel tags cp311-none-macosx_11_0_arm64 -> cp311-cp311-macosx_14_0_arm64) - ci.yml rust-macos now provisions the real wheel and points LIBTORCH at it (version-coupled to tch 0.27 = libtorch 2.15.0, documented in the step); linux download URL verified 200 so ubuntu paths need no change
