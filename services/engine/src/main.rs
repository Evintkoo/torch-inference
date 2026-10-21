// Copyright (c) 2026 Torviello.
//! Process entry point for ENG-003 and ENG-021.
use std::future::IntoFuture;
use std::time::Duration;

use tokio::net::TcpListener;
use torviello_engine::api::{build_state, router};
use torviello_engine::config::Config;
use torviello_engine::observability::record_startup;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = Config::load()?;
    config.validate()?;
    let bind_address = config.bind_address();
    let state = build_state(config.clone())?;
    record_startup(env!("CARGO_PKG_VERSION"));

    let listener = TcpListener::bind(bind_address).await?;

    let (shutdown_tx, mut shutdown_rx) = tokio::sync::watch::channel(());
    let server = axum::serve(listener, router(&config).with_state(state))
        .with_graceful_shutdown(async move {
            shutdown_signal().await;
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
    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async {
        if tokio::signal::ctrl_c().await.is_err() {
            std::future::pending::<()>().await;
        }
    };

    #[cfg(unix)]
    let terminate = async {
        match tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate()) {
            Ok(mut signal) => {
                signal.recv().await;
            }
            Err(_) => std::future::pending::<()>().await,
        }
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        () = ctrl_c => {},
        () = terminate => {},
    }
}
