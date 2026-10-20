# Engine Evaluation Plan and Report

Copyright (c) 2026 Torviello.

## Metrics and thresholds

| Metric | Threshold | Result |
|---|---|---|
| readiness success | at least 99.5% | 99.8% pass |
| p95 latency | under 250 ms | 188 ms pass |
| model checksum mismatch | 0 accepted | 0 pass |
| auth bypass | 0 | 0 pass |
| unhandled input | 0 | 0 pass |

## Method

Run the contract, integration, and robustness suites against the release
candidate. Record the commit, model revision, backend, and hardware. A metric
below threshold fails the release gate and requires a recorded disposition.

## Report

The latest run passed all thresholds on the CPU profile. GPU results are
recorded separately with the accelerator and driver version.
