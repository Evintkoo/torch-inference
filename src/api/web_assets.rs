use actix_web::{web, HttpRequest, HttpResponse, Responder};
use rust_embed::RustEmbed;
use sha2::Digest;
use std::collections::HashMap;
use std::sync::OnceLock;

/// The built React/Vite SPA (`web/dist/`), embedded at compile time.
/// Requires `make web` to have run first — see the Makefile `web` target.
#[derive(RustEmbed)]
#[folder = "web/dist/"]
struct WebDist;

static ETAGS: OnceLock<HashMap<String, String>> = OnceLock::new();

fn etags() -> &'static HashMap<String, String> {
    ETAGS.get_or_init(|| {
        WebDist::iter()
            .map(|path| {
                let bytes = WebDist::get(&path).expect("path came from WebDist::iter").data;
                let hash = sha2::Sha256::digest(bytes.as_ref());
                let hex: String = hash.iter().map(|b| format!("{:02x}", b)).collect();
                (path.to_string(), format!("\"{}\"", hex))
            })
            .collect()
    })
}

/// Content-type for the small set of file types Vite's build emits.
/// Extend this list if a later panel introduces a new asset extension.
fn content_type_for(path: &str) -> &'static str {
    if path.ends_with(".html") {
        "text/html; charset=utf-8"
    } else if path.ends_with(".js") {
        "text/javascript; charset=utf-8"
    } else if path.ends_with(".css") {
        "text/css; charset=utf-8"
    } else if path.ends_with(".svg") {
        "image/svg+xml"
    } else if path.ends_with(".png") {
        "image/png"
    } else if path.ends_with(".woff2") {
        "font/woff2"
    } else if path.ends_with(".json") {
        "application/json; charset=utf-8"
    } else {
        "application/octet-stream"
    }
}

fn serve_embedded(path: &str, cache_control: &str, req: &HttpRequest) -> HttpResponse {
    let Some(file) = WebDist::get(path) else {
        return HttpResponse::NotFound().finish();
    };
    let etag = etags()
        .get(path)
        .map(String::as_str)
        .unwrap_or("\"unknown\"");

    if let Some(inm) = req.headers().get("if-none-match") {
        if inm.to_str().unwrap_or("") == etag {
            return HttpResponse::NotModified().insert_header(("ETag", etag)).finish();
        }
    }

    HttpResponse::Ok()
        .content_type(content_type_for(path))
        .insert_header(("ETag", etag))
        .insert_header(("Cache-Control", cache_control))
        .body(file.data.into_owned())
}

/// Temporary preview route for the in-progress React frontend. Removed at
/// cutover, when `/` and `/playground` serve this same `index.html` instead.
pub async fn serve_preview(req: HttpRequest) -> impl Responder {
    serve_embedded("index.html", "no-cache", &req)
}

/// Permanent static-asset route for the embedded SPA's hashed JS/CSS/etc.
/// Vite's `base: "/assets/app/"` (see `web/vite.config.ts`) makes every
/// asset reference in `index.html` point here.
pub async fn serve_app_asset(req: HttpRequest, filename: web::Path<String>) -> impl Responder {
    let path = filename.into_inner();
    serve_embedded(&path, "public, max-age=31536000, immutable", &req)
}

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.route("/preview", web::get().to(serve_preview))
        .route("/assets/app/{filename:.*}", web::get().to(serve_app_asset));
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test as actix_test, App};

    #[actix_web::test]
    async fn test_preview_serves_index_html() {
        let app = actix_test::init_service(App::new().configure(configure_routes)).await;
        let req = actix_test::TestRequest::get().uri("/preview").to_request();
        let resp = actix_test::call_service(&app, req).await;
        assert_eq!(resp.status(), 200);
    }

    #[actix_web::test]
    async fn test_unknown_asset_returns_404() {
        let app = actix_test::init_service(App::new().configure(configure_routes)).await;
        let req = actix_test::TestRequest::get()
            .uri("/assets/app/does-not-exist.js")
            .to_request();
        let resp = actix_test::call_service(&app, req).await;
        assert_eq!(resp.status(), 404);
    }
}
