package hrd

import (
	"math"
)

const stefanBoltzmannCoeff = 1.5493510573136428e+5

func radiusFromLumAndTemp(lumSuns float64, tempK float64) float64 {
	temp4 := tempK * tempK * tempK * tempK
	return stefanBoltzmannCoeff * math.Sqrt(lumSuns/temp4)
}

func massFromLum(lumSuns float64) float64 {
	// https://en.wikipedia.org/wiki/Mass%E2%80%93luminosity_relation
	// but we're using even simplier relation (only one of those)
	massSuns := math.Pow(0.7143*lumSuns, 0.2857)
	return massSuns
}
