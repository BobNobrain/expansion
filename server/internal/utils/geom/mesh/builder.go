package mesh

import "srv/internal/utils/geom"

type VertexIndex int
type FaceIndex int
type Poly []VertexIndex

type MeshBuilder struct {
	verticies []geom.Vec3
	faces     []Poly
	eps       float64

	connections         ConnectionMap
	connectionsOutdated bool
}

func NewMeshBuilder() *MeshBuilder {
	return &MeshBuilder{
		verticies: make([]geom.Vec3, 0),
		faces:     make([]Poly, 0),
		eps:       1e-4,

		connectionsOutdated: true,
		connections:         make(ConnectionMap, 0),
	}
}

func (b *MeshBuilder) topologyUpdated() {
	b.connectionsOutdated = true
}
