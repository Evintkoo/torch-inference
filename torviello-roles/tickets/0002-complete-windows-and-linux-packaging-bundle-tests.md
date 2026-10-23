+++
id = "0002"
title = "Complete Windows and Linux packaging bundle tests"
status = "review"
priority = "P1"
owner = "engineer"
created = "2026-10-23"
updated = "2026-10-23"
requirements = ["ED-020", "ED-021", "ED-022", "ED-023", "ED-024"]
controls = ["REL-01"]
depends_on = []
labels = ["packaging", "release"]
+++
## Outcome

The declarative packaging driver produces, verifies, and starts the engine-only
bundle on Windows and Linux as it already does on macOS. The full profile names
its prepared libtorch cache contract so the build is reproducible offline.

## Acceptance

- [ ] Engine bundle builds on a clean Windows host without a shell script.
- [ ] Engine bundle builds on a clean Linux host without a shell script.
- [ ] Manifest verification rejects a tampered artifact.
- [ ] The installed engine starts, answers health, and stops cleanly.
- [ ] The full profile documents the required libtorch cache layout.

## Log

- 2026-10-23 — created from OD-007 remaining work; macOS path already verified
- 2026-10-23 — progress: packaging driver hardened for the Windows and Linux acceptance — cache contract (validate rejects a full profile without a documented libtorch cache layout; plan publishes it), zip determinism and tamper rejection tests (write_zip had a latent datetime-slicing crash), and the macOS smoke re-run at the migrated layout: release build 56s, /health/live 200 {status alive}, /health/ready 503 (no models loaded, correct), SIGTERM exit 0; fixed two stale paths in config/default.toml (schema, model_registry) that broke startup with opaque InvalidInput; packaging tests 11 passed; validate ok
- 2026-10-23 — started
- 2026-10-23 — status -> review: driver, cache contract, tamper rejection, and macOS smoke are done with evidence; clean-host Windows and Linux builds remain — they need the CI matrix or a Windows/Linux host, which this macOS session cannot execute
