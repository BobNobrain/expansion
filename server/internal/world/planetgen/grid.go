package planetgen

import (
	"srv/internal/utils"
	"srv/internal/world"
)

func (ctx *planetGenContext) generateGrid() {
	planetSize := utils.Clamp(ctx.params.Radius.Kilometers()/50_000, 0.1, 1.0)

	gridBuilder := NewGridBuilder(ctx.rnd, GridBuilderOptions{
		Size:         planetSize,
		ChaosPercent: 0.15,
	})
	grid := gridBuilder.Generate()

	// grid := gridBuilder.builder.BuildGraph()

	ctx.grid = grid
	ctx.relativeElevationsScale = ctx.params.Radius.Mul(utils.Lerp(5e-4, 3e-3, ctx.rnd.Float64()))
	ctx.tiles = make([]*generatedTileData, grid.Size())
	for i := 0; i < grid.Size(); i++ {
		ctx.tiles[i] = &generatedTileData{
			Elevation:     0,
			SurfaceType:   world.BiomeSurfaceNone,
			SoilFertility: -1,
		}
	}
}
