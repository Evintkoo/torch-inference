# Capacity and Readiness

Copyright (c) 2026 Torviello.

## Baseline

| Resource | CPU profile | GPU profile |
|---|---|---|
| vCPU | 2 | 4 |
| memory | 4 GB | 16 GB |
| model cache | 10 GB | 50 GB |
| concurrent requests | 8 | 32 |

Queues are bounded by `max_queue_depth`. The engine rejects excess work with
HTTP 429 and a Retry-After value rather than growing memory without limit.

## Readiness review

Before a release, the operator confirms model checksum, available disk,
accelerator fallback, migration status, and alert routing. Capacity is
reviewed monthly against the SLOs; a sustained p95 above target triggers a
resource review.
