package worldgen

import (
	"math/rand"
	"slices"
	"srv/internal/utils"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/hrd"
	"srv/internal/world"
)

type unexploredSystemGenerator struct {
	rnd    *rand.Rand
	system *GeneratedStarSystemData
	opts   GalaxyGeneratorConfig

	nextFreeOrbitDistance phys.Distance
}

func newUnexploredSystemGenerator(
	rnd *rand.Rand,
	system *GeneratedStarSystemData,
	opts GalaxyGeneratorConfig,
) *unexploredSystemGenerator {
	return &unexploredSystemGenerator{
		rnd:    rnd,
		system: system,
		opts:   opts,
	}
}

func (ctx *unexploredSystemGenerator) generate() {
	system := ctx.system

	nStars := 1
	rand := ctx.rnd.Float64()
	if rand < ctx.opts.BinarySystemProb {
		nStars = 2
	}
	if rand < ctx.opts.TernarySystemProb {
		nStars = 3
	}

	system.Stars = make([]*world.Star, nStars)
	isSingular := nStars == 1

	for i := 0; i < nStars; i++ {
		data := generateStarData(ctx.rnd)
		system.Stars[i] = &world.Star{
			Params: data,
		}
	}

	// we should sort the stars by their mass
	slices.SortFunc(system.Stars, func(a, b *world.Star) int {
		al := a.Params.Mass.SolarMasses()
		bl := b.Params.Mass.SolarMasses()
		if al < bl {
			return 1
		}
		if al > bl {
			return -1
		}
		return 0
	})

	// and then assign their ids
	for i := 0; i < nStars; i++ {
		system.Stars[i].ID = world.CreateStarID(system.SystemID, i, isSingular)
	}

	// and then maybe swap the 2nd with the 3rd
	if nStars == 3 && ctx.rnd.Float32() < 0.3 {
		second := system.Stars[1]
		system.Stars[1] = system.Stars[2]
		system.Stars[2] = second
	}

	if nStars == 2 {
		ctx.generateBinaryStarsOrbits()
	}
	if nStars == 3 {
		ctx.generateTernaryStarsOrbits()
	}
}

var (
	minStarAge = phys.BillionYears(1e-3)
	maxStarAge = phys.BillionYears(5)
)

func generateStarData(rnd *rand.Rand) world.StarParams {
	age := utils.Lerp(minStarAge, maxStarAge, rnd.Float64())
	starData := hrd.SampleHRDiagram(hrd.HRDiagramInput{
		Age: age,
		Rnd: rnd,
	})

	return world.StarParams{
		Age:         age,
		Temperature: starData.Temp,
		Luminosity:  starData.Luminosity,
		Mass:        starData.Mass,
		Radius:      starData.Radius,
	}
}

func (ctx *unexploredSystemGenerator) generateBinaryStarsOrbits() {
	system := ctx.system
	rnd := ctx.rnd

	// this shall be a good enough approximation
	mainStar := system.Stars[0]
	secondaryStar := system.Stars[1]

	mainRAu := mainStar.Params.Radius.AstronomicalUnits()
	secondaryRAu := secondaryStar.Params.Radius.AstronomicalUnits()

	minDAu := 1000 * (mainRAu + secondaryRAu)
	if minDAu < 1 {
		minDAu = 1
	}

	maxDAu := 10_000 * (mainRAu + secondaryRAu)
	if maxDAu > 100 {
		maxDAu = 100
	}

	dAu := utils.Lerp(minDAu, maxDAu, rnd.Float64())
	// we will make double star systems have relatively low eccentricity,
	// so they do not screw up planet orbits
	e := utils.Lerp(0, 0.05, rnd.Float64())

	mainM := mainStar.Params.Mass.SolarMasses()
	secondaryM := secondaryStar.Params.Mass.SolarMasses()
	relation := secondaryM / (mainM + secondaryM)

	// TODO: figure out the math behind this semimajor relation
	mainOrbit := phys.EllipticOrbit{
		SemiMajor:    phys.AstronomicalUnits(dAu * (1 + relation)),
		Eccentricity: e,
	}

	secondaryOrbit := phys.EllipticOrbit{
		SemiMajor:    phys.AstronomicalUnits(dAu * (1 + relation)),
		Eccentricity: e,
	}

	system.Orbits[mainStar.ID] = world.OrbitData{
		Center:  world.NoCelestialID,
		Ellipse: mainOrbit,
		// all angular params are zero
	}

	system.Orbits[secondaryStar.ID] = world.OrbitData{
		Center:   world.NoCelestialID,
		Ellipse:  secondaryOrbit,
		Rotation: geom.FullCircles(0.5), // so the orbits oppose each other
		// all other angular params are also zero
	}

	// this should be safe enough
	ctx.nextFreeOrbitDistance = secondaryOrbit.SemiMajor.Mul(10)
}

func (ctx *unexploredSystemGenerator) generateTernaryStarsOrbits() {
	// generate 2 of them somewhat close
	ctx.generateBinaryStarsOrbits()

	// and then place the third far away
	thirdStarDistance := ctx.nextFreeOrbitDistance.Mul(utils.Lerp(2.5, 10.0, ctx.rnd.Float64()))
	thirdStar := ctx.system.Stars[2]

	ctx.system.Orbits[thirdStar.ID] = world.OrbitData{
		Center: world.NoCelestialID,
		Ellipse: phys.EllipticOrbit{
			SemiMajor:    thirdStarDistance,
			Eccentricity: utils.Lerp(0, 0.1, ctx.rnd.Float64()),
		},
		Rotation:    geom.FullCircles(ctx.rnd.Float64()),
		Inclination: geom.Radians(0),
	}
}
