package geom

import "math"

const sphereVolumeCoeff float64 = 4.0 / 3.0 * math.Pi

func SphereVolume(r float64) float64 {
	return r * r * r * sphereVolumeCoeff
}
