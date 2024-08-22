package phys

import (
	"math"
	"srv/internal/utils"
	"srv/internal/utils/color"
)

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

func (t Temperature) IsValid() bool {
	return t.Kelvins() >= -1e3
}

const kBoltzmann float64 = 1.380649e-23

func (t Temperature) CalcMostProbableParticleSpeed(particleMass Mass) Speed {
	return KilometersPerSecond(math.Sqrt(2 * kBoltzmann * (t.Kelvins() / particleMass.Kilograms())))
}

const gasConstantR = 8_314.4598

func (t Temperature) CalcThermalVelocity(molarMass float64) Speed {
	mPerS := math.Sqrt(3 * gasConstantR * t.Kelvins() / molarMass)
	return KilometersPerSecond(mPerS / 1000)
}

func (t Temperature) GetHeatColor() color.Color {
	// https://gist.github.com/paulkaplan/5184275
	temp := t.Kelvins() / 100
	var red, green, blue int

	if temp <= 66 {
		red = 255
		green = int(99.4708025861*math.Log(temp) - 161.1195681661)

		if temp <= 19 {
			blue = 0
		} else {
			blue = int(138.5177312231*math.Log(temp-10) - 305.0447927307)
		}
	} else {
		red = int(329.698727446 * math.Pow(temp-60, -0.1332047592))
		green = int(288.1221695283 * math.Pow(temp-60, -0.0755148492))

		blue = 255
	}

	red = utils.Clamp(red, 0, 255)
	green = utils.Clamp(green, 0, 255)
	blue = utils.Clamp(blue, 0, 255)

	return color.RGB(red, green, blue)
}

func (t Temperature) GetStarSpectralClass() string {
	k := t.Kelvins()
	if k >= 30_000 {
		return "O"
	}
	if k >= 10_000 {
		return "B"
	}
	if k >= 7500 {
		return "A"
	}
	if k >= 6000 {
		return "F"
	}
	if k >= 5200 {
		return "G"
	}
	if k >= 3700 {
		return "K"
	}
	return "M"
}
