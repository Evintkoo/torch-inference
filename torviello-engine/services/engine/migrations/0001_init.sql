-- Copyright (c) 2026 Torviello.
CREATE TABLE IF NOT EXISTS model_registry (
    id TEXT PRIMARY KEY NOT NULL,
    version TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    source_url TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_event (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    model_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_event_created_at ON audit_event (created_at);
