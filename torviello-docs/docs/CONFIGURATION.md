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

## Authentication

`auth_mode = "local"` (the default) verifies the loopback HS256 secret in
`TORCH_AUTH_JWT_SECRET`. Hosted deployments set `auth_mode = "oidc"` and must
configure the issuer, audience, and JWKS URL:

```toml
auth_mode = "oidc"
oidc_issuer = "https://issuer.example"
oidc_audience = "torviello-engine"
oidc_jwks_url = "https://issuer.example/.well-known/jwks.json"
oidc_clock_skew_seconds = 60
```

The engine accepts only ES256, RS256, and PS256 access tokens. It requires
`exp`, `nbf`, `iss`, `aud`, and `sub`, selects keys by `kid`, and rejects
`jku`, `x5u`, inline `jwk`, shared-secret algorithms, and non-signature keys.
JWKS responses are capped at 1 MiB, fetched with a five-second timeout and no
redirects, and cached for five minutes. Unknown `kid` values are re-fetched at
most once every ten seconds.

`oidc_*` values must be empty in local mode. Local HS256 is accepted only when
`host` is `127.0.0.1`, `::1`, or `localhost`; bind a non-loopback interface only
with OIDC. `oidc_issuer` and `oidc_jwks_url` must use HTTPS, except that plain
HTTP is accepted for exact loopback hosts during testing.

Tokens may carry `roles` and a space-delimited `scope`. Inference routes accept
role `inference` or scope `engine.inference`; lifecycle mutations require
`operator` or `engine.models.write`; `/system` requires `admin` or
`engine.admin`. `admin` and `engine.admin` pass every check.

## Local persistence

The `persistence` feature uses an embedded SQLite database; no database server
is required. `database_url` (or `TORCH_DATABASE_URL`) defaults to
`sqlite://data/engine.db`. The parent directory is created at startup, embedded
migrations run before the listener starts, and the process fails closed if the
database cannot be opened. Audit rows older than `retention_max_age_days` are
purged at startup and hourly thereafter.

Audit writes cover model `download`, `load`, `unload`, and `inference` actions.
The actor is the authenticated principal, or `local` when the matched route is
open. Each record carries its request ID, organization, token ID, action,
outcome, and error code. The intent row is written before the side effect, so a
database failure rejects the request instead of performing an unaudited action.
A failure to update the outcome after the side effect is logged and leaves the
durable intent row intact.

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

## Logging

The engine writes one JSON object per line to stdout and leaves collection to
the container runtime or systemd journal. `RUST_LOG` sets the filter and
defaults to `info`; use a crate or target filter such as
`torviello_engine=debug` for diagnosis. Records carry `timestamp`, `level`,
`target`, `fields`, and a `correlation_id` for the startup event. Do not place
tokens, passwords, or key material in log fields; secrets are injected through
the environment and are never written to the log stream.


## Route access

`[access_control]` decides which matched route templates require a bearer
token. The default is deny: health, readiness, metrics, and the API reference
are public, and everything else is private.

```toml
[access_control]
default_public = false
public_routes = ["/health", "/health/live", "/health/ready", "/api/v1/health", "/metrics", "/docs", "/openapi.yaml", "/assets/scalar.js"]
private_routes = []
```

`private_routes` wins over `public_routes`, which wins over `default_public`.
Use the exact Axum matched template (for example `/models/{modelId}`), not a
concrete URL. Setting `default_public = true` opens the local instance; keep it
false when the bind address is not loopback.

## API reference

The engine serves an embedded Scalar reference at `/docs` and the OpenAPI
document at `/openapi.yaml`. Both are offline-capable; Scalar is bundled in the
binary and does not call a CDN.

## Accelerators

```toml
[accelerators]
vulkan = true
metal = true
```

`vulkan` and `metal` select the TorchScript device when the binary was built
with the matching feature and the device is available. macOS prefers Metal;
other platforms use Vulkan. Metal configuration is rejected on non-macOS. A
missing device falls back to CPU with an `accelerator_fallback` log entry, and
the model slot and readiness body report the actual `backend`. The other
accelerator keys are reserved: no Cargo feature or provider exists, so enabling
one fails startup with `model.backend_unavailable` rather than claiming support.
