package worldgen

import (
	"math"
	"math/rand"
	"srv/internal/domain"
	"srv/internal/utils"
	"srv/internal/world"
)

type GalacticGridGeneratorOptions struct {
	Rnd               *rand.Rand
	NRings            int
	MinSectors        int
	NSectorsIncrement int
}

func GenerateGalacticGrid(opts *GalacticGridGeneratorOptions) world.GalacticGrid {
	nRings := opts.NRings
	nCircles := nRings + 1

	circleRs := make([]domain.GalacticCoordsRadius, nCircles)
	for ci := 0; ci < nCircles; ci++ {
		progress := float64(ci) / float64(nRings)
		adjustedProgress := (math.Expm1(progress)) / (math.E - 1)
		circleRs[ci] = utils.Lerp(domain.InnerRimRadius, domain.OuterRimRadius, adjustedProgress)
	}

	sectors := make(map[domain.GalacticSectorID]*domain.GalacticSector, 0)

	for ri := 0; ri < nRings; ri++ {
		ringInnerR := circleRs[ri]
		ringOuterR := circleRs[ri+1]
		nSectors := opts.MinSectors + ri*opts.NSectorsIncrement
		sectorStart := (ri * 3) % 7

		sectorLength := domain.GalacticCoordsAngle(math.Pi * 2 / float64(nSectors))
		theta := sectorLength * domain.GalacticCoordsAngle(sectorStart) / 7

		for si := 0; si < nSectors; si++ {
			var sectorId domain.GalacticSectorID
			for {
				sectorId = domain.CreateGalacticSectorID(opts.Rnd)
				if sectors[sectorId] == nil {
					break
				}
			}

			sectors[sectorId] = &domain.GalacticSector{
				ID: sectorId,
				Coords: domain.GalacticSectorCoords{
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
