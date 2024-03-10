package scale_test

import (
	"math"
	"srv/internal/utils/scale"
	"testing"
)

func eq(a, b, eps float64) bool {
	return math.Abs(a-b) < eps
}

func assertFloats(t *testing.T, actual, expected, eps float64, msg string) {
	if !eq(expected, actual, eps) {
		t.Errorf("%s: expected %v, got %v", msg, actual, expected)
	}
}

type doubleScaleType byte
type doubleScaledScalar struct {
	s scale.ScaledScalar[doubleScaleType]
}

const (
	doubleScaleRegular doubleScaleType = iota
	doubleScaleKilo    doubleScaleType = iota
)

func doubleScaledRegular(v float64) doubleScaledScalar {
	return doubleScaledScalar{s: scale.MakeScalar(doubleScaleRegular, v)}
}
func doubleScaledKilo(v float64) doubleScaledScalar {
	return doubleScaledScalar{s: scale.MakeScalar(doubleScaleKilo, v)}
}

func TestScaleWith2Items(t *testing.T) {
	theScale := scale.MakeScale([]scale.ScaleItem[doubleScaleType]{
		{
			ScaleValue:  doubleScaleRegular,
			CoeffToPrev: 1,
		},
		{
			ScaleValue:  doubleScaleKilo,
			CoeffToPrev: 1000,
		},
	})

	v1 := doubleScaledRegular(1000)
	v2 := doubleScaledKilo(1)

	assertFloats(
		t,
		v1.s.ToScale(doubleScaleKilo, theScale),
		v2.s.ToScale(doubleScaleKilo, theScale),
		1e-5,
		"scaled to kilo",
	)
	assertFloats(
		t,
		v1.s.ToScale(doubleScaleRegular, theScale),
		v2.s.ToScale(doubleScaleRegular, theScale),
		1e-5,
		"scaled to regular",
	)
}

type tripleScaleType byte
type tripleScaledScalar struct {
	s scale.ScaledScalar[tripleScaleType]
}

const (
	tripleScaleRegular tripleScaleType = iota
	tripleScaleKilo    tripleScaleType = iota
	tripleScaleGiga    tripleScaleType = iota
)

func tripleScaledRegular(v float64) tripleScaledScalar {
	return tripleScaledScalar{s: scale.MakeScalar(tripleScaleRegular, v)}
}
func tripleScaledKilo(v float64) tripleScaledScalar {
	return tripleScaledScalar{s: scale.MakeScalar(tripleScaleKilo, v)}
}
func tripleScaledGiga(v float64) tripleScaledScalar {
	return tripleScaledScalar{s: scale.MakeScalar(tripleScaleGiga, v)}
}

func TestScaleWith3Items(t *testing.T) {
	theScale := scale.MakeScale([]scale.ScaleItem[tripleScaleType]{
		{
			ScaleValue:  tripleScaleRegular,
			CoeffToPrev: 1,
		},
		{
			ScaleValue:  tripleScaleKilo,
			CoeffToPrev: 1e3,
		},
		{
			ScaleValue:  tripleScaleGiga,
			CoeffToPrev: 1e6,
		},
	})

	v1 := tripleScaledRegular(1e6)
	v2 := tripleScaledKilo(1e3)
	v3 := tripleScaledGiga(1e-3)

	assertFloats(
		t,
		v1.s.ToScale(tripleScaleKilo, theScale),
		v2.s.ToScale(tripleScaleKilo, theScale),
		1e-5,
		"1=2 scaled to kilo",
	)
	assertFloats(
		t,
		v1.s.ToScale(tripleScaleKilo, theScale),
		v3.s.ToScale(tripleScaleKilo, theScale),
		1e-5,
		"1=3 scaled to kilo",
	)
	assertFloats(
		t,
		v2.s.ToScale(tripleScaleKilo, theScale),
		v3.s.ToScale(tripleScaleKilo, theScale),
		1e-5,
		"2=3 scaled to kilo",
	)

	assertFloats(
		t,
		v1.s.ToScale(tripleScaleRegular, theScale),
		v2.s.ToScale(tripleScaleRegular, theScale),
		1e-5,
		"1=2 scaled to regular",
	)
	assertFloats(
		t,
		v1.s.ToScale(tripleScaleRegular, theScale),
		v3.s.ToScale(tripleScaleRegular, theScale),
		1e-5,
		"1=3 scaled to regular",
	)
	assertFloats(
		t,
		v2.s.ToScale(tripleScaleRegular, theScale),
		v3.s.ToScale(tripleScaleRegular, theScale),
		1e-5,
		"2=3 scaled to regular",
	)

	assertFloats(
		t,
		v1.s.ToScale(tripleScaleGiga, theScale),
		v2.s.ToScale(tripleScaleGiga, theScale),
		1e-5,
		"1=2 scaled to giga",
	)
	assertFloats(
		t,
		v1.s.ToScale(tripleScaleGiga, theScale),
		v3.s.ToScale(tripleScaleGiga, theScale),
		1e-5,
		"1=3 scaled to giga",
	)
	assertFloats(
		t,
		v2.s.ToScale(tripleScaleGiga, theScale),
		v3.s.ToScale(tripleScaleGiga, theScale),
		1e-5,
		"2=3 scaled to giga",
	)
}
