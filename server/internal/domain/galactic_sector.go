package domain

import (
	"math/rand"
	"srv/internal/utils"
	"srv/internal/utils/common"
)

type GalacticSectorID string

func CreateGalacticSectorID(rnd *rand.Rand) GalacticSectorID {
	return GalacticSectorID(utils.GenerateRandomStringIDFormatted("XX", rnd))
}

type GalacticSector struct {
	ID     GalacticSectorID
	Coords GalacticSectorCoords
}

type GalacticSectorsRepo interface {
	Create(*GalacticSector) common.Error
	GetAll() ([]*GalacticSector, common.Error)
}
