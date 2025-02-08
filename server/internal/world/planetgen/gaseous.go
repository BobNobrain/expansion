package planetgen

import (
	"math"
	"srv/internal/globals/globaldata"
	"srv/internal/utils"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
	"srv/internal/world"
)

func (ctx *surfaceGenContext) generateGasGiantConditions() {
	// TODO: look up some physics and make this somewhat more realistic
	starLum := ctx.starParams.Luminosity.Suns()
	distanceFromStar := ctx.nearestStarDistance.AstronomicalUnits()
	starDistanceSquared := distanceFromStar * distanceFromStar

	// planetMass := ctx.params.Mass
	// planetRadius := ctx.params.Radius

	// surfaceGravity := phys.CalculatePlanetGravity(ctx.params.Mass, ctx.params.Radius)
	// surfaceAreaKm2 := 4 * math.Pi * ctx.params.Radius.Kilometers() * ctx.params.Radius.Kilometers()

	equilibrium := 278.6 * math.Pow(starLum*0.2/starDistanceSquared, 0.25)

	surfaceConditions := material.PhaseDiagramPoint{
		T: phys.Kelvins(equilibrium * utils.Lerp(0.8, 1.2, ctx.rnd.Float64())),
		P: phys.Bar(1),
	}

	volatiles := ctx.availableMaterials
	gases := volatiles.Separate(surfaceConditions)[material.StateGas]
	if gases.IsEmpty() {
		// TODO: handle this properly
		gases.Add(globaldata.Materials().GetByID("h2"), 1)
	}

	// just shuffling atmospheric composition
	for _, mat := range gases.ListMaterials() {
		r := ctx.rnd.Float64()
		if r < 0.5 {
			gases.ScaleAmountOf(mat, utils.Lerp(0.1, 10, r*2))
		}
	}

	gases.TrimNegligibleMaterials(0.1)

	ctx.surface.Atmosphere.AverageTemp = surfaceConditions.T
	ctx.surface.Atmosphere.SeaLevelPressure = surfaceConditions.P
	ctx.surface.Atmosphere.Contents = gases

	ctx.surface.Oceans = GeneratedOceans{
		Level:    -1,
		Contents: material.NewMaterialCompound(),
	}

	// TODO: calculate a "settling radius" for gas giants (where the pressure will be ~1atm or a bit higher)
	surfaceGravity := phys.CalculatePlanetGravity(ctx.params.Mass, ctx.params.Radius.Mul(0.9))
	ctx.surface.SurfaceGravity = surfaceGravity
}

func (ctx *surfaceGenContext) fillGasGiantTiles() {
	grid := ctx.surface.Grid
	n := grid.Size()

	atmColor := ctx.surface.Atmosphere.Contents.GetAverageColorForState(material.StateGas)

	for i := 0; i < n; i++ {
		ctx.surface.Tiles[i] = &GeneratedTileData{
			Elevation:   0,
			SurfaceType: world.BiomeSurfaceNone,
			AverageTemp: ctx.surface.Atmosphere.AverageTemp,
			Pressure:    ctx.surface.Atmosphere.SeaLevelPressure,
			Color:       atmColor.Reflective,
		}
	}
}
