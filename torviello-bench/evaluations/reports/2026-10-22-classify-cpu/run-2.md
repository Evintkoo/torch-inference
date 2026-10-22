# CPU classifier benchmark

- Generated: 2026-10-22T03:15:53.540744+00:00
- Revision: `5e58f0def4b38816898670047410e2e1239e4710`
- Profile: `minimal-cpu-torchscript`
- Workload: 32x32 PNG, batch 1, top_k 1, one warm model
- CPU: Apple M4
- OS: macOS-26.6.2-arm64-arm-64bit-Mach-O

## Latency and throughput

- p50: 0.297 ms
- p95: 0.653 ms
- p99: 1.195 ms
- Throughput at concurrency 8: 3951.775 req/s
- Errors: 0

## Footprint

- Process start to live: 384.827 ms
- Model load: 18.246 ms
- Process to ready: 403.928 ms
- Peak RSS: 107593728 bytes
- Idle RSS: 106004480 bytes
- Idle CPU: 0.0%
- Artifact bytes: 7420092

## Quality

- Top-1 accuracy: 1.0 (5/5)
- Failed cases: none

## Budget

| Metric | Value | Budget | Result |
|---|---:|---:|---|
| p50_latency_ms | 0.297 | 10 | pass |
| p95_latency_ms | 0.653 | 250 | pass |
| p99_latency_ms | 1.195 | 50 | pass |
| max_latency_ms | 5.221 | 250 | pass |
| throughput_rps | 3951.775 | 500 | pass |
| cold_start_ms | 384.827 | 5000 | pass |
| ready_ms | 403.928 | 5000 | pass |
| load_ms | 18.246 | 2000 | pass |
| idle_rss_bytes | 106004480 | 268435456 | pass |
| idle_cpu_percent | 0.0 | 5 | pass |
| peak_rss_bytes | 107593728 | 536870912 | pass |
| artifact_bytes | 7420092 | 33554432 | pass |
| binary_bytes | 7416816 | 16777216 | pass |
| model_bytes | 3276 | 1048576 | pass |
| dependency_count | 222 | 300 | pass |
| runtime_libraries_bytes | 169134352 | 1073741824 | pass |
| quality_accuracy | 1.0 | 1.0 | pass |

Raw measurements are in the JSON report. Reproduction command is recorded there.
