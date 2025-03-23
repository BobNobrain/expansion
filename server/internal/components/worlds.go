package components

import (
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/utils/common"
)

type CreateWorldPayload struct {
	ID     game.CelestialID
	Params game.WorldParams
	Size   int
}

type ExploreWorldPayload struct {
	ID         game.CelestialID
	ExploredBy domain.UserID
	Data       game.WorldExplorationData
}

type WorldsRepoReadonly interface {
	GetOverviews(game.StarSystemID) ([]game.WorldOverview, common.Error)
	GetData(game.CelestialID) (game.WorldData, common.Error)
	GetDataMany([]game.CelestialID) ([]game.WorldData, common.Error)
}

type WorldsRepo interface {
	WorldsRepoReadonly

	CreateWorlds([]CreateWorldPayload) common.Error
	ExploreWorld(ExploreWorldPayload) common.Error
}
