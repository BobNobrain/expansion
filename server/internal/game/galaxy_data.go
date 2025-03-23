package game

import "srv/internal/utils/pagination"

type GalaxyBeacon struct {
	StarID CelestialID
	Params StarParams
	Coords GalacticCoords
}

func (b GalaxyBeacon) Rate() float64 {
	return b.Params.Luminosity.Suns()
}

type GalaxySectorContentRequest struct {
	SectorID GalacticSectorID
	Search   string
	Page     pagination.PageParams
}
