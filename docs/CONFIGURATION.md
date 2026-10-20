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
[config/schema.json](../config/schema.json) before activation. A safe reload
is triggered by SIGHUP after schema validation.
