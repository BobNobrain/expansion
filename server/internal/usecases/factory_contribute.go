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

type contributeToFactoryUsecase struct {
	store components.Storage
}

type ContributeToFactoryUsecaseInput struct {
	FactoryID game.FactoryID
	Amounts   game.InventoryDelta
	// TODO: specify inventory id to withdraw materials from
}

func NewContributeToFactoryUsecase(store components.Storage) components.Usecase[ContributeToFactoryUsecaseInput] {
	return &contributeToFactoryUsecase{
		store: store,
	}
}

func (uc *contributeToFactoryUsecase) Run(
	ctx context.Context,
	input ContributeToFactoryUsecaseInput,
	uctx components.UsecaseContext,
) common.Error {
	if !input.Amounts.IsPositive() || input.Amounts.IsEmpty() {
		return common.NewValidationError(
			"ContributeToFactoryUsecaseInput.Amounts",
			"Cannot withdraw materials from upgrade project",
			common.WithDetail("amounts", input.Amounts),
		)
	}

	tx, err := uc.store.StartTransaction(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// setup
	factory, err := getFactoryByID(tx, input.FactoryID, "ContributeToFactoryUsecaseInput.FactoryID")
	if err != nil {
		return err
	}

	base, worldData, err := getFactoryLocationData(tx, factory)
	if err != nil {
		return err
	}

	craftbook := gamelogic.CraftingLogic().GetRecipesAt(worldData, base.TileID)

	updatedFactory := factory
	now := time.Now()

	// updates
	ok := base.Inventory.Remove(input.Amounts)
	if !ok {
		return common.NewValidationError(
			"ContributeToFactoryUsecaseInput.Amounts",
			"Not enough materials in base inventory",
			common.WithDetail("amounts", input.Amounts),
		)
	}

	contrib, err := gamelogic.FactoryUpgrade().ContributeToUpgradeProject(
		&updatedFactory,
		game.ContributionHistoryItem{Contributor: uctx.Author, AmountsProvided: input.Amounts, Date: now},
		"ContributeToFactoryUsecaseInput.Amounts",
	)
	if err != nil {
		return err
	}

	if contrib.IsFulfilled() {
		gamelogic.FactoryUpgrade().ApplyUpgrade(&updatedFactory, craftbook, now)
	}

	// saving
	err = tx.Bases().UpdateBaseContent(*base)
	if err != nil {
		return err
	}

	events.BaseUpdated.Publish(events.BaseUpdatedPayload{
		BaseID: base.ID,
		Base:   base,
	})

	err = tx.Factories().UpdateBaseFactory(updatedFactory)
	if err != nil {
		return err
	}

	events.FactoryUpdated.Publish(events.FactoryUpdatedPayload{
		FactoryID: factory.FactoryID,
	})

	return tx.Commit()
}
