package world

import (
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"time"
)

type CelestialBodyParams struct {
	Radius phys.Distance
	Mass   phys.Mass
	Age    phys.Age

	AxisTilt  geom.Angle
	DayLength time.Duration

	Composition *CelestialBodyComposition
}
