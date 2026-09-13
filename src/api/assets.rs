use actix_web::{HttpResponse, Responder};
use bytes::Bytes;
use tokio::sync::OnceCell;

// `tokio::sync::OnceCell` (not `std::sync::OnceLock`) is deliberate here: its
// `get_or_try_init` re-runs the init closure on the NEXT call when a previous
// attempt returned `Err` (unlike `OnceLock::get_or_init`, which has no
// try-variant and can't be re-attempted once "set"). That gives every one of
// these self-hosted assets automatic retry-on-next-request instead of
// permanently wedging into CDN-redirect mode after a single transient
// network hiccup at startup — a hiccup we hit for real in a network-
// restricted dev sandbox (an "error decoding response body" mid-download),
// which is exactly the failure mode this is meant to recover from.
static REMIXICON: OnceCell<(Bytes, Bytes)> = OnceCell::const_new(); // (css, woff2)
static SCALAR_JS: OnceCell<Bytes> = OnceCell::const_new();

pub const REMIXICON_CDN_CSS: &str =
    "https://cdn.jsdelivr.net/npm/remixicon@4.7.0/fonts/remixicon.css";
const REMIXICON_CDN_WOFF2: &str =
    "https://cdn.jsdelivr.net/npm/remixicon@4.7.0/fonts/remixicon.woff2";

/// Scalar's standalone API-reference bundle (a single self-initializing JS
/// file — no separate CSS to fetch, it injects its own styles at runtime).
/// Pinned to an exact version, same reasoning as the `ort` pin in Cargo.toml:
/// an unpinned `@latest` could change behavior under us between restarts.
pub const SCALAR_CDN_JS: &str =
    "https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.68.0/dist/browser/standalone.js";

const FETCH_ATTEMPTS: u32 = 4;

fn http_client() -> reqwest::Result<reqwest::Client> {
    reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
}

/// GET `url` and return its body, retrying transient failures (connect
/// errors, non-2xx, truncated/undecodable bodies) with exponential backoff.
/// Only gives up after `FETCH_ATTEMPTS` tries.
async fn get_bytes_with_retry(client: &reqwest::Client, url: &str) -> Result<Bytes, String> {
    let mut last_err = String::new();
    for attempt in 0..FETCH_ATTEMPTS {
        if attempt > 0 {
            tokio::time::sleep(std::time::Duration::from_millis(500 * (1 << (attempt - 1)))).await;
        }
        match client.get(url).send().await {
            Ok(resp) if resp.status().is_success() => match resp.bytes().await {
                Ok(b) => return Ok(b),
                Err(e) => last_err = format!("failed to read body: {e}"),
            },
            Ok(resp) => last_err = format!("cdn returned {}", resp.status()),
            Err(e) => last_err = format!("request failed: {e}"),
        }
        tracing::warn!(url, attempt = attempt + 1, error = %last_err, "asset fetch attempt failed, will retry");
    }
    Err(last_err)
}

/// Rewrite the `url(...)` that references remixicon.woff2 in the @font-face block
/// so it points to our local `/assets/remixicon.woff2` route.
/// Works with both relative (`remixicon.woff2?v=4.7.0`) and absolute CDN URLs.
fn rewrite_woff2_src(css: &str) -> String {
    let marker = "remixicon.woff2";
    if let Some(woff2_pos) = css.find(marker) {
        let before_woff2 = &css[..woff2_pos];
        if let Some(url_start) = before_woff2.rfind("url(") {
            let after_url_open = url_start + 4; // skip past "url("
            if let Some(close_rel) = css[after_url_open..].find(')') {
                let close_abs = after_url_open + close_rel;
                let mut out = String::with_capacity(css.len());
                out.push_str(&css[..url_start]);
                out.push_str(r#"url("/assets/remixicon.woff2")"#);
                out.push_str(&css[close_abs + 1..]);
                return out;
            }
        }
    }
    css.to_owned()
}

/// Fetch Remixicon CSS + woff2 (retrying transient failures) and cache both
/// together — either both are cached or neither is, since the rewritten CSS
/// only makes sense paired with the local woff2 route it points at.
async fn ensure_remixicon() -> Result<&'static (Bytes, Bytes), String> {
    REMIXICON
        .get_or_try_init(|| async {
            let client = http_client().map_err(|e| format!("failed to build http client: {e}"))?;
            let woff2 = get_bytes_with_retry(&client, REMIXICON_CDN_WOFF2)
                .await
                .map_err(|e| format!("woff2: {e}"))?;
            let css_text = get_bytes_with_retry(&client, REMIXICON_CDN_CSS)
                .await
                .map_err(|e| format!("css: {e}"))?;
            let css_str = std::str::from_utf8(&css_text)
                .map_err(|e| format!("css: not valid utf-8: {e}"))?;
            let css_rewritten = Bytes::from(rewrite_woff2_src(css_str));
            tracing::info!(
                css_bytes = css_rewritten.len(),
                woff2_bytes = woff2.len(),
                "remixicon assets cached in memory"
            );
            Ok((css_rewritten, woff2))
        })
        .await
}

/// Fetch the Scalar standalone bundle (retrying transient failures) and
/// cache it.
async fn ensure_scalar_js() -> Result<&'static Bytes, String> {
    SCALAR_JS
        .get_or_try_init(|| async {
            let client = http_client().map_err(|e| format!("failed to build http client: {e}"))?;
            let bytes = get_bytes_with_retry(&client, SCALAR_CDN_JS).await?;
            tracing::info!(js_bytes = bytes.len(), "scalar api-reference bundle cached in memory");
            Ok(bytes)
        })
        .await
}

/// Called once at server startup inside a `tokio::spawn` so the common case
/// (network reachable) has the asset ready before the first real request —
/// but this is now just a warm-up, not the only chance: `ensure_remixicon()`
/// is retried lazily by the handler below on every request until it succeeds.
pub async fn fetch_remixicon() {
    if let Err(e) = ensure_remixicon().await {
        tracing::warn!(error = %e, "remixicon: startup fetch failed after retries, will keep retrying lazily on request");
    }
}

/// See `fetch_remixicon` above — same warm-up-only role for the Scalar bundle.
pub async fn fetch_scalar() {
    if let Err(e) = ensure_scalar_js().await {
        tracing::warn!(error = %e, "scalar: startup fetch failed after retries, will keep retrying lazily on request");
    }
}

/// Serve the self-hosted Scalar standalone bundle with a 1-year immutable
/// cache header (it is fetched pinned to an exact version, so it never
/// changes underneath a given build). If not cached yet (startup fetch
/// hasn't finished, or failed), retries inline here; only redirects to the
/// CDN as a last resort — which is mostly symbolic, since this app's CSP
/// (script-src 'self') blocks loading a script from the CDN anyway, but it's
/// a harmless no-op fallback for a build that relaxes the CSP later.
pub async fn serve_scalar_js() -> impl Responder {
    match ensure_scalar_js().await {
        Ok(js) => HttpResponse::Ok()
            .content_type("application/javascript; charset=utf-8")
            .insert_header(("Cache-Control", "public, max-age=31536000, immutable"))
            .body(js.clone()),
        Err(_) => HttpResponse::TemporaryRedirect()
            .insert_header(("Location", SCALAR_CDN_JS))
            .finish(),
    }
}

/// Serve the self-hosted Remixicon CSS with a 1-year immutable cache header.
/// See `serve_scalar_js` for the retry/fallback behavior.
pub async fn serve_remixicon_css() -> impl Responder {
    match ensure_remixicon().await {
        Ok((css, _)) => HttpResponse::Ok()
            .content_type("text/css; charset=utf-8")
            .insert_header(("Cache-Control", "public, max-age=31536000, immutable"))
            .body(css.clone()),
        Err(_) => HttpResponse::TemporaryRedirect()
            .insert_header(("Location", REMIXICON_CDN_CSS))
            .finish(),
    }
}

/// Serve the self-hosted Remixicon woff2 font with a 1-year immutable cache header.
/// See `serve_scalar_js` for the retry/fallback behavior.
pub async fn serve_remixicon_woff2() -> impl Responder {
    match ensure_remixicon().await {
        Ok((_, woff2)) => HttpResponse::Ok()
            .content_type("font/woff2")
            .insert_header(("Cache-Control", "public, max-age=31536000, immutable"))
            .body(woff2.clone()),
        Err(_) => HttpResponse::TemporaryRedirect()
            .insert_header(("Location", REMIXICON_CDN_WOFF2))
            .finish(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test as actix_test, web, App};

    #[actix_web::test]
    async fn test_remixicon_css_returns_200_when_cached() {
        // Ensure the cache is populated (idempotent — get_or_try_init on an
        // already-Ok cell just returns the cached value without re-running).
        let _ = REMIXICON
            .get_or_try_init(|| async { Ok::<_, String>((Bytes::from_static(b"body{}"), Bytes::from_static(b""))) })
            .await;
        let app = actix_test::init_service(
            App::new().route("/assets/remixicon.css", web::get().to(serve_remixicon_css)),
        )
        .await;
        let req = actix_test::TestRequest::get()
            .uri("/assets/remixicon.css")
            .to_request();
        let resp = actix_test::call_service(&app, req).await;
        assert_eq!(resp.status(), 200, "handler must return 200 when CSS is cached");
        let ct = resp
            .headers()
            .get("content-type")
            .unwrap()
            .to_str()
            .unwrap();
        assert!(ct.contains("text/css"), "must be text/css, got: {}", ct);
    }

    #[actix_web::test]
    async fn test_remixicon_css_cache_control_immutable_when_cached() {
        let _ = REMIXICON
            .get_or_try_init(|| async { Ok::<_, String>((Bytes::from_static(b".ri{}"), Bytes::from_static(b""))) })
            .await;
        let app = actix_test::init_service(
            App::new().route("/assets/remixicon.css", web::get().to(serve_remixicon_css)),
        )
        .await;
        let req = actix_test::TestRequest::get()
            .uri("/assets/remixicon.css")
            .to_request();
        let resp = actix_test::call_service(&app, req).await;
        // The 200 branch sets this header — only verify cache-control, not content
        let cc = resp
            .headers()
            .get("cache-control")
            .expect("cache-control must be present on cached CSS response")
            .to_str()
            .unwrap();
        assert!(
            cc.contains("max-age=31536000") && cc.contains("immutable"),
            "expected immutable long-cache header, got: {}",
            cc
        );
    }

    #[test]
    fn test_rewrite_woff2_src_relative_url() {
        let input = r#"@font-face { src: url("remixicon.woff2?v=4.7.0") format('woff2'); }"#;
        let output = rewrite_woff2_src(input);
        assert!(
            output.contains(r#"url("/assets/remixicon.woff2")"#),
            "expected local URL, got: {}",
            output
        );
        assert!(
            !output.contains("remixicon.woff2?v="),
            "query string must be replaced"
        );
    }

    #[test]
    fn test_rewrite_woff2_src_absolute_cdn_url() {
        let input = r#"@font-face { src: url("https://cdn.jsdelivr.net/npm/remixicon@4.7.0/fonts/remixicon.woff2") format('woff2'); }"#;
        let output = rewrite_woff2_src(input);
        assert!(
            output.contains(r#"url("/assets/remixicon.woff2")"#),
            "expected local URL, got: {}",
            output
        );
    }

    #[test]
    fn test_rewrite_woff2_src_no_match_returns_unchanged() {
        let input = "body { color: red; }";
        let output = rewrite_woff2_src(input);
        assert_eq!(output, input);
    }

    #[actix_web::test]
    async fn test_scalar_js_returns_200_when_cached() {
        let _ = SCALAR_JS
            .get_or_try_init(|| async { Ok::<_, String>(Bytes::from_static(b"window.Scalar={};")) })
            .await;
        let app = actix_test::init_service(
            App::new().route("/assets/scalar.js", web::get().to(serve_scalar_js)),
        )
        .await;
        let req = actix_test::TestRequest::get().uri("/assets/scalar.js").to_request();
        let resp = actix_test::call_service(&app, req).await;
        assert_eq!(resp.status(), 200, "handler must return 200 when JS is cached");
        let ct = resp
            .headers()
            .get("content-type")
            .unwrap()
            .to_str()
            .unwrap();
        assert!(ct.contains("javascript"), "must be javascript, got: {}", ct);
    }
}
