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
	store components.Storage
}

type CreateBaseUsecaseInput struct {
	WorldID  game.CelestialID
	TileID   game.TileID
	Operator game.CompanyID
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
			common.WithDetails(common.NewDictEncodable().Set("citiesScanned", len(cities))),
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
