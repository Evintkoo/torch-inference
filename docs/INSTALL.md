# Installation

Copyright (c) 2026 Torviello.

## Install

1. Download the signed release artifact for your platform.
2. Verify the SHA-256 checksum and signature.
3. Extract the bundle to `/opt/torviello`, preserving the `bin/` and
   `share/torviello/` layout.
4. Install the systemd unit from `packaging/systemd/`. The unit runs from
   `/opt/torviello/share/torviello` so the packaged config, registry, and API
   schema resolve without extra flags, and writes models under
   `/var/lib/torviello/models`.
5. Inject secrets through `/etc/torviello/engine.env` and start the service.

The bundle contains `bin/torviello-engine`, `share/torviello/MANIFEST.json`,
and the configuration, systemd, container, and operator documents listed in
`packaging/packaging.toml`.

## Build from source

The packaging driver needs Python 3.11+ and the pinned Rust toolchain. It runs
on Windows, macOS, and Linux without a shell script.

```sh
python packaging/torviello_package.py validate
python packaging/torviello_package.py prepare --profile engine
python packaging/torviello_package.py build --profile engine --offline
python packaging/torviello_package.py verify dist/<artifact>.manifest.json
```

`prepare` may use the network; `build --offline` does not. See
[packaging/README.md](../packaging/README.md) for profiles, outputs, and the
prepared libtorch-cache limitation for the `full` profile.

## Upgrade

1. Back up the SQLite database and model registry.
2. Stop the service gracefully.
3. Replace the artifact and run `just migrate`.
4. Start the service and verify readiness.
5. If verification fails, follow the rollback path in
   [DEPLOYMENT.md](DEPLOYMENT.md).

Migration is forward-only; retain the pre-upgrade backup until the release
has passed its observation window.
