package planetgen

import (
	"math/rand"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
	"srv/internal/world"
	"srv/internal/world/worldgen"
)

type surfaceGenContext struct {
	rnd *rand.Rand

	params world.CelestialBodyParams

	starParams          world.StarParams
	nearestStarDistance phys.Distance
	icelines            worldgen.Icelines

	nearestSurfaceMass     phys.Mass
	nearestSurfaceDistance phys.Distance

	availableMaterials *material.MaterialCompound

	surface *GeneratedSurfaceData
}
