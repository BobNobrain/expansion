package datafront

import (
	"fmt"
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/globals/events"
	"srv/internal/globals/logger"
	"srv/internal/utils/common"
	"srv/internal/utils/geom"
	"srv/pkg/api"
	"srv/pkg/dfapi"
)

type sysOverviewsTable struct {
	repo components.StarSystemsRepoReadonly
	sub  *events.Subscription

	table       *dfcore.QueryableTable
	qBySectorId *dfcore.TrackableTableQuery[api.SysOverviewsQueryBySectorID]
	qByCoords   *dfcore.TrackableTableQuery[api.SysOverviewsQueryByCoords]
}

func (gdf *GameDataFront) InitSysOverviews(repo components.StarSystemsRepoReadonly) {
	if gdf.sysOverviews != nil {
		panic("GameDataFront.InitSystemOverviews() has already been called!")
	}

	overviews := &sysOverviewsTable{
		repo: repo,
		sub:  events.NewSubscription(),
	}
	overviews.table = dfcore.NewQueryableTable(overviews.queryByID)
	overviews.qBySectorId = dfcore.NewTrackableTableQuery(overviews.queryBySectorID, overviews.table)
	overviews.qByCoords = dfcore.NewTrackableTableQuery(overviews.queryByCoords, overviews.table)

	events.SubscribeTyped(overviews.sub, events.SystemUpdated, overviews.onSystemUpdated)

	gdf.sysOverviews = overviews
	gdf.df.AttachTable("sys_overviews", overviews.table)
	gdf.df.AttachTableQuery("sys_overviews/bySectorId", overviews.qBySectorId)
	gdf.df.AttachTableQuery("sys_overviews/byCoords", overviews.qByCoords)
}

func (u *sysOverviewsTable) dispose() {
	u.sub.UnsubscribeAll()
}

func (u *sysOverviewsTable) onSystemUpdated(payload events.SystemUpdatedPayload) {
	system, err := u.repo.GetContent(payload.SystemID)
	if err != nil {
		logger.Error(logger.FromError("DF/sys_overviews", err).WithDetail("event", "galaxy:systemUpdate"))
		return
	}

	u.table.PublishEntities(u.MakeCollection().Add(game.StarSystemOverview{
		ID:         system.ID,
		IsExplored: !system.Explored.By.IsEmpty(),
		Stars:      system.Stars,
		// TODO: properly retrieve and calculate values like NPlanets
	}))
}

func (t *sysOverviewsTable) queryByID(req dfapi.DFTableRequest, _ domain.RequestContext) (domain.EntityCollection, common.Error) {
	return nil, common.NewError(common.WithCode("ERR_TODO"), common.WithMessage("sys_overviews[id] is not implemented yet"))
}

func (u *sysOverviewsTable) queryBySectorID(
	q api.SysOverviewsQueryBySectorID,
	_ dfapi.DFTableQueryRequest,
	_ domain.RequestContext,
) (domain.EntityCollection, common.Error) {

	if len(q.SectorID) != 2 {
		return nil, common.NewValidationError(
			"SysOverviewsQueryBySectorID::SectorID",
			fmt.Sprintf("invalid sector id: '%s'", q.SectorID),
		)
	}

	overviews, err := u.repo.GetOverviews(game.GalacticSectorID(q.SectorID))
	if err != nil {
		return nil, err
	}

	return u.MakeCollection().AddList(overviews), nil
}

func (u *sysOverviewsTable) queryByCoords(
	q api.SysOverviewsQueryByCoords,
	_ dfapi.DFTableQueryRequest,
	_ domain.RequestContext,
) (domain.EntityCollection, common.Error) {
	overviews, err := u.repo.GetSystemsOnMap(components.StarSystemRepoMapRequest{
		Limit: q.Limit,
		Sector: game.GalacticSectorCoords{
			InnerR:     game.GalacticCoordsRadius(q.RMin),
			OuterR:     game.GalacticCoordsRadius(q.RMax),
			ThetaStart: geom.Radians(q.ThetaStart),
			ThetaEnd:   geom.Radians(q.ThetaEnd),
		},
	})
	if err != nil {
		return nil, err
	}

	return u.MakeCollection().AddList(overviews), nil
}

func (t *sysOverviewsTable) IdentifyEntity(overview game.StarSystemOverview) domain.EntityID {
	return domain.EntityID(overview.ID)
}
func (t *sysOverviewsTable) EncodeEntity(overview game.StarSystemOverview) common.Encodable {
	stars := make([]api.SysOverviewsTableRowStar, 0, len(overview.Stars))
	for _, star := range overview.Stars {
		stars = append(stars, api.SysOverviewsTableRowStar{
			ID:             string(star.ID),
			TempK:          star.Params.Temperature.Kelvins(),
			LuminositySuns: star.Params.Luminosity.Suns(),
			RadiusAu:       star.Params.Radius.AstronomicalUnits(),
			MassSuns:       star.Params.Mass.SolarMasses(),
			AgeByrs:        star.Params.Age.BillionYears(),
		})
	}

	return common.AsEncodable(api.SysOverviewsTableRow{
		SystemID:    string(overview.ID),
		CoordsR:     float64(overview.Coords.R),
		CoordsH:     float64(overview.Coords.H),
		CoordsTheta: overview.Coords.Theta.Radians(),
		IsExplored:  overview.IsExplored,
		NPlanets:    overview.NPlanets,
		NMoons:      overview.NMoons,
		NAsteroids:  overview.NAsteroids,
		NPops:       overview.PopInfo.Population,
		NBases:      overview.PopInfo.NBases,
		NCities:     overview.PopInfo.NCities,
		Stars:       stars,
	})
}
func (t *sysOverviewsTable) MakeCollection() domain.EntityCollectionBuilder[game.StarSystemOverview] {
	return domain.MakeUnorderedEntityCollection(t, nil)
}
