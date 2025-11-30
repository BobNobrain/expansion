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

type factoriesTable struct {
	repo components.FactoriesRepoReadonly
	sub  *events.Subscription

	table     *dfcore.QueryableTable
	qByBaseID *dfcore.TrackableTableQuery[api.FactoriesQueryByBaseID]
}

func (gdf *GameDataFront) InitFactories(repo components.FactoriesRepoReadonly) {
	if gdf.factories != nil {
		panic("GameDataFront.InitFactories() has already been called!")
	}

	factories := &factoriesTable{
		repo: repo,
		sub:  events.NewSubscription(),
	}
	factories.table = dfcore.NewQueryableTable(factories.queryByIDs)
	factories.qByBaseID = dfcore.NewTrackableTableQuery(factories.queryByBaseID, factories.table)

	// events.SubscribeTyped(bases.sub, events.CityCreated, cities.onNewCityFounded)

	gdf.factories = factories
	gdf.df.AttachTable("factories", factories.table)
	gdf.df.AttachTableQuery("factories/"+api.FactoriesQueryTypeByBaseID, factories.qByBaseID)
}

func (t *factoriesTable) dispose() {
	t.sub.UnsubscribeAll()
}

func (t *factoriesTable) queryByIDs(
	req dfapi.DFTableRequest,
	ctx dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {
	factories, err := t.repo.ResolveFactories(utils.ParseInts[game.FactoryID](req.IDs))
	if err != nil {
		return nil, err
	}

	return dfcore.NewTableResponseFromList(factories, identifyFactory, encodeFactory), nil
}

func (t *factoriesTable) queryByBaseID(
	payload api.FactoriesQueryByBaseID,
	req dfapi.DFTableQueryRequest,
	ctx dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {
	factories, err := t.repo.GetBaseFactories(game.BaseID(payload.BaseID))
	if err != nil {
		return nil, err
	}

	return dfcore.NewTableResponseFromList(factories, identifyFactory, encodeFactory), nil
}

func identifyFactory(f game.Factory) dfcore.EntityID {
	return dfcore.EntityID(f.FactoryID.String())
}
func encodeFactory(f game.Factory) common.Encodable {
	return common.AsEncodable(api.FactoriesTableRow{
		FactoryID: int(f.FactoryID),
		BaseID:    int(f.BaseID),
		Status:    f.Status.String(),
		CreatedAt: f.BuiltAt,
		UpdatedTo: f.Updated,
		Inventory: f.Inventory.ToMap(),
		Employees: utils.MapKeys(f.Employees, func(wf game.WorkforceType) string { return wf.String() }),
		Equipment: utils.MapSlice(f.Equipment, encodeFactoryEquipment),
	})
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
