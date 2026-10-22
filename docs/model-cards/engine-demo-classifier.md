# Model Card: engine-demo-classifier

Copyright (c) 2026 Torviello.

## Identity

- Registry ID: `engine-demo-classifier`
- Version: `1.0.0`
- Content hash: `sha256:6f1c...`
- License: Apache-2.0

## Intended use

Local image classification for demonstration and contract testing. Not for
medical, safety-critical, or surveillance decisions.

## Evaluation

This registry entry is a catalog-only scaffold: no model asset is bundled, so
load fails with `model.backend_unavailable` when the asset is absent. No current
accuracy, latency, or memory measurement exists for this entry. Do not cite the
former 0.93 accuracy or 42 ms p95 claims; they had no retained evidence.

The measured CPU evidence covers the separate `engine-demo-torchscript` fixture
and is recorded in `torviello-bench/evaluations/reports/2026-10-22-classify-cpu/`.

## Release

The model passes checksum verification before activation. Rollback is to the
previous registry version.
