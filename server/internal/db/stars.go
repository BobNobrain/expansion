package db

import (
	"context"
	"encoding/json"
	"srv/internal/components"
	"srv/internal/db/dbq"
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"srv/internal/world"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

type starsRepoImpl struct {
	q *dbq.Queries
}

type starSystemData struct {
	Orbits map[string]starSystemDataOrbit `json:"orbits"`
}
type starSystemDataOrbit struct {
	Center          string    `json:"center"`
	SemiMajorAu     float64   `json:"semiMajor"`
	Eccentricity    float64   `json:"e"`
	T0              time.Time `json:"t0"`
	InclinationRads float64   `json:"incl"`
	RotationRads    float64   `json:"rot"`
}
type starSystemStarData struct {
	StarID   string  `json:"id"`
	AgeByrs  float64 `json:"age_byrs"`
	LumSuns  float64 `json:"lum_suns"`
	RadiusAu float64 `json:"r_au"`
	TempK    float64 `json:"t_k"`
	MassSuns float64 `json:"m_suns"`
}

var dbWorldClasses = map[string]world.CelestialBodyClass{
	"G": world.CelestialBodyClassGaseous,
	"T": world.CelestialBodyClassTerrestial,
}

func (s *starsRepoImpl) GetContent(id world.StarSystemID) (world.StarSystemContent, common.Error) {
	dbSystem, err := s.q.GetStarSystem(context.Background(), string(id))
	system := world.StarSystemContent{}
	if err != nil {
		return system, makeDBError(err, "StarSystemsRepo::GetContent")
	}

	system.ID = world.StarSystemID(dbSystem.SystemID)
	if dbSystem.ExploredAt.Valid && dbSystem.ExploredBy.Valid {
		system.Explored = world.ExplorationData{
			By: domain.UserID(dbSystem.ExploredBy.String()),
			At: dbSystem.ExploredAt.Time,
		}
	}

	systemData, jsonErr := parseJSON[starSystemData](dbSystem.SystemData)
	if jsonErr != nil {
		return system, jsonErr
	}

	for bodyId, orbitData := range systemData.Orbits {
		system.Orbits[world.CelestialID(bodyId)] = world.OrbitData{
			Center: world.CelestialID(orbitData.Center),
			Ellipse: phys.EllipticOrbit{
				SemiMajor:    phys.AstronomicalUnits(orbitData.SemiMajorAu),
				Eccentricity: orbitData.Eccentricity,
			},
			Rotation:    geom.Radians(orbitData.RotationRads),
			Inclination: geom.Radians(orbitData.InclinationRads),
			T0:          orbitData.T0,
		}
	}

	var jerr common.Error
	system.Stars, jerr = decodeStars(dbSystem.SystemStars)
	if jerr != nil {
		return system, jerr
	}

	dbWorlds, err := s.q.GetWorldsInSystem(context.Background(), string(id))
	if err != nil {
		return system, makeDBError(err, "StarSystemsRepo::GetContent(Worlds)")
	}

	system.Worlds = make([]world.WorldOverview, 0, len(dbWorlds))
	for _, dbWorld := range dbWorlds {
		system.Worlds = append(system.Worlds, world.WorldOverview{
			ID:         world.CelestialID(dbWorld.BodyID),
			IsExplored: dbWorld.ExploredAt.Valid && dbWorld.ExploredBy.Valid,
			Size:       int(dbWorld.GridSize),
			Params: world.CelestialSurfaceParams{
				Class:  dbWorldClasses[dbWorld.Class],
				Radius: phys.Kilometers(dbWorld.RadiusKm),
				Mass:   phys.EarthMasses(dbWorld.MassEarths),
				Age:    phys.BillionYears(dbWorld.AgeByrs),
			},
			Conditions: world.SurfaceConditions{
				Pressure: phys.Bar(dbWorld.SurfacePressureBar),
				AvgTemp:  phys.Kelvins(dbWorld.SurfaceAvgTempK),
				Gravity:  phys.EarthGs(dbWorld.SurfaceGravityG),
			},
		})
	}

	return system, nil
}

func (s *starsRepoImpl) GetSystemsOnMap(rq components.StarSystemRepoMapRequest) ([]world.StarSystemOverview, common.Error) {
	dbSystems, err := s.q.GetSystemsInSectorByCoords(context.Background(), dbq.GetSystemsInSectorByCoordsParams{
		Limit: int32(rq.Limit),
		MinTh: rq.Sector.ThetaStart.Radians(),
		MaxTh: rq.Sector.ThetaEnd.Radians(),
		MinR:  float64(rq.Sector.InnerR),
		MaxR:  float64(rq.Sector.OuterR),
	})
	if err != nil {
		return nil, makeDBError(err, "StarSystemsRepo::GetSystemsOnMap")
	}

	result := make([]world.StarSystemOverview, 0, len(dbSystems))
	for _, dbSystem := range dbSystems {
		stars, jerr := decodeStars(dbSystem.SystemStars)
		if jerr != nil {
			return nil, jerr
		}

		result = append(result, world.StarSystemOverview{
			ID:         world.StarSystemID(dbSystem.SystemID),
			IsExplored: dbSystem.ExploredAt.Valid && dbSystem.ExploredBy.Valid,
			Stars:      stars,
			NPlanets:   int(dbSystem.NPlanets),
			NMoons:     int(dbSystem.NMoons),
			NAsteroids: int(dbSystem.NAsteroids),

			Coords: world.GalacticCoords{
				R:     world.GalacticCoordsRadius(dbSystem.CoordsR),
				H:     world.GalacticCoordsHeight(dbSystem.CoordsH),
				Theta: geom.Radians(dbSystem.CoordsTh),
			},

			PopInfo: world.PopulationOverview{
				Population: int(dbSystem.NPops),
				NBases:     int(dbSystem.NBases),
				NCities:    int(dbSystem.NCities),
			},
		})
	}

	return result, nil
}

func (s *starsRepoImpl) GetOverviews(sectorID world.GalacticSectorID) ([]world.StarSystemOverview, common.Error) {
	dbSystems, err := s.q.GetSystemsInSectorByID(context.Background(), pgtype.Text{String: string(sectorID), Valid: true})
	if err != nil {
		return nil, makeDBError(err, "GetOverviews")
	}

	systems := make([]world.StarSystemOverview, 0, len(dbSystems))
	for _, dbSystem := range dbSystems {
		stars, jerr := decodeStars(dbSystem.SystemStars)
		if jerr != nil {
			return nil, jerr
		}

		systems = append(systems, world.StarSystemOverview{
			ID:         world.StarSystemID(dbSystem.SystemID),
			IsExplored: dbSystem.ExploredAt.Valid && dbSystem.ExploredBy.Valid,
			Stars:      stars,
			NPlanets:   int(dbSystem.NPlanets),
			NMoons:     int(dbSystem.NMoons),
			NAsteroids: int(dbSystem.NAsteroids),

			Coords: world.GalacticCoords{
				R:     world.GalacticCoordsRadius(dbSystem.CoordsR),
				H:     world.GalacticCoordsHeight(dbSystem.CoordsH),
				Theta: geom.Radians(dbSystem.CoordsTh),
			},

			PopInfo: world.PopulationOverview{
				Population: int(dbSystem.NPops),
				NBases:     int(dbSystem.NBases),
				NCities:    int(dbSystem.NCities),
			},
		})
	}

	return systems, nil
}

func (s *starsRepoImpl) CreateGalaxy(payload components.CreateGalaxyPayload) common.Error {
	createData := make([]dbq.CreateSystemParams, 0, len(payload.Systems))
	for _, sysData := range payload.Systems {
		var mapBrightness float64 // aka the luminosity of the brightest star in the system
		dbJsonStars := make([]starSystemStarData, 0, len(sysData.Stars))
		for _, star := range sysData.Stars {
			starBrightness := star.Params.Luminosity.Suns()
			if starBrightness > mapBrightness {
				mapBrightness = starBrightness
			}

			dbJsonStars = append(dbJsonStars, starSystemStarData{
				StarID:   string(star.ID),
				AgeByrs:  star.Params.Age.BillionYears(),
				LumSuns:  star.Params.Luminosity.Suns(),
				RadiusAu: star.Params.Radius.AstronomicalUnits(),
				TempK:    star.Params.Temperature.Kelvins(),
				MassSuns: star.Params.Mass.SolarMasses(),
			})
		}

		starsJson, err := json.Marshal(dbJsonStars)
		if err != nil {
			return makeDBError(err, "CreateGalaxy(Stars.ToJSON)")
		}

		createData = append(createData, dbq.CreateSystemParams{
			SystemID:      string(sysData.ID),
			CoordsR:       float64(sysData.Coords.R),
			CoordsH:       float64(sysData.Coords.H),
			CoordsTh:      sysData.Coords.Theta.Radians(),
			SystemStars:   starsJson,
			NStars:        int32(len(sysData.Stars)),
			MapBrightness: mapBrightness,
		})
	}

	_, err := s.q.CreateSystem(context.Background(), createData)
	if err != nil {
		return makeDBError(err, "CreateGalaxy")
	}

	return nil
}

func (s *starsRepoImpl) ExploreSystem(payload components.ExploreSystemPayload) common.Error {
	explorerUUID, err := parseUUID(string(payload.Explorer))
	if err != nil {
		return err
	}

	systemData := starSystemData{
		Orbits: make(map[string]starSystemDataOrbit),
	}
	for bodyID, orbit := range payload.Orbits {
		systemData.Orbits[string(bodyID)] = starSystemDataOrbit{
			Center:          string(orbit.Center),
			SemiMajorAu:     orbit.Ellipse.SemiMajor.AstronomicalUnits(),
			Eccentricity:    orbit.Ellipse.Eccentricity,
			InclinationRads: orbit.Inclination.Radians(),
			RotationRads:    orbit.Rotation.Radians(),
			T0:              orbit.T0,
		}
	}

	systemDataJSON, jerr := json.Marshal(systemData)
	if jerr != nil {
		return makeDBError(jerr, "ExploreSystem(Data.ToJSON)")
	}

	dbErr := s.q.SetExploredSystemData(context.Background(), dbq.SetExploredSystemDataParams{
		SystemID:   string(payload.ID),
		ExploredBy: explorerUUID,
		NPlanets:   int32(payload.NPlanets),
		NMoons:     int32(payload.NMoons),
		NAsteroids: 0,
		SystemData: systemDataJSON,
	})

	if dbErr != nil {
		return makeDBError(dbErr, "ExploreSystem")
	}
	return nil
}

func decodeStars(json []byte) ([]world.Star, common.Error) {
	dbStars, err := parseJSON[[]starSystemStarData](json)
	if err != nil {
		return nil, err
	}

	result := make([]world.Star, 0, len(dbStars))
	for _, dbStar := range dbStars {
		result = append(result, world.Star{
			ID: world.CelestialID(dbStar.StarID),
			Params: world.StarParams{
				Temperature: phys.Kelvins(dbStar.TempK),
				Luminosity:  phys.LuminositySuns(dbStar.LumSuns),
				Mass:        phys.SolarMasses(dbStar.MassSuns),
				Radius:      phys.AstronomicalUnits(dbStar.RadiusAu),
				Age:         phys.BillionYears(dbStar.AgeByrs),
			},
		})
	}

	return result, nil
}
