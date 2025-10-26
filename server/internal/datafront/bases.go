package datafront

import (
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/game"
	"srv/internal/globals/events"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"srv/pkg/api"
	"srv/pkg/dfapi"
)

type basesTable struct {
	repo components.BasesRepoReadonly
	sub  *events.Subscription

	table       *dfcore.QueryableTable
	qByCompany  *dfcore.TrackableTableQuery[api.BasesQueryByCompanyID]
	qByBranch   *dfcore.TrackableTableQuery[api.BasesQueryByBranch]
	qByLocation *dfcore.TrackableTableQuery[api.BasesQueryByLocation]
}

func (gdf *GameDataFront) InitBases(repo components.BasesRepoReadonly) {
	if gdf.bases != nil {
		panic("GameDataFront.InitBases() has already been called!")
	}

	bases := &basesTable{
		repo: repo,
		sub:  events.NewSubscription(),
	}
	bases.table = dfcore.NewQueryableTable(bases.queryByIDs)
	bases.qByCompany = dfcore.NewTrackableTableQuery(bases.queryByCompanyID, bases.table)
	bases.qByBranch = dfcore.NewTrackableTableQuery(bases.queryByBranch, bases.table)
	bases.qByLocation = dfcore.NewTrackableTableQuery(bases.queryByLocation, bases.table)

	events.SubscribeTyped(bases.sub, events.BaseCreated, bases.onBaseCreated)

	gdf.bases = bases
	gdf.df.AttachTable("bases", bases.table)
	gdf.df.AttachTableQuery("bases/"+api.BasesQueryTypeByCompanyID, bases.qByCompany)
	gdf.df.AttachTableQuery("bases/"+api.BasesQueryTypeByBranch, bases.qByBranch)
	gdf.df.AttachTableQuery("bases/"+api.BasesQueryTypeByLocation, bases.qByLocation)
}

func (t *basesTable) dispose() {
	t.sub.UnsubscribeAll()
}

func (t *basesTable) queryByIDs(
	req dfapi.DFTableRequest,
	ctx dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {
	bases, err := t.repo.ResolveBases(utils.ParseInts[game.BaseID](req.IDs))
	if err != nil {
		return nil, err
	}

	return dfcore.NewTableResponseFromList(bases, identifyBase, encodeBase), nil
}

func (t *basesTable) queryByCompanyID(
	payload api.BasesQueryByCompanyID,
	req dfapi.DFTableQueryRequest,
	ctx dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {
	bases, err := t.repo.GetCompanyBases(game.CompanyID(payload.CompanyID))
	if err != nil {
		return nil, err
	}

	return dfcore.NewTableResponseFromList(bases, identifyBase, encodeBase), nil
}

func (t *basesTable) queryByBranch(
	payload api.BasesQueryByBranch,
	req dfapi.DFTableQueryRequest,
	ctx dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {
	bases, err := t.repo.GetCompanyBasesOnPlanet(game.CompanyID(payload.CompanyID), game.CelestialID(payload.WorldID))
	if err != nil {
		return nil, err
	}

	return dfcore.NewTableResponseFromList(bases, identifyBase, encodeBase), nil
}

func (t *basesTable) queryByLocation(
	payload api.BasesQueryByLocation,
	req dfapi.DFTableQueryRequest,
	ctx dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {
	base, err := t.repo.GetBaseAt(game.CelestialID(payload.WorldID), game.TileID(payload.TileID))
	if err != nil {
		return nil, err
	}

	return dfcore.NewTableResponseFromSingle(identifyBase(base), encodeBase(base)), nil
}

func (t *basesTable) onBaseCreated(ev events.BaseCreatedPayload) {
	t.qByCompany.PublishChangedNotification(api.BasesQueryByCompanyID{CompanyID: string(ev.Operator)})
	t.qByBranch.PublishChangedNotification(api.BasesQueryByBranch{WorldID: string(ev.WorldID)})
	t.qByLocation.PublishChangedNotification(api.BasesQueryByLocation{WorldID: string(ev.WorldID), TileID: int(ev.TileID)})
}

func identifyBase(b game.Base) dfcore.EntityID {
	return dfcore.EntityID(b.ID.String())
}

func encodeBase(b game.Base) common.Encodable {
	return common.AsEncodable(api.BasesTableRow{
		BaseID:    int(b.ID),
		WorldID:   string(b.WorldID),
		TileID:    int(b.TileID),
		CompanyID: string(b.Operator),
		CityID:    int(b.CityID),
		CreatedAt: b.Created,
	})
}
