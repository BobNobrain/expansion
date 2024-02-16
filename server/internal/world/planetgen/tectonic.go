package planetgen

import (
	"math"
	"math/rand"
	"srv/internal/utils"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"srv/internal/world"
)

type tectonicLandscapeOptions struct {
	NPlates         int
	ElevationGap    float64
	OceanPercentage float64
	Extremeness     float64
	MinPlateSize    int
	SlopeFactor     float64
	ElevationScale  phys.Distance
}

func (opts *tectonicLandscapeOptions) Defaults(
	nodesCount int,
	planetRadius phys.Distance,
) *tectonicLandscapeOptions {
	opts.NPlates = nodesCount / 40
	if opts.NPlates < 5 {
		opts.NPlates = 5
	} else if opts.NPlates > 25 {
		opts.NPlates = 25
	}

	opts.MinPlateSize = nodesCount / 120
	if opts.MinPlateSize < 3 {
		opts.MinPlateSize = 3
	} else if opts.MinPlateSize > 10 {
		opts.MinPlateSize = 10
	}

	opts.MinPlateSize = 0
	opts.ElevationGap = 0.2
	opts.OceanPercentage = 0.7
	opts.Extremeness = 0.6
	opts.SlopeFactor = 0.3
	// TODO: this is a rough approximation
	opts.ElevationScale = planetRadius.Mul(1e-3)

	return opts
}

type tectonicPlate struct {
	nodes             *utils.Set[world.PlanetaryNodeIndex]
	elevation         float64
	movementMagnitude float64
	movementAngleSin  float64
	movementAngleCos  float64
}

type tectonicPlateIndex int

type tectonicLandscaper struct {
	grid  world.PlanetaryGrid
	tiles *solidPlanetData
	rnd   *rand.Rand
	opts  *tectonicLandscapeOptions

	plates              []*tectonicPlate
	plateIndexes        []tectonicPlateIndex
	localPlateMovements []geom.Vec3
}

func generateTectonicLandscape(
	rnd *rand.Rand,
	planet *world.Planet,
	opts *tectonicLandscapeOptions,
) *solidPlanetData {
	sourceGrid := planet.Grid
	nodesCount := sourceGrid.GetNodesCount()
	nPlates := opts.NPlates

	tiles := &solidPlanetData{
		planetRadius:       planet.Radius,
		relativeElevations: make([]float64, nodesCount),
		seaLevel:           0,
		airLevel:           1,
	}

	tl := &tectonicLandscaper{
		grid:                sourceGrid,
		tiles:               tiles,
		rnd:                 rnd,
		opts:                opts,
		plates:              make([]*tectonicPlate, nPlates),
		plateIndexes:        make([]tectonicPlateIndex, nodesCount),
		localPlateMovements: make([]geom.Vec3, nodesCount),
	}

	for i := 0; i < nPlates; i++ {
		tl.plates[i] = &tectonicPlate{
			nodes: utils.NewSet[world.PlanetaryNodeIndex](),
		}
	}

	tl.floodFillPlates()
	tl.generatePlateData()
	tl.eatSmallPlates()

	tl.calculateLocalPlateMovements()
	tl.assignElevations()

	planet.Tiles = tl.tiles

	// TODO: use plates to fill in planet nameable features – oceans, continents, etc.
	return tiles
}

func (tl *tectonicLandscaper) floodFillPlates() {
	nPlates := len(tl.plates)
	visitedNodes := utils.NewSet[world.PlanetaryNodeIndex]()
	floodQueues := make([]*utils.Queue[world.PlanetaryNodeIndex], nPlates)

	floodFillStarts := make([]world.PlanetaryNodeIndex, 0)
	for nodeIndex := range utils.DrawDistinctIntegers(tl.rnd, nPlates, tl.grid.GetNodesCount()) {
		floodFillStarts = append(floodFillStarts, world.PlanetaryNodeIndex(nodeIndex))
	}

	for pi := 0; pi < nPlates; pi++ {
		plateStart := floodFillStarts[pi]
		floodQueues[pi] = utils.NewQueue[world.PlanetaryNodeIndex]()
		floodQueues[pi].Push(plateStart)
	}

	hasNonEmptyQueue := true
	for hasNonEmptyQueue {
		hasNonEmptyQueue = false

		for pi := 0; pi < nPlates; pi++ {
			plate := tl.plates[pi]
			queue := floodQueues[pi]
			nextNode := queue.Pop()

			if nextNode == nil {
				continue
			}

			hasNonEmptyQueue = true
			if !visitedNodes.Has(*nextNode) {
				plate.nodes.Add(*nextNode)
				tl.plateIndexes[*nextNode] = tectonicPlateIndex(pi)
				visitedNodes.Add(*nextNode)
			}

			neighbouringNodes := tl.grid.GetConnectedNodes(*nextNode)
			for _, neighbouringNode := range neighbouringNodes {
				if visitedNodes.Has(neighbouringNode) {
					continue
				}

				queue.Push(neighbouringNode)
			}
		}
	}
}

func (tl *tectonicLandscaper) generatePlateData() {
	nPlates := len(tl.plates)
	halfGap := tl.opts.ElevationGap / 2
	for pi := 0; pi < nPlates; pi++ {
		isOceanic := tl.rnd.Float64() < tl.opts.OceanPercentage
		plateElevation := tl.rnd.Float64()*(tl.opts.Extremeness-halfGap) + halfGap
		moveAmount := tl.rnd.Float64()
		moveAngle := (2*tl.rnd.Float64() - 1) * math.Pi

		plate := tl.plates[pi]
		plate.elevation = plateElevation
		if isOceanic {
			plate.elevation = -plateElevation
		}

		plate.movementMagnitude = moveAmount
		plate.movementAngleSin = math.Sin(moveAngle)
		plate.movementAngleCos = math.Cos(moveAngle)
	}
}

func (tl *tectonicLandscaper) eatSmallPlates() {
	nPlates := len(tl.plates)
	for pi := 0; pi < nPlates; pi++ {
		smallPlate := tl.plates[pi]
		if smallPlate.nodes.Size() >= tl.opts.MinPlateSize {
			continue
		}

		plateNeighbours := utils.NewSet[world.PlanetaryNodeIndex]()
		for node := range smallPlate.nodes.Items() {
			nodeNeighbours := tl.grid.GetConnectedNodes(node)
			for _, neighbour := range nodeNeighbours {
				plateNeighbours.Add(neighbour)
			}
		}

		neighbouringPlatesPresence := make(map[tectonicPlateIndex]int)
		for neighbour := range plateNeighbours.Items() {
			plateIndex := tl.plateIndexes[neighbour]
			if plateIndex == tectonicPlateIndex(pi) {
				continue
			}

			neighbouringPlatesPresence[plateIndex] += 1
		}

		var biggestNeighbourIndex tectonicPlateIndex = -1
		biggestNeighbourSize := 0
		for plateIndex, size := range neighbouringPlatesPresence {
			if size > biggestNeighbourSize {
				biggestNeighbourIndex = plateIndex
				biggestNeighbourSize = size
			}
		}

		if biggestNeighbourIndex == -1 {
			continue
		}

		for node := range smallPlate.nodes.Items() {
			tl.plateIndexes[node] = biggestNeighbourIndex
			tl.plates[biggestNeighbourIndex].nodes.Add(node)
		}
	}
}

func (tl *tectonicLandscaper) calculateLocalPlateMovements() {
	planetNorth := geom.Vec3{Y: 1}

	for nodeIndex := 0; nodeIndex < len(tl.plateIndexes); nodeIndex++ {
		plate := tl.plates[tl.plateIndexes[nodeIndex]]
		tileCoords := tl.grid.GetNodeCoords(world.PlanetaryNodeIndex(nodeIndex))

		tileNormal := tileCoords.Normalized()
		localNorth := planetNorth.Diff(tileNormal.Mul(planetNorth.Dot(tileNormal))).Normalized()
		localEast := localNorth.Cross(tileNormal)

		movementDir := localNorth.Mul(plate.movementAngleSin).Add(localEast.Mul(plate.movementAngleCos))
		tl.localPlateMovements[nodeIndex] = movementDir.Mul(plate.movementMagnitude)
	}
}

func (tl *tectonicLandscaper) assignElevations() {
	slopeFactor := tl.opts.SlopeFactor

	for vi := 0; vi < len(tl.plateIndexes); vi++ {
		nodeIndex := world.PlanetaryNodeIndex(vi)
		tilePlateIndex := tl.plateIndexes[vi]
		tilePlate := tl.plates[tilePlateIndex]
		neighbours := tl.grid.GetConnectedNodes(nodeIndex)

		solidElevation := tilePlate.elevation

		plateMovementAtTile := tl.localPlateMovements[vi]
		for _, neighbour := range neighbours {
			neighbourPlateIndex := tl.plateIndexes[neighbour]
			if neighbourPlateIndex == tilePlateIndex {
				continue
			}

			neighbourPlate := tl.plates[neighbourPlateIndex]
			plateMovementAtNeighbour := tl.localPlateMovements[neighbour]
			plateElevationsDiff := tilePlate.elevation - neighbourPlate.elevation

			dot := plateMovementAtTile.Dot(plateMovementAtNeighbour)
			if math.Abs(dot) < 0.05 {
				// plates are not very much colliding or running away
				// maybe add some border friction and volcanic activity later
				continue
			}

			if dot < 0 {
				if math.Abs(plateElevationsDiff) > tl.opts.ElevationGap {
					// one of the plates is being subducted
					solidElevation += plateElevationsDiff * slopeFactor
				} else {
					// plates just collide
					solidElevation += math.Abs(plateElevationsDiff) * slopeFactor
				}
			} else {
				solidElevation -= math.Abs(plateElevationsDiff) * slopeFactor
			}
		}

		if solidElevation < -1.0 {
			solidElevation = -1.0
		} else if 0.9999 < solidElevation {
			solidElevation = 0.9999
		}

		tl.tiles.relativeElevations[nodeIndex] = solidElevation
	}
}
