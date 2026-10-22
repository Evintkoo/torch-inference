# Containers

Copyright (c) 2026 Torviello.

Container definitions live here; release and package definitions live in
`packaging/` (ED-024, REL-01.01).

## Build and run

From the repository root:

```sh
docker compose -f containers/compose.yaml --profile cpu up --build
```

The default image builds the engine-only profile, runs as the unprivileged
`torviello` user, and binds inside the container on port 8000. Compose publishes
it on `127.0.0.1:8000` only.

## Scope

- `Dockerfile` builds the `engine` Cargo profile. The `full` profile needs a
  prepared libtorch cache and is not built by this image.
- Accelerator profiles are not implemented. Declaring `TORCH_ACCELERATOR` does
  not enable a provider; the engine fails with `model.backend_unavailable`
  instead of silently falling back.
- The base images are pinned by release tag. Pin by digest before publishing a
  supported release (REL-02.05).
