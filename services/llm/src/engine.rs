//! Engine abstraction so `handler.rs`/`main.rs`/the agent planner work with
//! whichever engine `config.toml`'s `[engine] kind` selects, without knowing
//! which concrete type it is.

use anyhow::Result;
use std::sync::Arc;
use tokio::sync::mpsc;

pub trait LlmEngine: Send + Sync {
    /// Full chat-completion path: format `messages` per this engine's own
    /// chat template, run `image` through vision encoding when
    /// `supports_vision()` is true (ignored otherwise — callers should
    /// already have routed non-vision-capable engines through the
    /// caption bridge before calling this), then generate and stream
    /// tokens through `tx`.
    fn chat(
        self: Arc<Self>,
        messages: Vec<(String, String)>,
        image: Option<Vec<u8>>,
        max_tokens: u32,
        temperature: f32,
        tx: mpsc::Sender<String>,
    ) -> Result<()>;

    /// Raw text-in/text-out completion — no chat template applied. Used by
    /// the agent planner, which builds its own fully-formatted prompt text.
    fn complete(
        self: Arc<Self>,
        prompt: String,
        max_tokens: u32,
        temperature: f32,
        tx: mpsc::Sender<String>,
    ) -> Result<()>;

    /// True if this engine can consume raw image bytes directly (via
    /// `chat`'s `image` param) instead of needing the classify/detect
    /// caption bridge.
    fn supports_vision(&self) -> bool;

    /// Model id reported by `GET /v1/models` and the `model` field of
    /// completions.
    fn model_id(&self) -> &str;
}
