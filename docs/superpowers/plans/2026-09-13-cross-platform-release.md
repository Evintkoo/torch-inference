# Cross-Platform Release (macOS / Linux / Windows Installers) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the CI/packaging pipeline that produces native installers (macOS `.dmg`, Linux `.deb` + `.AppImage`, Windows `.msi`) for the Torch Inference server, published to GitHub Releases on a version-tag push — without actually cutting or pushing that tag as part of this plan.

**Architecture:** A new `.github/workflows/release.yml` with three per-OS build jobs (each installs the platform's ONNX Runtime release, runs `cargo build --release --features production`, then packages the binary with a platform-native tool) feeding a `publish` job that uploads all artifacts to a GitHub Release. A Cargo.toml dependency-table fix makes the Windows build possible at all (jemalloc doesn't build on MSVC). No model weights are bundled; each package ships the existing model-download script (plus a new PowerShell port for Windows) and a first-run note.

**Tech Stack:** GitHub Actions, Cargo/Rust, `hdiutil` (macOS DMG), `cargo-deb` + `linuxdeploy` (Linux), WiX Toolset v4 (Windows MSI), Bash + PowerShell.

**Spec:** `docs/superpowers/specs/2026-09-13-cross-platform-release-design.md`

## Global Constraints

- Trigger for the real workflow: push of tag `v*.*.*`, plus `workflow_dispatch` for dry-run testing without a real tag.
- Rust toolchain: stable (matches `.github/workflows/ci.yml`).
- Build command per OS: `cargo build --release --features production` — must work unchanged on all three OSes after Task 1's fix.
- ONNX Runtime version: `1.18.0` on every OS (matches the existing Linux CI pin).
- No model files (`.onnx`, `.bin`, `.pt`, vocab/tokenizer files) are ever bundled into any release artifact.
- Release artifact naming: `torch-inference-server-<version>-<os>-<arch>.<ext>`.
- This plan does not push a git tag, does not trigger a real release, and does not run `gh release create`. Its Windows-build verification runs via `workflow_dispatch`, which produces no GitHub Release.
- Local verification tools available and expected to be used: `shellcheck`, `actionlint`, `xmllint`, `bash -n`. `pwsh` is not available locally — the PowerShell script's only functional verification is the Windows CI job itself (Task 6); keep its syntax deliberately simple (no here-strings, no advanced parameter binding) to minimize risk.

---

### Task 1: License file and Windows jemalloc build fix

**Files:**
- Create: `LICENSE`
- Modify: `Cargo.toml`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `Cargo.toml`'s `production` feature set now builds cleanly on `x86_64-pc-windows-msvc` (tikv-jemallocator absent from that target's dependency graph). Later tasks (6) rely on this to run `cargo build --release --features production` on `windows-latest`.

- [ ] **Step 1: Create the LICENSE file**

Create `LICENSE` at the repo root with the standard Apache License 2.0 text:

```
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing
      the origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   Copyright 2026 Evint Leovonzko

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

- [ ] **Step 2: Add the `license` field to Cargo.toml**

In `Cargo.toml`, in the `[package]` section, add a `license` line right after `description`:

```toml
[package]
name = "torch_inference"
version = "1.0.0"
edition = "2021"
description = "High-performance PyTorch inference framework in Rust"
license = "Apache-2.0"
authors = ["Genta Dev Team"]
default-run = "torch-inference-server"
```

- [ ] **Step 3: Move `tikv-jemallocator` to a target-conditional dependency table**

In `Cargo.toml`, find this line in the main `[dependencies]` table:

```toml
tikv-jemallocator = { version = "0.5", optional = true }
```

Delete it from `[dependencies]`, and add a new section immediately after the `[dependencies]` table ends (before `[dev-dependencies]` or `[features]`, whichever comes first in the file):

```toml
# jemalloc does not build on MSVC — excluded from the dependency graph
# entirely on that target so `cargo build --features production` succeeds
# on Windows. src/main.rs already gates *use* of the allocator with the
# matching `not(target_env = "msvc")` cfg; this just keeps Cargo from ever
# trying to compile the crate there.
[target.'cfg(not(target_env = "msvc"))'.dependencies]
tikv-jemallocator = { version = "0.5", optional = true }
```

- [ ] **Step 4: Verify the fix compiles locally**

Run: `cargo build --release --features production`
Expected: succeeds exactly as before (this platform is not MSVC, so behavior is unchanged — the dependency simply now lives in a different table).

Run: `grep -n "tikv-jemallocator" Cargo.toml`
Expected: exactly one occurrence, under the new `[target.'cfg(not(target_env = "msvc"))'.dependencies]` table, none under the plain `[dependencies]` table.

- [ ] **Step 5: Commit**

```bash
git add LICENSE Cargo.toml
git commit -m "build: add Apache-2.0 LICENSE, fix jemalloc dependency for Windows builds"
```

---

### Task 2: First-run note and Windows model-download script

**Files:**
- Create: `packaging/README-first-run.txt`
- Create: `packaging/windows/download_models.ps1`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `packaging/README-first-run.txt` and `packaging/windows/download_models.ps1`, both referenced by every per-OS packaging task (3, 4, 5) as files to bundle alongside the binary, and by the release workflow (Task 6).

- [ ] **Step 1: Write the first-run note**

Create `packaging/README-first-run.txt`:

```
Torch Inference Server — First Run
===================================

This package does not include any AI model files (they would make the
installer several gigabytes). Before starting the server:

1. Run the model-download script bundled next to the binary:
     macOS / Linux:  ./download_models.sh
     Windows:        .\download_models.ps1
   This fetches the Piper TTS and Whisper STT models automatically.

2. Some engines (Kokoro TTS, YOLO detection, image classification) need
   additional model files that are not auto-downloaded by that script.
   See the "Models" section of docs/QUICK_START.md in the project
   repository (https://github.com/Evintkoo/torch-inference) for how to
   obtain them, or fetch them at runtime via the server's own
   POST /yolo/download and similar model-management endpoints once it's
   running.

3. Edit config.toml (installed alongside the binary) to point
   [models] cache_dir at wherever you placed the model files, then start
   the server.

Full documentation: https://github.com/Evintkoo/torch-inference/tree/main/docs
```

- [ ] **Step 2: Port the model-download script to PowerShell**

Create `packaging/windows/download_models.ps1`. This mirrors
`scripts/download_models.sh`'s two downloads (Piper TTS, Whisper STT) —
kept deliberately simple (no advanced PowerShell features) since it can
only be verified by the Windows CI job in Task 6, not locally:

```powershell
# Download the Piper TTS and Whisper STT models for torch-inference server.
# Mirrors scripts/download_models.sh. Run from the directory containing
# this script (the installed package root).
#
# Models NOT covered here (obtain separately — see README-first-run.txt):
#   models\kokoro-82m\, models\yolo\yolov8n.onnx, models\classify\*.onnx

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RepoRoot

$HfBase = "https://huggingface.co"
$OpenAiWhisper = "https://openaipublic.azureedge.net/main/whisper/models"

Write-Host "=== Downloading Piper en_US-lessac-medium ONNX TTS ==="
New-Item -ItemType Directory -Force -Path "models\tts\piper_lessac" | Out-Null

$PiperModel = "models\tts\piper_lessac\model.onnx"
if (-not (Test-Path $PiperModel)) {
    Invoke-WebRequest -Uri "$HfBase/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx" -OutFile $PiperModel
    Write-Host "  OK model.onnx"
} else {
    Write-Host "  OK model.onnx (already present)"
}

$PiperConfig = "models\tts\piper_lessac\config.json"
if (-not (Test-Path $PiperConfig)) {
    Invoke-WebRequest -Uri "$HfBase/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json" -OutFile $PiperConfig
    Write-Host "  OK config.json"
} else {
    Write-Host "  OK config.json (already present)"
}

Write-Host ""
Write-Host "=== Downloading OpenAI Whisper base STT model ==="
New-Item -ItemType Directory -Force -Path "models\whisper" | Out-Null

$WhisperHash = "ed3a0b6b1c0edf879ad9b11b1af5a0e6ab5db9205f891f668f8b0e6c6326e34e"
$WhisperModel = "models\whisper\whisper-base.pt"
if (-not (Test-Path $WhisperModel)) {
    Invoke-WebRequest -Uri "$OpenAiWhisper/$WhisperHash/base.pt" -OutFile $WhisperModel
    Write-Host "  OK whisper-base.pt"
} else {
    Write-Host "  OK whisper-base.pt (already present)"
}

Write-Host ""
Write-Host "=== Creating stub engine directories ==="
foreach ($dir in @("models\vits", "models\styletts2", "models\xtts", "models\bark")) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Write-Host "  OK $dir\"
}

Write-Host ""
Write-Host "=== Done. Piper and Whisper models are ready. ==="
Write-Host "See README-first-run.txt for the remaining models (Kokoro, YOLO, classifier)."
```

- [ ] **Step 3: Verify**

Run: `cat packaging/README-first-run.txt` — confirm it reads cleanly, no
placeholder text.

There is no local PowerShell to syntax-check `download_models.ps1`
against — visually re-read it against `scripts/download_models.sh` and
confirm every download URL and destination path matches exactly (same
Hugging Face paths, same Whisper hash, same relative destination
directories with backslashes instead of forward slashes). This script's
first real execution is the Windows CI job added in Task 6.

- [ ] **Step 4: Commit**

```bash
git add packaging/README-first-run.txt packaging/windows/download_models.ps1
git commit -m "build: add first-run note and Windows model-download script for release packages"
```

---

### Task 3: macOS packaging (.app bundle + .dmg)

**Files:**
- Create: `packaging/macos/Info.plist`
- Create: `packaging/macos/build-dmg.sh`

**Interfaces:**
- Consumes: nothing from earlier tasks directly, but the release workflow (Task 6) invokes `build-dmg.sh` after building the binary, and copies `packaging/README-first-run.txt` (Task 2) plus `scripts/download_models.sh` (pre-existing) into the bundle.
- Produces: `build-dmg.sh <version>` — given the built binary at
  `target/release/torch-inference-server`, `libonnxruntime.dylib` next to
  it (via `ort`'s `copy-dylibs` feature), and `config.toml` in the repo
  root, produces `torch-inference-server-<version>-macos-arm64.dmg` in the
  current directory. This exact invocation contract is what Task 6's
  macOS job calls.

- [ ] **Step 1: Write Info.plist**

Create `packaging/macos/Info.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>Torch Inference Server</string>
    <key>CFBundleDisplayName</key>
    <string>Torch Inference Server</string>
    <key>CFBundleIdentifier</key>
    <string>com.evintkoo.torch-inference-server</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleExecutable</key>
    <string>torch-inference-server</string>
    <key>LSMinimumSystemVersion</key>
    <string>13.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
```

- [ ] **Step 2: Write the DMG build script**

Create `packaging/macos/build-dmg.sh`:

```bash
#!/usr/bin/env bash
# Assemble the .app bundle and package it as a .dmg.
# Usage: build-dmg.sh <version>
# Expects to run from the repo root, with:
#   target/release/torch-inference-server   (built binary)
#   target/release/libonnxruntime.dylib     (copied by ort's copy-dylibs feature)
#   config.toml, scripts/download_models.sh, packaging/README-first-run.txt

set -euo pipefail

VERSION="${1:?usage: build-dmg.sh <version>}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${REPO_ROOT}"

APP_NAME="Torch Inference Server.app"
STAGE_DIR="$(mktemp -d)"
APP_DIR="${STAGE_DIR}/${APP_NAME}"

mkdir -p "${APP_DIR}/Contents/MacOS" "${APP_DIR}/Contents/Resources"

cp packaging/macos/Info.plist "${APP_DIR}/Contents/Info.plist"
cp target/release/torch-inference-server "${APP_DIR}/Contents/MacOS/torch-inference-server"
chmod +x "${APP_DIR}/Contents/MacOS/torch-inference-server"

if [[ -f target/release/libonnxruntime.dylib ]]; then
  cp target/release/libonnxruntime.dylib "${APP_DIR}/Contents/Resources/libonnxruntime.dylib"
fi

cp config.toml "${APP_DIR}/Contents/Resources/config.toml"
cp scripts/download_models.sh "${APP_DIR}/Contents/Resources/download_models.sh"
chmod +x "${APP_DIR}/Contents/Resources/download_models.sh"
cp packaging/README-first-run.txt "${APP_DIR}/Contents/Resources/README-first-run.txt"

OUTPUT="torch-inference-server-${VERSION}-macos-arm64.dmg"
rm -f "${OUTPUT}"
hdiutil create -volname "Torch Inference Server" \
  -srcfolder "${STAGE_DIR}" \
  -ov -format UDZO \
  "${OUTPUT}"

rm -rf "${STAGE_DIR}"
echo "Built ${OUTPUT}"
```

- [ ] **Step 3: Verify**

Run: `xmllint --noout packaging/macos/Info.plist`
Expected: no output, exit code 0 (well-formed XML).

Run: `bash -n packaging/macos/build-dmg.sh && shellcheck packaging/macos/build-dmg.sh`
Expected: `bash -n` prints nothing (syntax OK); `shellcheck` reports no
warnings (fix any it finds — e.g. unquoted variables — before proceeding).

Run (this machine is macOS, so this is a real functional check —
requires a release build to exist first; if `target/release/torch-inference-server`
isn't already built, run `cargo build --release --features production` first):
```bash
chmod +x packaging/macos/build-dmg.sh
./packaging/macos/build-dmg.sh 1.0.0-test
```
Expected: `torch-inference-server-1.0.0-test-macos-arm64.dmg` is created in
the repo root with no errors. Mount it (`open torch-inference-server-1.0.0-test-macos-arm64.dmg`)
and confirm `Torch Inference Server.app` is present and contains the
binary, config.toml, download_models.sh, and README-first-run.txt under
`Contents/Resources` and `Contents/MacOS`. Then unmount and delete the
test `.dmg` — it's a local verification artifact, not something to commit.

- [ ] **Step 4: Commit**

```bash
git add packaging/macos/Info.plist packaging/macos/build-dmg.sh
git commit -m "build: add macOS .app/.dmg packaging"
```

---

### Task 4: Linux packaging (.deb + .AppImage)

**Files:**
- Modify: `Cargo.toml`
- Create: `packaging/linux/build-appimage.sh`

**Interfaces:**
- Consumes: nothing from earlier tasks directly.
- Produces: a `[package.metadata.deb]` section consumed by `cargo deb`
  (invoked directly in Task 6, no wrapper script needed since `cargo-deb`
  is itself the CLI). `build-appimage.sh <version>` — given the built
  binary and `ORT_DYLIB_PATH` pointing at `libonnxruntime.so`, produces
  `torch-inference-server-<version>-linux-x86_64.AppImage` in the current
  directory. This exact invocation contract is what Task 6's Linux job
  calls.

- [ ] **Step 1: Add Debian packaging metadata to Cargo.toml**

Add this section to `Cargo.toml`, after the `[package]` table:

```toml
[package.metadata.deb]
maintainer = "Evint Leovonzko <evint.koo@gmail.com>"
copyright = "2026, Evint Leovonzko"
license-file = ["LICENSE", "4"]
extended-description = """\
High-performance multimodal inference server (TTS, STT, image \
classification, object detection, LLM chat) built in Rust."""
depends = "$auto"
section = "utility"
priority = "optional"
assets = [
    ["target/release/torch-inference-server", "usr/bin/", "755"],
    ["config.toml", "usr/share/torch-inference-server/config.toml", "644"],
    ["scripts/download_models.sh", "usr/share/torch-inference-server/download_models.sh", "755"],
    ["packaging/README-first-run.txt", "usr/share/doc/torch-inference-server/README-first-run.txt", "644"],
]
```

(`license-file = ["LICENSE", "4"]` tells `cargo-deb` to include the first
4 lines of `LICENSE` in the package's copyright metadata — standard
`cargo-deb` convention; the full `LICENSE` file from Task 1 must exist
before this runs.)

- [ ] **Step 2: Write the AppImage build script**

Create `packaging/linux/build-appimage.sh`:

```bash
#!/usr/bin/env bash
# Assemble an AppDir and package it as an AppImage.
# Usage: build-appimage.sh <version>
# Expects: target/release/torch-inference-server built, ORT_DYLIB_PATH set
# to the libonnxruntime.so used for the build, and `linuxdeploy` +
# `linuxdeploy-plugin-appimage` on PATH (installed by the calling CI job).

set -euo pipefail

VERSION="${1:?usage: build-appimage.sh <version>}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${REPO_ROOT}"

APPDIR="$(mktemp -d)/AppDir"
mkdir -p "${APPDIR}/usr/bin" "${APPDIR}/usr/lib" "${APPDIR}/usr/share/applications" "${APPDIR}/usr/share/icons/hicolor/256x256/apps"

cp target/release/torch-inference-server "${APPDIR}/usr/bin/torch-inference-server"
chmod +x "${APPDIR}/usr/bin/torch-inference-server"

if [[ -n "${ORT_DYLIB_PATH:-}" && -f "${ORT_DYLIB_PATH}" ]]; then
  cp "${ORT_DYLIB_PATH}" "${APPDIR}/usr/lib/libonnxruntime.so"
fi

cp config.toml "${APPDIR}/usr/bin/config.toml"
cp scripts/download_models.sh "${APPDIR}/usr/bin/download_models.sh"
chmod +x "${APPDIR}/usr/bin/download_models.sh"
cp packaging/README-first-run.txt "${APPDIR}/usr/bin/README-first-run.txt"

cat > "${APPDIR}/usr/share/applications/torch-inference-server.desktop" <<'EOF'
[Desktop Entry]
Type=Application
Name=Torch Inference Server
Exec=torch-inference-server
Icon=torch-inference-server
Categories=Utility;
Terminal=true
EOF

# linuxdeploy requires an icon to exist even for a headless server app;
# a 1x1 transparent PNG satisfies the requirement without needing real art.
python3 -c "
import base64
png = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=')
open('${APPDIR}/usr/share/icons/hicolor/256x256/apps/torch-inference-server.png', 'wb').write(png)
"
cp "${APPDIR}/usr/share/icons/hicolor/256x256/apps/torch-inference-server.png" "${APPDIR}/torch-inference-server.png"
cp "${APPDIR}/usr/share/applications/torch-inference-server.desktop" "${APPDIR}/torch-inference-server.desktop"

OUTPUT="torch-inference-server-${VERSION}-linux-x86_64.AppImage"
rm -f "${OUTPUT}"
OUTPUT="${OUTPUT}" linuxdeploy --appdir "${APPDIR}" --output appimage

mv torch-inference-server*.AppImage "${OUTPUT}" 2>/dev/null || true
echo "Built ${OUTPUT}"
```

- [ ] **Step 3: Verify**

Run: `grep -n "package.metadata.deb" Cargo.toml`
Expected: one match, section present with all fields from Step 1.

Run: `bash -n packaging/linux/build-appimage.sh && shellcheck packaging/linux/build-appimage.sh`
Expected: `bash -n` prints nothing; fix any `shellcheck` warnings.

Run: `cargo metadata --no-deps --format-version 1 | python3 -c "import json,sys; json.load(sys.stdin)"`
Expected: exits 0 — confirms the added TOML section didn't break
`Cargo.toml` parsing (this is the cheapest available local check;
`cargo-deb` itself isn't installed locally and its actual packaging run
is verified in the Linux CI job in Task 6).

- [ ] **Step 4: Commit**

```bash
git add Cargo.toml packaging/linux/build-appimage.sh
git commit -m "build: add Linux .deb metadata and AppImage packaging script"
```

---

### Task 5: Windows packaging (.msi via WiX)

**Files:**
- Create: `packaging/windows/main.wxs`

**Interfaces:**
- Consumes: nothing from earlier tasks directly.
- Produces: a WiX v4 source file consumed directly by `wix build` in
  Task 6's Windows job, given the built `torch-inference-server.exe`,
  `onnxruntime.dll`, `config.toml`, `scripts/download_models.sh`,
  `packaging/windows/download_models.ps1` (Task 2), and
  `packaging/README-first-run.txt` (Task 2) all staged in one directory
  passed via the `SourceDir` preprocessor variable.

- [ ] **Step 1: Write the WiX source**

Create `packaging/windows/main.wxs`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://wixtoolset.org/schemas/v4/wxs">
  <Package Name="Torch Inference Server"
           Manufacturer="Evint Leovonzko"
           Version="1.0.0"
           UpgradeCode="8f2b1e6c-9c1a-4a1e-9b5a-6f2c4a2e8b1d">

    <MajorUpgrade DowngradeErrorMessage="A newer version of Torch Inference Server is already installed." />
    <MediaTemplate EmbedCab="yes" />

    <StandardDirectory Id="ProgramFiles64Folder">
      <Directory Id="INSTALLFOLDER" Name="Torch Inference Server">
        <Component Id="ServerBinary" Guid="*">
          <File Id="ServerExe" Source="$(var.SourceDir)\torch-inference-server.exe" KeyPath="yes" />
        </Component>
        <Component Id="OrtDll" Guid="*">
          <File Id="OnnxRuntimeDll" Source="$(var.SourceDir)\onnxruntime.dll" KeyPath="yes" />
        </Component>
        <Component Id="ConfigFile" Guid="*">
          <File Id="ConfigToml" Source="$(var.SourceDir)\config.toml" KeyPath="yes" />
        </Component>
        <Component Id="DownloadScriptSh" Guid="*">
          <File Id="DownloadModelsSh" Source="$(var.SourceDir)\download_models.sh" KeyPath="yes" />
        </Component>
        <Component Id="DownloadScriptPs1" Guid="*">
          <File Id="DownloadModelsPs1" Source="$(var.SourceDir)\download_models.ps1" KeyPath="yes" />
        </Component>
        <Component Id="ReadmeFirstRun" Guid="*">
          <File Id="ReadmeFirstRunTxt" Source="$(var.SourceDir)\README-first-run.txt" KeyPath="yes" />
        </Component>
      </Directory>
    </StandardDirectory>

    <StandardDirectory Id="ProgramMenuFolder">
      <Component Id="StartMenuShortcut" Guid="*">
        <Shortcut Id="ServerShortcut"
                  Name="Torch Inference Server"
                  Target="[INSTALLFOLDER]torch-inference-server.exe"
                  WorkingDirectory="INSTALLFOLDER" />
        <RemoveFolder Id="RemoveStartMenuShortcut" On="uninstall" />
        <RegistryValue Root="HKCU"
                        Key="Software\TorchInferenceServer"
                        Name="installed"
                        Type="integer"
                        Value="1"
                        KeyPath="yes" />
      </Component>
    </StandardDirectory>

    <Feature Id="MainFeature" Title="Torch Inference Server" Level="1">
      <ComponentRef Id="ServerBinary" />
      <ComponentRef Id="OrtDll" />
      <ComponentRef Id="ConfigFile" />
      <ComponentRef Id="DownloadScriptSh" />
      <ComponentRef Id="DownloadScriptPs1" />
      <ComponentRef Id="ReadmeFirstRun" />
      <ComponentRef Id="StartMenuShortcut" />
    </Feature>
  </Package>
</Wix>
```

- [ ] **Step 2: Verify**

Run: `xmllint --noout packaging/windows/main.wxs`
Expected: no output, exit code 0 (well-formed XML). This is the only
local check available — WiX itself is Windows-only tooling and this
file's actual `wix build` run is verified in the Windows CI job in
Task 6.

- [ ] **Step 3: Commit**

```bash
git add packaging/windows/main.wxs
git commit -m "build: add WiX source for Windows .msi packaging"
```

---

### Task 6: Release workflow

**Files:**
- Create: `.github/workflows/release.yml`

**Interfaces:**
- Consumes: `LICENSE`/Cargo.toml jemalloc fix (Task 1), `packaging/README-first-run.txt` and `packaging/windows/download_models.ps1` (Task 2), `packaging/macos/build-dmg.sh` (Task 3), `Cargo.toml`'s `[package.metadata.deb]` and `packaging/linux/build-appimage.sh` (Task 4), `packaging/windows/main.wxs` (Task 5).
- Produces: the complete release pipeline. Nothing later depends on this — it's the final task.

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/release.yml`:

```yaml
name: release

on:
  push:
    tags: ["v*.*.*"]
  workflow_dispatch: {}

env:
  CARGO_TERM_COLOR: always
  ORT_VERSION: "1.18.0"

jobs:
  version:
    name: resolve version
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.v.outputs.version }}
    steps:
      - id: v
        run: |
          if [[ "${GITHUB_REF}" == refs/tags/v* ]]; then
            echo "version=${GITHUB_REF#refs/tags/v}" >> "$GITHUB_OUTPUT"
          else
            echo "version=0.0.0-dispatch" >> "$GITHUB_OUTPUT"
          fi

  build-macos:
    name: build macOS .dmg
    needs: version
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - uses: Swatinem/rust-cache@v2
      - name: install onnxruntime
        run: |
          curl -fsSL "https://github.com/microsoft/onnxruntime/releases/download/v${ORT_VERSION}/onnxruntime-osx-arm64-${ORT_VERSION}.tgz" -o ort.tgz
          sudo mkdir -p /usr/local/lib
          sudo tar -xzf ort.tgz -C /usr/local/lib --strip-components=1
          echo "ORT_DYLIB_PATH=/usr/local/lib/lib/libonnxruntime.dylib" >> "$GITHUB_ENV"
      - run: cargo build --release --features production
      - name: package .dmg
        run: |
          chmod +x packaging/macos/build-dmg.sh
          ./packaging/macos/build-dmg.sh "${{ needs.version.outputs.version }}"
      - uses: actions/upload-artifact@v4
        with:
          name: macos-dmg
          path: torch-inference-server-*-macos-arm64.dmg

  build-linux:
    name: build Linux .deb + .AppImage
    needs: version
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - uses: Swatinem/rust-cache@v2
      - name: install onnxruntime
        run: |
          curl -fsSL "https://github.com/microsoft/onnxruntime/releases/download/v${ORT_VERSION}/onnxruntime-linux-x64-${ORT_VERSION}.tgz" -o ort.tgz
          sudo tar -xzf ort.tgz -C /usr/local/lib --strip-components=1
          sudo ldconfig
          echo "ORT_DYLIB_PATH=/usr/local/lib/lib/libonnxruntime.so" >> "$GITHUB_ENV"
      - run: cargo build --release --features production
      - name: build .deb
        run: |
          cargo install cargo-deb --locked
          cargo deb --no-build --no-strip
          mv target/debian/*.deb "torch-inference-server-${{ needs.version.outputs.version }}-linux-x86_64.deb"
      - name: build .AppImage
        run: |
          curl -fsSL -o /usr/local/bin/linuxdeploy https://github.com/linuxdeploy/linuxdeploy/releases/download/continuous/linuxdeploy-x86_64.AppImage
          chmod +x /usr/local/bin/linuxdeploy
          curl -fsSL -o /usr/local/bin/linuxdeploy-plugin-appimage https://github.com/linuxdeploy/linuxdeploy-plugin-appimage/releases/download/continuous/linuxdeploy-plugin-appimage-x86_64.AppImage
          chmod +x /usr/local/bin/linuxdeploy-plugin-appimage
          chmod +x packaging/linux/build-appimage.sh
          ./packaging/linux/build-appimage.sh "${{ needs.version.outputs.version }}"
      - uses: actions/upload-artifact@v4
        with:
          name: linux-packages
          path: |
            torch-inference-server-*-linux-x86_64.deb
            torch-inference-server-*-linux-x86_64.AppImage

  build-windows:
    name: build Windows .msi
    needs: version
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - uses: Swatinem/rust-cache@v2
      - name: install onnxruntime
        shell: bash
        run: |
          curl -fsSL "https://github.com/microsoft/onnxruntime/releases/download/v${ORT_VERSION}/onnxruntime-win-x64-${ORT_VERSION}.zip" -o ort.zip
          unzip -q ort.zip
          mkdir -p "$RUNNER_TEMP/ort"
          cp onnxruntime-win-x64-${ORT_VERSION}/lib/onnxruntime.dll "$RUNNER_TEMP/ort/"
          echo "ORT_DYLIB_PATH=$RUNNER_TEMP/ort/onnxruntime.dll" >> "$GITHUB_ENV"
      - run: cargo build --release --features production
      - name: stage package contents
        shell: bash
        run: |
          mkdir -p stage
          cp target/release/torch-inference-server.exe stage/
          cp target/release/onnxruntime.dll stage/
          cp config.toml stage/
          cp scripts/download_models.sh stage/
          cp packaging/windows/download_models.ps1 stage/
          cp packaging/README-first-run.txt stage/
      - name: build .msi
        shell: pwsh
        run: |
          dotnet tool install --global wix
          wix build packaging/windows/main.wxs -d SourceDir=stage -out "torch-inference-server-${{ needs.version.outputs.version }}-windows-x86_64.msi"
      - uses: actions/upload-artifact@v4
        with:
          name: windows-msi
          path: torch-inference-server-*-windows-x86_64.msi

  publish:
    name: publish GitHub release
    if: startsWith(github.ref, 'refs/tags/v')
    needs: [version, build-macos, build-linux, build-windows]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          path: dist
          merge-multiple: true
      - uses: softprops/action-gh-release@v2
        with:
          files: dist/*
          generate_release_notes: true
```

- [ ] **Step 2: Verify**

Run: `actionlint .github/workflows/release.yml`
Expected: no errors reported (warnings about unpinned action versions
matching the style already used in `ci.yml` are acceptable — fix
anything that isn't already an accepted pattern there).

Run: `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/release.yml'))" 2>&1 || python3 -c "import yaml" 2>&1`
If `pyyaml` isn't installed, this step's YAML-well-formedness is already
covered by `actionlint` above — skip.

Cross-check job outputs manually against each task's script contract:
`build-macos` calls `./packaging/macos/build-dmg.sh "<version>"` — matches
Task 3's documented invocation. `build-linux` calls `cargo deb` (reads
`[package.metadata.deb]` from Task 4) and `./packaging/linux/build-appimage.sh
"<version>"` — matches Task 4's contract, with `ORT_DYLIB_PATH` exported
before the call as the script requires. `build-windows` stages exactly the
6 files `packaging/windows/main.wxs` (Task 5) expects under `SourceDir`
(`torch-inference-server.exe`, `onnxruntime.dll`, `config.toml`,
`download_models.sh`, `download_models.ps1`, `README-first-run.txt`) —
confirm the staged filenames match the `Source="$(var.SourceDir)\...\"`
paths in `main.wxs` exactly.

- [ ] **Step 3: Dry-run via workflow_dispatch (does not create a release)**

This step requires pushing the worktree branch to the remote so GitHub
Actions can see the workflow file, then triggering it manually — this is
a visible, remote action. Do not do this automatically; hand it back:
after this task's commit, tell the user the workflow is ready to
dry-run via `gh workflow run release.yml` (or the Actions tab's "Run
workflow" button) once the branch is pushed, and that doing so is their
call, not an automatic part of this plan (per the Global Constraints: no
tag push, no real release, from this plan).

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci: add cross-platform release workflow (macOS .dmg, Linux .deb+AppImage, Windows .msi)"
```
