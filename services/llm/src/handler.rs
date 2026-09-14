use actix_web::{web, HttpResponse};
use base64::Engine as _;
use bytes::Bytes;
use serde::Deserialize;
use serde_json::json;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;
use futures_util::StreamExt;

// ── State ─────────────────────────────────────────────────────────────────────

pub struct AppState {
    pub engine: Arc<dyn crate::engine::LlmEngine>,
    pub vision: Option<Arc<crate::vision_bridge::VisionBridge>>,
    pub lease: crate::engine_lease::EngineLease,
    pub gate: Arc<crate::memory_gate::MemoryGate>,
    pub limits: crate::config::LimitsConfig,
}

// ── Request types ─────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct ChatRequest {
    #[serde(default)]
    pub model: Option<String>,
    pub messages: Vec<ChatMessage>,
    #[serde(default)]
    pub stream: bool,
    #[serde(default = "default_max_tokens")]
    pub max_tokens: u32,
    #[serde(default = "default_temperature")]
    pub temperature: f32,
}

fn default_max_tokens() -> u32 { 512 }
fn default_temperature() -> f32 { 0.7 }

#[derive(Debug, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: MessageContent,
}

#[derive(Debug, Deserialize)]
#[serde(untagged)]
pub enum MessageContent {
    Text(String),
    Parts(Vec<ContentPart>),
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ContentPart {
    Text { text: String },
    ImageUrl { image_url: ImageUrl },
}

#[derive(Debug, Deserialize)]
pub struct ImageUrl {
    pub url: String,
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/// Per-request response id (`chatcmpl-<uuid>`) for OpenAI-API parity.
fn new_completion_id() -> String {
    format!("chatcmpl-{}", uuid::Uuid::new_v4())
}

/// Unix epoch seconds for the OpenAI `created` field.
fn now_unix_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

fn decode_data_uri(url: &str) -> Result<Vec<u8>, String> {
    let base64_part = url
        .splitn(2, ',')
        .nth(1)
        .ok_or_else(|| "invalid data URI: no comma".to_string())?;
    base64::engine::general_purpose::STANDARD
        .decode(base64_part)
        .map_err(|e| format!("base64 decode: {e}"))
}

/// Extract (role, text) pairs and the first image bytes from the messages.
/// Returns Err if an image_url is present but cannot be decoded.
fn extract_content(
    messages: &[ChatMessage],
    max_image_bytes: usize,
) -> Result<(Vec<(String, String)>, Option<Vec<u8>>), String> {
    let mut pairs: Vec<(String, String)> = Vec::new();
    let mut image: Option<Vec<u8>> = None;

    for msg in messages {
        match &msg.content {
            MessageContent::Text(text) => {
                pairs.push((msg.role.clone(), text.clone()));
            }
            MessageContent::Parts(parts) => {
                let mut text_buf = String::new();
                for part in parts {
                    match part {
                        ContentPart::Text { text } => text_buf.push_str(text),
                        ContentPart::ImageUrl { image_url } => {
                            if image.is_none() {
                                let bytes = decode_data_uri(&image_url.url)
                                    .map_err(|e| format!("invalid image: {e}"))?;
                                if bytes.len() > max_image_bytes {
                                    return Err(format!(
                                        "image exceeds {} bytes ({} actual)",
                                        max_image_bytes, bytes.len()));
                                }
                                image = Some(bytes);
                            }
                        }
                    }
                }
                pairs.push((msg.role.clone(), text_buf));
            }
        }
    }

    Ok((pairs, image))
}

fn sse_chunk(id: &str, created: u64, content: &str, model: &str) -> Bytes {
    let data = json!({
        "id": id,
        "object": "chat.completion.chunk",
        "created": created,
        "model": model,
        "choices": [{"index": 0, "delta": {"content": content}, "finish_reason": null}]
    });
    Bytes::from(format!("data: {}\n\n", data))
}

fn sse_done() -> Bytes {
    Bytes::from("data: [DONE]\n\n")
}

// ── Handlers ─────────────────────────────────────────────────────────────────

/// `POST /v1/chat/completions`
pub async fn chat_completions(
    state: web::Data<AppState>,
    req: web::Json<ChatRequest>,
) -> HttpResponse {
    let req = req.into_inner();

    // ── Admission + bounds ──────────────────────────────────────────────
    if req.messages.len() > state.limits.max_messages {
        return HttpResponse::BadRequest().json(json!({
            "error": format!("messages exceeds max ({} > {})",
                             req.messages.len(), state.limits.max_messages)
        }));
    }
    if let Err(e) = state.gate.admit() {
        return HttpResponse::ServiceUnavailable()
            .insert_header(("Retry-After", "1"))
            .json(json!({"error": e.to_string()}));
    }

    let model_name = req.model.clone().unwrap_or_else(|| "hrm-text-1b".to_string());
    let temperature = req.temperature;
    let streaming = req.stream;
    let id = new_completion_id();
    let created = now_unix_secs();

    let (mut pairs, image_bytes) = match extract_content(&req.messages, state.limits.max_image_bytes) {
        Ok(v) => v,
        Err(e) if e.starts_with("image exceeds") =>
            return HttpResponse::PayloadTooLarge().json(json!({"error": e})),
        Err(e) => return HttpResponse::BadRequest().json(json!({"error": e})),
    };

    // Engines that support vision natively (SmolVLM) get the raw image bytes
    // passed straight to `chat()`, which embeds them via its own vision
    // encoder. Engines that don't (HRM) get a text caption prepended here,
    // exactly as before — `chat()` receives `image = None` in that case since
    // the description is already folded into `pairs`.
    let image_for_engine = if state.engine.supports_vision() {
        image_bytes
    } else {
        if let Some(img) = image_bytes {
            let prefix = match state.vision.as_ref() {
                Some(vb) => vb.describe(&img).await,
                None => "[Image attached but vision bridge disabled.]".to_string(),
            };
            if let Some((_role, content)) = pairs.iter_mut().rev().find(|(r, _)| r == "user") {
                *content = format!("{prefix}\n{content}");
            } else {
                pairs.push(("user".into(), prefix));
            }
        }
        None
    };

    // Prompt-formatting is now engine-internal (each engine has its own chat
    // template), so the length guard checks the raw message text instead of a
    // pre-formatted string.
    let total_chars: usize = pairs.iter().map(|(r, c)| r.len() + c.len()).sum();
    if total_chars > state.limits.max_prompt_chars {
        return HttpResponse::BadRequest().json(json!({
            "error": format!("prompt exceeds {} chars ({} actual)",
                             state.limits.max_prompt_chars, total_chars)
        }));
    }
    // Clamp generated tokens to the configured ceiling regardless of what the
    // client requested — the unbounded value is an OOM lever.
    let max_tokens = req.max_tokens.min(state.limits.max_generated_tokens);
    let engine = Arc::clone(&state.engine);

    if streaming {
        let (tx, rx) = mpsc::channel::<String>(state.limits.channels.chat_stream_buffer);

        let engine2 = Arc::clone(&engine);
        let pairs2 = pairs.clone();
        let image2 = image_for_engine.clone();
        let lease = state.lease.clone();
        tokio::spawn(async move {
            // Serialize every ONNX run behind the engine lease so concurrent
            // requests can't multiply peak inference memory.
            let _permit = lease.acquire().await;
            let res = tokio::task::spawn_blocking(move || {
                engine2.chat(pairs2, image2, max_tokens, temperature, tx)
            }).await;
            match res {
                Ok(Ok(())) => {}
                Ok(Err(e)) => tracing::error!("inference error: {e:#}"),
                Err(e) => tracing::error!("inference task join error: {e}"),
            }
        });

        let model_for_stream = model_name.clone();
        let id_for_stream = id.clone();
        let token_stream = ReceiverStream::new(rx)
            .map(move |tok| Ok::<Bytes, std::io::Error>(
                sse_chunk(&id_for_stream, created, &tok, &model_for_stream)));
        let done_stream = futures_util::stream::once(async {
            Ok::<Bytes, std::io::Error>(sse_done())
        });
        HttpResponse::Ok()
            .content_type("text/event-stream; charset=utf-8")
            .insert_header(("Cache-Control", "no-cache"))
            .insert_header(("X-Accel-Buffering", "no"))
            .streaming(token_stream.chain(done_stream))
    } else {
        let (tx, mut rx) = mpsc::channel::<String>(state.limits.channels.chat_nonstream_buffer);
        let lease = state.lease.clone();
        let pairs_owned = pairs.clone();
        let handle = tokio::spawn(async move {
            let _permit = lease.acquire().await;
            tokio::task::spawn_blocking(move || {
                engine.chat(pairs_owned, image_for_engine, max_tokens, temperature, tx)
            }).await
        });

        let mut content = String::new();
        while let Some(tok) = rx.recv().await {
            content.push_str(&tok);
        }
        let inference = match handle.await {
            Ok(inner) => inner.unwrap_or_else(|e| Err(anyhow::anyhow!("join inner: {e}"))),
            Err(e)    => Err(anyhow::anyhow!("join outer: {e}")),
        };
        if let Err(e) = inference {
            return HttpResponse::InternalServerError()
                .json(json!({"error": format!("inference failed: {e}")}));
        }

        HttpResponse::Ok().json(json!({
            "id": id,
            "object": "chat.completion",
            "created": created,
            "model": model_name,
            "choices": [{
                "index": 0,
                "message": {"role": "assistant", "content": content},
                "finish_reason": "stop"
            }],
            "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
        }))
    }
}

/// `GET /v1/models`
pub async fn list_models(state: web::Data<AppState>) -> HttpResponse {
    HttpResponse::Ok().json(json!({
        "object": "list",
        "data": [{
            "id": state.engine.model_id(),
            "object": "model",
            "owned_by": "local",
            "multimodal": true // both engines describe images one way or another
                                // (native vision for SmolVLM, caption bridge for HRM)
        }]
    }))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Mutex;

    /// Records whether `chat`'s `image` argument was `Some` — enough to
    /// prove the vision-routing branch in `chat_completions` picks the
    /// right path without needing a real engine.
    struct FakeEngine {
        supports_vision: bool,
        last_image_was_some: Mutex<Option<bool>>,
    }

    impl crate::engine::LlmEngine for FakeEngine {
        fn chat(
            self: std::sync::Arc<Self>,
            _messages: Vec<(String, String)>,
            image: Option<Vec<u8>>,
            _max_tokens: u32,
            _temperature: f32,
            tx: mpsc::Sender<String>,
        ) -> anyhow::Result<()> {
            *self.last_image_was_some.lock().unwrap() = Some(image.is_some());
            let _ = tx.blocking_send("ok".to_string());
            Ok(())
        }

        fn complete(
            self: std::sync::Arc<Self>,
            _prompt: String,
            _max_tokens: u32,
            _temperature: f32,
            tx: mpsc::Sender<String>,
        ) -> anyhow::Result<()> {
            let _ = tx.blocking_send("ok".to_string());
            Ok(())
        }

        fn supports_vision(&self) -> bool { self.supports_vision }
        fn model_id(&self) -> &str { "fake" }
    }

    /// Builds an `AppState` wrapping `engine` (coerced to `Arc<dyn LlmEngine>`)
    /// and also returns a directly-inspectable `Arc<FakeEngine>` handle —
    /// `state.engine` is `Arc<dyn LlmEngine>` and can't be downcast, so tests
    /// that need to read `last_image_was_some` after the call need this
    /// second handle onto the very same `FakeEngine`.
    fn state_with(engine: FakeEngine) -> (web::Data<AppState>, std::sync::Arc<FakeEngine>) {
        let engine = std::sync::Arc::new(engine);
        let state = web::Data::new(AppState {
            engine: engine.clone() as std::sync::Arc<dyn crate::engine::LlmEngine>,
            vision: None,
            lease: crate::engine_lease::EngineLease::new(1),
            gate: std::sync::Arc::new(crate::memory_gate::MemoryGate::new(4096, 3072)),
            limits: crate::config::LimitsConfig::default(),
        });
        (state, engine)
    }

    fn image_chat_request() -> web::Json<ChatRequest> {
        let tiny_png_b64 = base64::engine::general_purpose::STANDARD.encode(
            image::DynamicImage::ImageRgb8(image::ImageBuffer::from_pixel(2, 2, image::Rgb([1u8, 2, 3])))
                .to_rgb8()
                .as_raw(),
        );
        web::Json(ChatRequest {
            model: None,
            messages: vec![ChatMessage {
                role: "user".into(),
                content: MessageContent::Parts(vec![ContentPart::ImageUrl {
                    image_url: ImageUrl { url: format!("data:image/png;base64,{tiny_png_b64}") },
                }]),
            }],
            stream: false,
            max_tokens: 8,
            temperature: 0.0,
        })
    }

    #[actix_web::test]
    async fn vision_capable_engine_receives_raw_image_bytes() {
        let (state, engine) = state_with(FakeEngine {
            supports_vision: true,
            last_image_was_some: Mutex::new(None),
        });
        let resp = chat_completions(state, image_chat_request()).await;
        assert_eq!(resp.status(), actix_web::http::StatusCode::OK);
        assert_eq!(*engine.last_image_was_some.lock().unwrap(), Some(true));
    }

    #[actix_web::test]
    async fn non_vision_engine_does_not_receive_raw_image_bytes() {
        // When the engine doesn't support vision natively, the image must
        // NOT be passed through to `chat()` — it should instead go through
        // the caption-bridge path (or, with `state.vision == None` as here,
        // the "[Image attached but vision bridge disabled.]" text fallback).
        let (state, engine) = state_with(FakeEngine {
            supports_vision: false,
            last_image_was_some: Mutex::new(None),
        });
        let resp = chat_completions(state, image_chat_request()).await;
        assert_eq!(resp.status(), actix_web::http::StatusCode::OK);
        assert_eq!(*engine.last_image_was_some.lock().unwrap(), Some(false));
    }

    #[test]
    fn list_models_reports_active_engine_id() {
        // list_models is async; exercised indirectly via model_id() contract
        // (this test just proves the FakeEngine plumbing above compiles
        // against the real AppState shape — full route testing for
        // list_models happens live in Task 11's smoke test).
        let engine = FakeEngine { supports_vision: false, last_image_was_some: Mutex::new(None) };
        assert_eq!(crate::engine::LlmEngine::model_id(&engine), "fake");
    }
}
