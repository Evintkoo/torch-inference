# Cross-Platform Release (macOS / Linux / Windows Installers) — Design

## Goal

Ship the first public release of the Torch Inference server as native
installers for macOS, Linux, and Windows, built and published automatically
by CI from a version tag. This spec covers everything needed to *prepare*
that pipeline; actually cutting the `v1.0.0` tag and publishing the release
is a deliberate final step the maintainer triggers by hand, not part of
this work.

## Scope

- A new GitHub Actions workflow, `.github/workflows/release.yml`, triggered
  on push of a `v*.*.*` tag.
- Per-OS build + package jobs: macOS `.dmg`, Linux `.deb` + `.AppImage`,
  Windows `.msi`.
- A `LICENSE` file (Apache-2.0) — required before any public binary
  distribution.
- One Cargo.toml fix required for the Windows build to succeed (jemalloc).
- A first-run model note bundled into each installer package pointing at
  the existing `scripts/download_models.sh` (no model weights are bundled —
  approved decision: binary + runtime deps only).
- Native per-OS installer formats (approved decision, over a single
  cross-platform packaging tool).

Out of scope: code signing / notarization (macOS Gatekeeper and Windows
SmartScreen will show "unidentified developer" warnings on first launch —
acceptable for a first release, called out as a follow-up), auto-update,
and any change to the existing `ci.yml` (PR/push gate stays as-is; this is
an additional, separate workflow).

## Global Constraints

- Trigger: `push` of tag matching `v*.*.*`. Manual `workflow_dispatch` also
  enabled for testing the pipeline without cutting a real tag.
- Rust toolchain: stable, matching `ci.yml`.
- Build command per OS uses the existing `production` feature set
  (`cargo build --release --features production`) — no new feature set
  needed once the jemalloc fix lands (see Task 1).
- ONNX Runtime version: `1.18.0`, matching the pin already used in
  `ci.yml`'s Linux job. macOS and Windows jobs must install the matching
  ORT release asset for their platform.
- No model files (`.onnx`, `.bin` voice embeddings, tokenizer/vocab files)
  are ever bundled into a release artifact.
- Each installer must place `config.toml` next to the binary as a
  **template** (copy of the repo's `config.toml` with any locally-set
  secrets stripped — currently none are checked in, so the existing
  `config.toml` is safe to ship as-is; verify this at implementation time).
- Installer packages are uploaded as GitHub Release assets named
  `torch-inference-server-<version>-<os>-<arch>.<ext>`.

## Why the jemalloc fix is required

`Cargo.toml` currently declares `tikv-jemallocator` as an unconditional
optional dependency:

```toml
tikv-jemallocator = { version = "0.5", optional = true }
```

`src/main.rs` already gates *use* of it correctly:

```rust
#[cfg(all(feature = "jemalloc", not(target_env = "msvc")))]
#[global_allocator]
static GLOBAL: tikv_jemallocator::Jemalloc = tikv_jemallocator::Jemalloc;
```

But that `#[cfg]` only skips the *usage* — Cargo still resolves and
attempts to **compile** the `tikv-jemallocator`/`tikv-jemalloc-sys` crate
whenever the `jemalloc` feature is enabled, regardless of target, because
the dependency itself is declared unconditionally. `jemalloc` is enabled by
default (`default = ["jemalloc"]`) and by `production`, so a Windows
release build will attempt to compile jemalloc's C sources under
`x86_64-pc-windows-msvc`, which jemalloc does not support.

**Fix:** move the dependency into a target-conditional table so it is
simply absent from the dependency graph on MSVC, leaving the feature name
and the `production` feature set unchanged on every platform:

```toml
[target.'cfg(not(target_env = "msvc"))'.dependencies]
tikv-jemallocator = { version = "0.5", optional = true }
```

(removed from the main `[dependencies]` table). This is a standard,
well-supported Cargo pattern — enabling a feature that maps to an optional
dependency absent on the current target is a no-op there, not an error.

## Per-OS build & package plan

### macOS (`macos-14`, arm64)

1. Install ONNX Runtime 1.18.0 macOS-arm64 release tarball; set
   `ORT_DYLIB_PATH`.
2. `cargo build --release --features production`.
3. Assemble a minimal `.app` bundle:
   ```
   TorchInferenceServer.app/
     Contents/
       Info.plist
       MacOS/torch-inference-server   (the built binary)
       Resources/config.toml
       Resources/libonnxruntime.dylib  (already copied next to the binary
                                         by ort's copy-dylibs feature)
   ```
4. Package with `hdiutil create -volname "Torch Inference Server" -srcfolder <app dir> -ov -format UDZO torch-inference-server-<version>-macos-arm64.dmg`.
5. Upload the `.dmg` as a release asset.

### Linux (`ubuntu-latest`, x86_64)

1. Same ORT install step already in `ci.yml`.
2. `cargo build --release --features production`.
3. `.deb` via `cargo-deb` (`cargo install cargo-deb`, then `cargo deb
   --no-build` pointed at the already-built binary; package metadata —
   maintainer, description, section — added to `Cargo.toml`'s
   `[package.metadata.deb]`).
4. `.AppImage` via `linuxdeploy` + `linuxdeploy-plugin-appimage`: stage the
   binary, `libonnxruntime.so`, and `config.toml` into an AppDir, run
   linuxdeploy to produce the AppImage.
5. Upload both `.deb` and `.AppImage` as release assets.

### Windows (`windows-latest`, x86_64)

1. Install ONNX Runtime 1.18.0 Windows-x64 release zip; set
   `ORT_DYLIB_PATH` to the extracted `onnxruntime.dll` (`ort`'s
   `copy-dylibs` feature copies it next to the built `.exe`).
2. `cargo build --release --features production` (works once the jemalloc
   fix lands).
3. `.msi` via WiX Toolset v4 (`dotnet tool install --global wix`): a
   `wix/main.wxs` authored to install the `.exe`, `onnxruntime.dll`, and
   `config.toml` into `Program Files\Torch Inference Server\`, with a Start
   Menu shortcut.
4. Upload the `.msi` as a release asset.

## Release workflow shape

```yaml
name: release
on:
  push:
    tags: ["v*.*.*"]
  workflow_dispatch: {}

jobs:
  build-macos: ...   # steps above, produces torch-inference-server-<version>-macos-arm64.dmg
  build-linux: ...   # produces .deb and .AppImage
  build-windows: ...  # produces .msi
  publish:
    needs: [build-macos, build-linux, build-windows]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
      - uses: softprops/action-gh-release@v2
        with:
          files: <all packaged artifacts>
          generate_release_notes: true
```

Each build job uploads its packaged artifact via `actions/upload-artifact`;
the `publish` job downloads all of them and creates the GitHub Release with
`softprops/action-gh-release`, using the pushed tag as the release name and
auto-generated release notes (from merged PR titles since the previous
tag).

## First-run model guidance

None of the packages bundle model weights. Each package includes a short
`README-first-run.txt` (or, for the `.msi`, a post-install dialog note)
that says: *"Before starting the server, run `scripts/download_models.sh`
(bundled alongside the binary) to fetch the TTS/STT model files, or point
`config.toml`'s `[models] cache_dir` at an existing model directory."* The
`.deb`/`.AppImage`/`.dmg`/`.msi` all ship `scripts/download_models.sh`
(and, for Windows, a `.ps1` equivalent — see Task list) next to the binary.

## Testing strategy

- The jemalloc Cargo.toml fix is verified by a Windows CI job actually
  compiling `--features production` on `windows-latest` — this can run as
  part of the new release workflow's Windows build job even on
  `workflow_dispatch`, without needing a real tag push.
- Packaging steps are shell-script-driven and are verified by running the
  release workflow via `workflow_dispatch` on a branch before ever pushing
  a real version tag. This spec's implementation does not include actually
  triggering that dispatch or pushing a tag — that is the maintainer's
  explicit follow-up action once this lands.
- No new Rust unit tests are needed (this is packaging/CI, not application
  code) beyond the existing suite continuing to pass after the Cargo.toml
  dependency-table change (`cargo test --features production` on macOS/
  Linux, which already run in CI, plus manually confirming `cargo check
  --features production --target x86_64-pc-windows-msvc` — via `cross` or
  the actual Windows CI job — no longer tries to build jemalloc).

## Follow-ups (explicitly deferred)

- Code signing & notarization (macOS) / Authenticode signing (Windows) —
  needs paid certificates, out of scope for the first release.
- Auto-update mechanism.
- Homebrew tap / winget / apt repository distribution (currently: direct
  GitHub Release download only).
