# Containers

Copyright (c) 2026 Torviello.

Container definitions live here; release and package definitions live in
`packaging/` (ED-024, REL-01.01).

## Build and run

From the repository root:

```sh
docker compose -f torviello-engine/containers/compose.yaml --profile cpu up --build
```

The default image builds the engine-only profile, runs as the unprivileged
`torviello` user, binds `127.0.0.1:8000` inside the container, and includes the
project and third-party notices under `/usr/share/doc/torviello/`. Compose
publishes it on `127.0.0.1:8000` only.

## Scope

- `Dockerfile` builds the `engine` Cargo profile. The `full` profile needs a
  prepared libtorch cache and is not built by this image.
- Vulkan and Metal are implemented in the TorchScript adapter but need a
  libtorch built for the target device. The published engine image is CPU-only;
  an accelerator container needs its own prepared runtime and smoke test.
- Release tags publish the CPU engine image to
  `ghcr.io/evint/torch-inference-engine` with semver, commit, and `latest` tags.
- A `persistence` or `full` build writes SQLite under `/var/lib/torviello` by
  default. Mount a writable volume there; the base compose file sets
  `read_only: true`, so the state path must be an explicit volume.
- The base images are pinned by release tag. Pin by digest before publishing a
  supported release (REL-02.05).

## Validation

Apply [HPA-4](../../torviello-enforcer/requirements/assurance-standard.md) to
every change here. From the repository root:

```sh
docker compose -f torviello-engine/containers/compose.yaml config --quiet
uv run --locked pytest torviello-engine/packaging/tests
```

A compose file that renders is not a published image: record the CI image
build and smoke run as release evidence (REL-01).

## Status

The CPU engine Dockerfile and compose file are defined. No accelerator image
exists, base images are pinned by tag rather than digest, and no release image
has been recorded as evidence in this repository.
