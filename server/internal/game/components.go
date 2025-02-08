package game

import (
	"srv/internal/components"
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/internal/world"
)

type GalaxyMap interface {
	components.Runner

	ExploreSystem(systemID world.StarSystemID, explorer domain.UserID) common.Error
	ExploreWorld(surfaceID world.CelestialID, explorer domain.UserID) common.Error
}
