package world

import (
	"srv/internal/utils/phys"
)

type StarParams struct {
	Temperature phys.Temperature
	Luminosity  phys.Luminosity
	Mass        phys.Mass
	Radius      phys.Distance
	Age         phys.Age
}

type Star struct {
	ID     CelestialID
	Params StarParams
}

type StarSystemOverview struct {
	ID     StarSystemID
	Coords GalacticCoords

	IsExplored bool
	Stars      []Star
	NPlanets   int
	NMoons     int
	NAsteroids int
	PopInfo    PopulationOverview
}

type StarSystemContent struct {
	ID StarSystemID

	Explored ExplorationData

	Orbits map[CelestialID]OrbitData
	Stars  []Star
}
