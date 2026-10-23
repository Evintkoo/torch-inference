# Deployment and Rollback

Copyright (c) 2026 Torviello.

## Deployment profiles

- `cpu` (default): `cargo build --release --no-default-features --features engine`.
- `persistence`: adds SQLite persistence (`--features persistence`).
- `telemetry`: adds the OpenTelemetry propagation surface (`--features telemetry`).
- `full`: persistence (SQLite), telemetry, and TorchScript (`--features full`).
  The local database stays embedded; no external database server is required.
- `vulkan`: Vulkan-first TorchScript execution (`--features vulkan`, which
  implies `torchscript`). It selects the Vulkan device when libtorch was built
  with `USE_VULKAN=1` and a device is available; otherwise it falls back to CPU
  and reports `cpu`. The downloadable CPU libtorch is not sufficient, and
  macOS requires MoltenVK.
- `metal`: Metal execution on macOS (`--features metal`, which implies
  `torchscript`). It uses the MPS device and falls back to CPU when unavailable.
- `cuda`, `rocm`, `coreml`, and `directml` have no Cargo feature or provider.
  Enabling one in configuration fails startup with `model.backend_unavailable`
  rather than silently claiming support.

Build the bundle with `python packaging/torviello_package.py build --profile
engine --offline` (or `full` for the complete package). The engine-only bundle
contains the backend binary and operator documents; the full bundle adds
SQLite persistence, telemetry, and TorchScript. Deploy with the signed release
bundle and verify the checksum and SBOM before starting the service. The default bind is `127.0.0.1`; remote deployments
must terminate TLS 1.3 at the reverse proxy and set an allowed CORS origin.

Images are published to GHCR on every release tag:

```sh
docker pull ghcr.io/evint/torch-inference-engine:latest
docker run --rm --network host \
  -e TORCH_AUTH_JWT_SECRET="$(openssl rand -hex 32)" \
  ghcr.io/evint/torch-inference-engine:latest
```

The image binds `127.0.0.1` by default because local HS256 is loopback-only.
Host networking keeps that bind reachable only from the Docker host (Linux).
Docker Desktop without host networking must use the OIDC profile below; do not
expose a shared-secret profile on a published container interface.

Hosted deployments use OIDC instead of the local shared secret:

```sh
docker run --rm -p 127.0.0.1:8000:8000 \
  -e TORCH_HOST=0.0.0.0 \
  -e TORCH_AUTH_MODE=oidc \
  -e TORCH_OIDC_ISSUER=https://issuer.example \
  -e TORCH_OIDC_AUDIENCE=torviello-engine \
  -e TORCH_OIDC_JWKS_URL=https://issuer.example/.well-known/jwks.json \
  ghcr.io/evint/torch-inference-engine:latest
```

A reverse proxy in another container must reach the engine on a shared network;
set `TORCH_HOST=0.0.0.0` only for that OIDC profile and restrict the published
port at the proxy or host firewall. In that profile the OIDC token check is the
network boundary, so never combine `0.0.0.0` with local HS256.

Release images are signed keyless with cosign and pushed by digest. Verify the
signature against the release workflow identity before deploying:

```sh
cosign verify ghcr.io/evint/torch-inference-engine:latest \
  --certificate-identity-regexp 'github.com/evint/torch-inference/.github/workflows/release.yml@refs/tags/' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

The engine is a resource server: it validates tokens but does not host login,
password recovery, MFA, or device authorization. Those flows belong to the OIDC
provider and the client applications.

The published engine image is CPU-only and does not include the `persistence`
or `torchscript` features. A full image with TorchScript and SQLite is not
published until the libtorch runtime is packaged with the binary. For a locally
built persistence-enabled image, mount `/var/lib/torviello` so SQLite state
survives container replacement. The SQLite file is local state: back it up
before upgrades, and do not run two containers against the same file because
SQLite permits only one writer. Kubernetes is not a supported deployment target;
use the systemd unit or a single container.

`GET /metrics` is public by default for local scraping. Keep it on a private
interface or move `/metrics` to `private_routes`; do not expose an open metrics
endpoint to the internet. The exported series, alert rules, and local
run command are documented in [monitoring/README.md](../monitoring/README.md).

## Rollback

1. Stop the service with SIGTERM and wait for the graceful shutdown timeout.
2. Restore the previous signed artifact and database migration checkpoint.
3. Start the prior release and check `/health/ready`.
4. Confirm error rate and latency return to the SLO baseline.
5. Record the rollback reason, actor, and evidence in the incident log.

Database migrations are forward-only; rollback uses the pre-migration
backup or the previous release's compatible schema.
