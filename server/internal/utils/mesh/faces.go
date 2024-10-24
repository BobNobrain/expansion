package mesh

import "slices"

func (b *MeshBuilder) FaceCount() int {
	return len(b.faces)
}

func (b *MeshBuilder) GetFace(fi FaceIndex) Poly {
	return b.faces[fi]
}
func (b *MeshBuilder) SetFace(fi FaceIndex, face Poly) {
	b.faces[fi] = face
}

func (b *MeshBuilder) CreateFace(face Poly) FaceIndex {
	fi := FaceIndex(len(b.faces))
	b.faces = append(b.faces, face)
	return fi
}

func (b *MeshBuilder) Subdivide(f func(Poly, *MeshBuilder) []Poly) {
	newFaces := make([]Poly, 0)
	for _, face := range b.faces {
		newFaces = append(newFaces, f(face, b)...)
	}
	b.faces = newFaces
}

func (b *MeshBuilder) FindConnectedFaces(vis []VertexIndex) []FaceIndex {
	result := make([]FaceIndex, 0)

	for fi, face := range b.faces {
		found := true
		for _, vi := range vis {
			if slices.Index(face, vi) == -1 {
				found = false
				break
			}
		}

		if found {
			result = append(result, FaceIndex(fi))
		}
	}

	return result
}
