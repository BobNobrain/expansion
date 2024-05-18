package db

// import (
// 	"srv/internal/db/dbcore"
// 	"srv/internal/domain"
// 	"srv/internal/utils/common"

// 	"github.com/huandu/go-sqlbuilder"
// )

// type celestialRepoImpl struct {
// 	db      *dbcore.Conn
// 	systems *dbcore.Table
// }

// func newCelestialRepo(db *dbcore.Conn) *celestialRepoImpl {
// 	return &celestialRepoImpl{
// 		db:      db,
// 		systems: dbcore.MakeTable("systems"),
// 	}
// }

// const (
// 	systemFieldID           = "system_id"
// 	systemFieldCoordsR      = "coords_r"
// 	systemFieldCoordsH      = "coords_h"
// 	systemFieldsCoordsTheta = "coords_theta"

// 	systemFieldData = "system_data"
// )

// type dbStarSystem struct {
// 	ID string `db:"system_id"`

// 	CoordsR     float64 `db:"coords_r"`
// 	CoordsH     float64 `db:"coords_h"`
// 	CoordsTheta float64 `db:"coords_theta"`

// 	DataJSON string `db:"system_data"`
// }

// func (repo *celestialRepoImpl) getSystemsSchemaBuilder() *sqlbuilder.CreateTableBuilder {
// 	systems := repo.systems.CreateTableBuilder()
// 	systems.Define(systemFieldID, "CHAR(6)", "PRIMARY KEY", "NOT NULL")

// 	systems.Define(systemFieldCoordsR, "DOUBLE PRECISION", "NOT NULL")
// 	systems.Define(systemFieldCoordsH, "DOUBLE PRECISION", "NOT NULL")
// 	systems.Define(systemFieldsCoordsTheta, "DOUBLE PRECISION", "NOT NULL")

// 	systems.Define(systemFieldData, "TEXT", "NOT_NULL")

// 	return systems
// }

// func (repo *celestialRepoImpl) CreateSystem(data *domain.StarSystem) common.Error {
// 	b := repo.systems.InsertBuilderFromSingleValue(&dbStarSystem{
// 		ID:          string(data.SystemID),
// 		CoordsR:     float64(data.Coords.R),
// 		CoordsH:     float64(data.Coords.H),
// 		CoordsTheta: float64(data.Coords.Theta),
// 		DataJSON:    encodeSystemToJSON(data),
// 	})

// 	err := repo.db.RunStatement(b)
// 	return err
// }

// func (repo *celestialRepoImpl) LoadAll() ([]*domain.StarSystem, common.Error) {
// 	b := repo.systems.SelectBuilder("*")
// 	var rows []*dbStarSystem
// 	err := repo.db.RunQuery(b, &rows)
// 	if err != nil {
// 		return nil, err
// 	}

// 	result := make([]*domain.StarSystem, len(rows))
// 	for i := 0; i < len(rows); i++ {
// 		row := rows[i]
// 		result[i] = &domain.StarSystem{
// 			SystemID: domain.StarSystemID(row.ID),
// 			Coords: domain.GalacticCoords{
// 				R:     domain.GalacticCoordsRadius(row.CoordsR),
// 				H:     domain.GalacticCoordsHeight(row.CoordsH),
// 				Theta: domain.GalacticCoordsAngle(row.CoordsTheta),
// 			},
// 		}
// 		err := decodeSystemFromJSON(row.DataJSON, result[i])
// 		if err != nil {
// 			return nil, makeDbError(err).withDetail("field", "system_data").withDetail("json", row.DataJSON)
// 		}
// 	}

// 	return result, nil
// }

// func (repo *celestialRepoImpl) Clear() common.Error {
// 	err := repo.db.RunStatement(repo.systems.DeleteBuilder())
// 	if err != nil {
// 		return err
// 	}

// 	return nil
// }

// func (repo *celestialRepoImpl) SaveSystemData(system *domain.StarSystem) common.Error {
// 	b := repo.systems.UpdateBuilder()
// 	b.Set(b.Assign(systemFieldData, encodeSystemToJSON(system)))
// 	b.Where(b.Equal(systemFieldID, system.SystemID))

// 	return repo.db.RunStatement(b)
// }
