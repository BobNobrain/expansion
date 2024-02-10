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

func (data *solidPlanetData) GetConditions(idx world.PlanetaryNodeIndex) *world.PlanetaryTile {
	relativeElevationScale := data.planetRadius.Mul(1e-3)

	relativeElevation := data.relativeElevations[idx]

	result := &world.PlanetaryTile{}

	// TODO
	result.Solid = &world.PlanetaryTileConditions{
		Elevation: data.planetRadius.Add(relativeElevationScale.Mul(relativeElevation)),
	}

	if relativeElevation < data.seaLevel {
		result.Marine = &world.PlanetaryTileConditions{
			Elevation: data.planetRadius.Add(relativeElevationScale.Mul(data.seaLevel)),
		}
	}

	if relativeElevation < data.airLevel {
		result.Marine = &world.PlanetaryTileConditions{
			Elevation: data.planetRadius.Add(relativeElevationScale.Mul(data.airLevel)),
		}
	}

	return result
}
