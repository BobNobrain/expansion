package components

import (
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/utils/common"
)

type CitiesRepoReadonly interface {
	ResolveIDs([]game.CityID) ([]game.City, common.Error)
	GetByWorldID(game.CelestialID) ([]game.City, common.Error)
}

type CreateCityPayload struct {
	WorldID      game.CelestialID
	TileID       game.TileID
	CityName     string
	Founder      domain.UserID
	Population   game.CityPopulationData
	ClaimedTiles []game.TileID
	// TODO: initial construction sites will also go here
}

type CitiesRepo interface {
	CitiesRepoReadonly

	Create(CreateCityPayload) common.Error
}
