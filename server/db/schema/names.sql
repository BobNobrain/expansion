CREATE TABLE IF NOT EXISTS celestial_names_submissions (
    entry_id SERIAL PRIMARY KEY NOT NULL,
    celestial_id VARCHAR(15) NOT NULL,
    name TEXT NOT NULL,
    author_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ DEFAULT NULL,
    reviewer_id UUID DEFAULT NULL,
    review_comment TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS celestial_names (
    entry_id SERIAL PRIMARY KEY NOT NULL,
    celestial_id VARCHAR(15) NOT NULL,
    name TEXT NOT NULL,
    author_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewer_id UUID NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS index_celestial_names_celestial_id ON celestial_names (celestial_id);
