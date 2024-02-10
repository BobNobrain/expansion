package planetgen

import (
	"math/rand"
	"srv/internal/world"
)

type noiseAndBlurElevationsOptions struct {
	NoiseAmount float64
	BlurAmount  float64
}

func (opts *noiseAndBlurElevationsOptions) defaults() *noiseAndBlurElevationsOptions {
	opts.NoiseAmount = 0.1
	opts.BlurAmount = 0.1
	return opts
}

func noiseAndBlurElevations(
	rnd *rand.Rand,
	grid world.PlanetaryGrid,
	tiles *solidPlanetData,
	opts *noiseAndBlurElevationsOptions,
) {
	for vi := 0; vi < grid.GetNodesCount(); vi++ {
		neighbours := grid.GetConnectedNodes(world.PlanetaryNodeIndex(vi))
		elevation := tiles.relativeElevations[vi]

		dH := opts.NoiseAmount * (rand.Float64()*2 - 1)

		for _, neighbour := range neighbours {
			neighbourElevation := tiles.relativeElevations[neighbour]
			dElev := elevation - neighbourElevation
			dH += dElev * opts.BlurAmount
		}

		dH = dH / float64(len(neighbours))

		tiles.relativeElevations[vi] += dH
	}
}
