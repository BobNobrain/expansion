-- name: ResolveNames :many
SELECT celestial_id,
    name,
    author_id,
    created_at
FROM celestial_names_registry
WHERE celestial_id = ANY(sqlc.arg(ids)::VARCHAR(15) [ ])
    AND status = 'A';

-- name: SubmitName :exec
INSERT INTO celestial_names_registry (celestial_id, author_id, name)
VALUES ($1, $2, $3);

-- name: ApproveName :exec
UPDATE celestial_names_registry
SET status = 'A',
    reviewer_id = $2,
    reviewed_at = NOW()
WHERE entry_id = $1;

-- name: DeclineName :exec
UPDATE celestial_names_registry
SET status = 'D',
    reviewer_id = $2,
    reviewed_at = NOW(),
    review_comment = $3
WHERE entry_id = $1;

-- name: ListPendingNameSubmissions :many
SELECT *
FROM celestial_names_registry
WHERE status = 'S'
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: ListPendingNameSubmissionsTotal :one
SELECT COUNT(*)
FROM celestial_names_registry
WHERE status = 'S';

-- name: ListNameEntriesByAuthor :many
SELECT *
FROM celestial_names_registry
WHERE author_id = $3
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: ListNameEntriesByAuthorTotal :one
SELECT COUNT(*)
FROM celestial_names_registry
WHERE author_id = $1;
