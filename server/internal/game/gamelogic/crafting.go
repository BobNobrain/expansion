package gamelogic

import (
	"srv/internal/game"
	"srv/internal/globals/globaldata"
	"srv/internal/utils/phys/material"
)

type CraftingRecipeLogic struct {
	reg *globaldata.CraftingRegistry
}

var globalCraftingLogic *CraftingRecipeLogic

func CraftingLogic() *CraftingRecipeLogic {
	if globalCraftingLogic == nil {
		globalCraftingLogic = &CraftingRecipeLogic{
			reg: globaldata.Crafting(),
		}
	}

	return globalCraftingLogic
}

func (l *CraftingRecipeLogic) GetRecipesAt(worldData game.WorldData, tileID game.TileID) *RecipeLibrary {
	return &RecipeLibrary{
		reg:          l.reg,
		locationInfo: worldData.GetTileData(tileID),
	}
}

func (l *CraftingRecipeLogic) ConvertCompoundToResources(mc *material.MaterialCompound) []game.ResourceDeposit {
	const DEPOSIT_RESOURCE_SCALE = 10.0
	result := make([]game.ResourceDeposit, 0, mc.Len())

	for _, mat := range mc.ListMaterials() {
		resource := l.reg.GetResourceForMaterial(mat.GetID())
		if resource.CommodityID.IsNil() {
			continue
		}

		result = append(result, game.ResourceDeposit{
			ResourceID: resource.ResourceID,
			Abundance:  mc.GetPercentage(mat.GetID()) * DEPOSIT_RESOURCE_SCALE,
		})
	}

	return result
}

type RecipeLibrary struct {
	reg          *globaldata.CraftingRegistry
	locationInfo game.TileData
}

func (l *RecipeLibrary) CreateAllRecipesForEquipment(
	equipment game.EquipmentID,
) map[game.RecipeID]game.Recipe {
	result := make(map[game.RecipeID]game.Recipe)

	for _, rt := range l.reg.GetRecipesForEquipment(equipment) {
		if rt.HasDynamicOutputs() {
			l.instantiateDynamicRecipeTemplate(rt, result)
		} else {
			recipe := rt.Instantiate()
			result[recipe.RecipeID] = recipe
		}
	}

	return result
}

func (l *RecipeLibrary) CreateAllDynamicRecipes() map[game.RecipeID]game.Recipe {
	result := make(map[game.RecipeID]game.Recipe)

	for _, rt := range l.reg.GetDynamicRecipes() {
		l.instantiateDynamicRecipeTemplate(rt, result)
	}

	return result
}

func (l *RecipeLibrary) instantiateDynamicRecipeTemplate(
	template game.RecipeTemplate,
	into map[game.RecipeID]game.Recipe,
) {
	// TODO: put these numbers into config
	const ATMOSPHERE_RESOURCE_SCALE = 0.5
	const OCEAN_RESOURCE_SCALE = 1.5
	const SNOW_RESOURCE_SCALE = 1.0

	if template.AffectedByAtmosphere && !l.locationInfo.Composition.Atmosphere.IsEmpty() {
		const MAX_RESOURCE_PRESSURE_BAR = 3.0
		atmResourceScale := ATMOSPHERE_RESOURCE_SCALE
		if l.locationInfo.Pressure.Bar() < MAX_RESOURCE_PRESSURE_BAR {
			atmResourceScale = max(0.01, l.locationInfo.Pressure.Bar()/MAX_RESOURCE_PRESSURE_BAR)
		}

		l.addDynamicRecipes(
			template,
			CraftingLogic().ConvertCompoundToResources(l.locationInfo.Composition.Atmosphere),
			into,
			atmResourceScale,
		)
	}

	if template.AffectedByOcean && !l.locationInfo.Composition.Oceans.IsEmpty() {
		l.addDynamicRecipes(
			template,
			CraftingLogic().ConvertCompoundToResources(l.locationInfo.Composition.Oceans),
			into,
			OCEAN_RESOURCE_SCALE,
		)
	}

	if template.AffectedBySnow && !l.locationInfo.Composition.Snow.IsEmpty() {
		l.addDynamicRecipes(
			template,
			CraftingLogic().ConvertCompoundToResources(l.locationInfo.Composition.Snow),
			into,
			SNOW_RESOURCE_SCALE,
		)
	}

	if template.AffectedByResources {
		l.addDynamicRecipes(template, l.locationInfo.Resources, into, 1.0)
	}

	if template.AffectedByFertility {
		fertility := l.locationInfo.SoilFertility

		if fertility > 0.001 {
			recipe := template.InstantiateWithScaledOutputs(fertility)
			into[recipe.RecipeID] = recipe
		}
	}
}

func (l *RecipeLibrary) addDynamicRecipes(
	template game.RecipeTemplate,
	deps []game.ResourceDeposit,
	into map[game.RecipeID]game.Recipe,
	scale float64,
) {
	for _, deposit := range deps {
		cid := l.reg.GetResourceData(deposit.ResourceID).CommodityID
		if cid.IsNil() {
			continue
		}

		recipe := template.InstantiateWithDynamicOutput(cid, deposit.Abundance*scale)
		into[recipe.RecipeID] = recipe
	}
}
