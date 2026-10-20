// Copyright (c) 2026 Torviello.
use std::env;

use axum::http::HeaderMap;
use jsonwebtoken::{Algorithm, DecodingKey, Validation, decode};
use serde::Deserialize;

use crate::error::{AppError, AppResult};

pub const AUTH_SCHEME: &str = "JWT bearer";
const MAX_TOKEN_BYTES: usize = 8_192;
const MIN_SECRET_BYTES: usize = 32;

#[derive(Debug, Clone)]
pub struct Principal {
    pub subject: String,
    pub roles: Vec<String>,
    pub actor: String,
}

#[derive(Debug, Deserialize)]
struct Claims {
    sub: String,
    roles: Vec<String>,
    #[serde(default)]
    actor: Option<String>,
    exp: usize,
}

/// Verify an HS256 bearer JWT for the loopback profile. Remote asymmetric
/// profiles are not implemented by this scaffold and are rejected.
pub fn authenticate(headers: &HeaderMap) -> AppResult<Principal> {
    let value = headers
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .ok_or(AppError::Unauthorized)?;
    let token = value
        .strip_prefix("Bearer ")
        .ok_or(AppError::Unauthorized)?;
    if token.is_empty() || token.len() > MAX_TOKEN_BYTES {
        return Err(AppError::Unauthorized);
    }

    let secret = env::var("TORCH_AUTH_JWT_SECRET").map_err(|_| AppError::Unauthorized)?;
    if secret.len() < MIN_SECRET_BYTES {
        return Err(AppError::Unauthorized);
    }

    let mut validation = Validation::new(Algorithm::HS256);
    validation.validate_aud = false;
    let claims = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &validation,
    )
    .map_err(|_| AppError::Unauthorized)?
    .claims;

    if claims.sub.is_empty() || claims.roles.is_empty() || claims.exp == 0 {
        return Err(AppError::Unauthorized);
    }

    Ok(Principal {
        subject: claims.sub.clone(),
        roles: claims.roles,
        actor: claims.actor.unwrap_or(claims.sub),
    })
}

pub fn require_auth(principal: Option<&Principal>) -> AppResult<&Principal> {
    principal.ok_or(AppError::Unauthorized)
}

pub fn require_role(principal: &Principal, role: &str) -> AppResult<()> {
    if principal.roles.iter().any(|candidate| candidate == role)
        || principal.roles.iter().any(|candidate| candidate == "admin")
    {
        return Ok(());
    }
    Err(AppError::Forbidden)
}

pub fn verify_password_hash(hash: &str, password: &str) -> AppResult<bool> {
    argon2::PasswordHash::new(hash)
        .map(|parsed| {
            argon2::PasswordVerifier::verify_password(
                &argon2::Argon2::default(),
                password.as_bytes(),
                &parsed,
            )
            .is_ok()
        })
        .map_err(|_| AppError::Internal)
}

#[must_use]
pub fn authorization_policy() -> &'static str {
    "rbac: inference, operator, admin; access_control checked at the boundary"
}
