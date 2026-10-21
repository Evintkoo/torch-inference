# Configuration

Copyright (c) 2026 Torviello.

Configuration uses TOML files in `config/`. Precedence is:

1. built-in defaults;
2. `config/default.toml`;
3. environment variables with the `TORCH_` or `INFERENCE_` prefix;
4. operator overrides at launch.

Example:

```text
TORCH_AUTH_ENABLED=true
TORCH_AUTH_JWT_SECRET=<injected-by-secret-manager>
TORCH_HOST=127.0.0.1
```

Secrets are never committed. Inject them from the environment or an approved
secret manager. `.env.example` documents optional local variables and contains
no real credentials. Configuration is validated against
[services/engine/api/contracts/schema.json](../services/engine/api/contracts/schema.json)
before activation. `model_registry` selects the model catalog file.

Model asset settings:

- `model_root` is the only directory the engine may read assets from or write
  them to. Names are joined as single validated segments; traversal, absolute
  paths, and symlink escapes are rejected.
- `max_model_bytes` bounds every acquisition and load.
- `max_loaded_models` is the capacity policy. A positive value rejects a load
  that would exceed it; `0` disables the limit explicitly.
- `download_concurrency` and `download_timeout_ms` bound acquisition work.
- `model_source_allowlist` restricts remote acquisition to those hosts. `local`
  sources are relative to `model_root`; `file://` URLs are rejected.

The scaffold loads configuration at startup. Live reload is supervisor-driven;
the SIGHUP hook is present but does not reload a running engine yet.
