package usecases

import (
	"context"
	"fmt"
	"srv/internal/components"
	"srv/internal/game"
	"srv/internal/game/gamelogic"
	"srv/internal/globals/events"
	"srv/internal/utils/common"
)

type createFactorySiteUsecase struct {
	store components.Storage
}

type CreateFactorySiteUsecaseInput struct {
	BaseID    game.BaseID
	Equipment []game.FactoryEquipment
}

func NewCreateFactorySiteUsecase(store components.Storage) components.Usecase[CreateFactorySiteUsecaseInput] {
	return &createFactorySiteUsecase{
		store: store,
	}
}

func (uc *createFactorySiteUsecase) Run(
	ctx context.Context,
	input CreateFactorySiteUsecaseInput,
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

	vl := gamelogic.NewFactoryValidationLogic()
	for idx, feq := range input.Equipment {
		err = vl.ValidateEquipment(feq, fmt.Sprintf("CreateFactorySiteUsecaseInput.Equipment[%d]", idx))
		if err != nil {
			return err
		}
	}

	cl := gamelogic.NewConstructionLogic()
	base.AddConstructionSite(input.Equipment, cl.CreateFactoryContribution(input.Equipment))

	err = tx.Bases().UpdateBaseContent(*base)
	if err != nil {
		return err
	}

	events.BaseUpdated.Publish(events.BaseUpdatedPayload{BaseID: base.ID, Base: base})

	return tx.Commit()
}
