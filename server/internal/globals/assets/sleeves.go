package assets

type GalaxySleeveConfig struct {
	Pos     float64 `json:"pos"`
	Width   float64 `json:"width"`
	Twist   float64 `json:"twist"`
	Density float64 `json:"density"`
}

type GalaxySleevesAsset struct {
	Sleeves []*GalaxySleeveConfig `json:"sleeves"`
}

func LoadGalaxySleeves() (*GalaxySleevesAsset, error) {
	result := &GalaxySleevesAsset{}
	err := globalLoader.loadJSONAsset(globalLoader.assetName("worldgen", "sleeves.json"), result)
	if err != nil {
		return nil, err
	}
	return result, nil
}
