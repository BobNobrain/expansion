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
func Unlerp[f64 ~float64](from, to, val f64) float64 {
	return float64((val - from) / (to - from))
}

// Returns value, if it is in segment [min; max] (inclusive);
// returns respective border value otherwise
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

// Takes in a [0..1) number and returns a number in [-1, 1), distributed somewhat like a confined bell curve
func PseudoBell(unit float64) float64 {
	// TODO
	shifted := unit - 0.5
	return 8 * shifted * shifted * shifted
}
