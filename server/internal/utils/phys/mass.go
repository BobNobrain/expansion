package phys

import (
	"srv/internal/utils/geom"
	"srv/internal/utils/scale"
)

type massScale byte

const (
	massScaleTons massScale = iota
	massScaleSuns massScale = iota
)

const solarMassInTons = 1.989e27
const earthMassInSuns = 3.003e-6

var massScaleData = scale.MakeScale([]scale.ScaleItem[massScale]{
	{ScaleValue: massScaleTons, CoeffToPrev: 1},
	{ScaleValue: massScaleSuns, CoeffToPrev: solarMassInTons},
})

type Mass struct {
	value scale.ScaledScalar[massScale]
}

func Kilograms(kg float64) Mass {
	return Tons(kg * 1e-3)
}
func Tons(t float64) Mass {
	return Mass{
		value: scale.MakeScalar(massScaleTons, t),
	}
}
func EarthMasses(earths float64) Mass {
	return Mass{
		value: scale.MakeScalar(massScaleSuns, earths*earthMassInSuns),
	}
}
func SolarMasses(suns float64) Mass {
	return Mass{
		value: scale.MakeScalar(massScaleSuns, suns),
	}
}

func (m Mass) Kilograms() float64 {
	return m.Tons() * 1e3
}
func (m Mass) Tons() float64 {
	return m.value.ToScale(massScaleTons, massScaleData)
}
func (m Mass) EarthMasses() float64 {
	return m.value.ToScale(massScaleSuns, massScaleData) / earthMassInSuns
}
func (m Mass) SolarMasses() float64 {
	return m.value.ToScale(massScaleSuns, massScaleData)
}

func (m Mass) Multiply(factor float64) Mass {
	return Mass{value: m.value.Multiply(factor)}
}

func FromVolumeAndDensity(v Volume, d Density) Mass {
	return Tons(v.CubicKilometers() * d.TonsPerCubicKilometer())
}

func (m Mass) MarshalBinary() ([]byte, error) {
	return m.value.MarshalBinary()
}
func (m *Mass) UnmarshalBinary(data []byte) error {
	return m.value.UnmarshalBinary(data)
}
func (d Mass) MarshalJSON() ([]byte, error) {
	return d.value.MarshalJSON()
}
func (d *Mass) UnmarshalJSON(data []byte) error {
	return d.value.UnmarshalJSON(data)
}

type Volume float64

func CubeVolume(side Distance) Volume {
	km := side.Kilometers()
	return Volume(km * km * km)
}
func SphereVolume(side Distance) Volume {
	km := side.Kilometers()
	return Volume(geom.SphereVolume(km))
}
func (v Volume) CubicKilometers() float64 {
	return float64(v)
}
func (v1 Volume) Diff(v2 Volume) Volume {
	return Volume(float64(v1) - float64(v2))
}

type Density float64

func TonsPerCubicKilometer(d float64) Density {
	return Density(d)
}

func (d Density) TonsPerCubicKilometer() float64 {
	return float64(d)
}
