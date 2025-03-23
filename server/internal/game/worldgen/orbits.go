package worldgen

import (
	"math/rand"
	"srv/internal/game"
	"srv/internal/utils"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
)

func generateLowEccentricityOrbit(rnd *rand.Rand, semimajor phys.Distance) game.OrbitData {
	return game.OrbitData{
		Center: game.NoCelestialID,
		Ellipse: phys.EllipticOrbit{
			SemiMajor:    semimajor,
			Eccentricity: rnd.Float64() * 0.1,
		},
		Rotation:    geom.FullCircles(rnd.Float64()),
		Inclination: geom.FullCircles(utils.Lerp(-0.04, 0.04, rnd.Float64())),
	}
}
