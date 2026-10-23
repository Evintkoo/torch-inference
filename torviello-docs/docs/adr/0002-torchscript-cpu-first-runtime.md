# ADR 0002: TorchScript CPU as the first execution backend

## Status

Accepted. Date: 2026-10-22. Owner: engine technical owner.

## Context

The first inference slice needs a real model format and execution backend. The
contract already exposes `POST /classify`, and the engine has a `Runtime` port
with a reference linear-classifier adapter. That adapter proves lifecycle
behavior but is not a PyTorch artifact, so it cannot satisfy the first
model-execution slice.

The decision must cover model format, baseline device, failure behavior, and
the dependency boundary. It must also keep the minimal profile installable
without a full PyTorch distribution.

## Requirements and constraints

- RP-010 makes CPU the mandatory baseline.
- RP-012 forbids silent accelerator fallback.
- RP-014 requires deterministic, observable failures.
- PA-010–PA-012 require a supported model family and asset delivery path.
- ED-052 requires the HTTP contract and runtime behavior to agree.
- GOV-08.08 requires every declared operation to be exercised against the
  running provider.
- The default build must stay small enough for offline developer laptops.
- Model bytes remain digest-verified before activation.

## Options considered

1. **ONNX Runtime via `ort`.** Portable and CPU-friendly, but adds a second
   model ecosystem and does not directly execute the PyTorch artifacts we
   already train.
2. **TorchScript via `tch`/libtorch.** Executes traced or scripted PyTorch
   modules directly, supports CPU deterministically, and keeps training and
   serving artifacts aligned. The dependency is large and needs a feature gate.
3. **Safetensors with a Rust-native graph runtime.** Smallest binary, but
   requires reimplementing model graphs and operator coverage; too much scope
   for the first slice.

## Decision

Use **TorchScript on CPU** as the first execution backend.

- The model descriptor selects the format; `torchscript` is loaded through the
  existing `Runtime` port. No route depends on `tch` types.
- CPU is the only enabled device. Requests do not select a device, and the
  engine does not fall back to a GPU.
- The `torchscript` feature owns the `tch` dependency and is included in
  `full`. The minimal/default profile still builds without libtorch and
  reports `model.backend_unavailable` for TorchScript loads.
- `tch` uses the `download-libtorch` build feature so clean CI and developer
  environments can build without a separately installed libtorch.
- Model metadata in the registry declares input channels, height, width, and
  ordered labels. Images are decoded, resized, normalized, and batched by the
  HTTP adapter before the runtime sees a tensor.
- Class scores are probabilities; the runtime returns one row per input, and
  the HTTP layer applies `top_k` without reordering inputs.

## Evidence, assumptions, and open questions

- **Proven locally:** `tch` 0.22.0 compiles and executes a traced `[N,3,32,32]`
  model against Homebrew libtorch 2.9.1 with the build-time version check
  bypassed. The classify integration test passes 3/3.
- **Assumption:** the `download-libtorch` path fetches a compatible 2.9.0
  distribution on CI. That path is not yet exercised on Ubuntu or macOS CI.
- **Open:** operator packaging for offline libtorch, decoder fuzzing, streaming
  classification, and accelerator selection. These remain separate decisions
  or checks.

## Consequences

- The engine can execute a real PyTorch artifact and satisfy the `/classify`
  operation with a TorchScript fixture.
- `cargo build --features torchscript` downloads and links libtorch. The
  default profile remains lightweight but cannot execute TorchScript models.
- TorchScript has limited support for dynamic Python control flow. Models that
  cannot be traced or scripted are out of scope for this slice.
- CPU-only execution means no CUDA, Metal, Vulkan, or ROCm claim yet.
- Model metadata becomes part of the registry contract; labels and input
  geometry must match the artifact.

## Security and operational implications

- Libtorch parses untrusted model bytes. Assets are digest-verified and
  size-bounded before load, and load runs on a blocking worker.
- Image decoding is bounded by request size, batch count, and target
  dimensions. Decode failures return `invalid_input`, not a panic.
- The runtime is read-only after load; unload drains in-flight guards before
  dropping the module.
- Operators must include the libtorch download/link step in offline packaging
  or pre-stage libtorch when building the `torchscript` feature.

## Migration path

The `Runtime` port and model descriptor keep the backend replaceable. A future
ONNX or native backend can be selected by `format` without changing the HTTP
contract. Accelerator support requires a new decision record covering device
selection and fallback.

## Superseded decisions

None. This record narrows OD-001 and OD-002 for the first slice.
