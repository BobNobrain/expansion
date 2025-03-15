package assets

type CommoditiesAsset struct {
	Commodities    map[string]CommodityData `json:"commodities"`
	Resources      map[string]ResourceData  `json:"resources"`
	WGMaterialsMap map[string]string        `json:"worldgenMaterials"`
}

type CommodityData struct {
	Category    string  `json:"category"`
	Mass        float64 `json:"mass"`
	Volume      float64 `json:"volume"`
	IsQuantized bool    `json:"quantized"`
	Expiry      string  `json:"expiry"`
}

type ResourceData struct {
	Abundance   float64 `json:"abundance"`
	Veins       float64 `json:"veins"`
	FertileOnly bool    `json:"fertileOnly"`
}

func LoadCommodities() (*CommoditiesAsset, error) {
	result := &CommoditiesAsset{}
	err := globalLoader.loadJSONAsset(globalLoader.assetName("crafting", "commodities.json"), result)
	if err != nil {
		return nil, err
	}
	return result, nil
}
