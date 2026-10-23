# Packaging

Copyright (c) 2026 Torviello.

Release and package definitions for the engine-only and full distributions.
Container definitions live in `../containers/`. The workflow decision is
recorded in [ADR 0003](../docs/adr/0003-packaging-automation.md) and implements
ED-021, ED-022, ED-024, and REL-01.

## Ownership and toolchain

- **Owner:** release owner.
- **Toolchain:** Python 3.11+ standard library and the pinned Rust toolchain
  (`Cargo.lock`). No additional packaging dependency is required.
- **Test entry point:** `uv run pytest packaging/tests`.
- **Deployment target:** the systemd unit in `packaging/systemd/` and the
  container definitions in `../containers/`.
- **Release cadence:** per release tag; the `Release` workflow builds and
  verifies both profiles, then publishes the CPU engine image to GHCR. The
  full image waits for a packaged libtorch runtime.

## Entry point

The driver needs Python 3.11+ and the pinned Rust toolchain. It uses only the
Python standard library and runs unchanged on Windows, macOS, and Linux.

```sh
python packaging/torviello_package.py validate
python packaging/torviello_package.py plan --profile engine
python packaging/torviello_package.py prepare --profile engine   # online
python packaging/torviello_package.py build --profile engine --offline
python packaging/torviello_package.py verify dist/<artifact>.manifest.json
```

`just package <profile>` and `just package-prepare <profile>` are optional
wrappers around the same commands.

## Definition

`packaging.toml` is the single source of truth for:

- product name, version source, and output directory;
- each profile's Cargo features, binary name, and included files.

The driver rejects an unknown profile, a missing input file, an unreadable
version table, or a Cargo invocation that does not produce the binary.

## Outputs

For `<product>-<version>-<profile>-<target>` the driver writes:

- `dist/<artifact>.tar.gz` on Linux/macOS or `.zip` on Windows;
- `dist/<artifact>.sha256`;
- `dist/<artifact>.manifest.json` with source revision and state, resolved
  target, features, lockfile digests, file digests, toolchain versions, builder
  facts, and the artifact digest.

Archive entries are sorted and normalized (fixed ownership, mode, and source
timestamp from `SOURCE_DATE_EPOCH` or the source commit), so equivalent inputs
produce equivalent archive bytes where the platform permits.

## Offline build

`prepare` is the only phase that may use the network: it runs
`cargo fetch --locked`, and for the `full` profile it performs one online
release build to populate the libtorch cache. `build --offline` passes
`--offline` and `--locked` to Cargo and never contacts GitHub, a registry, or a
package site.

The `full` profile is offline-buildable only while the prepared libtorch cache
is present. A cold or relocated cache requires another `prepare`; that
limitation is tracked under REL-01.04.

## Verified runtime

On macOS, `prepare` then `build --offline` produced the engine bundle, a
second build reproduced the same SHA-256, and `verify` recomputed the digest.
The extracted bundle started from the packaged config, returned 200 from
`/health/live` and `/health`, and exited 0 on `SIGTERM`. `/health` reports
`degraded` when the demo catalog has no model assets loaded.

## Not yet covered

- Windows and Linux bundle builds, and first-start/health/stop checks for every
  profile (REL-01.06).
- Platform signing and notarization, which remain separate non-deterministic
  steps after the unsigned bundle is produced (REL-01.05).
