# Engine Evaluation Plan and Report

Copyright (c) 2026 Torviello.

## Metrics and thresholds

| Metric | Threshold | Result |
|---|---|---|
| p95 inference latency | under 250 ms | 0.653 ms median (0.191–1.016 ms), local CPU, pass |
| peak resident memory | under 512 MiB | 102.61 MiB median, local CPU, pass |
| model checksum mismatch | 0 accepted | 0 in the contract suite, pass |
| auth bypass | 0 | 0 in the security suite, pass |
| unhandled input | 0 | 0 in the contract suite, pass |
| readiness success under load | at least 99.5% | not measured |
| GPU profile | separate environment manifest | not measured |

## Method

The performance measurement uses `benchmarks/classify_bench.py` against the
digest-verified `engine-demo-torchscript` fixture. Run the contract, integration,
and robustness suites against the release candidate, then run the benchmark with
the versioned budgets. Record the commit, model revision, backend, hardware,
command, and warmup. A budget failure blocks the release gate and requires a
recorded disposition.

## Report

The 2026-10-22 CPU evaluation at revision `5e58f0d` recorded three runs with
median p95 `0.653 ms` (range `0.191–1.016 ms`), median p99 `1.195 ms`, median
throughput `3,951.8 req/s` at concurrency 8, median peak RSS `102.61 MiB`, and
a `1.0` quality score. Run-to-run spread was wide on the shared host. Version `1.0.1` of the fixture makes the `bright` label reachable;
the earlier `1.0.0` report is superseded.

Raw evidence is in
`torviello-bench/evaluations/reports/2026-10-22-classify-cpu/`. Process start was
measured with a warm OS file cache, so this does not establish a true cold start.
The CI `performance-cpu` job has not yet run on the GitHub runner, and no GPU,
competitor, or same-hardware regression baseline is recorded. These gaps mean
this report is local CPU evidence, not a release decision.
