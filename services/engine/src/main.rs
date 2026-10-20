// Copyright (c) 2026 Torviello.
//! Process entry point for ENG-003 and ENG-021.
use tokio::net::TcpListener;
use torviello_engine::api::{AppState, router};
use torviello_engine::config::Config;
use torviello_engine::observability::record_startup;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = Config::load()?;
    config.validate()?;
    record_startup(env!("CARGO_PKG_VERSION"));

    let listener = TcpListener::bind(config.bind_address()).await?;
    let state = AppState {
        config: config.clone(),
    };

    axum::serve(listener, router().with_state(state))
        .with_graceful_shutdown(shutdown_signal())
        .await?;
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
