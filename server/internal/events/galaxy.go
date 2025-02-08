package events

import "srv/internal/world"

const SourceGalaxy = "galaxy"

const (
	EventGalaxySystemUpdate = "systemUpdate"
	EventGalaxyWorldUpdate  = "worldUpdate"
)

type GalaxySystemUpdate struct {
	SystemID world.StarSystemID
}

type GalaxyWorldUpdate struct {
	WorldID world.CelestialID
}
