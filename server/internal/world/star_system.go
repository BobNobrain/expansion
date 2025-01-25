package world

import (
	"srv/internal/domain"
	"srv/internal/utils/phys"
	"time"
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
	Worlds []WorldOverview
}

type StarSystem interface {
	GetSystemID() StarSystemID
	GetCoords() GalacticCoords

	IsExplored() bool
	GetExploredBy() domain.UserID
	GetExploredAt() time.Time

	GetOrbits() map[CelestialID]OrbitData

	GetStars() []*Star

	GetNStars() int
	GetNPlanets() int
	GenNAsteroids() int
}
