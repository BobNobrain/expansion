package planetgen

import (
	"math/rand"
	"srv/internal/utils/phys"
	"srv/internal/world"
)

type SolidPlanetParams struct {
	Rnd    *rand.Rand
	Radius phys.Distance
}

func GenerateSolidPlanet(params SolidPlanetParams) *world.Planet {
	planetSize := params.Radius.Kilometers() / 50_000
	if planetSize < 0.1 {
		planetSize = 0.1
	} else if planetSize > 1 {
		planetSize = 1
	}

	gridBuilder := NewGridBuilder(params.Rnd, GridBuilderOptions{
		Size:         planetSize,
		ChaosPercent: 0.15,
	})
	gridBuilder.Generate()

	planet := &world.Planet{
		Grid:     world.MeshBuilderToGrid(gridBuilder.builder),
		Tiles:    nil, // will be created later
		Features: nil, // TBD
	}

	tiles := generateTectonicLandscape(
		params.Rnd,
		planet,
		(&tectonicLandscapeOptions{}).Defaults(planet.Grid.GetNodesCount(), params.Radius),
	)

	noiseAndBlurElevations(params.Rnd, planet.Grid, tiles, (&noiseAndBlurElevationsOptions{}).defaults())

	return planet
}
