package worldgen

import (
	"math/rand"
	"srv/internal/game"
	"srv/internal/globals/assets"
	"srv/internal/utils"
	"srv/internal/utils/geom"
)

type GalaxyGeneratorConfig struct {
	Grid              game.GalacticGrid
	NStars            int
	Sleeves           []*assets.GalaxySleeveConfig
	MaxStarsDensityAt float64

	BinarySystemProb  float64
	TernarySystemProb float64
}

func (gen *WorldGen) GenerateGalaxy(opts GalaxyGeneratorConfig) []GeneratedStarSystemData {
	rnd := gen.rnd.Global()

	if opts.BinarySystemProb == 0 {
		opts.BinarySystemProb = 0.2
	}
	if opts.TernarySystemProb == 0 {
		opts.TernarySystemProb = 0.05
	}

	result := make([]GeneratedStarSystemData, opts.NStars)
	registeredSystems := make(map[game.GalacticSectorID]int)

	numerationRandomOffsets := make(map[game.GalacticSectorID]int)
	for _, sector := range opts.Grid.GetSectors() {
		sectorRnd := gen.rnd.ForGalaxySector(sector.ID)
		numerationRandomOffsets[sector.ID] = sectorRnd.Intn(1000)
	}

	for i := 0; i < opts.NStars; i++ {
		sleeve := pickSleeve(rnd, opts.Sleeves)
		var coords game.GalacticCoords
		if sleeve == nil {
			coords = generateScatterStarCoords(rnd, opts)
		} else {
			coords = generateSleeveStarCoords(sleeve, rnd, opts)
		}

		systemId := generateSystemID(coords, opts, registeredSystems, numerationRandomOffsets)
		system := GeneratedStarSystemData{
			SystemID: systemId,
			Coords:   coords,
		}
		gen.generateUnexploredSystem(opts, &system)

		result[i] = system
	}

	return result
}

func generateScatterStarCoords(
	rnd *rand.Rand,
	opts GalaxyGeneratorConfig,
) game.GalacticCoords {
	r := sampleRndForR(rnd, opts.MaxStarsDensityAt)
	radius := utils.Lerp(game.InnerRimRadius, game.OuterRimRadius, r)
	h := generateHeight(rnd)

	coords := game.GalacticCoords{
		R:     radius,
		Theta: geom.FullCircles(rnd.Float64()),
		H:     game.GalacticCoordsHeight(h),
	}

	return coords
}

func generateSleeveStarCoords(
	sleeve *assets.GalaxySleeveConfig,
	rnd *rand.Rand,
	opts GalaxyGeneratorConfig,
) game.GalacticCoords {
	r := sampleRndForR(rnd, opts.MaxStarsDensityAt)
	radius := utils.Lerp(game.InnerRimRadius, game.OuterRimRadius, r)
	thetaStrict := geom.FullCircles(r/sleeve.Twist) + geom.FullCircles(sleeve.Pos)
	sign := 1.
	if rnd.Float64() < 0.5 {
		sign = -1.
	}
	thetaVariated := thetaStrict + geom.Radians(((rnd.Float64()*(1-r/2)*sleeve.Width)/2)*sign)
	height := generateHeight(rnd)

	coords := game.GalacticCoords{
		R:     radius,
		Theta: thetaVariated,
		H:     game.GalacticCoordsHeight(height),
	}

	return coords
}

func pickSleeve(rnd *rand.Rand, sleeves []*assets.GalaxySleeveConfig) *assets.GalaxySleeveConfig {
	r := rnd.Float64()
	acc := 0.0
	for _, sleeve := range sleeves {
		acc += sleeve.Density
		if r < acc {
			return sleeve
		}
	}
	return nil
}

func sampleRndForR(rnd *rand.Rand, maxDensityAt float64) float64 {
	r := rnd.Float64() * rnd.Float64()
	if rnd.Float64() < maxDensityAt {
		return maxDensityAt * (1 - r)
	}
	return r*(1-maxDensityAt) + maxDensityAt
}

func generateHeight(rnd *rand.Rand) float64 {
	h := rnd.Float64() * rnd.Float64() * float64(game.MaxHeightDispacement)
	if rnd.Float64() < 0.5 {
		return -h
	}
	return h
}

const maxExpectedStarsPerSector = 1000 // this follows from star id format '<SECTOR_ID>-000'
const arbitraryPrimeNumber = 203       // actually must be coprime with maxExpectedStarsPerSector

func generateSystemID(
	coords game.GalacticCoords,
	opts GalaxyGeneratorConfig,
	registeredStars map[game.GalacticSectorID]int,
	randomOffsets map[game.GalacticSectorID]int,
) game.StarSystemID {
	sector := opts.Grid.GetContainingSectorCoords(coords)
	nStarsAlreadyInSector := registeredStars[sector.ID]
	randomOffset := randomOffsets[sector.ID]

	registeredStars[sector.ID] += 1

	// cycling through 0..999 numbers in some pseudo-random fashion
	starIndex := ((nStarsAlreadyInSector + randomOffset) * arbitraryPrimeNumber) % maxExpectedStarsPerSector
	return game.CreateStarSystemID(sector.ID, starIndex)
}

func (gen *WorldGen) generateUnexploredSystem(opts GalaxyGeneratorConfig, system *GeneratedStarSystemData) {
	system.Bodies = make(map[game.CelestialID]GeneratedCelestialData)
	system.Orbits = make(map[game.CelestialID]game.OrbitData)

	ctx := newUnexploredSystemGenerator(gen.rnd.ForStarSystem(system.SystemID), system, opts)
	ctx.generate()
}
