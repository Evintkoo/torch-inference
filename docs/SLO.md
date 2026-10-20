# Service Level Objectives

Copyright (c) 2026 Torviello.

| Service objective | Target | Error budget | Measurement |
|---|---|---|---|
| Inference availability | 99.5% monthly | 3.6 hours | `/health/ready` probes |
| Inference latency p95 | under 250 ms | 5% of requests | request histogram |
| Model activation success | 99.9% | 43 minutes | activation counter |
| Error rate | under 1% | 1% of requests | 5xx and 4xx policy split |

The error budget is reviewed weekly. A burn rate above 2x pauses feature
changes until the incident owner records restoration evidence.
