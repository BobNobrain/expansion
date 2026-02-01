package datafront

import (
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/globals/events"
	"srv/internal/globals/logger"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"srv/pkg/api"
	"srv/pkg/dfapi"
)

type basesTable struct {
	basesRepo  components.BasesRepoReadonly
	worldsRepo components.WorldsRepoReadonly
	sub        *events.Subscription

	table       *dfcore.QueryableTable
	qByLocation *dfcore.TrackableTableQuery[api.BasesQueryByLocation]
}

func (gdf *GameDataFront) InitBases(repo components.BasesRepoReadonly, worlds components.WorldsRepoReadonly) {
	if gdf.bases != nil {
		panic("GameDataFront.InitBases() has already been called!")
	}

	bases := &basesTable{
		basesRepo:  repo,
		worldsRepo: worlds,
		sub:        events.NewSubscription(),
	}
	bases.table = dfcore.NewQueryableTable(bases.queryByIDs)
	bases.qByLocation = dfcore.NewTrackableTableQuery(bases.queryByLocation, bases.table)

	events.SubscribeTyped(bases.sub, events.BaseCreated, bases.onBaseCreated)
	events.SubscribeTyped(bases.sub, events.BaseUpdated, bases.onBaseUpdated)

	gdf.bases = bases
	gdf.df.AttachTable(api.BasesTableName, bases.table)
	gdf.df.AttachTableQuery(api.BasesQueryTypeByLocation, bases.qByLocation)
}

func (t *basesTable) dispose() {
	t.sub.UnsubscribeAll()
}

func (t *basesTable) queryByIDs(
	req dfapi.DFTableRequest,
	ctx domain.RequestContext,
) (domain.EntityCollection, common.Error) {
	bases, err := t.basesRepo.ResolveBases(utils.ParseInts[game.BaseID](req.IDs))
	if err != nil {
		return nil, err
	}

	worldIdsToQuery := make(map[game.CelestialID]bool)
	for _, base := range bases {
		worldIdsToQuery[base.WorldID] = true
	}

	worlds, err := t.worldsRepo.GetDataMany(utils.GetMapKeys(worldIdsToQuery))
	if err != nil {
		return nil, err
	}

	worldsById := make(map[game.CelestialID]game.WorldData)
	for _, w := range worlds {
		worldsById[w.ID] = w
	}

	return t.MakeCollection().AddList(bases), nil
}

func (t *basesTable) queryByLocation(
	payload api.BasesQueryByLocation,
	req dfapi.DFTableQueryRequest,
	ctx domain.RequestContext,
) (domain.EntityCollection, common.Error) {
	base, err := t.basesRepo.GetBaseAt(game.CelestialID(payload.WorldID), game.TileID(payload.TileID))
	if err != nil {
		return nil, err
	}

	if base == nil {
		return t.MakeCollection(), nil
	}

	return t.MakeCollection().Add(*base), nil
}

func (t *basesTable) onBaseCreated(ev events.BaseCreatedPayload) {
	t.qByLocation.PublishChangedNotification(api.BasesQueryByLocation{WorldID: string(ev.WorldID), TileID: int(ev.TileID)})
}
func (t *basesTable) onBaseUpdated(ev events.BaseUpdatedPayload) {
	var base game.Base
	if ev.Base != nil {
		base = *ev.Base
	} else {
		basePtr, err := t.basesRepo.GetBase(ev.BaseID)

		if err != nil {
			logger.Error(logger.FromError("DF/bases.onBaseUpdated", err))
			return
		}

		if basePtr == nil {
			logger.Error(logger.FromMessage("DF/bases.onBaseUpdated", "specified base not found").WithDetail("baseId", ev.BaseID))
			return
		}

		base = *basePtr
	}

	t.table.PublishEntities(t.MakeCollection().Add(base))
}

func (t *basesTable) IdentifyEntity(b game.Base) domain.EntityID {
	return domain.EntityID(b.ID.String())
}
func (t *basesTable) EncodeEntity(b game.Base) common.Encodable {
	return common.AsEncodable(api.BasesTableRow{
		BaseID:    int(b.ID),
		WorldID:   string(b.WorldID),
		TileID:    int(b.TileID),
		CompanyID: string(b.Operator),
		CityID:    int(b.CityID),
		CreatedAt: b.Created,
		Name:      b.Name,
		Storage: api.BasesTableRowStorage{
			Inventory: b.Inventory.ToMap(),
		},
	})
}
func (t *basesTable) ViewFor(b game.Base, req domain.RequestContext) *game.Base {
	if b.OwnerID != req.UserID {
		return nil
	}
	return &b
}
func (t *basesTable) MakeCollection() domain.EntityCollectionBuilder[game.Base] {
	return domain.MakeUnorderedEntityCollection(t, t)
}
