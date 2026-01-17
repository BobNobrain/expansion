package components

import (
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/game/gamelogic"
	"srv/internal/utils/common"
)

// should it exist?
type FactoriesRepoReadonly interface {
	ResolveFactoryOverviews([]game.FactoryID) ([]game.FactoryStaticOverview, common.Error)
}

type FactoriesRepo interface {
	FactoriesRepoReadonly

	GetBaseFactories(game.BaseID, *gamelogic.FactoryUpdatesLogic) ([]game.Factory, common.Error)
	ResolveFactories([]game.FactoryID, *gamelogic.FactoryUpdatesLogic) ([]game.Factory, common.Error)

	CreateBaseFactory(game.Factory) common.Error
	UpdateBaseFactory(game.Factory) common.Error
	RenameFactory(game.FactoryID, domain.UserID, string) common.Error
	DeleteBaseFactory(game.FactoryID) common.Error
}
