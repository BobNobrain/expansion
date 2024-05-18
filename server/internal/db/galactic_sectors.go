package db

// import (
// 	"srv/internal/db/dbcore"
// 	"srv/internal/domain"
// 	"srv/internal/utils/common"

// 	"github.com/huandu/go-sqlbuilder"
// )

// type galacticGridRepoImpl struct {
// 	db      *dbcore.Conn
// 	sectors *dbcore.Table
// }

// func newGalacticGridRepo(db *dbcore.Conn) *galacticGridRepoImpl {
// 	return &galacticGridRepoImpl{
// 		db:      db,
// 		sectors: dbcore.MakeTable("galactic_grid"),
// 	}
// }

// const (
// 	galacticGridFieldID = "sector_id"

// 	galacticGridFieldInnerR      = "inner_r"
// 	galacticGridFieldOuterR      = "outer_r"
// 	galacticGridFieldsThetaStart = "theta_start"
// 	galacticGridFieldsThetaEnd   = "theta_end"
// )

// type dbGalaxySector struct {
// 	ID string `db:"sector_id"`

// 	InnerR     float64 `db:"inner_r"`
// 	OuterR     float64 `db:"outer_r"`
// 	ThetaStart float64 `db:"theta_start"`
// 	ThetaEnd   float64 `db:"theta_end"`
// }

// func (repo *galacticGridRepoImpl) getGalaxySectorsSchemaBuilder() *sqlbuilder.CreateTableBuilder {
// 	orgs := repo.sectors.CreateTableBuilder()
// 	orgs.Define(galacticGridFieldID, "CHAR(2)", "PRIMARY KEY", "NOT NULL")

// 	orgs.Define(galacticGridFieldInnerR, "DOUBLE PRECISION", "NOT NULL")
// 	orgs.Define(galacticGridFieldOuterR, "DOUBLE PRECISION", "NOT NULL")
// 	orgs.Define(galacticGridFieldsThetaStart, "DOUBLE PRECISION", "NOT NULL")
// 	orgs.Define(galacticGridFieldsThetaEnd, "DOUBLE PRECISION", "NOT NULL")

// 	return orgs
// }

// func (repo *galacticGridRepoImpl) GetAll() ([]*domain.GalacticSector, common.Error) {
// 	b := repo.sectors.SelectBuilder("*")
// 	rows := make([]*dbGalaxySector, 0)
// 	err := repo.db.RunQuery(b, &rows)

// 	if err != nil {
// 		return nil, err
// 	}

// 	result := make([]*domain.GalacticSector, len(rows))
// 	for i := 0; i < len(rows); i++ {
// 		row := rows[i]
// 		result[i] = &domain.GalacticSector{
// 			ID: domain.GalacticSectorID(row.ID),
// 			Coords: domain.GalacticSectorCoords{
// 				InnerR:     domain.GalacticCoordsRadius(row.InnerR),
// 				OuterR:     domain.GalacticCoordsRadius(row.OuterR),
// 				ThetaStart: domain.GalacticCoordsAngle(row.ThetaStart),
// 				ThetaEnd:   domain.GalacticCoordsAngle(row.ThetaEnd),
// 			},
// 		}
// 	}

// 	return result, nil
// }

// func (repo *galacticGridRepoImpl) Create(sector *domain.GalacticSector) common.Error {
// 	b := repo.sectors.InsertBuilderFromSingleValue(&dbGalaxySector{
// 		ID:         string(sector.ID),
// 		InnerR:     float64(sector.Coords.InnerR),
// 		OuterR:     float64(sector.Coords.OuterR),
// 		ThetaStart: float64(sector.Coords.ThetaStart),
// 		ThetaEnd:   float64(sector.Coords.ThetaEnd),
// 	})

// 	err := repo.db.RunStatement(b)
// 	return err
// }

// func (repo *galacticGridRepoImpl) Clear() common.Error {
// 	return repo.db.RunStatement(repo.sectors.DeleteBuilder())
// }
