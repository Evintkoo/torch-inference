# Model Card: engine-demo-torchscript

Copyright (c) 2026 Torviello.

## Identity

- Registry ID: `engine-demo-torchscript`
- Version: `1.0.0`
- Content hash: `sha256:90deda...`
- Format: TorchScript, traced with PyTorch 2.8
- License: Apache-2.0

## Intended use

Exercises the CPU TorchScript runtime and the `POST /classify` contract. It is a
synthetic fixture, not a production classifier.

## Behavior

The model accepts a float32 tensor shaped `[N, 3, 32, 32]` with channel values
in `[0, 1]`. It averages each channel over the spatial dimensions and applies a
fixed linear projection. Labels are `red`, `green`, `blue`, `bright`, and
`dark`.

## Evaluation

No accuracy, robustness, or performance claim is recorded for this fixture.
The classify integration test checks input order, leading labels for red and
green inputs, top-k length, score ordering, and envelope attribution.

## Release

The 3.3 KB asset is digest-verified against its manifest before load. The
runtime requires the `torchscript` feature and CPU libtorch. Removing the
registry entry or reverting the manifest rolls back the fixture.
