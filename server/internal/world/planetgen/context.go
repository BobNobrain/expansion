package planetgen

import (
	"math/rand"
	"srv/internal/utils/color"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
	"srv/internal/world"
)

type planetGenContext struct {
	// inputs
	rnd *rand.Rand

	params world.WorldParams

	starParams          world.StarParams
	nearestStarDistance phys.Distance

	nearestSurfaceMass     phys.Mass
	nearestSurfaceDistance phys.Distance

	availableMaterials *material.MaterialCompound

	// outputs
	grid  geom.SpatialGraph
	tiles []*generatedTileData

	atmosphere       *material.MaterialCompound
	seaLevelPressure phys.Pressure
	averageTemp      phys.Temperature
	weatherHarshness float64

	oceanLevel float64
	oceans     *material.MaterialCompound

	snow *material.MaterialCompound
	// real elevation of a tile = Params.Radius + tile.Elevation * RelativeElevationsScale
	relativeElevationsScale phys.Distance
	surfaceGravity          phys.Acceleration

	// 0..1 for fertile planets, -1 otherwise
	maxSoilFertility float64

	resources map[int][]world.ResourceDeposit
}

type generatedTileData struct {
	Elevation     float64
	SurfaceType   world.BiomeSurface
	AverageTemp   phys.Temperature
	Pressure      phys.Pressure
	Color         color.RichColorRGB
	SoilFertility float64
	MoistureLevel float64
}

func (ctx *planetGenContext) toWorldExplorationData() world.WorldExplorationData {
	tiles := make([]world.WorldExplorationDataTile, 0, len(ctx.tiles))
	for _, tile := range ctx.tiles {
		tiles = append(tiles, world.WorldExplorationDataTile{
			Color:     tile.Color,
			AvgTemp:   tile.AverageTemp,
			Pressure:  tile.Pressure,
			Surface:   tile.SurfaceType,
			Elevation: tile.Elevation,
		})
	}

	resources := make(map[int][]world.ResourceDeposit)

	var fertileTiles []world.FertileWorldDataTile
	if ctx.maxSoilFertility >= 0 {
		fertileTiles = make([]world.FertileWorldDataTile, 0, len(ctx.tiles))

		for _, tile := range ctx.tiles {
			fertileTiles = append(fertileTiles, world.FertileWorldDataTile{
				MoistureLevel: tile.MoistureLevel,
				SoilFertility: tile.SoilFertility,
			})
		}
	}

	return world.WorldExplorationData{
		Grid: ctx.grid,
		Conditions: world.WorldConditions{
			Pressure: ctx.seaLevelPressure,
			AvgTemp:  ctx.averageTemp,
			Gravity:  ctx.surfaceGravity,
		},
		Params:     ctx.params,
		OceanLevel: ctx.oceanLevel,
		Atmosphere: ctx.atmosphere,
		Oceans:     ctx.oceans,
		Snow:       ctx.snow,

		Tiles:               tiles,
		FertileTiles:        fertileTiles,
		TileResources:       resources,
		TileElevationsScale: ctx.relativeElevationsScale,
	}
}
