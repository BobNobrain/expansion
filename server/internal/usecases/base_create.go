package usecases

import (
	"srv/internal/components"
	"srv/internal/game"
	"srv/internal/globals/events"
	"srv/internal/utils/common"
)

func NewCreateBaseUsecase(repos components.GlobalRepos) components.UsecaseWithOutput[BaseCreateInput, any] {
	return makeTransactionalUsecase(BaseCreateFactory{}, repos)
}

type BaseCreateInput struct {
	WorldID  game.CelestialID
	TileID   game.TileID
	Operator game.CompanyID
	Name     string
}

func (i BaseCreateInput) Validate() common.Error {
	if !i.WorldID.IsPlanetID() && !i.WorldID.IsAsteroidID() && !i.WorldID.IsMoonID() {
		return common.NewValidationError(
			"BaseCreateInput.WorldID",
			"Bases can only be created on planets, moons, or asteroids",
			common.WithDetail("worldId", i.WorldID),
		)
	}
	if !i.TileID.IsValid() {
		return common.NewValidationError(
			"BaseCreateInput.TileID",
			"Invalid tile id",
			common.WithDetail("tileId", i.TileID),
		)
	}
	if !i.Operator.IsValid() {
		return common.NewValidationError(
			"BaseCreateInput.Operator",
			"Invalid company id",
			common.WithDetail("companyId", i.Operator),
		)
	}
	if len(i.Name) > 32 {
		return common.NewValidationError(
			"BaseCreateInput.Name",
			"Base name is too long",
			common.WithDetail("nameLength", len(i.Name)),
		)
	}

	return nil
}

type BaseCreateFactory struct{}

func (f BaseCreateFactory) Produce(tuc TransactionalUsecaseContext[BaseCreateInput]) TransactionalUsecase[BaseCreateInput, any] {
	return &baseCreateInstance{
		TransactionalUsecaseContext: tuc,
	}
}

type baseCreateInstance struct {
	TransactionalUsecaseContext[BaseCreateInput]
	cityID game.CityID
}

func (uc *baseCreateInstance) Setup() common.Error {
	// find the city that the base will be attached to
	cities, err := uc.tx.Cities().GetByWorldID(uc.input.WorldID)
	if err != nil {
		return err
	}

	var cityID game.CityID
	for _, city := range cities {
		if city.IsOwnedAndNotCenter(uc.input.TileID) {
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
	uc.cityID = cityID

	base, err := uc.tx.Bases().GetBaseAt(uc.input.WorldID, uc.input.TileID)
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

	company, err := uc.tx.Companies().GetCompanyData(uc.input.Operator)
	if err != nil {
		return err
	}

	if company.OwnerID != uc.Author {
		return common.NewValidationError(
			"CreateBaseUsecaseInput.Operator",
			"Specified company is not owned by you",
			common.WithDetail("operator", uc.input.Operator),
		)
	}

	return nil
}

func (uc *baseCreateInstance) Execute() (any, common.Error) {
	err := uc.tx.Bases().CreateBase(components.CreateBasePayload{
		WorldID:  uc.input.WorldID,
		TileID:   uc.input.TileID,
		CityID:   uc.cityID,
		Operator: uc.input.Operator,
		OwnerID:  uc.Author,
		Name:     uc.input.Name,
	})
	if err != nil {
		return nil, err
	}

	events.BaseCreated.Publish(events.BaseCreatedPayload{
		WorldID:  uc.input.WorldID,
		TileID:   uc.input.TileID,
		Operator: uc.input.Operator,
	})

	return nil, nil
}
