package globaldata

import "srv/internal/globals/assets"

var globalMaterialsRegistry *MaterialRegistry
var globalCraftingRegistry *CraftingRegistry

func Init() {
	globalMaterialsRegistry = newMaterialRegistry()
	allMats, err := assets.LoadWGMaterials()
	if err != nil {
		panic(err)
	}
	globalMaterialsRegistry.fill(allMats)

	globalCraftingRegistry = newCraftingRegistry()
	craftingData, err := assets.LoadCommodities()
	if err != nil {
		panic(err)
	}
	globalCraftingRegistry.FillCommodities(craftingData)

	equipmentData, err := assets.LoadEquipment()
	if err != nil {
		panic(err)
	}
	globalCraftingRegistry.FillEquipment(equipmentData)

	recipesData, err := assets.LoadRecipes()
	if err != nil {
		panic(err)
	}
	globalCraftingRegistry.FillRecipes(recipesData)
}

func Materials() *MaterialRegistry {
	return globalMaterialsRegistry
}

func Crafting() *CraftingRegistry {
	return globalCraftingRegistry
}
