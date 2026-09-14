# SmolVLM-256M-Instruct as a Second, Toggleable LLM Engine — Design Spec

**Date:** 2026-09-14
**Status:** Approved

## 1. Goal & non-goals

### Goal

Add `HuggingFaceTB/SmolVLM-256M-Instruct` as a second engine option in
`services/llm`, selectable via a `config.toml` toggle, for fast local
testing of the chat pipeline without paying HRM-Text-1B's load time /
memory footprint. Native image understanding (not the caption-bridge
HRM uses) is in scope, since the whole point of testing against a real
VLM is exercising that path.

### Non-goals

- Not replacing HRM-Text-1B. Both engines stay in the codebase; exactly
  one loads per process, chosen at startup.
- Not implementing SmolVLM's multi-tile "image splitting" (large images
  get cropped into several sub-images + a thumbnail for extra detail).
  Single-image mode (`do_image_splitting=false`, a real, documented
  mode of the official processor — not a workaround) is the v1 scope.
  Tiling is a follow-up if accuracy on complex images matters later.
- Not adding a Python/optimum export pipeline. `HuggingFaceTB/SmolVLM-256M-Instruct`
  already publishes ready-to-run ONNX files (including int8 quantized
  variants) at `onnx/` in its HF repo — those are downloaded as-is.
- Not changing the OpenAI-compatible API surface, the SSE streaming
  shape, `EngineLease`, or `MemoryGate` — those stay engine-agnostic.

### Constraints

- Must not disturb `hrm-text-1b` when `[engine] kind = "hrm"` (default,
  so existing deployments/configs need zero changes).
- Must reuse the sampling code already in `HrmEngine::sample`
  (temperature + top-k 40 + top-p 0.95 nucleus) rather than duplicating
  it, so both engines behave consistently under the same request params.
- Model weights are never committed (`services/llm/models/*` is
  gitignored already, matching `hrm-text-1b/`).

## 2. Architecture changes

### Before

```
AppState { engine: Arc<HrmEngine>, vision: Option<Arc<VisionBridge>>, ... }
handler.rs: image present? → vision.describe(img) → text caption
                              prepended to prompt → engine.infer_text(prompt, ...)
```

`HrmEngine` is the only engine type. Vision always goes through the
caption bridge (classify+detect on the main server), never touches the
LLM engine directly.

### After

```
trait LlmEngine: Send + Sync {
    fn infer(&self, prompt: String, image: Option<Vec<u8>>, max_tokens: u32,
              temperature: f32, tx: mpsc::Sender<String>) -> anyhow::Result<()>;
    fn supports_vision(&self) -> bool;
    fn model_id(&self) -> &str;
}

impl LlmEngine for HrmEngine     { supports_vision() -> false; image param ignored }
impl LlmEngine for SmolVlmEngine { supports_vision() -> true;  image runs through
                                     the vision encoder and gets fused into the
                                     decoder's input embeddings }

AppState { engine: Arc<dyn LlmEngine>, vision: Option<Arc<VisionBridge>>, ... }
```

`handler.rs`'s image branch becomes:

```rust
if let Some(img) = image_bytes {
    if state.engine.supports_vision() {
        // pass raw bytes straight to the engine — no caption step
    } else {
        // existing vision_bridge.describe() caption-then-text path
    }
}
```

`vision_bridge` config/wiring is untouched — it's still used whenever
the active engine doesn't support vision natively (i.e. HRM).

### Config toggle

```toml
[engine]
kind = "hrm"        # "hrm" | "smolvlm" — default "hrm" if section absent

[hrm]
model_dir = "models/hrm-text-1b"
# ... unchanged

[smolvlm]
model_dir = "models/smolvlm-256m"
ep_preference = "auto"    # same semantics as HrmConfig.ep_preference
stub = false               # same echo-mode escape hatch as HrmConfig.stub
```

`main.rs` reads `llm_config.engine.kind` (defaulting to `"hrm"` when the
`[engine]` section is absent), and only requires/loads the config
section for the chosen engine — `[hrm]` stays mandatory-if-selected
exactly as it is today, `[smolvlm]` becomes mandatory only when
`kind = "smolvlm"`.

## 3. Model files (no export step)

`HuggingFaceTB/SmolVLM-256M-Instruct` ships pre-exported ONNX directly:

| File | Purpose | int8 size |
|---|---|---|
| `onnx/vision_encoder_int8.onnx` | SigLIP vision tower → patch embeddings | 94 MB |
| `onnx/embed_tokens_int8.onnx` | token id → text embedding lookup | 28 MB |
| `onnx/decoder_model_merged_int8.onnx` | SmolLM2 decoder, merged prefill+decode KV-cache graph | 137 MB |

Plus `tokenizer.json`, `tokenizer_config.json` (chat template, special
token ids), and `preprocessor_config.json` (SigLIP resize/normalize
stats), all from the same HF repo.

Total download ≈ 260 MB of weights + a few KB of config — versus
HRM-Text-1B's much larger footprint — which is the actual "lighter for
testing" win.

Layout, matching the `hrm-text-1b/` convention:

```
services/llm/models/smolvlm-256m/
├── vision_encoder_int8.onnx
├── embed_tokens_int8.onnx
├── decoder_model_merged_int8.onnx
├── tokenizer.json
├── tokenizer_config.json
└── preprocessor_config.json
```

A `scripts/download_smolvlm_model.sh` fetches these (mirrors whatever
pattern the existing HRM/kokoro download scripts use), and a
`make smolvlm-download` target wraps it.

## 4. Runtime engine (`services/llm/src/smolvlm_engine.rs`)

### Load

- Create one `ort::Session` per ONNX file (3 sessions: vision encoder,
  embed tokens, decoder), same `ort` crate / `ep_preference` /
  `load-dynamic` setup already used by `HrmEngine::load` — no new ORT
  wiring, just three sessions instead of one.
- Load `tokenizer.json` via the `tokenizers` crate (already a
  dependency), read `image_token_id` / special-token ids and the chat
  template from `tokenizer_config.json`.
- `stub: true` boots without touching ONNX/tokenizer files at all, same
  escape hatch `HrmConfig.stub` already provides — useful for testing
  the HTTP/agent plumbing without the model files present yet.

### Image preprocessing (single-image mode)

- Decode the incoming image bytes (existing `image` crate, already a
  transitive dependency via the main crate's image pipeline — confirm
  reachable from `services/llm`'s own `Cargo.toml` during
  implementation, add directly if not).
- Resize to the size in `preprocessor_config.json`, normalize with its
  mean/std (SigLIP defaults, typically 0.5/0.5 per channel — read from
  config, not hardcoded).
- Run through `vision_encoder_int8.onnx` → one set of patch embeddings
  for the whole image (no tiling/thumbnail split — `do_image_splitting
  = false` equivalent).

### Prefill (per-request)

1. Tokenize the ChatML-formatted prompt (reuse `handler.rs::build_prompt`,
   unchanged) into input ids, including the image placeholder token(s)
   at the position the chat template puts them.
2. `embed_tokens_int8.onnx`: input ids → text embeddings.
3. If an image was sent: splice the vision encoder's patch embeddings
   into the text embedding sequence at the placeholder token positions
   (index-based merge — the standard SmolVLM/Idefics3 approach).
4. Run `decoder_model_merged_int8.onnx` once over the full merged
   embedding sequence with no past state → first logits + initial KV
   cache tensors.

### Decode loop (per generated token)

- Sample via the shared `sample(logits, temperature, top_k=40, top_p=0.95)`
  helper (lifted out of `HrmEngine` into a small shared module, e.g.
  `sampling.rs`, so both engines call the same code instead of two
  copies).
- Feed the new token's embedding + the growing KV cache back into
  `decoder_model_merged_int8.onnx` for the next step.
- Stream each decoded token string through the `mpsc::Sender<String>`,
  identical to `HrmEngine::infer_text`'s streaming contract.
- Stop on the tokenizer's EOS/end-of-utterance id or `max_tokens`,
  matching `HrmEngine`'s existing stop conditions.

### Concurrency model

Unchanged — `EngineLease` still serializes ONNX runs process-wide
regardless of which engine is active, `MemoryGate` still admits/rejects
based on process RSS. Neither is SmolVLM-specific.

## 5. `list_models` / model identity

`list_models` currently hardcodes `hrm-text-1b`. It changes to report
whichever engine is actually loaded:

```rust
"data": [{
    "id": state.engine.model_id(),       // "hrm-text-1b" | "smolvlm-256m"
    "object": "model",
    "owned_by": "local",
    "multimodal": state.engine.supports_vision()
}]
```

Single active model per process (matches today's behavior and the
"config toggle" decision — no dual-load, no per-request model routing).

## 6. Error handling

| Scenario | Response |
|---|---|
| `kind = "smolvlm"` but `[smolvlm]` section missing | Log error, exit 1 at startup (mirrors today's `[hrm]`-missing exit path) |
| Any of the 3 ONNX files / tokenizer files missing | Log error, exit 1 at startup |
| Image sent to SmolVLM engine, decode fails | `400 {"error":"invalid image"}` (existing `extract_content` validation, unchanged) |
| Image sent, `supports_vision()` true, but preprocessing/vision-encoder run fails | `500 {"error":"inference failed: <msg>"}` (same shape HRM already returns on engine errors) |
| `stub = true` | Boots without loading models, echoes a canned response — same as `HrmConfig.stub` today |

## 7. Testing

- **Unit tests** in `smolvlm_engine.rs`, mirroring `hrm_engine.rs`'s
  existing style: embedding-splice index math, sampling determinism at
  `temperature = 0`, EOS stopping. Uses the `stub` mode so tests don't
  need the real ONNX files on disk.
- **Shared `sampling.rs` tests** moved/kept alongside the extracted
  helper, run against both engines' expected distributions.
- **Live smoke test** (manual `curl`, then a Playwright check against
  `/preview`'s Chat panel): set `kind = "smolvlm"`, restart
  `llm-service`, send one text-only `/v1/chat/completions` request and
  one with an attached image, confirm real (non-echo) responses from
  both, then flip `kind` back to `"hrm"` and confirm HRM still answers
  correctly — proving the toggle doesn't regress the default path.

## 8. Build & download

```bash
# Fetch SmolVLM weights (int8 ONNX + tokenizer/preprocessor config)
make smolvlm-download
# equivalent: bash scripts/download_smolvlm_model.sh

# Switch to it
#   edit services/llm/config.toml: [engine] kind = "smolvlm"
make run   # unchanged — spawns whichever engine config.toml selects
```

No other Makefile targets change; `make run`'s existing
build-then-spawn-microservice flow already works for either engine
since the choice is entirely inside `services/llm`'s own config.
