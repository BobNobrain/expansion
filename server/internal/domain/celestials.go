package domain

import (
	"srv/internal/utils/common"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
)

type StarData struct {
	Coords GalacticCoords

	Temperature phys.Temperature
	Luminosity  phys.Luminosity
	Mass        phys.Mass
	Radius      phys.Distance
	Age         phys.Age
}

type CelestialBody struct {
	ID         CelestialID
	Orbit      OrbitData
	Satellites []*CelestialBody
}

type OrbitData struct {
	Center *CelestialBody
	// Elliptic orbit semiaxes
	Ellipse phys.EllipticOrbit
	// Specifies rotation of the ellipse to star system's X axis
	Rotation geom.Angle
	// Celestial body's angular position on the orbit at t=0
	Theta0 geom.Angle
}

type StarSystem struct {
	StarID   CelestialID
	StarData *StarData
	Planets  []*CelestialBody
}

type Star struct {
	StarID   CelestialID
	StarData StarData
}

type GetSectorContentParams struct {
	SectorID GalacticSectorID
	Limit    int
}

type CelestialBodiesRepo interface {
	Create(*StarSystem) common.Error
	LoadAll() ([]*StarSystem, common.Error)
	GetSectorContent(params GetSectorContentParams) ([]Star, common.Error)
}
