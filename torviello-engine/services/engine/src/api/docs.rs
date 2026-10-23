// Copyright (c) 2026 Torviello.
//! Embedded API reference powered by Scalar.
use axum::response::{Html, IntoResponse};

const SCALAR_HTML: &str = r#"<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Torviello Engine API</title>
</head>
<body>
  <script id="api-reference" data-url="/openapi.yaml"></script>
  <script src="/assets/scalar.js"></script>
</body>
</html>
"#;

const OPENAPI: &str = include_str!("../../../../../torviello-engine/contracts/openapi.yaml");
const SCALAR_JS: &[u8] = include_bytes!("../../assets/scalar.bundle");

pub async fn scalar() -> Html<&'static str> {
    Html(SCALAR_HTML)
}

pub async fn openapi() -> impl IntoResponse {
    (
        [(axum::http::header::CONTENT_TYPE, "application/yaml")],
        OPENAPI,
    )
}

pub async fn scalar_js() -> impl IntoResponse {
    (
        [(
            axum::http::header::CONTENT_TYPE,
            "text/javascript; charset=utf-8",
        )],
        SCALAR_JS,
    )
}
