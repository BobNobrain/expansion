package phys

import (
	"bytes"
	"fmt"
	"math"
)

type distanceScale byte

const (
	distanceScaleKm distanceScale = iota
	distanceScaleAu distanceScale = iota
	distanceScaleLy distanceScale = iota
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
	return Distance{value: km, scale: distanceScaleKm}
}
func Meters(m float64) Distance {
	return Distance{value: m * 1e-3, scale: distanceScaleKm}
}
func AstronomicalUnits(au float64) Distance {
	return Distance{value: au, scale: distanceScaleAu}
}
func LightYears(ly float64) Distance {
	return Distance{value: ly, scale: distanceScaleLy}
}

func (d Distance) rescaled(target distanceScale) float64 {
	if d.scale == target {
		return d.value
	}

	var coeff float64 = 1.0
	switch d.scale {
	case distanceScaleKm:
		switch target {
		case distanceScaleAu:
			coeff = auPerKm

		case distanceScaleLy:
			coeff = lyPerKm
		}

	case distanceScaleAu:
		switch target {
		case distanceScaleKm:
			coeff = kmPerAu

		case distanceScaleLy:
			coeff = lyPerAu
		}

	case distanceScaleLy:
		switch target {
		case distanceScaleKm:
			coeff = kmPerLy

		case distanceScaleAu:
			coeff = auPerLy
		}
	}

	return d.value * coeff
}

func (d Distance) Kilometers() float64 {
	return d.rescaled(distanceScaleKm)
}
func (d Distance) Meters() float64 {
	return d.rescaled(distanceScaleKm) * 1e3
}
func (d Distance) AstronomicalUnits() float64 {
	return d.rescaled(distanceScaleAu)
}
func (d Distance) LightYears() float64 {
	return d.rescaled(distanceScaleLy)
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
func (d Distance) Max(other Distance) Distance {
	scale := maxScale(d.scale, other.scale)
	v1 := d.rescaled(scale)
	v2 := other.rescaled(scale)
	if v1 >= v2 {
		return d
	}
	return other
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

func (d Distance) MarshalBinary() ([]byte, error) {
	var b bytes.Buffer
	_, err := fmt.Fprintln(&b, d.scale, d.value)
	if err != nil {
		return nil, err
	}
	return b.Bytes(), nil
}

func (d *Distance) UnmarshalBinary(data []byte) error {
	b := bytes.NewBuffer(data)
	_, err := fmt.Fscanln(b, &d.scale, &d.value)
	return err
}
