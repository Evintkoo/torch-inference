use actix_web::{web, HttpResponse};
use base64::Engine as _;
use bytes::Bytes;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;
use futures_util::StreamExt;

use crate::engine::{FinishReason, InferStats, LlamaEngine};

/// Total timeout for non-streaming `/v1/chat/completions` responses.
/// A pathological inference (hang or panic) no longer blocks the request
/// future indefinitely. Override via `KOLOSAL_LLM_RESP_TIMEOUT_SECS`.
fn response_timeout() -> Duration {
    let secs = std::env::var("KOLOSAL_LLM_RESP_TIMEOUT_SECS")
        .ok()
        .and_then(|v| v.parse::<u64>().ok())
        .unwrap_or(300);
    Duration::from_secs(secs)
}

fn now_unix_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

fn new_completion_id() -> String {
    format!("chatcmpl-{}", uuid::Uuid::new_v4())
}

// ── State ─────────────────────────────────────────────────────────────────────

pub struct AppState {
    pub engine: Arc<LlamaEngine>,
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
fn extract_content(messages: &[ChatMessage]) -> Result<(Vec<(String, String)>, Option<Vec<u8>>), String> {
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
                                image = Some(decode_data_uri(&image_url.url)
                                    .map_err(|e| format!("invalid image: {e}"))?);
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

/// SSE chunk that announces the assistant role. OpenAI-compatible clients
/// expect this as the very first delta of a streaming response.
fn sse_role_chunk(id: &str, model: &str, created: u64) -> Bytes {
    let data = json!({
        "id": id,
        "object": "chat.completion.chunk",
        "created": created,
        "model": model,
        "choices": [{"index": 0, "delta": {"role": "assistant"}, "finish_reason": null}]
    });
    Bytes::from(format!("data: {}\n\n", data))
}

fn sse_content_chunk(id: &str, model: &str, created: u64, content: &str) -> Bytes {
    let data = json!({
        "id": id,
        "object": "chat.completion.chunk",
        "created": created,
        "model": model,
        "choices": [{"index": 0, "delta": {"content": content}, "finish_reason": null}]
    });
    Bytes::from(format!("data: {}\n\n", data))
}

fn sse_finish_chunk(id: &str, model: &str, created: u64, reason: FinishReason) -> Bytes {
    let data = json!({
        "id": id,
        "object": "chat.completion.chunk",
        "created": created,
        "model": model,
        "choices": [{"index": 0, "delta": {}, "finish_reason": reason.as_str()}]
    });
    Bytes::from(format!("data: {}\n\n", data))
}

fn sse_error_chunk(id: &str, model: &str, created: u64, msg: &str) -> Bytes {
    let data = json!({
        "id": id,
        "object": "chat.completion.chunk",
        "created": created,
        "model": model,
        "error": { "message": msg, "type": "inference_error" }
    });
    Bytes::from(format!("data: {}\n\n", data))
}

fn sse_done() -> Bytes {
    Bytes::from("data: [DONE]\n\n")
}

/// Validate the parsed request. Returns 400 BadRequest on failure with a
/// structured JSON body. Doing this in the handler (not serde) lets us
/// keep the OpenAI-style error envelope consistent.
fn validate_request(req: &ChatRequest) -> Option<HttpResponse> {
    if req.messages.is_empty() {
        return Some(HttpResponse::BadRequest().json(json!({
            "error": { "message": "messages must not be empty", "type": "invalid_request_error" }
        })));
    }
    if !req.temperature.is_finite() || req.temperature < 0.0 {
        return Some(HttpResponse::BadRequest().json(json!({
            "error": {
                "message": format!("temperature must be a finite, non-negative number (got {})", req.temperature),
                "type": "invalid_request_error",
            }
        })));
    }
    if req.max_tokens == 0 {
        return Some(HttpResponse::BadRequest().json(json!({
            "error": { "message": "max_tokens must be >= 1", "type": "invalid_request_error" }
        })));
    }
    None
}

// ── Handlers ─────────────────────────────────────────────────────────────────

/// Stream-event variants exchanged between the inference task and the
/// SSE writer. Lets us deliver a final `finish_reason` chunk and surface
/// errors mid-stream instead of just letting the channel close silently.
enum StreamMsg {
    Token(String),
    Done(InferStats),
    Error(String),
}

/// `POST /v1/chat/completions`
pub async fn chat_completions(
    state: web::Data<AppState>,
    req: web::Json<ChatRequest>,
) -> HttpResponse {
    let req = req.into_inner();

    if let Some(resp) = validate_request(&req) {
        return resp;
    }

    let model_name = req.model.clone().unwrap_or_else(|| "minicpm-v".to_string());
    let max_tokens = req.max_tokens;
    let temperature = req.temperature;
    let streaming = req.stream;
    let id = new_completion_id();
    let created = now_unix_secs();

    let (pairs, image_bytes) = match extract_content(&req.messages) {
        Ok(v) => v,
        Err(e) => return HttpResponse::BadRequest().json(json!({
            "error": { "message": e, "type": "invalid_request_error" }
        })),
    };

    // Pre-flight: image provided but no multimodal projector loaded
    if image_bytes.is_some() && state.engine.mmproj_path.is_none() {
        return HttpResponse::BadRequest().json(json!({
            "error": {
                "message": "multimodal not configured: mmproj_path missing or file not found",
                "type": "invalid_request_error",
            }
        }));
    }

    let engine = Arc::clone(&state.engine);

    if streaming {
        let (tx_msg, rx_msg) = mpsc::channel::<StreamMsg>(128);

        let engine2 = Arc::clone(&engine);
        let pairs2 = pairs.clone();
        let tx_msg_for_task = tx_msg.clone();
        tokio::task::spawn_blocking(move || {
            // Adapter channel from engine (which speaks String) to the
            // stream-message enum the handler consumes.
            let (tx_tok, mut rx_tok) = mpsc::channel::<String>(128);

            // Forwarder: token strings → StreamMsg::Token. Runs on the
            // current thread but uses blocking_send so it cooperates with
            // the inference loop.
            let tx_msg_fwd = tx_msg_for_task.clone();
            let forwarder = std::thread::spawn(move || {
                while let Some(tok) = rx_tok.blocking_recv() {
                    if tx_msg_fwd.blocking_send(StreamMsg::Token(tok)).is_err() {
                        break;
                    }
                }
            });

            let result = match image_bytes {
                Some(img) => engine2.infer_multimodal(&pairs2, img, max_tokens, temperature, tx_tok),
                None => {
                    let prompt = LlamaEngine::build_prompt(&pairs2, None);
                    engine2.infer_text(prompt, max_tokens, temperature, tx_tok)
                }
            };
            // Drop tx_tok so the forwarder thread exits.
            drop(forwarder.join());

            match result {
                Ok(stats) => {
                    let _ = tx_msg_for_task.blocking_send(StreamMsg::Done(stats));
                }
                Err(e) => {
                    tracing::error!("inference error: {e:#}");
                    let _ = tx_msg_for_task.blocking_send(StreamMsg::Error(format!("{e:#}")));
                }
            }
        });

        let id_for_stream = id.clone();
        let model_for_stream = model_name.clone();
        // Initial role-only delta (OpenAI spec).
        let role_chunk = sse_role_chunk(&id_for_stream, &model_for_stream, created);

        let body_stream = ReceiverStream::new(rx_msg).map(move |m| {
            let bytes = match m {
                StreamMsg::Token(tok) => {
                    sse_content_chunk(&id_for_stream, &model_for_stream, created, &tok)
                }
                StreamMsg::Done(stats) => {
                    sse_finish_chunk(&id_for_stream, &model_for_stream, created, stats.finish_reason)
                }
                StreamMsg::Error(msg) => {
                    sse_error_chunk(&id_for_stream, &model_for_stream, created, &msg)
                }
            };
            Ok::<Bytes, std::io::Error>(bytes)
        });
        let intro = futures_util::stream::once(async move {
            Ok::<Bytes, std::io::Error>(role_chunk)
        });
        let outro = futures_util::stream::once(async {
            Ok::<Bytes, std::io::Error>(sse_done())
        });
        let full_stream = intro.chain(body_stream).chain(outro);

        // Drop the original sender so when the spawned task finishes, the
        // ReceiverStream actually ends (rather than hanging on a dangling
        // reference to tx_msg).
        drop(tx_msg);

        HttpResponse::Ok()
            .content_type("text/event-stream; charset=utf-8")
            .insert_header(("Cache-Control", "no-cache"))
            .insert_header(("X-Accel-Buffering", "no"))
            .streaming(full_stream)
    } else {
        // Non-streaming: collect all tokens, return single JSON
        let (tx, mut rx) = mpsc::channel::<String>(512);

        let handle = tokio::task::spawn_blocking(move || match image_bytes {
            Some(img) => engine.infer_multimodal(&pairs, img, max_tokens, temperature, tx),
            None => {
                let prompt = LlamaEngine::build_prompt(&pairs, None);
                engine.infer_text(prompt, max_tokens, temperature, tx)
            }
        });

        let timeout = response_timeout();
        let mut content = String::new();
        let collect_fut = async {
            while let Some(tok) = rx.recv().await {
                content.push_str(&tok);
            }
        };
        if tokio::time::timeout(timeout, collect_fut).await.is_err() {
            // Inference is still running on the blocking pool; we abandon
            // the response. The blocking task will finish and discard its
            // tokens when the channel drops at scope end.
            return HttpResponse::GatewayTimeout()
                .json(json!({"error": format!("inference timed out after {}s", timeout.as_secs())}));
        }

        let stats: InferStats = match handle.await {
            Ok(Ok(stats)) => stats,
            Ok(Err(e)) => {
                // Distinguish bad-input bails from internal errors. The
                // engine's ctx-size check uses anyhow::bail! with a
                // matching message prefix.
                let msg = format!("{e:#}");
                if msg.contains("exceeds ctx_size") {
                    return HttpResponse::BadRequest().json(json!({
                        "error": { "message": msg, "type": "invalid_request_error" }
                    }));
                }
                return HttpResponse::InternalServerError()
                    .json(json!({"error": format!("inference failed: {}", msg)}));
            }
            Err(e) => {
                return HttpResponse::InternalServerError()
                    .json(json!({"error": format!("inference failed: {}", e)}));
            }
        };

        HttpResponse::Ok().json(json!({
            "id": id,
            "object": "chat.completion",
            "created": created,
            "model": model_name,
            "choices": [{
                "index": 0,
                "message": {"role": "assistant", "content": content},
                "finish_reason": stats.finish_reason.as_str(),
            }],
            "usage": {
                "prompt_tokens": stats.prompt_tokens,
                "completion_tokens": stats.completion_tokens,
                "total_tokens": stats.prompt_tokens + stats.completion_tokens,
            }
        }))
    }
}

/// `GET /v1/models`
pub async fn list_models(state: web::Data<AppState>) -> HttpResponse {
    let model_id = std::path::Path::new(&state.engine.config.model_path)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("minicpm-v")
        .to_string();

    HttpResponse::Ok().json(json!({
        "object": "list",
        "data": [{
            "id": model_id,
            "object": "model",
            "owned_by": "local",
            "multimodal": state.engine.mmproj_path.is_some()
        }]
    }))
}
