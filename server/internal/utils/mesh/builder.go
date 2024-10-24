package mesh

import "srv/internal/utils/geom"

type VertexIndex int
type FaceIndex int
type Poly []VertexIndex

type MeshBuilder struct {
	verticies []geom.Vec3
	faces     []Poly
	eps       float64
}

func NewMeshBuilder() *MeshBuilder {
	return &MeshBuilder{
		verticies: make([]geom.Vec3, 0),
		faces:     make([]Poly, 0),
		eps:       1e-4,
	}
}

func (b *MeshBuilder) BuildGraph() geom.SpatialGraph {
	graph := geom.NewSpatialGraph(len(b.verticies))

	for i, coords := range b.verticies {
		graph.SetCoords(i, coords)
	}

	for _, face := range b.faces {
		graph.Connect(int(face[0]), int(face[len(face)-1]))

		for fvi := 1; fvi < len(face); fvi++ {
			graph.Connect(int(face[fvi]), int(face[fvi-1]))
		}
	}

	return graph
}
