package db

import (
	"context"
	"fmt"
	"srv/internal/components"
	"srv/internal/db/dbq"
	"srv/internal/globals/config"

	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/lib/pq"
)

type Storage struct {
	conn *pgxpool.Pool
	q    *dbq.Queries

	users  *userRepoImpl
	orgs   *orgRepoImpl
	stars  *starsRepoImpl
	worlds *worldsRepoImpl
	cnr    *namesRegistryImpl
}

func NewDBPermastore() *Storage {
	ctx := context.Background()
	cfg := config.DB()

	pgUrl := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s", cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.Database)
	// conn, err := pgx.Connect(ctx, pgUrl)
	pool, err := pgxpool.New(ctx, pgUrl)

	if err != nil {
		panic(err)
	}

	db := &Storage{
		conn: pool,
		q:    dbq.New(pool),
	}

	db.users = &userRepoImpl{q: db.q}
	db.orgs = &orgRepoImpl{q: db.q}
	db.stars = &starsRepoImpl{q: db.q}
	db.worlds = &worldsRepoImpl{q: db.q}
	db.cnr = &namesRegistryImpl{q: db.q}

	return db
}

func (db *Storage) Dispose() {
	if db.conn != nil {
		db.conn.Close()
		// if err != nil {
		// 	logger.Error(logger.FromUnknownError("db", err).WithDetail("operation", "Dispose"))
		// }
	}
}

func (db *Storage) UserRepo() components.UserRepo {
	return db.users
}

// func (db *Storage) OrgRepo() components.OrgRepo {
// 	return db.orgs
// }

func (db *Storage) NamesRegistry() components.NamesRegistry {
	return db.cnr
}

func (db *Storage) StarSystemsRepo() components.StarSystemsRepo {
	return db.stars
}

func (db *Storage) WorldsRepo() components.WorldsRepo {
	return db.worlds
}
