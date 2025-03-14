package planetgen

import (
	"math"
	"srv/internal/globals/globaldata"
	"srv/internal/globals/logger"
	"srv/internal/utils"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
	"srv/internal/world"
)

func (ctx *planetGenContext) generateRockyConditions() {
	starLum := ctx.starParams.Luminosity.Suns()
	distanceFromStar := ctx.nearestStarDistance.AstronomicalUnits()
	starDistanceSquared := distanceFromStar * distanceFromStar

	planetMass := ctx.params.Mass
	planetRadius := ctx.params.Radius

	ctx.surfaceGravity = phys.CalculatePlanetGravity(ctx.params.Mass, ctx.params.Radius)

	initialAirlessEquilibrium := 278.6 * math.Pow(starLum*0.2/starDistanceSquared, 0.25)
	randomTempShift := utils.Lerp(0.65, 1.5, ctx.rnd.Float64())
	surfaceKelvins := utils.Clamp(initialAirlessEquilibrium*randomTempShift, 0, 1100)
	if initialAirlessEquilibrium > 1200 {
		logger.Warn(logger.FromMessage("planetgen", "rocky planet with too high estimated temperature").
			WithDetail("T", initialAirlessEquilibrium).
			WithDetail("d^2", starDistanceSquared).
			WithDetail("lum", starLum).
			WithDetail("rnd", randomTempShift),
		)
	}

	surfaceConditions := material.PhaseDiagramPoint{
		T: phys.Kelvins(surfaceKelvins),
		P: phys.Bar(0),
	}

	// TODO: account for star's luminosity
	canHaveAtmosphere := distanceFromStar > 0.5

	if canHaveAtmosphere {
		// lets generate atmosphere
		var pressureBars float64
		rand := ctx.rnd.Float64()
		if rand < 0.35 {
			// thin atmosphere
			pressureBars = utils.Lerp(0.0, 0.1, ctx.rnd.Float64())
		} else if rand < 0.90 {
			// normal atmosphere
			pressureBars = utils.Lerp(0.1, 2.0, ctx.rnd.Float64())
		} else {
			// thicc atmosphere
			pressureBars = utils.Lerp(2.0, 400.0, ctx.rnd.Float64())
		}

		// stronger gravity should correlate with more sea level pressure
		pressureBars *= utils.Clamp(ctx.surfaceGravity.EarthGs(), 0.8, 1.2)

		surfaceConditions.P = phys.Bar(pressureBars)
	}

	// shuffle composition around
	ctx.availableMaterials = ctx.availableMaterials.Clone()
	for _, mat := range ctx.availableMaterials.ListMaterials() {
		r := ctx.rnd.Float64()
		if r < 0.1 {
			ctx.availableMaterials.ScaleAmountOf(mat, utils.Lerp(0.1, 0.4, ctx.rnd.Float64()))
		} else if r < 0.3 {
			ctx.availableMaterials.ScaleAmountOf(mat, utils.Lerp(1.0, 20.0, ctx.rnd.Float64()))
		}
	}

	separated := ctx.availableMaterials.Separate(surfaceConditions)
	snow := separated[material.StateSolid]
	oceans := separated[material.StateLiquid]
	atmosphere := separated[material.StateGas]

	if canHaveAtmosphere {
		// quickly check if atmosphere contains gases that should have leaked out
		atmosphericHeight := surfaceConditions.T.CalcAtmosphereHeight(ctx.surfaceGravity, atmosphere.GetAverageMolarMass())
		escapeVelocityInAtmosphere := phys.CalculatePlanetEscapeVelocity(planetMass, planetRadius.Add(atmosphericHeight))
		for _, gas := range atmosphere.ListMaterials() {
			vTherm := surfaceConditions.T.CalcThermalVelocity(gas.GetMolarMass())
			if vTherm < escapeVelocityInAtmosphere/6 {
				continue
			}

			vThermRelativeToEscape := utils.Unlerp(escapeVelocityInAtmosphere/6, escapeVelocityInAtmosphere, vTherm)
			escapingShare := utils.Lerp(0.0, 0.3, utils.Clamp(vThermRelativeToEscape, 0, 1)) // at most 30% of the gas will escape during a single iteration

			atmosphere.ScaleAmountOf(gas, 1-escapingShare)
		}
		atmosphere.TrimNegligibleMaterials(1e-3)

		if atmosphere.IsEmpty() {
			// unfortunatelly, no atmosphere is sustainable at this planet
			surfaceConditions.P = phys.Bar(0)
		}
	} else {
		atmosphere = material.NewMaterialCompound()
	}

	ctx.atmosphere = atmosphere
	ctx.seaLevelPressure = surfaceConditions.P
	ctx.averageTemp = surfaceConditions.T
	ctx.weatherHarshness = 0

	if canHaveAtmosphere {
		ctx.weatherHarshness = ctx.rnd.Float64()
	}

	ctx.oceanLevel = -1
	ctx.oceans = oceans
	if !oceans.IsEmpty() {
		r := ctx.rnd.Float64()
		pseudoBell := utils.Unlerp(-1, 1, utils.PseudoBell(r))
		level := utils.Lerp(-0.9, 1.1, pseudoBell) // tends to be closer to 0
		if level > 1 {
			level = 1
		}

		ctx.oceanLevel = level
	}

	ctx.snow = snow
}

func (ctx *planetGenContext) normalizeOceanLevel() {
	if ctx.oceans.IsEmpty() {
		return
	}

	// normalizing ocean level to be always 0
	for _, tile := range ctx.tiles {
		if tile.Elevation < ctx.oceanLevel {
			tile.Elevation = utils.Unlerp(-1.0, ctx.oceanLevel, tile.Elevation) - 1
		} else {
			tile.Elevation = utils.Unlerp(ctx.oceanLevel, 0.999, tile.Elevation)
		}
	}
	ctx.oceanLevel = 0
}

func (ctx *planetGenContext) calculateConditionsPerTile() {
	grid := ctx.grid
	g := phys.CalculatePlanetGravity(ctx.params.Mass, ctx.params.Radius).EarthGs()
	atmMolarMass := ctx.atmosphere.GetAverageMolarMass()
	oceanLevel := ctx.oceanLevel

	maxTemp := ctx.averageTemp * 1.05
	minTemp := ctx.averageTemp * 0.95
	axisTilt := ctx.params.AxisTilt.Radians()

	for i := 0; i < grid.Size(); i++ {
		tile := ctx.tiles[i]
		elevation := tile.Elevation - oceanLevel
		tileLon := math.Cos(grid.GetCoords(i).Y)

		// good enough for now
		tile.AverageTemp = minTemp + (maxTemp-minTemp)*phys.Temperature(math.Cos(axisTilt)*math.Sin(tileLon))

		if ctx.seaLevelPressure > 0 {
			coeff := math.Exp(-g * ctx.relativeElevationsScale.Kilometers() * 1e-3 * elevation * atmMolarMass / 21500)
			tile.Pressure = ctx.seaLevelPressure * phys.Pressure(coeff)
		}
	}
}

// Assigns basic biomes: solid for high tiles, regolith for lower ones, ocean for those below ocean level
func (ctx *planetGenContext) assignBasicBiomes() {
	const MOUNTAIN_ELEVATION_DIFF_THRESHOLD = 0.2

	grid := ctx.grid
	n := grid.Size()

	oceanLevel := ctx.oceanLevel
	pressureCoeff := utils.Unlerp(phys.Pascals(0), phys.Bar(100), ctx.seaLevelPressure)
	pressureCoeff = utils.Clamp(pressureCoeff, 0, 1)
	erosion := utils.Lerp(0.0, 0.5, pressureCoeff)
	if oceanLevel > -1 {
		erosion += 0.2
	}

	solidColor := globaldata.Materials().GetByID("corium").GetColor(material.StateSolid).Reflective
	regolithColor := solidColor.Multiply(1.1)
	oceanColor := ctx.oceans.GetAverageColorForState(material.StateLiquid).Reflective

	for i := 0; i < n; i++ {
		tile := ctx.tiles[i]
		elevation := tile.Elevation

		if elevation < oceanLevel {
			tile.SurfaceType = world.BiomeSurfaceLiquid
			tile.Color = oceanColor
			continue
		}

		neighbours := ctx.grid.GetConnections(i).Items()
		avgElevDiff := 0.0
		for _, ni := range neighbours {
			nelev := ctx.tiles[ni].Elevation
			avgElevDiff += math.Abs(nelev - elevation)
		}
		avgElevDiff /= float64(len(neighbours))

		if avgElevDiff >= MOUNTAIN_ELEVATION_DIFF_THRESHOLD {
			tile.SurfaceType = world.BiomeSurfaceSolid
			tile.Color = solidColor
			continue
		}

		tile.SurfaceType = world.BiomeSurfaceRegolith
		tile.Color = regolithColor
	}
}

// Assigns more biomes that depend on tile conditions, e.g. adds ice and snow
func (ctx *planetGenContext) assignConditionalBiomes() {
	n := ctx.grid.Size()
	oceans := ctx.oceans
	oceansAndSnow := material.MergeCompounds(ctx.snow, oceans)

	for i := 0; i < n; i++ {
		tile := ctx.tiles[i]

		switch tile.SurfaceType {
		case world.BiomeSurfaceLiquid:
			separated := oceans.Separate(material.PhaseDiagramPoint{
				P: tile.Pressure,
				T: tile.AverageTemp,
			})

			if !separated[material.StateSolid].IsEmpty() {
				tile.SurfaceType = world.BiomeSurfaceIce
				tile.Color = separated[material.StateSolid].GetAverageColorForState(material.StateSolid).Reflective
			}

		case world.BiomeSurfaceSolid:
			separated := oceansAndSnow.Separate(material.PhaseDiagramPoint{
				P: tile.Pressure,
				T: tile.AverageTemp,
			})

			if !separated[material.StateSolid].IsEmpty() {
				tile.SurfaceType = world.BiomeSurfaceSnow
				tile.Color = separated[material.StateSolid].GetAverageColorForState(material.StateSolid).Reflective
			}
		}
	}
}
