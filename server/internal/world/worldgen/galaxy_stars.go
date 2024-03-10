package worldgen

import (
	"math/rand"
	"srv/internal/domain"
	"srv/internal/utils"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/hrd"
	"srv/internal/world"
)

type GalaxyGeneratorConfigSleeve struct {
	Position        float64
	Width           float64
	StarsPercentage float64
	Twist           float64
}

type GalaxyGeneratorConfig struct {
	Rnd               *rand.Rand
	Grid              world.GalacticGrid
	NStars            int
	Sleeves           []*GalaxyGeneratorConfigSleeve
	MaxStarsDensityAt float64
}

func GenerateGalaxyStars(opts GalaxyGeneratorConfig) []*domain.StarSystem {
	result := make([]*domain.StarSystem, opts.NStars)
	registeredStars := make(map[domain.GalacticSectorID]int)

	numerationRandomOffsets := make(map[domain.GalacticSectorID]int)
	for _, sector := range opts.Grid.GetSectors() {
		numerationRandomOffsets[sector.ID] = opts.Rnd.Intn(1000)
	}

	for i := 0; i < opts.NStars; i++ {
		sleeve := pickSleeve(opts.Rnd, opts.Sleeves)
		var star *domain.StarSystem
		if sleeve == nil {
			star = generateScatterStar(opts, registeredStars, numerationRandomOffsets)
		} else {
			star = generateSleeveStar(sleeve, opts, registeredStars, numerationRandomOffsets)
		}

		result[i] = star
	}

	return result
}

func generateScatterStar(
	opts GalaxyGeneratorConfig,
	registeredStars map[domain.GalacticSectorID]int,
	randomOffsets map[domain.GalacticSectorID]int,
) *domain.StarSystem {
	r := sampleRndForR(opts.Rnd, opts.MaxStarsDensityAt)
	radius := utils.Lerp(domain.InnerRimRadius, domain.OuterRimRadius, r)
	h := generateHeight(opts.Rnd)

	coords := domain.GalacticCoords{
		R:     radius,
		Theta: domain.GalacticCoordsAngle(geom.FullCircles(opts.Rnd.Float64())),
		H:     domain.GalacticCoordsHeight(h),
	}

	result := &domain.StarSystem{
		StarID:   generateStarID(coords, opts, registeredStars, randomOffsets),
		StarData: generateStarData(opts.Rnd),
		Planets:  make([]*domain.CelestialBody, 0),
	}
	result.StarData.Coords = coords

	return result
}

func generateSleeveStar(
	sleeve *GalaxyGeneratorConfigSleeve,
	opts GalaxyGeneratorConfig,
	registeredStars map[domain.GalacticSectorID]int,
	randomOffsets map[domain.GalacticSectorID]int,
) *domain.StarSystem {
	r := sampleRndForR(opts.Rnd, opts.MaxStarsDensityAt)
	radius := utils.Lerp(domain.InnerRimRadius, domain.OuterRimRadius, r)
	thetaStrict := geom.FullCircles(r/sleeve.Twist) + geom.FullCircles(sleeve.Position)
	sign := 1.
	if opts.Rnd.Float64() < 0.5 {
		sign = -1.
	}
	thetaVariated := thetaStrict + geom.Radians(((opts.Rnd.Float64()*(1-r/2)*sleeve.Width)/2)*sign)
	height := generateHeight(opts.Rnd)

	coords := domain.GalacticCoords{
		R:     radius,
		Theta: domain.GalacticCoordsAngle(thetaVariated),
		H:     domain.GalacticCoordsHeight(height),
	}

	result := &domain.StarSystem{
		StarID:   generateStarID(coords, opts, registeredStars, randomOffsets),
		StarData: generateStarData(opts.Rnd),
		Planets:  make([]*domain.CelestialBody, 0),
	}

	result.StarData.Coords = domain.GalacticCoords{
		R:     radius,
		Theta: domain.GalacticCoordsAngle(thetaVariated),
		H:     domain.GalacticCoordsHeight(height),
	}

	return result
}

func pickSleeve(rnd *rand.Rand, sleeves []*GalaxyGeneratorConfigSleeve) *GalaxyGeneratorConfigSleeve {
	r := rnd.Float64()
	acc := 0.0
	for _, sleeve := range sleeves {
		acc += sleeve.StarsPercentage
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
	h := rnd.Float64() * rnd.Float64() * float64(domain.MaxHeightDispacement)
	if rnd.Float64() < 0.5 {
		return -h
	}
	return h
}

var (
	minStarAge = phys.BillionYears(1e-3)
	maxStarAge = phys.BillionYears(5)
)

func generateStarData(rnd *rand.Rand) *domain.StarData {
	age := utils.Lerp(minStarAge, maxStarAge, rnd.Float64())
	starData := hrd.SampleHRDiagram(hrd.HRDiagramInput{
		Age: age,
		Rnd: rnd,
	})

	return &domain.StarData{
		Age:         age,
		Temperature: starData.Temp,
		Luminosity:  starData.Luminosity,
		Mass:        starData.Mass,
		Radius:      starData.Radius,
	}
}

const maxExpectedStarsPerSector = 1000 // this follows from star id format '<SECTOR_ID>-000'
const arbitraryPrimeNumber = 203       // actually must be coprime with maxExpectedStarsPerSector

func generateStarID(
	coords domain.GalacticCoords,
	opts GalaxyGeneratorConfig,
	registeredStars map[domain.GalacticSectorID]int,
	randomOffsets map[domain.GalacticSectorID]int,
) domain.CelestialID {
	sector := opts.Grid.GetContainingSectorCoords(coords)
	nStarsAlreadyInSector := registeredStars[sector.ID]
	randomOffset := randomOffsets[sector.ID]

	registeredStars[sector.ID] += 1

	// cycling through 0..999 numbers in some pseudo-random fashion
	starIndex := ((nStarsAlreadyInSector + randomOffset) * arbitraryPrimeNumber) % maxExpectedStarsPerSector
	return domain.CreateStarID(sector.ID, starIndex)
}
