package events

import "srv/internal/game"

type SystemUpdatedPayload struct {
	SystemID game.StarSystemID
}

type WorldUpdatedPayload struct {
	WorldID game.CelestialID
}

type CityCreatedPayload struct {
	WorldID game.CelestialID
	CityID  game.CityID
}

var (
	SystemUpdated = newEventBus[SystemUpdatedPayload]()
	WorldUpdated  = newEventBus[WorldUpdatedPayload]()
	CityCreated   = newEventBus[CityCreatedPayload]()
)

func initGalaxy() {
	SystemUpdated.start()
	WorldUpdated.start()
	CityCreated.start()
}
