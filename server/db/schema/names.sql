CREATE TABLE IF NOT EXISTS celestial_names_registry (
    entry_id SERIAL PRIMARY KEY NOT NULL,
    celestial_id VARCHAR(15) NOT NULL,
    --status: Submitted / Approved / Declined
    status CHAR NOT NULL DEFAULT 'S',
    author_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ DEFAULT NULL,
    reviewer_id UUID,
    name TEXT NOT NULL,
    review_comment TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS index_celestial_names_registry_celestial_id ON celestial_names_registry (celestial_id);
