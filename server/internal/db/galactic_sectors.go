package db

import (
	"srv/internal/domain"
	"srv/internal/utils/common"

	"github.com/huandu/go-sqlbuilder"
)

type galacticGridRepoImpl struct {
	repoImpl
}

func newGalacticGridRepo(db *dbStorage) *galacticGridRepoImpl {
	return &galacticGridRepoImpl{
		repoImpl: makeRepoImpl(db, "galactic_grid"),
	}
}

const (
	galacticGridFieldID = "sector_id"

	galacticGridFieldInnerR      = "inner_r"
	galacticGridFieldOuterR      = "outer_r"
	galacticGridFieldsThetaStart = "theta_start"
	galacticGridFieldsThetaEnd   = "theta_end"
)

type dbGalaxySector struct {
	ID string `db:"sector_id"`

	InnerR     float64 `db:"inner_r"`
	OuterR     float64 `db:"outer_r"`
	ThetaStart float64 `db:"theta_start"`
	ThetaEnd   float64 `db:"theta_end"`
}

func (repo *galacticGridRepoImpl) getGalaxySectorsSchemaBuilder() *sqlbuilder.CreateTableBuilder {
	orgs := sqlbuilder.CreateTable(repo.tableName)
	orgs.Define(galacticGridFieldID, "CHAR(2)", "PRIMARY KEY", "NOT NULL")

	orgs.Define(galacticGridFieldInnerR, "DOUBLE PRECISION", "NOT NULL")
	orgs.Define(galacticGridFieldOuterR, "DOUBLE PRECISION", "NOT NULL")
	orgs.Define(galacticGridFieldsThetaStart, "DOUBLE PRECISION", "NOT NULL")
	orgs.Define(galacticGridFieldsThetaEnd, "DOUBLE PRECISION", "NOT NULL")

	return orgs
}

func (repo *galacticGridRepoImpl) GetAll() ([]*domain.GalacticSector, common.Error) {
	b := repo.selectBuilder("*")
	rows := make([]*dbGalaxySector, 0)
	err := repo.db.runSelect(b, &rows)

	if err != nil {
		return nil, err
	}

	result := make([]*domain.GalacticSector, len(rows))
	for i := 0; i < len(rows); i++ {
		row := rows[i]
		result[i] = &domain.GalacticSector{
			ID: domain.GalacticSectorID(row.ID),
			Coords: domain.GalacticSectorCoords{
				InnerR:     domain.GalacticCoordsRadius(row.InnerR),
				OuterR:     domain.GalacticCoordsRadius(row.OuterR),
				ThetaStart: domain.GalacticCoordsAngle(row.ThetaStart),
				ThetaEnd:   domain.GalacticCoordsAngle(row.ThetaEnd),
			},
		}
	}

	return result, nil
}

func (repo *galacticGridRepoImpl) Create(sector *domain.GalacticSector) common.Error {
	b := repo.insertBuilderFromValues(&dbGalaxySector{
		ID:         string(sector.ID),
		InnerR:     float64(sector.Coords.InnerR),
		OuterR:     float64(sector.Coords.OuterR),
		ThetaStart: float64(sector.Coords.ThetaStart),
		ThetaEnd:   float64(sector.Coords.ThetaEnd),
	})

	err := repo.db.runStatement(b)
	return err
}
