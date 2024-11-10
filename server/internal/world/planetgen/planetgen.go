package planetgen

import (
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
	"srv/internal/world"
	"srv/internal/world/worldgen"
)

type GeneratePlanetOptions struct {
	WR     worldgen.WorldRandom
	ID     world.CelestialID
	Params world.CelestialSurfaceParams

	StarParams   world.StarParams
	StarDistance phys.Distance

	ParentSurfaceMass     phys.Mass
	ParentSurfaceDistance phys.Distance

	AvailableMaterials *material.MaterialCompound
}

func GeneratePlanet(opts GeneratePlanetOptions) *GeneratedSurfaceData {
	ctx := &surfaceGenContext{
		rnd:    opts.WR.ForCelestial(opts.ID),
		params: opts.Params,

		starParams:          opts.StarParams,
		nearestStarDistance: opts.StarDistance,

		availableMaterials: opts.AvailableMaterials,

		surface: &GeneratedSurfaceData{},
	}

	ctx.generateGrid()

	if opts.Params.Class.IsTerrestial() {
		// ctx.runSimulation()
		ctx.generateTectonicElevations()
		ctx.generateRockyConditions()
		ctx.calculateConditionsPerTile()
		ctx.assignBasicBiomes()
		ctx.assignConditionalBiomes()
		ctx.assignFertileBiomes()
	} else {
		ctx.generateGasGiantConditions()
		ctx.fillGasGiantTiles()
	}

	return ctx.surface
}

type GenerateMoonOptions struct {
	GeneratePlanetOptions

	ParentSurfaceMass     phys.Mass
	ParentSurfaceDistance phys.Distance
}

func GenerateMoon(opts GenerateMoonOptions) *GeneratedSurfaceData {
	ctx := &surfaceGenContext{
		rnd:    opts.WR.ForCelestial(opts.ID),
		params: opts.Params,

		starParams:          opts.StarParams,
		nearestStarDistance: opts.StarDistance,

		nearestSurfaceMass:     opts.ParentSurfaceMass,
		nearestSurfaceDistance: opts.ParentSurfaceDistance,

		availableMaterials: opts.AvailableMaterials,

		surface: &GeneratedSurfaceData{},
	}

	ctx.generateGrid()

	// ctx.runSimulation()
	ctx.generateTectonicElevations()
	ctx.generateRockyConditions()
	ctx.calculateConditionsPerTile()
	ctx.assignBasicBiomes()
	ctx.assignConditionalBiomes()
	ctx.assignFertileBiomes()

	return ctx.surface
}
