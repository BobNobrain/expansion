package db

import (
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/internal/utils/phys"

	"github.com/huandu/go-sqlbuilder"
)

type celestialRepoImpl struct {
	stars      repoImpl
	celestials repoImpl
}

func newCelestialRepo(db *dbStorage) *celestialRepoImpl {
	return &celestialRepoImpl{
		stars:      makeRepoImpl(db, "stars"),
		celestials: makeRepoImpl(db, "celestials"),
	}
}

const (
	starFieldID = "star_id"

	starFieldCoordsR      = "coords_r"
	starFieldCoordsH      = "coords_h"
	starFieldsCoordsTheta = "coords_theta"

	starFieldTemp       = "temp_k"
	starFieldLuminosity = "lum_suns"
	starFieldMass       = "mass_suns"
	starFieldRadius     = "radius_au"
	starFieldAge        = "age_byrs"
)

type dbStar struct {
	ID string `db:"star_id"`

	CoordsR     float64 `db:"coords_r"`
	CoordsH     float64 `db:"coords_h"`
	CoordsTheta float64 `db:"coords_theta"`

	Temp       float64 `db:"temp_k"`
	Luminosity float64 `db:"lum_suns"`
	Mass       float64 `db:"mass_suns"`
	Radius     float64 `db:"radius_au"`
	Age        float64 `db:"age_byrs"`
}

func (repo *celestialRepoImpl) getStarsSchemaBuilder() *sqlbuilder.CreateTableBuilder {
	orgs := sqlbuilder.CreateTable(repo.stars.tableName)
	orgs.Define(starFieldID, "CHAR(6)", "PRIMARY KEY", "NOT NULL")

	orgs.Define(starFieldCoordsR, "DOUBLE PRECISION", "NOT NULL")
	orgs.Define(starFieldCoordsH, "DOUBLE PRECISION", "NOT NULL")
	orgs.Define(starFieldsCoordsTheta, "DOUBLE PRECISION", "NOT NULL")

	orgs.Define(starFieldTemp, "DOUBLE PRECISION", "NOT NULL")
	orgs.Define(starFieldLuminosity, "DOUBLE PRECISION", "NOT NULL")
	orgs.Define(starFieldMass, "DOUBLE PRECISION", "NOT NULL")
	orgs.Define(starFieldRadius, "DOUBLE PRECISION", "NOT NULL")
	orgs.Define(starFieldAge, "DOUBLE PRECISION", "NOT NULL")

	return orgs
}

func (repo *celestialRepoImpl) Create(data *domain.StarSystem) common.Error {
	b := repo.stars.insertBuilderFromValues(&dbStar{
		ID:          string(data.StarID),
		CoordsR:     float64(data.StarData.Coords.R),
		CoordsH:     float64(data.StarData.Coords.H),
		CoordsTheta: float64(data.StarData.Coords.Theta),
		Temp:        data.StarData.Temperature.Kelvins(),
		Luminosity:  data.StarData.Luminosity.Suns(),
		Mass:        data.StarData.Mass.SolarMasses(),
		Radius:      data.StarData.Radius.AstronomicalUnits(),
		Age:         data.StarData.Age.BillionYears(),
	})

	err := repo.stars.db.runStatement(b)
	return err
}

func (repo *celestialRepoImpl) LoadAll() ([]*domain.StarSystem, common.Error) {
	b := repo.stars.selectBuilder("*")
	var rows []*dbStar
	err := repo.stars.db.runSelect(b, &rows)
	if err != nil {
		return nil, err
	}

	result := make([]*domain.StarSystem, len(rows))
	for i := 0; i < len(rows); i++ {
		row := rows[i]
		result[i] = &domain.StarSystem{
			StarID: domain.CelestialID(row.ID),
			StarData: &domain.StarData{
				Coords: domain.GalacticCoords{
					R:     domain.GalacticCoordsRadius(row.CoordsR),
					H:     domain.GalacticCoordsHeight(row.CoordsH),
					Theta: domain.GalacticCoordsAngle(row.CoordsTheta),
				},
				Temperature: phys.Kelvins(row.Temp),
				Luminosity:  phys.LuminositySuns(row.Luminosity),
				Mass:        phys.SolarMasses(row.Mass),
				Radius:      phys.AstronomicalUnits(row.Radius),
				Age:         phys.BillionYears(row.Age),
			},
		}
	}

	return result, nil
}

func (repo *celestialRepoImpl) GetSectorContent(params domain.GetSectorContentParams) ([]domain.Star, common.Error) {
	b := repo.stars.selectBuilder("*")
	b.Where(b.Like(starFieldID, params.SectorID+"%"))
	b.OrderBy(starFieldLuminosity)
	if 0 < params.Limit && params.Limit < 200 {
		b.Limit(params.Limit)
	} else {
		b.Limit(200)
	}

	var rows []*dbStar
	err := repo.stars.db.runSelect(b, &rows)
	if err != nil {
		return nil, err
	}

	result := make([]domain.Star, len(rows))
	for i := 0; i < len(rows); i++ {
		row := rows[i]
		result[i] = domain.Star{
			StarID: domain.CelestialID(row.ID),
			StarData: domain.StarData{
				Coords: domain.GalacticCoords{
					R:     domain.GalacticCoordsRadius(row.CoordsR),
					H:     domain.GalacticCoordsHeight(row.CoordsH),
					Theta: domain.GalacticCoordsAngle(row.CoordsTheta),
				},
				Temperature: phys.Kelvins(row.Temp),
				Luminosity:  phys.LuminositySuns(row.Luminosity),
				Mass:        phys.SolarMasses(row.Mass),
				Radius:      phys.AstronomicalUnits(row.Radius),
				Age:         phys.BillionYears(row.Age),
			},
		}
	}

	return result, nil
}
