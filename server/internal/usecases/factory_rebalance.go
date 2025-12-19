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

type rebalanceFactoryUsecase struct {
	store components.Storage
}

type RebalanceFactoryUsecaseInput struct {
	FactoryID game.FactoryID
	Plan      game.FactoryRebalancePlan
}

func NewRebalanceFactoryUsecase(store components.Storage) components.Usecase[RebalanceFactoryUsecaseInput] {
	return &rebalanceFactoryUsecase{
		store: store,
	}
}

func (uc *rebalanceFactoryUsecase) Run(
	ctx context.Context,
	input RebalanceFactoryUsecaseInput,
	uctx components.UsecaseContext,
) common.Error {
	tx, err := uc.store.StartTransaction(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	factory, err := getFactoryByID(tx, input.FactoryID, "RebalanceFactoryUsecaseInput.FactoryID")
	if err != nil {
		return err
	}

	if len(factory.Equipment) != len(input.Plan.EquipmentRebalances) {
		return common.NewValidationError(
			"RebalanceFactoryUsecaseInput.Plan",
			"Mismatching equipment count",
			common.WithDetail("actual", len(input.Plan.EquipmentRebalances)),
			common.WithDetail("expected", len(factory.Equipment)),
		)
	}

	base, worldData, err := getFactoryLocationData(tx, factory)
	if err != nil {
		return err
	}

	craftbook := gamelogic.CraftingLogic().GetRecipesAt(worldData, base.TileID)

	updatedFactory, err := gamelogic.FactoryRebalance().ApplyRebalancePlan(
		input.Plan,
		factory,
		time.Now(),
		craftbook,
		"RebalanceFactoryUsecaseInput.Plan",
	)
	if err != nil {
		return err
	}

	err = tx.Factories().UpdateBaseFactory(updatedFactory)
	if err != nil {
		return err
	}

	events.FactoryUpdated.Publish(events.FactoryUpdatedPayload{
		Factory: updatedFactory,
	})

	return tx.Commit()
}
