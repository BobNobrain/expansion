package world

import (
	"srv/internal/utils/phys"
)

type PlanetaryGridData interface {
	GetConditions(node PlanetaryNodeIndex) *PlanetaryTile
}

type PlanetaryTile struct {
	BiomeColor string
	Solid      *PlanetaryTileConditions
	// Marine      *PlanetaryTileConditions
	// Atmospheric *PlanetaryTileConditions
}

// func (node *PlanetaryTile) HasLand() bool {
// 	return node.Solid != nil && node.Marine == nil
// }
// func (node *PlanetaryTile) HasSea() bool {
// 	return node.Marine != nil
// }
// func (node *PlanetaryTile) HasAtmospheric() bool {
// 	return node.Atmospheric != nil
// }

type PlanetaryTileConditions struct {
	Elevation   phys.Distance
	Temperature phys.Temperature
	Pressure    phys.Pressure
}
