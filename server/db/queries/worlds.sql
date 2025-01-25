-- name: CreateWorld :exec
INSERT INTO worlds (
        body_id,
        system_id,
        age_byrs,
        radius_km,
        mass_earths,
        class,
        axis_tilt,
        day_length_real_s
    )
VALUES ($1, $2, $3, $4, $5, $6, $7, $8);

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
    (
        SELECT COUNT(*) AS n_cities,
            SUM(cities.population) AS population
        FROM cities
        WHERE cities.world_id = worlds.body_id
    ),
    (
        SELECT COUNT(*)
        FROM bases
        WHERE bases.world_id = worlds.body_id
    ) AS n_bases
FROM worlds
WHERE worlds.system_id = $1;

-- name: GetWorld :one
SELECT *
FROM worlds
WHERE body_id = $1
LIMIT 1;
