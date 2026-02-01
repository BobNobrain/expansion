package usecases

import (
	"srv/internal/components"
	"srv/internal/game"
	"srv/internal/game/gamelogic"
	"srv/internal/globals/events"
	"srv/internal/utils/common"
	"time"
)

func NewFactoryDemolishUsecase(repos components.GlobalRepos) components.UsecaseWithOutput[FactoryDemolishInput, any] {
	return makeTransactionalUsecase(factoryDemolishFactory{}, repos)
}

type FactoryDemolishInput struct {
	FactoryID game.FactoryID
}

func (i FactoryDemolishInput) Validate() common.Error {
	return nil
}

type factoryDemolishFactory struct{}

func (factoryDemolishFactory) Produce(
	tuc TransactionalUsecaseContext[FactoryDemolishInput],
) TransactionalUsecase[FactoryDemolishInput, any] {
	return &factoryDemolishInstance{TransactionalUsecaseContext: tuc}
}

type factoryDemolishInstance struct {
	TransactionalUsecaseContext[FactoryDemolishInput]
	factory game.Factory
	base    *game.Base
}

func (uc *factoryDemolishInstance) Setup() common.Error {
	factories, err := uc.tx.Factories().ResolveFactories(
		[]game.FactoryID{uc.input.FactoryID},
		gamelogic.FactoryUpdates(),
	)
	if err != nil {
		return err
	}

	if len(factories) != 1 {
		return common.NewValidationError(
			"FactoryDemolishInput.FactoryID",
			"Specified factory does not exist",
			common.WithDetail("factoryId", uc.input.FactoryID),
		)
	}

	if factories[0].OwnerID != uc.Author {
		return common.NewValidationError(
			"FactoryDemolishInput.FactoryID",
			"Specified factory does not exist",
			common.WithDetail("factoryId", uc.input.FactoryID),
		)
	}

	uc.factory = factories[0]

	base, err := uc.tx.Bases().GetBase(factories[0].BaseID)
	if err != nil {
		return err
	}
	if base == nil {
		return common.NewError(
			common.WithCode("ERR_UNKNOWN"),
			common.WithMessage("Base not found o_O"),
			common.WithDetail("baseId", factories[0].BaseID),
			common.WithDetail("factoryId", factories[0].FactoryID),
		)
	}

	uc.base = base

	return nil
}

func (uc *factoryDemolishInstance) Execute() (any, common.Error) {
	now := time.Now()
	inv := gamelogic.FactoryUpdates().GetDemolishInventory(uc.factory, now)

	err := uc.tx.Factories().DeleteBaseFactory(uc.input.FactoryID)
	if err != nil {
		return nil, err
	}

	uc.base.Inventory.Add(inv)
	err = uc.tx.Bases().UpdateBaseContent(*uc.base)
	if err != nil {
		return nil, err
	}

	events.FactoryRemoved.Publish(events.FactoryRemovedPayload{
		FactoryID: uc.factory.FactoryID,
		BaseID:    uc.factory.BaseID,
	})

	events.BaseUpdated.Publish(events.BaseUpdatedPayload{
		BaseID: uc.base.ID,
		Base:   uc.base,
	})

	return nil, nil
}
