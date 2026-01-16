-- name: QuerySSUs :many
SELECT *
FROM scheduled_storage_updates
WHERE storage_id = ANY($1::TEXT [ ])
    AND apply_at <= $2;

-- name: DeleteSSUs :exec
DELETE FROM scheduled_storage_updates
WHERE id = ANY($1::INTEGER [ ]);

-- name: CreateSSU :exec
INSERT INTO scheduled_storage_updates (storage_id, patch, apply_at)
VALUES ($1, $2, $3);
