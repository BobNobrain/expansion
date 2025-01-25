CREATE TABLE IF NOT EXISTS bases (
    id SERIAL PRIMARY KEY NOT NULL,
    system_id CHAR(6) NOT NULL,
    world_id VARCHAR(15) NOT NULL,
    tile_id SMALLINT NOT NULL,
    company_id UUID NOT NULL,
    enstablished_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    base_content JSONB NOT NULL DEFAULT '{}'::JSONB
);

CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY NOT NULL,
    -- location
    system_id CHAR(6) NOT NULL,
    world_id VARCHAR(15) NOT NULL,
    tile_id SMALLINT NOT NULL,
    -- city founding info
    name TEXT NOT NULL,
    enstablished_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    enstablished_by UUID NOT NULL,
    -- city data
    city_level SMALLINT NOT NULL DEFAULT 1,
    population INTEGER NOT NULL DEFAULT 0,
    population_data JSONB NOT NULL DEFAULT '{}'::JSONB
);
