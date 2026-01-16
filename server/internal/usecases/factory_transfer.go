package usecases

import (
	"context"
	"srv/internal/components"
	"srv/internal/game"
	"srv/internal/game/gamelogic"
	"srv/internal/globals/events"
	"srv/internal/utils/common"
	"time"
)

type transferFactoryItemsUsecase struct {
	store components.GlobalRepos
}

type TransferFactoryItemsUsecaseInput struct {
	FactoryID         game.FactoryID
	Items             game.InventoryDelta
	FromFactoryToBase bool
}

func NewTransferFactoryItemsUsecase(store components.GlobalRepos) components.Usecase[TransferFactoryItemsUsecaseInput] {
	return &transferFactoryItemsUsecase{
		store: store,
	}
}

func (uc *transferFactoryItemsUsecase) Run(
	ctx context.Context,
	input TransferFactoryItemsUsecaseInput,
	uctx components.UsecaseContext,
) common.Error {
	tx, err := uc.store.StartTransaction(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	factory, err := getFactoryByID(tx, input.FactoryID, "TransferFactoryItemsUsecaseInput.FactoryID")
	if err != nil {
		return err
	}

	base, err := tx.Bases().GetBase(factory.BaseID)
	if err != nil {
		return err
	}

	// TODO: check if factory and base belong to current player

	now := time.Now()

	if input.FromFactoryToBase {
		factualDelta := gamelogic.FactoryUpdates().WithdrawItems(&factory, input.Items, now)
		ok := base.Inventory.Add(factualDelta)
		if !ok {
			return common.NewValidationError(
				"TransferFactoryItemsUsecaseInput.Items",
				"Cannot add items to base inventory",
				common.WithDetail("delta", factualDelta),
				common.WithDetail("baseId", base.ID),
				common.WithDetail("factoryId", factory.FactoryID),
			)
		}
	} else {
		ok := base.Inventory.Remove(input.Items)
		if !ok {
			return common.NewValidationError(
				"TransferFactoryItemsUsecaseInput.Items",
				"Cannot remove items from base inventory",
				common.WithDetail("delta", input.Items),
				common.WithDetail("baseId", base.ID),
				common.WithDetail("factoryId", factory.FactoryID),
			)
		}

		ok = gamelogic.FactoryUpdates().AddItems(&factory, input.Items, now)
		if !ok {
			return common.NewValidationError(
				"TransferFactoryItemsUsecaseInput.Items",
				"Cannot add items to factory inventory",
				common.WithDetail("delta", input.Items),
				common.WithDetail("baseId", base.ID),
				common.WithDetail("factoryId", factory.FactoryID),
			)
		}
	}

	err = tx.Factories().UpdateBaseFactory(factory)
	if err != nil {
		return err
	}

	err = tx.Bases().UpdateBaseContent(*base)
	if err != nil {
		return err
	}

	events.FactoryUpdated.Publish(events.FactoryUpdatedPayload{
		Factory: factory,
	})

	events.BaseUpdated.Publish(events.BaseUpdatedPayload{
		BaseID: base.ID,
		Base:   base,
	})

	return tx.Commit()
}
