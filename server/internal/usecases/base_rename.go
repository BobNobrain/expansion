package usecases

import (
	"context"
	"srv/internal/components"
	"srv/internal/game"
	"srv/internal/globals/events"
	"srv/internal/utils/common"
)

type renameBaseUsecase struct {
	store components.GlobalRepos
}

type RenameBaseUsecaseInput struct {
	BaseID   game.BaseID
	BaseName string
}

func NewRenameBaseUsecase(store components.GlobalRepos) components.Usecase[RenameBaseUsecaseInput] {
	return &renameBaseUsecase{
		store: store,
	}
}

func (uc *renameBaseUsecase) Run(
	ctx context.Context,
	input RenameBaseUsecaseInput,
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

	base.Name = input.BaseName

	err = tx.Bases().RenameBase(base.ID, uctx.Author, base.Name)
	if err != nil {
		return err
	}

	events.BaseUpdated.Publish(events.BaseUpdatedPayload{
		BaseID: base.ID,
		Base:   base,
	})

	return tx.Commit()
}
