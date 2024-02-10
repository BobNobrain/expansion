package geom_test

import (
	"math"
	"math/rand"
	"srv/internal/utils/geom"
	"testing"
)

const eps float64 = 1e-8

func cmp(a, b float64) bool {
	return math.Abs(a-b) < eps
}

func assertFloats(t *testing.T, actual, expected float64, msg string) {
	if !cmp(expected, actual) {
		t.Errorf("%s: expected %v, got %v", msg, actual, expected)
	}
}

func assertVectors(t *testing.T, actual, expected geom.Vec3, msg string) {
	if !actual.IsCloseTo(expected, eps) {
		t.Errorf("%s: expected %v, got %v", msg, actual, expected)
	}
}

func TestVec3(t *testing.T) {
	t.Run("Vec3::Length & Vec3::LengthSquared", func(t *testing.T) {
		samples := []geom.Vec3{
			{X: 0, Y: 0, Z: 0},
			{X: 0, Y: 1, Z: 0},
			{X: -1, Y: 0, Z: 0},
			{X: 0, Y: 4, Z: -3},
			{X: 1.3, Y: 2.5, Z: -4.9},
		}

		results := []float64{0, 1, 1, 5, 5.652433104425032}

		for i := 0; i < len(samples); i++ {
			length := samples[i].Len()
			lengthSq := samples[i].LenSquared()
			expected := results[i]

			assertFloats(t, length, expected, "length")
			assertFloats(t, lengthSq, expected*expected, "length^2")
		}
	})

	t.Run("Vec3 products (dot & cross)", func(t *testing.T) {
		zero := geom.Vec3{}
		unitX := geom.Vec3{X: 1}
		unitY := geom.Vec3{Y: 1}
		unitZ := geom.Vec3{Z: 1}

		assertVectors(t, unitX.Cross(unitY), unitZ, "x * y = z")
		assertVectors(t, unitY.Cross(unitZ), unitX, "y * z = x")
		assertVectors(t, unitX.Cross(unitZ), unitY.Mul(-1), "x * z = -y")

		for i := 0; i < 5; i++ {
			x := unitX.Mul(rand.Float64())
			y := unitY.Mul(rand.Float64())
			z := unitZ.Mul(rand.Float64())

			assertFloats(t, x.Dot(y), 0, "x . y")
			assertFloats(t, y.Dot(x), 0, "y . x")
			assertFloats(t, z.Dot(y), 0, "z . y")
			assertFloats(t, z.Dot(x), 0, "z . x")
			assertFloats(t, zero.Dot(x), 0, "0 . x")
			assertFloats(t, y.Dot(zero), 0, "y . 0")
			assertFloats(t, zero.Dot(zero), 0, "0 . 0")
			assertFloats(t, x.Dot(x), x.LenSquared(), "x . x")

			assertVectors(t, z.Cross(zero), zero, "z * 0 = 0")

			assertFloats(t, x.Cross(y).Len(), x.Len()*y.Len(), "|x * y| = |x| * |y|")
		}
	})
}
