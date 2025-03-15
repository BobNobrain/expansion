package db

import (
	"context"
	"encoding/json"
	"srv/internal/components"
	"srv/internal/db/dbq"
	"srv/internal/domain"
	"srv/internal/globals/globaldata"
	"srv/internal/utils/color"
	"srv/internal/utils/common"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"srv/internal/world"
)

type worldsRepoImpl struct {
	q *dbq.Queries
}

type worldDataJSON struct {
	Graph  [][]int   `json:"graph"`
	Coords []float64 `json:"coords"`

	Atmosphere map[string]float64 `json:"atm"`
	Oceans     map[string]float64 `json:"oceans"`
	Snow       map[string]float64 `json:"snow"`

	ElevationsScaleKm float64 `json:"elScaleKm"`
	OceanLevel        float64 `json:"oceanLevel"`

	TileColors       []float64 `json:"tileColors"`
	TileElevations   []float64 `json:"tileEls"`
	TileTempsK       []float64 `json:"tileTempsK"`
	TilePressuresBar []float64 `json:"tilePsBar"`
	TileSurface      []int     `json:"tileSurfaces"`
	TileFertilities  []float64 `json:"tileFertilities,omitempty"`
	TileMoistures    []float64 `json:"tileMoistures,omitempty"`

	TileResources []worldDataJSONResourceDeposit `json:"tileResources"`
}
type worldDataJSONResourceDeposit struct {
	TileID     int     `json:"tile"`
	ResourceID string  `json:"resource"`
	Abundance  float64 `json:"abundance"`
}

func (w *worldsRepoImpl) CreateWorlds(worlds []components.CreateWorldPayload) common.Error {
	createData := make([]dbq.CreateWorldsParams, 0, len(worlds))
	for _, world := range worlds {
		createData = append(createData, dbq.CreateWorldsParams{
			BodyID:            string(world.ID),
			SystemID:          string(world.ID.GetStarSystemID()),
			AgeByrs:           world.Params.Age.BillionYears(),
			RadiusKm:          world.Params.Radius.Kilometers(),
			MassEarths:        world.Params.Mass.EarthMasses(),
			Class:             encodeWorldClass(world.Params.Class),
			AxisTilt:          world.Params.AxisTilt.Radians(),
			DayLengthGameDays: world.Params.DayLength.Days(),
			GridSize:          int32(world.Size),
		})
	}

	_, err := w.q.CreateWorlds(context.Background(), createData)
	if err != nil {
		return makeDBError(err, "WorldsRepo::CreateWorlds")
	}
	return nil
}

func (w *worldsRepoImpl) ExploreWorld(payload components.ExploreWorldPayload) common.Error {
	uuid, err := parseUUID(string(payload.ExploredBy))
	if err != nil {
		return err
	}

	nTiles := payload.Data.Grid.Size()
	coords := make([]float64, 0, nTiles*3)
	tileColors := make([]float64, 0, nTiles*3)
	tileElevations := make([]float64, 0, nTiles)
	tileTemps := make([]float64, 0, nTiles)
	tilePressures := make([]float64, 0, nTiles)
	tileSurfaces := make([]int, 0, nTiles)

	var tileFertilities []float64
	var tileMoistures []float64

	for i := 0; i < payload.Data.Grid.Size(); i++ {
		pos := payload.Data.Grid.GetCoords(i)
		coords = append(coords, pos.X, pos.Y, pos.Z)

		tileData := payload.Data.Tiles[i]
		tileColors = append(tileColors, tileData.Color.R, tileData.Color.G, tileData.Color.B)
		tileElevations = append(tileElevations, tileData.Elevation)
		tileTemps = append(tileTemps, tileData.AvgTemp.Kelvins())
		tilePressures = append(tilePressures, tileData.Pressure.Bar())
		tileSurfaces = append(tileSurfaces, int(tileData.Surface))
	}

	if len(payload.Data.FertileTiles) > 0 {
		tileFertilities = make([]float64, 0, len(payload.Data.FertileTiles))
		tileMoistures = make([]float64, 0, len(payload.Data.FertileTiles))

		for _, tile := range payload.Data.FertileTiles {
			tileFertilities = append(tileFertilities, tile.SoilFertility)
			tileMoistures = append(tileMoistures, tile.MoistureLevel)
		}
	}

	tileResources := make([]worldDataJSONResourceDeposit, 0)
	for tileId, deposits := range payload.Data.TileResources {
		for _, deposit := range deposits {
			tileResources = append(tileResources, worldDataJSONResourceDeposit{
				TileID:     tileId,
				ResourceID: string(deposit.ResourceID),
				Abundance:  deposit.Abundance,
			})
		}
	}

	surfaceData := worldDataJSON{
		Graph:  payload.Data.Grid.GetUnduplicatedConnections(),
		Coords: coords,

		Atmosphere: payload.Data.Atmosphere.ToMap(),
		Oceans:     payload.Data.Oceans.ToMap(),
		Snow:       payload.Data.Snow.ToMap(),

		ElevationsScaleKm: payload.Data.TileElevationsScale.Kilometers(),
		TileColors:        tileColors,
		TileElevations:    tileElevations,
		TileTempsK:        tileTemps,
		TilePressuresBar:  tilePressures,
		TileSurface:       tileSurfaces,
		TileFertilities:   tileFertilities,
		TileMoistures:     tileMoistures,

		TileResources: tileResources,
	}

	surfaceDataJSON, jerr := json.Marshal(surfaceData)
	if jerr != nil {
		return makeDBError(jerr, "WorldsRepo::ExploreWorld(SurfaceData.ToJSON)")
	}

	dberr := w.q.ExploreWorld(context.Background(), dbq.ExploreWorldParams{
		ExploredBy:         uuid,
		BodyID:             string(payload.ID),
		SurfacePressureBar: payload.Data.Conditions.Pressure.Bar(),
		SurfaceAvgTempK:    payload.Data.Conditions.AvgTemp.Kelvins(),
		SurfaceGravityG:    payload.Data.Conditions.Gravity.EarthGs(),
		GridSize:           int32(payload.Data.Grid.Size()),
		SurfaceData:        surfaceDataJSON,
	})
	if dberr != nil {
		return makeDBError(dberr, "WorldsRepo::ExploreWorld")
	}

	return nil
}

func (w *worldsRepoImpl) GetData(worldID world.CelestialID) (world.WorldData, common.Error) {
	worlds, err := w.GetDataMany([]world.CelestialID{worldID})
	if err != nil {
		return world.WorldData{}, err
	}

	if len(worlds) == 0 {
		return world.WorldData{}, common.NewError(
			common.WithCode("ERR_NOT_FOUND"),
			common.WithMessage("specified world not found"),
			common.WithDetails(
				common.NewDictEncodable().Set("worldId", worldID),
			),
		)
	}

	return worlds[0], nil
}

func (w *worldsRepoImpl) GetDataMany(ids []world.CelestialID) ([]world.WorldData, common.Error) {
	strIds := make([]string, 0, len(ids))
	for _, id := range ids {
		strIds = append(strIds, string(id))
	}

	rows, dberr := w.q.ResolveWorlds(context.Background(), strIds)
	if dberr != nil {
		return nil, makeDBError(dberr, "WorldsRepo::GetDataMany")
	}

	worlds := make([]world.WorldData, 0, len(rows))
	for _, row := range rows {
		world, err := decodeWorld(row)
		if err != nil {
			return nil, err
		}
		worlds = append(worlds, world)
	}

	return worlds, nil
}

func (w *worldsRepoImpl) GetOverviews(systemID world.StarSystemID) ([]world.WorldOverview, common.Error) {
	rows, dberr := w.q.GetWorldsInSystem(context.Background(), string(systemID))
	if dberr != nil {
		return nil, makeDBError(dberr, "WorldsRepo::GetOverviews")
	}

	result := make([]world.WorldOverview, 0, len(rows))
	for _, row := range rows {
		result = append(result, world.WorldOverview{
			ID:         world.CelestialID(row.BodyID),
			IsExplored: row.ExploredAt.Valid && row.ExploredBy.Valid,
			Size:       int(row.GridSize),
			Conditions: world.WorldConditions{
				Pressure: phys.Bar(row.SurfacePressureBar),
				AvgTemp:  phys.Kelvins(row.SurfaceAvgTempK),
				Gravity:  phys.EarthGs(row.SurfaceGravityG),
			},
			Params: world.WorldParams{
				Radius: phys.Kilometers(row.RadiusKm),
				Mass:   phys.EarthMasses(row.MassEarths),
				Age:    phys.BillionYears(row.AgeByrs),
				Class:  decodeWorldClass(row.Class),
			},
			Population: world.WorldPopulationOverview{
				NPops:   int(row.Population),
				NCities: int(row.NCities),
				NBases:  int(row.NBases),
			},
		})
	}

	return result, nil
}

func encodeWorldClass(class world.CelestialBodyClass) string {
	switch class {
	case world.CelestialBodyClassGaseous:
		return "G"
	case world.CelestialBodyClassTerrestial:
		return "T"
	default:
		return "?"
	}
}
func decodeWorldClass(class string) world.CelestialBodyClass {
	switch class {
	case "G":
		return world.CelestialBodyClassGaseous
	case "T":
		return world.CelestialBodyClassTerrestial
	default:
		return world.CelestialBodyClassTerrestial
	}
}

func decodeWorld(row dbq.ResolveWorldsRow) (world.WorldData, common.Error) {
	dbWorldData, err := parseJSON[worldDataJSON](row.SurfaceData)
	if err != nil {
		return world.WorldData{}, err
	}

	nTiles := len(dbWorldData.Coords) / 3
	coords := make([]geom.Vec3, 0, nTiles)
	tiles := make([]world.WorldDataTile, 0, nTiles)

	for i := 0; i < nTiles; i++ {
		coords = append(coords, geom.Vec3{
			X: dbWorldData.Coords[i*3+0],
			Y: dbWorldData.Coords[i*3+1],
			Z: dbWorldData.Coords[i*3+2],
		})

		tiles = append(tiles, world.WorldDataTile{
			Color: color.RichColorRGB{
				R: dbWorldData.TileColors[i*3+0],
				G: dbWorldData.TileColors[i*3+1],
				B: dbWorldData.TileColors[i*3+2],
			},
			AvgTemp:   phys.Kelvins(dbWorldData.TileTempsK[i]),
			Surface:   world.BiomeSurface(dbWorldData.TileSurface[i]),
			Pressure:  phys.Bar(dbWorldData.TilePressuresBar[i]),
			Elevation: dbWorldData.TileElevations[i],
		})
	}

	var fertileTiles []world.FertileWorldDataTile
	if len(dbWorldData.TileFertilities) > 0 {
		fertileTiles = make([]world.FertileWorldDataTile, 0, len(dbWorldData.TileFertilities))

		for i := range dbWorldData.TileFertilities {
			fertileTiles = append(fertileTiles, world.FertileWorldDataTile{
				SoilFertility: dbWorldData.TileFertilities[i],
				MoistureLevel: dbWorldData.TileMoistures[i],
			})
		}
	}

	var explorationData *world.ExplorationData
	if row.ExploredAt.Valid && row.ExploredBy.Valid {
		explorationData = &world.ExplorationData{
			At: row.ExploredAt.Time,
			By: domain.UserID(row.ExploredBy.String()),
		}
	}

	resourceDeposits := make(map[int][]world.ResourceDeposit)
	for _, depositData := range dbWorldData.TileResources {
		resourceDeposits[depositData.TileID] = append(resourceDeposits[depositData.TileID], world.ResourceDeposit{
			ResourceID: world.ResourceID(depositData.ResourceID),
			Abundance:  depositData.Abundance,
		})
	}

	return world.WorldData{
		ID:           world.CelestialID(row.BodyID),
		Grid:         geom.RestoreSpatialGraph(coords, dbWorldData.Graph),
		Tiles:        tiles,
		FertileTiles: fertileTiles,
		Explored:     explorationData,
		Composition: world.WorldComposition{
			OceanLevel: dbWorldData.OceanLevel,
			Atmosphere: globaldata.Materials().RestoreCompoundFromMap(dbWorldData.Atmosphere),
			Oceans:     globaldata.Materials().RestoreCompoundFromMap(dbWorldData.Oceans),
			Snow:       globaldata.Materials().RestoreCompoundFromMap(dbWorldData.Snow),
		},
		TileElevationsScale: phys.Kilometers(dbWorldData.ElevationsScaleKm),
		Conditions: world.WorldConditions{
			Pressure: phys.Bar(row.SurfacePressureBar),
			AvgTemp:  phys.Kelvins(row.SurfaceAvgTempK),
			Gravity:  phys.EarthGs(row.SurfaceGravityG),
		},
		Params: world.WorldParams{
			Radius: phys.Kilometers(row.RadiusKm),
			Mass:   phys.EarthMasses(row.MassEarths),
			Age:    phys.BillionYears(row.AgeByrs),
			Class:  decodeWorldClass(row.Class),
		},
		Population: world.WorldPopulationOverview{
			NPops:   int(row.Population),
			NCities: int(row.NCities),
			NBases:  int(row.NBases),
		},
		TileResources: resourceDeposits,
	}, nil
}
