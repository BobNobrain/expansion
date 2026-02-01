package datafront

import (
	"context"
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/game/gamelogic"
	"srv/internal/globals/events"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"srv/pkg/api"
	"srv/pkg/dfapi"
)

type factoriesTable struct {
	storage components.GlobalReposReadonly
	sub     *events.Subscription

	table     *dfcore.QueryableTable
	qByBaseID *dfcore.TrackableTableQuery[api.FactoriesQueryByBaseID]
}

func (gdf *GameDataFront) InitFactories(storage components.GlobalReposReadonly) {
	if gdf.factories != nil {
		panic("GameDataFront.InitFactories() has already been called!")
	}

	factories := &factoriesTable{
		storage: storage,
		sub:     events.NewSubscription(),
	}
	factories.table = dfcore.NewQueryableTable(factories.queryByIDs)
	factories.qByBaseID = dfcore.NewTrackableTableQuery(factories.queryByBaseID, factories.table)

	events.SubscribeTyped(factories.sub, events.FactoryCreated, factories.onFactoryCreated)
	events.SubscribeTyped(factories.sub, events.FactoryUpdated, factories.onFactoryUpdated)
	events.SubscribeTyped(factories.sub, events.FactoryRemoved, factories.onFactoryRemoved)

	gdf.factories = factories
	gdf.df.AttachTable(api.FactoriesTableName, factories.table)
	gdf.df.AttachTableQuery(api.FactoriesQueryTypeByBaseID, factories.qByBaseID)
}

func (t *factoriesTable) dispose() {
	t.sub.UnsubscribeAll()
}

func (t *factoriesTable) queryByIDs(
	req dfapi.DFTableRequest,
	ctx domain.RequestContext,
) (domain.EntityCollection, common.Error) {
	tx, err := t.storage.StartTransaction(context.TODO())
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	repo := tx.Factories()

	factories, err := repo.ResolveFactories(utils.ParseInts[game.FactoryID](req.IDs), gamelogic.FactoryUpdates())
	if err != nil {
		return nil, err
	}

	return t.MakeCollection().AddList(factories), tx.Commit()
}

func (t *factoriesTable) queryByBaseID(
	payload api.FactoriesQueryByBaseID,
	req dfapi.DFTableQueryRequest,
	ctx domain.RequestContext,
) (domain.EntityCollection, common.Error) {
	tx, err := t.storage.StartTransaction(context.TODO())
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	repo := tx.Factories()

	factories, err := repo.GetBaseFactories(game.BaseID(payload.BaseID), gamelogic.FactoryUpdates())
	if err != nil {
		return nil, err
	}

	return t.MakeCollection().AddList(factories), tx.Commit()
}

func (t *factoriesTable) onFactoryCreated(ev events.FactoryCreatedPayload) {
	t.qByBaseID.PublishChangedNotification(api.FactoriesQueryByBaseID{BaseID: int(ev.BaseID)})
}
func (t *factoriesTable) onFactoryRemoved(ev events.FactoryRemovedPayload) {
	t.qByBaseID.PublishChangedNotification(api.FactoriesQueryByBaseID{BaseID: int(ev.BaseID)})
	t.table.UnpublishEntities([]domain.EntityID{domain.EntityID(ev.FactoryID.String())})
}
func (t *factoriesTable) onFactoryUpdated(ev events.FactoryUpdatedPayload) {
	t.table.PublishEntities(t.MakeCollection().Add(ev.Factory))
}

func (t *factoriesTable) IdentifyEntity(f game.Factory) domain.EntityID {
	return domain.EntityID(f.FactoryID.String())
}
func (t *factoriesTable) EncodeEntity(f game.Factory) common.Encodable {
	return common.AsEncodable(api.FactoriesTableRow{
		FactoryID: int(f.FactoryID),
		BaseID:    int(f.BaseID),
		Status:    f.Production.Status().String(),
		CreatedAt: f.BuiltAt,
		Name:      f.Name,

		UpdatedTo: f.Production.Start(),
		Employees: utils.MapKeys(f.Employees, func(wf game.WorkforceType) string { return wf.String() }),
		Equipment: utils.MapSlice(utils.UnNilSlice(f.Equipment), encodeFactoryEquipment),
		Inventory: utils.MapValues(f.Production.GetDynamicInventory().ToMap(), encodePredictable),

		UpgradeTarget: utils.MapSlice(utils.UnNilSlice(f.Upgrade.Equipment), func(eqPlan game.FactoryUpgradeProjectEqipment) api.FactoriesTableRowEquipmentPlan {
			return api.FactoriesTableRowEquipmentPlan{
				EquipmentID: string(eqPlan.EquipmentID),
				Count:       eqPlan.Count,
				Production: utils.MapSlice(utils.UnNilSlice(eqPlan.Production), func(prodPlan game.FactoryProductionPlan) api.FactoriesTableRowProductionPlan {
					return api.FactoriesTableRowProductionPlan{
						RecipeID:         string(prodPlan.RecipeID),
						ManualEfficiency: prodPlan.ManualEfficiency,
					}
				}),
			}
		}),
		UpgradeContribution: encodeContribution(gamelogic.FactoryUpgrade().GetConstructionCosts(f.Upgrade)),
		UpgradeLastUpdated:  f.Upgrade.LastUpdated,
	})
}
func (t *factoriesTable) ViewFor(f game.Factory, req domain.RequestContext) *game.Factory {
	if f.OwnerID != req.UserID {
		return nil
	}

	return &f
}
func (t *factoriesTable) MakeCollection() domain.EntityCollectionBuilder[game.Factory] {
	return domain.MakeUnorderedEntityCollection(t, t)
}

func encodeFactoryEquipment(eq game.FactoryEquipment) api.FactoriesTableRowEquipment {
	production := make([]api.FactoriesTableRowProductionItem, 0, len(eq.Production))
	for _, p := range eq.Production {
		production = append(production, api.FactoriesTableRowProductionItem{
			RecipeID:         string(p.Recipe.RecipeID),
			Inputs:           utils.ConvertStringKeys[game.CommodityID, string](p.Recipe.Inputs),
			Outputs:          utils.ConvertStringKeys[game.CommodityID, string](p.Recipe.Outputs),
			ManualEfficiency: p.ManualEfficiency,
		})
	}

	return api.FactoriesTableRowEquipment{
		EquipmentID: string(eq.EquipmentID),
		Count:       eq.Count,
		Production:  production,
	}
}
