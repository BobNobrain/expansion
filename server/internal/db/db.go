package db

import (
	"srv/internal/components"
	"srv/internal/db/dbcore"

	_ "github.com/lib/pq"
)

type Storage struct {
	conn *dbcore.Conn

	users            *userRepoImpl
	orgs             *orgRepoImpl
	cnr              *namesRegistryImpl
	staticSystemData *blobRepoImpl
	precalcs         *blobRepoImpl
}

func NewDBPermastore() *Storage {
	db := &Storage{
		conn: dbcore.MakeConnection(),
	}

	db.users = newUserRepo(db.conn)
	db.orgs = newOrgRepo(db.conn)
	db.cnr = newNamesRegistry(db.conn)
	db.staticSystemData = newBlobRepo(db.conn, "stasys_data", true)
	db.precalcs = newBlobRepo(db.conn, "precalcs", false)

	return db
}

func (db *Storage) UserRepo() components.UserRepo {
	return db.users
}

// func (db *dbStorage) OrgRepo() components.OrgRepo {
// 	return db.orgs
// }

func (db *Storage) NamesRegistry() components.NamesRegistry {
	return db.cnr
}

func (db *Storage) StaticStarSystemData() components.BlobsRepo {
	return db.staticSystemData
}

func (db *Storage) PrecalculatedBlobs() components.BlobsRepo {
	return db.precalcs
}
