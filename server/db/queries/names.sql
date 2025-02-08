-- name: ResolveNames :many
SELECT celestial_id,
    name,
    author_id,
    created_at
FROM celestial_names
WHERE celestial_id = ANY(sqlc.arg(ids)::VARCHAR(15) [ ]);

-- name: SubmitName :exec
INSERT INTO celestial_names_submissions (celestial_id, author_id, name)
VALUES ($1, $2, $3);

-- name: ApproveName :exec
INSERT INTO celestial_names (
        celestial_id,
        name,
        author_id,
        created_at,
        reviewer_id
    )
SELECT celestial_id,
    name,
    author_id,
    created_at,
    $2
FROM celestial_names_submissions
WHERE celestial_names_submissions.entry_id = $1;

DELETE FROM celestial_names_submissions
WHERE entry_id = $1;

-- name: DeclineName :exec
UPDATE celestial_names_submissions
SET reviewer_id = $2,
    reviewed_at = NOW(),
    review_comment = $3
WHERE entry_id = $1;

-- name: ListPendingNameSubmissions :many
SELECT *
FROM celestial_names_submissions
WHERE reviewer_id = NULL
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: ListPendingNameSubmissionsTotal :one
SELECT COUNT(*)
FROM celestial_names_submissions
WHERE reviewer_id = NULL;

-- name: ListNameSubmissionsByAuthor :many
SELECT *
FROM celestial_names_submissions
WHERE author_id = $3
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: ListNameEntriesByAuthorTotal :one
SELECT COUNT(*)
FROM celestial_names_submissions
WHERE author_id = $1;
