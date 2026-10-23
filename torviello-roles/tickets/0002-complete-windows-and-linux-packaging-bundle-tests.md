+++
id = "0002"
title = "Complete Windows and Linux packaging bundle tests"
status = "ready"
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
