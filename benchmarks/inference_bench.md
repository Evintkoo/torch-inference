# Inference benchmark method

## Target

The service objective is p95 latency below 250 ms and peak resident memory
below 512 MiB for the demo CPU classifier. These are targets, not results.

## Method

The versioned harness is `benchmarks/classify_bench.py`. It starts the release
binary with the checked-in configuration, loads the digest-verified
`engine-demo-torchscript` fixture, applies 30 warmup requests, and measures
1,000 requests at concurrency 1 and 1,000 at concurrency 8. It records p50, p95,
p99 and maximum latency, throughput, process start, model load, idle and peak
RSS, idle CPU, artifact and runtime-library size, dependency count, and a
fixed quality corpus. An execution exits non-zero when any check in
`benchmarks/budgets/classify-cpu.json` fails. The exact command, revision,
binary digest, model digest, and environment are retained in `results.json`.

See `benchmarks/README.md` for the reproduction command and
`docs/BENCHMARKS.md` for reporting rules.

## Current result

On 2026-10-22, three clean-revision runs at `5e58f0d` on an Apple M4 produced
median p95 `0.653 ms` (range `0.191–1.016 ms`), median p99 `1.195 ms`,
median throughput `3,951.8 req/s` at concurrency 8, median peak RSS
`102.61 MiB`, and a `7.08 MiB` binary-plus-model artifact. All three runs passed
the versioned budget. The quality corpus scored `1.0` (5/5). Run-to-run spread
was wide on the shared host, so the report retains the range; it is not a stable
hardware characterization.

The measurement uses a warm OS file cache, so it does not establish a true
post-reboot cold start. It is a local CPU result only: there is no GPU or
competitor comparison, and no "fastest" or "lightest" claim. Raw evidence is in
`torviello-bench/evaluations/reports/2026-10-22-classify-cpu/`.
