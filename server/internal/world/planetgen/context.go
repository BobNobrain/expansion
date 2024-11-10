package planetgen

import (
	"math/rand"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
	"srv/internal/world"
)

type surfaceGenContext struct {
	rnd *rand.Rand

	params world.CelestialSurfaceParams

	starParams          world.StarParams
	nearestStarDistance phys.Distance

	nearestSurfaceMass     phys.Mass
	nearestSurfaceDistance phys.Distance

	availableMaterials *material.MaterialCompound

	surface *GeneratedSurfaceData
}
