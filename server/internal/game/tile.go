package game

import (
	"srv/internal/utils/phys"
)

type TileID int

type TileOccupation byte

const (
	TileOccupationFree TileOccupation = iota
	TileOccupationBase
	TileOccupationCity
	TileOccupationInfra
)

func (t TileOccupation) String() string {
	switch t {
	case TileOccupationFree:
		return "free"
	case TileOccupationBase:
		return "base"
	case TileOccupationCity:
		return "city"
	case TileOccupationInfra:
		return "infra"
	default:
		return "unknown"
	}
}

func (t TileOccupation) IsOccupied() bool {
	return t != TileOccupationFree
}

type TileData struct {
	ID        TileID
	Elevation phys.Distance
	AvgTemp   phys.Temperature
	Pressure  phys.Pressure
	Surface   BiomeSurface

	Resources     []ResourceDeposit
	Composition   WorldComposition
	SoilFertility float64

	TransportLevel byte
	EnergyLevel    byte
}
