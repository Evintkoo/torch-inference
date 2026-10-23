# Benchmark Method

Copyright (c) 2026 Torviello.

## Method

`benchmarks/classify_bench.py` runs the shipping `POST /classify` path against
the `engine-demo-torchscript` fixture. It starts the release binary with the
checked-in configuration, applies 30 warmup requests, and measures 1,000
requests at concurrency 1 and 1,000 at concurrency 8. Each run records p50,
p95, p99, maximum latency, throughput, process start and model load time, idle
and peak RSS, idle CPU, artifact and runtime-library size, dependency count,
and output quality.

Run the harness with `just bench`, or run the equivalent commands in
`benchmarks/README.md`. The harness records the commit, binary and model
digests, dirty state, environment, command, input shape, batch size, top-k, and
rate-limit override. Report the median of at least three independent runs and
retain the spread. A single best-case run is not evidence.

## Reporting

Results are recorded in `torviello-bench/evaluations/reports/<date>-<scope>/`
as raw `results.json` (or `run-*.json`), a rendered summary, and the analysis.
The current CPU report is
`torviello-bench/evaluations/reports/2026-10-22-classify-cpu/`.

Performance budgets live in `benchmarks/budgets/` with an owner and review
date. A run exits non-zero when a budget fails; the CI `performance-cpu` job and
`just bench` call the same gate. A performance claim is rejected when the
method, hardware, model revision, workload, or measurement window is missing.

Local results do not establish cross-hardware or competitor claims. A true
cold start requires a fresh page cache; record that limitation when the local
run uses a warm cache. Regression comparison is valid only on the same hardware
and runtime, using `--baseline` with a recorded tolerance.
