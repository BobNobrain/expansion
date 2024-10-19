package phys

import (
	"srv/internal/utils/scale"
)

type distanceScale byte

const (
	distanceScaleKm distanceScale = iota
	distanceScaleAu distanceScale = iota
	distanceScaleLy distanceScale = iota
)

type Distance struct {
	value scale.ScaledScalar[distanceScale]
}

const kmPerAu float64 = 149597870.7

// const auPerKm float64 = 1 / kmPerAu
const kmPerLy float64 = 9460730472580.8

// const lyPerKm float64 = 1 / kmPerLy
const auPerLy float64 = kmPerLy / kmPerAu

// const lyPerAu float64 = kmPerAu / kmPerLy

var distanceScaleData = scale.MakeScale([]scale.ScaleItem[distanceScale]{
	{ScaleValue: distanceScaleKm, CoeffToPrev: 1},
	{ScaleValue: distanceScaleAu, CoeffToPrev: kmPerAu},
	{ScaleValue: distanceScaleLy, CoeffToPrev: auPerLy},
})

func Kilometers(km float64) Distance {
	return Distance{value: scale.MakeScalar(distanceScaleKm, km)}
}
func Meters(m float64) Distance {
	return Distance{value: scale.MakeScalar(distanceScaleKm, m*1e-3)}
}
func AstronomicalUnits(au float64) Distance {
	return Distance{value: scale.MakeScalar(distanceScaleAu, au)}
}
func LightYears(ly float64) Distance {
	return Distance{value: scale.MakeScalar(distanceScaleLy, ly)}
}

func (d Distance) Kilometers() float64 {
	return d.value.ToScale(distanceScaleKm, distanceScaleData)
}
func (d Distance) Meters() float64 {
	return d.value.ToScale(distanceScaleKm, distanceScaleData) * 1e3
}
func (d Distance) AstronomicalUnits() float64 {
	return d.value.ToScale(distanceScaleAu, distanceScaleData)
}
func (d Distance) LightYears() float64 {
	return d.value.ToScale(distanceScaleLy, distanceScaleData)
}

func (d1 Distance) Add(d2 Distance) Distance {
	return Distance{value: d1.value.Add(d2.value, distanceScaleData)}
}
func (d1 Distance) Diff(d2 Distance) Distance {
	return Distance{value: d1.value.Diff(d2.value, distanceScaleData)}
}
func (d Distance) Mul(m float64) Distance {
	return Distance{value: d.value.Multiply(m)}
}
func (d Distance) Max(other Distance) Distance {
	return Distance{value: d.value.Max(other.value, distanceScaleData)}
}

const proximityEps float64 = 1e-5

func (d1 Distance) IsCloseTo(d2 Distance) bool {
	return d1.value.IsCloseTo(d2.value, distanceScaleData, proximityEps)
}

func (d1 Distance) IsGreaterThan(d2 Distance) bool {
	return d1.value.IsGreaterThan(d2.value, distanceScaleData)
}

func (d1 Distance) IsLessThan(d2 Distance) bool {
	return d1.value.IsLessThan(d2.value, distanceScaleData)
}

func (d Distance) MarshalBinary() ([]byte, error) {
	return d.value.MarshalBinary()
}
func (d *Distance) UnmarshalBinary(data []byte) error {
	return d.value.UnmarshalBinary(data)
}

func (d Distance) MarshalJSON() ([]byte, error) {
	return d.value.MarshalJSON()
}
func (d *Distance) UnmarshalJSON(data []byte) error {
	return d.value.UnmarshalJSON(data)
}
