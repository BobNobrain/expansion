package db

import (
	"github.com/huandu/go-sqlbuilder"
)

func (db *Storage) SetupCollections() error {
	builders := []*sqlbuilder.CreateTableBuilder{
		db.users.getUsersSchemaBuilder(),
		db.users.getRolesSchemaBuilder(),
		db.orgs.getSchemaBuilder(),
		// db.celestials.getSystemsSchemaBuilder(),
		// db.galacticGrid.getGalaxySectorsSchemaBuilder(),
		db.cnr.getCNREntriesSchemaBuilder(),
		db.staticSystemData.getBlobSchemaBuilder(),
		db.precalcs.getBlobSchemaBuilder(),
	}

	for _, b := range builders {
		err := db.conn.RunStatement(b)
		if err != nil {
			return err
		}
	}

	return nil
}
