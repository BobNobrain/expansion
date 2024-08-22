package world

import (
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
)

type CelestialBodyClass byte

const (
	CelestialBodyClassTerrestial CelestialBodyClass = iota
	CelestialBodyClassGaseous
)

func (c CelestialBodyClass) IsTerrestial() bool {
	return c == CelestialBodyClassTerrestial
}
func (c CelestialBodyClass) IsGaseous() bool {
	return c == CelestialBodyClassGaseous
}

type CelestialBodyParams struct {
	Radius phys.Distance
	Mass   phys.Mass
	Age    phys.Age
	Class  CelestialBodyClass

	AxisTilt  geom.Angle
	DayLength phys.PhysicalTime

	// Composition *CelestialBodyComposition
}

func (p CelestialBodyParams) CalculateAverageSeaLevelGravity() phys.Acceleration {
	return phys.CalculatePlanetGravity(p.Mass, p.Radius)
}
