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
trap 'rm -rf "$(dirname "${APPDIR}")"' EXIT
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

if [[ ! -f "${OUTPUT}" ]]; then
  echo "ERROR: expected AppImage '${OUTPUT}' was not produced (check linuxdeploy-plugin-appimage's output-naming env var, e.g. OUTPUT vs LDAI_OUTPUT)" >&2
  exit 1
fi

echo "Built ${OUTPUT}"
