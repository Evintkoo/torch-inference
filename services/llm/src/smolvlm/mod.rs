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
}
