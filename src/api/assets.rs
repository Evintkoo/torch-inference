//! Self-hosted third-party static assets (Remixicon fonts, the Scalar
//! API-reference bundle) — embedded into the binary at compile time via
//! `include_bytes!`/`include_str!`, the same pattern already used for
//! `playground.html` and `openapi.json` in this crate.
//!
//! These used to be fetched from jsDelivr at server startup and cached in an
//! in-memory `OnceCell`, falling back to a CDN redirect on failure. That
//! depended on outbound network access being reliable at the exact moment
//! the server started, which it often isn't (an "error decoding response
//! body <- request or response body error <- operation timed out" chain was
//! reproduced repeatedly against a real network, not just a sandboxed dev
//! one) — and the CDN-redirect fallback barely helped anyway, since this
//! app's CSP (script-src/style-src 'self') blocks loading straight from a
//! CDN. Vendoring the exact pinned versions into the repo and compiling
//! them in removes the network dependency for these assets entirely: no
//! fetch, no retry, no timeout, nothing left to fail at runtime.
//!
//! To upgrade a pinned version: download the new file to `src/api/vendor/`,
//! update the version in the doc comment below, and (for remixicon.css)
//! rewrite its `url(...remixicon.woff2...)` reference to `/assets/remixicon.woff2`
//! the same way `scripts/` or a one-off `sed`/Python pass did when these
//! were first vendored.

use actix_web::{HttpResponse, Responder};

/// Remixicon icon font, pinned to 4.7.0 (same version previously fetched
/// from `cdn.jsdelivr.net/npm/remixicon@4.7.0/...`). The CSS's woff2 URL is
/// already rewritten (at vendor time, not at runtime) to point at the local
/// `/assets/remixicon.woff2` route below.
const REMIXICON_CSS: &str = include_str!("vendor/remixicon.css");
const REMIXICON_WOFF2: &[u8] = include_bytes!("vendor/remixicon.woff2");

/// Scalar's standalone API-reference bundle, pinned to 1.68.0 (previously
/// `cdn.jsdelivr.net/npm/@scalar/api-reference@1.68.0/dist/browser/standalone.js`).
const SCALAR_JS: &[u8] = include_bytes!("vendor/scalar.js");

/// Serve the self-hosted Scalar standalone bundle with a 1-year immutable
/// cache header — safe because it's compiled in from a pinned version, so
/// it never changes underneath a given build.
pub async fn serve_scalar_js() -> impl Responder {
    HttpResponse::Ok()
        .content_type("application/javascript; charset=utf-8")
        .insert_header(("Cache-Control", "public, max-age=31536000, immutable"))
        .body(SCALAR_JS)
}

/// Serve the self-hosted Remixicon CSS with a 1-year immutable cache header.
pub async fn serve_remixicon_css() -> impl Responder {
    HttpResponse::Ok()
        .content_type("text/css; charset=utf-8")
        .insert_header(("Cache-Control", "public, max-age=31536000, immutable"))
        .body(REMIXICON_CSS)
}

/// Serve the self-hosted Remixicon woff2 font with a 1-year immutable cache header.
pub async fn serve_remixicon_woff2() -> impl Responder {
    HttpResponse::Ok()
        .content_type("font/woff2")
        .insert_header(("Cache-Control", "public, max-age=31536000, immutable"))
        .body(REMIXICON_WOFF2)
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test as actix_test, web, App};

    #[actix_web::test]
    async fn test_remixicon_css_returns_200() {
        let app = actix_test::init_service(
            App::new().route("/assets/remixicon.css", web::get().to(serve_remixicon_css)),
        )
        .await;
        let req = actix_test::TestRequest::get()
            .uri("/assets/remixicon.css")
            .to_request();
        let resp = actix_test::call_service(&app, req).await;
        assert_eq!(resp.status(), 200);
        let ct = resp.headers().get("content-type").unwrap().to_str().unwrap();
        assert!(ct.contains("text/css"), "must be text/css, got: {}", ct);
    }

    #[actix_web::test]
    async fn test_remixicon_css_cache_control_immutable() {
        let app = actix_test::init_service(
            App::new().route("/assets/remixicon.css", web::get().to(serve_remixicon_css)),
        )
        .await;
        let req = actix_test::TestRequest::get()
            .uri("/assets/remixicon.css")
            .to_request();
        let resp = actix_test::call_service(&app, req).await;
        let cc = resp.headers().get("cache-control").unwrap().to_str().unwrap();
        assert!(cc.contains("max-age=31536000") && cc.contains("immutable"));
    }

    #[actix_web::test]
    async fn test_remixicon_woff2_returns_200() {
        let app = actix_test::init_service(
            App::new().route("/assets/remixicon.woff2", web::get().to(serve_remixicon_woff2)),
        )
        .await;
        let req = actix_test::TestRequest::get()
            .uri("/assets/remixicon.woff2")
            .to_request();
        let resp = actix_test::call_service(&app, req).await;
        assert_eq!(resp.status(), 200);
        let ct = resp.headers().get("content-type").unwrap().to_str().unwrap();
        assert!(ct.contains("font/woff2"), "must be font/woff2, got: {}", ct);
    }

    #[actix_web::test]
    async fn test_scalar_js_returns_200() {
        let app = actix_test::init_service(
            App::new().route("/assets/scalar.js", web::get().to(serve_scalar_js)),
        )
        .await;
        let req = actix_test::TestRequest::get().uri("/assets/scalar.js").to_request();
        let resp = actix_test::call_service(&app, req).await;
        assert_eq!(resp.status(), 200);
        let ct = resp.headers().get("content-type").unwrap().to_str().unwrap();
        assert!(ct.contains("javascript"), "must be javascript, got: {}", ct);
    }

    #[test]
    fn test_remixicon_css_woff2_url_already_rewritten_at_vendor_time() {
        assert!(
            REMIXICON_CSS.contains(r#"url("/assets/remixicon.woff2")"#),
            "vendored remixicon.css must reference the local woff2 route"
        );
        assert!(
            !REMIXICON_CSS.contains("cdn.jsdelivr.net"),
            "vendored remixicon.css must not reference the CDN"
        );
    }

    #[test]
    fn test_scalar_js_is_nonempty() {
        assert!(SCALAR_JS.len() > 1_000_000, "vendored scalar.js looks truncated: {} bytes", SCALAR_JS.len());
    }
}
