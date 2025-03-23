package planetgen

import (
	"srv/internal/game"
	"srv/internal/game/worldgen"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
)

type GeneratePlanetOptions struct {
	WR     *worldgen.WorldRandom
	ID     game.CelestialID
	Params game.WorldParams

	StarParams   game.StarParams
	StarDistance phys.Distance

	ParentSurfaceMass     phys.Mass
	ParentSurfaceDistance phys.Distance

	AvailableMaterials *material.MaterialCompound
}

func GeneratePlanet(opts GeneratePlanetOptions) game.WorldExplorationData {
	ctx := &planetGenContext{
		rnd:    opts.WR.ForCelestial(opts.ID),
		params: opts.Params,

		starParams:          opts.StarParams,
		nearestStarDistance: opts.StarDistance,

		availableMaterials: opts.AvailableMaterials,
	}

	ctx.generateGrid()

	if opts.Params.Class.IsTerrestial() {
		ctx.generateTectonicElevations()
		ctx.generateRockyConditions()
		ctx.makeFertileIfCloseEnough()

		ctx.normalizeOceanLevel()

		ctx.calculateConditionsPerTile()
		ctx.assignBasicBiomes()
		ctx.assignConditionalBiomes()
		ctx.assignFertileBiomes()

		ctx.generateResorces()
	} else {
		ctx.generateGasGiantConditions()
		ctx.fillGasGiantTiles()
	}

	return ctx.toWorldExplorationData()
}

type GenerateMoonOptions struct {
	GeneratePlanetOptions

	ParentSurfaceMass     phys.Mass
	ParentSurfaceDistance phys.Distance
}

func GenerateMoon(opts GenerateMoonOptions) game.WorldExplorationData {
	ctx := &planetGenContext{
		rnd:    opts.WR.ForCelestial(opts.ID),
		params: opts.Params,

		starParams:          opts.StarParams,
		nearestStarDistance: opts.StarDistance,

		nearestSurfaceMass:     opts.ParentSurfaceMass,
		nearestSurfaceDistance: opts.ParentSurfaceDistance,

		availableMaterials: opts.AvailableMaterials,
	}

	ctx.generateGrid()

	// ctx.runSimulation()
	ctx.generateTectonicElevations()
	ctx.generateRockyConditions()
	ctx.calculateConditionsPerTile()
	ctx.assignBasicBiomes()
	ctx.assignConditionalBiomes()
	ctx.assignFertileBiomes()

	return ctx.toWorldExplorationData()
}
