// Copyright (c) 2026 Torviello.
use torviello_engine::error::AppError;
use torviello_engine::persistence::{AuditBegin, AuditStore, connect, purge_older_than};

fn database_url(name: &str) -> (std::path::PathBuf, String) {
    let root = std::env::temp_dir().join(format!("torviello-persistence-{name}"));
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).expect("temp");
    let url = format!("sqlite://{}/engine.db", root.display());
    (root, url)
}

#[tokio::test]
async fn audit_store_migrates_and_records_actions() {
    let (root, url) = database_url("records");
    let store = AuditStore::new(url.clone(), 7);
    store.initialize().await.expect("initialize");
    store
        .record("load", "alice", "resnet18")
        .await
        .expect("record");

    let pool = connect(&url).await.expect("connect");
    let row: (String, String, String, String) =
        sqlx::query_as("SELECT action, actor, model_id, outcome FROM audit_event")
            .fetch_one(&pool)
            .await
            .expect("audit row");
    assert_eq!(
        row,
        (
            "load".to_owned(),
            "alice".to_owned(),
            "resnet18".to_owned(),
            "success".to_owned()
        )
    );
    pool.close().await;
    std::fs::remove_dir_all(root).expect("cleanup");
}

#[tokio::test]
async fn audit_context_and_outcome_are_recorded_before_completion() {
    let (root, url) = database_url("context");
    let store = AuditStore::new(url.clone(), 7);
    store.initialize().await.expect("initialize");
    let id = store
        .begin(AuditBegin {
            action: "inference",
            actor: "user-1",
            model_id: "resnet18",
            request_id: "request-1",
            org_id: Some("org-1"),
            jti: Some("jti-1"),
        })
        .await
        .expect("begin");

    let pool = connect(&url).await.expect("connect");
    let pending: (String, String, Option<String>, Option<String>, String) = sqlx::query_as(
        "SELECT request_id, outcome, org_id, jti, actor FROM audit_event WHERE id = ?1",
    )
    .bind(id)
    .fetch_one(&pool)
    .await
    .expect("pending row");
    assert_eq!(
        pending,
        (
            "request-1".to_owned(),
            "pending".to_owned(),
            Some("org-1".to_owned()),
            Some("jti-1".to_owned()),
            "user-1".to_owned()
        )
    );

    store.finish(id, Some("internal")).await.expect("finish");
    let finished: (String, Option<String>) =
        sqlx::query_as("SELECT outcome, error_code FROM audit_event WHERE id = ?1")
            .bind(id)
            .fetch_one(&pool)
            .await
            .expect("finished row");
    assert_eq!(
        finished,
        ("failure".to_owned(), Some("internal".to_owned()))
    );
    store.ping().await.expect("healthy");
    pool.close().await;
    std::fs::remove_dir_all(root).expect("cleanup");
}

#[tokio::test]
async fn uninitialized_audit_store_fails_closed() {
    let store = AuditStore::new("sqlite://data/engine.db", 7);
    assert!(matches!(
        store.record("load", "alice", "resnet18").await,
        Err(AppError::Unavailable)
    ));
}

#[tokio::test]
async fn broken_database_fails_closed() {
    let store = AuditStore::new("sqlite:///dev/null/engine.db", 7);
    assert!(matches!(
        store.initialize().await,
        Err(AppError::Unavailable)
    ));
}

#[tokio::test]
async fn retention_purges_expired_audit_rows() {
    let (root, url) = database_url("retention");
    let store = AuditStore::new(url.clone(), 7);
    store.initialize().await.expect("initialize");

    let pool = connect(&url).await.expect("connect");
    sqlx::query(
        "INSERT INTO audit_event (action, actor, model_id, created_at) \
         VALUES ('load', 'alice', 'resnet18', datetime('now', '-10 days'))",
    )
    .execute(&pool)
    .await
    .expect("old row");
    sqlx::query(
        "INSERT INTO audit_event (action, actor, model_id) VALUES ('load', 'alice', 'resnet18')",
    )
    .execute(&pool)
    .await
    .expect("recent row");

    purge_older_than(&pool, 7).await.expect("purge");
    let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM audit_event")
        .fetch_one(&pool)
        .await
        .expect("count");
    assert_eq!(count.0, 1);
    pool.close().await;
    std::fs::remove_dir_all(root).expect("cleanup");
}
