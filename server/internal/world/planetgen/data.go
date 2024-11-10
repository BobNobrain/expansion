package planetgen

import (
	"srv/internal/utils/color"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
	"srv/internal/world"
)

type GeneratedSurfaceData struct {
	// Params world.CelestialSurfaceParams
	Grid  geom.SpatialGraph
	Tiles []*GeneratedTileData

	Atmosphere GeneratedAtmosphere
	Oceans     GeneratedOceans
	Snow       *material.MaterialCompound
	// real elevation of a tile = Params.Radius + tile.Elevation * RelativeElevationsScale
	RelativeElevationsScale phys.Distance
}

type GeneratedTileData struct {
	Elevation   float64
	SurfaceType world.BiomeSurface
	AverageTemp phys.Temperature
	Pressure    phys.Pressure
	Color       color.RichColorRGB
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
