package globaldata

import "srv/internal/globals/assets"

var globalRegistry *MaterialRegistry

func Init() {
	globalRegistry = newMaterialRegistry()

	allMats, err := assets.LoadWGMaterials()

	if err != nil {
		panic(err)
	}

	for _, mat := range allMats {
		globalRegistry.byId[mat.GetID()] = mat
	}
}

func Materials() *MaterialRegistry {
	return globalRegistry
}
