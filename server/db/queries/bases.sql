-- name: CreateBase :exec
INSERT INTO bases (
        system_id,
        world_id,
        tile_id,
        company_id,
        city_id,
        name,
        data
    )
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- name: GetBaseByID :one
SELECT *
FROM bases
WHERE id = $1
LIMIT 1;

-- name: ResolveBases :many
SELECT *
FROM bases
WHERE id = ANY($1::INTEGER [ ]);

-- name: GetBaseByLocation :one
SELECT *
FROM bases
WHERE world_id = $1
    AND tile_id = $2
LIMIT 1;

-- name: GetBasesByCityID :many
SELECT *
FROM bases
WHERE city_id = $1;

-- name: GetBasesByCompanyID :many
SELECT *
FROM base_overviews
WHERE company_id = $1;

-- name: GetBasesByCompanyIDAndWorldID :many
SELECT *
FROM base_overviews
WHERE company_id = $1
    and world_id = $2;

-- name: ResolveBaseOverviews :many
SELECT *
FROM base_overviews
WHERE id = ANY($1::INTEGER [ ]);

-- name: UpdateBase :exec
UPDATE bases
SET data = $2
WHERE id = $1;

-- name: RenameBase :exec
UPDATE bases
SET name = $2
WHERE id = $1;

-- name: DestroyBase :exec
DELETE FROM bases
WHERE id = $1;
