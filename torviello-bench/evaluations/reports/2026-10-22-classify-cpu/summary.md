# CPU classifier evaluation — 2026-10-22

Status: local CPU evidence recorded; not a release decision.

## Scope

- Revision: `5e58f0def4b38816898670047410e2e1239e4710` (clean working tree).
- Profile: `minimal-cpu-torchscript`.
- Model: `engine-demo-torchscript` `1.0.1`, SHA-256
  `5bb25630b7e6c0ecb7ad7ad232c320499f38104ab9f68166160d7272e8e2fb22`.
- Workload: one 32x32 PNG per request, batch 1, `top_k=1`, one warm model,
  1,000 measured requests at concurrency 1 and 1,000 at concurrency 8, after
  30 warmup requests.
- Environment: Apple M4, 10 logical CPUs, 24 GiB, macOS 26.6.2 (25G83), arm64,
  Rust 1.96.1, Python 3.15.0, Homebrew PyTorch/libtorch 2.9.1 with
  `LIBTORCH_BYPASS_VERSION_CHECK=1` because `torch-sys` expects 2.9.0.
- Command recorded in each `run-*.json`:

  ```sh
  SDKROOT=$(xcrun --show-sdk-path) LIBTORCH=/opt/homebrew \
  LIBTORCH_BYPASS_VERSION_CHECK=1 \
  uv run python benchmarks/classify_bench.py \
    --requests 1000 --warmup 30 --idle-seconds 3 \
    --budget benchmarks/budgets/classify-cpu.json \
    --output torviello-bench/evaluations/reports/2026-10-22-classify-cpu/run-N.json
  ```

## Results

Three independent process runs passed every versioned budget check.

| Metric | Median | Range |
|---|---:|---:|
| p50 latency, concurrency 1 | 0.297 ms | 0.113–0.446 ms |
| p95 latency, concurrency 1 | 0.653 ms | 0.191–1.016 ms |
| p99 latency, concurrency 1 | 1.195 ms | 0.253–1.811 ms |
| Maximum single request, concurrency 1 | 5.104 ms | 1.552–5.221 ms |
| Throughput, concurrency 8 | 3,951.8 req/s | 3,412.2–12,946.5 req/s |
| Process start to live | 469.950 ms | 384.827–874.778 ms |
| Model load | 19.565 ms | 18.246–36.533 ms |
| Process start to ready | 490.563 ms | 403.928–912.205 ms |
| Idle RSS | 101.09 MiB | 100.98–101.14 MiB |
| Idle CPU | 0.0% | 0.0–0.0% |
| Peak RSS | 102.61 MiB | 102.58–102.75 MiB |
| Binary plus model artifact | 7.08 MiB | 7.08–7.08 MiB |
| Runtime libraries loaded | 161.30 MiB | 161.30–161.30 MiB |
| Cargo dependency count | 222 | 222–222 |

Raw measurements are in `run-1.json`, `run-2.json`, and `run-3.json`;
per-run rendered summaries are in `run-*.md`; medians and ranges are in
`analysis.json`.

The third run was materially faster than the first two (p95 `0.191 ms` versus
`1.016 ms` and `0.653 ms`; concurrency-8 throughput `12,946.5 req/s` versus
`3,412.2` and `3,951.8`). The cause was not isolated on the shared host. The
gate still passed by a wide margin, but this spread limits precision; retain the
range rather than treating the best run as the result.

## Quality

The five-case deterministic color corpus scored `1.0` (5/5) in every run:
`red`, `green`, `blue`, `bright`, and `dark` all matched. Version `1.0.0` had
returned `red` for pure white; version `1.0.1` changes the head so `bright` is
reachable. The budget now requires `1.0` accuracy.

## Limitations

- This is a local Apple M4 measurement, not a cross-hardware or competitor
  benchmark. The competitor set and claim envelope remain open in OD-005.
- The host was shared and not thermally controlled; the run-to-run spread is
  recorded above and the median is not a stable hardware characterization.
- Process start is measured with a warm OS file cache. A true post-reboot
  cold-start measurement has not been made, so the cold-start requirement is
  only partially evidenced.
- The CI budget job was added at revision `a4ef8c9` but has not run on the
  GitHub Ubuntu runner. Its runner-specific latency, RSS, and runtime-library
  values are not yet recorded.
- No same-hardware regression baseline was available, so the run enforces
  absolute budgets but does not exercise the optional baseline comparison.
- No GPU profile was measured, and no "fastest" or "lightest" claim is made.
