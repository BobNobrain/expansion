package datafront

import (
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/globals/events"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"srv/pkg/api"
	"srv/pkg/dfapi"
)

type baseOverviewsTable struct {
	basesRepo components.BasesRepoReadonly
	sub       *events.Subscription

	table      *dfcore.QueryableTable
	qByCompany *dfcore.TrackableTableQuery[api.BaseOverviewsQueryByCompanyID]
	qByBranch  *dfcore.TrackableTableQuery[api.BaseOverviewsQueryByBranch]
}

func (gdf *GameDataFront) InitBaseOverviews(repo components.BasesRepoReadonly) {
	if gdf.baseOverviews != nil {
		panic("GameDataFront.InitBaseOverviews() has already been called!")
	}

	baseOverviews := &baseOverviewsTable{
		basesRepo: repo,
		sub:       events.NewSubscription(),
	}
	baseOverviews.table = dfcore.NewQueryableTable(baseOverviews.queryByIDs)
	baseOverviews.qByCompany = dfcore.NewTrackableTableQuery(baseOverviews.queryByCompanyID, baseOverviews.table)
	baseOverviews.qByBranch = dfcore.NewTrackableTableQuery(baseOverviews.queryByBranch, baseOverviews.table)

	events.SubscribeTyped(baseOverviews.sub, events.BaseCreated, baseOverviews.onBaseCreated)
	events.SubscribeTyped(baseOverviews.sub, events.FactoryCreated, baseOverviews.onFactoryCreated)
	events.SubscribeTyped(baseOverviews.sub, events.FactoryRemoved, baseOverviews.onFactoryRemoved)

	gdf.baseOverviews = baseOverviews
	gdf.df.AttachTable(api.BaseOverviewsTableName, baseOverviews.table)
	gdf.df.AttachTableQuery(api.BaseOverviewsQueryTypeByCompanyID, baseOverviews.qByCompany)
	gdf.df.AttachTableQuery(api.BaseOverviewsQueryTypeByBranch, baseOverviews.qByBranch)
}

func (t *baseOverviewsTable) dispose() {
	t.sub.UnsubscribeAll()
}

func (t *baseOverviewsTable) queryByIDs(
	req dfapi.DFTableRequest,
	ctx domain.RequestContext,
) (domain.EntityCollection, common.Error) {
	overviews, err := t.basesRepo.ResolveOverviews(utils.ParseInts[game.BaseID](req.IDs))
	if err != nil {
		return nil, err
	}

	return t.MakeCollection().AddList(overviews), nil
}

func (t *baseOverviewsTable) queryByCompanyID(
	payload api.BaseOverviewsQueryByCompanyID,
	req dfapi.DFTableQueryRequest,
	ctx domain.RequestContext,
) (domain.EntityCollection, common.Error) {
	bases, err := t.basesRepo.GetCompanyBases(game.CompanyID(payload.CompanyID))
	if err != nil {
		return nil, err
	}

	return t.MakeCollection().AddList(bases), nil
}

func (t *baseOverviewsTable) queryByBranch(
	payload api.BaseOverviewsQueryByBranch,
	req dfapi.DFTableQueryRequest,
	ctx domain.RequestContext,
) (domain.EntityCollection, common.Error) {
	bases, err := t.basesRepo.GetCompanyBasesOnPlanet(
		game.CompanyID(payload.CompanyID),
		game.CelestialID(payload.WorldID),
	)

	if err != nil {
		return nil, err
	}

	return t.MakeCollection().AddList(bases), nil
}

func (t *baseOverviewsTable) onBaseCreated(ev events.BaseCreatedPayload) {
	t.qByCompany.PublishChangedNotification(api.BaseOverviewsQueryByCompanyID{CompanyID: string(ev.Operator)})
	t.qByBranch.PublishChangedNotification(api.BaseOverviewsQueryByBranch{WorldID: string(ev.WorldID)})
}
func (t *baseOverviewsTable) onFactoryCreated(ev events.FactoryCreatedPayload) {
	t.fetchAndPublishOverview(ev.BaseID)
}
func (t *baseOverviewsTable) onFactoryRemoved(ev events.FactoryRemovedPayload) {
	t.fetchAndPublishOverview(ev.BaseID)
}

func (t *baseOverviewsTable) fetchAndPublishOverview(id game.BaseID) {
	overviews, err := t.basesRepo.ResolveOverviews([]game.BaseID{id})
	if err != nil || len(overviews) < 1 {
		return
	}

	t.table.PublishEntities(t.MakeCollection().AddList(overviews))
}

func (t *baseOverviewsTable) IdentifyEntity(b game.BaseOverview) domain.EntityID {
	return domain.EntityID(b.ID.String())
}
func (t *baseOverviewsTable) EncodeEntity(b game.BaseOverview) common.Encodable {
	row := api.BaseOverviewsTableRow{
		BaseID:    int(b.ID),
		WorldID:   string(b.WorldID),
		TileID:    int(b.TileID),
		CompanyID: string(b.Operator),
		CityID:    int(b.CityID),
		CreatedAt: b.Created,
	}

	if b.PrivateInfo != nil {
		row.PrivateInfo = &api.BaseOverviewsTableRowPrivateInfo{
			Name:       b.PrivateInfo.Name,
			NFactories: b.PrivateInfo.NFactories,
		}
	}

	return common.AsEncodable(row)
}
func (t *baseOverviewsTable) ViewFor(b game.BaseOverview, req domain.RequestContext) *game.BaseOverview {
	return b.ViewFor(req.UserID)
}
func (t *baseOverviewsTable) MakeCollection() domain.EntityCollectionBuilder[game.BaseOverview] {
	return domain.MakeUnorderedEntityCollection(t, t)
}
