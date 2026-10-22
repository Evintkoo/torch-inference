// Copyright (c) 2026 Torviello.
#![cfg(feature = "torchscript")]

use std::io::Cursor;

use axum::Router;
use axum::body::Body;
use axum::http::{HeaderMap, Request, StatusCode};
use http_body_util::BodyExt;
use image::RgbImage;
use serde_json::Value;
use tower::ServiceExt;

use torviello_engine::api::{build_state, router};
use torviello_engine::config::{Accelerators, Config};

const MODEL_ID: &str = "engine-demo-torchscript";
const BOUNDARY: &str = "torviello-classify-test";

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
        rate_limit_per_minute: 1_000,
        decompression_max_expansion_bytes: 4_194_304,
        tls_min_version: "1.3".to_owned(),
        cors_allowed_origin: "https://console.torviello.local".to_owned(),
        accelerator_fallback: "cpu".to_owned(),
        accelerators: Accelerators::default(),
    }
}

fn app() -> Router {
    let state = build_state(config()).expect("state");
    router(&config()).with_state(state)
}

fn png(color: [u8; 3]) -> Vec<u8> {
    let image = RgbImage::from_pixel(4, 4, image::Rgb(color));
    let mut bytes = Cursor::new(Vec::new());
    image::DynamicImage::ImageRgb8(image)
        .write_to(&mut bytes, image::ImageFormat::Png)
        .expect("png");
    bytes.into_inner()
}

fn multipart(images: &[Vec<u8>], model_id: &str, top_k: Option<u32>) -> Vec<u8> {
    let mut body = Vec::new();
    for (index, image) in images.iter().enumerate() {
        body.extend_from_slice(
            format!(
                "--{BOUNDARY}\r\nContent-Disposition: form-data; name=\"images\"; filename=\"image-{index}.png\"\r\nContent-Type: image/png\r\n\r\n"
            )
            .as_bytes(),
        );
        body.extend_from_slice(image);
        body.extend_from_slice(b"\r\n");
    }
    body.extend_from_slice(
        format!(
            "--{BOUNDARY}\r\nContent-Disposition: form-data; name=\"model_id\"\r\n\r\n{model_id}\r\n"
        )
        .as_bytes(),
    );
    if let Some(top_k) = top_k {
        body.extend_from_slice(
            format!(
                "--{BOUNDARY}\r\nContent-Disposition: form-data; name=\"top_k\"\r\n\r\n{top_k}\r\n"
            )
            .as_bytes(),
        );
    }
    body.extend_from_slice(format!("--{BOUNDARY}--\r\n").as_bytes());
    body
}

async fn send_multipart(app: &Router, name: &str, body: Vec<u8>) -> (StatusCode, HeaderMap, Value) {
    let request = Request::builder()
        .method("POST")
        .uri("/classify")
        .header(
            "content-type",
            format!("multipart/form-data; boundary={BOUNDARY}"),
        )
        .body(Body::from(body))
        .expect("request");
    let response = app.clone().oneshot(request).await.expect("response");
    let status = response.status();
    let headers = response.headers().clone();
    let bytes = response
        .into_body()
        .collect()
        .await
        .expect("body")
        .to_bytes();
    let value = serde_json::from_slice(&bytes).unwrap_or(Value::Null);
    let _ = name;
    (status, headers, value)
}

async fn load(app: &Router) {
    let request = Request::builder()
        .method("POST")
        .uri(format!("/models/{MODEL_ID}/load"))
        .body(Body::empty())
        .expect("request");
    let response = app.clone().oneshot(request).await.expect("response");
    assert_eq!(response.status(), StatusCode::ACCEPTED);
    let bytes = response
        .into_body()
        .collect()
        .await
        .expect("body")
        .to_bytes();
    let body: Value = serde_json::from_slice(&bytes).expect("json");
    assert_eq!(body["data"]["state"], "ready", "{body}");
    assert_eq!(body["data"]["backend"], "cpu");
}

#[tokio::test]
async fn classifies_images_in_input_order() {
    let app = app();
    load(&app).await;

    let body = multipart(&[png([255, 0, 0]), png([0, 255, 0])], MODEL_ID, Some(3));
    let (status, headers, response) = send_multipart(&app, "order", body).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(response["data"].as_array().expect("data").len(), 2);
    assert_eq!(response["data"][0]["index"], 0);
    assert_eq!(response["data"][0]["predictions"][0]["label"], "red");
    assert_eq!(response["data"][1]["index"], 1);
    assert_eq!(response["data"][1]["predictions"][0]["label"], "green");
    assert_eq!(
        response["data"][0]["predictions"]
            .as_array()
            .expect("predictions")
            .len(),
        3
    );
    assert_eq!(response["meta"]["model_id"], MODEL_ID);
    assert_eq!(response["meta"]["backend"], "cpu");
    assert!(
        response["meta"]["request_id"]
            .as_str()
            .is_some_and(|id| id.len() == 36)
    );
    assert_eq!(
        headers["cache-control"], "no-store",
        "inference responses must not be cached"
    );

    let first = response["data"][0]["predictions"][0]["score"]
        .as_f64()
        .expect("score");
    let second = response["data"][0]["predictions"][1]["score"]
        .as_f64()
        .expect("score");
    assert!(first >= second);
}

#[tokio::test]
async fn classifies_bright_and_dark_inputs() {
    let app = app();
    load(&app).await;

    let body = multipart(&[png([255, 255, 255]), png([0, 0, 0])], MODEL_ID, Some(1));
    let (status, _, response) = send_multipart(&app, "brightness", body).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(response["data"][0]["predictions"][0]["label"], "bright");
    assert_eq!(response["data"][1]["predictions"][0]["label"], "dark");
}

#[tokio::test]
async fn rejects_invalid_batches_before_inference() {
    let app = app();
    load(&app).await;

    let (status, _, body) = send_multipart(&app, "empty", multipart(&[], MODEL_ID, None)).await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(body["code"], "invalid_input");

    let (status, _, body) = send_multipart(
        &app,
        "top-k",
        multipart(&[png([1, 2, 3])], MODEL_ID, Some(0)),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(body["code"], "invalid_input");

    let (status, _, body) = send_multipart(
        &app,
        "malformed",
        multipart(&[b"not an image".to_vec()], MODEL_ID, None),
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    assert_eq!(body["code"], "invalid_input");
}

#[tokio::test]
async fn rejects_unknown_model_and_non_multipart_requests() {
    let app = app();

    let (status, _, body) = send_multipart(
        &app,
        "unknown-model",
        multipart(&[png([0, 0, 255])], "missing-model", None),
    )
    .await;
    assert_eq!(status, StatusCode::NOT_FOUND);
    assert_eq!(body["code"], "model.not_found");

    let request = Request::builder()
        .method("POST")
        .uri("/classify")
        .header("content-type", "application/json")
        .body(Body::from("{}"))
        .expect("request");
    let response = app.oneshot(request).await.expect("response");
    assert_eq!(response.status(), StatusCode::UNSUPPORTED_MEDIA_TYPE);
}
