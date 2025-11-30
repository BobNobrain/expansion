package usecases

import (
	"context"
	"srv/internal/components"
	"srv/internal/game"
	"srv/internal/globals/events"
	"srv/internal/utils/common"
)

type createFactoryUsecase struct {
	store components.Storage
}

type CreateFactoryUsecaseInput struct {
	BaseID game.BaseID
}

func NewCreateFactoryUsecase(store components.Storage) components.Usecase[CreateFactoryUsecaseInput] {
	return &createFactoryUsecase{
		store: store,
	}
}

func (uc *createFactoryUsecase) Run(
	ctx context.Context,
	input CreateFactoryUsecaseInput,
	uctx components.UsecaseContext,
) common.Error {
	tx, err := uc.store.StartTransaction(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	base, err := tx.Bases().GetBase(input.BaseID)
	if err != nil {
		return err
	}
	if base == nil {
		return common.NewValidationError(
			"CreateFactorySiteUsecaseInput.BaseID",
			"Base not found",
			common.WithDetail("baseId", input.BaseID),
		)
	}

	factory := game.MakeEmptyFactory()
	factory.BaseID = base.ID

	err = tx.Factories().CreateBaseFactory(factory)
	if err != nil {
		return err
	}

	events.FactoryCreated.Publish(events.FactoryCreatedPayload{
		BaseID: base.ID,
		Owner:  uctx.Author,
	})

	return tx.Commit()
}
