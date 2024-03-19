package utils

import (
	"math"

	"golang.org/x/exp/constraints"
)

type Number interface {
	constraints.Integer | constraints.Float
}

func Lerp[f64 ~float64](from, to f64, amount float64) f64 {
	return from + (to-from)*f64(amount)
}

func Clamp[num Number](value, min, max num) num {
	if value < min {
		value = min
	} else if max < value {
		value = max
	}
	return value
}

func NiceExp(x float64) float64 {
	return math.Expm1(x) / (math.E - 1)
}
