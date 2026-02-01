CREATE TABLE IF NOT EXISTS universe_log (
    id SERIAL PRIMARY KEY NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES users DEFAULT NULL,
    celestial_id VARCHAR(15) DEFAULT '',
    message TEXT,
    event JSONB NOT NULL DEFAULT '{}'::JSONB
);
