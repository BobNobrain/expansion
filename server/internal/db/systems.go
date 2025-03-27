package db

import (
	"context"
	"encoding/json"
	"srv/internal/components"
	"srv/internal/db/dbq"
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

type systemsRepoImpl struct {
	q   *dbq.Queries
	ctx context.Context
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

func (s *systemsRepoImpl) GetContent(id game.StarSystemID) (game.StarSystemContent, common.Error) {
	dbSystem, err := s.q.GetStarSystem(s.ctx, string(id))
	if err != nil {
		return game.StarSystemContent{}, makeDBError(err, "StarSystemsRepo::GetContent")
	}

	return decodeStarSystem(dbSystem)
}

func (s *systemsRepoImpl) GetContentMany(ids []game.StarSystemID) ([]game.StarSystemContent, common.Error) {
	rows, err := s.q.ResolveStarSystems(s.ctx, utils.ConvertStrings[game.StarSystemID, string](ids))
	if err != nil {
		return nil, makeDBError(err, "StarSystemsRepo::GetContent")
	}

	return utils.MapSliceFailable(rows, decodeStarSystem)
}

func (s *systemsRepoImpl) GetSystemsOnMap(rq components.StarSystemRepoMapRequest) ([]game.StarSystemOverview, common.Error) {
	dbSystems, err := s.q.GetSystemsInSectorByCoords(s.ctx, dbq.GetSystemsInSectorByCoordsParams{
		Limit: int32(rq.Limit),
		MinTh: rq.Sector.ThetaStart.Radians(),
		MaxTh: rq.Sector.ThetaEnd.Radians(),
		MinR:  float64(rq.Sector.InnerR),
		MaxR:  float64(rq.Sector.OuterR),
	})
	if err != nil {
		return nil, makeDBError(err, "StarSystemsRepo::GetSystemsOnMap")
	}

	result := make([]game.StarSystemOverview, 0, len(dbSystems))
	for _, dbSystem := range dbSystems {
		stars, jerr := decodeStars(dbSystem.SystemStars)
		if jerr != nil {
			return nil, jerr
		}

		result = append(result, game.StarSystemOverview{
			ID:         game.StarSystemID(dbSystem.SystemID),
			IsExplored: dbSystem.ExploredAt.Valid && dbSystem.ExploredBy.Valid,
			Stars:      stars,
			NPlanets:   int(dbSystem.NPlanets),
			NMoons:     int(dbSystem.NMoons),
			NAsteroids: int(dbSystem.NAsteroids),

			Coords: game.GalacticCoords{
				R:     game.GalacticCoordsRadius(dbSystem.CoordsR),
				H:     game.GalacticCoordsHeight(dbSystem.CoordsH),
				Theta: geom.Radians(dbSystem.CoordsTh),
			},

			PopInfo: game.PopulationOverview{
				Population: int(dbSystem.NPops),
				NBases:     int(dbSystem.NBases),
				NCities:    int(dbSystem.NCities),
			},
		})
	}

	return result, nil
}

func (s *systemsRepoImpl) GetOverviews(sectorID game.GalacticSectorID) ([]game.StarSystemOverview, common.Error) {
	dbSystems, err := s.q.GetSystemsInSectorByID(s.ctx, pgtype.Text{String: string(sectorID), Valid: true})
	if err != nil {
		return nil, makeDBError(err, "GetOverviews")
	}

	systems := make([]game.StarSystemOverview, 0, len(dbSystems))
	for _, dbSystem := range dbSystems {
		stars, jerr := decodeStars(dbSystem.SystemStars)
		if jerr != nil {
			return nil, jerr
		}

		systems = append(systems, game.StarSystemOverview{
			ID:         game.StarSystemID(dbSystem.SystemID),
			IsExplored: dbSystem.ExploredAt.Valid && dbSystem.ExploredBy.Valid,
			Stars:      stars,
			NPlanets:   int(dbSystem.NPlanets),
			NMoons:     int(dbSystem.NMoons),
			NAsteroids: int(dbSystem.NAsteroids),

			Coords: game.GalacticCoords{
				R:     game.GalacticCoordsRadius(dbSystem.CoordsR),
				H:     game.GalacticCoordsHeight(dbSystem.CoordsH),
				Theta: geom.Radians(dbSystem.CoordsTh),
			},

			PopInfo: game.PopulationOverview{
				Population: int(dbSystem.NPops),
				NBases:     int(dbSystem.NBases),
				NCities:    int(dbSystem.NCities),
			},
		})
	}

	return systems, nil
}

func (s *systemsRepoImpl) CreateGalaxy(payload components.CreateGalaxyPayload) common.Error {
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

		starSystemData, err := encodeStarSystemData(sysData.Orbits)
		if err != nil {
			return makeDBError(err, "CreateGalaxy(SystemData.ToJSON)")
		}

		createData = append(createData, dbq.CreateSystemParams{
			SystemID:      string(sysData.ID),
			CoordsR:       float64(sysData.Coords.R),
			CoordsH:       float64(sysData.Coords.H),
			CoordsTh:      sysData.Coords.Theta.Radians(),
			SystemStars:   starsJson,
			SystemData:    starSystemData,
			NStars:        int32(len(sysData.Stars)),
			MapBrightness: mapBrightness,
		})
	}

	_, err := s.q.CreateSystem(s.ctx, createData)
	if err != nil {
		return makeDBError(err, "CreateGalaxy")
	}

	return nil
}

func (s *systemsRepoImpl) ExploreSystem(payload components.ExploreSystemPayload) common.Error {
	explorerUUID, err := parseUUID(string(payload.Explorer))
	if err != nil {
		return err
	}

	systemDataJSON, jerr := encodeStarSystemData(payload.Orbits)
	if jerr != nil {
		return makeDBError(jerr, "ExploreSystem(Data.ToJSON)")
	}

	dbErr := s.q.SetExploredSystemData(s.ctx, dbq.SetExploredSystemDataParams{
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

func decodeStars(json []byte) ([]game.Star, common.Error) {
	dbStars, err := parseJSON[[]starSystemStarData](json)
	if err != nil {
		return nil, err
	}

	result := make([]game.Star, 0, len(dbStars))
	for _, dbStar := range dbStars {
		result = append(result, game.Star{
			ID: game.CelestialID(dbStar.StarID),
			Params: game.StarParams{
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

func encodeStarSystemData(orbits map[game.CelestialID]game.OrbitData) ([]byte, error) {
	jsonOrbits := make(map[string]starSystemDataOrbit)
	for bodyID, orbit := range orbits {
		jsonOrbits[string(bodyID)] = starSystemDataOrbit{
			Center:          string(orbit.Center),
			SemiMajorAu:     orbit.Ellipse.SemiMajor.AstronomicalUnits(),
			Eccentricity:    orbit.Ellipse.Eccentricity,
			InclinationRads: orbit.Inclination.Radians(),
			RotationRads:    orbit.Rotation.Radians(),
			T0:              orbit.T0,
		}
	}

	return json.Marshal(starSystemData{
		Orbits: jsonOrbits,
	})
}

func decodeStarSystem(row dbq.StarSystem) (game.StarSystemContent, common.Error) {
	system := game.StarSystemContent{
		ID:     game.StarSystemID(row.SystemID),
		Orbits: make(map[game.CelestialID]game.OrbitData),
	}

	if row.ExploredAt.Valid && row.ExploredBy.Valid {
		system.Explored = game.ExplorationData{
			By: domain.UserID(row.ExploredBy.String()),
			At: row.ExploredAt.Time,
		}
	}

	systemData, jsonErr := parseJSON[starSystemData](row.SystemData)
	if jsonErr != nil {
		return system, jsonErr
	}

	for bodyId, orbitData := range systemData.Orbits {
		system.Orbits[game.CelestialID(bodyId)] = game.OrbitData{
			Center: game.CelestialID(orbitData.Center),
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
	system.Stars, jerr = decodeStars(row.SystemStars)
	if jerr != nil {
		return system, jerr
	}

	return system, nil
}
