package db

import (
	"context"
	"encoding/json"
	"srv/internal/components"
	"srv/internal/db/dbq"
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/globals/globaldata"
	"srv/internal/utils"
	"srv/internal/utils/color"
	"srv/internal/utils/common"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"srv/internal/utils/predictable"
)

type worldsRepoImpl struct {
	q   *dbq.Queries
	ctx context.Context
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

	_, err := w.q.CreateWorlds(w.ctx, createData)
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

	dberr := w.q.ExploreWorld(w.ctx, dbq.ExploreWorldParams{
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

func (w *worldsRepoImpl) GetData(worldID game.CelestialID) (game.WorldData, common.Error) {
	worlds, err := w.GetDataMany([]game.CelestialID{worldID})
	if err != nil {
		return game.WorldData{}, err
	}

	if len(worlds) == 0 {
		return game.WorldData{}, common.NewError(
			common.WithCode("ERR_NOT_FOUND"),
			common.WithMessage("specified world not found"),
			common.WithDetail("worldId", worldID),
		)
	}

	return worlds[0], nil
}

func (w *worldsRepoImpl) GetDataMany(ids []game.CelestialID) ([]game.WorldData, common.Error) {
	rows, dberr := w.q.ResolveWorlds(w.ctx, utils.ConvertStrings[game.CelestialID, string](ids))
	if dberr != nil {
		return nil, makeDBError(dberr, "WorldsRepo::GetDataMany")
	}

	return utils.MapSliceFailable(rows, decodeWorld)
}

func (w *worldsRepoImpl) GetOverviews(systemID game.StarSystemID) ([]game.WorldOverview, common.Error) {
	rows, dberr := w.q.GetWorldsInSystem(w.ctx, string(systemID))
	if dberr != nil {
		return nil, makeDBError(dberr, "WorldsRepo::GetOverviews")
	}

	result := make([]game.WorldOverview, 0, len(rows))
	for _, row := range rows {
		result = append(result, game.WorldOverview{
			ID:         game.CelestialID(row.BodyID),
			IsExplored: row.ExploredAt.Valid && row.ExploredBy.Valid,
			Size:       int(row.GridSize),
			Conditions: game.WorldConditions{
				Pressure: phys.Bar(row.SurfacePressureBar),
				AvgTemp:  phys.Kelvins(row.SurfaceAvgTempK),
				Gravity:  phys.EarthGs(row.SurfaceGravityG),
			},
			Params: game.WorldParams{
				Radius: phys.Kilometers(row.RadiusKm),
				Mass:   phys.EarthMasses(row.MassEarths),
				Age:    phys.BillionYears(row.AgeByrs),
				Class:  decodeWorldClass(row.Class),
			},
			Population: game.WorldPopulationOverview{
				NPops:   int(row.Population),
				NCities: int(row.NCities),
				NBases:  int(row.NBases),
			},
		})
	}

	return result, nil
}

func encodeWorldClass(class game.CelestialBodyClass) string {
	switch class {
	case game.CelestialBodyClassGaseous:
		return "G"
	case game.CelestialBodyClassTerrestial:
		return "T"
	default:
		return "?"
	}
}
func decodeWorldClass(class string) game.CelestialBodyClass {
	switch class {
	case "G":
		return game.CelestialBodyClassGaseous
	case "T":
		return game.CelestialBodyClassTerrestial
	default:
		return game.CelestialBodyClassTerrestial
	}
}

func decodeWorld(row dbq.ResolveWorldsRow) (game.WorldData, common.Error) {
	dbWorldData, err := parseJSON[worldDataJSON](row.SurfaceData)
	if err != nil {
		return game.WorldData{}, err
	}

	nTiles := len(dbWorldData.Coords) / 3
	coords := make([]geom.Vec3, 0, nTiles)
	tiles := make([]game.WorldDataTile, 0, nTiles)

	for i := range nTiles {
		coords = append(coords, geom.Vec3{
			X: dbWorldData.Coords[i*3+0],
			Y: dbWorldData.Coords[i*3+1],
			Z: dbWorldData.Coords[i*3+2],
		})

		tiles = append(tiles, game.WorldDataTile{
			Color: color.RichColorRGB{
				R: dbWorldData.TileColors[i*3+0],
				G: dbWorldData.TileColors[i*3+1],
				B: dbWorldData.TileColors[i*3+2],
			},
			AvgTemp:   phys.Kelvins(dbWorldData.TileTempsK[i]),
			Surface:   game.BiomeSurface(dbWorldData.TileSurface[i]),
			Pressure:  phys.Bar(dbWorldData.TilePressuresBar[i]),
			Elevation: dbWorldData.TileElevations[i],
		})
	}

	var fertileTiles []game.FertileWorldDataTile
	if len(dbWorldData.TileFertilities) > 0 {
		fertileTiles = make([]game.FertileWorldDataTile, 0, len(dbWorldData.TileFertilities))

		for i := range dbWorldData.TileFertilities {
			fertileTiles = append(fertileTiles, game.FertileWorldDataTile{
				SoilFertility: dbWorldData.TileFertilities[i],
				MoistureLevel: dbWorldData.TileMoistures[i],
			})
		}
	}

	var explorationData *game.ExplorationData
	if row.ExploredAt.Valid && row.ExploredBy.Valid {
		explorationData = &game.ExplorationData{
			At: row.ExploredAt.Time,
			By: domain.UserID(row.ExploredBy.String()),
		}
	}

	resourceDeposits := make(map[game.TileID][]game.ResourceDeposit)
	for _, depositData := range dbWorldData.TileResources {
		tid := game.TileID(depositData.TileID)
		resourceDeposits[tid] = append(resourceDeposits[tid], game.ResourceDeposit{
			ResourceID: game.ResourceID(depositData.ResourceID),
			Abundance:  depositData.Abundance,
		})
	}

	cityTilesData, err := parseJSON[map[int]int](row.CityCenters)
	cityTiles := make(map[game.TileID]game.CityID)
	if err != nil {
		return game.WorldData{}, err
	}
	for tid, cid := range cityTilesData {
		cityTiles[game.TileID(tid)] = game.CityID(cid)
	}

	baseTilesData, err := parseJSON[map[int]int](row.BaseTiles)
	baseTiles := make(map[game.TileID]game.BaseID)
	if err != nil {
		return game.WorldData{}, err
	}

	for tid, bid := range baseTilesData {
		baseTiles[game.TileID(tid)] = game.BaseID(bid)
	}

	return game.WorldData{
		ID:           game.CelestialID(row.BodyID),
		Grid:         geom.RestoreSpatialGraph(coords, dbWorldData.Graph),
		Tiles:        tiles,
		FertileTiles: fertileTiles,
		Explored:     explorationData,
		Composition: game.WorldComposition{
			OceanLevel: dbWorldData.OceanLevel,
			Atmosphere: globaldata.Materials().RestoreCompoundFromMap(dbWorldData.Atmosphere),
			Oceans:     globaldata.Materials().RestoreCompoundFromMap(dbWorldData.Oceans),
			Snow:       globaldata.Materials().RestoreCompoundFromMap(dbWorldData.Snow),
		},
		TileElevationsScale: phys.Kilometers(dbWorldData.ElevationsScaleKm),
		Conditions: game.WorldConditions{
			Pressure: phys.Bar(row.SurfacePressureBar),
			AvgTemp:  phys.Kelvins(row.SurfaceAvgTempK),
			Gravity:  phys.EarthGs(row.SurfaceGravityG),
		},
		Params: game.WorldParams{
			Radius: phys.Kilometers(row.RadiusKm),
			Mass:   phys.EarthMasses(row.MassEarths),
			Age:    phys.BillionYears(row.AgeByrs),
			Class:  decodeWorldClass(row.Class),
		},
		NPops:           predictable.NewConstant(float64(row.Population)), // TODO: pop growth and stuff
		TileResources:   resourceDeposits,
		TileCityCenters: cityTiles,
		TileBases:       baseTiles,
	}, nil
}
