package db

import (
	"srv/internal/components"
	"srv/internal/domain"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type dbStorage struct {
	conn *sqlx.DB

	users        *userRepoImpl
	orgs         *orgRepoImpl
	celestials   *celestialRepoImpl
	galacticGrid *galacticGridRepoImpl
}

func NewDBPermastore() components.Permastore {
	db := &dbStorage{}

	db.users = newUserRepo(db)
	db.orgs = newOrgRepo(db)
	db.celestials = newCelestialRepo(db)
	db.galacticGrid = newGalacticGridRepo(db)

	return db
}

func (db *dbStorage) UserRepo() domain.UserRepo {
	return db.users
}

func (db *dbStorage) OrgRepo() domain.OrgRepo {
	return db.orgs
}

func (db *dbStorage) CelestialRepo() domain.CelestialBodiesRepo {
	return db.celestials
}

func (db *dbStorage) GalacticSectorsRepo() domain.GalacticSectorsRepo {
	return db.galacticGrid
}
