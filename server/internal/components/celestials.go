package components

import (
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/internal/world"
)

type StarSystemRepoMapRequest struct {
	Limit  int
	Sector world.GalacticSectorCoords
}

type CreateGalaxyPayload struct {
	Systems []CreateGalaxyPayloadSystem
}
type CreateGalaxyPayloadSystem struct {
	ID     world.StarSystemID
	Coords world.GalacticCoords
	Stars  []world.Star
}

type ExploreSystemPayload struct {
	ID       world.StarSystemID
	Explorer domain.UserID
	Orbits   map[world.CelestialID]world.OrbitData
	NPlanets int
	NMoons   int
}

type StarSystemsRepo interface {
	GetOverviews(world.GalacticSectorID) ([]world.StarSystemOverview, common.Error)
	GetContent(world.StarSystemID) (world.StarSystemContent, common.Error)
	GetSystemsOnMap(StarSystemRepoMapRequest) ([]world.StarSystemOverview, common.Error)

	CreateGalaxy(CreateGalaxyPayload) common.Error
	ExploreSystem(ExploreSystemPayload) common.Error
}

type CreateWorldPayload struct {
	ID     world.CelestialID
	Params world.CelestialSurfaceParams
	Size   int
}

type WorldsRepo interface {
	GetOverviews(world.StarSystemID) ([]world.WorldOverview, common.Error)
	GetData(world.CelestialID) (world.WorldData, common.Error)

	CreateWorlds([]CreateWorldPayload) common.Error
	ExploreWorld(world.WorldData) common.Error
}
