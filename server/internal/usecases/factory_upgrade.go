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

type upgradeFactoryUsecase struct {
	store components.GlobalReposReadonly
}

type UpgradeFactoryUsecaseInput struct {
	FactoryID game.FactoryID
	Project   game.FactoryUpgradeProject
}

func NewUpgradeFactoryUsecase(store components.GlobalReposReadonly) components.Usecase[UpgradeFactoryUsecaseInput] {
	return &upgradeFactoryUsecase{
		store: store,
	}
}

func (uc *upgradeFactoryUsecase) Run(
	ctx context.Context,
	input UpgradeFactoryUsecaseInput,
	uctx components.UsecaseContext,
) common.Error {
	tx, err := uc.store.StartTransaction(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// setup
	factory, err := getFactoryByID(tx, input.FactoryID, "UpgradeFactoryUsecaseInput.FactoryID")
	if err != nil {
		return err
	}

	if factory.Upgrade.IsInProgress() {
		return common.NewValidationError(
			"UpgradeFactoryUsecaseInput.FactoryID",
			"This factory has an upgrade project that is already in progress",
			common.WithDetail("factoryId", input.FactoryID),
			common.WithDetail("contributions", len(factory.Upgrade.Progress)),
		)
	}

	base, worldData, err := getFactoryLocationData(tx, factory)
	if err != nil {
		return err
	}

	craftbook := gamelogic.CraftingLogic().GetRecipesAt(worldData, base.TileID)

	// validation
	err = gamelogic.FactoryUpgrade().ValidateUpgradeProject(input.Project, craftbook, "UpgradeFactoryUsecaseInput.Project")
	if err != nil {
		return err
	}

	// updates
	updatedFactory := factory
	updatedFactory.Upgrade = input.Project
	updatedFactory.Upgrade.LastUpdated = time.Now()

	// saving
	err = tx.Factories().UpdateBaseFactory(updatedFactory)
	if err != nil {
		return err
	}

	events.FactoryUpdated.Publish(events.FactoryUpdatedPayload{
		Factory: updatedFactory,
	})

	return tx.Commit()
}
