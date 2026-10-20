# Benchmark acceptance criteria

Scope: competitive performance and footprint claims. No benchmark result is included.

| Check ID | Requirement | Observable check | Type |
|---|---|---|---|
| [AC-BENCH-01](checks/AC-BENCH-01.md) | RP-016 | The evidence record names the competitor set, pinned versions, hardware, OS, runtime/driver, model digests, workload, precision, concurrency, and metric definitions. | Review |
| [AC-BENCH-02](checks/AC-BENCH-02.md) | RP-016 | Every contender is measured through the same versioned harness with identical warmup, repetitions, telemetry, and isolation. | Automated |
| [AC-BENCH-03](checks/AC-BENCH-03.md) | RP-016 | Published results report latency percentiles, throughput, peak RSS/VRAM, cold start, idle cost, and artifact size with reproduction commands. | Automated |
| [AC-BENCH-04](checks/AC-BENCH-04.md) | RP-017 | CI fails when the minimal-profile artifact size, cold start, idle RSS/CPU, or peak memory exceeds its versioned budget or regression tolerance. | Automated |
| [AC-BENCH-05](checks/AC-BENCH-05.md) | RP-017 | The minimal CPU profile excludes optional backends, models, datasets, telemetry, and hosted dependencies. | Automated |
| [AC-BENCH-06](checks/AC-BENCH-06.md) | RP-016 | A speedup that fails the output-quality check is rejected and not published. | Automated |
| [AC-BENCH-07](checks/AC-BENCH-07.md) | RP-016 | Stale or non-reproducible claims are retracted or requalified at release review. | Review |

## Failure criteria

- A "fastest" or "lightest" claim appears without a dated, reproducible evidence record.
- Results from different hardware, precision, batch, or concurrency are compared as equivalent.
- A budget breach or material regression does not fail the release gate.
- A benchmark omits the shipping defaults or bypasses the minimal-profile constraints.
- Output quality is weakened to produce a faster measurement.
