package game

type BiomeSurface byte

const (
	// Shall not be used
	BiomeSurfaceNone BiomeSurface = iota
	// Biome with default solid surface
	BiomeSurfaceSolid
	// Biome that is covered with a deep layer of regolith
	BiomeSurfaceRegolith
	// Ocean biome
	BiomeSurfaceLiquid
	// Ocean biome below its freezing point
	BiomeSurfaceIce
	// Biome that is covered with a layer of snow
	BiomeSurfaceSnow
	// A regolith-covered biome that is fertile
	BiomeSurfaceSoil
)

func (b BiomeSurface) String() string {
	switch b {
	case BiomeSurfaceSolid:
		return "solid"

	case BiomeSurfaceRegolith:
		return "regolith"

	case BiomeSurfaceLiquid:
		return "liquid"

	case BiomeSurfaceSoil:
		return "soil"

	case BiomeSurfaceIce:
		return "ice"

	case BiomeSurfaceSnow:
		return "snow"

	default:
		return "none"
	}
}
