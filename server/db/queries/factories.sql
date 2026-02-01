-- name: CreateFactory :exec
INSERT INTO factories (owner_id, base_id, name, data)
VALUES ($1, $2, $3, $4);

-- name: ResolveFactories :many
SELECT *
FROM factories
WHERE id = ANY($1::INTEGER [ ]);

-- name: ResolveFactoryOverviews :many
SELECT factories.id,
    factories.base_id,
    factories.created_at,
    factories.name,
    COALESCE(factory_base.world_id, ''),
    COALESCE(factory_base.tile_id, -1)
FROM factories
    LEFT JOIN (
        SELECT bases.id,
            bases.world_id,
            bases.tile_id
        FROM bases
    ) AS factory_base ON factory_base.id = factories.base_id
WHERE factories.id = ANY($1::INTEGER [ ]);

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

-- name: RenameFactory :exec
UPDATE factories
SET name = $2
WHERE id = $1;

-- name: DestroyFactory :exec
DELETE FROM factories
WHERE id = $1;
