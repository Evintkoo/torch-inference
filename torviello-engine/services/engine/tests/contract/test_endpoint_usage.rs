// Copyright (c) 2026 Torviello.
use std::collections::BTreeSet;
use std::path::PathBuf;

use axum::body::Body;
use axum::http::{HeaderMap, Method, Request};
use http_body_util::BodyExt;
use tower::ServiceExt;

use torviello_engine::api::{AppState, build_state, router};
use torviello_engine::config::{Accelerators, AccessControl, Config};

fn config() -> Config {
    Config {
        host: "127.0.0.1".to_owned(),
        port: 8000,
        auth_enabled: false,
        auth_mode: torviello_engine::config::AuthMode::Local,
        oidc_issuer: String::new(),
        oidc_audience: String::new(),
        oidc_jwks_url: String::new(),
        oidc_clock_skew_seconds: 60,
        max_body_bytes: 1_048_576,
        max_batch_size: 8,
        timeout_ms: 30_000,
        retention_max_age_days: 7,
        max_queue_depth: 32,
        model_registry: "../../config/model-registry.toml".to_owned(),
        database_url: "sqlite://data/engine.db".to_owned(),
        model_root: "../../models".to_owned(),
        max_model_bytes: 1_073_741_824,
        max_loaded_models: 2,
        download_concurrency: 2,
        download_timeout_ms: 300_000,
        model_source_allowlist: vec!["models.torviello.local".to_owned()],
        max_frame_bytes: 262_144,
        shutdown_timeout_ms: 15_000,
        max_size_bytes: 104_857_600,
        rate_limit_per_minute: 1_000,
        decompression_max_expansion_bytes: 4_194_304,
        tls_min_version: "1.3".to_owned(),
        cors_allowed_origin: "https://console.torviello.local".to_owned(),
        accelerator_fallback: "cpu".to_owned(),
        accelerators: Accelerators::default(),
        access_control: AccessControl::default(),
    }
}

fn state() -> AppState {
    build_state(config()).expect("state must build")
}

fn app() -> axum::Router {
    router(&state())
}

fn contract_path(name: &str) -> PathBuf {
    PathBuf::from(format!("../../../torviello-engine/contracts/{name}"))
}

fn yaml(name: &str) -> serde_yaml::Value {
    serde_yaml::from_str(
        &std::fs::read_to_string(contract_path(name)).expect("contract file must be readable"),
    )
    .expect("contract file must be valid YAML")
}

fn strings(value: &serde_yaml::Value) -> Vec<String> {
    value
        .as_sequence()
        .into_iter()
        .flatten()
        .filter_map(|item| item.as_str().map(str::to_owned))
        .collect()
}

fn request(method: &str, path: &str) -> Request<Body> {
    let uri = path.replace("{modelId}", "demo");
    let method = Method::from_bytes(method.to_uppercase().as_bytes()).expect("method");
    let has_body = matches!(method, Method::POST | Method::PUT | Method::PATCH);
    let mut builder = Request::builder().method(method).uri(uri);
    if has_body {
        builder = builder.header("content-type", "application/json");
        builder.body(Body::from("{}")).expect("request")
    } else {
        builder.body(Body::empty()).expect("request")
    }
}

async fn send(app: &axum::Router, request: Request<Body>) -> (u16, HeaderMap, serde_json::Value) {
    let response = app.clone().oneshot(request).await.expect("response");
    let status = response.status().as_u16();
    let headers = response.headers().clone();
    let bytes = response
        .into_body()
        .collect()
        .await
        .expect("body")
        .to_bytes();
    let body = serde_json::from_slice(&bytes).unwrap_or(serde_json::Value::Null);
    (status, headers, body)
}

fn declared_response(operation: &serde_yaml::Value, status: u16) -> Option<&serde_yaml::Value> {
    let key = status.to_string();
    operation["responses"]
        .as_mapping()?
        .iter()
        .find_map(|(name, response)| (name.as_str() == Some(key.as_str())).then_some(response))
}

fn assert_operation_content(operation: &serde_yaml::Value, status: u16, headers: &HeaderMap) {
    let Some(response) = declared_response(operation, status) else {
        return;
    };
    let Some(content) = response
        .get("content")
        .and_then(serde_yaml::Value::as_mapping)
    else {
        return;
    };
    let actual = headers["content-type"].to_str().unwrap_or_default();
    let actual = actual.split(';').next().unwrap_or(actual);
    assert!(
        content.keys().any(|name| name.as_str() == Some(actual)),
        "status {status} content type {actual:?} is not declared by the operation"
    );
}

fn assert_status_contract(
    catalog: &serde_yaml::Value,
    status: u16,
    headers: &HeaderMap,
    body: &serde_json::Value,
) {
    let entry = catalog["assigned"]
        .as_sequence()
        .expect("assigned statuses")
        .iter()
        .find(|entry| entry["code"].as_u64() == Some(u64::from(status)))
        .unwrap_or_else(|| panic!("status {status} is not in the response catalog"));

    let content_type = entry["content_type"].as_str();
    if let Some(expected) = content_type.filter(|value| *value != "per-operation") {
        assert_eq!(
            headers["content-type"], expected,
            "status {status} content type does not match the catalog"
        );
    }
    for name in strings(&entry["required_headers"]) {
        assert!(
            headers.contains_key(name.as_str()),
            "status {status} is missing required header {name}"
        );
    }
    let cache = entry["cache_control"].as_str();
    if let Some(expected) = cache.filter(|value| *value != "per-operation") {
        assert_eq!(
            headers["cache-control"], expected,
            "status {status} cache control does not match the catalog"
        );
    }
    if content_type != Some("per-operation") {
        for field in strings(&entry["body_fields"]) {
            assert!(
                body.get(&field).is_some(),
                "status {status} body is missing contract field {field}"
            );
        }
    }
    for field in strings(&entry["forbidden_body_fields"]) {
        assert!(
            body.get(&field).is_none(),
            "status {status} body contains forbidden field {field}"
        );
    }
    if entry["body"].as_str() == Some("problem+json") {
        let codes = strings(&entry["error_codes"]);
        let code = body["code"].as_str().expect("problem code");
        assert!(
            codes.iter().any(|allowed| allowed == code),
            "status {status} emitted code {code} outside the catalog: {codes:?}"
        );
    }
}

#[tokio::test]
async fn every_openapi_operation_is_routed_and_matches_its_declared_statuses() {
    let openapi = yaml("openapi.yaml");
    let catalog = yaml("schemas/common/http-status.yaml");
    let app = app();
    let paths = openapi["paths"].as_mapping().expect("paths");
    let mut checked = 0;

    for (raw_path, path_item) in paths {
        let path = raw_path.as_str().expect("path");
        for (raw_method, operation) in path_item.as_mapping().expect("path item") {
            let method = raw_method.as_str().expect("method");
            if !matches!(method, "get" | "post" | "put" | "patch" | "delete") {
                continue;
            }
            let operation_id = operation["operationId"].as_str().expect("operationId");
            let declared: BTreeSet<String> = operation["responses"]
                .as_mapping()
                .expect("responses")
                .keys()
                .filter_map(|key| key.as_str().map(str::to_owned))
                .collect();
            let (status, headers, body) = send(&app, request(method, path)).await;
            checked += 1;

            assert!(
                !(status == 404 && body["code"] == "not_found"),
                "{method} {path} ({operation_id}) is not routed by the API"
            );
            assert!(
                declared.contains(&status.to_string()),
                "{method} {path} ({operation_id}) returned undeclared status {status}"
            );
            assert_operation_content(operation, status, &headers);
            assert_status_contract(&catalog, status, &headers, &body);

            if declared.contains("501") {
                assert_eq!(
                    status, 501,
                    "{method} {path} ({operation_id}) declares 501 but is implemented"
                );
                assert_eq!(body["code"], "not_implemented");
            } else {
                assert_ne!(
                    status, 501,
                    "{method} {path} ({operation_id}) is implemented but returned 501"
                );
            }
        }
    }

    assert_eq!(
        checked, 35,
        "expected every OpenAPI operation to be exercised"
    );
}
