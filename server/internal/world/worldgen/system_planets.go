package worldgen

import (
	"math"
	"srv/internal/globals/logger"
	"srv/internal/utils"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"srv/internal/world"
)

func (ctx *exploredSystemGenerator) generatePlanets() {
	planetCount := 0

	// this should give us 6-18 planets
	maxOrbitDistance := ctx.silicateSublimationLine.AstronomicalUnits() * utils.Lerp(50., 200, ctx.rnd.Float64())
	if maxOrbitDistance > 70 {
		maxOrbitDistance = 70
	}

	logger.Debug(logger.FromMessage("worldgen", "generating planets").
		WithDetail("si subl (au)", ctx.silicateSublimationLine.AstronomicalUnits()).
		WithDetail("id", ctx.system.SystemID),
	)

	for ctx.nextFreeOrbitDistance.AstronomicalUnits() < maxOrbitDistance {
		d := ctx.nextFreeOrbitDistance
		ctx.nextFreeOrbitDistance = d.Mul(utils.Lerp(1.3, 2.1, ctx.rnd.Float64()))

		if d.IsLessThan(ctx.silicateSublimationLine) {
			continue
		}

		if d.IsLessThan(ctx.waterSnowline) {
			ctx.generateRockyPlanet(ctx.system.Stars[0], planetCount, d)
			planetCount++
			continue
		}

		if d.IsLessThan(ctx.coSnowline) {
			ctx.generateGasGiantPlanet(ctx.system.Stars[0], planetCount, d)
			planetCount++
			continue
		}

		logger.Debug(logger.FromMessage("worldgen", "next orbit").
			WithDetail("was", d.AstronomicalUnits()).
			WithDetail("next", ctx.nextFreeOrbitDistance.AstronomicalUnits()),
		)
	}

	logger.Debug(logger.FromMessage("worldgen", "generated planets").
		WithDetail("count", planetCount).
		WithDetail("id", ctx.system.SystemID),
	)

	if len(ctx.system.Stars) == 3 {
		ctx.clearPlanetsFromTernaryStar()
	}
}

func (ctx *exploredSystemGenerator) clearPlanetsFromTernaryStar() {
	third := ctx.system.Stars[2]
	orbitRadius := ctx.system.Orbits[third.ID].Ellipse.SemiMajor
	unsafeStart := orbitRadius.Mul(0.8)
	unsafeEnd := orbitRadius.Mul(1.5)
	for _, body := range ctx.system.Bodies {
		if body.Level != CelestialBodyLevelPlanet {
			continue
		}

		orbit := ctx.system.Orbits[body.ID]
		d := orbit.Ellipse.SemiMajor
		if d.IsLessThan(unsafeStart) || unsafeEnd.IsLessThan(d) {
			// this planet is safe
			continue
		}

		ctx.system.removeCelestial(body.ID)
	}
}

func (ctx *exploredSystemGenerator) generateRockyPlanet(
	aroundStar world.Star,
	i int,
	d phys.Distance,
) {
	orbit := generateLowEccentricityOrbit(ctx.rnd, d)

	massEarths := utils.Lerp(0.01, 2.04, ctx.rnd.Float64())
	rKm := 6400 * 1.008 * math.Pow(massEarths, 0.279)

	planet := GeneratedCelestialData{
		ID:    world.CreatePlanetID(aroundStar.ID, i),
		Level: CelestialBodyLevelPlanet,
		Params: world.CelestialSurfaceParams{
			Mass:   phys.EarthMasses(massEarths),
			Radius: phys.Kilometers(rKm),
			Class:  world.CelestialBodyClassTerrestial,

			Age:       phys.BillionYears(utils.Lerp(0.9, 0.99, ctx.rnd.Float64()) * ctx.systemAge.BillionYears()),
			AxisTilt:  geom.FullCircles(ctx.rnd.NormFloat64() * 0.2),
			DayLength: phys.Months(utils.Lerp(0.02, 0.2, ctx.rnd.Float64())), // TODO
		},
		Size: estimateGridSize(rKm),
	}

	ctx.system.placeCelestial(planet, orbit)
}

func (ctx *exploredSystemGenerator) generateGasGiantPlanet(
	aroundStar world.Star,
	i int,
	d phys.Distance,
) {
	orbit := generateLowEccentricityOrbit(ctx.rnd, d)

	massEarths := utils.Lerp(2.04, 20_000, ctx.rnd.Float64())
	isNeptunian := massEarths < 132
	radiusEarths := 0.0
	if isNeptunian {
		radiusEarths = 0.808 * math.Pow(massEarths, 0.589)
	} else {
		radiusEarths = 17.745 * math.Pow(massEarths, -0.044)
	}

	planet := GeneratedCelestialData{
		ID:    world.CreatePlanetID(aroundStar.ID, i),
		Level: CelestialBodyLevelPlanet,
		Params: world.CelestialSurfaceParams{
			Mass:   phys.EarthMasses(massEarths),
			Radius: phys.Kilometers(6400 * radiusEarths),
			Class:  world.CelestialBodyClassGaseous,

			Age:       phys.BillionYears(utils.Lerp(0.85, 0.97, ctx.rnd.Float64()) * ctx.systemAge.BillionYears()),
			AxisTilt:  geom.FullCircles(ctx.rnd.NormFloat64() * 0.3),
			DayLength: phys.Months(utils.Lerp(0.005, 0.05, ctx.rnd.Float64())), // TODO
		},
		Size: estimateGridSize(6400 * radiusEarths),
	}

	ctx.system.placeCelestial(planet, orbit)
}

func estimateGridSize(rKm float64) int {
	const minGridSubdivisions int = 5
	const maxGridSubdivisions int = 16
	planetSize := rKm / 50_000
	if planetSize < 0.1 {
		planetSize = 0.1
	} else if planetSize > 1 {
		planetSize = 1
	}
	subdivisions := minGridSubdivisions + int(float64(maxGridSubdivisions-minGridSubdivisions)*planetSize)
	nVerticies := 20*(subdivisions+1)*subdivisions/2 - 30*(subdivisions-2) - 12*5
	estimate := (nVerticies / 10) * 10
	return estimate
}
