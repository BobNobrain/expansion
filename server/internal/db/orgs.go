package db

import (
	"context"
	"srv/internal/db/dbq"
)

type orgRepoImpl struct {
	q   *dbq.Queries
	ctx context.Context
}

// TBD: components.OrgRepo
