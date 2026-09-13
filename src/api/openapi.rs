use actix_web::{HttpResponse, Responder};

/// Hand-derived OpenAPI 3.0 spec for this server, embedded at compile time —
/// same pattern as `PLAYGROUND_HTML` in `handlers.rs` and the compiled-in
/// fallback for `model_registry.json` in `models.rs`. Edit `openapi.json`
/// directly; there is no build step.
const OPENAPI_JSON: &str = include_str!("openapi.json");

/// Serve the static OpenAPI spec backing the Scalar reference embed on the
/// playground's Endpoints panel (`GET /openapi.json`).
pub async fn serve_openapi() -> impl Responder {
    HttpResponse::Ok()
        .content_type("application/json; charset=utf-8")
        // Same short-lived caching as the rest of the dashboard JSON — this
        // is source-embedded and only changes on a new server build.
        .insert_header(("Cache-Control", "public, max-age=300"))
        .body(OPENAPI_JSON)
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test as actix_test, web, App};

    #[test]
    fn test_openapi_json_is_valid_json() {
        let parsed: serde_json::Value =
            serde_json::from_str(OPENAPI_JSON).expect("openapi.json must be valid JSON");
        assert_eq!(parsed["openapi"], "3.0.3");
        assert!(
            parsed["paths"].as_object().map(|o| !o.is_empty()).unwrap_or(false),
            "spec must declare at least one path"
        );
    }

    #[actix_web::test]
    async fn test_serve_openapi_returns_200_json() {
        let app = actix_test::init_service(
            App::new().route("/openapi.json", web::get().to(serve_openapi)),
        )
        .await;
        let req = actix_test::TestRequest::get().uri("/openapi.json").to_request();
        let resp = actix_test::call_service(&app, req).await;
        assert_eq!(resp.status(), 200);
        let ct = resp
            .headers()
            .get("content-type")
            .unwrap()
            .to_str()
            .unwrap();
        assert!(ct.contains("application/json"), "got: {}", ct);
    }
}
