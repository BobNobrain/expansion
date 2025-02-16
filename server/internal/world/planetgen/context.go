package planetgen

import (
	"math/rand"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
	"srv/internal/world"
)

type planetGenContext struct {
	rnd *rand.Rand

	params world.WorldParams

	starParams          world.StarParams
	nearestStarDistance phys.Distance

	nearestSurfaceMass     phys.Mass
	nearestSurfaceDistance phys.Distance

	availableMaterials *material.MaterialCompound

	surface *GeneratedSurfaceData
}
