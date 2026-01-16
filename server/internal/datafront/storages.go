package datafront

import (
	"context"
	"fmt"
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/game"
	"srv/internal/game/gamelogic"
	"srv/internal/globals/events"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"srv/pkg/api"
	"srv/pkg/dfapi"
)

type storagesTable struct {
	storage components.GlobalReposReadonly
	sub     *events.Subscription

	table          *dfcore.QueryableTable
	qAllNeighbours *dfcore.TrackableTableQuery[api.StoragesQueryAllNeighbours]
}

// TODO: this is not used yet
func (gdf *GameDataFront) InitStorages(storage components.GlobalReposReadonly) {
	if gdf.storages != nil {
		panic("GameDataFront.InitStorages() has already been called!")
	}

	storages := &storagesTable{
		storage: storage,
		sub:     events.NewSubscription(),
	}
	storages.table = dfcore.NewQueryableTable(storages.queryByIDs)
	storages.qAllNeighbours = dfcore.NewTrackableTableQuery(storages.queryNeighbours, storages.table)

	// events.SubscribeTyped(storages.sub, events.FactoryCreated, storages.onFactoryCreated)
	// events.SubscribeTyped(storages.sub, events.FactoryUpdated, storages.onFactoryUpdated)
	// events.SubscribeTyped(storages.sub, events.FactoryRemoved, storages.onFactoryRemoved)

	gdf.storages = storages
	gdf.df.AttachTable(api.StoragesTableName, storages.table)
	gdf.df.AttachTableQuery(api.FactoriesQueryTypeByBaseID, storages.qAllNeighbours)
}

func (t *storagesTable) dispose() {
	t.sub.UnsubscribeAll()
}

func (t *storagesTable) resolveIds(ids []game.StorageID, tx components.GlobalReposTx) ([]game.Storage, common.Error) {
	baseIds := make([]game.BaseID, 0)
	factoryIds := make([]game.FactoryID, 0)
	for _, storageId := range ids {
		if storageId.IsBase() {
			baseIds = append(baseIds, storageId.GetBaseID())
		} else if storageId.IsFactory() {
			factoryIds = append(factoryIds, storageId.GetFactoryID())
		}
	}

	storages := make([]game.Storage, 0, len(factoryIds)+len(baseIds))

	if len(baseIds) > 0 {
		bases, err := tx.Bases().ResolveBases(baseIds)
		if err != nil {
			return nil, err
		}

		for _, base := range bases {
			basePtr := &base
			storages = append(storages, basePtr.AsStorage())
		}
	}
	if len(factoryIds) > 0 {
		factories, err := tx.Factories().ResolveFactories(factoryIds, gamelogic.FactoryUpdates())
		if err != nil {
			return nil, err
		}

		for _, factory := range factories {
			factoryPtr := &factory
			storages = append(storages, factoryPtr.AsStorage())
		}
	}

	return storages, nil
}

func (t *storagesTable) queryByIDs(
	req dfapi.DFTableRequest,
	ctx dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {
	tx, err := t.storage.StartTransaction(context.TODO())
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	storageIds := make([]game.StorageID, 0, len(req.IDs))
	for index, id := range req.IDs {
		storageId, err := game.ParseStorageID(id)
		if err != nil {
			return nil, common.NewValidationError(
				fmt.Sprintf("StoragesQuery.IDs[%d]", index),
				"Invalid storage id",
				common.WithDetail("value", id),
			)
		}

		storageIds = append(storageIds, storageId)
	}

	storages, err := t.resolveIds(storageIds, tx)
	if err != nil {
		return nil, err
	}

	return dfcore.NewTableResponseFromList(storages, identifyStorage, encodeStorage), tx.Commit()
}

func (t *storagesTable) queryNeighbours(
	payload api.StoragesQueryAllNeighbours,
	req dfapi.DFTableQueryRequest,
	ctx dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {
	tx, err := t.storage.StartTransaction(context.TODO())
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	storageId, err := game.ParseStorageID(payload.StorageID)
	if err != nil {
		return nil, common.NewValidationError(
			"StoragesQueryAllNeighbours.StorageID",
			"Invalid storage id",
			common.WithDetail("value", payload.StorageID),
		)
	}

	storages, err := t.resolveIds([]game.StorageID{storageId}, tx)
	if err != nil {
		return nil, err
	}

	return dfcore.NewTableResponseFromList(storages, identifyStorage, encodeStorage), tx.Commit()
}

// func (t *storagesTable) onFactoryCreated(ev events.FactoryCreatedPayload) {
// 	t.qAllNeighbours.PublishChangedNotification(api.FactoriesQueryByBaseID{BaseID: int(ev.BaseID)})
// }
// func (t *storagesTable) onFactoryRemoved(ev events.FactoryRemovedPayload) {
// 	t.qAllNeighbours.PublishChangedNotification(api.FactoriesQueryByBaseID{BaseID: int(ev.BaseID)})
// }
// func (t *storagesTable) onFactoryUpdated(ev events.FactoryUpdatedPayload) {
// 	t.table.PublishEntities(
// 		dfcore.NewTableResponseFromSingle(
// 			identifyFactory(ev.Factory),
// 			encodeFactory(ev.Factory),
// 		),
// 	)
// }

func identifyStorage(s game.Storage) dfcore.EntityID {
	return dfcore.EntityID(s.GetStorageID())
}
func encodeStorage(s game.Storage) common.Encodable {
	return common.AsEncodable(api.StoragesTableRow{
		StorageID:      string(s.GetStorageID()),
		Name:           s.GetName(),
		StaticContent:  s.GetInventoryRef().ToMap(),
		DynamicContent: utils.MapValues(s.GetDynamicInventoryCopy().ToMap(), encodePredictable),
		SizeLimit: api.StorageSize{
			MassT:    s.GetSizeLimit().GetMass().Kilograms(),
			VolumeM3: s.GetSizeLimit().GetVolume().CubicMeters(),
		},
	})
}
