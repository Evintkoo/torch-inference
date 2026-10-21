# Supported Platforms and End of Life

Copyright (c) 2026 Torviello.

| Platform | Architecture | Support | End of life |
|---|---|---|---|
| Linux | x86_64 | current and previous minor | 18 months after minor |
| Linux | aarch64 | current and previous minor | 18 months after minor |
| macOS | aarch64 | current and previous minor | 18 months after minor |

Accelerator support is capability-based: CPU is the only executable provider
today. CUDA, Metal, ROCm, Vulkan, CoreML, and DirectML are declared build
features; a binary must be built with the matching feature and a provider,
otherwise startup fails with `model.backend_unavailable`. A missing provider
never silently claims accelerator support.

End-of-life notice is published at least 90 days before removal. Security
fixes continue for supported versions under [SECURITY.md](../SECURITY.md).
