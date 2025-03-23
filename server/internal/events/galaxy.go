package events

import "srv/internal/game"

const SourceGalaxy = "galaxy"

const (
	EventGalaxySystemUpdate = "systemUpdate"
	EventGalaxyWorldUpdate  = "worldUpdate"
	EventGalaxyCityCreation = "cityCreation"
)

type GalaxySystemUpdate struct {
	SystemID game.StarSystemID
}

type GalaxyWorldUpdate struct {
	WorldID game.CelestialID
}

type GalaxyCityCreation struct {
	WorldID game.CelestialID
	CityID  game.CityID
}
