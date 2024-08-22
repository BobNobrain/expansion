package worldgen

import (
	"math/rand"
	"srv/internal/utils"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"srv/internal/world"
)

func generateLowEccentricityOrbit(rnd *rand.Rand, semimajor phys.Distance) world.OrbitData {
	return world.OrbitData{
		Center: world.NoCelestialID,
		Ellipse: phys.EllipticOrbit{
			SemiMajor:    semimajor,
			Eccentricity: rnd.Float64() * 0.1,
		},
		Rotation:    geom.FullCircles(rnd.Float64()),
		Inclination: geom.FullCircles(utils.Lerp(-0.04, 0.04, rnd.Float64())),
	}
}
