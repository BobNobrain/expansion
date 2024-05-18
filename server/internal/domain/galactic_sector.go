package domain

import (
	"math/rand"
	"srv/internal/utils"
)

type GalacticSectorID string

func CreateGalacticSectorID(rnd *rand.Rand) GalacticSectorID {
	return GalacticSectorID(utils.GenerateRandomStringIDFormatted("XX", rnd))
}

type GalacticSector struct {
	ID     GalacticSectorID
	Coords GalacticSectorCoords
}
