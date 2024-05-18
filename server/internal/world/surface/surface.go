package surface

import (
	"srv/internal/utils/geom/mesh"
	"srv/internal/world"
)

type surfaceImpl struct {
	Cells       []*surfaceCellImpl
	Edges       []*surfaceConnectionImpl
	Connections mesh.ConnectionMap
}

func (s *surfaceImpl) GetSize() int {
	return len(s.Cells)
}
func (s *surfaceImpl) GetNConnections() int {
	return len(s.Edges)
}

func (s *surfaceImpl) GetCell(id world.SurfaceCellID) world.SurfaceCell {
	return s.Cells[id]
}
func (s *surfaceImpl) GetConnection(id world.SurfaceConnectionID) world.SurfaceConnection {
	return s.Edges[id]
}

func (s *surfaceImpl) AreConnected(a, b world.SurfaceCellID) bool {
	return s.Connections.AreConnected(mesh.VertexIndex(a), mesh.VertexIndex(b))
}

func NewSurface() world.Surface {
	return &surfaceImpl{
		Cells:       make([]*surfaceCellImpl, 0),
		Edges:       make([]*surfaceConnectionImpl, 0),
		Connections: mesh.NewConnectionMap(0),
	}
}

func NewSurfaceFromMeshBuilder(builder *mesh.MeshBuilder) world.Surface {
	size := builder.VertexCount()
	result := &surfaceImpl{
		Cells:       make([]*surfaceCellImpl, size),
		Edges:       make([]*surfaceConnectionImpl, 0),
		Connections: builder.GetConnections(),
	}

	for i := 0; i < size; i++ {
		result.Cells[i] = &surfaceCellImpl{
			Id:     world.SurfaceCellID(i),
			Biome:  world.BiomeUnknown,
			Coords: builder.GetCoords(mesh.VertexIndex(i)),
		}
	}

	var connId world.SurfaceConnectionID = 0
	for i := 0; i < size; i++ {
		connectedNodes := result.Connections.GetConnectedSet(mesh.VertexIndex(i))
		for j := range connectedNodes {
			if j <= mesh.VertexIndex(i) {
				continue
			}

			result.Edges = append(
				result.Edges,
				&surfaceConnectionImpl{
					Id:    connId,
					Cell1: world.SurfaceCellID(i),
					Cell2: world.SurfaceCellID(j),
				},
			)

			connId++
		}
	}

	return result
}
