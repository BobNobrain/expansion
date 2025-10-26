package components

import (
	"srv/internal/game"
	"srv/internal/utils/common"
)

type BasesRepoReadonly interface {
	GetCompanyBases(game.CompanyID) ([]game.Base, common.Error)
	GetCompanyBasesOnPlanet(game.CompanyID, game.CelestialID) ([]game.Base, common.Error)

	GetBase(game.BaseID) (game.Base, common.Error)
	GetBaseAt(game.CelestialID, game.TileID) (game.Base, common.Error)
	ResolveBases([]game.BaseID) ([]game.Base, common.Error)
}

type CreateBasePayload struct {
	Operator game.CompanyID
	WorldID  game.CelestialID
	TileID   game.TileID
	CityID   game.CityID
}

type BasesRepo interface {
	BasesRepoReadonly

	CreateBase(CreateBasePayload) common.Error
	DeleteBase(game.BaseID) common.Error
}
