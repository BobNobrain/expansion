package mesh

type ConnectionMap []map[VertexIndex]bool

func (b *MeshBuilder) GetConnections() ConnectionMap {
	if b.connectionsOutdated {
		b.connections = NewConnectionMap(len(b.verticies))

		for _, face := range b.faces {
			b.connections.Connect(face[0], face[len(face)-1])

			for fvi := 1; fvi < len(face); fvi++ {
				b.connections.Connect(face[fvi], face[fvi-1])
			}
		}

		b.connectionsOutdated = false
	}

	return b.connections
}

func NewConnectionMap(size int) ConnectionMap {
	result := make(ConnectionMap, size)
	for vi := 0; vi < size; vi++ {
		result[vi] = make(map[VertexIndex]bool)
	}
	return result
}

func (m ConnectionMap) Connect(vi1, vi2 VertexIndex) {
	m[vi1][vi2] = true
	m[vi2][vi1] = true
}

func (m ConnectionMap) AreConnected(vi1, vi2 VertexIndex) bool {
	return m[vi1][vi2]
}

func (m ConnectionMap) GetConnectedSet(vi VertexIndex) map[VertexIndex]bool {
	return m[vi]
}
