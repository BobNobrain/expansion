package game

type GameCraftingData interface {
	GetCommodity(CommodityID) Commodity
	GetRecipe(RecipeID) RecipeTemplate
	GetEquipment(EquipmentID) EquipmentData
	GetBaseBuilding(BaseBuildingID) BaseBuildingData
}
