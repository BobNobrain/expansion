CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY NOT NULL,
    -- location
    system_id CHAR(6) NOT NULL,
    world_id VARCHAR(15) NOT NULL,
    tile_id SMALLINT NOT NULL,
    -- city founding info
    name TEXT NOT NULL,
    established_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    established_by UUID NOT NULL,
    -- city data
    city_level SMALLINT NOT NULL DEFAULT 0,
    city_data JSONB NOT NULL DEFAULT '{}'::JSONB,
    population INTEGER NOT NULL DEFAULT 0,
    population_data JSONB NOT NULL DEFAULT '{}'::JSONB
);

CREATE TABLE IF NOT EXISTS bases (
    id SERIAL PRIMARY KEY NOT NULL,
    system_id CHAR(6) NOT NULL,
    world_id VARCHAR(15) NOT NULL,
    tile_id SMALLINT NOT NULL,
    city_id INTEGER NOT NULL REFERENCES cities,
    company_id UUID NOT NULL REFERENCES companies,
    established_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::JSONB
);

CREATE TABLE IF NOT EXISTS factories (
    id SERIAL PRIMARY KEY NOT NULL,
    base_id INTEGER NOT NULL REFERENCES bases,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_to TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::JSONB
);

CREATE
OR REPLACE VIEW base_overviews AS
SELECT id,
    system_id,
    world_id,
    tile_id,
    city_id,
    company_id,
    established_at,
    name,
    COALESCE(base_factories.n_factories, 0) AS n_factories
FROM bases
    LEFT JOIN (
        SELECT base_id,
            COUNT(*) as n_factories
        FROM factories
        GROUP BY base_id
    ) AS base_factories ON base_factories.base_id = bases.id;
