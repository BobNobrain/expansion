package usecases

import (
	"context"
	"srv/internal/components"
	"srv/internal/game"
	"srv/internal/globals/events"
	"srv/internal/utils/common"
)

type renameFactoryUsecase struct {
	store components.GlobalRepos
}

type RenameFactoryUsecaseInput struct {
	FactoryID   game.FactoryID
	FactoryName string
}

func NewRenameFactoryUsecase(store components.GlobalRepos) components.Usecase[RenameFactoryUsecaseInput] {
	return &renameFactoryUsecase{
		store: store,
	}
}

func (uc *renameFactoryUsecase) Run(
	ctx context.Context,
	input RenameFactoryUsecaseInput,
	uctx components.UsecaseContext,
) common.Error {
	tx, err := uc.store.StartTransaction(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	factory, err := getFactoryByID(tx, input.FactoryID, "RenameFactoryUsecaseInput.FactoryID")
	if err != nil {
		return err
	}

	factory.Name = input.FactoryName

	err = tx.Factories().RenameFactory(factory.FactoryID, uctx.Author, factory.Name)
	if err != nil {
		return err
	}

	events.FactoryUpdated.Publish(events.FactoryUpdatedPayload{
		Factory: factory,
	})

	return tx.Commit()
}
