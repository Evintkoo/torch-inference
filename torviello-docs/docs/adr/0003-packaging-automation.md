# ADR 0003: Declarative packaging driver over Ansible

## Status

Accepted. Date: 2026-10-22. Owner: release owner.

## Context

Release packaging must build on Windows, macOS, and Linux without making a
platform shell script the only path (ED-021, ED-022, REL-01.02). It must also
distinguish online dependency preparation from an offline build, record the
inputs used for each artifact, and keep release definitions under `packaging/`
while container definitions live under `containers/` (ED-024, REL-01.01).

The manual review proposed Ansible. Ansible is a strong configuration-management
tool, but its controller has no native Windows support and its inventories,
collections, and modules are a poor fit for producing local build artifacts on
a developer laptop. The repository already depends on Python for verification
and on `just` as a command wrapper.

## Options considered

1. **Ansible.** Declarative and familiar, but Windows requires WSL, it adds a
   large collection surface, and it is designed for remote host convergence
   rather than local, offline artifact assembly.
2. **Task / Earthly / Nix.** Task is small and cross-platform but needs an
   extra binary. Earthly requires a container runtime and network access. Nix
   gives strong reproducibility but raises the contributor setup cost and is
   weak on native Windows.
3. **Stdlib Python driver driven by a TOML manifest.** Runs wherever the
   repository's Python toolchain runs, needs no extra binary beyond Python,
   works the same on Windows, macOS, and Linux, and keeps the packaging
   definition declarative and reviewable.

## Decision

Use a declarative TOML manifest at `packaging/packaging.toml` and a
self-contained Python driver at `packaging/torviello_package.py` that requires
only the Python 3.11+ standard library.

- `packaging/packaging.toml` names the product, version source, output
  directory, and every release profile with its Cargo features and included
  files.
- The driver exposes `validate`, `plan`, `prepare`, `build`, and `verify`.
  `prepare` may use the network; `build --offline` passes `--offline` and
  `--locked` to Cargo so the build phase does not depend on GitHub, a registry,
  or a package site.
- Artifacts are deterministic tar.gz archives (zip on Windows) with sorted
  entries, a fixed timestamp from `SOURCE_DATE_EPOCH` or the source commit,
  normalized ownership, and a JSON manifest that records revision, feature
  flags, target, lockfile digests, included files, and the artifact digest.
- Container definitions move to `containers/` and are invoked from there by
  documentation and CI.
- `just` remains an optional wrapper; it is not the sole build path.

## Consequences

- Any contributor with Python 3.11+ and the pinned Rust toolchain can produce
  the same bundle on every supported OS without installing Ansible.
- The manifest is the single place that defines engine-only and full-package
  contents; the driver rejects unknown profiles and missing inputs.
- The `full` profile still needs the libtorch cache prepared online once; the
  offline build works only while that prepared cache is present. This is
  recorded as a limitation rather than claimed as solved.
- Signing and notarization remain platform-specific, non-deterministic steps
  performed after the driver produces the unsigned bundle.

## Evidence, assumptions, and open questions

- **Verified:** unit tests cover manifest validation, profile resolution,
  deterministic archive bytes, and digest verification. On macOS, `prepare`
  populated the Cargo cache, `build --profile engine --offline` produced the
  bundle, a rebuild reproduced the same SHA-256, and `verify` recomputed the
  digest from the manifest.
- **Verified:** the extracted engine bundle starts with the packaged config and
  schema, returns 200 from `/health/live` and `/health`, and exits 0 on
  `SIGTERM`. `/health` reports `degraded` only because the demo catalog has no
  model assets, which is the expected state for a scaffold bundle.
- **Corrected during verification:** the bundle now includes
  `services/engine/api/contracts/schema.json`, and the systemd unit sets
  `WorkingDirectory`, `TORCH_CONFIG`, `TORCH_MODEL_REGISTRY`, and a writable
  `TORCH_MODEL_ROOT`; without these the packaged service could not start.
- **Not yet verified:** Windows and Linux bundle builds and install tests. The
  `full` profile also still depends on a prepared libtorch cache.
- **Assumption:** supported build hosts provide Python 3.11+ and a Rust
  toolchain; both are already required by the repository.
- **Open:** Windows and Linux bundle builds, install tests for each profile, and
  a prepared libtorch cache contract are tracked under REL-01.06 and REL-01.04.

## Superseded decisions

None. This record resolves the packaging-workflow question in
`requirements/open-decisions.md`.
