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

type makeFactorySiteContributionUsecase struct {
	store components.Storage
}

type MakeFactorySiteContributionUsecaseInput struct {
	BaseID  game.BaseID
	SiteID  int
	Amounts game.InventoryDelta
}

func NewMakeFactorySiteContributionUsecase(store components.Storage) components.Usecase[MakeFactorySiteContributionUsecaseInput] {
	return &makeFactorySiteContributionUsecase{
		store: store,
	}
}

func (uc *makeFactorySiteContributionUsecase) Run(
	ctx context.Context,
	input MakeFactorySiteContributionUsecaseInput,
	uctx components.UsecaseContext,
) common.Error {
	if !input.Amounts.IsPositive() || input.Amounts.IsEmpty() {
		return common.NewValidationError(
			"CreateFactorySiteUsecaseInput.Amounts",
			"Cannot withdraw materials from construction site",
			common.WithDetail("amounts", input.Amounts),
		)
	}

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

	baseStorage := gamelogic.NewStorage(
		gamelogic.WithContent(base.Inventory),
		gamelogic.WithSize(gamelogic.BaseLogic().GetBaseStorageLimits()),
	)

	removeResult := gamelogic.StorageLogic().AlterStorage(baseStorage, input.Amounts)
	if !removeResult.IsOk() {
		return common.NewValidationError(
			"CreateFactorySiteUsecaseInput.Amounts",
			"Cannot withdraw specified amounts from base",
			common.WithDetail("baseId", input.BaseID),
			common.WithDetail("reason", removeResult.String()),
		)
	}

	site, found := base.Sites[input.SiteID]
	if !found {
		return common.NewValidationError(
			"CreateFactorySiteUsecaseInput.SiteID",
			"Site not found",
			common.WithDetail("baseId", input.BaseID),
			common.WithDetail("siteId", input.SiteID),
			common.WithDetail("sites", len(base.Sites)),
		)
	}

	if !site.Contributed.Contribute(uctx.Author, time.Now(), input.Amounts) {
		return common.NewValidationError(
			"CreateFactorySiteUsecaseInput.Amounts",
			"This contribution exceeds the needs",
			common.WithDetail("amounts", input.Amounts),
			common.WithDetail("required", site.Contributed.AmountsRequired),
		)
	}

	err = tx.Bases().UpdateBaseContent(*base)
	if err != nil {
		return err
	}

	events.BaseUpdated.Publish(events.BaseUpdatedPayload{BaseID: base.ID, Base: base})

	return tx.Commit()
}
