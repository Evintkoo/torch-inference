# Supported Platforms and End of Life

Copyright (c) 2026 Torviello.

| Platform | Architecture | Support | End of life |
|---|---|---|---|
| Linux | x86_64 | current and previous minor | 18 months after minor |
| Linux | aarch64 | current and previous minor | 18 months after minor |
| macOS | aarch64 | current and previous minor | 18 months after minor |
| Windows | x86_64 | current and previous minor | 18 months after minor |

Accelerator support is capability-based: CPU is always available; CUDA,
Metal, ROCm, Vulkan, CoreML, and DirectML are optional. A missing accelerator
falls back to CPU with a recorded warning.

End-of-life notice is published at least 90 days before removal. Security
fixes continue for supported versions under [SECURITY.md](../SECURITY.md).
