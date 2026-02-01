CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY NOT NULL,
    -- location
    system_id CHAR(6) NOT NULL REFERENCES star_systems,
    world_id VARCHAR(15) NOT NULL REFERENCES worlds,
    tile_id SMALLINT NOT NULL,
    -- city founding info
    name TEXT NOT NULL,
    established_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    established_by UUID NOT NULL REFERENCES users,
    -- city data
    city_level SMALLINT NOT NULL DEFAULT 0,
    city_data JSONB NOT NULL DEFAULT '{}'::JSONB,
    population INTEGER NOT NULL DEFAULT 0,
    population_data JSONB NOT NULL DEFAULT '{}'::JSONB
);
