package datafront

import (
	"fmt"
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/events"
	"srv/internal/globals/eb"
	"srv/internal/globals/logger"
	"srv/internal/utils/common"
	"srv/internal/utils/geom"
	"srv/internal/world"
	"srv/pkg/api"
	"srv/pkg/dfapi"
)

type sysOverviewsTable struct {
	repo  components.StarSystemsRepo
	table *dfcore.QueryableTable
	sub   eb.Subscription
}

func (gdf *GameDataFront) InitSysOverviews(repo components.StarSystemsRepo) {
	if gdf.sysOverviews != nil {
		panic("GameDataFront.InitSystemOverviews() has already been called!")
	}

	overviews := &sysOverviewsTable{
		repo: repo,
		sub:  eb.CreateSubscription(),
	}
	overviews.table = dfcore.NewQueryableTable()
	dfcore.AddTypedTableDataSource(overviews.table, api.SysOverviewsQueryTypeBySectorID, overviews.queryBySectorID)
	dfcore.AddTypedTableDataSource(overviews.table, api.SysOverviewsQueryTypeByCoords, overviews.queryByCoords)

	eb.SubscribeTyped(overviews.sub, events.SourceGalaxy, events.EventGalaxySystemUpdate, overviews.onSystemUpdated)

	gdf.sysOverviews = overviews
	gdf.df.AttachTable(dfcore.DFPath("sys_overviews"), overviews.table)
}

func (u *sysOverviewsTable) dispose() {
	u.sub.UnsubscribeAll()
}

func (u *sysOverviewsTable) onSystemUpdated(payload events.GalaxySystemUpdate, _ eb.Event) {
	system, err := u.repo.GetContent(payload.SystemID)
	if err != nil {
		logger.Error(logger.FromError("DF/sys_overviews", err).WithDetail("event", "galaxy:systemUpdate"))
		return
	}

	update := make(map[dfcore.EntityID]common.Encodable)
	update[dfcore.EntityID(payload.SystemID)] = encodeSystemOverview(world.StarSystemOverview{
		ID:         system.ID,
		IsExplored: !system.Explored.By.IsEmpty(),
		Stars:      system.Stars,
		NPlanets:   len(system.Worlds), // TODO: properly retrieve and calculate these values
	})
	u.table.PublishEntities(update)
}

func (u *sysOverviewsTable) queryBySectorID(
	q api.SysOverviewsQueryBySectorID,
	_ dfapi.DFTableRequest,
	_ dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {

	if len(q.SectorID) != 2 {
		return nil, common.NewValidationError(
			"SysOverviewsQueryBySectorID::SectorID",
			fmt.Sprintf("invalid sector id: '%s'", q.SectorID),
		)
	}

	overviews, err := u.repo.GetOverviews(world.GalacticSectorID(q.SectorID))
	if err != nil {
		return nil, err
	}

	result := dfcore.EmptyTableResponse()
	for _, overview := range overviews {
		result.Add(dfcore.EntityID(overview.ID), encodeSystemOverview(overview))
	}

	return result, nil
}

func (u *sysOverviewsTable) queryByCoords(
	q api.SysOverviewsQueryByCoords,
	_ dfapi.DFTableRequest,
	_ dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {
	overviews, err := u.repo.GetSystemsOnMap(components.StarSystemRepoMapRequest{
		Limit: q.Limit,
		Sector: world.GalacticSectorCoords{
			InnerR:     world.GalacticCoordsRadius(q.RMin),
			OuterR:     world.GalacticCoordsRadius(q.RMax),
			ThetaStart: geom.Radians(q.ThetaStart),
			ThetaEnd:   geom.Radians(q.ThetaEnd),
		},
	})
	if err != nil {
		return nil, err
	}

	result := dfcore.EmptyTableResponse()
	for _, overview := range overviews {
		result.Add(dfcore.EntityID(overview.ID), encodeSystemOverview(overview))
	}

	return result, nil
}

func encodeSystemOverview(overview world.StarSystemOverview) common.Encodable {
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
