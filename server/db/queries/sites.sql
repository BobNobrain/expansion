-- name: GetWorldCities :many
SELECT *
FROM cities
WHERE world_id = $1;

-- name: GetWorldBases :many
SELECT *
FROM bases
WHERE world_id = $1;

-- name: CreateCity :one
INSERT INTO cities (
        system_id,
        world_id,
        tile_id,
        population,
        population_data,
        name,
        enstablished_by
    )
VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;

-- name: UpdateCityPopulation :exec
UPDATE cities
SET population = $2,
    population_data = $3
WHERE id = $1;
