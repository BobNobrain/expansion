package db

import (
	"context"
	"fmt"
	"srv/internal/components"
	"srv/internal/db/dbq"
	"srv/internal/globals/config"
	"srv/internal/utils/common"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/lib/pq"
)

type storageImpl struct {
	conn *pgxpool.Pool

	users   *userRepoImpl
	systems *systemsRepoImpl
	worlds  *worldsRepoImpl
	cities  *citiesRepoImpl
}

type storageWithTx struct {
	q   *dbq.Queries
	tx  pgx.Tx
	ctx context.Context

	users   *userRepoImpl
	orgs    *orgRepoImpl
	systems *systemsRepoImpl
	worlds  *worldsRepoImpl
	cnr     *namesRegistryImpl
	cities  *citiesRepoImpl
}

func NewDBStorage() components.Storage {
	ctx := context.Background()
	cfg := config.DB()

	pgUrl := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s", cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.Database)
	// conn, err := pgx.Connect(ctx, pgUrl)
	pool, err := pgxpool.New(ctx, pgUrl)

	if err != nil {
		panic(err)
	}

	q := dbq.New(pool)
	db := &storageImpl{
		conn:    pool,
		users:   &userRepoImpl{q: q, ctx: context.Background()},
		systems: &systemsRepoImpl{q: q, ctx: context.Background()},
		worlds:  &worldsRepoImpl{q: q, ctx: context.Background()},
		cities:  &citiesRepoImpl{q: q, ctx: context.Background()},
	}

	return db
}

func (db *storageImpl) Dispose() {
	if db.conn != nil {
		db.conn.Close()
	}
}

func (db *storageImpl) Users() components.UserRepoReadonly {
	return db.users
}
func (db *storageImpl) Systems() components.StarSystemsRepoReadonly {
	return db.systems
}
func (db *storageImpl) Worlds() components.WorldsRepoReadonly {
	return db.worlds
}
func (db *storageImpl) Cities() components.CitiesRepoReadonly {
	return db.cities
}

func (db *storageImpl) StartTransaction(ctx context.Context) (components.StorageRepos, common.Error) {
	tx, err := db.conn.Begin(ctx)
	if err != nil {
		return nil, common.NewUnknownError(err)
	}

	q := dbq.New(tx)

	return &storageWithTx{
		q:   q,
		tx:  tx,
		ctx: ctx,

		users:   &userRepoImpl{q: q, ctx: ctx},
		orgs:    &orgRepoImpl{q: q, ctx: ctx},
		systems: &systemsRepoImpl{q: q, ctx: ctx},
		worlds:  &worldsRepoImpl{q: q, ctx: ctx},
		cnr:     &namesRegistryImpl{q: q, ctx: ctx},
		cities:  &citiesRepoImpl{q: q, ctx: ctx},
	}, nil
}

func (stx *storageWithTx) Users() components.UserRepo {
	return stx.users
}
func (stx *storageWithTx) Companies() components.CompaniesRepo {
	return nil
}
func (stx *storageWithTx) NamesRegistry() components.NamesRegistry {
	return stx.cnr
}
func (stx *storageWithTx) Systems() components.StarSystemsRepo {
	return stx.systems
}
func (stx *storageWithTx) Worlds() components.WorldsRepo {
	return stx.worlds
}
func (stx *storageWithTx) Cities() components.CitiesRepo {
	return stx.cities
}

func (stx *storageWithTx) Commit() common.Error {
	err := stx.tx.Commit(stx.ctx)
	if err != nil {
		return common.NewUnknownError(err)
	}
	return nil
}

func (stx *storageWithTx) Rollback() common.Error {
	err := stx.tx.Rollback(stx.ctx)
	if err != nil {
		return common.NewUnknownError(err)
	}
	return nil
}
