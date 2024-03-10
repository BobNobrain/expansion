package world

import "srv/internal/domain"

type GalaxyContent struct {
	StarSystems []*domain.StarSystem
	Grid        GalacticGrid
	// TODO: other things needed to be simulated, e.g.:
	// Markets []*domain.Market
	// Fleets []*domain.Ship
	// etc.
}
