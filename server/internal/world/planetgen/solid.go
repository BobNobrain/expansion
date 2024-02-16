package planetgen

import (
	"srv/internal/utils/phys"
	"srv/internal/world"
)

type solidPlanetData struct {
	planetRadius       phys.Distance
	relativeElevations []float64
	seaLevel           float64
	airLevel           float64
}

// const biomeColorUnknown = "ff00ff"
const biomeColorOcean = "5090f0"
const biomeColorLand = "409010"
const biomeColorMountains = "d09050"

func (data *solidPlanetData) GetConditions(idx world.PlanetaryNodeIndex) *world.PlanetaryTile {
	relativeElevationScale := data.planetRadius.Mul(1e-3)

	relativeElevation := data.relativeElevations[idx]

	result := &world.PlanetaryTile{
		BiomeColor: biomeColorLand,
	}

	// TODO
	result.Solid = &world.PlanetaryTileConditions{
		Elevation: data.planetRadius.Add(relativeElevationScale.Mul(relativeElevation)),
	}

	if relativeElevation < data.seaLevel {
		result.BiomeColor = biomeColorOcean
	}
	if relativeElevation > 0.7 {
		result.BiomeColor = biomeColorMountains
	}

	// if relativeElevation < data.seaLevel {
	// 	result.Marine = &world.PlanetaryTileConditions{
	// 		Elevation: data.planetRadius.Add(relativeElevationScale.Mul(data.seaLevel)),
	// 	}
	// }

	// if relativeElevation < data.airLevel {
	// 	result.Marine = &world.PlanetaryTileConditions{
	// 		Elevation: data.planetRadius.Add(relativeElevationScale.Mul(data.airLevel)),
	// 	}
	// }

	return result
}
