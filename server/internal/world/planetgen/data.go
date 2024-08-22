package planetgen

import (
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
	"srv/internal/world"
)

type GeneratedSurfaceData struct {
	Params world.CelestialBodyParams
	Grid   world.PlanetaryGrid
	Tiles  []*GeneratedTileData

	Atmosphere GeneratedAtmosphere
	Oceans     GeneratedOceans
	Crust      *material.MaterialCompound
	// real elevation of a tile = Params.Radius + tile.Elevation * RelativeElevationsScale
	RelativeElevationsScale phys.Distance
}

type GeneratedTileData struct {
	Elevation   float64
	SurfaceType world.BiomeSurface
	AverageTemp phys.Temperature
	Pressure    phys.Pressure
}

type GeneratedAtmosphere struct {
	Contents         *material.MaterialCompound
	SeaLevelPressure phys.Pressure
	AverageTemp      phys.Temperature
	WeatherHarshness float64
}

type GeneratedOceans struct {
	Level    float64
	Contents *material.MaterialCompound
}
