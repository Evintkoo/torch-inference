#!/usr/bin/env bash
set -euo pipefail

# Downloads SmolVLM-256M-Instruct's officially pre-exported ONNX artifacts
# directly from Hugging Face — HuggingFaceTB publishes onnx/*_int8.onnx
# (and other quantizations) in the model repo itself, so no local
# optimum/Python export pipeline is needed.

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
