// Copyright (c) 2026 Torviello.
//! Unit tests for `auth` (moved out of auth.rs for the CQ-02 500-line bound; ticket 0048).

use std::io::{Read, Write};
use std::net::TcpListener;

use jsonwebtoken::jwk::JwkSet;

use super::*;

const JWKS: &str = include_str!("../../tests/fixtures/oidc_jwks.json");
const VALID: &str = include_str!("../../tests/fixtures/oidc_valid.jwt");
const EXPIRED: &str = include_str!("../../tests/fixtures/oidc_expired.jwt");
const FUTURE_NBF: &str = include_str!("../../tests/fixtures/oidc_future_nbf.jwt");
const WRONG_AUDIENCE: &str = include_str!("../../tests/fixtures/oidc_wrong_audience.jwt");
const MISSING_NBF: &str = include_str!("../../tests/fixtures/oidc_missing_nbf.jwt");

fn settings() -> OidcSettings {
    OidcSettings {
        issuer: "https://issuer.example".to_owned(),
        audience: "torviello-engine".to_owned(),
        jwks_url: "https://issuer.example/jwks".to_owned(),
        clock_skew_seconds: 60,
    }
}

fn key() -> Jwk {
    let set: JwkSet = serde_json::from_str(JWKS).expect("jwks");
    set.find("test-key-1").cloned().expect("key")
}

#[test]
fn valid_oidc_token_yields_principal() {
    let principal = verify_oidc_token(VALID.trim(), &key(), &settings()).expect("valid");
    assert_eq!(principal.subject, "user-1");
    assert_eq!(principal.actor, "user-1");
    assert_eq!(principal.roles, ["inference"]);
    assert_eq!(principal.org_id.as_deref(), Some("org-1"));
    assert_eq!(principal.jti.as_deref(), Some("jti-1"));
}

#[test]
fn oidc_rejects_expired_future_and_audience_mismatch() {
    for token in [EXPIRED, FUTURE_NBF, WRONG_AUDIENCE, MISSING_NBF] {
        assert!(matches!(
            verify_oidc_token(token.trim(), &key(), &settings()),
            Err(AppError::Unauthorized)
        ));
    }
}

#[test]
fn oidc_rejects_shared_secret_algorithms() {
    let shared = "eyJhbGciOiJIUzI1NiIsImtpZCI6InRlc3Qta2V5LTEifQ.e30.";
    assert!(matches!(
        verify_oidc_token(shared, &key(), &settings()),
        Err(AppError::Unauthorized)
    ));
}

#[test]
fn oidc_rejects_untrusted_headers_and_key_metadata() {
    for configure in [
        |header: &mut jsonwebtoken::Header| {
            header.jku = Some("https://evil.example".to_owned());
        },
        |header: &mut jsonwebtoken::Header| {
            header.x5u = Some("https://evil.example".to_owned());
        },
    ] {
        let mut header = jsonwebtoken::Header::new(Algorithm::RS256);
        header.kid = Some("test-key-1".to_owned());
        configure(&mut header);
        assert!(matches!(
            validate_oidc_header(&header),
            Err(AppError::Unauthorized)
        ));
    }

    let mut encryption = key();
    encryption.common.public_key_use = Some(PublicKeyUse::Encryption);
    assert!(matches!(
        verify_oidc_token(VALID.trim(), &encryption, &settings()),
        Err(AppError::Unauthorized)
    ));
    let mut signing_only = key();
    signing_only.common.key_operations = Some(vec![KeyOperations::Sign]);
    assert!(matches!(
        verify_oidc_token(VALID.trim(), &signing_only, &settings()),
        Err(AppError::Unauthorized)
    ));
    let mut wrong_algorithm = key();
    wrong_algorithm.common.key_algorithm = Some(KeyAlgorithm::RS512);
    assert!(matches!(
        verify_oidc_token(VALID.trim(), &wrong_algorithm, &settings()),
        Err(AppError::Unauthorized)
    ));
}

fn serve_jwks_once(body: &'static str) -> String {
    let listener = TcpListener::bind("127.0.0.1:0").expect("listener");
    let address = listener.local_addr().expect("address");
    std::thread::spawn(move || {
        let (mut stream, _) = listener.accept().expect("accept");
        let mut buffer = [0_u8; 4096];
        let _ = stream.read(&mut buffer);
        let response = format!(
            "HTTP/1.1 200 OK\r\ncontent-type: application/json\r\ncontent-length: {}\r\nconnection: close\r\n\r\n{}",
            body.len(),
            body
        );
        stream.write_all(response.as_bytes()).expect("response");
    });
    format!("http://{address}/jwks")
}

#[test]
fn bearer_scheme_is_case_insensitive_and_requires_one_token() {
    let mut headers = HeaderMap::new();
    headers.insert(
        "authorization",
        "bEaReR abc.def.ghi".parse().expect("header"),
    );
    assert_eq!(bearer_token(&headers).expect("token"), "abc.def.ghi");

    for value in ["Bearer", "Bearer a b", "Basic abc", "Bearer "] {
        let mut headers = HeaderMap::new();
        headers.insert("authorization", value.parse().expect("header"));
        assert!(bearer_token(&headers).is_err(), "{value}");
    }
}

#[test]
fn local_authentication_validates_secret_claims_and_roles() {
    use jsonwebtoken::{EncodingKey, Header, encode};

    let secret = "0123456789abcdef0123456789abcdef";
    let encode_token = |claims: Claims| {
        encode(
            &Header::new(Algorithm::HS256),
            &claims,
            &EncodingKey::from_secret(secret.as_bytes()),
        )
        .expect("token")
    };
    let valid = encode_token(Claims {
        sub: "user-1".to_owned(),
        roles: vec!["operator".to_owned()],
        actor: Some("operator-1".to_owned()),
        exp: 4_000_000_000,
    });
    let mut headers = HeaderMap::new();
    headers.insert(
        "authorization",
        format!("Bearer {valid}").parse().expect("header"),
    );
    assert!(matches!(
        authenticate(&headers),
        Err(AppError::Unauthorized)
    ));
    let principal = verify_local_token_with_secret(&valid, secret).expect("authenticated");
    assert_eq!(principal.actor, "operator-1");
    assert_eq!(principal.scopes, Vec::<String>::new());
    require_auth(Some(&principal)).expect("present");
    require_role(&principal, "operator").expect("role");
    assert!(matches!(
        require_role(&principal, "inference"),
        Err(AppError::Forbidden)
    ));
    assert!(matches!(require_auth(None), Err(AppError::Unauthorized)));

    let invalid = encode_token(Claims {
        sub: String::new(),
        roles: vec!["operator".to_owned()],
        actor: None,
        exp: 4_000_000_000,
    });
    assert!(matches!(
        verify_local_token_with_secret(&invalid, secret),
        Err(AppError::Unauthorized)
    ));

    let invalid = encode_token(Claims {
        sub: "user-1".to_owned(),
        roles: Vec::new(),
        actor: None,
        exp: 4_000_000_000,
    });
    assert!(matches!(
        verify_local_token_with_secret(&invalid, secret),
        Err(AppError::Unauthorized)
    ));

    let claims = Claims {
        sub: "user-1".to_owned(),
        roles: vec!["operator".to_owned()],
        actor: None,
        exp: 0,
    };
    let invalid = encode_token(claims);
    assert!(matches!(
        verify_local_token_with_secret(&invalid, secret),
        Err(AppError::Unauthorized)
    ));

    assert!(matches!(
        verify_local_token_with_secret(&valid, "short"),
        Err(AppError::Unauthorized)
    ));
    assert_eq!(
        authorization_policy(),
        "rbac: inference, operator, admin; access_control checked at the boundary"
    );
}

#[test]
fn password_hashes_verify_and_reject_malformed_values() {
    use argon2::password_hash::{PasswordHasher, SaltString};

    let salt = SaltString::from_b64("c29tZXNhbHR2YWx1ZQ").expect("salt");
    let hash = argon2::Argon2::default()
        .hash_password(b"correct horse", &salt)
        .expect("hash")
        .to_string();
    assert!(verify_password_hash(&hash, "correct horse").expect("verify"));
    assert!(!verify_password_hash(&hash, "wrong").expect("verify"));
    assert!(matches!(
        verify_password_hash("not-a-hash", "value"),
        Err(AppError::Internal)
    ));
}

#[test]
fn oidc_headers_reject_every_untrusted_extension() {
    for configure in [
        |header: &mut jsonwebtoken::Header| header.x5c = Some(Vec::new()),
        |header: &mut jsonwebtoken::Header| header.alg = Algorithm::HS256,
    ] {
        let mut header = jsonwebtoken::Header::new(Algorithm::RS256);
        configure(&mut header);
        assert!(matches!(
            validate_oidc_header(&header),
            Err(AppError::Unauthorized)
        ));
    }
    let mut missing_kid = jsonwebtoken::Header::new(Algorithm::RS256);
    missing_kid.kid = None;
    assert!(decode_header("not-a-token").is_err());
}

#[test]
fn authorization_accepts_roles_scopes_and_admin_only() {
    let principal = |roles: &[&str], scopes: &[&str]| Principal {
        subject: "user-1".to_owned(),
        roles: roles.iter().map(|role| (*role).to_owned()).collect(),
        scopes: scopes.iter().map(|scope| (*scope).to_owned()).collect(),
        actor: "user-1".to_owned(),
        org_id: None,
        jti: None,
    };
    assert!(
        authorize(
            &principal(&["inference"], &[]),
            "inference",
            "engine.inference"
        )
        .is_ok()
    );
    assert!(
        authorize(
            &principal(&[], &["engine.models.write"]),
            "operator",
            "engine.models.write"
        )
        .is_ok()
    );
    assert!(
        authorize(
            &principal(&["admin"], &[]),
            "operator",
            "engine.models.write"
        )
        .is_ok()
    );
    assert!(
        authorize(
            &principal(&[], &["engine.admin"]),
            "operator",
            "engine.models.write"
        )
        .is_ok()
    );
    assert!(matches!(
        authorize(
            &principal(&["inference"], &[]),
            "operator",
            "engine.models.write"
        ),
        Err(AppError::Forbidden)
    ));
}

#[tokio::test]
async fn verifier_fetches_and_caches_jwks() {
    let mut config = settings();
    config.jwks_url = serve_jwks_once(JWKS);
    let verifier = OidcVerifier::new(config).expect("verifier");
    let first = verifier.verify(VALID.trim()).await.expect("first");
    let second = verifier.verify(VALID.trim()).await.expect("cached");
    assert_eq!(first.subject, second.subject);
}

fn serve_oversized_chunked_jwks() -> String {
    let listener = TcpListener::bind("127.0.0.1:0").expect("listener");
    let address = listener.local_addr().expect("address");
    std::thread::spawn(move || {
        let (mut stream, _) = listener.accept().expect("accept");
        let mut buffer = [0_u8; 4096];
        let _ = stream.read(&mut buffer);
        let body = vec![b' '; MAX_JWKS_BYTES + 1];
        let _ = write!(
            stream,
            "HTTP/1.1 200 OK\r\ncontent-type: application/json\r\ntransfer-encoding: chunked\r\nconnection: close\r\n\r\n{:x}\r\n",
            body.len()
        );
        let _ = stream.write_all(&body);
        let _ = stream.write_all(b"\r\n0\r\n\r\n");
    });
    format!("http://{address}/jwks")
}

#[tokio::test]
async fn verifier_rejects_oversized_streamed_jwks() {
    let mut config = settings();
    config.jwks_url = serve_oversized_chunked_jwks();
    let verifier = OidcVerifier::new(config).expect("verifier");
    assert!(matches!(
        verifier.verify(VALID.trim()).await,
        Err(AppError::Unavailable)
    ));
}

#[tokio::test]
async fn verifier_rejects_unknown_kid() {
    let mut config = settings();
    config.jwks_url = serve_jwks_once(JWKS);
    let verifier = OidcVerifier::new(config).expect("verifier");
    assert!(matches!(
        verifier
            .verify(include_str!("../../tests/fixtures/oidc_unknown_kid.jwt").trim())
            .await,
        Err(AppError::Unauthorized)
    ));
    assert!(matches!(
        verifier
            .verify(include_str!("../../tests/fixtures/oidc_unknown_kid.jwt").trim())
            .await,
        Err(AppError::Unauthorized)
    ));
}

fn serve_once(status: &'static str, body: &'static str) -> String {
    let listener = TcpListener::bind("127.0.0.1:0").expect("listener");
    let address = listener.local_addr().expect("address");
    std::thread::spawn(move || {
        let (mut stream, _) = listener.accept().expect("accept");
        let mut buffer = [0_u8; 4096];
        let _ = stream.read(&mut buffer);
        let response = format!(
            "HTTP/1.1 {status}
content-type: application/json
content-length: {}
connection: close

{body}",
            body.len()
        );
        stream.write_all(response.as_bytes()).expect("response");
    });
    format!("http://{address}/jwks")
}

#[tokio::test]
async fn verifier_rejects_failed_and_empty_jwks_responses() {
    let mut config = settings();
    config.jwks_url = serve_once("500 Internal Server Error", "{}");
    let verifier = OidcVerifier::new(config).expect("verifier");
    assert!(matches!(
        verifier.verify(VALID.trim()).await,
        Err(AppError::Unavailable)
    ));

    let mut config = settings();
    config.jwks_url = serve_once("200 OK", "{\"keys\":[]}");
    let verifier = OidcVerifier::new(config).expect("verifier");
    assert!(matches!(
        verifier.verify(VALID.trim()).await,
        Err(AppError::Unavailable)
    ));

    let mut config = settings();
    config.jwks_url = serve_once("200 OK", "not-json");
    let verifier = OidcVerifier::new(config).expect("verifier");
    assert!(matches!(
        verifier.verify(VALID.trim()).await,
        Err(AppError::Unavailable)
    ));

    let mut config = settings();
    config.jwks_url = "http://127.0.0.1:1/jwks".to_owned();
    let verifier = OidcVerifier::new(config).expect("verifier");
    assert!(matches!(
        verifier.verify(VALID.trim()).await,
        Err(AppError::Unavailable)
    ));

    let verifier = OidcVerifier::new(settings()).expect("verifier");
    assert!(matches!(
        verifier.verify("not-a-token").await,
        Err(AppError::Unauthorized)
    ));
    let mut headers = HeaderMap::new();
    headers.insert("authorization", "Bearer".parse().expect("header"));
    assert!(matches!(
        verifier.verify_headers(&headers).await,
        Err(AppError::Unauthorized)
    ));
}

#[tokio::test]
async fn verifier_rejects_tokens_without_kid() {
    let verifier = OidcVerifier::new(settings()).expect("verifier");
    let token = "eyJhbGciOiJSUzI1NiJ9.e30.c2ln";
    assert!(matches!(
        verifier.verify(token).await,
        Err(AppError::Unauthorized)
    ));
}
