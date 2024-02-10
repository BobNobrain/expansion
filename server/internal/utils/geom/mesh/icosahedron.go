package mesh

import (
	"math"
	"srv/internal/utils/geom"
)

func CreateSubdividedIcosahedron(size float64, subdivisions int) *MeshBuilder {
	icosahedron := NewMeshBuilder()

	phi := (1.0 + math.Sqrt(5.0)) / 2.0
	du := size / math.Sqrt(phi*phi+1.0)
	dv := phi * du

	icosahedron.AddMany([]geom.Vec3{
		{X: 0, Y: +dv, Z: +du},
		{X: 0, Y: +dv, Z: -du},
		{X: 0, Y: -dv, Z: +du},
		{X: 0, Y: -dv, Z: -du},
		{X: +du, Y: 0, Z: +dv},
		{X: -du, Y: 0, Z: +dv},
		{X: +du, Y: 0, Z: -dv},
		{X: -du, Y: 0, Z: -dv},
		{X: +dv, Y: +du, Z: 0},
		{X: +dv, Y: -du, Z: 0},
		{X: -dv, Y: +du, Z: 0},
		{X: -dv, Y: -du, Z: 0},
	})

	icosahedron.CreateFace([]VertexIndex{8, 1, 0})
	icosahedron.CreateFace([]VertexIndex{5, 4, 0})
	icosahedron.CreateFace([]VertexIndex{10, 5, 0})
	icosahedron.CreateFace([]VertexIndex{4, 8, 0})
	icosahedron.CreateFace([]VertexIndex{1, 10, 0})
	icosahedron.CreateFace([]VertexIndex{8, 6, 1})
	icosahedron.CreateFace([]VertexIndex{6, 7, 1})
	icosahedron.CreateFace([]VertexIndex{7, 10, 1})
	icosahedron.CreateFace([]VertexIndex{11, 3, 2})
	icosahedron.CreateFace([]VertexIndex{9, 4, 2})
	icosahedron.CreateFace([]VertexIndex{4, 5, 2})
	icosahedron.CreateFace([]VertexIndex{3, 9, 2})
	icosahedron.CreateFace([]VertexIndex{5, 11, 2})
	icosahedron.CreateFace([]VertexIndex{7, 6, 3})
	icosahedron.CreateFace([]VertexIndex{11, 7, 3})
	icosahedron.CreateFace([]VertexIndex{6, 9, 3})
	icosahedron.CreateFace([]VertexIndex{9, 8, 4})
	icosahedron.CreateFace([]VertexIndex{10, 11, 5})
	icosahedron.CreateFace([]VertexIndex{8, 9, 6})
	icosahedron.CreateFace([]VertexIndex{11, 10, 7})

	icosahedron.Subdivide(func(triangle Poly, builder *MeshBuilder) []Poly {
		main := builder.GetCoords(triangle[0])
		sideAEnd := builder.GetCoords(triangle[1])
		sideBEnd := builder.GetCoords(triangle[2])

		sideACoords := geom.Interpolate(main, sideAEnd, subdivisions)
		sideBCoords := geom.Interpolate(main, sideBEnd, subdivisions)

		lines := make([][]VertexIndex, subdivisions)
		lines[0] = []VertexIndex{triangle[0]}

		for l := 1; l < subdivisions; l++ {
			lineCoords := geom.Interpolate(sideACoords[l], sideBCoords[l], l+1)
			line := make([]VertexIndex, l+1)
			for i, v := range lineCoords {
				line[i] = builder.AddIfNotClose(v)
			}

			lines[l] = line
		}

		miniTriangles := make([]Poly, 0)

		for l := 1; l < subdivisions; l++ {
			prevLine := lines[l-1]
			line := lines[l]

			for i := 1; i < l+1; i++ {
				miniTriangles = append(miniTriangles, Poly{prevLine[i-1], line[i-1], line[i]})
			}

			for i := 1; i < l; i++ {
				miniTriangles = append(miniTriangles, Poly{prevLine[i], prevLine[i-1], line[i]})
			}
		}

		return miniTriangles
	})

	return icosahedron
}
