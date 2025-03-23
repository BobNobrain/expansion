package game

import (
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"time"
)

type OrbitData struct {
	Center  CelestialID
	Ellipse phys.EllipticOrbit
	// in the ecliptic plane
	Rotation geom.Angle
	// angle to ecliptic
	Inclination geom.Angle
	// when body is at periapsis
	T0 time.Time
}
