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
func (m Mass) SolarMasses() float64 {
	return m.value.ToScale(massScaleSuns, massScaleData)
}

func FromVolumeAndDensity(v Volume, d Density) Mass {
	return Tons(v.CubicKilometers() * d.TonsPerCubicKilometer())
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
