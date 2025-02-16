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
)

type worldOverviewsTable struct {
	repo components.WorldsRepo
	sub  eb.Subscription

	table       *dfcore.QueryableTable
	qBySystemID *dfcore.TrackableTableQuery[api.WorldOverviewsQueryBySystemID]
}

func (gdf *GameDataFront) InitWorldOverviews(repo components.WorldsRepo) {
	if gdf.worldOverviews != nil {
		panic("GameDataFront.InitWorldOverviews() has already been called!")
	}

	overviews := &worldOverviewsTable{
		repo: repo,
		sub:  eb.CreateSubscription(),
	}
	overviews.table = dfcore.NewQueryableTable(overviews.queryByIDs)
	overviews.qBySystemID = dfcore.NewTrackableTableQuery(overviews.queryBySystemID, overviews.table)

	eb.SubscribeTyped(overviews.sub, events.SourceGalaxy, events.EventGalaxySystemUpdate, overviews.onSystemUpdated)
	eb.SubscribeTyped(overviews.sub, events.SourceGalaxy, events.EventGalaxyWorldUpdate, overviews.onWorldUpdated)

	gdf.worldOverviews = overviews
	gdf.df.AttachTable("world_overviews", overviews.table)
	gdf.df.AttachTableQuery("world_overviews/bySystemId", overviews.qBySystemID)
}

func (t *worldOverviewsTable) dispose() {
	t.sub.UnsubscribeAll()
}

func (t *worldOverviewsTable) queryByIDs(req dfapi.DFTableRequest, ctx dfcore.DFRequestContext) (*dfcore.TableResponse, common.Error) {
	return nil, common.NewError(common.WithCode("ERR_TODO"), common.WithMessage("world_overviews[id] is not implemented yet"))
}

func (t *worldOverviewsTable) queryBySystemID(
	payload api.WorldOverviewsQueryBySystemID,
	_ dfapi.DFTableQueryRequest,
	_ dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {
	systemID := world.StarSystemID(payload.SystemID)
	if !systemID.IsValid() {
		return nil, common.NewValidationError("WorldOverviewsQueryBySystemID::SystemID", "wrong system id")
	}

	overviews, err := t.repo.GetOverviews(systemID)
	if err != nil {
		return nil, err
	}

	result := dfcore.NewTableResponse()
	for _, overview := range overviews {
		result.Add(dfcore.EntityID(overview.ID), encodeWorldOverview(overview))
	}

	return result, nil
}

func (t *worldOverviewsTable) onSystemUpdated(payload events.GalaxySystemUpdate, _ eb.Event) {
	t.qBySystemID.PublishChangedNotification(api.WorldOverviewsQueryBySystemID{SystemID: string(payload.SystemID)})
}

func (t *worldOverviewsTable) onWorldUpdated(payload events.GalaxyWorldUpdate, ev eb.Event) {
	worldData, err := t.repo.GetData(payload.WorldID)
	if err != nil {
		logger.Error(logger.FromError("DF/world_overviews", err).WithDetail("event", ev))
		return
	}

	update := make(map[dfcore.EntityID]common.Encodable)
	update[dfcore.EntityID(payload.WorldID)] = encodeWorldOverview(world.WorldOverview{
		ID:         worldData.ID,
		IsExplored: worldData.Explored != nil,
		Size:       worldData.Grid.Size(),
		Conditions: worldData.Conditions,
		Params:     worldData.Params,
	})
	t.table.PublishEntities(update)
}

func encodeWorldOverview(overview world.WorldOverview) common.Encodable {
	return common.AsEncodable(api.WorldOverviewsTableRow{
		WorldID:    string(overview.ID),
		Size:       overview.Size,
		IsExplored: overview.IsExplored,

		MassEarths:        overview.Params.Mass.EarthMasses(),
		RadiusKm:          overview.Params.Radius.Kilometers(),
		AgeByrs:           overview.Params.Age.BillionYears(),
		Class:             overview.Params.Class.String(),
		AxisTiltRads:      overview.Params.AxisTilt.Radians(),
		DayLengthGameDays: overview.Params.DayLength.Days(),

		AvgTempK:    overview.Conditions.AvgTemp.Kelvins(),
		PressureBar: overview.Conditions.Pressure.Bar(),
		GravityGs:   overview.Conditions.Gravity.EarthGs(),

		NPops:   overview.Population.NPops,
		NBases:  overview.Population.NBases,
		NCities: overview.Population.NCities,
	})
}
