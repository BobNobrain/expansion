package worldgen

import (
	"math/rand"
	"srv/internal/utils/phys"
	"srv/internal/world"
)

type ExploreOptions struct {
	SystemID world.StarSystemID
	Stars    []*world.Star
	Orbits   map[world.CelestialID]world.OrbitData
}

func (gen *WorldGen) Explore(options ExploreOptions) GeneratedStarSystemData {
	rnd := gen.rnd.ForStarSystem(options.SystemID)

	orbitsCopy := make(map[world.CelestialID]world.OrbitData)
	for id, orbit := range options.Orbits {
		orbitsCopy[id] = orbit
	}

	ctx := newExploredSystemGenerator(rnd, &GeneratedStarSystemData{
		SystemID: options.SystemID,
		Stars:    options.Stars,
		Orbits:   orbitsCopy,
		Bodies:   make(map[world.CelestialID]GeneratedCelestialData),
	})

	// ctx.generateSpaceConditions()
	ctx.generatePlanets()
	// ctx.generateAsteroids()

	return *ctx.system
}

type exploredSystemGenerator struct {
	rnd    *rand.Rand
	system *GeneratedStarSystemData

	systemAge phys.Age

	nextFreeOrbitDistance phys.Distance

	coSnowline              phys.Distance
	waterSnowline           phys.Distance
	silicateSublimationLine phys.Distance
}

func newExploredSystemGenerator(
	rnd *rand.Rand,
	system *GeneratedStarSystemData,
) *exploredSystemGenerator {
	ctx := &exploredSystemGenerator{
		rnd:    rnd,
		system: system,
	}
	nStars := len(system.Stars)

	combinedCenterStar := CombinedStarForEstimates(system.Stars)

	icelines := EstimateIcelines(combinedCenterStar.Temperature, combinedCenterStar.Radius)

	ctx.silicateSublimationLine = icelines.Silicate
	ctx.waterSnowline = icelines.Water
	ctx.coSnowline = icelines.CO

	if nStars > 1 {
		secondaryOrbit := system.Orbits[system.Stars[1].ID]
		ctx.nextFreeOrbitDistance = secondaryOrbit.Ellipse.SemiMajor.Mul(10)
	}

	// cannot start orbits where planets cannot form
	ctx.nextFreeOrbitDistance = ctx.nextFreeOrbitDistance.Max(ctx.silicateSublimationLine.Mul(2))

	return ctx
}
