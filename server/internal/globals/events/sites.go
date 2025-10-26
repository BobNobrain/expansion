package events

import "srv/internal/game"

type BaseCreatedPayload struct {
	WorldID  game.CelestialID
	TileID   game.TileID
	Operator game.CompanyID
}

type BaseRemovedPayload struct {
	BaseID game.BaseID
}

type FactoryCreatedPayload struct {
	BaseID game.BaseID
}
type FactoryUpdatedPayload struct {
	FactoryID game.FactoryID
}
type FactoryRemovedPayload struct {
	FactoryID game.FactoryID
}

var (
	BaseCreated    = newEventBus[BaseCreatedPayload]()
	BaseRemoved    = newEventBus[BaseRemovedPayload]()
	FactoryCreated = newEventBus[FactoryCreatedPayload]()
	FactoryUpdated = newEventBus[FactoryUpdatedPayload]()
	FactoryRemoved = newEventBus[FactoryRemovedPayload]()
)

func initSites() {
	BaseCreated.start()
	BaseRemoved.start()
	FactoryCreated.start()
	FactoryUpdated.start()
	FactoryRemoved.start()
}
