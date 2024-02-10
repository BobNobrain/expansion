package geom

func SumVectors(vs []Vec3) Vec3 {
	var x, y, z float64

	for _, v := range vs {
		x += v.X
		y += v.Y
		z += v.Z
	}

	return Vec3{X: x, Y: y, Z: z}
}

func AverageVectors(vs []Vec3) Vec3 {
	var x, y, z float64
	l := float64(len(vs))

	for _, v := range vs {
		x += v.X
		y += v.Y
		z += v.Z
	}

	return Vec3{X: x / l, Y: y / l, Z: z / l}
}

func Interpolate(start Vec3, end Vec3, nPoints int) []Vec3 {
	if nPoints < 2 {
		return []Vec3{start, end}
	}

	step := end.Diff(start).Mul(1 / float64(nPoints-1))
	result := make([]Vec3, nPoints)
	result[0] = start
	result[nPoints-1] = end

	for i := 1; i < nPoints-1; i++ {
		result[i] = result[i-1].Add(step)
	}

	return result
}
