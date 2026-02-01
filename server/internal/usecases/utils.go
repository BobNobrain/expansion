package usecases

import (
	"context"
	"srv/internal/components"
	"srv/internal/utils/common"
)

type UsecaseInput interface {
	Validate() common.Error
}

type TransactionalUsecaseContext[Input any] struct {
	components.UsecaseContext
	input Input
	tx    components.GlobalReposTx
}

type TransactionalUsecaseFabric[Input UsecaseInput, Output any] interface {
	Produce(TransactionalUsecaseContext[Input]) TransactionalUsecase[Input, Output]
}

type TransactionalUsecase[Input UsecaseInput, Output any] interface {
	Setup() common.Error
	Execute() (Output, common.Error)
}

type transactionalUsecaseWrapper[Input UsecaseInput, Output any] struct {
	f     TransactionalUsecaseFabric[Input, Output]
	repos components.GlobalRepos
}

func (s *transactionalUsecaseWrapper[Input, Output]) Run(
	ctx context.Context,
	input Input,
	uctx components.UsecaseContext,
) (Output, common.Error) {
	var zero Output

	err := input.Validate()
	if err != nil {
		return zero, err
	}

	tx, err := s.repos.StartTransaction(ctx)
	if err != nil {
		return zero, err
	}
	defer tx.Rollback()

	uc := s.f.Produce(TransactionalUsecaseContext[Input]{
		UsecaseContext: uctx,
		input:          input,
		tx:             tx,
	})

	err = uc.Setup()
	if err != nil {
		return zero, err
	}

	result, err := uc.Execute()
	if err != nil {
		return zero, err
	}

	return result, tx.Commit()
}

func makeTransactionalUsecase[Input UsecaseInput, Output any](
	f TransactionalUsecaseFabric[Input, Output],
	repos components.GlobalRepos,
) components.UsecaseWithOutput[Input, Output] {
	return &transactionalUsecaseWrapper[Input, Output]{f: f, repos: repos}
}
