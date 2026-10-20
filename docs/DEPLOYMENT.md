# Deployment and Rollback

Copyright (c) 2026 Torviello.

## Deployment profiles

- `cpu`: default single-node profile.
- `gpu`: CUDA, Metal, ROCm, Vulkan, CoreML, or DirectML acceleration when available.
- `full`: engine, web console, docs, and media assets.

Deploy with the signed release bundle. Verify the checksum and SBOM before
starting the service. The default bind is `127.0.0.1`; remote deployments
must terminate TLS 1.3 at the reverse proxy and set an allowed CORS origin.

## Rollback

1. Stop the service with SIGTERM and wait for the graceful shutdown timeout.
2. Restore the previous signed artifact and database migration checkpoint.
3. Start the prior release and check `/health/ready`.
4. Confirm error rate and latency return to the SLO baseline.
5. Record the rollback reason, actor, and evidence in the incident log.

Database migrations are forward-only; rollback uses the pre-migration
backup or the previous release's compatible schema.
