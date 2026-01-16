CREATE TABLE IF NOT EXISTS scheduled_storage_updates (
    id SERIAL PRIMARY KEY,
    storage_id TEXT NOT NULL,
    patch JSONB NOT NULL,
    apply_at TIMESTAMPTZ NOT NULL,
    created TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
