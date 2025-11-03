package datafront

import (
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/game"
	"srv/internal/globals/events"
	"srv/internal/globals/logger"
	"srv/internal/utils/common"
	"srv/pkg/api"
	"srv/pkg/dfapi"
	"time"
)

type worldsTable struct {
	repo  components.WorldsRepoReadonly
	table *dfcore.QueryableTable
	sub   *events.Subscription
}

func (gdf *GameDataFront) InitWorlds(repo components.WorldsRepoReadonly) {
	if gdf.worlds != nil {
		panic("GameDataFront.InitWorlds() has already been called!")
	}

	worlds := &worldsTable{
		repo: repo,
		sub:  events.NewSubscription(),
	}
	worlds.table = dfcore.NewQueryableTable(worlds.queryByIDs)

	events.SubscribeTyped(worlds.sub, events.WorldUpdated, worlds.onWorldUpdated)

	gdf.worlds = worlds
	gdf.df.AttachTable(dfcore.DFPath("worlds"), worlds.table)
}

func (w *worldsTable) queryByIDs(
	req dfapi.DFTableRequest,
	_ dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {
	worldIDs := make([]game.CelestialID, 0, len(req.IDs))
	for _, id := range req.IDs {
		worldID := game.CelestialID(id)

		if !worldID.IsPlanetID() && !worldID.IsMoonID() {
			return nil, common.NewValidationError(
				"DFTableRequest::IDs",
				"wrong world id: "+id,
			)
		}

		worldIDs = append(worldIDs, worldID)
	}

	worlds, err := w.repo.GetDataMany(worldIDs)
	if err != nil {
		return nil, err
	}

	response := dfcore.NewTableResponse()
	for _, world := range worlds {
		response.Add(dfcore.EntityID(world.ID), encodeWorld(world))
	}
	return response, nil
}

func (t *worldsTable) onWorldUpdated(payload events.WorldUpdatedPayload) {
	update := make(map[dfcore.EntityID]common.Encodable)

	worldData, err := t.repo.GetData(payload.WorldID)
	if err != nil {
		logger.Error(logger.FromError("DF/world_overviews", err).WithDetail("payload", payload))
		return
	}

	update[dfcore.EntityID(payload.WorldID)] = encodeWorld(worldData)
	t.table.PublishEntities(update)
}

func encodeWorld(w game.WorldData) common.Encodable {
	var exploredBy string
	var exploredAt time.Time

	if w.Explored != nil {
		exploredBy = string(w.Explored.By)
		exploredAt = w.Explored.At
	}

	size := w.Grid.Size()
	gridCoords := make([]float64, 0, size*3)
	tileColors := make([][]float64, 0, size)
	tileElevations := make([]float64, 0, size)
	tileSurfaceTypes := make([]string, 0, size)
	var tileSoilFertilities []float64
	var tileMoistureLevels []float64

	for i := 0; i < size; i++ {
		coords := w.Grid.GetCoords(i)
		color := w.Tiles[i].Color
		gridCoords = append(gridCoords, coords.X, coords.Y, coords.Z)
		tileColors = append(tileColors, []float64{color.R, color.G, color.B})
		tileElevations = append(tileElevations, w.Tiles[i].Elevation)
		tileSurfaceTypes = append(tileSurfaceTypes, w.Tiles[i].Surface.String())
	}

	if len(w.FertileTiles) > 0 {
		tileSoilFertilities = make([]float64, 0, len(w.FertileTiles))
		tileMoistureLevels = make([]float64, 0, len(w.FertileTiles))

		for _, tile := range w.FertileTiles {
			tileSoilFertilities = append(tileSoilFertilities, tile.SoilFertility)
			tileMoistureLevels = append(tileMoistureLevels, tile.MoistureLevel)
		}
	}

	resourceDeposits := make(map[int][]api.WorldsTableRowResourceDeposit)
	for tileId, deposits := range w.TileResources {
		for _, deposit := range deposits {
			resourceDeposits[int(tileId)] = append(resourceDeposits[int(tileId)], api.WorldsTableRowResourceDeposit{
				ResourceID: string(deposit.ResourceID),
				Abundance:  deposit.Abundance,
			})
		}
	}

	tileCities := make(map[int]int)
	for tid, cid := range w.TileCityCenters {
		tileCities[int(tid)] = int(cid)
	}
	tileBases := make(map[int]int)
	for tid, cid := range w.TileBases {
		tileBases[int(tid)] = int(cid)
	}

	return common.AsEncodable(api.WorldsTableRow{
		ID:         string(w.ID),
		ExploredBy: exploredBy,
		ExploredAt: exploredAt,

		MassEarths:        w.Params.Mass.EarthMasses(),
		RadiusKm:          w.Params.Radius.Kilometers(),
		AgeByrs:           w.Params.Age.BillionYears(),
		Class:             w.Params.Class.String(),
		AxisTiltRads:      w.Params.AxisTilt.Radians(),
		DayLengthGameDays: w.Params.DayLength.Days(),

		GridCoords:     gridCoords,
		GridEdges:      w.Grid.GetUnduplicatedConnections(),
		Colors:         tileColors,
		Elevations:     tileElevations,
		SurfaceTypes:   tileSurfaceTypes,
		SoilFertility:  tileSoilFertilities,
		MoistureLevels: tileMoistureLevels,

		ResourceDeposits: resourceDeposits,

		AvgTempK:          w.Conditions.AvgTemp.Kelvins(),
		PressureBar:       w.Conditions.Pressure.Bar(),
		GravityGs:         w.Conditions.Gravity.EarthGs(),
		OceansLevel:       w.Composition.OceanLevel,
		ElevationsScaleKm: w.TileElevationsScale.Kilometers(),

		SnowContent:       w.Composition.Snow.ToMap(),
		OceansContent:     w.Composition.Oceans.ToMap(),
		AtmosphereContent: w.Composition.Atmosphere.ToMap(),

		NPops:      serializePredictable(w.NPops.Wrap()),
		TileCities: tileCities,
		TileBases:  tileBases,
	})
}

func (w *worldsTable) dispose() {
	w.sub.UnsubscribeAll()
}
