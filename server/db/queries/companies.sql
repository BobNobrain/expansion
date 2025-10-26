-- name: GetUserCompanies :many
SELECT *
FROM companies
WHERE owner_id = $1;

-- name: ResolveCompanies :many
SELECT *
FROM companies
WHERE id = ANY($1::UUID [ ]);

-- name: CreateCompany :exec
INSERT INTO companies (owner_id, name, logo)
VALUES ($1, $2, $3);

-- name: UpdateCompanyInfo :exec
UPDATE companies
SET name = $2,
    logo = $3,
    updated_at = NOW()
WHERE id = $1;
