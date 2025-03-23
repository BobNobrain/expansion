package components

import (
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/utils/common"
)

type StarSystemRepoMapRequest struct {
	Limit  int
	Sector game.GalacticSectorCoords
}

type CreateGalaxyPayload struct {
	Systems []CreateGalaxyPayloadSystem
}
type CreateGalaxyPayloadSystem struct {
	ID     game.StarSystemID
	Coords game.GalacticCoords
	Stars  []game.Star
	Orbits map[game.CelestialID]game.OrbitData
}

type ExploreSystemPayload struct {
	ID         game.StarSystemID
	Explorer   domain.UserID
	Orbits     map[game.CelestialID]game.OrbitData
	NPlanets   int
	NMoons     int
	NAsteroids int
}

type StarSystemsRepoReadonly interface {
	GetOverviews(game.GalacticSectorID) ([]game.StarSystemOverview, common.Error)
	GetContent(game.StarSystemID) (game.StarSystemContent, common.Error)
	GetContentMany([]game.StarSystemID) ([]game.StarSystemContent, common.Error)
	GetSystemsOnMap(StarSystemRepoMapRequest) ([]game.StarSystemOverview, common.Error)
}

type StarSystemsRepo interface {
	StarSystemsRepoReadonly

	CreateGalaxy(CreateGalaxyPayload) common.Error
	ExploreSystem(ExploreSystemPayload) common.Error
}
