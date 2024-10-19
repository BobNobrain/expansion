package world

type BiomeSurface byte

const (
	BiomeSurfaceNone BiomeSurface = iota
	BiomeSurfaceSolid
	BiomeSurfaceRegolith
	BiomeSurfaceLiquid
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

	default:
		return "none"
	}
}
