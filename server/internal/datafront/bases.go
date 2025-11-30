package datafront

import (
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/game"
	"srv/internal/game/gamelogic"
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
	qByCompany  *dfcore.TrackableTableQuery[api.BasesQueryByCompanyID]
	qByBranch   *dfcore.TrackableTableQuery[api.BasesQueryByBranch]
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
	bases.qByCompany = dfcore.NewTrackableTableQuery(bases.queryByCompanyID, bases.table)
	bases.qByBranch = dfcore.NewTrackableTableQuery(bases.queryByBranch, bases.table)
	bases.qByLocation = dfcore.NewTrackableTableQuery(bases.queryByLocation, bases.table)

	events.SubscribeTyped(bases.sub, events.BaseCreated, bases.onBaseCreated)
	events.SubscribeTyped(bases.sub, events.BaseUpdated, bases.onBaseUpdated)

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

	return dfcore.NewTableResponseFromList(bases, identifyBase, func(b game.Base) common.Encodable {
		dr := gamelogic.CraftingLogic().GetRecipesAt(worldsById[b.WorldID], b.TileID).CreateAllDynamicRecipes()

		return encodeBaseWithRecipes(b, dr)
	}), nil
}

func (t *basesTable) queryByCompanyID(
	payload api.BasesQueryByCompanyID,
	req dfapi.DFTableQueryRequest,
	ctx dfcore.DFRequestContext,
) (*dfcore.TableResponse, common.Error) {
	bases, err := t.basesRepo.GetCompanyBases(game.CompanyID(payload.CompanyID))
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
	bases, err := t.basesRepo.GetCompanyBasesOnPlanet(game.CompanyID(payload.CompanyID), game.CelestialID(payload.WorldID))
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
	base, err := t.basesRepo.GetBaseAt(game.CelestialID(payload.WorldID), game.TileID(payload.TileID))
	if err != nil {
		return nil, err
	}

	if base == nil {
		return dfcore.NewTableResponse(), nil
	}

	return dfcore.NewTableResponseFromSingle(identifyBase(*base), encodeBase(*base)), nil
}

func (t *basesTable) onBaseCreated(ev events.BaseCreatedPayload) {
	t.qByCompany.PublishChangedNotification(api.BasesQueryByCompanyID{CompanyID: string(ev.Operator)})
	t.qByBranch.PublishChangedNotification(api.BasesQueryByBranch{WorldID: string(ev.WorldID)})
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

	t.table.PublishEntities(dfcore.NewTableResponseFromSingle(
		identifyBase(base),
		encodeBase(base),
	))
}

func identifyBase(b game.Base) dfcore.EntityID {
	return dfcore.EntityID(b.ID.String())
}

func baseToApi(b game.Base) api.BasesTableRow {
	return api.BasesTableRow{
		BaseID:    int(b.ID),
		WorldID:   string(b.WorldID),
		TileID:    int(b.TileID),
		CompanyID: string(b.Operator),
		CityID:    int(b.CityID),
		CreatedAt: b.Created,
		Storage: api.BasesTableRowStorage{
			Inventory: b.Inventory.ToMap(),
		},
	}
}

func encodeBase(b game.Base) common.Encodable {
	return common.AsEncodable(baseToApi(b))
}

func encodeBaseWithRecipes(b game.Base, drs map[game.RecipeID]game.Recipe) common.Encodable {
	data := baseToApi(b)

	for _, r := range drs {
		data.DynamicRecipes = append(data.DynamicRecipes, api.BasesTableRowRecipe{
			RecipeID:    string(r.RecipeID),
			Inputs:      utils.ConvertStringKeys[game.CommodityID, string](r.Inputs),
			Outputs:     utils.ConvertStringKeys[game.CommodityID, string](r.Outputs),
			EquipmentID: string(r.EquipmentID),
		})
	}

	return common.AsEncodable(data)
}
