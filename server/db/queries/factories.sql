-- name: CreateFactory :exec
INSERT INTO factories (base_id, data)
VALUES ($1, $2);

-- name: ResolveFactories :many
SELECT *
FROM factories
WHERE id = ANY($1::INTEGER [ ]);

-- name: ResolveFactoryOverviews :many
SELECT factories.id,
    factories.base_id,
    factories.created_at,
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

-- name: DestroyFactory :exec
DELETE FROM factories
WHERE id = $1;
