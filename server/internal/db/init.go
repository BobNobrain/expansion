package db

import (
	"github.com/huandu/go-sqlbuilder"
)

func (db *dbStorage) SetupCollections() error {
	builders := []*sqlbuilder.CreateTableBuilder{
		db.users.getSchemaBuilder(),
		db.orgs.getSchemaBuilder(),
		db.celestials.getStarsSchemaBuilder(),
		db.galacticGrid.getGalaxySectorsSchemaBuilder(),
	}

	for _, b := range builders {
		sql, args := b.Build()
		_, err := db.conn.Exec(sql, args...)
		if err != nil {
			return err
		}
	}

	return nil
}
