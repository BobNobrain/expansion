package assets

type WGMaterialsAsset struct {
	Mats []WGMaterial `json:"materials"`
}

type WGMaterial struct {
	ID             string  `json:"id"`
	IcelineK       float64 `json:"iceline"`
	DensityKgPerM3 float64 `json:"density"`
	MolarMass      float64 `json:"molarMass"`
}

func LoadWGMaterials() (*WGMaterialsAsset, error) {
	result := &WGMaterialsAsset{}
	err := globalLoader.loadJSONAsset(globalLoader.assetName("worldgen", "materials.json"), result)
	if err != nil {
		return nil, err
	}
	return result, nil
}
