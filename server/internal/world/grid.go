package world

import (
	"srv/internal/utils"
	"srv/internal/utils/geom"
	"srv/internal/utils/geom/mesh"
)

type PlanetaryNodeIndex int
type PlanetaryGridEdgeIndex int
type PlanetaryGridEdge utils.Pair[PlanetaryNodeIndex, PlanetaryNodeIndex]

type PlanetaryGrid interface {
	GetNodesCount() int
	GetEdgesCount() int

	GetNodeCoords(i PlanetaryNodeIndex) geom.Vec3
	AreConnected(i1, i2 PlanetaryNodeIndex) bool
	GetConnectedNodes(node PlanetaryNodeIndex) []PlanetaryNodeIndex

	GetEdge(i PlanetaryGridEdgeIndex) PlanetaryGridEdge
}

type gridImpl struct {
	nodes     []geom.Vec3
	edgesMap  mesh.ConnectionMap
	edgesList []PlanetaryGridEdge
}

func MeshBuilderToGrid(builder *mesh.MeshBuilder) PlanetaryGrid {
	size := builder.VertexCount()

	grid := &gridImpl{
		nodes:     make([]geom.Vec3, size),
		edgesMap:  builder.GetConnections(),
		edgesList: make([]PlanetaryGridEdge, 0),
	}

	for i := 0; i < size; i++ {
		grid.nodes[i] = builder.GetCoords(mesh.VertexIndex(i))
	}

	for i := 0; i < size; i++ {
		connectedNodes := grid.edgesMap.GetConnectedSet(mesh.VertexIndex(i))
		for j := range connectedNodes {
			grid.edgesList = append(
				grid.edgesList,
				utils.MakePair(PlanetaryNodeIndex(i), PlanetaryNodeIndex(j)),
			)
		}
	}

	return grid
}

func (grid *gridImpl) GetNodesCount() int {
	return len(grid.nodes)
}
func (grid *gridImpl) GetEdgesCount() int {
	return len(grid.edgesList)
}

func (grid *gridImpl) GetNodeCoords(i PlanetaryNodeIndex) geom.Vec3 {
	return grid.nodes[i]
}
func (grid *gridImpl) AreConnected(i1, i2 PlanetaryNodeIndex) bool {
	return grid.edgesMap.AreConnected(mesh.VertexIndex(i1), mesh.VertexIndex(i2))
}
func (grid *gridImpl) GetConnectedNodes(node PlanetaryNodeIndex) []PlanetaryNodeIndex {
	result := make([]PlanetaryNodeIndex, 0, len(grid.edgesMap[node]))
	for vi := range grid.edgesMap[node] {
		result = append(result, PlanetaryNodeIndex(vi))
	}
	return result
}

func (grid *gridImpl) GetEdge(i PlanetaryGridEdgeIndex) PlanetaryGridEdge {
	return grid.edgesList[i]
}
