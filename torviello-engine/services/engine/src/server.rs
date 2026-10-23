// Copyright (c) 2026 Torviello.
//! Process server lifecycle for ENG-003 and ENG-021.
use std::future::IntoFuture;
use std::time::Duration;

use tokio::net::TcpListener;

use crate::api::{build_state, router};
use crate::config::Config;
use crate::observability::record_startup;

pub async fn run(
    config: Config,
    shutdown: impl std::future::Future<Output = ()> + Send + 'static,
) -> Result<(), Box<dyn std::error::Error>> {
    let bind_address = config.bind_address();
    let state = build_state(config.clone())?;
    #[cfg(feature = "persistence")]
    let mut state = state;
    #[cfg(feature = "persistence")]
    let maintenance = {
        let audit = crate::persistence::AuditStore::new(
            config.database_url.clone(),
            config.retention_max_age_days,
        );
        audit.initialize().await?;
        state.audit = Some(audit.clone());
        let mut interval =
            tokio::time::interval(Duration::from_secs(crate::persistence::PURGE_INTERVAL_SECS));
        interval.tick().await;
        tokio::spawn(async move {
            loop {
                interval.tick().await;
                if let Err(error) = audit.purge().await {
                    tracing::warn!(%error, event = "audit_retention_failed", "audit retention purge failed");
                }
            }
        })
    };
    record_startup(env!("CARGO_PKG_VERSION"));

    let listener = TcpListener::bind(bind_address).await?;

    let (shutdown_tx, mut shutdown_rx) = tokio::sync::watch::channel(());
    let server = axum::serve(listener, router(&state))
        .with_graceful_shutdown(async move {
            shutdown.await;
            let _ = shutdown_tx.send(());
        })
        .into_future();
    tokio::pin!(server);
    tokio::select! {
        result = &mut server => result?,
        _ = shutdown_rx.changed() => {
            if let Ok(result) = tokio::time::timeout(
                Duration::from_millis(config.shutdown_timeout_ms),
                &mut server,
            ).await {
                result?;
            } else {
                tracing::warn!("graceful shutdown timed out");
            }
        }
    }
    #[cfg(feature = "persistence")]
    maintenance.abort();
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::{Accelerators, AccessControl, AuthMode};

    fn config(port: u16, database_url: String) -> Config {
        Config {
            host: "127.0.0.1".to_owned(),
            port,
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
            model_registry: concat!(
                env!("CARGO_MANIFEST_DIR"),
                "/../../config/model-registry.toml"
            )
            .to_owned(),
            database_url,
            model_root: "models".to_owned(),
            max_model_bytes: 1024,
            max_loaded_models: 2,
            download_concurrency: 2,
            download_timeout_ms: 1000,
            model_source_allowlist: vec!["models.example".to_owned()],
            max_frame_bytes: 1024,
            shutdown_timeout_ms: 1_000,
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

    #[tokio::test]
    async fn run_serves_and_stops_on_shutdown() {
        let root = std::env::temp_dir().join(format!("torviello-main-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&root).expect("temp");
        let database_url = format!("sqlite://{}/engine.db", root.display());
        let (shutdown_tx, shutdown_rx) = tokio::sync::oneshot::channel();
        let handle = tokio::spawn(async move {
            run(config(0, database_url), async {
                let _ = shutdown_rx.await;
            })
            .await
            .expect("server run");
        });
        tokio::time::sleep(Duration::from_millis(100)).await;
        let _ = shutdown_tx.send(());
        handle.await.expect("joined");
        std::fs::remove_dir_all(root).expect("cleanup");
    }
}
