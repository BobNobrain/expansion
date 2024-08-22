package planetgen

import (
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
	ctx *surfaceGenContext,
	opts *noiseAndBlurElevationsOptions,
) {
	grid := ctx.surface.Grid
	tiles := ctx.surface.Tiles
	for vi := 0; vi < grid.GetNodesCount(); vi++ {
		neighbours := grid.GetConnectedNodes(world.PlanetaryNodeIndex(vi))
		elevation := tiles[vi].Elevation

		dH := opts.NoiseAmount * (ctx.rnd.Float64()*2 - 1)

		for _, neighbour := range neighbours {
			neighbourElevation := tiles[neighbour].Elevation
			dElev := elevation - neighbourElevation
			dH += dElev * opts.BlurAmount
		}

		dH = dH / float64(len(neighbours))

		tiles[vi].Elevation += dH
	}
}
