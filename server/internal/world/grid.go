package world

import (
	"srv/internal/utils/geom"
	"srv/internal/utils/mesh"
)

// TODO: move all this stuff into utils.SpatialGraph or something

type PlanetaryTileIndex int

// type PlanetaryGridEdgeIndex int
// type PlanetaryGridEdge utils.Pair[PlanetaryTileIndex, PlanetaryTileIndex]

type PlanetaryGrid interface {
	GetNodesCount() int
	// GetEdgesCount() int

	GetNodeCoords(i PlanetaryTileIndex) geom.Vec3
	AreConnected(i1, i2 PlanetaryTileIndex) bool
	GetConnectedNodes(node PlanetaryTileIndex) []PlanetaryTileIndex

	// GetEdge(i PlanetaryGridEdgeIndex) PlanetaryGridEdge

	ToRawData() PlanetaryGridRawData
}

type gridImpl struct {
	nodes    []geom.Vec3
	edgesMap mesh.ConnectionMap
	// edgesList []PlanetaryGridEdge
}

func MeshBuilderToGrid(builder *mesh.MeshBuilder) PlanetaryGrid {
	size := builder.VertexCount()

	grid := &gridImpl{
		nodes:    make([]geom.Vec3, size),
		edgesMap: builder.GetConnections(),
		// edgesList: make([]PlanetaryGridEdge, 0),
	}

	for i := 0; i < size; i++ {
		grid.nodes[i] = builder.GetCoords(mesh.VertexIndex(i))
	}

	// for i := 0; i < size; i++ {
	// 	connectedNodes := grid.edgesMap.GetConnectedSet(mesh.VertexIndex(i))
	// 	for j := range connectedNodes {
	// 		grid.edgesList = append(
	// 			grid.edgesList,
	// 			utils.MakePair(PlanetaryTileIndex(i), PlanetaryTileIndex(j)),
	// 		)
	// 	}
	// }

	return grid
}

func (grid *gridImpl) GetNodesCount() int {
	return len(grid.nodes)
}

// func (grid *gridImpl) GetEdgesCount() int {
// 	return len(grid.edgesList)
// }

func (grid *gridImpl) GetNodeCoords(i PlanetaryTileIndex) geom.Vec3 {
	return grid.nodes[i]
}
func (grid *gridImpl) AreConnected(i1, i2 PlanetaryTileIndex) bool {
	return grid.edgesMap.AreConnected(mesh.VertexIndex(i1), mesh.VertexIndex(i2))
}
func (grid *gridImpl) GetConnectedNodes(node PlanetaryTileIndex) []PlanetaryTileIndex {
	result := make([]PlanetaryTileIndex, 0, len(grid.edgesMap[node]))
	for vi := range grid.edgesMap[node] {
		result = append(result, PlanetaryTileIndex(vi))
	}
	return result
}

// func (grid *gridImpl) GetEdge(i PlanetaryGridEdgeIndex) PlanetaryGridEdge {
// 	return grid.edgesList[i]
// }

type PlanetaryGridRawData struct {
	Coords      []geom.Vec3
	Connections [][]int
}

func (grid *gridImpl) ToRawData() PlanetaryGridRawData {
	size := len(grid.nodes)
	connections := make([][]int, 0, size)

	for i := PlanetaryTileIndex(0); i < PlanetaryTileIndex(size); i++ {
		connecteds := grid.GetConnectedNodes(i)
		nonDuplicates := make([]int, 0)
		for _, c := range connecteds {
			if i >= c {
				continue
			}

			nonDuplicates = append(nonDuplicates, int(c))
		}

		connections = append(connections, nonDuplicates)
	}

	result := PlanetaryGridRawData{
		Coords:      grid.nodes,
		Connections: connections,
	}

	return result
}

func NewGridFromRawData(raw PlanetaryGridRawData) PlanetaryGrid {
	size := len(raw.Coords)

	grid := &gridImpl{
		nodes:    raw.Coords,
		edgesMap: mesh.NewConnectionMap(size),
		// edgesList: make([]PlanetaryGridEdge, 0),
	}

	for i, connected := range raw.Connections {
		for _, j := range connected {
			grid.edgesMap.Connect(mesh.VertexIndex(i), mesh.VertexIndex(j))
		}
	}

	return grid
}
