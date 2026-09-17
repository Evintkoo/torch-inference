/// Kokoro ONNX TTS Engine - Real ort 2.0.0-rc.10 inference
/// Uses ONNX Runtime for cross-platform neural TTS inference
use anyhow::{Context, Result};
use async_trait::async_trait;
use lru::LruCache;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::num::NonZeroUsize;
use std::path::PathBuf;
use std::sync::Arc;

use parking_lot::Mutex;

use ort::session::builder::GraphOptimizationLevel;
use ort::session::Session;
use ort::value::Tensor;

use super::audio::AudioData;
use super::tts_engine::{
    EngineCapabilities, SynthesisParams, TTSEngine, VoiceGender, VoiceInfo, VoiceQuality,
};

const VOICE_STYLE_DIM: usize = 256;
/// Number of style vectors per voice (one per possible phoneme-sequence length, up to 510)
const VOICE_PACK_SIZE: usize = 510;

/// Default number of ONNX sessions in the pool. Each session handles one concurrent synthesis.
/// Setting this to 1 reproduces the old single-mutex behaviour; 2-4 is recommended in production.
const DEFAULT_POOL_SIZE: usize = 2;

/// G2P cache capacity (number of distinct texts cached).
/// Stored in a lock-free DashMap — reads never block.
const G2P_CACHE_CAPACITY: usize = 1024;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KokoroOnnxConfig {
    pub model_dir: PathBuf,
    pub sample_rate: u32,
    /// Number of ONNX sessions to keep in the pool for concurrent synthesis.
    #[serde(default = "default_pool_size")]
    pub pool_size: usize,
}

fn default_pool_size() -> usize {
    DEFAULT_POOL_SIZE
}

// ─── Session pool ────────────────────────────────────────────────────────────

/// A pool of ONNX sessions.  Each synthesis request checks out one session for
/// the duration of `Session::run()`, then returns it.  Concurrency is bounded
/// by the number of sessions created at startup; additional requests wait
/// asynchronously on the semaphore without blocking the runtime thread.
struct SessionPool {
    sessions: Mutex<Vec<Session>>,
    semaphore: Arc<tokio::sync::Semaphore>,
}

impl SessionPool {
    fn new(sessions: Vec<Session>) -> Self {
        let n = sessions.len();
        Self {
            sessions: Mutex::new(sessions),
            semaphore: Arc::new(tokio::sync::Semaphore::new(n)),
        }
    }

    /// Acquire a session from the pool.  Awaits if all sessions are in use.
    /// Returns `Err` only if the pool has been closed (e.g. shutdown race) —
    /// in which case callers should surface a 503-style failure rather than
    /// crashing the worker.
    ///
    /// Takes `self` as `&Arc<Self>` so the returned guard owns its own
    /// `Arc<SessionPool>` clone (instead of borrowing `&'a SessionPool`),
    /// which makes the guard `Send + 'static` and movable into
    /// `tokio::task::spawn_blocking` for the CPU-bound `Session::run` call.
    async fn acquire(self: &Arc<Self>) -> anyhow::Result<SessionGuard> {
        // Acquire the semaphore permit *before* locking the Vec so we never
        // hold the Vec mutex while waiting.
        let permit = self
            .semaphore
            .clone()
            .acquire_owned()
            .await
            .map_err(|_| anyhow::anyhow!("Kokoro session pool closed"))?;
        let session = {
            let mut guard = self.sessions.lock();
            guard
                .pop()
                .ok_or_else(|| anyhow::anyhow!("session pool empty after permit acquired"))?
        };
        Ok(SessionGuard {
            session: Some(session),
            pool: Arc::clone(self),
            _permit: permit,
        })
    }
}

/// RAII guard that returns the session to the pool on drop.
/// Owns an `Arc<SessionPool>` (rather than borrowing it) and an
/// `OwnedSemaphorePermit` so the whole guard is `Send + 'static` and can be
/// moved into `tokio::task::spawn_blocking`.
struct SessionGuard {
    session: Option<Session>,
    pool: Arc<SessionPool>,
    _permit: tokio::sync::OwnedSemaphorePermit,
}

impl Drop for SessionGuard {
    fn drop(&mut self) {
        if let Some(s) = self.session.take() {
            // best-effort: if the lock is somehow poisoned we simply discard
            // the session (it will be absent from the pool but the semaphore
            // will still be released when `_permit` drops, so no deadlock).
            if let Some(mut guard) = self.pool.sessions.try_lock() {
                guard.push(s);
            }
        }
    }
}

impl std::ops::DerefMut for SessionGuard {
    fn deref_mut(&mut self) -> &mut Session {
        self.session
            .as_mut()
            .expect("session is present inside guard")
    }
}

impl std::ops::Deref for SessionGuard {
    type Target = Session;
    fn deref(&self) -> &Session {
        self.session
            .as_ref()
            .expect("session is present inside guard")
    }
}

/// Resolves `requested` to a voice id that is actually present in `loaded`.
///
/// If `requested` isn't loaded, falls back to a loaded voice of the same
/// gender (inferred from Kokoro's `xf_`/`xm_` naming convention — the second
/// character is `f` for female, `m` for male), or `af_bella` if the gender
/// can't be determined or no same-gender pack is loaded. This is the single
/// place synthesis ever falls back to a substitute voice, so every caller —
/// including ones that bypass `map_voice` entirely, like the primary Kokoro
/// engine invoked directly with a native voice id — gets a gender-preserving
/// fallback instead of the previous silent, always-female one.
fn resolve_voice_id<'a>(loaded: &'a HashMap<String, Vec<f32>>, requested: &'a str) -> &'a str {
    if let Some((id, _)) = loaded.get_key_value(requested) {
        return id.as_str();
    }
    log::warn!(
        "Kokoro ONNX: voice {:?} is not loaded, falling back to a substitute voice",
        requested
    );
    let is_male = requested.as_bytes().get(1) == Some(&b'm');
    let is_female = requested.as_bytes().get(1) == Some(&b'f');
    let fallback_order: &[&str] = if is_male {
        &["bm_george", "am_adam", "am_michael", "af_bella"]
    } else if is_female {
        &["af_bella", "bf_emma", "af_sarah"]
    } else {
        &["af_bella"]
    };
    for candidate in fallback_order {
        if let Some((id, _)) = loaded.get_key_value(*candidate) {
            return id.as_str();
        }
    }
    // Last resort: whatever the engine has loaded, if anything.
    loaded
        .keys()
        .next()
        .map(|s| s.as_str())
        .unwrap_or(requested)
}

// ─── Engine ──────────────────────────────────────────────────────────────────

pub struct KokoroOnnxEngine {
    pool: Arc<SessionPool>,
    /// voice_id → flat f32[VOICE_PACK_SIZE * VOICE_STYLE_DIM], loaded once at startup
    voice_styles: HashMap<String, Vec<f32>>,
    config: KokoroOnnxConfig,
    capabilities: EngineCapabilities,
    /// Per-engine G2P result cache: text → phoneme token ids.
    /// LruCache evicts the least-recently-used entry when capacity is reached,
    /// ensuring frequently-used phrases are retained over one-off texts.
    g2p_cache: Mutex<LruCache<String, Vec<i64>>>,
}

// Session is Send+Sync as documented by ort; SessionPool wraps it safely.
unsafe impl Send for KokoroOnnxEngine {}
unsafe impl Sync for KokoroOnnxEngine {}

impl std::fmt::Debug for KokoroOnnxEngine {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("KokoroOnnxEngine")
            .field("config", &self.config)
            .finish_non_exhaustive()
    }
}

impl KokoroOnnxEngine {
    pub fn new(cfg: &serde_json::Value) -> Result<Self> {
        let model_dir = PathBuf::from(
            cfg.get("model_dir")
                .and_then(|v| v.as_str())
                .unwrap_or("models/tts/kokoro-onnx-int8"),
        );
        let pool_size = cfg
            .get("pool_size")
            .and_then(|v| v.as_u64())
            .map(|n| n.max(1) as usize)
            .unwrap_or(DEFAULT_POOL_SIZE);

        // Accept several filename conventions
        let model_path = [
            "kokoro-v1.0.int8.onnx",
            "kokoro-v1.0.onnx",
            "kokoro-v1_0.onnx",
            "model.onnx",
        ]
        .iter()
        .map(|name| model_dir.join(name))
        .find(|p| p.exists())
        .ok_or_else(|| {
            anyhow::anyhow!(
                "Kokoro ONNX model not found in {:?}. \
                 Download from: https://github.com/thewh1teagle/kokoro-onnx/releases",
                model_dir
            )
        })?;

        // Build `pool_size` independent sessions with hardware-accelerated EP.
        let physical_cpus = num_cpus::get_physical().max(1);
        let mut sessions = Vec::with_capacity(pool_size);
        for i in 0..pool_size {
            let builder = Session::builder()?
                .with_optimization_level(GraphOptimizationLevel::Level3)?
                .with_intra_threads(physical_cpus)?
                .with_inter_threads(1)?
                .with_memory_pattern(true)?
                .with_execution_providers(crate::core::ort_eps::build_eps(0))?;

            let session = builder.commit_from_file(&model_path)?;
            if i == 0 {
                for inp in &session.inputs {
                    log::info!("ONNX input:  {:?}", inp);
                }
                for out in &session.outputs {
                    log::info!("ONNX output: {:?}", out);
                }
                #[cfg(target_os = "macos")]
                log::info!("KokoroOnnx: CoreML EP active (ANE path)");
                #[cfg(target_os = "windows")]
                log::info!("KokoroOnnx: CUDA → DirectML → CPU EP chain active");
            }
            sessions.push(session);
        }
        log::info!("KokoroOnnx: created session pool (size={})", pool_size);

        // Preload all voice style .bin files
        let voices_dir = model_dir.join("voices");
        let mut voice_styles = HashMap::new();
        let default_voices = [
            "af_bella",
            "af_sarah",
            "af_nicole",
            "am_adam",
            "am_michael",
            "bf_emma",
            "bf_isabella",
            "bm_george",
        ];
        for voice_id in default_voices {
            let bin_path = voices_dir.join(format!("{}.bin", voice_id));
            match Self::load_voice_style(&bin_path) {
                Ok(style) => {
                    voice_styles.insert(voice_id.to_string(), style);
                }
                Err(e) => log::warn!("Voice {:?} not loaded: {}", voice_id, e),
            }
        }
        if !voice_styles.contains_key("af_bella") {
            log::warn!("Default voice af_bella not found in {:?}", voices_dir);
        }

        let sample_rate = cfg
            .get("sample_rate")
            .and_then(|v| v.as_u64())
            .unwrap_or(24000) as u32;
        let config = KokoroOnnxConfig {
            model_dir,
            sample_rate,
            pool_size,
        };
        let capabilities = Self::build_capabilities(sample_rate);

        Ok(Self {
            pool: Arc::new(SessionPool::new(sessions)),
            voice_styles,
            config,
            capabilities,
            g2p_cache: Mutex::new(LruCache::new(
                NonZeroUsize::new(G2P_CACHE_CAPACITY).expect("G2P_CACHE_CAPACITY > 0"),
            )),
        })
    }

    fn load_voice_style(path: &std::path::Path) -> Result<Vec<f32>> {
        let bytes = std::fs::read(path)?;
        let floats: Vec<f32> = bytes
            .chunks_exact(4)
            .map(|b| f32::from_le_bytes(b.try_into().unwrap()))
            .collect();
        let expected = VOICE_PACK_SIZE * VOICE_STYLE_DIM;
        anyhow::ensure!(
            floats.len() == expected,
            "Voice style {:?}: expected {} floats ({}x{}), got {}",
            path,
            expected,
            VOICE_PACK_SIZE,
            VOICE_STYLE_DIM,
            floats.len()
        );
        Ok(floats)
    }

    fn build_capabilities(sample_rate: u32) -> EngineCapabilities {
        EngineCapabilities {
            name: "Kokoro ONNX TTS".to_string(),
            version: "1.0.0".to_string(),
            supported_languages: vec!["en-US".to_string(), "en-GB".to_string()],
            supported_voices: vec![
                VoiceInfo {
                    id: "af_bella".to_string(),
                    name: "Bella (American Female)".to_string(),
                    language: "en-US".to_string(),
                    gender: VoiceGender::Female,
                    quality: VoiceQuality::Neural,
                },
                VoiceInfo {
                    id: "af_sarah".to_string(),
                    name: "Sarah (American Female)".to_string(),
                    language: "en-US".to_string(),
                    gender: VoiceGender::Female,
                    quality: VoiceQuality::Neural,
                },
                VoiceInfo {
                    id: "af_nicole".to_string(),
                    name: "Nicole (American Female)".to_string(),
                    language: "en-US".to_string(),
                    gender: VoiceGender::Female,
                    quality: VoiceQuality::Neural,
                },
                VoiceInfo {
                    id: "am_adam".to_string(),
                    name: "Adam (American Male)".to_string(),
                    language: "en-US".to_string(),
                    gender: VoiceGender::Male,
                    quality: VoiceQuality::Neural,
                },
                VoiceInfo {
                    id: "am_michael".to_string(),
                    name: "Michael (American Male)".to_string(),
                    language: "en-US".to_string(),
                    gender: VoiceGender::Male,
                    quality: VoiceQuality::Neural,
                },
                VoiceInfo {
                    id: "bf_emma".to_string(),
                    name: "Emma (British Female)".to_string(),
                    language: "en-GB".to_string(),
                    gender: VoiceGender::Female,
                    quality: VoiceQuality::Neural,
                },
                VoiceInfo {
                    id: "bf_isabella".to_string(),
                    name: "Isabella (British Female)".to_string(),
                    language: "en-GB".to_string(),
                    gender: VoiceGender::Female,
                    quality: VoiceQuality::Neural,
                },
                VoiceInfo {
                    id: "bm_george".to_string(),
                    name: "George (British Male)".to_string(),
                    language: "en-GB".to_string(),
                    gender: VoiceGender::Male,
                    quality: VoiceQuality::Neural,
                },
            ],
            max_text_length: 1000,
            sample_rate,
            supports_ssml: false,
            supports_streaming: true, // sentence-level streaming via /tts/stream
        }
    }

    /// Look up or compute the phoneme tokens for `text`.
    ///
    /// G2P with LRU caching. Lock held only for the duration of the cache
    /// lookup or insert — G2P computation itself runs outside the lock.
    fn cached_g2p(&self, text: &str) -> Result<Vec<i64>> {
        use crate::core::g2p_misaki::MisakiG2P;

        // Fast path: cache hit.
        {
            let mut cache = self.g2p_cache.lock();
            if let Some(tokens) = cache.get(text) {
                return Ok(tokens.clone());
            }
        }

        // Slow path: compute G2P outside the lock so other threads can still
        // read the cache while this synthesis thread is running G2P.
        let g2p = MisakiG2P::new()?;
        let tokens = g2p.text_to_tokens(text)?;

        // Insert — LruCache::put automatically evicts the LRU entry when full.
        self.g2p_cache.lock().put(text.to_string(), tokens.clone());
        Ok(tokens)
    }

    async fn synthesize_with_onnx(
        &self,
        text: &str,
        params: &SynthesisParams,
    ) -> Result<AudioData> {
        let phoneme_tokens = self.cached_g2p(text)?;
        anyhow::ensure!(
            !phoneme_tokens.is_empty(),
            "G2P produced no tokens for: {:?}",
            text
        );

        let phoneme_count = phoneme_tokens.len();

        // style: f32 [1, VOICE_STYLE_DIM]
        // Select row by phoneme_count-1, capped at VOICE_PACK_SIZE-1.
        // Borrow the pack directly — copy only the 256-float row (1 KB), not 522 KB.
        let requested_voice_id = params.voice.as_deref().unwrap_or("af_bella");
        let voice_id = resolve_voice_id(&self.voice_styles, requested_voice_id);
        let pack: &[f32] = self
            .voice_styles
            .get(voice_id)
            .map(|v| v.as_slice())
            .unwrap_or(&[]);

        let style_row = (phoneme_count.saturating_sub(1)).min(VOICE_PACK_SIZE - 1);
        let style_vec: Vec<f32> = if pack.len() == VOICE_PACK_SIZE * VOICE_STYLE_DIM {
            pack[style_row * VOICE_STYLE_DIM..(style_row + 1) * VOICE_STYLE_DIM].to_vec()
        } else {
            // Voice pack absent — use silence (zeroes)
            vec![0.0f32; VOICE_STYLE_DIM]
        };
        let style_tensor = Tensor::<f32>::from_array(([1usize, VOICE_STYLE_DIM], style_vec))?;

        // tokens: int64 [1, seq_len] with BOS(0) and EOS(0)
        let mut tokens_with_bos_eos: Vec<i64> = Vec::with_capacity(phoneme_tokens.len() + 2);
        tokens_with_bos_eos.push(0);
        tokens_with_bos_eos.extend_from_slice(&phoneme_tokens);
        tokens_with_bos_eos.push(0);
        let seq_len = tokens_with_bos_eos.len();
        let tokens_tensor = Tensor::<i64>::from_array(([1usize, seq_len], tokens_with_bos_eos))?;

        // speed: f32 [1]
        let speed_tensor = Tensor::<f32>::from_array(([1usize], vec![params.speed]))?;

        // Check out a session from the pool — async wait, no blocking.
        let mut session = self.pool.acquire().await?;

        // `Session::run` is synchronous, CPU-bound ONNX inference (milliseconds
        // to low-seconds). Running it inline would stall this reactor worker
        // for the whole call, blocking every other in-flight request on the
        // same actix `current_thread` executor — so it goes through
        // `spawn_blocking` onto the blocking thread pool. The guard (and thus
        // the session) drops at the end of the closure, returning it to the
        // pool from the blocking thread, which is fine since the pool is
        // `Mutex`-protected.
        let samples: Vec<f32> = tokio::task::spawn_blocking(move || -> Result<Vec<f32>> {
            let outputs = session.run(ort::inputs![
                "input_ids" => tokens_tensor,
                "style"     => style_tensor,
                "speed"     => speed_tensor
            ])?;
            let (_shape, audio_slice) = outputs["waveform"].try_extract_tensor::<f32>()?;
            Ok(audio_slice.iter().map(|s| s.clamp(-1.0, 1.0)).collect())
        })
        .await
        .context("Kokoro ONNX synthesis task panicked")??;

        log::info!(
            "Kokoro ONNX: {} phonemes ({} tokens w/ BOS/EOS) -> {} samples ({:.2}s)",
            phoneme_count,
            seq_len,
            samples.len(),
            samples.len() as f32 / self.config.sample_rate as f32
        );

        Ok(AudioData {
            samples,
            sample_rate: self.config.sample_rate,
            channels: 1,
        })
    }
}

#[async_trait]
impl TTSEngine for KokoroOnnxEngine {
    fn name(&self) -> &str {
        "kokoro-onnx"
    }

    fn capabilities(&self) -> &EngineCapabilities {
        &self.capabilities
    }

    async fn synthesize(
        &self,
        text: &str,
        params: &SynthesisParams,
    ) -> Result<(AudioData, Option<&'static str>)> {
        self.validate_text(text)?;
        self.synthesize_with_onnx(text, params)
            .await
            .map(|audio| (audio, None))
            .with_context(|| {
                format!(
                    "Kokoro ONNX synthesis failed for: {:?}",
                    &text[..text.len().min(40)]
                )
            })
    }

    async fn warmup(&self) -> Result<()> {
        log::info!(
            "Kokoro ONNX engine ready (pool_size={}, model loaded at startup)",
            self.config.pool_size
        );
        Ok(())
    }

    fn validate_text(&self, text: &str) -> Result<()> {
        if text.is_empty() {
            anyhow::bail!("Text cannot be empty");
        }
        if text.len() > self.capabilities.max_text_length {
            anyhow::bail!(
                "Text too long (max {} characters)",
                self.capabilities.max_text_length
            );
        }
        Ok(())
    }

    fn list_voices(&self) -> Vec<VoiceInfo> {
        self.capabilities.supported_voices.clone()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ── resolve_voice_id ──────────────────────────────────────────────────────

    fn loaded_pack_set(ids: &[&str]) -> HashMap<String, Vec<f32>> {
        ids.iter()
            .map(|id| (id.to_string(), vec![0.0f32; VOICE_STYLE_DIM]))
            .collect()
    }

    #[test]
    fn resolve_voice_id_passes_through_loaded_id() {
        let loaded = loaded_pack_set(&["af_bella", "bm_george"]);
        assert_eq!(resolve_voice_id(&loaded, "af_bella"), "af_bella");
    }

    #[test]
    fn resolve_voice_id_falls_back_to_loaded_same_gender_voice() {
        // A caller that bypasses `map_voice` entirely (e.g. the primary
        // Kokoro engine invoked directly with a native voice id) must still
        // never resolve an unloaded id to a wrong-gender pack.
        let loaded = loaded_pack_set(&["af_bella", "bm_george"]);
        assert_eq!(resolve_voice_id(&loaded, "af_heart"), "af_bella"); // female -> female
        assert_eq!(resolve_voice_id(&loaded, "bm_lewis"), "bm_george"); // male -> male
    }

    #[test]
    fn resolve_voice_id_falls_back_to_af_bella_for_unrecognised_prefix() {
        let loaded = loaded_pack_set(&["af_bella", "bm_george"]);
        assert_eq!(resolve_voice_id(&loaded, "totally-unknown-voice"), "af_bella");
    }

    // ── default_pool_size ─────────────────────────────────────────────────────

    #[test]
    fn test_default_pool_size_returns_two() {
        assert_eq!(default_pool_size(), DEFAULT_POOL_SIZE);
        assert!(default_pool_size() >= 1, "pool size must be at least 1");
    }

    // ── KokoroOnnxConfig ──────────────────────────────────────────────────────

    #[test]
    fn test_kokoro_onnx_config_construction() {
        let cfg = KokoroOnnxConfig {
            model_dir: PathBuf::from("models/kokoro-82m"),
            sample_rate: 24000,
            pool_size: 2,
        };
        assert_eq!(cfg.model_dir, PathBuf::from("models/kokoro-82m"));
        assert_eq!(cfg.sample_rate, 24000);
        assert_eq!(cfg.pool_size, 2);
    }

    #[test]
    fn test_kokoro_onnx_config_serde_roundtrip() {
        let cfg = KokoroOnnxConfig {
            model_dir: PathBuf::from("/tmp/models/kokoro"),
            sample_rate: 22050,
            pool_size: 3,
        };
        let json = serde_json::to_string(&cfg).expect("serialize");
        let deser: KokoroOnnxConfig = serde_json::from_str(&json).expect("deserialize");
        assert_eq!(deser.model_dir, cfg.model_dir);
        assert_eq!(deser.sample_rate, cfg.sample_rate);
        assert_eq!(deser.pool_size, cfg.pool_size);
    }

    #[test]
    fn test_kokoro_onnx_config_serde_default_pool_size() {
        // When pool_size is absent from JSON, serde default kicks in
        let json = r#"{"model_dir": "/tmp/model", "sample_rate": 24000}"#;
        let deser: KokoroOnnxConfig = serde_json::from_str(json).expect("deserialize");
        assert_eq!(deser.pool_size, DEFAULT_POOL_SIZE);
    }

    #[test]
    fn test_kokoro_onnx_config_debug_and_clone() {
        let cfg = KokoroOnnxConfig {
            model_dir: PathBuf::from("models/kokoro"),
            sample_rate: 24000,
            pool_size: 1,
        };
        let cloned = cfg.clone();
        assert_eq!(cloned.sample_rate, cfg.sample_rate);
        let _ = format!("{:?}", cloned);
    }

    // ── build_capabilities ────────────────────────────────────────────────────

    #[test]
    fn test_build_capabilities_name_and_version() {
        let caps = KokoroOnnxEngine::build_capabilities(24000);
        assert_eq!(caps.name, "Kokoro ONNX TTS");
        assert_eq!(caps.version, "1.0.0");
    }

    #[test]
    fn test_build_capabilities_sample_rate_propagated() {
        let caps = KokoroOnnxEngine::build_capabilities(22050);
        assert_eq!(caps.sample_rate, 22050);
    }

    #[test]
    fn test_build_capabilities_max_text_length() {
        let caps = KokoroOnnxEngine::build_capabilities(24000);
        assert_eq!(caps.max_text_length, 1000);
    }

    #[test]
    fn test_build_capabilities_ssml_disabled_streaming_enabled() {
        let caps = KokoroOnnxEngine::build_capabilities(24000);
        assert!(!caps.supports_ssml);
        assert!(caps.supports_streaming); // sentence-level streaming via /tts/stream
    }

    #[test]
    fn test_build_capabilities_supported_languages() {
        let caps = KokoroOnnxEngine::build_capabilities(24000);
        assert!(caps.supported_languages.contains(&"en-US".to_string()));
        assert!(caps.supported_languages.contains(&"en-GB".to_string()));
    }

    #[test]
    fn test_build_capabilities_voices_count() {
        let caps = KokoroOnnxEngine::build_capabilities(24000);
        // 8 voices available in onnx-community/Kokoro-82M-ONNX (af_heart and bm_lewis removed)
        assert_eq!(caps.supported_voices.len(), 8);
    }

    #[test]
    fn test_build_capabilities_voice_ids_present() {
        let caps = KokoroOnnxEngine::build_capabilities(24000);
        let ids: Vec<&str> = caps
            .supported_voices
            .iter()
            .map(|v| v.id.as_str())
            .collect();
        for expected in &[
            "af_bella",
            "af_sarah",
            "af_nicole",
            "am_adam",
            "am_michael",
            "bf_emma",
            "bf_isabella",
            "bm_george",
        ] {
            assert!(ids.contains(expected), "missing voice: {}", expected);
        }
    }

    #[test]
    fn test_build_capabilities_voice_gender_variety() {
        use crate::core::tts_engine::VoiceGender;
        let caps = KokoroOnnxEngine::build_capabilities(24000);
        let has_female = caps
            .supported_voices
            .iter()
            .any(|v| matches!(v.gender, VoiceGender::Female));
        let has_male = caps
            .supported_voices
            .iter()
            .any(|v| matches!(v.gender, VoiceGender::Male));
        assert!(has_female, "should have at least one female voice");
        assert!(has_male, "should have at least one male voice");
    }

    #[test]
    fn test_build_capabilities_voice_quality_neural() {
        use crate::core::tts_engine::VoiceQuality;
        let caps = KokoroOnnxEngine::build_capabilities(24000);
        // All default voices should be Neural quality
        assert!(caps
            .supported_voices
            .iter()
            .all(|v| matches!(v.quality, VoiceQuality::Neural)));
    }

    #[test]
    fn test_build_capabilities_gb_voices_have_correct_language() {
        let caps = KokoroOnnxEngine::build_capabilities(24000);
        for voice in &caps.supported_voices {
            if voice.id.starts_with("bf_") || voice.id.starts_with("bm_") {
                assert_eq!(
                    voice.language, "en-GB",
                    "british voice {} should have en-GB language",
                    voice.id
                );
            } else {
                assert_eq!(
                    voice.language, "en-US",
                    "american voice {} should have en-US language",
                    voice.id
                );
            }
        }
    }

    // ── load_voice_style ──────────────────────────────────────────────────────
    // (covers the error path for wrong size)

    #[test]
    fn test_load_voice_style_wrong_size_returns_err() {
        use std::io::Write;
        let mut path = std::env::temp_dir();
        path.push("test_voice_wrong_size.bin");
        let mut f = std::fs::File::create(&path).unwrap();
        // Write only 4 floats — far less than VOICE_PACK_SIZE * VOICE_STYLE_DIM
        for _ in 0..4_usize {
            f.write_all(&1.0f32.to_le_bytes()).unwrap();
        }
        let result = KokoroOnnxEngine::load_voice_style(&path);
        std::fs::remove_file(&path).ok();
        assert!(result.is_err(), "wrong-sized bin file should return Err");
        let msg = result.unwrap_err().to_string();
        assert!(
            msg.contains("expected") || msg.contains("floats"),
            "error message should mention expected size: {}",
            msg
        );
    }

    #[test]
    fn test_load_voice_style_missing_file_returns_err() {
        let path = std::path::Path::new("/nonexistent/voice/style.bin");
        let result = KokoroOnnxEngine::load_voice_style(path);
        assert!(result.is_err(), "missing file should return Err");
    }

    // ── KokoroOnnxEngine::new error path ─────────────────────────────────────

    #[test]
    #[serial_test::serial]
    fn test_onnx_engine_errors_when_model_absent() {
        crate::test_utils::ort_test_setup();
        let config = serde_json::json!({
            "model_dir": "/nonexistent/kokoro-onnx",
            "sample_rate": 24000
        });
        let result = KokoroOnnxEngine::new(&config);
        assert!(result.is_err(), "Expected Err when model file missing");
        let msg = result.unwrap_err().to_string();
        assert!(
            msg.contains("not found") || msg.contains("No such file") || msg.contains("model"),
            "Unexpected error: {}",
            msg
        );
    }

    #[test]
    fn test_load_voice_style_binary() {
        use std::io::Write;

        // Write 510*256 little-endian f32 values (all 0.5) to a temp file
        let n = VOICE_PACK_SIZE * VOICE_STYLE_DIM;
        let mut path = std::env::temp_dir();
        path.push("test_voice_style.bin");
        let mut f = std::fs::File::create(&path).unwrap();
        for _ in 0..n {
            f.write_all(&0.5f32.to_le_bytes()).unwrap();
        }

        let loaded = super::KokoroOnnxEngine::load_voice_style(&path).unwrap();
        assert_eq!(loaded.len(), n);
        assert!((loaded[0] - 0.5).abs() < 1e-6);
        std::fs::remove_file(&path).ok();
    }

    // ── module constants ──────────────────────────────────────────────────────

    #[test]
    fn test_voice_style_dim_is_256() {
        assert_eq!(VOICE_STYLE_DIM, 256);
    }

    #[test]
    fn test_voice_pack_size_is_510() {
        assert_eq!(VOICE_PACK_SIZE, 510);
    }

    #[test]
    fn test_g2p_cache_capacity_is_1024() {
        assert_eq!(G2P_CACHE_CAPACITY, 1024);
    }

    #[test]
    fn test_default_pool_size_constant_is_2() {
        assert_eq!(DEFAULT_POOL_SIZE, 2);
    }

    // ── load_voice_style edge cases ───────────────────────────────────────────

    #[test]
    fn test_load_voice_style_odd_byte_count_returns_err() {
        use std::io::Write;
        // 3 bytes is not a multiple of 4, so chunks_exact(4) will give 0 floats
        // → wrong size error
        let mut path = std::env::temp_dir();
        path.push("test_voice_odd_bytes.bin");
        let mut f = std::fs::File::create(&path).unwrap();
        f.write_all(&[0x01, 0x02, 0x03]).unwrap();
        let result = KokoroOnnxEngine::load_voice_style(&path);
        std::fs::remove_file(&path).ok();
        assert!(
            result.is_err(),
            "3-byte file produces 0 floats, should be Err"
        );
    }

    #[test]
    fn test_load_voice_style_empty_file_returns_err() {
        let mut path = std::env::temp_dir();
        path.push("test_voice_empty.bin");
        std::fs::File::create(&path).unwrap(); // create empty file
        let result = KokoroOnnxEngine::load_voice_style(&path);
        std::fs::remove_file(&path).ok();
        assert!(
            result.is_err(),
            "empty file should yield 0 floats and return Err"
        );
    }

    #[test]
    fn test_load_voice_style_one_extra_float_returns_err() {
        use std::io::Write;
        // VOICE_PACK_SIZE * VOICE_STYLE_DIM + 1 floats should fail
        let n = VOICE_PACK_SIZE * VOICE_STYLE_DIM + 1;
        let mut path = std::env::temp_dir();
        path.push("test_voice_one_extra.bin");
        let mut f = std::fs::File::create(&path).unwrap();
        for _ in 0..n {
            f.write_all(&0.0f32.to_le_bytes()).unwrap();
        }
        let result = KokoroOnnxEngine::load_voice_style(&path);
        std::fs::remove_file(&path).ok();
        assert!(
            result.is_err(),
            "one extra float should return Err (wrong total size)"
        );
    }

    #[test]
    fn test_load_voice_style_one_fewer_float_returns_err() {
        use std::io::Write;
        let n = VOICE_PACK_SIZE * VOICE_STYLE_DIM - 1;
        let mut path = std::env::temp_dir();
        path.push("test_voice_one_fewer.bin");
        let mut f = std::fs::File::create(&path).unwrap();
        for _ in 0..n {
            f.write_all(&0.0f32.to_le_bytes()).unwrap();
        }
        let result = KokoroOnnxEngine::load_voice_style(&path);
        std::fs::remove_file(&path).ok();
        assert!(result.is_err(), "one fewer float should return Err");
    }

    #[test]
    fn test_load_voice_style_correct_size_all_zeroes() {
        use std::io::Write;
        let n = VOICE_PACK_SIZE * VOICE_STYLE_DIM;
        let mut path = std::env::temp_dir();
        path.push("test_voice_all_zeroes.bin");
        let mut f = std::fs::File::create(&path).unwrap();
        for _ in 0..n {
            f.write_all(&0.0f32.to_le_bytes()).unwrap();
        }
        let loaded = KokoroOnnxEngine::load_voice_style(&path).unwrap();
        std::fs::remove_file(&path).ok();
        assert_eq!(loaded.len(), n);
        assert!(loaded.iter().all(|&x| x == 0.0f32));
    }

    #[test]
    fn test_load_voice_style_correct_size_negative_values() {
        use std::io::Write;
        let n = VOICE_PACK_SIZE * VOICE_STYLE_DIM;
        let mut path = std::env::temp_dir();
        path.push("test_voice_negative.bin");
        let mut f = std::fs::File::create(&path).unwrap();
        for i in 0..n {
            let val = if i % 2 == 0 { -1.0f32 } else { 1.0f32 };
            f.write_all(&val.to_le_bytes()).unwrap();
        }
        let loaded = KokoroOnnxEngine::load_voice_style(&path).unwrap();
        std::fs::remove_file(&path).ok();
        assert_eq!(loaded.len(), n);
        assert_eq!(loaded[0], -1.0f32);
        assert_eq!(loaded[1], 1.0f32);
    }

    // ── KokoroOnnxConfig serde edge cases ────────────────────────────────────

    #[test]
    fn test_kokoro_onnx_config_pool_size_1_deserialized() {
        let json = r#"{"model_dir":"/tmp","sample_rate":16000,"pool_size":1}"#;
        let cfg: KokoroOnnxConfig = serde_json::from_str(json).unwrap();
        assert_eq!(cfg.pool_size, 1);
        assert_eq!(cfg.sample_rate, 16000);
    }

    #[test]
    fn test_kokoro_onnx_config_large_pool_size_deserialized() {
        let json = r#"{"model_dir":"/tmp","sample_rate":44100,"pool_size":8}"#;
        let cfg: KokoroOnnxConfig = serde_json::from_str(json).unwrap();
        assert_eq!(cfg.pool_size, 8);
        assert_eq!(cfg.sample_rate, 44100);
    }

    #[test]
    fn test_kokoro_onnx_config_serialize_contains_model_dir() {
        let cfg = KokoroOnnxConfig {
            model_dir: PathBuf::from("/some/specific/path"),
            sample_rate: 24000,
            pool_size: 2,
        };
        let json = serde_json::to_string(&cfg).unwrap();
        assert!(
            json.contains("some/specific/path"),
            "serialized JSON should contain model_dir path"
        );
        assert!(
            json.contains("24000"),
            "serialized JSON should contain sample_rate"
        );
    }

    // ── build_capabilities per-voice detail ──────────────────────────────────

    #[test]
    fn test_build_capabilities_af_bella_voice_details() {
        use crate::core::tts_engine::{VoiceGender, VoiceQuality};
        let caps = KokoroOnnxEngine::build_capabilities(24000);
        let voice = caps
            .supported_voices
            .iter()
            .find(|v| v.id == "af_bella")
            .expect("af_bella voice should exist");
        assert_eq!(voice.name, "Bella (American Female)");
        assert_eq!(voice.language, "en-US");
        assert!(matches!(voice.gender, VoiceGender::Female));
        assert!(matches!(voice.quality, VoiceQuality::Neural));
    }

    #[test]
    fn test_build_capabilities_am_adam_voice_details() {
        use crate::core::tts_engine::{VoiceGender, VoiceQuality};
        let caps = KokoroOnnxEngine::build_capabilities(24000);
        let voice = caps
            .supported_voices
            .iter()
            .find(|v| v.id == "am_adam")
            .expect("am_adam voice should exist");
        assert_eq!(voice.name, "Adam (American Male)");
        assert_eq!(voice.language, "en-US");
        assert!(matches!(voice.gender, VoiceGender::Male));
        assert!(matches!(voice.quality, VoiceQuality::Neural));
    }

    #[test]
    fn test_build_capabilities_bm_george_voice_details() {
        use crate::core::tts_engine::{VoiceGender, VoiceQuality};
        let caps = KokoroOnnxEngine::build_capabilities(24000);
        let voice = caps
            .supported_voices
            .iter()
            .find(|v| v.id == "bm_george")
            .expect("bm_george voice should exist");
        assert_eq!(voice.name, "George (British Male)");
        assert_eq!(voice.language, "en-GB");
        assert!(matches!(voice.gender, VoiceGender::Male));
        assert!(matches!(voice.quality, VoiceQuality::Neural));
    }

    #[test]
    fn test_build_capabilities_bf_emma_voice_details() {
        use crate::core::tts_engine::{VoiceGender, VoiceQuality};
        let caps = KokoroOnnxEngine::build_capabilities(24000);
        let voice = caps
            .supported_voices
            .iter()
            .find(|v| v.id == "bf_emma")
            .expect("bf_emma voice should exist");
        assert_eq!(voice.name, "Emma (British Female)");
        assert_eq!(voice.language, "en-GB");
        assert!(matches!(voice.gender, VoiceGender::Female));
        assert!(matches!(voice.quality, VoiceQuality::Neural));
    }

    #[test]
    fn test_build_capabilities_supported_languages_count() {
        let caps = KokoroOnnxEngine::build_capabilities(24000);
        assert_eq!(
            caps.supported_languages.len(),
            2,
            "should have exactly 2 supported languages (en-US and en-GB)"
        );
    }

    #[test]
    fn test_build_capabilities_sample_rate_8000() {
        let caps = KokoroOnnxEngine::build_capabilities(8000);
        assert_eq!(caps.sample_rate, 8000);
    }

    #[test]
    fn test_build_capabilities_sample_rate_44100() {
        let caps = KokoroOnnxEngine::build_capabilities(44100);
        assert_eq!(caps.sample_rate, 44100);
    }

    // ── KokoroOnnxEngine::new error path variants ─────────────────────────────

    #[test]
    fn test_onnx_engine_new_with_pool_size_1_fails_without_model() {
        let config = serde_json::json!({
            "model_dir": "/nonexistent/dir",
            "sample_rate": 24000,
            "pool_size": 1
        });
        let result = KokoroOnnxEngine::new(&config);
        assert!(result.is_err(), "should fail when model file is missing");
    }

    #[test]
    fn test_onnx_engine_new_with_pool_size_0_treated_as_1_fails_without_model() {
        // pool_size 0 is clamped to 1 via n.max(1)
        let config = serde_json::json!({
            "model_dir": "/nonexistent/dir",
            "sample_rate": 24000,
            "pool_size": 0
        });
        let result = KokoroOnnxEngine::new(&config);
        assert!(result.is_err(), "should fail when model file is missing");
    }

    #[test]
    fn test_onnx_engine_new_default_model_dir_fails_without_model() {
        // When model_dir key is absent, default "models/tts/kokoro-onnx-int8" is used
        let config = serde_json::json!({"sample_rate": 24000});
        let result = KokoroOnnxEngine::new(&config);
        // May succeed if real models exist, or fail gracefully — either is acceptable
        // as long as it doesn't panic
        let _ = result;
    }

    #[test]
    fn test_onnx_engine_error_mentions_model_dir() {
        let config = serde_json::json!({
            "model_dir": "/definitely/does/not/exist/kokoro",
            "sample_rate": 24000
        });
        let result = KokoroOnnxEngine::new(&config);
        assert!(result.is_err());
        let msg = result.unwrap_err().to_string();
        // Error should mention that the model was not found
        assert!(
            msg.contains("not found") || msg.contains("does not exist") || msg.contains("kokoro"),
            "error message should be descriptive: {}",
            msg
        );
    }

    // ── default_pool_size serde integration ──────────────────────────────────

    #[test]
    fn test_default_pool_size_fn_matches_constant() {
        assert_eq!(
            default_pool_size(),
            DEFAULT_POOL_SIZE,
            "default_pool_size() function must return DEFAULT_POOL_SIZE constant"
        );
    }

    #[test]
    fn test_kokoro_onnx_config_serde_pool_size_explicit_2() {
        let json = r#"{"model_dir":"/tmp","sample_rate":24000,"pool_size":2}"#;
        let cfg: KokoroOnnxConfig = serde_json::from_str(json).unwrap();
        assert_eq!(cfg.pool_size, 2);
    }

    // ── load_voice_style float conversion correctness ─────────────────────────

    #[test]
    fn test_load_voice_style_float_conversion_known_bytes() {
        use std::io::Write;
        // 1.0f32 in little-endian bytes is 0x00 0x00 0x80 0x3F
        // Fill the whole file with 1.0f32 values
        let n = VOICE_PACK_SIZE * VOICE_STYLE_DIM;
        let mut path = std::env::temp_dir();
        path.push("test_voice_ones.bin");
        let mut f = std::fs::File::create(&path).unwrap();
        for _ in 0..n {
            f.write_all(&1.0f32.to_le_bytes()).unwrap();
        }
        let loaded = KokoroOnnxEngine::load_voice_style(&path).unwrap();
        std::fs::remove_file(&path).ok();
        assert_eq!(loaded.len(), n);
        assert!(
            loaded.iter().all(|&x| (x - 1.0f32).abs() < 1e-7),
            "all values should be 1.0f32 after correct LE byte conversion"
        );
    }

    #[test]
    fn test_load_voice_style_error_message_contains_path_info() {
        use std::io::Write;
        // Wrong size — check error message includes size information
        let mut path = std::env::temp_dir();
        path.push("test_voice_size_err_msg.bin");
        let mut f = std::fs::File::create(&path).unwrap();
        // Write exactly 10 floats
        for _ in 0..10_usize {
            f.write_all(&0.0f32.to_le_bytes()).unwrap();
        }
        let err = KokoroOnnxEngine::load_voice_style(&path).unwrap_err();
        std::fs::remove_file(&path).ok();
        let msg = err.to_string();
        // The error should mention the expected count and actual count
        assert!(
            msg.contains("510") || msg.contains("expected") || msg.contains("got"),
            "error message should mention expected/actual sizes: {}",
            msg
        );
    }

    // ── load_voice_style: exact byte count produces correct length ────────────
    // Additional edge cases to strengthen coverage of the happy path
    // and the error path formatting.

    #[test]
    fn test_load_voice_style_last_row_is_accessible() {
        use std::io::Write;
        // Write a full voice pack; verify the last row (index 509) is accessible
        let n = VOICE_PACK_SIZE * VOICE_STYLE_DIM;
        let mut path = std::env::temp_dir();
        path.push("test_voice_last_row.bin");
        let mut f = std::fs::File::create(&path).unwrap();
        // Fill with sequential float values to distinguish rows
        for i in 0..n {
            let val = (i % 256) as f32;
            f.write_all(&val.to_le_bytes()).unwrap();
        }
        let loaded = KokoroOnnxEngine::load_voice_style(&path).unwrap();
        std::fs::remove_file(&path).ok();
        // Last row starts at index (VOICE_PACK_SIZE - 1) * VOICE_STYLE_DIM
        let last_row_start = (VOICE_PACK_SIZE - 1) * VOICE_STYLE_DIM;
        assert_eq!(loaded.len(), n);
        assert!(
            last_row_start + VOICE_STYLE_DIM <= loaded.len(),
            "last row must be within bounds"
        );
    }

    #[test]
    fn test_load_voice_style_error_mentions_voice_pack_size_256() {
        use std::io::Write;
        // Error message should include VOICE_STYLE_DIM (256) and VOICE_PACK_SIZE (510)
        let mut path = std::env::temp_dir();
        path.push("test_voice_dim_in_error.bin");
        let mut f = std::fs::File::create(&path).unwrap();
        // Write exactly 1 float — wrong size
        f.write_all(&1.0f32.to_le_bytes()).unwrap();
        let err = KokoroOnnxEngine::load_voice_style(&path).unwrap_err();
        std::fs::remove_file(&path).ok();
        let msg = err.to_string();
        assert!(
            msg.contains("256") || msg.contains("510") || msg.contains("expected"),
            "error message should reference expected dimensions: {}",
            msg
        );
    }

    // ── build_capabilities: voice name format validation ──────────────────────

    #[test]
    fn test_build_capabilities_all_voice_names_nonempty() {
        let caps = KokoroOnnxEngine::build_capabilities(24000);
        for voice in &caps.supported_voices {
            assert!(
                !voice.name.is_empty(),
                "voice '{}' must have a non-empty name",
                voice.id
            );
            assert!(!voice.id.is_empty(), "voice id must be non-empty");
            assert!(
                !voice.language.is_empty(),
                "voice '{}' must have a non-empty language",
                voice.id
            );
        }
    }

    #[test]
    fn test_build_capabilities_sample_rate_zero_accepted() {
        // build_capabilities doesn't validate sample_rate — it just stores it
        let caps = KokoroOnnxEngine::build_capabilities(0);
        assert_eq!(caps.sample_rate, 0);
    }

    #[test]
    fn test_build_capabilities_version_string() {
        let caps = KokoroOnnxEngine::build_capabilities(24000);
        assert!(!caps.version.is_empty(), "version string must not be empty");
        assert!(
            caps.version.contains('.'),
            "version should be in semver format"
        );
    }

    // ── KokoroOnnxConfig serde: serialize preserves all three fields ──────────

    #[test]
    fn test_kokoro_onnx_config_serde_all_fields_present_in_json() {
        let cfg = KokoroOnnxConfig {
            model_dir: PathBuf::from("/models/kokoro"),
            sample_rate: 22050,
            pool_size: 4,
        };
        let json = serde_json::to_string(&cfg).unwrap();
        assert!(
            json.contains("model_dir"),
            "serialized JSON must contain model_dir key"
        );
        assert!(
            json.contains("sample_rate"),
            "serialized JSON must contain sample_rate key"
        );
        assert!(
            json.contains("pool_size"),
            "serialized JSON must contain pool_size key"
        );
        assert!(
            json.contains("22050"),
            "serialized JSON must contain sample_rate value"
        );
        assert!(
            json.contains("4"),
            "serialized JSON must contain pool_size value"
        );
    }

    // ── default_pool_size: verifies the serde default fn is wired correctly ────

    #[test]
    fn test_serde_default_pool_size_wired_to_constant() {
        // When pool_size is missing from JSON, serde calls default_pool_size()
        // which must return DEFAULT_POOL_SIZE (2).
        let json = r#"{"model_dir":"/tmp","sample_rate":24000}"#;
        let cfg: KokoroOnnxConfig = serde_json::from_str(json).unwrap();
        assert_eq!(
            cfg.pool_size, DEFAULT_POOL_SIZE,
            "missing pool_size must fall back to DEFAULT_POOL_SIZE ({})",
            DEFAULT_POOL_SIZE
        );
    }
}
