package planetgen

import (
	"srv/internal/utils"
	"srv/internal/world"
)

func (ctx *surfaceGenContext) generateGrid() {
	planetSize := ctx.params.Radius.Kilometers() / 50_000
	if planetSize < 0.1 {
		planetSize = 0.1
	} else if planetSize > 1 {
		planetSize = 1
	}

	gridBuilder := NewGridBuilder(ctx.rnd, GridBuilderOptions{
		Size:         planetSize,
		ChaosPercent: 0.15,
	})
	gridBuilder.Generate()

	grid := gridBuilder.builder.BuildGraph()

	ctx.surface.Grid = grid
	ctx.surface.RelativeElevationsScale = ctx.params.Radius.Mul(utils.Lerp(5e-4, 3e-3, ctx.rnd.Float64()))
	ctx.surface.Tiles = make([]*GeneratedTileData, grid.Size())
	for i := 0; i < grid.Size(); i++ {
		ctx.surface.Tiles[i] = &GeneratedTileData{
			Elevation:   0,
			SurfaceType: world.BiomeSurfaceNone,
		}
	}
}
