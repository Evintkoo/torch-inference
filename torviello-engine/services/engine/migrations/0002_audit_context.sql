-- Copyright (c) 2026 Torviello.
ALTER TABLE audit_event ADD COLUMN request_id TEXT NOT NULL DEFAULT '';
ALTER TABLE audit_event ADD COLUMN outcome TEXT NOT NULL DEFAULT 'success';
ALTER TABLE audit_event ADD COLUMN org_id TEXT;
ALTER TABLE audit_event ADD COLUMN jti TEXT;
ALTER TABLE audit_event ADD COLUMN error_code TEXT;

CREATE INDEX IF NOT EXISTS idx_audit_event_request_id ON audit_event (request_id);
CREATE INDEX IF NOT EXISTS idx_audit_event_outcome ON audit_event (outcome);
