package assets

type EquipmentAsset struct {
	Buildings map[string]EquipmentAssetBuilding  `json:"buildings"`
	Equipment map[string]EquipmentAssetEquipment `json:"equipment"`
}

type EquipmentAssetBuilding struct {
	MatsPerArea map[string]float64 `json:"materialsPerArea"`
}

type EquipmentAssetEquipment struct {
	Building          string                                      `json:"building"`
	Area              int                                         `json:"area"`
	Operators         map[string]EquipmentAssetEquipmentOperators `json:"operators"`
	ConstructionParts map[string]float64                          `json:"constructedFrom"`
}

type EquipmentAssetEquipmentOperators struct {
	Count        int     `json:"count"`
	Contribution float64 `json:"contribution"`
}

func LoadEquipment() (*EquipmentAsset, error) {
	result := &EquipmentAsset{}
	err := globalLoader.loadJSONAsset(globalLoader.assetName("crafting", "buildings.json"), result)
	if err != nil {
		return nil, err
	}
	return result, nil
}
