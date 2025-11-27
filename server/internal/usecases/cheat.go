package usecases

import (
	"context"
	"srv/internal/components"
	"srv/internal/utils/common"
)

type cheatUsecase struct {
	store  components.Storage
	engine components.CheatEngine
}

type CheatUsecaseInput struct {
	Command string
}
type CheatUsecaseOutput struct {
	Result common.Encodable
}

func NewCheatUsecase(store components.Storage, engine components.CheatEngine) components.UsecaseWithOutput[CheatUsecaseInput, CheatUsecaseOutput] {
	return &cheatUsecase{
		store:  store,
		engine: engine,
	}
}

func (uc *cheatUsecase) Run(
	ctx context.Context,
	input CheatUsecaseInput,
	uctx components.UsecaseContext,
) (CheatUsecaseOutput, common.Error) {
	tx, err := uc.store.StartTransaction(ctx)
	if err != nil {
		return CheatUsecaseOutput{}, err
	}
	defer tx.Rollback()

	result, err := uc.engine.Execute(input.Command, tx, uctx)
	if err != nil {
		return CheatUsecaseOutput{}, err
	}

	return CheatUsecaseOutput{
		Result: result,
	}, tx.Commit()
}
