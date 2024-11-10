package planetgen

import (
	"fmt"
	"math"
	"math/rand"
	"srv/internal/globals/globaldata"
	"srv/internal/globals/logger"
	"srv/internal/utils"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
)

type terrestialPlanetSimulationState struct {
	corium *material.Material

	// inputs
	rnd                 *rand.Rand
	starLum             float64
	starDistanceSquared float64
	planetMass          phys.Mass
	planetRadius        phys.Distance

	// results
	materials       *material.MaterialCompound
	surfaceTemp     phys.Temperature
	surfacePressure phys.Pressure
	escapeVelocity  phys.Speed
	surfaceGravity  phys.Acceleration
	surfaceAreaKm2  float64
	iteration       int
}

func (state *terrestialPlanetSimulationState) log() {
	separated := state.materials.Separate(material.PhaseDiagramPoint{
		T: state.surfaceTemp,
		P: state.surfacePressure,
	})

	logger.Debug(logger.FromMessage("planetgen", "Planet generation iteration:").
		WithDetail("iteration", state.iteration).
		WithDetail("temp", fmt.Sprintf("%.2f K / %.2f ºC", state.surfaceTemp.Kelvins(), state.surfaceTemp.DegreesCelsius())).
		WithDetail("pressure (bar)", state.surfacePressure.Bar()).
		WithDetail("atmosphere", separated[material.StateGas].ToString()).
		WithDetail("oceans", separated[material.StateLiquid].ToString()).
		WithDetail("crust", separated[material.StateSolid].ToString()),
	)
}

func (state *terrestialPlanetSimulationState) init(ctx *surfaceGenContext) {
	state.corium = globaldata.Materials().GetByID("corium")

	state.rnd = ctx.rnd
	state.starLum = ctx.starParams.Luminosity.Suns()
	distanceFromStar := ctx.nearestStarDistance.AstronomicalUnits()
	state.starDistanceSquared = distanceFromStar * distanceFromStar

	state.planetMass = ctx.params.Mass
	state.planetRadius = ctx.params.Radius
	state.materials = ctx.availableMaterials.Clone()
	state.surfacePressure = phys.Pascals(1000)

	state.escapeVelocity = phys.CalculatePlanetEscapeVelocity(ctx.params.Mass, ctx.params.Radius)
	state.surfaceGravity = phys.CalculatePlanetGravity(ctx.params.Mass, ctx.params.Radius)
	logger.Debug(
		logger.FromMessage("planetgen", "Calculated g:").
			WithDetail("g", state.surfaceGravity.KilometersPerSecondSquared()).
			WithDetail("m", ctx.params.Mass.Kilograms()).
			WithDetail("r", ctx.params.Radius.Kilometers()),
	)
	state.surfaceAreaKm2 = 4 * math.Pi * ctx.params.Radius.Kilometers() * ctx.params.Radius.Kilometers()

	state.iteration = 0

	state.calcTempEquilibrium(0.2, 0)
}

func (state *terrestialPlanetSimulationState) calcTempEquilibrium(surfaceEnergyAbsorbtion float64, greenhouse float64) {
	initialAirlessEquilibrium := 278.6 * math.Pow(state.starLum*(surfaceEnergyAbsorbtion+greenhouse)/state.starDistanceSquared, 0.25)
	state.surfaceTemp = phys.Kelvins(initialAirlessEquilibrium)
}

func (state *terrestialPlanetSimulationState) runIteration() {
	state.iteration += 1

	conditions := material.PhaseDiagramPoint{
		T: state.surfaceTemp,
		P: state.surfacePressure,
	}

	separated := state.materials.Separate(conditions)
	oceans := separated[material.StateLiquid]
	snow := separated[material.StateSolid]
	atmosphere := separated[material.StateGas]

	surfaceAndOceans := material.MergeCompounds(oceans, snow)
	if snow.IsEmpty() {
		surfaceAndOceans.AddPercentage(state.corium, 1)
	}

	// 0. if overall atmosphere mass is too big compared to the planet size, we shall rebalance it
	relativeAtmosphereMass := atmosphere.GetAmountRelativeTo(state.materials)
	if relativeAtmosphereMass > 1e-6 {
		normzFactor := 1e-6 / relativeAtmosphereMass
		logger.Debug(logger.FromMessage("planetgen", "Normalized atmosphere mass").WithDetail("factor", normzFactor))
		for _, mat := range atmosphere.ListMaterials() {
			atmosphere.ScaleAmountOf(mat, normzFactor)
			state.materials.ScaleAmountOf(mat, normzFactor)
		}
	}

	if atmosphere.IsEmpty() {
		logger.Debug(logger.FromMessage("planetgen", "Whoopsie! The atmosphere has leaked out!"))
		state.surfacePressure = phys.Pascals(0)
		return
	}

	// 1. recalc runaway gases
	atmosphericHeight := conditions.T.CalcAtmosphereHeight(state.surfaceGravity, atmosphere.GetAverageMolarMass())
	escapeVelocity := phys.CalculatePlanetEscapeVelocity(state.planetMass, state.planetRadius.Add(atmosphericHeight))
	for _, gas := range atmosphere.ListMaterials() {
		vTherm := state.surfaceTemp.CalcThermalVelocity(gas.GetMolarMass())
		if vTherm < escapeVelocity/6 {
			logger.Debug(logger.FromMessage("planetgen", "    atmospheric gas stable").
				WithDetail("mat", gas.GetID()).
				WithDetail("v rel", vTherm/escapeVelocity),
			)
			continue
		}

		vThermRelativeToEscape := utils.Unlerp(escapeVelocity/6, escapeVelocity, vTherm)
		escapingShare := utils.Lerp(0.0, 0.3, utils.Clamp(vThermRelativeToEscape, 0, 1)) // at most 30% of the gas will escape during a single iteration

		logger.Debug(
			logger.FromMessage("planetgen", "    atmospheric gas escaping").
				WithDetail("mat", gas.GetID()).
				WithDetail("v rel", vTherm/escapeVelocity).
				WithDetail("mult", 1-escapingShare),
		)
		state.materials.ScaleAmountOf(gas, 1-escapingShare)
		atmosphere.ScaleAmountOf(gas, 1-escapingShare)
	}

	trimmed := atmosphere.TrimNegligibleMaterials(1e-3)
	for _, mat := range trimmed {
		state.materials.Remove(mat)
	}
	if len(trimmed) > 0 {
		logger.Debug(logger.FromMessage("planetgen", "Trimmed trace amounts").WithDetail("result", state.materials.ToString()))
	}
	// 2. recalc pressure
	atmosphereMass := state.planetMass.Multiply(atmosphere.GetAmountRelativeTo(state.materials))
	pressureValue := atmosphereMass.Kilograms() / state.surfaceAreaKm2 *
		state.surfaceGravity.KilometersPerSecondSquared() / state.planetRadius.Kilometers()

	state.surfacePressure = phys.Pascals(pressureValue * 1e3)
	logger.Debug(
		logger.FromMessage("planetgen", "Pressure recalculated").
			WithDetail("atmMass", atmosphereMass.Kilograms()).
			WithDetail("surfaceArea", state.surfaceAreaKm2).
			WithDetail("g", state.surfaceGravity.EarthGs()),
	)
	// 3. recalc albedo
	surfaceEnergyAbsorbtion := surfaceAndOceans.GetLightAbsorbtionAt(conditions)
	greenHouseCoeff := atmosphere.GetAverageGreenhouseEffect()
	greenHouseAdjustment := pressureValue / (pressureValue + 111.1)
	logger.Debug(
		logger.FromMessage("planetgen", "Energy absorbtion updated").
			WithDetail("1-albedo", surfaceEnergyAbsorbtion).
			WithDetail("greenhouse", greenHouseCoeff).
			WithDetail("greenhouseAdjusted", greenHouseCoeff*greenHouseAdjustment),
	)
	// 4. recalc equilibrium temp
	state.calcTempEquilibrium(surfaceEnergyAbsorbtion, greenHouseCoeff*greenHouseAdjustment)
}

func (ctx *surfaceGenContext) runSimulation() {
	state := &terrestialPlanetSimulationState{}
	state.init(ctx)
	state.log()

	// let's run it for 25 iterations and hope that it will converge
	for state.iteration < 25 {
		state.runIteration()
		state.log()
	}

	separated := state.materials.Separate(material.PhaseDiagramPoint{T: state.surfaceTemp, P: state.surfacePressure})

	ctx.surface.Atmosphere = GeneratedAtmosphere{
		Contents:         separated[material.StateGas],
		SeaLevelPressure: state.surfacePressure,
		AverageTemp:      state.surfaceTemp,
		WeatherHarshness: 1,
	}

	ctx.surface.Oceans = GeneratedOceans{
		Level:    -1,
		Contents: separated[material.StateLiquid],
	}

	ctx.surface.Snow = separated[material.StateSolid]

	// calculating oceans level
	if !ctx.surface.Oceans.Contents.IsEmpty() {
		rateOfMasses := ctx.surface.Snow.GetAmountRelativeTo(material.MergeCompounds(ctx.surface.Snow, ctx.surface.Oceans.Contents))
		solidRadius := ctx.params.Radius.Kilometers() * math.Cbrt(rateOfMasses)
		oceanRadius := ctx.params.Radius.Kilometers() - solidRadius
		res := ctx.surface.RelativeElevationsScale.Kilometers()

		ctx.surface.Oceans.Level = utils.Clamp(utils.Unlerp(0, 2*res, oceanRadius)*2-1, -1, 1)
	}
}
