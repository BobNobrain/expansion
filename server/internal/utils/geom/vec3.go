package geom

import "math"

type Vec3 struct {
	X float64
	Y float64
	Z float64
}

func (v Vec3) Len() float64 {
	return math.Sqrt(v.X*v.X + v.Y*v.Y + v.Z*v.Z)
}
func (v Vec3) LenSquared() float64 {
	return v.X*v.X + v.Y*v.Y + v.Z*v.Z
}

func (v Vec3) Normalized() Vec3 {
	l := v.Len()
	return Vec3{
		X: v.X / l,
		Y: v.Y / l,
		Z: v.Z / l,
	}
}

func (a Vec3) Add(b Vec3) Vec3 {
	return Vec3{
		X: a.X + b.X,
		Y: a.Y + b.Y,
		Z: a.Z + b.Z,
	}
}
func (a Vec3) Diff(b Vec3) Vec3 {
	return Vec3{
		X: a.X - b.X,
		Y: a.Y - b.Y,
		Z: a.Z - b.Z,
	}
}

func (v Vec3) Mul(c float64) Vec3 {
	return Vec3{X: v.X * c, Y: v.Y * c, Z: v.Z * c}
}

func (a Vec3) Dot(b Vec3) float64 {
	return a.X*b.X + a.Y*b.Y + a.Z*b.Z
}
func (a Vec3) Cross(b Vec3) Vec3 {
	return Vec3{
		X: a.Y*b.Z - a.Z*b.Y,
		Y: a.Z*b.X - a.X*b.Z,
		Z: a.X*b.Y - a.Y*b.X,
	}
}

func (a Vec3) IsCloseTo(b Vec3, eps float64) bool {
	dx := math.Abs(a.X - b.X)
	dy := math.Abs(a.Y - b.Y)
	dz := math.Abs(a.Z - b.Z)
	return dx < eps && dy < eps && dz < eps
}

func (a Vec3) IsEqualTo(b Vec3) bool {
	return a.X == b.X && a.Y == b.Y && a.Z == b.Z
}
