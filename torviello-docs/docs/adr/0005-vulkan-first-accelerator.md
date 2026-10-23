# ADR 0005: Vulkan and Metal are the first accelerator targets

## Status

Accepted. Date: 2026-10-22. Owner: runtime owner.

## Context

The CPU TorchScript path is the release baseline (ADR 0002). Accelerators were
feature flags with no implementation: enabling one only changed configuration,
not execution. The product priority is one vendor-neutral GPU path before
vendor-specific providers.

PyTorch's Vulkan backend runs on Vulkan 1.1 devices from AMD, Intel, NVIDIA,
and Apple (through MoltenVK), but it is experimental on desktop, supports
float32 operators, and requires PyTorch built with `USE_VULKAN=1`
([PyTorch Vulkan workflow](https://docs.pytorch.org/tutorials/unstable/vulkan_workflow.html)).
`tch 0.22` exposes `Device::Vulkan`, `Device::Mps`, `has_vulkan()`, and
`has_mps()`, so one adapter covers both paths without a new runtime.

## Decision

- Vulkan and Metal are the first accelerator targets, ahead of CUDA, ROCm,
  CoreML, and DirectML.
- The TorchScript adapter selects `Device::Mps` on macOS when the `metal`
  feature is compiled and `tch::utils::has_mps()` reports a usable device. It
  selects `Device::Vulkan` when the `vulkan` feature is compiled and
  `tch::utils::has_vulkan()` reports a usable device. If neither selected device
  is available it falls back to CPU, logs `accelerator_fallback`, and reports
  `cpu` in the model slot's `backend` and `device` fields.
- `vulkan` and `metal` imply `torchscript`; they do not add another execution
  engine. Platform-native Metal is preferred on macOS, Vulkan elsewhere.
- Models used on Vulkan must be prepared for the Vulkan backend
  (`optimize_for_mobile(..., backend='vulkan')`) and stay within its operator
  and float32 coverage. Unsupported operators fail rather than silently
  producing a different result.
- A Vulkan claim is not made until a pinned workload, driver, GPU, and
  reproducible benchmark pass the release gate. The benchmark manifest must
  record the device, driver, Vulkan version, precision, and model artifact.

## Consequences

- The default engine bundle stays CPU-only. A Vulkan build needs a libtorch
  built with Vulkan and the Vulkan SDK at build time; the downloadable CPU
  libtorch is not sufficient.
- macOS prefers native Metal and can use MoltenVK through the Vulkan path when
  Metal is unavailable. Both paths are compiled only when requested.
- Packaging must not imply Vulkan support in the engine-only profile. A future
  Vulkan profile needs its own prepared cache and smoke test.
- The current capability check is truthful: a compiled feature without a device
  falls back to CPU and is visible in the model status.

## Evidence and open questions

- Implemented: config-driven device selection for Vulkan and Metal,
  load-on-device, tensor transfer, CPU result copy, and slot reporting in
  `services/engine/src/runtime/torchscript.rs`.
- Verified on this host: CPU fallback with the downloadable libtorch; the
  `torchscript` contract tests pass. No Vulkan device was available here, so
  GPU execution and performance remain unverified.
- Open: which GPUs and drivers are release commitments, quantized operator
  coverage, and whether a Vulkan-specific bundle is offered.
