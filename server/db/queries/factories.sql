-- name: CreateFactory :exec
INSERT INTO factories (base_id, data)
VALUES ($1, $2);

-- name: ResolveFactories :many
SELECT *
FROM factories
WHERE id = ANY($1::INTEGER [ ]);

-- name: GetBaseFactories :many
SELECT *
FROM factories
WHERE base_id = $1;

-- name: UpdateFactory :exec
UPDATE factories
SET data = $2,
    updated_at = NOW(),
    updated_to = $3
WHERE id = $1;

-- name: DestroyFactory :exec
DELETE FROM factories
WHERE id = $1;
