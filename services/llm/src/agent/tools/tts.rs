//! tts(text, voice="af_heart") → audio_url, duration_ms
//!
//! POSTs to /tts/stream and returns the response location header (or a
//! synthesized data URI if the upstream streams audio bytes).
//!
//! v1 contract: the main server's /tts/stream returns audio bytes directly
//! in the response. Since we don't want to ferry potentially-MB-sized audio
//! back through the SSE stream, we save the bytes to a temp file under the
//! server's /tmp dir and return a `file://...` URL. Future versions could
//! upload to a shared cache.

use async_trait::async_trait;
use serde_json::{json, Value};
use std::sync::Arc;
use std::time::Instant;

use crate::agent::tool::{Tool, ToolError};

pub struct TtsTool {
    pub client: reqwest::Client,
    pub url:    String,
}

impl TtsTool {
    pub fn new(client: reqwest::Client, base: &str, endpoint: &str) -> Arc<Self> {
        Arc::new(Self { client, url: format!("{}{}", base, endpoint) })
    }
}

#[async_trait]
impl Tool for TtsTool {
    fn name(&self) -> &'static str { "tts" }

    async fn invoke(&self, args: Value, deadline: Instant) -> Result<Value, ToolError> {
        let text = args.get("text").and_then(Value::as_str)
            .ok_or_else(|| ToolError::BadArg("tts requires `text` (string)".into()))?;
        let voice = args.get("voice").and_then(Value::as_str).unwrap_or("af_heart");

        let body = json!({ "text": text, "voice": voice });
        let remaining = deadline.saturating_duration_since(Instant::now());
        if remaining.is_zero() { return Err(ToolError::Timeout(0)); }

        let started = Instant::now();
        let resp = self.client.post(&self.url)
            .json(&body)
            .timeout(remaining)
            .send().await
            .map_err(|e| if e.is_timeout() {
                ToolError::Timeout(remaining.as_millis() as u64)
            } else {
                ToolError::Upstream(format!("tts: {}", e))
            })?;

        if !resp.status().is_success() {
            let s = resp.status();
            let b = resp.text().await.unwrap_or_default();
            return Err(ToolError::Upstream(format!("tts returned {}: {}", s, b)));
        }

        let bytes = resp.bytes().await
            .map_err(|e| ToolError::Upstream(format!("tts body: {}", e)))?;

        let tmp = std::env::temp_dir().join(format!("agent_tts_{}.wav", ulid::Ulid::new()));
        tokio::fs::write(&tmp, &bytes).await
            .map_err(|e| ToolError::Upstream(format!("tts write: {}", e)))?;

        Ok(json!({
            "audio_url":   format!("file://{}", tmp.display()),
            "duration_ms": started.elapsed().as_millis() as u64,
            "bytes":       bytes.len(),
        }))
    }
}

/// Best-effort cleanup of stale `agent_tts_*.wav` temp files. Every `tts()`
/// call writes one such file with no consumer contract for when (or
/// whether) anything downstream deletes it — on a long-running service
/// that's an unbounded disk leak. Call periodically; removes anything named
/// `agent_tts_*.wav` in `std::env::temp_dir()` whose mtime is older than
/// `max_age`. Never touches files it didn't create.
pub fn sweep_stale_temp_files(max_age: std::time::Duration) -> usize {
    sweep_stale_temp_files_in(&std::env::temp_dir(), max_age, std::time::SystemTime::now())
}

fn sweep_stale_temp_files_in(
    dir: &std::path::Path,
    max_age: std::time::Duration,
    now: std::time::SystemTime,
) -> usize {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return 0;
    };
    let mut removed = 0;
    for entry in entries.flatten() {
        let name = entry.file_name();
        let name = name.to_string_lossy();
        if !(name.starts_with("agent_tts_") && name.ends_with(".wav")) {
            continue;
        }
        let is_stale = entry
            .metadata()
            .and_then(|m| m.modified())
            .map(|modified| now.duration_since(modified).unwrap_or_default() > max_age)
            .unwrap_or(false);
        if is_stale && std::fs::remove_file(entry.path()).is_ok() {
            removed += 1;
        }
    }
    removed
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::Duration;

    // ── sweep_stale_temp_files_in ────────────────────────────────────────────

    fn scratch_dir(label: &str) -> std::path::PathBuf {
        let dir = std::env::temp_dir().join(format!("tts_sweep_test_{}_{}", label, ulid::Ulid::new()));
        std::fs::create_dir_all(&dir).unwrap();
        dir
    }

    fn write_wav_with_age(dir: &std::path::Path, name: &str, age: Duration, now: std::time::SystemTime) {
        let path = dir.join(name);
        std::fs::write(&path, b"RIFF").unwrap();
        let f = std::fs::File::options().write(true).open(&path).unwrap();
        f.set_modified(now - age).unwrap();
    }

    #[test]
    fn sweep_removes_only_stale_agent_tts_files_past_max_age() {
        let dir = scratch_dir("stale");
        let now = std::time::SystemTime::now();
        write_wav_with_age(&dir, "agent_tts_old.wav", Duration::from_secs(3600), now);
        write_wav_with_age(&dir, "agent_tts_fresh.wav", Duration::from_secs(5), now);
        write_wav_with_age(&dir, "unrelated_old.wav", Duration::from_secs(3600), now);

        let removed = sweep_stale_temp_files_in(&dir, Duration::from_secs(600), now);

        assert_eq!(removed, 1, "only the stale agent_tts_ file should be removed");
        assert!(!dir.join("agent_tts_old.wav").exists());
        assert!(dir.join("agent_tts_fresh.wav").exists(), "fresh file must survive the sweep");
        assert!(dir.join("unrelated_old.wav").exists(), "non-agent_tts_ files must be left alone");

        std::fs::remove_dir_all(&dir).ok();
    }

    #[test]
    fn sweep_on_empty_or_missing_dir_removes_nothing() {
        let dir = std::env::temp_dir().join(format!("tts_sweep_test_missing_{}", ulid::Ulid::new()));
        assert_eq!(sweep_stale_temp_files_in(&dir, Duration::from_secs(600), std::time::SystemTime::now()), 0);
    }

    #[tokio::test]
    async fn tts_returns_audio_url_and_writes_file() {
        let mut server = mockito::Server::new_async().await;
        let _m = server.mock("POST", "/tts/stream")
            .with_status(200)
            .with_header("content-type", "audio/wav")
            .with_body(b"RIFF\0\0\0\0WAVE")
            .create_async().await;
        let t = TtsTool::new(reqwest::Client::new(), &server.url(), "/tts/stream");
        let out = t.invoke(json!({"text":"hi","voice":"af_heart"}),
                            Instant::now() + Duration::from_secs(2)).await.unwrap();
        let url = out["audio_url"].as_str().unwrap();
        assert!(url.starts_with("file://"));
        let path = url.trim_start_matches("file://");
        let written = std::fs::read(path).unwrap();
        assert_eq!(&written[..4], b"RIFF");
        let _ = std::fs::remove_file(path);
    }

    #[tokio::test]
    async fn tts_missing_text_returns_badarg() {
        let t = TtsTool::new(reqwest::Client::new(), "http://x", "/tts/stream");
        let err = t.invoke(json!({}),
                            Instant::now() + Duration::from_secs(1)).await.unwrap_err();
        assert!(matches!(err, ToolError::BadArg(_)));
    }
}
