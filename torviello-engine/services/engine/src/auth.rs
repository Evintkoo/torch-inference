// Copyright (c) 2026 Torviello.
use std::collections::HashSet;
use std::env;
use std::time::{Duration, Instant};

use axum::http::HeaderMap;
use jsonwebtoken::jwk::{Jwk, JwkSet, KeyAlgorithm, KeyOperations, PublicKeyUse};
use jsonwebtoken::{Algorithm, DecodingKey, Validation, decode, decode_header};
use serde::Deserialize;
use tokio::sync::{Mutex, RwLock};

use crate::error::{AppError, AppResult};

pub const AUTH_SCHEME: &str = "JWT bearer";
const MAX_TOKEN_BYTES: usize = 8_192;
const MIN_SECRET_BYTES: usize = 32;
const MAX_JWKS_BYTES: usize = 1_048_576;
const JWKS_CACHE_TTL: Duration = Duration::from_mins(5);
const JWKS_UNKNOWN_KID_RETRY: Duration = Duration::from_secs(10);
const JWKS_TIMEOUT: Duration = Duration::from_secs(5);
const OIDC_ALGORITHMS: [Algorithm; 3] = [Algorithm::ES256, Algorithm::RS256, Algorithm::PS256];

#[derive(Debug, Clone)]
pub struct Principal {
    pub subject: String,
    pub roles: Vec<String>,
    pub scopes: Vec<String>,
    pub actor: String,
    pub org_id: Option<String>,
    pub jti: Option<String>,
}

#[derive(Debug, Clone)]
pub struct OidcSettings {
    pub issuer: String,
    pub audience: String,
    pub jwks_url: String,
    pub clock_skew_seconds: u64,
}

#[derive(Clone)]
struct CachedJwks {
    keys: JwkSet,
    fetched_at: Instant,
}

pub struct OidcVerifier {
    settings: OidcSettings,
    client: reqwest::Client,
    cache: RwLock<Option<CachedJwks>>,
    refresh: Mutex<()>,
}

impl OidcVerifier {
    pub fn new(settings: OidcSettings) -> AppResult<Self> {
        let client = reqwest::Client::builder()
            .timeout(JWKS_TIMEOUT)
            .redirect(reqwest::redirect::Policy::none())
            .build()
            .map_err(|_| AppError::Internal)?;
        Ok(Self {
            settings,
            client,
            cache: RwLock::new(None),
            refresh: Mutex::new(()),
        })
    }

    pub async fn verify_headers(&self, headers: &HeaderMap) -> AppResult<Principal> {
        let token = bearer_token(headers)?;
        self.verify(token).await
    }

    pub async fn verify(&self, token: &str) -> AppResult<Principal> {
        let header = decode_header(token).map_err(|_| AppError::Unauthorized)?;
        validate_oidc_header(&header)?;
        let kid = header.kid.as_deref().ok_or(AppError::Unauthorized)?;
        let jwk = self.key_for(kid).await?;
        verify_oidc_token(token, &jwk, &self.settings)
    }

    async fn key_for(&self, kid: &str) -> AppResult<Jwk> {
        {
            let cache = self.cache.read().await;
            if let Some(cached) = cache.as_ref()
                && cached.fetched_at.elapsed() < JWKS_CACHE_TTL
            {
                if let Some(jwk) = cached.keys.find(kid) {
                    return Ok(jwk.clone());
                }
                if cached.fetched_at.elapsed() < JWKS_UNKNOWN_KID_RETRY {
                    return Err(AppError::Unauthorized);
                }
            }
        }

        let _guard = self.refresh.lock().await;
        {
            let cache = self.cache.read().await;
            if let Some(cached) = cache.as_ref()
                && cached.fetched_at.elapsed() < JWKS_CACHE_TTL
            {
                if let Some(jwk) = cached.keys.find(kid) {
                    return Ok(jwk.clone());
                }
                if cached.fetched_at.elapsed() < JWKS_UNKNOWN_KID_RETRY {
                    return Err(AppError::Unauthorized);
                }
            }
        }

        let keys = self.fetch_jwks().await?;
        let jwk = keys.find(kid).cloned();
        *self.cache.write().await = Some(CachedJwks {
            keys,
            fetched_at: Instant::now(),
        });
        jwk.ok_or(AppError::Unauthorized)
    }

    async fn fetch_jwks(&self) -> AppResult<JwkSet> {
        let response = self
            .client
            .get(&self.settings.jwks_url)
            .header("accept", "application/json")
            .send()
            .await
            .map_err(|_| AppError::Unavailable)?;
        if !response.status().is_success() {
            return Err(AppError::Unavailable);
        }
        if response
            .content_length()
            .is_some_and(|length| length > MAX_JWKS_BYTES as u64)
        {
            return Err(AppError::Unavailable);
        }
        let mut response = response;
        let mut bytes = Vec::new();
        while let Some(chunk) = response.chunk().await.map_err(|_| AppError::Unavailable)? {
            let next_len = bytes
                .len()
                .checked_add(chunk.len())
                .ok_or(AppError::Unavailable)?;
            if next_len > MAX_JWKS_BYTES {
                return Err(AppError::Unavailable);
            }
            bytes.extend_from_slice(&chunk);
        }
        let keys: JwkSet = serde_json::from_slice(&bytes).map_err(|_| AppError::Unavailable)?;
        if keys.keys.is_empty() {
            return Err(AppError::Unavailable);
        }
        Ok(keys)
    }
}

fn validate_oidc_header(header: &jsonwebtoken::Header) -> AppResult<()> {
    if !OIDC_ALGORITHMS.contains(&header.alg)
        || header.jku.is_some()
        || header.jwk.is_some()
        || header.x5u.is_some()
        || header.x5c.is_some()
    {
        return Err(AppError::Unauthorized);
    }
    Ok(())
}

fn verify_oidc_token(token: &str, jwk: &Jwk, settings: &OidcSettings) -> AppResult<Principal> {
    let header = decode_header(token).map_err(|_| AppError::Unauthorized)?;
    validate_oidc_header(&header)?;
    let expected_key_algorithm = match header.alg {
        Algorithm::ES256 => KeyAlgorithm::ES256,
        Algorithm::RS256 => KeyAlgorithm::RS256,
        Algorithm::PS256 => KeyAlgorithm::PS256,
        _ => return Err(AppError::Unauthorized),
    };
    if jwk
        .common
        .key_algorithm
        .is_some_and(|alg| alg != expected_key_algorithm)
        || matches!(jwk.common.public_key_use, Some(PublicKeyUse::Encryption))
        || jwk
            .common
            .key_operations
            .as_ref()
            .is_some_and(|operations| !operations.contains(&KeyOperations::Verify))
    {
        return Err(AppError::Unauthorized);
    }
    let key = DecodingKey::from_jwk(jwk).map_err(|_| AppError::Unauthorized)?;
    let mut validation = Validation::new(header.alg);
    validation.algorithms = vec![header.alg];
    validation.leeway = settings.clock_skew_seconds;
    validation.validate_nbf = true;
    validation.set_issuer(&[&settings.issuer]);
    validation.set_audience(&[&settings.audience]);
    validation.required_spec_claims = ["exp", "nbf", "iss", "aud", "sub"]
        .into_iter()
        .map(str::to_owned)
        .collect::<HashSet<_>>();
    let claims = decode::<OidcClaims>(token, &key, &validation)
        .map_err(|_| AppError::Unauthorized)?
        .claims;
    if claims.sub.is_empty()
        || claims.iss.is_empty()
        || claims.aud.is_null()
        || claims.exp == 0
        || claims.nbf > claims.exp
    {
        return Err(AppError::Unauthorized);
    }
    Ok(Principal {
        subject: claims.sub.clone(),
        roles: claims.roles,
        scopes: claims.scope.split_whitespace().map(str::to_owned).collect(),
        actor: claims.sub,
        org_id: claims.org_id,
        jti: claims.jti,
    })
}

#[derive(Debug, Deserialize)]
struct OidcClaims {
    sub: String,
    iss: String,
    aud: serde_json::Value,
    exp: usize,
    nbf: usize,
    #[serde(default)]
    roles: Vec<String>,
    #[serde(default)]
    scope: String,
    #[serde(default)]
    org_id: Option<String>,
    #[serde(default)]
    jti: Option<String>,
}

#[derive(Debug, Deserialize, serde::Serialize)]
struct Claims {
    sub: String,
    roles: Vec<String>,
    #[serde(default)]
    actor: Option<String>,
    exp: usize,
}

fn bearer_token(headers: &HeaderMap) -> AppResult<&str> {
    let value = headers
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .ok_or(AppError::Unauthorized)?;
    let mut parts = value.split_whitespace();
    let scheme = parts.next().ok_or(AppError::Unauthorized)?;
    let token = parts.next().ok_or(AppError::Unauthorized)?;
    if !scheme.eq_ignore_ascii_case("bearer")
        || parts.next().is_some()
        || token.is_empty()
        || token.len() > MAX_TOKEN_BYTES
    {
        return Err(AppError::Unauthorized);
    }
    Ok(token)
}

/// Verify an HS256 bearer JWT for the loopback profile. Hosted profiles use
/// `OidcVerifier` and reject shared-secret tokens.
pub fn authenticate(headers: &HeaderMap) -> AppResult<Principal> {
    let token = bearer_token(headers)?;
    verify_local_token(token)
}

fn verify_local_token(token: &str) -> AppResult<Principal> {
    let secret = env::var("TORCH_AUTH_JWT_SECRET").map_err(|_| AppError::Unauthorized)?;
    verify_local_token_with_secret(token, &secret)
}

fn verify_local_token_with_secret(token: &str, secret: &str) -> AppResult<Principal> {
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
        scopes: Vec::new(),
        actor: claims.actor.unwrap_or(claims.sub),
        org_id: None,
        jti: None,
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

/// Authorize an operation by role or OAuth scope. `admin` and `engine.admin`
/// always pass; the required role and scope are otherwise independent grants.
pub fn authorize(principal: &Principal, role: &str, scope: &str) -> AppResult<()> {
    if principal.roles.iter().any(|candidate| candidate == "admin")
        || principal
            .scopes
            .iter()
            .any(|candidate| candidate == "engine.admin")
        || principal.roles.iter().any(|candidate| candidate == role)
        || principal.scopes.iter().any(|candidate| candidate == scope)
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

#[cfg(test)]
mod tests;
