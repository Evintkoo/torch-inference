# CPU classifier benchmark

- Generated: 2026-10-22T03:15:58.842402+00:00
- Revision: `5e58f0def4b38816898670047410e2e1239e4710`
- Profile: `minimal-cpu-torchscript`
- Workload: 32x32 PNG, batch 1, top_k 1, one warm model
- CPU: Apple M4
- OS: macOS-26.6.2-arm64-arm-64bit-Mach-O

## Latency and throughput

- p50: 0.113 ms
- p95: 0.191 ms
- p99: 0.253 ms
- Throughput at concurrency 8: 12946.513 req/s
- Errors: 0

## Footprint

- Process start to live: 469.95 ms
- Model load: 19.565 ms
- Process to ready: 490.563 ms
- Peak RSS: 107741184 bytes
- Idle RSS: 106053632 bytes
- Idle CPU: 0.0%
- Artifact bytes: 7420092

## Quality

- Top-1 accuracy: 1.0 (5/5)
- Failed cases: none

## Budget

| Metric | Value | Budget | Result |
|---|---:|---:|---|
| p50_latency_ms | 0.113 | 10 | pass |
| p95_latency_ms | 0.191 | 250 | pass |
| p99_latency_ms | 0.253 | 50 | pass |
| max_latency_ms | 1.552 | 250 | pass |
| throughput_rps | 12946.513 | 500 | pass |
| cold_start_ms | 469.95 | 5000 | pass |
| ready_ms | 490.563 | 5000 | pass |
| load_ms | 19.565 | 2000 | pass |
| idle_rss_bytes | 106053632 | 268435456 | pass |
| idle_cpu_percent | 0.0 | 5 | pass |
| peak_rss_bytes | 107741184 | 536870912 | pass |
| artifact_bytes | 7420092 | 33554432 | pass |
| binary_bytes | 7416816 | 16777216 | pass |
| model_bytes | 3276 | 1048576 | pass |
| dependency_count | 222 | 300 | pass |
| runtime_libraries_bytes | 169134352 | 1073741824 | pass |
| quality_accuracy | 1.0 | 1.0 | pass |

Raw measurements are in the JSON report. Reproduction command is recorded there.
