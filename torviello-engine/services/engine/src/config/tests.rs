// Copyright (c) 2026 Torviello.
//! Unit tests for `config` (moved out of config.rs for the CQ-02 500-line bound; ticket 0048).

use super::{
    Accelerators, AccessControl, AuthMode, Config, FileConfig, env_allowlist, env_bool, env_parse,
    is_loopback_host, secure_url,
};

fn valid_config() -> Config {
    Config {
        host: "127.0.0.1".to_owned(),
        port: 8000,
        auth_enabled: true,
        auth_mode: AuthMode::Local,
        oidc_issuer: String::new(),
        oidc_audience: String::new(),
        oidc_jwks_url: String::new(),
        oidc_clock_skew_seconds: 60,
        max_body_bytes: 1024,
        max_batch_size: 8,
        timeout_ms: 1000,
        retention_max_age_days: 7,
        max_queue_depth: 4,
        model_registry: "registry.toml".to_owned(),
        database_url: "sqlite://data/engine.db".to_owned(),
        model_root: "torviello-engine/models".to_owned(),
        max_model_bytes: 1024,
        max_loaded_models: 2,
        download_concurrency: 2,
        download_timeout_ms: 1000,
        model_source_allowlist: vec!["models.example".to_owned()],
        max_frame_bytes: 1024,
        shutdown_timeout_ms: 1000,
        max_size_bytes: 1024,
        rate_limit_per_minute: 60,
        decompression_max_expansion_bytes: 1024,
        tls_min_version: "1.3".to_owned(),
        cors_allowed_origin: "https://console.example".to_owned(),
        accelerator_fallback: "cpu".to_owned(),
        accelerators: Accelerators::default(),
        access_control: AccessControl::default(),
    }
}

#[test]
fn rejects_empty_limits() {
    let config = Config {
        host: String::new(),
        port: 0,
        auth_enabled: true,
        auth_mode: super::AuthMode::Local,
        oidc_issuer: String::new(),
        oidc_audience: String::new(),
        oidc_jwks_url: String::new(),
        oidc_clock_skew_seconds: 60,
        max_body_bytes: 0,
        max_batch_size: 0,
        timeout_ms: 0,
        retention_max_age_days: 0,
        max_queue_depth: 0,
        model_registry: String::new(),
        database_url: String::new(),
        model_root: String::new(),
        max_model_bytes: 0,
        max_loaded_models: 0,
        download_concurrency: 0,
        download_timeout_ms: 0,
        model_source_allowlist: Vec::new(),
        max_frame_bytes: 0,
        shutdown_timeout_ms: 0,
        max_size_bytes: 0,
        rate_limit_per_minute: 0,
        decompression_max_expansion_bytes: 0,
        tls_min_version: String::new(),
        cors_allowed_origin: String::new(),
        accelerator_fallback: String::new(),
        accelerators: Accelerators::default(),
        access_control: AccessControl::default(),
    };
    assert!(config.validate().is_err());
}

#[test]
fn valid_configuration_reports_bind_and_backend() {
    let config = valid_config();
    config.validate().expect("valid");
    assert_eq!(config.bind_address(), "127.0.0.1:8000");
    assert_eq!(config.selected_backend(), "cpu");
    let mut accelerated = valid_config();
    accelerated.accelerators.metal = true;
    assert_eq!(accelerated.selected_backend(), "metal");
}

#[test]
fn every_single_invalid_field_is_rejected() {
    type Mutation = Box<dyn Fn(&mut Config)>;
    let mutations: Vec<Mutation> = vec![
        Box::new(|c| c.host.clear()),
        Box::new(|c| c.max_body_bytes = 0),
        Box::new(|c| c.max_batch_size = 0),
        Box::new(|c| c.max_queue_depth = 0),
        Box::new(|c| c.timeout_ms = 0),
        Box::new(|c| c.retention_max_age_days = 0),
        Box::new(|c| c.model_registry.clear()),
        Box::new(|c| c.database_url = "postgres://db".to_owned()),
        Box::new(|c| c.model_root.clear()),
        Box::new(|c| c.max_model_bytes = 0),
        Box::new(|c| c.download_concurrency = 0),
        Box::new(|c| c.download_timeout_ms = 0),
        Box::new(|c| c.model_source_allowlist.clear()),
        Box::new(|c| c.model_source_allowlist = vec![String::new()]),
        Box::new(|c| c.model_source_allowlist = vec!["host/path".to_owned()]),
        Box::new(|c| c.max_frame_bytes = 0),
        Box::new(|c| c.shutdown_timeout_ms = 0),
        Box::new(|c| c.max_size_bytes = 0),
        Box::new(|c| c.rate_limit_per_minute = 0),
        Box::new(|c| c.decompression_max_expansion_bytes = 0),
        Box::new(|c| c.tls_min_version = "1.2".to_owned()),
        Box::new(|c| c.cors_allowed_origin.clear()),
        Box::new(|c| c.accelerator_fallback = "vulkan".to_owned()),
        Box::new(|c| c.access_control.public_routes = vec!["health".to_owned()]),
        Box::new(|c| c.access_control.private_routes = vec!["private".to_owned()]),
    ];
    for mutate in mutations {
        let mut config = valid_config();
        mutate(&mut config);
        assert!(config.validate().is_err());
    }
}

#[test]
fn oidc_and_local_modes_enforce_their_boundaries() {
    let mut config = valid_config();
    config.auth_mode = AuthMode::Oidc;
    assert!(config.validate().is_err());

    config.oidc_issuer = "https://issuer.example".to_owned();
    config.oidc_audience = "engine".to_owned();
    config.oidc_jwks_url = "https://issuer.example/jwks".to_owned();
    config.validate().expect("oidc valid");
    config.oidc_clock_skew_seconds = 301;
    assert!(config.validate().is_err());
    config.oidc_clock_skew_seconds = 300;
    config.validate().expect("max skew");

    let mut local = valid_config();
    local.oidc_issuer = "https://issuer.example".to_owned();
    assert!(local.validate().is_err());
    local.oidc_issuer.clear();
    local.oidc_audience = "engine".to_owned();
    assert!(local.validate().is_err());
    local.oidc_audience.clear();
    local.oidc_jwks_url = "https://issuer.example/jwks".to_owned();
    assert!(local.validate().is_err());
    local.oidc_jwks_url.clear();
    local.host = "0.0.0.0".to_owned();
    assert!(local.validate().is_err());
    local.host = "localhost".to_owned();
    local.validate().expect("loopback name");
    local.host = "::1".to_owned();
    local.validate().expect("ipv6 loopback");
    local.host = "[::1]".to_owned();
    local.validate().expect("bracketed loopback");
}

#[test]
fn unsupported_accelerators_fail_only_when_enabled() {
    let mut config = valid_config();
    config.accelerators.cuda = true;
    assert!(matches!(
        config.validate(),
        Err(super::AppError::BackendUnavailable)
    ));
    config.accelerators.cuda = false;
    config.accelerators.metal = true;
    let expected = if cfg!(all(target_os = "macos", feature = "metal")) {
        Ok(())
    } else {
        Err(super::AppError::BackendUnavailable)
    };
    assert_eq!(config.validate().is_ok(), expected.is_ok());
}

#[test]
fn secure_urls_reject_spoofing_and_insecure_schemes() {
    for valid in [
        "https://issuer.example",
        "https://issuer.example/path",
        "http://127.0.0.1:8080/jwks",
        "http://localhost/jwks",
        "http://[::1]/jwks",
    ] {
        assert!(secure_url(valid), "{valid}");
    }
    for invalid in [
        "https://user:pass@issuer.example",
        "https://issuer.example/#fragment",
        "mailto:issuer@example",
        "http://issuer.example/jwks",
        "https://",
        "not a url",
    ] {
        assert!(!secure_url(invalid), "{invalid}");
    }
    for loopback in ["localhost", "127.0.0.1", "::1", "[::1]"] {
        assert!(is_loopback_host(loopback));
    }
    assert!(!is_loopback_host("0.0.0.0"));
}

#[test]
fn assembly_defaults_and_disabled_auth_are_checked() {
    let config = Config::assemble(FileConfig::default()).expect("defaults");
    assert_eq!(config.host, "127.0.0.1");
    assert_eq!(config.port, 8000);
    assert_eq!(config.max_body_bytes, 1_048_576);
    assert_eq!(config.max_batch_size, 8);
    assert_eq!(config.max_queue_depth, 32);
    assert_eq!(config.timeout_ms, 30_000);
    assert_eq!(config.retention_max_age_days, 7);
    assert_eq!(
        config.model_registry,
        "torviello-engine/config/model-registry.toml"
    );
    assert_eq!(config.database_url, "sqlite://data/engine.db");
    assert_eq!(config.model_root, "torviello-engine/models");
    assert_eq!(config.max_model_bytes, 1_073_741_824);
    assert_eq!(config.max_loaded_models, 2);
    assert_eq!(config.download_concurrency, 2);
    assert_eq!(config.download_timeout_ms, 300_000);
    assert_eq!(config.model_source_allowlist.len(), 3);
    assert_eq!(config.max_frame_bytes, 262_144);
    assert_eq!(config.shutdown_timeout_ms, 15_000);
    assert_eq!(config.max_size_bytes, 104_857_600);
    assert_eq!(config.rate_limit_per_minute, 120);
    assert_eq!(config.decompression_max_expansion_bytes, 4_194_304);
    assert_eq!(config.tls_min_version, "1.3");
    assert_eq!(
        config.cors_allowed_origin,
        "https://console.torviello.local"
    );
    assert_eq!(config.accelerator_fallback, "cpu");
    config.validate().expect("defaults valid");

    assert!(
        Config::assemble(FileConfig {
            require_auth: Some(false),
            ..FileConfig::default()
        })
        .is_err()
    );
    assert!(
        Config::assemble(FileConfig {
            auth_enabled: Some(false),
            ..FileConfig::default()
        })
        .is_err()
    );
}

#[test]
fn reload_watch_and_sighup_paths_are_callable() {
    let _ = super::reload_config();
    let _ = super::watch_config();
    super::install_sighup_handler().expect("handler");
}

#[test]
fn environment_helpers_reject_invalid_absent_values() {
    assert_eq!(env_bool("TORVIELLO_TEST_ABSENT").expect("absent"), None);
    assert_eq!(
        env_parse::<u16>("TORVIELLO_TEST_ABSENT").expect("absent"),
        None
    );
    assert_eq!(
        env_allowlist("TORVIELLO_TEST_ABSENT").expect("absent"),
        None
    );
}

#[test]
fn environment_value_parsers_accept_and_reject_present_values() {
    // The parsers are split from the env readers so present-value behavior is
    // testable without mutating process state (set_var is unsafe in edition
    // 2024 and the workspace forbids unsafe code).
    assert_eq!(super::parse_bool("true").expect("true"), Some(true));
    assert_eq!(super::parse_bool("false").expect("false"), Some(false));
    assert!(super::parse_bool("yes").is_err());

    assert_eq!(super::parse_value::<u16>("8443").expect("port"), 8443);
    assert!(super::parse_value::<u16>("not-a-port").is_err());

    assert_eq!(
        super::parse_allowlist("a.example, b.example ,,c.example").expect("allowlist"),
        Some(vec![
            "a.example".to_owned(),
            "b.example".to_owned(),
            "c.example".to_owned()
        ])
    );
    assert!(super::parse_allowlist(" , ").is_err());
}
