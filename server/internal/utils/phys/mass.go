package phys

import "srv/internal/utils/geom"

type Mass float64

func Kilograms(kg float64) Mass {
	return Mass(kg)
}
func Tons(t float64) Mass {
	return Mass(t * 1e3)
}

func FromVolumeAndDensity(v Volume, d Density) Mass {
	return Mass(v.CubicKilometers() * d.KilogramsPerCubicKilometer())
}

func (m Mass) Kilograms() float64 {
	return float64(m)
}
func (m Mass) Tons() float64 {
	return float64(m) * 1e-3
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

func KilogramsPerCubicKilometer(d float64) Density {
	return Density(d)
}

func (d Density) KilogramsPerCubicKilometer() float64 {
	return float64(d)
}
