package planetgen

import (
	"srv/internal/utils/color"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
	"srv/internal/world"
)

//
// TODO: either get rid of these structures or make them private
//

type GeneratedSurfaceData struct {
	Grid  geom.SpatialGraph
	Tiles []*GeneratedTileData

	Atmosphere GeneratedAtmosphere
	Oceans     GeneratedOceans
	Snow       *material.MaterialCompound
	// real elevation of a tile = Params.Radius + tile.Elevation * RelativeElevationsScale
	RelativeElevationsScale phys.Distance
	SurfaceGravity          phys.Acceleration
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

func (d GeneratedSurfaceData) ToWorldExplorationData(params world.CelestialSurfaceParams) world.WorldExplorationData {
	tiles := make([]world.WorldExplorationDataTile, 0, len(d.Tiles))
	for _, tile := range d.Tiles {
		tiles = append(tiles, world.WorldExplorationDataTile{
			Color:     tile.Color,
			AvgTemp:   tile.AverageTemp,
			Pressure:  tile.Pressure,
			Surface:   tile.SurfaceType,
			Elevation: tile.Elevation,
		})
	}

	resources := make(map[int]world.ResourceDeposit)

	return world.WorldExplorationData{
		Grid: d.Grid,
		Conditions: world.SurfaceConditions{
			Pressure: d.Atmosphere.SeaLevelPressure,
			AvgTemp:  d.Atmosphere.AverageTemp,
			Gravity:  d.SurfaceGravity,
		},
		Params:     params,
		OceanLevel: d.Oceans.Level,
		Atmosphere: d.Atmosphere.Contents,
		Oceans:     d.Oceans.Contents,
		Snow:       d.Snow,

		Tiles:               tiles,
		TileResources:       resources,
		TileElevationsScale: d.RelativeElevationsScale,
	}
}
