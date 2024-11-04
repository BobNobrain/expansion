package planetgen

import (
	"math"
	"math/rand"
	"srv/internal/utils/geom"
	"srv/internal/utils/mesh"
)

type GridBuilderOptions struct {
	// 0..1, 0 being minimal possible size, and 1 being the maximal one
	Size float64

	// 0..1, but better in 0.001..0.200. Indicates the share of edges to be rotated
	ChaosPercent float64
}

type GridBuilder struct {
	builder *mesh.MeshBuilder
	rnd     *rand.Rand

	opts GridBuilderOptions

	nodesCount int
	edgesCount int
}

func NewGridBuilder(rnd *rand.Rand, opts GridBuilderOptions) *GridBuilder {
	return &GridBuilder{
		rnd:        rnd,
		builder:    nil,
		opts:       opts,
		nodesCount: 0,
		edgesCount: 0,
	}
}

const minGridSubdivisions int = 5
const maxGridSubdivisions int = 32

func (grid *GridBuilder) Generate() geom.SpatialGraph {
	subdivisions := minGridSubdivisions + int(float64(maxGridSubdivisions-minGridSubdivisions)*grid.opts.Size)
	// subdivisions := 5
	grid.builder = mesh.CreateSubdividedIcosahedron(1.0, subdivisions)
	grid.nodesCount = grid.builder.VertexCount()
	grid.edgesCount = 20*3*(subdivisions-1)*subdivisions/2 - 30*(subdivisions-1)

	grid.inflate()
	grid.rotateRandomEdges()
	// return grid.builder.BuildGraph()
	relaxed := grid.relax()
	return relaxed
}

func (grid *GridBuilder) inflate() {
	for i := 0; i < grid.builder.VertexCount(); i++ {
		grid.builder.MapVerticies(func(v geom.Vec3, vi mesh.VertexIndex) geom.Vec3 {
			return v.Normalized()
		})
	}
}

func (grid *GridBuilder) rotateRandomEdges() {
	nRotations := int(float64(grid.edgesCount) * grid.opts.ChaosPercent)
	nFaces := grid.builder.FaceCount()

	nodesTouched := make(map[mesh.VertexIndex]bool)
	for vi := 0; vi < 12; vi++ {
		// first 12 verticies are from initial icosahedron,
		// and they must not be touched
		nodesTouched[mesh.VertexIndex(vi)] = true
	}

	wasFaceTouched := func(face mesh.Poly) bool {
		for _, vi := range face {
			if nodesTouched[vi] {
				return true
			}
		}
		return false
	}
	touchFace := func(face mesh.Poly) {
		for _, vi := range face {
			nodesTouched[vi] = true
		}
	}
	findOtherVertex := func(face mesh.Poly, notThis, notThat mesh.VertexIndex) mesh.VertexIndex {
		for _, vi := range face {
			if vi != notThis && vi != notThat {
				return vi
			}
		}
		return mesh.VertexIndex(-1)
	}

	for r := 0; r < nRotations; r++ {
		if grid.nodesCount <= len(nodesTouched) {
			// TODO: this is not sufficient to prevent infinite loop, needs a fix
			// there may be nodes that hasn't been touched, but yet all faces
			// are touched in some way
			break
		}

		face1Index := mesh.FaceIndex(grid.rnd.Intn(nFaces))
		face1 := grid.builder.GetFace(face1Index)

		if wasFaceTouched(face1) {
			continue
		}

		targetEdgeStartIndex := grid.rnd.Intn(len(face1))
		targetEdgeEndIndex := 0
		if targetEdgeStartIndex != len(face1)-1 {
			targetEdgeEndIndex = targetEdgeStartIndex + 1
		}

		targetEdgeStart := face1[targetEdgeStartIndex]
		targetEdgeEnd := face1[targetEdgeEndIndex]

		connectedFaces := grid.builder.FindConnectedFaces([]mesh.VertexIndex{targetEdgeStart, targetEdgeEnd})
		face2Index := mesh.FaceIndex(-1)
		for _, candidateFace := range connectedFaces {
			if candidateFace != face1Index {
				face2Index = candidateFace
				break
			}
		}

		face2 := grid.builder.GetFace(face2Index)

		if wasFaceTouched(face2) {
			continue
		}

		touchFace(face1)
		touchFace(face2)

		opposite1 := findOtherVertex(face1, targetEdgeStart, targetEdgeEnd)
		opposite2 := findOtherVertex(face2, targetEdgeStart, targetEdgeEnd)

		grid.builder.SetFace(face1Index, mesh.Poly{opposite1, targetEdgeStart, opposite2})
		grid.builder.SetFace(face2Index, mesh.Poly{opposite2, targetEdgeEnd, opposite1})
	}
}

// relaxes mesh with rotated edges so that it becomes more uniform
func (grid *GridBuilder) relax() geom.SpatialGraph {
	idealFaceArea := (4 * math.Pi) / float64(grid.builder.FaceCount())
	idealEdgeLength := math.Sqrt((idealFaceArea * 4) / math.Sqrt(3))

	minChange := idealEdgeLength * 0.01
	changeRate := 0.9
	maxPasses := 100
	eps := 1e-4

	connections := grid.builder.BuildGraph()

	// random vector with components in -1..1
	randomShift := func() geom.Vec3 {
		return geom.Vec3{
			X: 2*grid.rnd.Float64() - 1,
			Y: 2*grid.rnd.Float64() - 1,
			Z: 2*grid.rnd.Float64() - 1,
		}
	}

	var pass int
	for pass = 0; pass < maxPasses; pass++ {
		forcesByVertex := make([]geom.Vec3, grid.nodesCount)

		for vi := 0; vi < grid.nodesCount; vi++ {
			for connectedVertex := range connections.GetConnections(vi).Items() {
				targetV := connections.GetCoords(vi)
				neighbourV := connections.GetCoords(connectedVertex)
				edge := targetV.Diff(neighbourV)

				lengthsDelta := idealEdgeLength - edge.Len()
				if math.Abs(lengthsDelta) < eps {
					continue
				}

				force := edge.Mul(lengthsDelta)
				forcesByVertex[vi] = forcesByVertex[vi].Add(force)
			}
		}

		maxChangeDone := 0.0
		for vi := 0; vi < grid.nodesCount; vi++ {
			totalForce := forcesByVertex[vi]
			totalForceLen := totalForce.Len()
			noisedTotalForce := totalForce.Add(randomShift().Mul(totalForceLen / 10))

			vertex := connections.GetCoords(vi)
			connections.SetCoords(vi, vertex.Add(noisedTotalForce.Mul(changeRate)).Normalized())

			changeDone := totalForceLen * changeRate
			if maxChangeDone < changeDone {
				maxChangeDone = changeDone
			}
		}

		if maxChangeDone < minChange {
			// premature exit due to no significant changes being done
			break
		}
	}

	return connections
}
