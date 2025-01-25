-- name: CreateSystem :copyfrom
INSERT INTO star_systems (
        system_id,
        coords_r,
        coords_h,
        coords_th,
        system_stars,
        n_stars,
        map_brightness
    )
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- name: SetExploredSystemData :exec
UPDATE star_systems
SET explored_at = NOW(),
    explored_by = $2,
    n_planets = $3,
    n_moons = $4,
    n_asteroids = $5,
    system_data = $6
WHERE system_id = $1;

-- name: GetSystemsInSectorByID :many
SELECT star_systems.system_id,
    star_systems.coords_r,
    star_systems.coords_h,
    star_systems.coords_th,
    star_systems.explored_at,
    star_systems.explored_by,
    star_systems.n_planets,
    star_systems.n_moons,
    star_systems.n_asteroids,
    star_systems.system_stars,
    COALESCE(system_cities.n_cities, 0),
    COALESCE(system_cities.n_pops, 0),
    COALESCE(system_bases.n_bases, 0)
FROM star_systems
    LEFT JOIN (
        SELECT cities.system_id,
            COUNT(*) AS n_cities,
            SUM(cities.population) AS n_pops
        FROM cities
        WHERE cities.system_id = star_systems.system_id
        GROUP BY cities.system_id
    ) AS system_cities ON system_cities.system_id = star_systems.system_id
    LEFT JOIN (
        SELECT bases.system_id,
            COUNT(*) AS n_bases
        FROM bases
        WHERE bases.system_id = star_systems.system_id
    ) AS system_bases ON system_bases.system_id = star_systems.system_id
WHERE star_systems.system_id LIKE sqlc.arg(system_id) || '%';

-- name: GetSystemsInSectorByCoords :many
SELECT star_systems.system_id,
    star_systems.coords_r,
    star_systems.coords_h,
    star_systems.coords_th,
    star_systems.explored_at,
    star_systems.explored_by,
    star_systems.n_planets,
    star_systems.n_moons,
    star_systems.n_asteroids,
    star_systems.system_stars,
    COALESCE(system_cities.n_cities, 0),
    COALESCE(system_cities.n_pops, 0),
    COALESCE(system_bases.n_bases, 0)
FROM star_systems
    LEFT JOIN (
        SELECT cities.system_id,
            COUNT(*) AS n_cities,
            SUM(cities.population) AS n_pops
        FROM cities
        WHERE cities.system_id = star_systems.system_id
        GROUP BY cities.system_id
    ) AS system_cities ON system_cities.system_id = star_systems.system_id
    LEFT JOIN (
        SELECT bases.system_id,
            COUNT(*) AS n_bases
        FROM bases
        WHERE bases.system_id = star_systems.system_id
    ) AS system_bases ON system_bases.system_id = star_systems.system_id
WHERE star_systems.coords_r > sqlc.arg(min_r)
    AND star_systems.coords_r < sqlc.arg(max_r)
    AND (
        star_systems.coords_th > sqlc.arg(min_th)
        AND star_systems.coords_th < sqlc.arg(max_th)
        OR star_systems.coords_th + 2 * PI() > sqlc.arg(min_th)
        AND star_systems.coords_th + 2 * PI() < sqlc.arg(max_th)
        OR star_systems.coords_th - 2 * PI() > sqlc.arg(min_th)
        AND star_systems.coords_th - 2 * PI() < sqlc.arg(max_th)
    )
ORDER BY star_systems.map_brightness DESC
LIMIT $1;

-- name: GetStarSystem :one
SELECT *
FROM star_systems
WHERE system_id = $1
LIMIT 1;

-- -- name: GetStarsInSystem :many
-- SELECT *
-- FROM stars
-- WHERE system_id = $1;
