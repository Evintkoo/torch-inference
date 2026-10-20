# Installation

Copyright (c) 2026 Torviello.

## Install

1. Download the signed release artifact for your platform.
2. Verify the SHA-256 checksum and signature.
3. Extract the bundle to `/opt/torviello`.
4. Install the systemd unit from `packaging/systemd/`.
5. Inject secrets through the environment and start the service.

## Upgrade

1. Back up the SQLite database and model registry.
2. Stop the service gracefully.
3. Replace the artifact and run `just migrate`.
4. Start the service and verify readiness.
5. If verification fails, follow the rollback path in
   [DEPLOYMENT.md](DEPLOYMENT.md).

Migration is forward-only; retain the pre-upgrade backup until the release
has passed its observation window.
