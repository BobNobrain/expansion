CREATE TABLE IF NOT EXISTS star_systems (
    system_id CHAR(6) PRIMARY KEY NOT NULL,
    -- coords
    coords_r DOUBLE PRECISION NOT NULL,
    coords_th DOUBLE PRECISION NOT NULL,
    coords_h DOUBLE PRECISION NOT NULL,
    -- exploration data
    explored_at TIMESTAMPTZ DEFAULT NULL,
    explored_by UUID DEFAULT NULL,
    -- system mechanical data (orbits, etc)
    system_data JSONB NOT NULL DEFAULT '{}'::JSONB,
    system_stars JSONB NOT NULL DEFAULT '[]'::JSONB,
    -- aggregates
    map_brightness DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    n_stars INTEGER NOT NULL DEFAULT 0,
    n_planets INTEGER NOT NULL DEFAULT 0,
    n_moons INTEGER NOT NULL DEFAULT 0,
    n_asteroids INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS worlds (
    body_id VARCHAR(15) PRIMARY KEY NOT NULL,
    system_id CHAR(6) NOT NULL,
    -- params
    -- T for terrestial, G for gas giant
    class CHAR NOT NULL,
    age_byrs DOUBLE PRECISION NOT NULL,
    radius_km DOUBLE PRECISION NOT NULL,
    mass_earths DOUBLE PRECISION NOT NULL,
    axis_tilt DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    day_length_game_days DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    grid_size INTEGER NOT NULL DEFAULT 0,
    -- exploration data
    explored_at TIMESTAMPTZ DEFAULT NULL,
    explored_by UUID DEFAULT NULL,
    -- surface conditions
    surface_pressure_bar DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    surface_avg_temp_k DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    surface_gravity_g DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    -- all the surface data will be packed into here: graph, tile conditions, composition, etc.
    surface_data JSONB NOT NULL DEFAULT '{}'::JSONB
);
