package phys

import "math"

// for kilometers, kilograms and seconds
const gravityConstant float64 = 6.674e-20

func CalculatePlanetGravity(m Mass, r Distance) Acceleration {
	km := r.Kilometers()
	return KilometersPerSecondSquared(m.Kilograms() * gravityConstant / (km * km))
}

func CalculatePlanetEscapeVelocity(m Mass, r Distance) Speed {
	g := CalculatePlanetGravity(m, r).KilometersPerSecondSquared()
	return KilometersPerSecond(math.Sqrt(2 * g * r.Kilometers()))
}
