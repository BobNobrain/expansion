package mesh

func CreateTestTetrahedron() *MeshBuilder {
	th := NewMeshBuilder()

	a := th.AddCoords(1, 0, 0)
	b := th.AddCoords(0, 1, 0)
	c := th.AddCoords(0, 0, 1)
	d := th.AddCoords(0, 0, 0)

	th.CreateFace(Poly{a, b, c})
	th.CreateFace(Poly{a, c, d})
	th.CreateFace(Poly{c, b, d})
	th.CreateFace(Poly{a, b, d})

	return th
}
