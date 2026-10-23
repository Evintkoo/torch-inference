# Model Card: engine-demo-torchscript

Copyright (c) 2026 Torviello.

## Identity

- Registry ID: `engine-demo-torchscript`
- Version: `1.0.1`
- Content hash: `sha256:5bb25630...`
- Format: TorchScript, traced and frozen with PyTorch 2.9.1
- License: Apache-2.0

## Intended use

Exercises the CPU TorchScript runtime and the `POST /classify` contract. It is a
synthetic fixture, not a production classifier.

## Behavior

The model accepts a float32 tensor shaped `[N, 3, 32, 32]` with channel values
in `[0, 1]`. It averages each channel over the spatial dimensions, derives a
brightness score from the channel means, and combines both into five fixed
scores. Labels are `red`, `green`, `blue`, `bright`, and `dark`. Pure white
selects `bright`; black selects `dark`.

## Evaluation

No production accuracy or robustness claim is recorded for this fixture. The
classify integration test checks input order, leading labels for red, green,
white, and black inputs, top-k length, score ordering, and envelope attribution.

A local CPU benchmark at revision `5e58f0d` recorded median p95 `0.653 ms`
(range `0.191–1.016 ms`), median peak RSS `102.61 MiB`, and a quality score of
`1.0` (5/5) for version `1.0.1`. The dated report records the limitations. The raw evidence is in
`torviello-bench/evaluations/reports/2026-10-22-classify-cpu/`.

## Release

The 3.2 KiB asset is digest-verified against its manifest before load. The
runtime requires the `torchscript` feature and CPU libtorch. Removing the
registry entry or reverting the manifest rolls back the fixture.
