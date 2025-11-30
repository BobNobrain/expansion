package game

type GameCraftingData interface {
	GetCommodity(CommodityID) Commodity
	GetRecipe(RecipeTemplateID) RecipeTemplate
	GetEquipment(EquipmentID) EquipmentData
	GetBaseBuilding(BaseBuildingID) BaseBuildingData
}
