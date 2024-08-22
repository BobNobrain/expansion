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

type StarSystem interface {
	GetSystemID() StarSystemID
	GetCoords() GalacticCoords

	IsExplored() bool
	GetExploredBy() domain.UserID
	GetExploredAt() time.Time

	GetOrbits() map[CelestialID]OrbitData

	GetStars() []*Star
	GetSurfaces() []CelestialSurface

	GetNStars() int
	GetNPlanets() int
	GenNAsteroids() int
}

type CelestialSurfaceParams struct {
	Mass   phys.Mass
	Radius phys.Distance
	Age    phys.Age
}

type CelestialSurface interface {
	GetID() CelestialID
	GetParams() CelestialSurfaceParams

	GetSurface() Surface
}
