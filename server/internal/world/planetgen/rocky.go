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

func (ctx *surfaceGenContext) generateRockyConditions() {
	starLum := ctx.starParams.Luminosity.Suns()
	distanceFromStar := ctx.nearestStarDistance.AstronomicalUnits()
	starDistanceSquared := distanceFromStar * distanceFromStar

	planetMass := ctx.params.Mass
	planetRadius := ctx.params.Radius

	surfaceGravity := phys.CalculatePlanetGravity(ctx.params.Mass, ctx.params.Radius)
	surfaceAreaKm2 := 4 * math.Pi * ctx.params.Radius.Kilometers() * ctx.params.Radius.Kilometers()

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
		var r float64
		if ctx.rnd.Float64() < 0.7 {
			r = utils.Lerp(0, 1e-5, ctx.rnd.Float64())
		} else {
			r = utils.Lerp(1e-5, 5e-4, ctx.rnd.Float64())
		}
		atmosphereMass := planetMass.Kilograms() * r
		pressureValue := atmosphereMass / surfaceAreaKm2 *
			surfaceGravity.KilometersPerSecondSquared() / planetRadius.Kilometers()

		surfaceConditions.P = phys.Pascals(pressureValue * 1e3)
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
		atmosphericHeight := surfaceConditions.T.CalcAtmosphereHeight(surfaceGravity, atmosphere.GetAverageMolarMass())
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

	ctx.surface.Atmosphere = GeneratedAtmosphere{
		Contents:         atmosphere,
		SeaLevelPressure: surfaceConditions.P,
		AverageTemp:      surfaceConditions.T,
		WeatherHarshness: 0,
	}

	if canHaveAtmosphere {
		ctx.surface.Atmosphere.WeatherHarshness = ctx.rnd.Float64()
	}

	ctx.surface.Oceans = GeneratedOceans{
		Level:    -1,
		Contents: oceans,
	}
	if !oceans.IsEmpty() {
		r := ctx.rnd.Float64()
		pseudoBell := utils.Unlerp(-1, 1, utils.PseudoBell(r))
		level := utils.Lerp(-0.9, 1.1, pseudoBell) // tends to be closer to 0
		if level > 1 {
			level = 1
		}
		ctx.surface.Oceans.Level = level
	}

	ctx.surface.Snow = snow
}

func (ctx *surfaceGenContext) calculateConditionsPerTile() {
	grid := ctx.surface.Grid
	g := phys.CalculatePlanetGravity(ctx.params.Mass, ctx.params.Radius).EarthGs()
	atmMolarMass := ctx.surface.Atmosphere.Contents.GetAverageMolarMass()
	oceanLevel := ctx.surface.Oceans.Level

	maxTemp := ctx.surface.Atmosphere.AverageTemp * 1.05
	minTemp := ctx.surface.Atmosphere.AverageTemp * 0.95
	axisTilt := ctx.params.AxisTilt.Radians()

	for i := 0; i < grid.Size(); i++ {
		tile := ctx.surface.Tiles[i]
		elevation := tile.Elevation - oceanLevel
		tileLon := math.Cos(grid.GetCoords(i).Y)

		// good enough for now
		tile.AverageTemp = minTemp + (maxTemp-minTemp)*phys.Temperature(math.Cos(axisTilt)*math.Sin(tileLon))

		if ctx.surface.Atmosphere.SeaLevelPressure > 0 {
			coeff := math.Exp(-g * ctx.surface.RelativeElevationsScale.Kilometers() * 1e-3 * elevation * atmMolarMass / 21500)
			tile.Pressure = ctx.surface.Atmosphere.SeaLevelPressure * phys.Pressure(coeff)
		}
	}
}

// Assigns basic biomes: solid for high tiles, regolith for lower ones, ocean for those below ocean level
func (ctx *surfaceGenContext) assignBasicBiomes() {
	grid := ctx.surface.Grid
	n := grid.Size()

	oceanLevel := ctx.surface.Oceans.Level
	pressureCoeff := utils.Unlerp(phys.Pascals(0), phys.Bar(100), ctx.surface.Atmosphere.SeaLevelPressure)
	pressureCoeff = utils.Clamp(pressureCoeff, 0, 1)
	erosion := utils.Lerp(0.0, 0.4, pressureCoeff)
	if oceanLevel > -1 {
		erosion += 0.1
	}

	solidColor := globaldata.Materials().GetByID("corium").GetColor(material.StateSolid).Reflective
	regolithColor := solidColor.Multiply(1.1)
	oceanColor := ctx.surface.Oceans.Contents.GetAverageColorForState(material.StateLiquid).Reflective

	for i := 0; i < n; i++ {
		tile := ctx.surface.Tiles[i]
		elevation := tile.Elevation

		if elevation < oceanLevel {
			tile.SurfaceType = world.BiomeSurfaceLiquid
			tile.Color = oceanColor
		} else if elevation < oceanLevel+erosion {
			tile.SurfaceType = world.BiomeSurfaceRegolith
			tile.Color = regolithColor
		} else {
			tile.SurfaceType = world.BiomeSurfaceSolid
			tile.Color = solidColor
		}
	}
}

// Assigns more biomes that depend on tile conditions, e.g. adds ice and snow
func (ctx *surfaceGenContext) assignConditionalBiomes() {
	grid := ctx.surface.Grid
	n := grid.Size()
	oceans := ctx.surface.Oceans.Contents
	snow := ctx.surface.Snow
	oceansAndSnow := material.MergeCompounds(snow, oceans)

	for i := 0; i < n; i++ {
		tile := ctx.surface.Tiles[i]

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

// Marks tiles with suitable conditions as fertile (BiomeSurfaceSoil)
func (ctx *surfaceGenContext) assignFertileBiomes() {
	// TODO:
	// 1. check if applicable at all: should have a substantial amount of h2o and o2 in snow/oceans/atmosphere
	// 2. check if tile conditions are not too extreme: T in -20...70 C, P in 0.3...10 bar
	// 3. check if tile conditions can sustain liquid h2o and gaseous o2
	// 4. check if tile is not an ocean
}
