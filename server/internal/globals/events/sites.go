package events

import (
	"srv/internal/domain"
	"srv/internal/game"
)

type BaseCreatedPayload struct {
	WorldID  game.CelestialID
	TileID   game.TileID
	Operator game.CompanyID
}

type BaseUpdatedPayload struct {
	BaseID game.BaseID
	Base   *game.Base
}
type BaseRemovedPayload struct {
	BaseID game.BaseID
}

type FactoryCreatedPayload struct {
	BaseID game.BaseID
	Owner  domain.UserID
}
type FactoryUpdatedPayload struct {
	FactoryID game.FactoryID
}
type FactoryRemovedPayload struct {
	FactoryID game.FactoryID
}

var (
	BaseCreated    = newEventBus[BaseCreatedPayload]()
	BaseUpdated    = newEventBus[BaseUpdatedPayload]()
	BaseRemoved    = newEventBus[BaseRemovedPayload]()
	FactoryCreated = newEventBus[FactoryCreatedPayload]()
	FactoryUpdated = newEventBus[FactoryUpdatedPayload]()
	FactoryRemoved = newEventBus[FactoryRemovedPayload]()
)

func initSites() {
	BaseCreated.start()
	BaseUpdated.start()
	BaseRemoved.start()
	FactoryCreated.start()
	FactoryUpdated.start()
	FactoryRemoved.start()
}
