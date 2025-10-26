package gamelogic

import (
	"srv/internal/game"
	"srv/internal/globals/globaldata"
	"srv/internal/utils/common"
	"srv/internal/utils/phys/material"
)

type CraftingRecipeLogic struct {
	reg *globaldata.CraftingRegistry

	hasLocation   bool
	soilFertility float64
	resources     []game.ResourceDeposit
	atmosphere    *material.MaterialCompound
	oceans        *material.MaterialCompound
	snow          *material.MaterialCompound
}

func NewCraftingRecipeLogic() *CraftingRecipeLogic {
	return &CraftingRecipeLogic{
		reg: globaldata.Crafting(),
	}
}

func (l *CraftingRecipeLogic) WithLocation(worldData game.WorldData, tileID game.TileID) *CraftingRecipeLogic {
	l.hasLocation = true

	l.resources = worldData.TileResources[tileID]
	l.atmosphere = worldData.Composition.Atmosphere
	l.oceans = worldData.Composition.Oceans
	l.snow = worldData.Composition.Snow

	l.soilFertility = -1
	if len(worldData.FertileTiles) != 0 {
		l.soilFertility = worldData.FertileTiles[tileID].SoilFertility
	}

	return l
}

func (l *CraftingRecipeLogic) GetPossibleProductionItems(eid game.EquipmentID) []game.FactoryProductionItem {
	recipes := l.reg.GetRecipesForEquipment(eid)
	result := make([]game.FactoryProductionItem, 0)

	for _, recipe := range recipes {
		if !recipe.HasDynamicOutputs() || !l.hasLocation {
			result = append(result, recipe.GetProductionItemBase())
			continue
		}

		if recipe.AffectedByResources {
			for _, deposit := range l.resources {
				cid := l.reg.GetResourceData(deposit.ResourceID).CommodityID
				item := recipe.GetProductionItemBase()
				item.DynamicOutputs = map[game.CommodityID]float64{cid: deposit.Abundance}
				result = append(result, item)
			}
		}

		compounds := make([]*material.MaterialCompound, 0, 3)
		if recipe.AffectedByAtmosphere {
			compounds = append(compounds, l.atmosphere)
		}
		if recipe.AffectedByOcean {
			compounds = append(compounds, l.oceans)
		}
		if recipe.AffectedBySnow {
			compounds = append(compounds, l.snow)
		}

		for _, compound := range compounds {
			for _, mat := range compound.ListMaterials() {
				cid := l.reg.GetResourceForMaterial(mat.GetID()).CommodityID

				item := recipe.GetProductionItemBase()
				item.DynamicOutputs = map[game.CommodityID]float64{cid: compound.GetPercentage(mat.GetID())}
				result = append(result, item)
			}
		}

		if recipe.AffectedByFertility && l.soilFertility > 0 {
			item := recipe.GetProductionItemBase()
			item.DynamicOutputs = make(map[game.CommodityID]float64)

			for cid, amt := range recipe.StaticOutputs {
				item.DynamicOutputs[cid] = amt * l.soilFertility
			}

			result = append(result, item)
		}
	}

	return result
}

func (l *CraftingRecipeLogic) GetProductionItem(rid game.RecipeID, cid game.CommodityID) (game.FactoryProductionItem, common.Error) {
	recipe := l.reg.GetRecipe(rid)

	if recipe.HasDynamicOutputs() && !l.hasLocation {
		panic("need to provide location to get actual recipe outputs")
	}

	panic("not implemented")
}
