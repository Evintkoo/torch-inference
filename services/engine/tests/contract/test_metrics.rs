// Copyright (c) 2026 Torviello.
use axum::body::Body;
use http_body_util::BodyExt;
use tower::ServiceExt;

use torviello_engine::api::{build_state, router};
use torviello_engine::config::Config;

fn config() -> Config {
    Config {
        host: "127.0.0.1".to_owned(),
        port: 8000,
        auth_enabled: false,
        max_body_bytes: 1_048_576,
        max_batch_size: 8,
        timeout_ms: 30_000,
        retention_max_age_days: 7,
        max_queue_depth: 32,
        model_registry: "../../config/model-registry.toml".to_owned(),
        model_root: "../../models".to_owned(),
        max_model_bytes: 1_073_741_824,
        max_loaded_models: 2,
        download_concurrency: 2,
        download_timeout_ms: 300_000,
        model_source_allowlist: vec!["models.torviello.local".to_owned()],
        max_frame_bytes: 262_144,
        shutdown_timeout_ms: 15_000,
        max_size_bytes: 104_857_600,
        rate_limit_per_minute: 120,
        decompression_max_expansion_bytes: 4_194_304,
        tls_min_version: "1.3".to_owned(),
        cors_allowed_origin: "https://console.torviello.local".to_owned(),
        accelerator_fallback: "cpu".to_owned(),
        accelerators: torviello_engine::config::Accelerators::default(),
    }
}

async fn get(uri: &str) -> (u16, String) {
    let state = build_state(config()).expect("state must build");
    let response = router(&config())
        .with_state(state)
        .oneshot(
            axum::http::Request::builder()
                .uri(uri)
                .body(Body::empty())
                .expect("request"),
        )
        .await
        .expect("router response");
    let status = response.status().as_u16();
    let bytes = response
        .into_body()
        .collect()
        .await
        .expect("body")
        .to_bytes();
    (status, String::from_utf8_lossy(&bytes).into_owned())
}

#[tokio::test]
async fn metrics_report_request_count_and_latency_for_matched_routes() {
    assert_eq!(get("/health/live").await.0, 200);

    let (status, body) = get("/metrics").await;
    assert_eq!(status, 200);
    assert!(body.contains("# TYPE http_requests_total counter"));
    assert!(body.contains("# TYPE request_duration_seconds histogram"));
    assert!(body.contains("# TYPE http_requests_in_flight gauge"));
    assert!(
        body.contains("http_requests_total{method=\"GET\",path=\"/health/live\",status=\"200\"}"),
        "matched route labels must be recorded: {body}"
    );
    assert!(
        body.contains("request_duration_seconds_bucket{method=\"GET\",path=\"/health/live\""),
        "latency buckets must be recorded: {body}"
    );
}
