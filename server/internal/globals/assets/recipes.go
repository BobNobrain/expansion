package assets

type RecipesAsset struct {
	Recipes []RecipesAssetRecipe `json:"recipes"`
}

type RecipesAssetRecipe struct {
	Equipment            string             `json:"equipment"`
	Inputs               map[string]float64 `json:"inputs"`
	Outputs              map[string]float64 `json:"outputs"`
	BaseTime             string             `json:"baseTime"`
	AffectedByResource   bool               `json:"affectedByResource"`
	AffectedBySnow       bool               `json:"affectedBySnow"`
	AffectedByOcean      bool               `json:"affectedByOcean"`
	AffectedByAtmosphere bool               `json:"affectedByAtmosphere"`
	AffectedByFertility  bool               `json:"affectedByFertility"`
}

func LoadRecipes() (*RecipesAsset, error) {
	result := &RecipesAsset{}
	err := globalLoader.loadJSONAsset(globalLoader.assetName("crafting", "recipes.json"), result)
	if err != nil {
		return nil, err
	}
	return result, nil
}
