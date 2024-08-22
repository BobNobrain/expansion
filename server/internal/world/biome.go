package world

type Biome byte

const (
	BiomeUnknown Biome = iota
)

type BiomeSurface byte

const (
	BiomeSurfaceNone BiomeSurface = iota
	BiomeSurfaceSolid
	BiomeSurfaceRegolith
	BiomeSurfaceLiquid
	BiomeSurfaceSoil
)
