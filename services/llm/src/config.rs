use anyhow::{Context, Result};
use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct LlmConfig {
    /// HTTP port this service listens on
    #[serde(default = "default_port")]
    pub port: u16,

    /// HRM-Text engine configuration (required at startup).
    #[serde(default)]
    pub hrm: Option<HrmConfig>,

    /// Which engine to load: "hrm" (default) or "smolvlm". Exactly one
    /// engine loads per process.
    #[serde(default)]
    pub engine: Option<EngineSelectConfig>,

    /// SmolVLM-256M-Instruct engine configuration (required when
    /// `engine.kind = "smolvlm"`).
    #[serde(default)]
    pub smolvlm: Option<SmolVlmConfig>,

    /// Vision bridge configuration for image description via classify+detect.
    #[serde(default)]
    pub vision_bridge: Option<VisionBridgeConfig>,

    #[serde(default)]
    pub agent: Option<AgentConfig>,

    #[serde(default)]
    pub limits: Option<LimitsConfig>,

    #[serde(default)]
    pub memory_gate: Option<MemoryGateConfig>,

    #[serde(default)]
    pub kv_cache: Option<KvCacheConfig>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct HrmConfig {
    /// Directory containing model.onnx, tokenizer.json, config.json.
    pub model_dir: String,

    /// Execution provider preference. "auto" picks CoreML on macOS, CUDA on
    /// Linux when n_gpu_layers > 0, else CPU. Other values: "cpu", "coreml",
    /// "cuda".
    #[serde(default = "default_ep_preference")]
    pub ep_preference: String,

    /// Use the int8 quantized variant (model.int8.onnx) if true. Defaults to
    /// false (fp16 model.onnx).
    #[serde(default)]
    pub use_quantized: Option<bool>,

    /// Number of CPU threads for ort sessions. Falls back to LlmConfig.n_threads
    /// if None.
    #[serde(default)]
    pub n_threads: Option<i32>,

    /// Stub/echo mode. When true, the engine boots WITHOUT loading the ONNX
    /// model or tokenizer and answers with a canned completion — the lightest
    /// possible way to prove the chat/agent pipeline works end-to-end.
    #[serde(default)]
    pub stub: Option<bool>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct EngineSelectConfig {
    #[serde(default = "default_engine_kind")]
    pub kind: String,
}

impl Default for EngineSelectConfig {
    fn default() -> Self {
        Self { kind: default_engine_kind() }
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct SmolVlmConfig {
    /// Directory containing vision_encoder_int8.onnx, embed_tokens_int8.onnx,
    /// decoder_model_merged_int8.onnx, tokenizer.json, tokenizer_config.json,
    /// preprocessor_config.json.
    pub model_dir: String,

    #[serde(default = "default_ep_preference")]
    pub ep_preference: String,

    #[serde(default)]
    pub n_threads: Option<i32>,

    /// Stub/echo mode — same escape hatch as `HrmConfig.stub`.
    #[serde(default)]
    pub stub: Option<bool>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct VisionBridgeConfig {
    #[serde(default = "default_vb_enabled")]
    pub enabled: bool,
    #[serde(default = "default_vb_base")]
    pub main_server_base: String,
    #[serde(default = "default_vb_classify")]
    pub classify_endpoint: String,
    #[serde(default = "default_vb_detect")]
    pub detect_endpoint: String,
    #[serde(default = "default_vb_classify_timeout")]
    pub classify_timeout_ms: u64,
    #[serde(default = "default_vb_detect_timeout")]
    pub detect_timeout_ms: u64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct AgentConfig {
    #[serde(default = "default_agent_enabled")]
    pub enabled: bool,
    #[serde(default = "default_max_steps")]
    pub max_steps: usize,
    #[serde(default = "default_max_run_ms")]
    pub max_run_ms: u64,
    #[serde(default = "default_per_tool_ms")]
    pub per_tool_ms: u64,
    #[serde(default = "default_max_concurrent_runs")]
    pub max_concurrent_runs: usize,
    #[serde(default = "default_reflect_max_tokens")]
    pub reflect_max_tokens: u32,
    #[serde(default = "default_planner_temperature")]
    pub planner_temperature: f32,
    #[serde(default)]
    pub http_fetch: Option<HttpFetchConfig>,
    #[serde(default)]
    pub tools: Option<AgentToolsConfig>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct HttpFetchConfig {
    #[serde(default = "default_agent_enabled")]
    pub enabled: bool,
    #[serde(default)]
    pub allowlist: Vec<String>,
    #[serde(default = "default_http_fetch_max_bytes")]
    pub max_bytes: usize,
    #[serde(default)]
    pub follow_redirects: bool,
}

#[derive(Debug, Clone, Deserialize)]
pub struct AgentToolsConfig {
    #[serde(default = "default_main_server_base")]
    pub main_server_base: String,
    #[serde(default = "default_classify_endpoint")]
    pub classify_endpoint: String,
    #[serde(default = "default_detect_endpoint")]
    pub detect_endpoint: String,
    #[serde(default = "default_tts_endpoint")]
    pub tts_endpoint: String,
    #[serde(default = "default_stt_endpoint")]
    pub stt_endpoint: String,
}

impl Default for HttpFetchConfig {
    fn default() -> Self {
        Self {
            enabled: default_agent_enabled(),
            allowlist: Vec::new(),
            max_bytes: default_http_fetch_max_bytes(),
            follow_redirects: false,
        }
    }
}

impl Default for AgentToolsConfig {
    fn default() -> Self {
        Self {
            main_server_base: default_main_server_base(),
            classify_endpoint: default_classify_endpoint(),
            detect_endpoint: default_detect_endpoint(),
            tts_endpoint: default_tts_endpoint(),
            stt_endpoint: default_stt_endpoint(),
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct LimitsConfig {
    #[serde(default = "default_max_image_bytes")]
    pub max_image_bytes: usize,
    #[serde(default = "default_max_prompt_chars")]
    pub max_prompt_chars: usize,
    #[serde(default = "default_max_messages")]
    pub max_messages: usize,
    #[serde(default = "default_max_generated_tokens")]
    pub max_generated_tokens: u32,
    /// Hard ceiling on total sequence length (prompt + image placeholder
    /// tokens) for engines that have no per-model context size of their own.
    /// HRM-Text's ceiling comes from its bundled `config.json`
    /// (`HrmRuntimeConfig.ctx_size`) and does NOT use this field; SmolVLM has
    /// no equivalent model-embedded value wired up, so `SmolVlmEngine` uses
    /// this as its prefill/decode guard (see `smolvlm::SmolVlmEngine::load`).
    /// Default matches SmolVLM-256M's backbone `max_position_embeddings`
    /// (8192, per `models/smolvlm-256m/config.json`), which is also at least
    /// as permissive as `max_prompt_chars`'s effective token budget
    /// (16_384 chars / ~4 chars-per-token ≈ 4096 tokens).
    #[serde(default = "default_max_ctx_size")]
    pub max_ctx_size: u32,
    #[serde(default)]
    pub json: LimitsJsonConfig,
    #[serde(default)]
    pub channels: LimitsChannelsConfig,
    #[serde(default)]
    pub engine: LimitsEngineConfig,
    #[serde(default)]
    pub results: LimitsResultsConfig,
}

#[derive(Debug, Clone, Deserialize)]
pub struct LimitsJsonConfig {
    #[serde(default = "default_body_limit")]
    pub body_limit: usize,
}

#[derive(Debug, Clone, Deserialize)]
pub struct LimitsChannelsConfig {
    #[serde(default = "default_sse_event_buffer")]
    pub sse_event_buffer: usize,
    #[serde(default = "default_chat_stream_buffer")]
    pub chat_stream_buffer: usize,
    #[serde(default = "default_chat_nonstream_buffer")]
    pub chat_nonstream_buffer: usize,
}

#[derive(Debug, Clone, Deserialize)]
pub struct LimitsEngineConfig {
    #[serde(default = "default_engine_max_concurrent")]
    pub max_concurrent: usize,
}

#[derive(Debug, Clone, Deserialize)]
pub struct LimitsResultsConfig {
    #[serde(default = "default_per_run_bytes")]
    pub per_run_bytes: usize,
    #[serde(default = "default_field_trim_above")]
    pub field_trim_above: usize,
}

/// `MemoryGate` (see `memory_gate.rs`) only ever polls RSS lazily inside
/// `admit()` — there is no background-poller thread implemented. `true` is
/// therefore the only behavior that exists; `LlmConfig::load` rejects
/// `false` at startup (see `validate`) rather than silently keeping the
/// lazy-poll behavior while claiming something else was configured.
#[derive(Debug, Clone, Deserialize)]
pub struct MemoryGateConfig {
    #[serde(default = "default_high_water_mb")]
    pub high_water_mb: u64,
    #[serde(default = "default_low_water_mb")]
    pub low_water_mb: u64,
    #[serde(default = "default_poll_on_admit_only")]
    pub poll_on_admit_only: bool,
}

/// KV-cache decode toggle. `SmolVlmEngine::generate` always decodes via its
/// KV-cache (`decode_step`'s `past_k`/`past_v` inputs); `HrmEngine` has no
/// KV-cache path at all (its `prefill`/`decode_greedy` re-run the full
/// monolithic graph over the whole prefix every step). Neither engine has a
/// non-KV-cache fallback to switch to, so `enabled = false` has nothing to
/// select — `LlmConfig::load` rejects it at startup (see `validate`) instead
/// of silently ignoring it.
#[derive(Debug, Clone, Deserialize)]
pub struct KvCacheConfig {
    #[serde(default = "default_kv_cache_enabled")]
    pub enabled: bool,
}

impl Default for LimitsJsonConfig {
    fn default() -> Self { Self { body_limit: default_body_limit() } }
}
impl Default for LimitsChannelsConfig {
    fn default() -> Self {
        Self {
            sse_event_buffer: default_sse_event_buffer(),
            chat_stream_buffer: default_chat_stream_buffer(),
            chat_nonstream_buffer: default_chat_nonstream_buffer(),
        }
    }
}
impl Default for LimitsEngineConfig {
    fn default() -> Self { Self { max_concurrent: default_engine_max_concurrent() } }
}
impl Default for LimitsResultsConfig {
    fn default() -> Self {
        Self {
            per_run_bytes: default_per_run_bytes(),
            field_trim_above: default_field_trim_above(),
        }
    }
}
impl Default for LimitsConfig {
    fn default() -> Self {
        Self {
            max_image_bytes: default_max_image_bytes(),
            max_prompt_chars: default_max_prompt_chars(),
            max_messages: default_max_messages(),
            max_generated_tokens: default_max_generated_tokens(),
            max_ctx_size: default_max_ctx_size(),
            json: LimitsJsonConfig::default(),
            channels: LimitsChannelsConfig::default(),
            engine: LimitsEngineConfig::default(),
            results: LimitsResultsConfig::default(),
        }
    }
}

fn default_max_image_bytes() -> usize { 2_097_152 }
fn default_max_prompt_chars() -> usize { 16_384 }
fn default_max_messages() -> usize { 32 }
fn default_max_generated_tokens() -> u32 { 512 }
fn default_max_ctx_size() -> u32 { 8192 }
fn default_body_limit() -> usize { 4_194_304 }
fn default_sse_event_buffer() -> usize { 8 }
fn default_chat_stream_buffer() -> usize { 16 }
fn default_chat_nonstream_buffer() -> usize { 64 }
fn default_engine_max_concurrent() -> usize { 1 }
fn default_per_run_bytes() -> usize { 65_536 }
fn default_field_trim_above() -> usize { 8_192 }
fn default_high_water_mb() -> u64 { 4_096 }
fn default_low_water_mb() -> u64 { 3_072 }
fn default_poll_on_admit_only() -> bool { true }
fn default_kv_cache_enabled() -> bool { true }

fn default_agent_enabled() -> bool { true }
fn default_max_steps() -> usize { 8 }
fn default_max_run_ms() -> u64 { 60_000 }
fn default_per_tool_ms() -> u64 { 5_000 }
fn default_max_concurrent_runs() -> usize { 4 }
fn default_reflect_max_tokens() -> u32 { 128 }
fn default_planner_temperature() -> f32 { 0.0 }
fn default_http_fetch_max_bytes() -> usize { 65_536 }
fn default_main_server_base() -> String { "http://127.0.0.1:8000".to_string() }
fn default_classify_endpoint() -> String { "/classify/batch".to_string() }
fn default_detect_endpoint() -> String { "/yolo/detect".to_string() }
fn default_tts_endpoint() -> String { "/tts/stream".to_string() }
fn default_stt_endpoint() -> String { "/stt/transcribe".to_string() }

fn default_port() -> u16 { 8001 }
fn default_ep_preference() -> String { "auto".to_string() }
fn default_engine_kind() -> String { "hrm".to_string() }

fn default_vb_enabled() -> bool { true }
fn default_vb_base() -> String { "http://127.0.0.1:8000".to_string() }
fn default_vb_classify() -> String { "/classify/batch".to_string() }
fn default_vb_detect() -> String { "/yolo/detect".to_string() }
fn default_vb_classify_timeout() -> u64 { 1500 }
fn default_vb_detect_timeout() -> u64 { 2500 }

impl LlmConfig {
    /// Load from `config.toml` in the current working directory, or use defaults.
    pub fn load() -> Result<Self> {
        let config_path = std::path::PathBuf::from("config.toml");
        let cfg = if config_path.exists() {
            let text = std::fs::read_to_string(&config_path)
                .context("read config.toml")?;
            toml::from_str(&text).context("parse config.toml")?
        } else {
            tracing::warn!("config.toml not found, using defaults");
            Self {
                port: 8001,
                hrm: None,
                engine: None,
                smolvlm: None,
                vision_bridge: None,
                agent: None,
                limits: None,
                memory_gate: None,
                kv_cache: None,
            }
        };
        cfg.validate()?;
        Ok(cfg)
    }

    /// Rejects config values that parse cleanly but select behavior nothing
    /// in this crate implements — see the doc comments on `KvCacheConfig`
    /// and `MemoryGateConfig` for why these two specifically have no
    /// alternate code path to switch to.
    fn validate(&self) -> Result<()> {
        if let Some(kv) = &self.kv_cache {
            anyhow::ensure!(
                kv.enabled,
                "kv_cache.enabled = false is not supported: both engines always decode via \
                 their KV-cache path (SmolVLM) or have no KV-cache path to disable (HRM). \
                 Remove [kv_cache] or set enabled = true."
            );
        }
        if let Some(mg) = &self.memory_gate {
            anyhow::ensure!(
                mg.poll_on_admit_only,
                "memory_gate.poll_on_admit_only = false is not supported: MemoryGate only \
                 implements lazy polling on admit() — there is no background-poller mode to \
                 switch to. Remove [memory_gate] poll_on_admit_only or set it to true."
            );
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_hrm_section_with_defaults() {
        let toml_text = r#"
port = 8001

[hrm]
model_dir = "models/hrm-text-1b"
"#;
        let cfg: LlmConfig = toml::from_str(toml_text).unwrap();
        let hrm = cfg.hrm.expect("hrm section present");
        assert_eq!(hrm.model_dir, "models/hrm-text-1b");
        assert_eq!(hrm.ep_preference, "auto");
        assert!(hrm.use_quantized.is_none() || hrm.use_quantized == Some(false));
    }

    #[test]
    fn parses_agent_section_with_defaults() {
        let toml_text = r#"
port = 8001
[agent]
enabled = true
"#;
        let cfg: LlmConfig = toml::from_str(toml_text).unwrap();
        let agent = cfg.agent.expect("agent section");
        assert!(agent.enabled);
        assert_eq!(agent.max_steps, 8);
        assert_eq!(agent.max_run_ms, 60_000);
        let hf = agent.http_fetch.unwrap_or_default();
        assert!(hf.allowlist.is_empty());
    }

    #[test]
    fn parses_limits_section_with_defaults() {
        let toml_text = r#"
port = 8001
[limits]
max_image_bytes = 1024
"#;
        let cfg: LlmConfig = toml::from_str(toml_text).unwrap();
        let limits = cfg.limits.expect("limits section");
        assert_eq!(limits.max_image_bytes, 1024);
        assert_eq!(limits.max_prompt_chars, 16_384);
        assert_eq!(limits.max_generated_tokens, 512);
        assert_eq!(limits.engine.max_concurrent, 1);
        assert_eq!(limits.json.body_limit, 4_194_304);
        assert_eq!(limits.channels.sse_event_buffer, 8);
        assert_eq!(limits.results.field_trim_above, 8_192);
    }

    #[test]
    fn parses_memory_gate_section() {
        let toml_text = r#"
port = 8001
[memory_gate]
high_water_mb = 8192
"#;
        let cfg: LlmConfig = toml::from_str(toml_text).unwrap();
        let mg = cfg.memory_gate.expect("memory_gate section");
        assert_eq!(mg.high_water_mb, 8192);
        assert_eq!(mg.low_water_mb, 3_072);
    }

    #[test]
    fn parses_kv_cache_section() {
        let toml_text = r#"
port = 8001
[kv_cache]
enabled = false
"#;
        let cfg: LlmConfig = toml::from_str(toml_text).unwrap();
        let kv = cfg.kv_cache.expect("kv_cache section");
        assert!(!kv.enabled);
    }

    #[test]
    fn validate_rejects_kv_cache_disabled() {
        // Parsing succeeds (tested above); `validate()` — invoked by `load()` —
        // is what actually enforces that no code path implements this.
        let toml_text = r#"
port = 8001
[kv_cache]
enabled = false
"#;
        let cfg: LlmConfig = toml::from_str(toml_text).unwrap();
        let err = cfg.validate().unwrap_err().to_string();
        assert!(err.contains("kv_cache.enabled"), "got: {err}");
    }

    #[test]
    fn validate_accepts_kv_cache_enabled_or_absent() {
        let cfg: LlmConfig = toml::from_str("port = 8001\n[kv_cache]\nenabled = true\n").unwrap();
        assert!(cfg.validate().is_ok());
        let cfg: LlmConfig = toml::from_str("port = 8001\n").unwrap();
        assert!(cfg.validate().is_ok());
    }

    #[test]
    fn validate_rejects_memory_gate_poll_on_admit_only_disabled() {
        let toml_text = r#"
port = 8001
[memory_gate]
poll_on_admit_only = false
"#;
        let cfg: LlmConfig = toml::from_str(toml_text).unwrap();
        let err = cfg.validate().unwrap_err().to_string();
        assert!(err.contains("poll_on_admit_only"), "got: {err}");
    }

    #[test]
    fn max_ctx_size_defaults_to_smolvlm_backbone_context() {
        let toml_text = r#"
port = 8001
[limits]
max_image_bytes = 1024
"#;
        let cfg: LlmConfig = toml::from_str(toml_text).unwrap();
        assert_eq!(cfg.limits.unwrap().max_ctx_size, 8_192);
    }

    #[test]
    fn defaults_engine_kind_to_hrm_when_section_absent() {
        let toml_text = r#"
port = 8001
[hrm]
model_dir = "models/hrm-text-1b"
"#;
        let cfg: LlmConfig = toml::from_str(toml_text).unwrap();
        assert_eq!(cfg.engine.unwrap_or_default().kind, "hrm");
    }

    #[test]
    fn parses_engine_section_with_smolvlm_kind() {
        let toml_text = r#"
port = 8001
[engine]
kind = "smolvlm"
[smolvlm]
model_dir = "models/smolvlm-256m"
"#;
        let cfg: LlmConfig = toml::from_str(toml_text).unwrap();
        assert_eq!(cfg.engine.unwrap().kind, "smolvlm");
        let sv = cfg.smolvlm.expect("smolvlm section present");
        assert_eq!(sv.model_dir, "models/smolvlm-256m");
        assert_eq!(sv.ep_preference, "auto");
    }
}
