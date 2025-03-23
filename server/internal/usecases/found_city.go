package usecases

import (
	"context"
	"srv/internal/components"
	"srv/internal/game"
	"srv/internal/utils"
	"srv/internal/utils/common"
)

type foundCityUsecase struct {
	store components.Storage
}

type FoundCityUsecaseInput struct {
	Name    string
	WorldID game.CelestialID
	TileID  game.TileID
}

func NewFoundCityUsecase(store components.Storage) components.Usecase[FoundCityUsecaseInput] {
	return &foundCityUsecase{
		store: store,
	}
}

func (uc *foundCityUsecase) Run(ctx context.Context, input FoundCityUsecaseInput, uctx components.UsecaseContext) common.Error {
	tx, err := uc.store.StartTransaction(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	world, err := tx.Worlds().GetData(input.WorldID)
	if err != nil {
		return err
	}

	// TODO: calculate (and recalculate) city tiles based on transport infra levels around
	newCityTiles := world.Grid.GetVerticiesAround(int(input.TileID), 2)

	cities, err := tx.Cities().GetByWorldID(world.ID)
	if err != nil {
		return err
	}

	// check if the city center is not claimed
	alreadyClaimedTiles := utils.NewDeterministicSet[game.TileID]()
	for _, city := range cities {
		alreadyClaimedTiles.Add(city.TileID)
		newCityTiles.Remove(int(city.TileID))
		for _, tid := range city.CityTiles {
			alreadyClaimedTiles.Add(tid)
			newCityTiles.Remove(int(tid))
		}
	}

	if alreadyClaimedTiles.Has(input.TileID) {
		return common.NewValidationError("FoundCityUsecaseInput::TileID", "This tile is already claimed by another city")
	}

	err = tx.Cities().Create(components.CreateCityPayload{
		WorldID:      input.WorldID,
		TileID:       input.TileID,
		CityName:     input.Name,
		Founder:      uctx.Author,
		Population:   game.GetInitialCityPopulation(),
		ClaimedTiles: utils.ConvertInts[int, game.TileID](newCityTiles.Items()),
	})
	if err != nil {
		return err
	}

	return tx.Commit()
}
