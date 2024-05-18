package worldgen

import (
	"srv/internal/utils"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"srv/internal/world"
)

func (ctx *exploredSystemGenerator) generatePlanets() {
	planetCount := 0
	for ctx.nextFreeOrbitDistance.AstronomicalUnits() < 100 {
		d := ctx.nextFreeOrbitDistance
		ctx.nextFreeOrbitDistance = d.Mul(utils.Lerp(1.3, 2.1, ctx.rnd.Float64()))

		if d.IsLessThan(ctx.silicateSublimationLine) {
			continue
		}

		if d.IsLessThan(ctx.waterSnowline) {
			ctx.generateRockyPlanet(ctx.system.Stars[0], planetCount)
			planetCount++
		}

		if d.IsLessThan(ctx.coSnowline) {
			ctx.generateGasGiantPlanet(ctx.system.Stars[0], planetCount)
			planetCount++
		}
	}

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
	aroundStar *world.Star,
	i int,
) {
	d := ctx.nextFreeOrbitDistance

	orbit := generateLowEccentricityOrbit(ctx.rnd, d)

	planet := GeneratedCelestialData{
		ID:    world.CreatePlanetID(aroundStar.ID, i),
		Level: CelestialBodyLevelPlanet,
		Params: world.CelestialBodyParams{
			Radius:   phys.Kilometers(utils.Lerp(2000., 20000, ctx.rnd.Float64())),
			Age:      phys.BillionYears(utils.Lerp(0.9, 0.99, ctx.rnd.Float64()) * ctx.systemAge.BillionYears()),
			AxisTilt: geom.FullCircles(ctx.rnd.NormFloat64() * 0.2),
		},
	}

	ctx.system.placeCelestial(planet, orbit)
}

func (ctx *exploredSystemGenerator) generateGasGiantPlanet(
	aroundStar *world.Star,
	i int,
) {
	d := ctx.nextFreeOrbitDistance

	orbit := generateLowEccentricityOrbit(ctx.rnd, d)

	planet := GeneratedCelestialData{
		ID:    world.CreatePlanetID(aroundStar.ID, i),
		Level: CelestialBodyLevelPlanet,
		Params: world.CelestialBodyParams{
			Radius:   phys.Kilometers(utils.Lerp(2000., 20000, ctx.rnd.Float64())),
			Age:      phys.BillionYears(utils.Lerp(0.85, 0.97, ctx.rnd.Float64()) * ctx.systemAge.BillionYears()),
			AxisTilt: geom.FullCircles(ctx.rnd.NormFloat64() * 0.3),
		},
	}

	ctx.system.placeCelestial(planet, orbit)
}
