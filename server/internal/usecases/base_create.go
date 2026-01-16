package usecases

import (
	"context"
	"slices"
	"srv/internal/components"
	"srv/internal/game"
	"srv/internal/globals/events"
	"srv/internal/utils/common"
)

type createBaseUsecase struct {
	store components.GlobalReposReadonly
}

type CreateBaseUsecaseInput struct {
	WorldID  game.CelestialID
	TileID   game.TileID
	Operator game.CompanyID
}

func NewCreateBaseUsecase(store components.GlobalReposReadonly) components.Usecase[CreateBaseUsecaseInput] {
	return &createBaseUsecase{
		store: store,
	}
}

func (uc *createBaseUsecase) Run(
	ctx context.Context,
	input CreateBaseUsecaseInput,
	uctx components.UsecaseContext,
) common.Error {
	tx, err := uc.store.StartTransaction(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// find the city that the base will be attached to
	cities, err := tx.Cities().GetByWorldID(input.WorldID)
	if err != nil {
		return err
	}

	var cityID game.CityID
	for _, city := range cities {
		idx := slices.Index(city.CityTiles, input.TileID)
		if idx != -1 {
			cityID = city.CityID
			break
		}
	}

	if cityID == 0 {
		return common.NewValidationError(
			"CreateBaseUsecaseInput.TileID",
			"No city for tile ID provided",
			common.WithRetriable(),
			common.WithDetail("citiesScanned", len(cities)),
		)
	}

	base, err := tx.Bases().GetBaseAt(input.WorldID, input.TileID)
	if err != nil {
		return err
	}

	if base != nil {
		return common.NewValidationError(
			"CreateBaseUsecaseInput.TileID",
			"This plot is already occupied by another base",
			common.WithDetail("baseId", base.ID),
			common.WithDetail("operator", base.Operator),
		)
	}

	companies, err := tx.Companies().GetOwnedCompanies(uctx.Author)
	if err != nil {
		return err
	}

	isOperatorValid := false
	for _, c := range companies {
		if c.ID == input.Operator {
			isOperatorValid = true
			break
		}
	}

	if !isOperatorValid {
		return common.NewValidationError(
			"CreateBaseUsecaseInput.Operator",
			"Specified company is not owned by you",
			common.WithDetail("nCompaniesChecked", len(companies)),
			common.WithDetail("operator", input.Operator),
		)
	}

	tx.Bases().CreateBase(components.CreateBasePayload{
		WorldID:  input.WorldID,
		TileID:   input.TileID,
		CityID:   cityID,
		Operator: input.Operator,
	})

	events.BaseCreated.Publish(events.BaseCreatedPayload{
		WorldID:  input.WorldID,
		TileID:   input.TileID,
		Operator: input.Operator,
	})

	return tx.Commit()
}
