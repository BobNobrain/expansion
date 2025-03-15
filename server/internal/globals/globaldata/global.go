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
	globalCraftingRegistry.fill(craftingData)
}

func Materials() *MaterialRegistry {
	return globalMaterialsRegistry
}

func Crafting() *CraftingRegistry {
	return globalCraftingRegistry
}
