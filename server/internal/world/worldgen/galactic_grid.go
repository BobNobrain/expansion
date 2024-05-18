package worldgen

import (
	"math"
	"srv/internal/utils"
	"srv/internal/utils/geom"
	"srv/internal/world"
)

type GalacticGridGeneratorOptions struct {
	NRings            int
	MinSectors        int
	NSectorsIncrement int
}

func (gen *WorldGen) GenerateGrid(opts *GalacticGridGeneratorOptions) world.GalacticGrid {
	rnd := gen.rnd.Global()

	nRings := opts.NRings
	nCircles := nRings + 1

	circleRs := make([]world.GalacticCoordsRadius, nCircles)
	for ci := 0; ci < nCircles; ci++ {
		progress := float64(ci) / float64(nRings)
		adjustedProgress := (math.Expm1(progress)) / (math.E - 1)
		circleRs[ci] = utils.Lerp(world.InnerRimRadius, world.OuterRimRadius, adjustedProgress)
	}

	sectors := make(map[world.GalacticSectorID]*world.GalacticSector, 0)

	for ri := 0; ri < nRings; ri++ {
		ringInnerR := circleRs[ri]
		ringOuterR := circleRs[ri+1]
		nSectors := opts.MinSectors + ri*opts.NSectorsIncrement
		sectorStart := (ri * 3) % 7

		sectorLength := geom.FullCircles(1. / float64(nSectors))
		theta := sectorLength * geom.Radians(float64(sectorStart)) / 7

		for si := 0; si < nSectors; si++ {
			var sectorId world.GalacticSectorID
			for {
				sectorId = world.CreateGalacticSectorID(rnd)
				if sectors[sectorId] == nil {
					break
				}
			}

			sectors[sectorId] = &world.GalacticSector{
				ID: sectorId,
				Coords: world.GalacticSectorCoords{
					InnerR:     ringInnerR,
					OuterR:     ringOuterR,
					ThetaStart: theta,
					ThetaEnd:   theta + sectorLength,
				},
			}

			theta += sectorLength
		}
	}

	return world.BuildGalacticGridFromSectorsData(sectors)
}
