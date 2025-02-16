CREATE TABLE IF NOT EXISTS resource_deposits (
    id SERIAL PRIMARY KEY NOT NULL,
    resource_id TEXT NOT NULL,
    abundance DOUBLE PRECISION NOT NULL,
    system_id CHAR(6) NOT NULL,
    world_id VARCHAR(15) NOT NULL,
    tile_id SMALLINT NOT NULL
);

-- CREATE TABLE IF NOT EXISTS natural_resource (
--     id SERIAL PRIMARY KEY NOT NULL,
--     resource_id TEXT NOT NULL,
--     abundance DOUBLE PRECISION NOT NULL,
--     system_id CHAR(6) NOT NULL,
--     world_id VARCHAR(15) NOT NULL,
--     tile_id SMALLINT NOT NULL
-- );
-- CREATE TABLE IF NOT EXISTS production_resource (
--     id SERIAL PRIMARY KEY NOT NULL,
--     resource_id TEXT NOT NULL,
--     abundance DOUBLE PRECISION NOT NULL,
--     system_id CHAR(6) NOT NULL,
--     world_id VARCHAR(15) NOT NULL,
--     tile_id SMALLINT NOT NULL
-- );
