-- name: ResolveUsers :many
SELECT *
FROM users
WHERE uid = ANY($1::UUID [ ]);

-- name: GetUserByID :one
SELECT *
FROM users
WHERE uid = $1
LIMIT 1;

-- name: GetUserByUsername :one
SELECT *
FROM users
WHERE username = $1
LIMIT 1;

-- name: GetUserByEmail :one
SELECT *
FROM users
WHERE email = $1
LIMIT 1;

-- name: GetCredentials :one
SELECT uid,
    username,
    password_hash
FROM users
WHERE username = $1
LIMIT 1;

-- name: CreateUser :one
INSERT INTO users (username, email, password_hash)
VALUES ($1, $2, $3) RETURNING *;

-- name: GetUserRoles :many
SELECT *
FROM roles
WHERE uid = $1;

-- name: GrantRole :exec
INSERT INTO roles (uid, role, granted_by)
VALUES ($1, $2, $3);

-- name: RevokeRole :exec
DELETE FROM roles
WHERE uid = $1
    AND role = $2;
