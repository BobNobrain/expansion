package phys

import "math"

type Temperature float64

const zeroDegreesInKelvins float64 = 273.15

func DegreesCelsius(tC float64) Temperature {
	return Temperature(tC)
}
func Kelvins(tK float64) Temperature {
	return Temperature(tK - zeroDegreesInKelvins)
}

func (t Temperature) DegreesCelsius() float64 {
	return float64(t)
}
func (t Temperature) Kelvins() float64 {
	return float64(t) + zeroDegreesInKelvins
}

const kBoltzmann float64 = 1.380649e-23

func (t Temperature) CalcMostProbableParticleSpeed(particleMass Mass) Speed {
	return KilometersPerSecond(math.Sqrt(2 * kBoltzmann * (t.Kelvins() / particleMass.Kilograms())))
}
