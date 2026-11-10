// Copyright (c) 2026 Torviello.
use std::fs;

#[test]
fn openapi_contract_declares_the_registered_route() {
    let contract = fs::read_to_string("../../../torviello-engine/contracts/openapi.yaml")
        .expect("openapi.yaml must be readable");
    assert!(contract.contains("openapi: 3.2.1"));
    assert!(contract.contains("/classify:"));
    assert!(contract.contains("ErrorEnvelope"));
    assert_eq!(contract.matches("\n  /").count(), 33);
}

#[test]
fn implemented_subset_is_twelve_routes() {
    let contract =
        fs::read_to_string("../../../torviello-engine/contracts/openapi.first-slice.yaml")
            .expect("first-slice contract must be readable");
    assert!(contract.contains("openapi: 3.2.1"));
    assert_eq!(contract.matches("\n  /").count(), 12);
    for path in [
        "/health/live",
        "/health/ready",
        "/models",
        "/models/{modelId}",
        "/models/{modelId}/download",
        "/models/{modelId}/status",
        "/models/{modelId}/download/progress",
        "/models/{modelId}/load",
        "/models/{modelId}/unload",
        "/classify",
        "/metrics",
    ] {
        assert!(
            contract.contains(path),
            "{path} missing from implemented subset"
        );
    }
}

#[test]
fn schema_contract_is_traceable() {
    let schema = fs::read_to_string("../../services/engine/api/contracts/schema.json")
        .expect("schema contract must be readable");
    assert!(schema.contains("$schema"));
    assert!(schema.contains("max_body_bytes"));
    assert!(schema.contains("\"additionalProperties\": false"));
}
