// Copyright (c) 2026 Torviello.
use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};

use crate::error::{AppError, AppResult};

pub const MAX_POOL_CONNECTIONS: u32 = 8;
pub const MIGRATION_TIMEOUT_SECS: u64 = 60;
pub const AUDIT_RETENTION_DAYS: u64 = 90;

pub async fn connect(database_url: &str) -> AppResult<SqlitePool> {
    SqlitePoolOptions::new()
        .max_connections(MAX_POOL_CONNECTIONS)
        .connect(database_url)
        .await
        .map_err(|_| AppError::Unavailable)
}

pub async fn migrate(pool: &SqlitePool) -> AppResult<()> {
    sqlx::migrate!("./migrations")
        .run(pool)
        .await
        .map_err(|_| AppError::Internal)
}

pub async fn transaction_example(pool: &SqlitePool) -> AppResult<()> {
    let mut transaction = pool.begin().await.map_err(|_| AppError::Unavailable)?;
    sqlx::query("UPDATE model_registry SET updated_at = CURRENT_TIMESTAMP")
        .execute(&mut *transaction)
        .await
        .map_err(|_| AppError::Internal)?;
    transaction.commit().await.map_err(|_| AppError::Internal)
}
