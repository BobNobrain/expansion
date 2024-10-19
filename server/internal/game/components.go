package game

import (
	"srv/internal/components"
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/internal/utils/pagination"
	"srv/internal/world"
)

type GalaxyMap interface {
	components.Runner

	QuerySectorContent(rq world.GalaxySectorContentRequest) pagination.Page[world.StarSystem]
	GetOverview(limit int) ([]*world.GalacticSector, []world.GalaxyBeacon)
	GetSystemContent(systemID world.StarSystemID, cmd *components.DispatcherCommand) (world.StarSystem, []world.SurfaceOverview, common.Error)
	GetSurfaceData(surfaceID world.CelestialID, cmd *components.DispatcherCommand) (world.SurfaceData, common.Error)

	ExploreSystem(systemID world.StarSystemID, explorer domain.UserID)
	ExploreSurface(surfaceID world.CelestialID, explorer domain.UserID)
}
