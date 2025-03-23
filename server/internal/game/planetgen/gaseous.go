package planetgen

import (
	"math"
	"srv/internal/game"
	"srv/internal/globals/globaldata"
	"srv/internal/utils"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
)

func (ctx *planetGenContext) generateGasGiantConditions() {
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

	ctx.averageTemp = surfaceConditions.T
	ctx.seaLevelPressure = surfaceConditions.P
	ctx.atmosphere = gases

	ctx.oceans = material.NewMaterialCompound()
	ctx.oceanLevel = -1

	// TODO: calculate a "settling radius" for gas giants (where the pressure will be ~1atm or a bit higher)
	surfaceGravity := phys.CalculatePlanetGravity(ctx.params.Mass, ctx.params.Radius.Mul(0.9))
	ctx.surfaceGravity = surfaceGravity
}

func (ctx *planetGenContext) fillGasGiantTiles() {
	grid := ctx.grid
	n := grid.Size()

	atmColor := ctx.atmosphere.GetAverageColorForState(material.StateGas)

	for i := 0; i < n; i++ {
		ctx.tiles[i] = &generatedTileData{
			Elevation:     0,
			SurfaceType:   game.BiomeSurfaceNone,
			AverageTemp:   ctx.averageTemp,
			Pressure:      ctx.seaLevelPressure,
			Color:         atmColor.Reflective,
			SoilFertility: -1,
		}
	}
}
