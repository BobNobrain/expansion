package geom

import (
	"fmt"
	"slices"
	"srv/internal/utils"
)

type SpatialGraph interface {
	Size() int

	Connect(int, int)
	AreConnected(int, int) bool
	GetConnections(int) *utils.DeterministicSet[int]

	GetCoords(int) Vec3
	SetCoords(int, Vec3)
	GetAllCoords() []Vec3
	GetUnduplicatedConnections() [][]int
}

func NewSpatialGraph(size int) SpatialGraph {
	graph := &spatialGraph{
		connections: make([]*utils.DeterministicSet[int], size),
		coords:      make([]Vec3, size),
	}
	graph.initConnectionSets()
	return graph
}

func RestoreSpatialGraph(coords []Vec3, connectons [][]int) SpatialGraph {
	if len(coords) != len(connectons) {
		panic(fmt.Sprintf("geom.RestoreSpatialGraph: len(coords) != len(connections) / %d != %d", len(coords), len(connectons)))
	}

	graph := &spatialGraph{
		connections: make([]*utils.DeterministicSet[int], len(connectons)),
		coords:      coords,
	}
	graph.initConnectionSets()

	for n1, ns := range connectons {
		for _, n2 := range ns {
			graph.Connect(n1, n2)
		}
	}

	return graph
}

func (sg *spatialGraph) initConnectionSets() {
	for i := 0; i < len(sg.connections); i++ {
		sg.connections[i] = utils.NewDeterministicSet[int]()
	}
}

type spatialGraph struct {
	connections []*utils.DeterministicSet[int]
	coords      []Vec3
}

func (sg *spatialGraph) Size() int {
	return len(sg.coords)
}

func (sg *spatialGraph) Connect(n1, n2 int) {
	sg.connections[n1].Add(n2)
	sg.connections[n2].Add(n1)
}
func (sg *spatialGraph) AreConnected(n1, n2 int) bool {
	return sg.connections[n1].Has(n2)
}
func (sg *spatialGraph) GetConnections(n int) *utils.DeterministicSet[int] {
	return sg.connections[n]
}

func (sg *spatialGraph) GetUnduplicatedConnections() [][]int {
	size := len(sg.connections)
	connections := make([][]int, 0, size)

	for i := 0; i < size; i++ {
		connecteds := sg.connections[i]
		nonDuplicates := make([]int, 0)
		for _, c := range connecteds.Items() {
			if i >= c {
				continue
			}

			nonDuplicates = append(nonDuplicates, int(c))
		}

		slices.Sort(nonDuplicates)

		connections = append(connections, nonDuplicates)
	}

	return connections
}

func (sg *spatialGraph) GetCoords(n int) Vec3 {
	return sg.coords[n]
}
func (sg *spatialGraph) SetCoords(n int, coords Vec3) {
	sg.coords[n] = coords
}
func (sg *spatialGraph) GetAllCoords() []Vec3 {
	return sg.coords
}
