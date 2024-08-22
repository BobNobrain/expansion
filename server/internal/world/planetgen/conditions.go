package planetgen

import (
	"math"
	"srv/internal/utils/phys"
)

func (ctx *surfaceGenContext) calculateConditionsPerTile() {
	grid := ctx.surface.Grid
	g := phys.CalculatePlanetGravity(ctx.params.Mass, ctx.params.Radius).EarthGs()
	atmMolarMass := 1.

	for i := 0; i < grid.GetNodesCount(); i++ {
		// coords := grid.GetNodeCoords(world.PlanetaryNodeIndex(i))
		tile := ctx.surface.Tiles[i]
		elevation := tile.Elevation

		// TODO
		tile.AverageTemp = ctx.surface.Atmosphere.AverageTemp
		coeff := math.Exp(-g * ctx.surface.RelativeElevationsScale.Kilometers() * 1e-3 * elevation * atmMolarMass / 21500)
		tile.Pressure = ctx.surface.Atmosphere.SeaLevelPressure * phys.Pressure(coeff)
	}
}
