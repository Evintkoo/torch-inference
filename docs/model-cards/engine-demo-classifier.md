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

Top-1 accuracy on the synthetic evaluation set is 0.93. Latency p95 on the CPU
profile is 42 ms at batch size 1. Limitations include limited class coverage
and sensitivity to unusual lighting.

## Release

The model passes checksum verification before activation. Rollback is to the
previous registry version.
