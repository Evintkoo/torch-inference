+++
id = "0003"
title = "Add accelerator build caches and GPU benchmark evidence"
status = "ready"
priority = "P1"
owner = "engineer"
created = "2026-10-23"
updated = "2026-10-23"
requirements = ["RP-010", "RP-020"]
controls = ["PERF-02", "PERF-04"]
depends_on = []
labels = ["performance", "gpu"]
+++
## Outcome

The Vulkan and Metal feature flags select a real device, report it, and fall
back only when configuration allows. Build caches keep accelerator builds
affordable, and dated benchmark runs cover the supported accelerator profiles.

## Acceptance

- [ ] Device selection is observable in capability output.
- [ ] An unavailable accelerator falls back explicitly, with a recorded reason.
- [ ] Accelerator builds reuse a cache in CI without hiding a clean-build failure.
- [ ] A dated evaluation report records latency, throughput, idle cost, and peak memory.
- [ ] No public performance claim is made outside the measured envelope.

## Log

- 2026-10-23 — created from the OD-002 remaining work note
