//! SmolVLM-256M-Instruct engine — a second, config-toggled `LlmEngine`
//! implementation for fast local testing (see
//! docs/superpowers/specs/2026-09-14-smolvlm-test-engine-design.md).

use anyhow::{Context, Result};
use ort::session::Session;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

use crate::config::SmolVlmConfig;
use crate::tokenizer::HrmTokenizer;

pub mod image_prep;
pub mod prompt;

pub const NUM_LAYERS: usize = 30;
pub const NUM_KV_HEADS: usize = 3;
pub const HEAD_DIM: usize = 64;
pub const HIDDEN_SIZE: usize = 576;
pub const EOS_TOKEN_STR: &str = "<end_of_utterance>";

#[derive(Debug)]
pub struct SmolVlmEngine {
    vision_session: Option<Arc<Mutex<Session>>>,
    embed_session: Option<Arc<Mutex<Session>>>,
    decoder_session: Option<Arc<Mutex<Session>>>,
    tokenizer: Option<HrmTokenizer>,
    image_token_id: u32,
    eos_token_id: u32,
    stub: bool,
}

unsafe impl Send for SmolVlmEngine {}
unsafe impl Sync for SmolVlmEngine {}

impl SmolVlmEngine {
    pub fn is_stub(&self) -> bool {
        self.stub
    }

    pub fn load(cfg: &SmolVlmConfig) -> Result<Self> {
        let model_dir = PathBuf::from(&cfg.model_dir);

        if cfg.stub.unwrap_or(false) {
            tracing::warn!("SmolVLM running in STUB mode — no weights loaded, canned responses only");
            return Ok(Self {
                vision_session: None,
                embed_session: None,
                decoder_session: None,
                tokenizer: None,
                image_token_id: 0,
                eos_token_id: 0,
                stub: true,
            });
        }

        let vision_path = model_dir.join("vision_encoder_int8.onnx");
        let embed_path = model_dir.join("embed_tokens_int8.onnx");
        let decoder_path = model_dir.join("decoder_model_merged_int8.onnx");
        for p in [&vision_path, &embed_path, &decoder_path] {
            if !p.exists() {
                anyhow::bail!(
                    "SmolVLM ONNX artifact not found at {}. Run `make smolvlm-download`.",
                    p.display()
                );
            }
        }

        tracing::info!(dir = %model_dir.display(), "Loading SmolVLM-256M ONNX sessions...");

        let n_threads = cfg.n_threads.unwrap_or(4);
        let vision_session = crate::ort_session::build_session(&vision_path, &cfg.ep_preference, n_threads)
            .context("build vision_encoder session")?;
        let embed_session = crate::ort_session::build_session(&embed_path, &cfg.ep_preference, n_threads)
            .context("build embed_tokens session")?;
        let decoder_session = crate::ort_session::build_session(&decoder_path, &cfg.ep_preference, n_threads)
            .context("build decoder_model_merged session")?;

        let tokenizer = HrmTokenizer::load(&model_dir).context("load SmolVLM tokenizer")?;
        let image_token_id = tokenizer.token_to_id(prompt::IMAGE_TOKEN)
            .ok_or_else(|| anyhow::anyhow!("tokenizer has no id for {}", prompt::IMAGE_TOKEN))?;
        let eos_token_id = tokenizer.token_to_id(EOS_TOKEN_STR)
            .ok_or_else(|| anyhow::anyhow!("tokenizer has no id for {}", EOS_TOKEN_STR))?;

        tracing::info!(image_token_id, eos_token_id, "SmolVLM-256M loaded");

        Ok(Self {
            vision_session: Some(Arc::new(Mutex::new(vision_session))),
            embed_session: Some(Arc::new(Mutex::new(embed_session))),
            decoder_session: Some(Arc::new(Mutex::new(decoder_session))),
            tokenizer: Some(tokenizer),
            image_token_id,
            eos_token_id,
            stub: false,
        })
    }

    /// Run the vision encoder over one preprocessed image, returning its
    /// flat `[IMAGE_SEQ_LEN * HIDDEN_SIZE]` patch embeddings.
    fn vision_encode(&self, prepped: &image_prep::PreppedImage) -> Result<Vec<f32>> {
        use ort::value::Tensor;

        let session_arc = self.vision_session.as_ref()
            .ok_or_else(|| anyhow::anyhow!("vision_encode called on stub engine"))?;

        let canvas = image_prep::CANVAS as usize;
        let pixel_tensor = Tensor::<f32>::from_array((
            [1usize, 1, 3, canvas, canvas],
            prepped.pixel_values.clone(),
        )).context("build pixel_values tensor")?;
        let mask_tensor = Tensor::<bool>::from_array((
            [1usize, 1, canvas, canvas],
            prepped.pixel_attention_mask.clone(),
        )).context("build pixel_attention_mask tensor")?;

        let mut session = session_arc.lock()
            .map_err(|e| anyhow::anyhow!("vision session lock poisoned: {e}"))?;
        let outputs = session.run(ort::inputs![
            "pixel_values" => pixel_tensor,
            "pixel_attention_mask" => mask_tensor,
        ]).context("ort run vision_encoder")?;

        let (shape, data) = outputs["image_features"].try_extract_tensor::<f32>()
            .context("extract image_features")?;
        let dims = shape.as_ref();
        if dims.len() != 3 || dims[1] as usize != prompt::IMAGE_SEQ_LEN || dims[2] as usize != HIDDEN_SIZE {
            anyhow::bail!("unexpected image_features shape: {:?}", dims);
        }
        Ok(data[..prompt::IMAGE_SEQ_LEN * HIDDEN_SIZE].to_vec())
    }

    /// Run token embedding lookup, returning flat `[seq * HIDDEN_SIZE]`
    /// embeddings.
    fn embed_tokens(&self, ids: &[i64]) -> Result<Vec<f32>> {
        use ort::value::Tensor;

        let seq_len = ids.len();
        let input_tensor = Tensor::<i64>::from_array(([1usize, seq_len], ids.to_vec()))
            .context("build input_ids tensor")?;

        let session_arc = self.embed_session.as_ref()
            .ok_or_else(|| anyhow::anyhow!("embed_tokens called on stub engine"))?;
        let mut session = session_arc.lock()
            .map_err(|e| anyhow::anyhow!("embed session lock poisoned: {e}"))?;
        let outputs = session.run(ort::inputs!["input_ids" => input_tensor])
            .context("ort run embed_tokens")?;

        let (shape, data) = outputs["inputs_embeds"].try_extract_tensor::<f32>()
            .context("extract inputs_embeds")?;
        let dims = shape.as_ref();
        if dims.len() != 3 || dims[2] as usize != HIDDEN_SIZE {
            anyhow::bail!("unexpected inputs_embeds shape: {:?}", dims);
        }
        Ok(data.to_vec())
    }

    /// Replace each `image_token_id` position's embedding in `embeds` (flat
    /// `[seq * HIDDEN_SIZE]`) with the next row of `image_features` (flat
    /// `[IMAGE_SEQ_LEN * HIDDEN_SIZE]`), in order. `ids.len() * HIDDEN_SIZE`
    /// must equal `embeds.len()`.
    fn splice_image_embeds(embeds: &mut [f32], ids: &[i64], image_features: &[f32], image_token_id: u32) {
        let mut img_pos = 0usize;
        for (i, &id) in ids.iter().enumerate() {
            if id as u32 == image_token_id && (img_pos + 1) * HIDDEN_SIZE <= image_features.len() {
                let dst = &mut embeds[i * HIDDEN_SIZE..(i + 1) * HIDDEN_SIZE];
                let src = &image_features[img_pos * HIDDEN_SIZE..(img_pos + 1) * HIDDEN_SIZE];
                dst.copy_from_slice(src);
                img_pos += 1;
            }
        }
    }

    /// Builds a past-key-values tensor with shape `[1, NUM_KV_HEADS, past_len, HEAD_DIM]`.
    /// `Tensor::from_array` rejects any zero-valued shape dimension (its `ToShape`
    /// validation requires every dim >= 1, even when the data legitimately has
    /// zero elements) — that hits every prefill call, since `past_len == 0` there.
    /// `Tensor::new` allocates directly from a `Shape` with no such restriction,
    /// so it's used for the empty case; `from_array` is used otherwise since it
    /// avoids an extra allocation+copy for the (much more common) non-empty case.
    ///
    /// Branches on `past_len == 0` (not `data.is_empty()`): a caller bug that
    /// passes `past_len > 0` with an empty `data` Vec must never silently take
    /// the uninitialized-allocation branch and hand ORT garbage memory for a
    /// non-zero-length tensor — the `ensure!` below turns that into a clean
    /// error instead of silent corruption.
    fn kv_tensor(past_len: usize, data: Vec<f32>) -> Result<ort::value::Tensor<f32>> {
        use ort::value::Tensor;
        anyhow::ensure!(
            data.len() == NUM_KV_HEADS * past_len * HEAD_DIM,
            "KV tensor data length {} doesn't match expected {} for past_len={}",
            data.len(), NUM_KV_HEADS * past_len * HEAD_DIM, past_len
        );
        if past_len == 0 {
            let allocator = ort::memory::Allocator::default();
            Tensor::<f32>::new(&allocator, [1usize, NUM_KV_HEADS, past_len, HEAD_DIM])
                .context("allocate empty KV tensor")
        } else {
            Tensor::<f32>::from_array(([1usize, NUM_KV_HEADS, past_len, HEAD_DIM], data))
                .context("build KV tensor from data")
        }
    }

    /// Run one decoder forward pass. `seq_len` is the number of NEW
    /// positions in `embeds` (full prompt on the first/prefill call, 1 on
    /// every subsequent decode call); `past_len`/`past_k`/`past_v` carry the
    /// accumulated KV cache. Returns (last-position logits, updated
    /// per-layer key cache, updated per-layer value cache).
    fn decode_step(
        &self,
        embeds: &[f32],
        seq_len: usize,
        past_len: usize,
        past_k: &[Vec<f32>],
        past_v: &[Vec<f32>],
    ) -> Result<(Vec<f32>, Vec<Vec<f32>>, Vec<Vec<f32>>)> {
        use ort::session::SessionInputValue;
        use ort::value::Tensor;

        let total_len = past_len + seq_len;

        let embeds_tensor = Tensor::<f32>::from_array(([1usize, seq_len, HIDDEN_SIZE], embeds.to_vec()))
            .context("build inputs_embeds tensor")?;
        let attn_tensor = Tensor::<i64>::from_array(([1usize, total_len], vec![1i64; total_len]))
            .context("build attention_mask tensor")?;
        let position_ids: Vec<i64> = (past_len as i64..total_len as i64).collect();
        let pos_tensor = Tensor::<i64>::from_array(([1usize, seq_len], position_ids))
            .context("build position_ids tensor")?;

        let mut inputs: Vec<(String, SessionInputValue)> = Vec::with_capacity(3 + NUM_LAYERS * 2);
        inputs.push(("inputs_embeds".to_string(), embeds_tensor.into()));
        inputs.push(("attention_mask".to_string(), attn_tensor.into()));
        inputs.push(("position_ids".to_string(), pos_tensor.into()));

        for l in 0..NUM_LAYERS {
            let k_tensor = Self::kv_tensor(past_len, past_k[l].clone())
                .with_context(|| format!("build past_key_values.{l}.key tensor"))?;
            let v_tensor = Self::kv_tensor(past_len, past_v[l].clone())
                .with_context(|| format!("build past_key_values.{l}.value tensor"))?;
            inputs.push((format!("past_key_values.{l}.key"), k_tensor.into()));
            inputs.push((format!("past_key_values.{l}.value"), v_tensor.into()));
        }

        let session_arc = self.decoder_session.as_ref()
            .ok_or_else(|| anyhow::anyhow!("decode_step called on stub engine"))?;
        let mut session = session_arc.lock()
            .map_err(|e| anyhow::anyhow!("decoder session lock poisoned: {e}"))?;
        let outputs = session.run(inputs).context("ort run decoder_model_merged")?;

        let (logit_shape, logit_data) = outputs["logits"].try_extract_tensor::<f32>()
            .context("extract logits")?;
        let ldims = logit_shape.as_ref();
        if ldims.len() != 3 {
            anyhow::bail!("unexpected logits shape: {:?}", ldims);
        }
        let vocab = ldims[2] as usize;
        let last_pos = (ldims[1] as usize) - 1;
        let row_start = last_pos * vocab;
        let last_logits = logit_data[row_start..row_start + vocab].to_vec();

        let mut new_past_k = Vec::with_capacity(NUM_LAYERS);
        let mut new_past_v = Vec::with_capacity(NUM_LAYERS);
        for l in 0..NUM_LAYERS {
            let (_, kdata) = outputs[format!("present.{l}.key")].try_extract_tensor::<f32>()
                .with_context(|| format!("extract present.{l}.key"))?;
            let (_, vdata) = outputs[format!("present.{l}.value")].try_extract_tensor::<f32>()
                .with_context(|| format!("extract present.{l}.value"))?;
            new_past_k.push(kdata.to_vec());
            new_past_v.push(vdata.to_vec());
        }

        Ok((last_logits, new_past_k, new_past_v))
    }

    /// Shared generation core for both `chat` and `complete`. `ids` is the
    /// already-tokenized prompt (with image placeholder tokens already
    /// present if `image` is `Some`). Streams decoded token strings into
    /// `tx`. Blocking — callers wrap in `spawn_blocking`.
    fn generate(
        &self,
        ids: Vec<i64>,
        image: Option<&[u8]>,
        max_tokens: u32,
        temperature: f32,
        tx: &tokio::sync::mpsc::Sender<String>,
    ) -> Result<()> {
        let tokenizer = self.tokenizer.as_ref()
            .ok_or_else(|| anyhow::anyhow!("generate called on stub engine"))?;

        let mut embeds = self.embed_tokens(&ids)?;
        if let Some(img_bytes) = image {
            let prepped = image_prep::preprocess(img_bytes)?;
            let image_features = self.vision_encode(&prepped)?;
            Self::splice_image_embeds(&mut embeds, &ids, &image_features, self.image_token_id);
        }

        let mut past_k: Vec<Vec<f32>> = vec![Vec::new(); NUM_LAYERS];
        let mut past_v: Vec<Vec<f32>> = vec![Vec::new(); NUM_LAYERS];
        let mut past_len = 0usize;
        let mut cur_embeds = embeds;
        let mut cur_seq_len = ids.len();
        // Seed from GENERATED tokens only, not the prompt: SmolVLM's chat
        // template (`prompt::build_prompt`) appends `<end_of_utterance>`
        // (== `self.eos_token_id`) after every message, so seeding from the
        // full prompt would have the repetition penalty permanently suppress
        // the model's own EOS token on every decode step.
        let mut history: Vec<i64> = Vec::new();

        for _ in 0..max_tokens {
            let (mut logits, new_past_k, new_past_v) =
                self.decode_step(&cur_embeds, cur_seq_len, past_len, &past_k, &past_v)?;
            past_k = new_past_k;
            past_v = new_past_v;
            past_len += cur_seq_len;

            crate::sampling::apply_repetition_penalty(&mut logits, &history, 1.3);
            let next = crate::sampling::sample(&logits, temperature, 40, 0.95);
            let next_u32 = next as u32;
            if next_u32 == self.eos_token_id {
                break;
            }

            let piece = tokenizer.decode_single(next_u32).unwrap_or_default();
            if tx.blocking_send(piece).is_err() {
                break;
            }

            history.push(next as i64);
            cur_embeds = self.embed_tokens(&[next as i64])?;
            cur_seq_len = 1;
        }
        Ok(())
    }

    /// Chat-completion path. Splices the image expansion block into the
    /// LAST user-role message's content (same insertion point `handler.rs`
    /// uses for the caption-bridge path on non-vision engines), builds
    /// SmolVLM's own chat-template prompt, tokenizes, and generates with
    /// the image bytes threaded through for native vision fusion.
    pub fn chat(
        self: Arc<Self>,
        mut messages: Vec<(String, String)>,
        image: Option<Vec<u8>>,
        max_tokens: u32,
        temperature: f32,
        tx: tokio::sync::mpsc::Sender<String>,
    ) -> Result<()> {
        if self.stub {
            return self.stub_reply(&format!(
                "chat with {} message(s), image={}",
                messages.len(), image.is_some()
            ), max_tokens, &tx);
        }

        if image.is_some() {
            let block = prompt::image_expansion_block();
            if let Some((_role, content)) = messages.iter_mut().rev().find(|(r, _)| r == "user") {
                *content = format!("{block}\n{content}");
            } else {
                messages.push(("user".to_string(), block));
            }
        }

        let prompt_text = prompt::build_prompt(&messages);
        let tokenizer = self.tokenizer.as_ref()
            .ok_or_else(|| anyhow::anyhow!("chat called without a tokenizer"))?;
        let ids = tokenizer.encode(&prompt_text, true)?;

        self.generate(ids, image.as_deref(), max_tokens, temperature, &tx)
    }

    /// Raw text-in/text-out path — no chat template, no image. Used by the
    /// agent planner.
    pub fn complete(
        self: Arc<Self>,
        prompt_text: String,
        max_tokens: u32,
        temperature: f32,
        tx: tokio::sync::mpsc::Sender<String>,
    ) -> Result<()> {
        if self.stub {
            return self.stub_reply(&prompt_text, max_tokens, &tx);
        }

        let tokenizer = self.tokenizer.as_ref()
            .ok_or_else(|| anyhow::anyhow!("complete called without a tokenizer"))?;
        let ids = tokenizer.encode(&prompt_text, true)?;
        self.generate(ids, None, max_tokens, temperature, &tx)
    }

    /// Stub mode: stream a canned, deterministic reply capped by
    /// `max_tokens`, matching `HrmEngine`'s stub behavior exactly (same
    /// escape hatch for testing the HTTP/agent plumbing without weights).
    fn stub_reply(&self, context: &str, max_tokens: u32, tx: &tokio::sync::mpsc::Sender<String>) -> Result<()> {
        let reply = format!(
            "[stub-llm] SmolVLM-256M stub engine active — no weights loaded. \
             Received: {context}."
        );
        for (i, word) in reply.split_inclusive(' ').enumerate() {
            if i as u32 >= max_tokens { break; }
            if tx.blocking_send(word.to_string()).is_err() { break; }
        }
        Ok(())
    }
}

impl crate::engine::LlmEngine for SmolVlmEngine {
    fn chat(
        self: Arc<Self>,
        messages: Vec<(String, String)>,
        image: Option<Vec<u8>>,
        max_tokens: u32,
        temperature: f32,
        tx: tokio::sync::mpsc::Sender<String>,
    ) -> Result<()> {
        SmolVlmEngine::chat(self, messages, image, max_tokens, temperature, tx)
    }

    fn complete(
        self: Arc<Self>,
        prompt: String,
        max_tokens: u32,
        temperature: f32,
        tx: tokio::sync::mpsc::Sender<String>,
    ) -> Result<()> {
        SmolVlmEngine::complete(self, prompt, max_tokens, temperature, tx)
    }

    fn supports_vision(&self) -> bool {
        true
    }

    fn model_id(&self) -> &str {
        "smolvlm-256m"
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::SmolVlmConfig;

    fn fixture_cfg() -> SmolVlmConfig {
        SmolVlmConfig {
            model_dir: format!("{}/models/smolvlm-256m", env!("CARGO_MANIFEST_DIR")),
            ep_preference: "cpu".into(),
            n_threads: Some(2),
            stub: Some(false),
        }
    }

    fn stub_cfg() -> SmolVlmConfig {
        SmolVlmConfig {
            model_dir: "/nonexistent/stub/path".into(),
            ep_preference: "cpu".into(),
            n_threads: Some(2),
            stub: Some(true),
        }
    }

    fn skip_if_no_model() -> bool {
        !std::path::Path::new(&format!(
            "{}/models/smolvlm-256m/decoder_model_merged_int8.onnx",
            env!("CARGO_MANIFEST_DIR")
        )).exists()
    }

    #[test]
    fn stub_load_succeeds_without_any_model_files() {
        let eng = SmolVlmEngine::load(&stub_cfg()).expect("stub load should succeed");
        assert!(eng.is_stub());
    }

    #[test]
    fn non_stub_load_errors_when_onnx_missing() {
        let cfg = SmolVlmConfig {
            model_dir: "/nonexistent/path".into(),
            ep_preference: "cpu".into(),
            n_threads: Some(2),
            stub: Some(false),
        };
        let err = SmolVlmEngine::load(&cfg).unwrap_err();
        assert!(err.to_string().contains("not found"));
    }

    #[test]
    #[ignore = "loads real ONNX model; run with --ignored after make smolvlm-download"]
    fn load_resolves_real_special_token_ids() {
        if skip_if_no_model() {
            eprintln!("skipping: run `make smolvlm-download` to enable SmolVLM load tests");
            return;
        }
        let eng = SmolVlmEngine::load(&fixture_cfg()).unwrap();
        assert_eq!(eng.image_token_id, 49190);
        assert_eq!(eng.eos_token_id, 49279);
    }

    #[test]
    #[ignore = "loads real ONNX model; run with --ignored after make smolvlm-download"]
    fn vision_encode_returns_expected_shape() {
        if skip_if_no_model() {
            eprintln!("skipping");
            return;
        }
        let eng = SmolVlmEngine::load(&fixture_cfg()).unwrap();
        // 4x4 red square PNG, tiny but decodable.
        let img = image::DynamicImage::ImageRgb8(
            image::ImageBuffer::from_pixel(4, 4, image::Rgb([255u8, 0, 0])),
        );
        let mut bytes = Vec::new();
        img.write_to(&mut std::io::Cursor::new(&mut bytes), image::ImageFormat::Png).unwrap();
        let prepped = image_prep::preprocess(&bytes).unwrap();
        let features = eng.vision_encode(&prepped).unwrap();
        assert_eq!(features.len(), prompt::IMAGE_SEQ_LEN * HIDDEN_SIZE);
    }

    #[test]
    fn splice_image_embeds_replaces_only_image_token_positions() {
        let ids = vec![1i64, 49190, 2, 49190, 3]; // two image-token positions
        let mut embeds = vec![0.0f32; 5 * HIDDEN_SIZE];
        let image_features: Vec<f32> = (0..2 * HIDDEN_SIZE).map(|i| i as f32).collect();
        SmolVlmEngine::splice_image_embeds(&mut embeds, &ids, &image_features, 49190);

        // position 1 (first image token) got image_features[0..HIDDEN_SIZE]
        assert_eq!(&embeds[1 * HIDDEN_SIZE..2 * HIDDEN_SIZE], &image_features[0..HIDDEN_SIZE]);
        // position 3 (second image token) got image_features[HIDDEN_SIZE..2*HIDDEN_SIZE]
        assert_eq!(&embeds[3 * HIDDEN_SIZE..4 * HIDDEN_SIZE], &image_features[HIDDEN_SIZE..2 * HIDDEN_SIZE]);
        // non-image positions untouched (still zero)
        assert!(embeds[0 * HIDDEN_SIZE..1 * HIDDEN_SIZE].iter().all(|&v| v == 0.0));
        assert!(embeds[2 * HIDDEN_SIZE..3 * HIDDEN_SIZE].iter().all(|&v| v == 0.0));
    }

    #[tokio::test]
    async fn stub_chat_streams_nonempty_output() {
        let eng = Arc::new(SmolVlmEngine::load(&stub_cfg()).unwrap());
        let (tx, mut rx) = tokio::sync::mpsc::channel::<String>(64);
        let eng2 = eng.clone();
        let h = tokio::task::spawn_blocking(move || {
            eng2.chat(vec![("user".to_string(), "hi".to_string())], None, 16, 0.0, tx)
        });
        let mut received = String::new();
        while let Some(s) = rx.recv().await { received.push_str(&s); }
        h.await.unwrap().unwrap();
        assert!(!received.is_empty());
    }

    #[tokio::test]
    async fn stub_complete_respects_max_tokens() {
        let eng = Arc::new(SmolVlmEngine::load(&stub_cfg()).unwrap());
        let (tx, mut rx) = tokio::sync::mpsc::channel::<String>(64);
        let eng2 = eng.clone();
        let h = tokio::task::spawn_blocking(move || {
            eng2.complete("count words in this prompt".to_string(), 1, 0.0, tx)
        });
        let mut chunks = 0usize;
        while rx.recv().await.is_some() { chunks += 1; }
        h.await.unwrap().unwrap();
        assert!(chunks >= 1);
        assert!(chunks <= 1, "max_tokens=1 must cap the stub to one chunk, got {chunks}");
    }

    #[test]
    fn model_id_and_supports_vision_are_correct() {
        use crate::engine::LlmEngine;
        let eng: Arc<dyn LlmEngine> = Arc::new(SmolVlmEngine::load(&stub_cfg()).unwrap());
        assert_eq!(eng.model_id(), "smolvlm-256m");
        assert!(eng.supports_vision());
    }

    #[tokio::test]
    #[ignore = "loads real ONNX model; run with --ignored after make smolvlm-download"]
    async fn complete_generates_real_tokens_for_text_prompt() {
        if skip_if_no_model() {
            eprintln!("skipping");
            return;
        }
        let eng = Arc::new(SmolVlmEngine::load(&fixture_cfg()).unwrap());
        let (tx, mut rx) = tokio::sync::mpsc::channel::<String>(64);
        let eng2 = eng.clone();
        let h = tokio::task::spawn_blocking(move || {
            eng2.complete("The capital of France is".to_string(), 8, 0.0, tx)
        });
        let mut received = String::new();
        while let Some(s) = rx.recv().await { received.push_str(&s); }
        h.await.unwrap().unwrap();
        assert!(!received.is_empty(), "no tokens generated for a real prompt");
    }

    #[tokio::test]
    #[ignore = "loads real ONNX model; run with --ignored after make smolvlm-download"]
    async fn chat_with_image_generates_real_tokens() {
        if skip_if_no_model() {
            eprintln!("skipping");
            return;
        }
        let eng = Arc::new(SmolVlmEngine::load(&fixture_cfg()).unwrap());
        let img = image::DynamicImage::ImageRgb8(
            image::ImageBuffer::from_pixel(64, 64, image::Rgb([10u8, 200, 10])),
        );
        let mut bytes = Vec::new();
        img.write_to(&mut std::io::Cursor::new(&mut bytes), image::ImageFormat::Png).unwrap();

        let (tx, mut rx) = tokio::sync::mpsc::channel::<String>(64);
        let eng2 = eng.clone();
        let h = tokio::task::spawn_blocking(move || {
            eng2.chat(
                vec![("user".to_string(), "What color is this image?".to_string())],
                Some(bytes),
                16, 0.0, tx,
            )
        });
        let mut received = String::new();
        while let Some(s) = rx.recv().await { received.push_str(&s); }
        h.await.unwrap().unwrap();
        assert!(!received.is_empty(), "no tokens generated for an image chat prompt");
    }
}
