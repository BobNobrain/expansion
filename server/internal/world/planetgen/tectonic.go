package planetgen

import (
	"math"
	"srv/internal/utils"
	"srv/internal/utils/geom"
)

func (ctx *planetGenContext) generateTectonicElevations() {
	nodesCount := ctx.grid.Size()
	opts := new(tectonicLandscapeOptions)
	opts.NPlates = utils.Clamp(nodesCount/40, 10, 30)

	opts.MinPlateSize = utils.Clamp(nodesCount/120, 3, 10)

	// TODO: randomize these? or load from config?
	opts.ElevationGap = 0.2
	opts.OceanPercentage = 0.7
	opts.Extremeness = 0.5
	opts.SlopeFactor = 0.15

	generateTectonicLandscape(ctx, opts)
	noiseAndBlurElevations(ctx, (&noiseAndBlurElevationsOptions{}).defaults())
}

type tectonicLandscapeOptions struct {
	NPlates         int
	ElevationGap    float64
	OceanPercentage float64
	Extremeness     float64
	MinPlateSize    int
	SlopeFactor     float64
}

type tectonicPlate struct {
	nodes             *utils.DeterministicSet[int]
	elevation         float64
	movementMagnitude float64
	movementAngleSin  float64
	movementAngleCos  float64
}

type tectonicPlateIndex int

type tectonicLandscaper struct {
	ctx  *planetGenContext
	opts *tectonicLandscapeOptions

	plates              []*tectonicPlate
	plateIndexes        []tectonicPlateIndex
	localPlateMovements []geom.Vec3
}

func generateTectonicLandscape(
	ctx *planetGenContext,
	opts *tectonicLandscapeOptions,
) {
	nodesCount := ctx.grid.Size()
	nPlates := opts.NPlates

	tl := &tectonicLandscaper{
		ctx:                 ctx,
		opts:                opts,
		plates:              make([]*tectonicPlate, nPlates),
		plateIndexes:        make([]tectonicPlateIndex, nodesCount),
		localPlateMovements: make([]geom.Vec3, nodesCount),
	}

	for i := 0; i < nPlates; i++ {
		tl.plates[i] = &tectonicPlate{
			nodes: utils.NewDeterministicSet[int](),
		}
	}

	tl.floodFillPlates()
	tl.generatePlateData()
	tl.eatSmallPlates()

	tl.calculateLocalPlateMovements()
	tl.assignElevations()

	// TODO: use plates to fill in planet nameable features – oceans, continents, etc.
}

func (tl *tectonicLandscaper) floodFillPlates() {
	nPlates := len(tl.plates)
	visitedNodes := utils.NewUndeterministicSet[int]()
	floodQueues := make([]*utils.Queue[int], nPlates)

	floodFillStarts := utils.DrawDistinctIntegers(tl.ctx.rnd, nPlates, tl.ctx.grid.Size())

	for pi := 0; pi < nPlates; pi++ {
		plateStart := floodFillStarts[pi]
		floodQueues[pi] = utils.NewQueue[int]()
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

			neighbouringNodes := tl.ctx.grid.GetConnections(*nextNode)
			for _, neighbouringNode := range neighbouringNodes.Items() {
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
	rnd := tl.ctx.rnd
	for pi := 0; pi < nPlates; pi++ {
		isOceanic := rnd.Float64() < tl.opts.OceanPercentage
		plateElevation := utils.Lerp(tl.opts.ElevationGap/2, tl.opts.Extremeness, rnd.Float64())
		moveAmount := rnd.Float64()
		moveAngle := (2*rnd.Float64() - 1) * math.Pi

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

		plateNeighbours := utils.NewDeterministicSet[int]()
		for _, node := range smallPlate.nodes.Items() {
			nodeNeighbours := tl.ctx.grid.GetConnections(node)
			for _, neighbour := range nodeNeighbours.Items() {
				plateNeighbours.Add(neighbour)
			}
		}

		neighbouringPlatesPresence := make([]int, nPlates)
		for _, neighbour := range plateNeighbours.Items() {
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
				biggestNeighbourIndex = tectonicPlateIndex(plateIndex)
				biggestNeighbourSize = size
			}
		}

		if biggestNeighbourIndex == -1 {
			continue
		}

		for _, node := range smallPlate.nodes.Items() {
			tl.plateIndexes[node] = biggestNeighbourIndex
			tl.plates[biggestNeighbourIndex].nodes.Add(node)
		}
	}
}

func (tl *tectonicLandscaper) calculateLocalPlateMovements() {
	planetNorth := geom.Vec3{Y: 1}

	for nodeIndex := 0; nodeIndex < len(tl.plateIndexes); nodeIndex++ {
		plate := tl.plates[tl.plateIndexes[nodeIndex]]
		tileCoords := tl.ctx.grid.GetCoords(nodeIndex)

		tileNormal := tileCoords.Normalized()
		localNorth := planetNorth.Diff(tileNormal.Mul(planetNorth.Dot(tileNormal))).Normalized()
		localEast := localNorth.Cross(tileNormal)

		movementDir := localNorth.Mul(plate.movementAngleSin).Add(localEast.Mul(plate.movementAngleCos))
		tl.localPlateMovements[nodeIndex] = movementDir.Mul(plate.movementMagnitude)
	}
}

func (tl *tectonicLandscaper) assignElevations() {
	slopeFactor := tl.opts.SlopeFactor

	for vi := range tl.plateIndexes {
		nodeIndex := vi
		tilePlateIndex := tl.plateIndexes[vi]
		tilePlate := tl.plates[tilePlateIndex]
		neighbours := tl.ctx.grid.GetConnections(nodeIndex)

		solidElevation := tilePlate.elevation

		plateMovementAtTile := tl.localPlateMovements[vi]
		for _, neighbour := range neighbours.Items() {
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

		tl.ctx.tiles[nodeIndex].Elevation = solidElevation
	}
}
