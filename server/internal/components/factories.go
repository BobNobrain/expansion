package components

import (
	"srv/internal/game"
	"srv/internal/utils/common"
)

type FactoriesRepoReadonly interface {
	GetBaseFactories(game.BaseID) ([]game.Factory, common.Error)
	ResolveFactories([]game.FactoryID) ([]game.Factory, common.Error)
}

type FactoriesRepo interface {
	FactoriesRepoReadonly

	CreateBaseFactory(game.Factory) common.Error
	UpdateBaseFactory(game.Factory) common.Error
	DeleteBaseFactory(game.FactoryID) common.Error
}
