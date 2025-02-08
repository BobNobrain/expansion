package datafront

import (
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/events"
	"srv/internal/globals/eb"
	"srv/internal/globals/logger"
	"srv/internal/utils/common"
	"srv/internal/world"
	"srv/pkg/api"
	"srv/pkg/dfapi"
	"time"
)

type worldsTable struct {
	repo  components.WorldsRepo
	table *dfcore.QueryableTable
	sub   eb.Subscription
}

func (gdf *GameDataFront) InitWorlds(repo components.WorldsRepo) {
	if gdf.worlds != nil {
		panic("GameDataFront.InitWorlds() has already been called!")
	}

	worlds := &worldsTable{
		repo: repo,
		sub:  eb.CreateSubscription(),
	}
	worlds.table = dfcore.NewQueryableTable()
	dfcore.AddTypedTableDataSource(worlds.table, api.WorldsQueryTypeByID, worlds.queryByID)

	eb.SubscribeTyped(worlds.sub, events.SourceGalaxy, events.EventGalaxyWorldUpdate, worlds.onWorldUpdated)

	gdf.worlds = worlds
	gdf.df.AttachTable(dfcore.DFPath("worlds"), worlds.table)
}

func (w *worldsTable) queryByID(
	payload api.WorldsQueryByID,
	_ dfapi.DFTableRequest,
	_ dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {
	worldId := world.CelestialID(payload.WorldID)

	if !worldId.IsPlanetID() && !worldId.IsMoonID() {
		return nil, common.NewValidationError(
			"WorldOverviewsQueryBySystemID::SystemID",
			"wrong system id",
		)
	}

	worldData, err := w.repo.GetData(worldId)
	if err != nil {
		return nil, err
	}

	return dfcore.SingleEntityTableResponse(dfcore.EntityID(worldData.ID), encodeWorld(worldData)), nil
}

func (t *worldsTable) onWorldUpdated(payload events.GalaxyWorldUpdate, ev eb.Event) {
	update := make(map[dfcore.EntityID]common.Encodable)

	worldData, err := t.repo.GetData(payload.WorldID)
	if err != nil {
		logger.Error(logger.FromError("DF/world_overviews", err).WithDetail("event", ev))
		return
	}

	update[dfcore.EntityID(payload.WorldID)] = encodeWorldOverview(world.WorldOverview{
		ID:         worldData.ID,
		IsExplored: worldData.Explored != nil,
		Size:       worldData.Grid.Size(),
		Conditions: worldData.Conditions,
		Params:     worldData.Params,
	})
	t.table.PublishEntities(update)
}

func encodeWorld(w world.WorldData) common.Encodable {
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
	for i := 0; i < size; i++ {
		coords := w.Grid.GetCoords(i)
		color := w.Tiles[i].Color
		gridCoords = append(gridCoords, coords.X, coords.Y, coords.Z)
		tileColors = append(tileColors, []float64{color.R, color.G, color.B})
		tileElevations = append(tileElevations, w.Tiles[i].Elevation)
		tileSurfaceTypes = append(tileSurfaceTypes, w.Tiles[i].Surface.String())
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

		GridCoords:   gridCoords,
		GridEdges:    w.Grid.GetUnduplicatedConnections(),
		Colors:       tileColors,
		Elevations:   tileElevations,
		SurfaceTypes: tileSurfaceTypes,

		AvgTempK:          w.Conditions.AvgTemp.Kelvins(),
		PressureBar:       w.Conditions.Pressure.Bar(),
		GravityGs:         w.Conditions.Gravity.EarthGs(),
		OceansLevel:       w.Composition.OceanLevel,
		ElevationsScaleKm: w.TileElevationsScale.Kilometers(),

		SnowContent:       w.Composition.Snow.ToMap(),
		OceansContent:     w.Composition.Oceans.ToMap(),
		AtmosphereContent: w.Composition.Atmosphere.ToMap(),
	})
}
