package planetgen

import "srv/internal/utils"

type noiseAndBlurElevationsOptions struct {
	NoiseAmount float64
	BlurAmount  float64
}

func (opts *noiseAndBlurElevationsOptions) defaults() *noiseAndBlurElevationsOptions {
	opts.NoiseAmount = 0.1
	opts.BlurAmount = 0.3
	return opts
}

func noiseAndBlurElevations(
	ctx *planetGenContext,
	opts *noiseAndBlurElevationsOptions,
) {
	grid := ctx.grid
	tiles := ctx.tiles
	for vi := 0; vi < grid.Size(); vi++ {
		neighbours := grid.GetConnections(vi)
		elevation := tiles[vi].Elevation

		dH := opts.NoiseAmount * (ctx.rnd.Float64()*2 - 1)

		for _, neighbour := range neighbours.Items() {
			neighbourElevation := tiles[neighbour].Elevation
			dElev := elevation - neighbourElevation
			dH += dElev * opts.BlurAmount
		}

		dH = dH / float64(neighbours.Size())

		tiles[vi].Elevation += dH
		tiles[vi].Elevation = utils.Clamp(tiles[vi].Elevation, -1, 1)
	}
}
