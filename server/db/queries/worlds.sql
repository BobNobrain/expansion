-- name: CreateWorlds :copyfrom
INSERT INTO worlds (
        body_id,
        system_id,
        age_byrs,
        radius_km,
        mass_earths,
        class,
        axis_tilt,
        day_length_game_days,
        grid_size
    )
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);

-- name: ExploreWorld :exec
UPDATE worlds
SET explored_at = NOW(),
    explored_by = $1,
    surface_pressure_bar = $2,
    surface_avg_temp_k = $3,
    surface_gravity_g = $4,
    grid_size = $5,
    surface_data = $6
WHERE body_id = $7;

-- name: GetWorldsInSystem :many
SELECT worlds.body_id,
    worlds.age_byrs,
    worlds.radius_km,
    worlds.mass_earths,
    worlds.class,
    worlds.explored_at,
    worlds.explored_by,
    worlds.surface_pressure_bar,
    worlds.surface_avg_temp_k,
    worlds.surface_gravity_g,
    worlds.grid_size,
    COALESCE(world_cities.n_cities, 0),
    COALESCE(world_cities.population, 0),
    COALESCE(world_bases.n_bases, 0)
FROM worlds
    LEFT JOIN (
        SELECT cities.world_id,
            COUNT(*) AS n_cities,
            SUM(cities.population) AS population
        FROM cities
        GROUP BY cities.world_id
    ) AS world_cities ON world_cities.world_id = worlds.body_id
    LEFT JOIN (
        SELECT bases.world_id,
            COUNT(*) AS n_bases
        FROM bases
        GROUP BY bases.world_id
    ) AS world_bases ON world_bases.world_id = worlds.body_id
WHERE worlds.system_id = $1;

-- name: ResolveWorlds :many
SELECT worlds.body_id,
    worlds.system_id,
    worlds.class,
    worlds.age_byrs,
    worlds.radius_km,
    worlds.mass_earths,
    worlds.axis_tilt,
    worlds.day_length_game_days,
    worlds.grid_size,
    worlds.explored_at,
    worlds.explored_by,
    worlds.surface_pressure_bar,
    worlds.surface_avg_temp_k,
    worlds.surface_gravity_g,
    worlds.surface_data,
    COALESCE(world_cities.population, 0),
    COALESCE(world_cities.city_centers, '{}'::JSONB),
    COALESCE(world_bases.base_tiles, '{}'::JSONB)
FROM worlds
    LEFT JOIN (
        SELECT cities.world_id,
            jsonb_object_agg(cities.tile_id, cities.id) as city_centers,
            SUM(cities.population) AS population
        FROM cities
        GROUP BY cities.world_id
    ) AS world_cities ON world_cities.world_id = worlds.body_id
    LEFT JOIN (
        SELECT bases.world_id,
            jsonb_object_agg(bases.tile_id, bases.id) as base_tiles
        FROM bases
        GROUP BY bases.world_id
    ) AS world_bases ON world_bases.world_id = worlds.body_id
WHERE body_id = ANY($1::TEXT [ ]);
