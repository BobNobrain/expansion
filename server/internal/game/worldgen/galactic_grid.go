package worldgen

import (
	"math"
	"srv/internal/game"
	"srv/internal/utils"
	"srv/internal/utils/geom"
)

type GalacticGridGeneratorOptions struct {
	NRings            int
	MinSectors        int
	NSectorsIncrement int
}

func (gen *WorldGen) GenerateGrid(opts *GalacticGridGeneratorOptions) game.GalacticGrid {
	rnd := gen.rnd.Global()

	nRings := opts.NRings
	nCircles := nRings + 1

	circleRs := make([]game.GalacticCoordsRadius, nCircles)
	for ci := 0; ci < nCircles; ci++ {
		progress := float64(ci) / float64(nRings)
		adjustedProgress := (math.Expm1(progress)) / (math.E - 1)
		circleRs[ci] = utils.Lerp(game.InnerRimRadius, game.OuterRimRadius, adjustedProgress)
	}

	sectors := make(map[game.GalacticSectorID]*game.GalacticSector, 0)

	for ri := 0; ri < nRings; ri++ {
		ringInnerR := circleRs[ri]
		ringOuterR := circleRs[ri+1]
		nSectors := opts.MinSectors + ri*opts.NSectorsIncrement
		sectorStart := (ri * 3) % 7

		sectorLength := geom.FullCircles(1. / float64(nSectors))
		theta := sectorLength * geom.Radians(float64(sectorStart)) / 7

		for si := 0; si < nSectors; si++ {
			var sectorId game.GalacticSectorID
			for {
				sectorId = game.CreateGalacticSectorID(rnd)
				if sectors[sectorId] == nil {
					break
				}
			}

			sectors[sectorId] = &game.GalacticSector{
				ID: sectorId,
				Coords: game.GalacticSectorCoords{
					InnerR:     ringInnerR,
					OuterR:     ringOuterR,
					ThetaStart: theta,
					ThetaEnd:   theta + sectorLength,
				},
			}

			theta += sectorLength
		}
	}

	return game.BuildGalacticGridFromSectorsData(sectors)
}
