// Copyright (c) 2026 Torviello.
use std::path::Path;
use std::str::FromStr;
use std::sync::Arc;
use std::time::Duration;

use sqlx::sqlite::{
    SqliteConnectOptions, SqliteJournalMode, SqlitePool, SqlitePoolOptions, SqliteSynchronous,
};
use tokio::sync::OnceCell;

use crate::error::{AppError, AppResult};

pub const MAX_POOL_CONNECTIONS: u32 = 8;
pub const MIGRATION_TIMEOUT_SECS: u64 = 60;
pub const BUSY_TIMEOUT_SECS: u64 = 5;
pub const HEALTH_TIMEOUT_SECS: u64 = 1;
pub const PURGE_INTERVAL_SECS: u64 = 3_600;

pub struct AuditBegin<'a> {
    pub action: &'a str,
    pub actor: &'a str,
    pub model_id: &'a str,
    pub request_id: &'a str,
    pub org_id: Option<&'a str>,
    pub jti: Option<&'a str>,
}

#[derive(Clone)]
pub struct AuditStore {
    url: String,
    retention_days: u64,
    pool: Arc<OnceCell<SqlitePool>>,
}

impl AuditStore {
    #[must_use]
    pub fn new(url: impl Into<String>, retention_days: u64) -> Self {
        Self {
            url: url.into(),
            retention_days,
            pool: Arc::new(OnceCell::new()),
        }
    }

    /// Open the database, apply migrations, and purge expired audit rows.
    /// Startup calls this explicitly so a broken database fails before the
    /// listener accepts traffic.
    pub async fn initialize(&self) -> AppResult<()> {
        if self.pool.initialized() {
            return Ok(());
        }
        create_parent(&self.url)?;
        let pool = connect(&self.url).await?;
        tokio::time::timeout(Duration::from_secs(MIGRATION_TIMEOUT_SECS), migrate(&pool))
            .await
            .map_err(|_| AppError::Unavailable)??;
        purge_older_than(&pool, self.retention_days).await?;
        self.pool.set(pool).map_err(|_| AppError::Internal)
    }

    pub async fn record(&self, action: &str, actor: &str, model_id: &str) -> AppResult<()> {
        let id = self
            .begin(AuditBegin {
                action,
                actor,
                model_id,
                request_id: "",
                org_id: None,
                jti: None,
            })
            .await?;
        self.finish(id, None).await
    }

    /// Persist the intent before the side effect so a missing or broken audit
    /// store fails closed without performing an unaudited action.
    pub async fn begin(&self, event: AuditBegin<'_>) -> AppResult<i64> {
        let pool = self.pool.get().ok_or(AppError::Unavailable)?;
        let result = sqlx::query(
            "INSERT INTO audit_event \
             (action, actor, model_id, request_id, org_id, jti, outcome) \
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'pending')",
        )
        .bind(event.action)
        .bind(event.actor)
        .bind(event.model_id)
        .bind(event.request_id)
        .bind(event.org_id)
        .bind(event.jti)
        .execute(pool)
        .await
        .map_err(|_| AppError::Internal)?;
        Ok(result.last_insert_rowid())
    }

    pub async fn finish(&self, id: i64, error_code: Option<&str>) -> AppResult<()> {
        let pool = self.pool.get().ok_or(AppError::Unavailable)?;
        let outcome = if error_code.is_some() {
            "failure"
        } else {
            "success"
        };
        sqlx::query("UPDATE audit_event SET outcome = ?1, error_code = ?2 WHERE id = ?3")
            .bind(outcome)
            .bind(error_code)
            .bind(id)
            .execute(pool)
            .await
            .map_err(|_| AppError::Internal)?;
        Ok(())
    }

    pub async fn ping(&self) -> AppResult<()> {
        let pool = self.pool.get().ok_or(AppError::Unavailable)?;
        tokio::time::timeout(
            Duration::from_secs(HEALTH_TIMEOUT_SECS),
            sqlx::query("SELECT 1").execute(pool),
        )
        .await
        .map_err(|_| AppError::Unavailable)?
        .map_err(|_| AppError::Unavailable)?;
        Ok(())
    }

    pub async fn purge(&self) -> AppResult<()> {
        let pool = self.pool.get().ok_or(AppError::Unavailable)?;
        purge_older_than(pool, self.retention_days).await
    }
}

pub async fn connect(database_url: &str) -> AppResult<SqlitePool> {
    let options = SqliteConnectOptions::from_str(database_url)
        .map_err(|_| AppError::InvalidInput)?
        .create_if_missing(true)
        .journal_mode(SqliteJournalMode::Wal)
        .synchronous(SqliteSynchronous::Normal)
        .busy_timeout(Duration::from_secs(BUSY_TIMEOUT_SECS));
    SqlitePoolOptions::new()
        .max_connections(MAX_POOL_CONNECTIONS)
        .connect_with(options)
        .await
        .map_err(|_| AppError::Unavailable)
}

pub async fn migrate(pool: &SqlitePool) -> AppResult<()> {
    sqlx::migrate!("./migrations")
        .run(pool)
        .await
        .map_err(|_| AppError::Internal)
}

pub async fn purge_older_than(pool: &SqlitePool, days: u64) -> AppResult<()> {
    let cutoff = format!("-{days} days");
    sqlx::query("DELETE FROM audit_event WHERE created_at < datetime('now', ?1)")
        .bind(cutoff)
        .execute(pool)
        .await
        .map_err(|_| AppError::Internal)?;
    Ok(())
}

fn create_parent(database_url: &str) -> AppResult<()> {
    let Some(path) = database_url.strip_prefix("sqlite://") else {
        return Err(AppError::InvalidInput);
    };
    let path = path.split('?').next().unwrap_or_default();
    if path.is_empty() || path == ":memory:" {
        return Ok(());
    }
    if let Some(parent) = Path::new(path).parent()
        && !parent.as_os_str().is_empty()
        && !parent.exists()
    {
        std::fs::create_dir_all(parent).map_err(|_| AppError::Unavailable)?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn urls_outside_sqlite_are_rejected_and_memory_needs_no_parent() {
        assert!(matches!(
            create_parent("postgres://db"),
            Err(AppError::InvalidInput)
        ));
        create_parent("sqlite://:memory:").expect("memory url");
        create_parent("sqlite://").expect("empty path");
    }

    #[tokio::test]
    async fn stores_require_initialization_before_use() {
        let store = AuditStore::new("sqlite::memory:", 7);
        assert!(matches!(store.ping().await, Err(AppError::Unavailable)));
        assert!(matches!(store.purge().await, Err(AppError::Unavailable)));
        assert!(matches!(
            store
                .begin(AuditBegin {
                    action: "load",
                    actor: "operator",
                    model_id: "demo",
                    request_id: "request",
                    org_id: None,
                    jti: None,
                })
                .await,
            Err(AppError::Unavailable)
        ));
        assert!(matches!(
            store.finish(1, None).await,
            Err(AppError::Unavailable)
        ));
    }

    #[tokio::test]
    async fn initialization_is_idempotent_and_purges() {
        let root = std::env::temp_dir().join(format!("torviello-audit-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&root).expect("temp");
        let store = AuditStore::new(format!("sqlite://{}/nested/engine.db", root.display()), 7);
        store.initialize().await.expect("initialize");
        store.initialize().await.expect("idempotent");
        store.ping().await.expect("ping");
        store.purge().await.expect("purge");
        store
            .record("load", "operator", "demo")
            .await
            .expect("record");
        std::fs::remove_dir_all(root).expect("cleanup");
    }
}
