package datafront

import (
	"fmt"
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/game/gamelogic"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"srv/pkg/api"
	"srv/pkg/dfapi"
)

type baseEnvsTable struct {
	factoriesRepo components.FactoriesRepoReadonly
	basesRepo     components.BasesRepoReadonly
	worldsRepo    components.WorldsRepoReadonly

	table        *dfcore.QueryableTable
	qByFactoryID *dfcore.TrackableTableQuery[api.BaseEnvsQueryByFactoryID]
}

func (gdf *GameDataFront) InitBaseEnvs(
	factories components.FactoriesRepoReadonly,
	bases components.BasesRepoReadonly,
	worlds components.WorldsRepoReadonly,
) {
	if gdf.baseEnvs != nil {
		panic("GameDataFront.InitBaseEnvs() has already been called!")
	}

	baseEnvs := &baseEnvsTable{
		factoriesRepo: factories,
		basesRepo:     bases,
		worldsRepo:    worlds,
	}

	baseEnvs.table = dfcore.NewQueryableTable(baseEnvs.queryByIDs)
	baseEnvs.qByFactoryID = dfcore.NewTrackableTableQuery(baseEnvs.queryByFactoryID, baseEnvs.table)

	gdf.baseEnvs = baseEnvs
	gdf.df.AttachTable(api.BaseEnvsTableName, baseEnvs.table)
	gdf.df.AttachTableQuery(api.BaseEnvsQueryTypeByFactoryID, baseEnvs.qByFactoryID)
}

func (t *baseEnvsTable) dispose() {
	// nothing to dispose of
}

func (t *baseEnvsTable) queryByIDs(
	req dfapi.DFTableRequest,
	ctx domain.RequestContext,
) (domain.EntityCollection, common.Error) {
	ids := make([]game.GalacticTileID, 0, len(req.IDs))
	worldIdsToQuery := make(map[game.CelestialID]bool)

	for index, id := range req.IDs {
		gid := game.GalacticTileID(id)
		if gid.GetWorldID().IsNone() || !gid.GetTileID().IsValid() {
			return nil, common.NewValidationError(
				fmt.Sprintf("BaseEnvsQuery.IDs[%d]", index),
				"Invalid galactic tile id",
				common.WithDetail("value", id),
			)
		}

		wid := gid.GetWorldID()
		worldIdsToQuery[wid] = true

		ids = append(ids, gid)
	}

	return t.resolveGalacticTileIDs(ids)
}

func (t *baseEnvsTable) queryByFactoryID(
	payload api.BaseEnvsQueryByFactoryID,
	req dfapi.DFTableQueryRequest,
	ctx domain.RequestContext,
) (domain.EntityCollection, common.Error) {
	overviews, err := t.factoriesRepo.ResolveFactoryOverviews([]game.FactoryID{game.FactoryID(payload.FactoryID)})
	if err != nil {
		return nil, err
	}

	if len(overviews) == 0 {
		return nil, common.NewValidationError(
			"BaseEnvsQueryByFactoryID.FactoryID",
			"Specified factory does not exist",
			common.WithDetail("value", payload.FactoryID),
		)
	}

	ids := make([]game.GalacticTileID, 0, len(overviews))
	for _, overview := range overviews {
		ids = append(ids, game.MakeGalacticTileID(overview.WorldID, overview.TileID))
	}

	return t.resolveGalacticTileIDs(ids)
}

func (t *baseEnvsTable) resolveGalacticTileIDs(ids []game.GalacticTileID) (domain.EntityCollection, common.Error) {
	worldIdsToQuery := make(map[game.CelestialID]bool)
	for _, id := range ids {
		worldIdsToQuery[id.GetWorldID()] = true
	}

	worlds, err := t.worldsRepo.GetDataMany(utils.GetMapKeys(worldIdsToQuery))
	if err != nil {
		return nil, err
	}

	worldsById := make(map[game.CelestialID]game.WorldData)
	for _, w := range worlds {
		worldsById[w.ID] = w
	}

	result := t.MakeCollection()

	for _, id := range ids {
		world := worldsById[id.GetWorldID()]
		tileID := id.GetTileID()

		crafting := gamelogic.CraftingLogic()
		recipes := crafting.GetRecipesAt(world, tileID).CreateAllDynamicRecipes()
		tileData := world.GetTileData(tileID)

		encoded := api.BaseEnvsTableRow{
			Recipes:       make([]api.BaseEnvsTableRowRecipe, 0, len(recipes)),
			TileFertility: tileData.SoilFertility,
			Resources:     utils.MapSlice(tileData.Resources, encodeResourceDeposit),
			Snow: utils.MapSlice(
				crafting.ConvertCompoundToResources(tileData.Composition.Snow),
				encodeResourceDeposit,
			),
			Ocean: utils.MapSlice(
				crafting.ConvertCompoundToResources(tileData.Composition.Oceans),
				encodeResourceDeposit,
			),
			Atmosphere: utils.MapSlice(
				crafting.ConvertCompoundToResources(tileData.Composition.Atmosphere),
				encodeResourceDeposit,
			),
		}

		for _, r := range recipes {
			encoded.Recipes = append(encoded.Recipes, api.BaseEnvsTableRowRecipe{
				RecipeID:    string(r.RecipeID),
				EquipmentID: string(r.EquipmentID),
				Inputs:      utils.ConvertStringKeys[game.CommodityID, string](r.Inputs),
				Outputs:     utils.ConvertStringKeys[game.CommodityID, string](r.Outputs),
			})
		}

		result.Add(baseEnvsEntity{
			id:  domain.EntityID(id.String()),
			row: encoded,
		})
	}

	return result, nil
}

func (t *baseEnvsTable) IdentifyEntity(e baseEnvsEntity) domain.EntityID {
	return e.id
}
func (t *baseEnvsTable) EncodeEntity(e baseEnvsEntity) common.Encodable {
	return e
}
func (t *baseEnvsTable) MakeCollection() domain.EntityCollectionBuilder[baseEnvsEntity] {
	return domain.MakeUnorderedEntityCollection(t, nil)
}

type baseEnvsEntity struct {
	id  domain.EntityID
	row api.BaseEnvsTableRow
}

func (e baseEnvsEntity) Encode() any {
	return e.row
}

func encodeResourceDeposit(deposit game.ResourceDeposit) api.WorldsTableRowResourceDeposit {
	return api.WorldsTableRowResourceDeposit{
		ResourceID: string(deposit.ResourceID),
		Abundance:  deposit.Abundance,
	}
}
