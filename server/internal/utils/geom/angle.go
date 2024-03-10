package geom

import "math"

type Angle float64

const fullCircle Angle = math.Pi * 2
const degreesPerCircle = 360.0

func Radians(rads float64) Angle {
	return Angle(rads)
}
func FullCircles(nCircles float64) Angle {
	return fullCircle * Angle(nCircles)
}
func Degrees(degrees float64) Angle {
	return Angle(degrees / degreesPerCircle * float64(fullCircle))
}

func (a Angle) Radians() float64 {
	return float64(a)
}
func (a Angle) FullCircles() float64 {
	return float64(a / fullCircle)
}
func (a Angle) Degrees() float64 {
	return float64(a * degreesPerCircle / fullCircle)
}

func (a Angle) Normalized() Angle {
	for a < 0 {
		a += fullCircle
	}
	for a >= fullCircle {
		a -= fullCircle
	}
	return a
}

func (a Angle) Sin() float64 {
	return math.Sin(a.Radians())
}
func (a Angle) Cos() float64 {
	return math.Cos(a.Radians())
}
