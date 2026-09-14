#!/usr/bin/env bash
set -euo pipefail

# Downloads SmolVLM-256M-Instruct's officially pre-exported ONNX artifacts
# directly from Hugging Face — HuggingFaceTB publishes onnx/*_int8.onnx
# (and other quantizations) in the model repo itself, so no local
# optimum/Python export pipeline is needed.
#
# NOTE: running the LLM service with `[engine] kind = "smolvlm"` requires
# ONNX Runtime >= 1.25 (the decoder graph uses GroupQueryAttention's
# "softcap" attribute, added in ORT 1.25.0). If the system/Homebrew ORT is
# older, you'll hit an opaque "Unrecognized attribute: softcap" error at
# load time. To use a newer ORT without touching the system install,
# download a prebuilt release (e.g. the onnxruntime-osx-arm64-<version>.tgz
# asset for macOS ARM64 from https://github.com/microsoft/onnxruntime/releases)
# into a local directory (e.g. services/llm/vendor/, which is gitignored)
# and set ORT_DYLIB_PATH=/path/to/libonnxruntime.dylib when launching
# llm-service.

OUT_DIR="services/llm/models/smolvlm-256m"
BASE="https://huggingface.co/HuggingFaceTB/SmolVLM-256M-Instruct/resolve/main"

FILES=(
  "onnx/vision_encoder_int8.onnx:vision_encoder_int8.onnx"
  "onnx/embed_tokens_int8.onnx:embed_tokens_int8.onnx"
  "onnx/decoder_model_merged_int8.onnx:decoder_model_merged_int8.onnx"
  "tokenizer.json:tokenizer.json"
  "tokenizer_config.json:tokenizer_config.json"
  "preprocessor_config.json:preprocessor_config.json"
  "config.json:config.json"
)

if [ -f "${OUT_DIR}/decoder_model_merged_int8.onnx" ]; then
    echo "Artifacts already present at ${OUT_DIR}/. Delete to re-download."
    exit 0
fi

mkdir -p "${OUT_DIR}"
for entry in "${FILES[@]}"; do
    src="${entry%%:*}"
    dst="${entry##*:}"
    echo "Downloading ${src}..."
    curl -sL --fail --progress-bar -o "${OUT_DIR}/${dst}" "${BASE}/${src}"
done
echo "Done. Artifacts at ${OUT_DIR}/"
