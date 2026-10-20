// Copyright (c) 2026 Torviello.
use std::fs;

#[test]
fn openapi_contract_declares_the_registered_route() {
    let contract = fs::read_to_string("../../torviello-engine/contracts/openapi.yaml")
        .expect("openapi.yaml must be readable");
    assert!(contract.contains("openapi: 3.2.1"));
    assert!(contract.contains("/classify:"));
    assert!(contract.contains("ErrorEnvelope"));
    assert_eq!(contract.matches("\n  /").count(), 24);
}

#[test]
fn schema_contract_is_traceable() {
    let schema = fs::read_to_string("../../services/engine/api/contracts/schema.json")
        .expect("schema contract must be readable");
    assert!(schema.contains("$schema"));
    assert!(schema.contains("max_body_bytes"));
    assert!(schema.contains("\"additionalProperties\": false"));
}
