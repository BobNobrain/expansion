package phys

import "math"

type EllipticOrbit struct {
	SemiMajorAxis Distance
	SemiMinorAxis Distance
}

const ellipticOrbitPeriodConstant = 4 * math.Pi * math.Pi / gravityConstant

func (orbit *EllipticOrbit) CalculatePeriod(aroundMass Mass) Time {
	a := orbit.SemiMajorAxis.Kilometers()
	a3 := a * a * a
	return Seconds(ellipticOrbitPeriodConstant * a3 / aroundMass.Kilograms())
}
