package usecases

import (
	"srv/internal/components"
	"srv/internal/game"
	"srv/internal/game/gamelogic"
	"srv/internal/utils/common"
)

func getFactoryByID(
	tx components.StorageRepos,
	fid game.FactoryID,
	fieldNameForError string,
) (game.Factory, common.Error) {
	factories, err := tx.Factories().ResolveFactories([]game.FactoryID{fid}, gamelogic.FactoryUpdates())
	if err != nil {
		return game.Factory{}, err
	}

	if len(factories) != 1 {
		return game.Factory{}, common.NewValidationError(
			fieldNameForError,
			"Factory not found",
			common.WithDetail("factoryId", fid),
		)
	}

	factory := factories[0]
	return factory, nil
}

func getFactoryLocationData(tx components.StorageRepos, factory game.Factory) (*game.Base, game.WorldData, common.Error) {
	base, err := tx.Bases().GetBase(factory.BaseID)
	if err != nil {
		return nil, game.WorldData{}, err
	}

	worldData, err := tx.Worlds().GetData(base.WorldID)
	if err != nil {
		return nil, game.WorldData{}, err
	}

	return base, worldData, nil
}
