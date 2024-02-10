package phys

import "math"

type distanceScale byte

const (
	scaleKm distanceScale = iota
	scaleAu distanceScale = iota
	scaleLy distanceScale = iota
)

type Distance struct {
	value float64
	scale distanceScale
}

const kmPerAu float64 = 149597870.7
const auPerKm float64 = 1 / kmPerAu
const kmPerLy float64 = 9460730472580.8
const lyPerKm float64 = 1 / kmPerLy
const auPerLy float64 = kmPerLy / kmPerAu
const lyPerAu float64 = kmPerAu / kmPerLy

func maxScale(s1, s2 distanceScale) distanceScale {
	if s1 > s2 {
		return s1
	}
	return s2
}

func Kilometers(km float64) Distance {
	return Distance{value: km, scale: scaleKm}
}
func Meters(m float64) Distance {
	return Distance{value: m * 1e-3, scale: scaleKm}
}
func AstronomicalUnits(au float64) Distance {
	return Distance{value: au, scale: scaleAu}
}
func LightYears(ly float64) Distance {
	return Distance{value: ly, scale: scaleLy}
}

func (d Distance) rescaled(target distanceScale) float64 {
	if d.scale == target {
		return d.value
	}

	var coeff float64 = 1.0
	switch d.scale {
	case scaleKm:
		switch target {
		case scaleAu:
			coeff = auPerKm

		case scaleLy:
			coeff = lyPerKm
		}

	case scaleAu:
		switch target {
		case scaleKm:
			coeff = kmPerAu

		case scaleLy:
			coeff = lyPerAu
		}

	case scaleLy:
		switch target {
		case scaleKm:
			coeff = kmPerLy

		case scaleAu:
			coeff = auPerLy
		}
	}

	return d.value * coeff
}

func (d Distance) Kilometers() float64 {
	return d.rescaled(scaleKm)
}
func (d Distance) Meters() float64 {
	return d.rescaled(scaleKm) * 1e3
}
func (d Distance) AstronomicalUnits() float64 {
	return d.rescaled(scaleAu)
}
func (d Distance) LightYears() float64 {
	return d.rescaled(scaleLy)
}

func (d1 Distance) Add(d2 Distance) Distance {
	scale := maxScale(d1.scale, d2.scale)
	v1 := d1.rescaled(scale)
	v2 := d2.rescaled(scale)
	return Distance{value: v1 + v2, scale: scale}
}
func (d1 Distance) Diff(d2 Distance) Distance {
	scale := maxScale(d1.scale, d2.scale)
	v1 := d1.rescaled(scale)
	v2 := d2.rescaled(scale)
	return Distance{value: v1 - v2, scale: scale}
}
func (d Distance) Mul(m float64) Distance {
	return Distance{value: d.value * m, scale: d.scale}
}

const proximityEps float64 = 1e-5

func (d1 Distance) IsCloseTo(d2 Distance) bool {
	scale := maxScale(d1.scale, d2.scale)
	v1 := d1.rescaled(scale)
	v2 := d2.rescaled(scale)
	return math.Abs(v1-v2) < proximityEps
}

func (d1 Distance) IsGreaterThan(d2 Distance) bool {
	scale := maxScale(d1.scale, d2.scale)
	v1 := d1.rescaled(scale)
	v2 := d2.rescaled(scale)
	return v1 > v2
}

func (d1 Distance) IsLessThan(d2 Distance) bool {
	scale := maxScale(d1.scale, d2.scale)
	v1 := d1.rescaled(scale)
	v2 := d2.rescaled(scale)
	return v1 < v2
}
