package planetgen

import (
	"math/rand"
	"srv/internal/game"
	"srv/internal/utils/color"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
)

type planetGenContext struct {
	// inputs
	rnd *rand.Rand

	params game.WorldParams

	starParams          game.StarParams
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

	resources map[int][]game.ResourceDeposit
}

type generatedTileData struct {
	Elevation     float64
	SurfaceType   game.BiomeSurface
	AverageTemp   phys.Temperature
	Pressure      phys.Pressure
	Color         color.RichColorRGB
	SoilFertility float64
	MoistureLevel float64
}

func (ctx *planetGenContext) toWorldExplorationData() game.WorldExplorationData {
	tiles := make([]game.WorldExplorationDataTile, 0, len(ctx.tiles))
	for _, tile := range ctx.tiles {
		tiles = append(tiles, game.WorldExplorationDataTile{
			Color:     tile.Color,
			AvgTemp:   tile.AverageTemp,
			Pressure:  tile.Pressure,
			Surface:   tile.SurfaceType,
			Elevation: tile.Elevation,
		})
	}

	var fertileTiles []game.FertileWorldDataTile
	if ctx.maxSoilFertility >= 0 {
		fertileTiles = make([]game.FertileWorldDataTile, 0, len(ctx.tiles))

		for _, tile := range ctx.tiles {
			fertileTiles = append(fertileTiles, game.FertileWorldDataTile{
				MoistureLevel: tile.MoistureLevel,
				SoilFertility: tile.SoilFertility,
			})
		}
	}

	return game.WorldExplorationData{
		Grid: ctx.grid,
		Conditions: game.WorldConditions{
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
		TileResources:       ctx.resources,
		TileElevationsScale: ctx.relativeElevationsScale,
	}
}
