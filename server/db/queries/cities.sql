-- name: GetWorldCities :many
SELECT *
FROM cities
WHERE world_id = $1;

-- name: ResolveCityIDs :many
SELECT *
FROM cities
WHERE id = ANY($1::SERIAL [ ]);

-- name: GetWorldBases :many
SELECT *
FROM bases
WHERE world_id = $1;

-- name: CreateCity :exec
INSERT INTO cities (
        name,
        system_id,
        world_id,
        tile_id,
        city_data,
        population,
        population_data,
        established_by
    )
VALUES ($1, $2, $3, $4, $5, $6, $7, $8);

-- name: UpdateCityPopulation :exec
UPDATE cities
SET population = $2,
    population_data = $3
WHERE id = $1;

-- name: UpdateCityData :exec
UPDATE cities
SET city_data = $2
WHERE id = $1;
