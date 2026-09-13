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
trap 'rm -rf "${STAGE_DIR}"' EXIT
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

echo "Built ${OUTPUT}"
