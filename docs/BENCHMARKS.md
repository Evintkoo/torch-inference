# Benchmark Method

Copyright (c) 2026 Torviello.

## Method

Measure cold start, idle memory, first-token latency, throughput, and p95
latency on the CPU and GPU profiles. Use a fixed seed, warm up for 30 seconds,
and report the median of five runs. Disclose hardware, model revision, batch
size, and concurrency with every claim.

## Reporting

Results are recorded in `benchmarks/results.md` and in the evaluation report.
A performance claim is rejected when the method, hardware, or model revision
is missing. Regression thresholds are defined in
[engine-eval.md](evaluations/engine-eval.md).
