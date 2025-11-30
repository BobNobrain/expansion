package assets

import (
	"srv/internal/game"
	"srv/internal/utils"
	"srv/internal/utils/common"
)

type staticRecipesAsset struct {
	Recipes []staticRecipesAssetRecipe `json:"recipes"`
}

type staticRecipesAssetRecipe struct {
	ID          string             `json:"id"`
	EquipmentID string             `json:"equipment"`
	Inputs      map[string]float64 `json:"inputs"`
	Outputs     map[string]float64 `json:"outputs"`
}

func SaveStaticRecipes(recipes []game.Recipe) common.Error {
	asset := staticRecipesAsset{}

	for _, r := range recipes {
		asset.Recipes = append(asset.Recipes, staticRecipesAssetRecipe{
			ID:          string(r.RecipeID),
			EquipmentID: string(r.EquipmentID),
			Inputs:      utils.ConvertStringKeys[game.CommodityID, string](r.Inputs),
			Outputs:     utils.ConvertStringKeys[game.CommodityID, string](r.Outputs),
		})
	}

	err := globalLoader.saveJSONAsset("generated/static_recipes.json", asset)
	if err != nil {
		return newAssetSaveError("generated/static_recipes.json", err)
	}
	return nil
}
