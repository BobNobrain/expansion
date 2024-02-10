package world

import "srv/internal/utils/phys"

type PlanetID string

type Planet struct {
	ID   PlanetID
	Name string

	Radius   phys.Distance
	SeaLevel phys.Distance

	Grid     PlanetaryGrid
	Tiles    PlanetaryGridData
	Features PlanetaryFeatures
}

func NewPlanet(id PlanetID) *Planet {
	return &Planet{
		ID:   id,
		Name: string(id),
	}
}
