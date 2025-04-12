package usecases

import (
	"context"
	"srv/internal/components"
	"srv/internal/game"
	"srv/internal/utils/common"
)

type createBaseUsecase struct {
	store components.Storage
}

type CreateBaseUsecaseInput struct {
	WorldID game.CelestialID
	TileID  game.TileID
}

func NewCreateBaseUsecase(store components.Storage) components.Usecase[CreateBaseUsecaseInput] {
	return &createBaseUsecase{
		store: store,
	}
}

func (uc *createBaseUsecase) Run(
	ctx context.Context,
	input CreateBaseUsecaseInput,
	uctx components.UsecaseContext,
) common.Error {
	return common.NewError(
		common.WithCode("ERR_NOT_IMPLEMENTED"),
		common.WithMessage("base creation not implemented yet"),
	)
}
