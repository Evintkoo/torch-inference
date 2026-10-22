# Deployment and Rollback

Copyright (c) 2026 Torviello.

## Deployment profiles

- `cpu` (default): `cargo build --release --no-default-features --features engine`.
- `persistence`: adds SQLite persistence (`--features persistence`).
- `telemetry`: adds the OpenTelemetry propagation surface (`--features telemetry`).
- `full`: persistence and telemetry (`--features full`).
- Hardware features (`cuda`, `metal`, `vulkan`, `rocm`, `coreml`, `directml`)
  select provider code at compile time. No accelerator provider is implemented
  yet; enabling one without a provider fails startup with
  `model.backend_unavailable` rather than silently claiming support.

Build the bundle with `python packaging/torviello_package.py build --profile
engine --offline` (or `full` for the complete package). The engine-only bundle
contains the backend binary and operator documents; the full bundle adds
SQLite persistence, telemetry, and TorchScript. Deploy with the signed release
bundle and verify the checksum and SBOM before starting the service. The default bind is `127.0.0.1`; remote deployments
must terminate TLS 1.3 at the reverse proxy and set an allowed CORS origin.

## Rollback

1. Stop the service with SIGTERM and wait for the graceful shutdown timeout.
2. Restore the previous signed artifact and database migration checkpoint.
3. Start the prior release and check `/health/ready`.
4. Confirm error rate and latency return to the SLO baseline.
5. Record the rollback reason, actor, and evidence in the incident log.

Database migrations are forward-only; rollback uses the pre-migration
backup or the previous release's compatible schema.
