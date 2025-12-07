package game

import (
	"srv/internal/utils/phys"
	"strconv"
	"strings"
)

type TileID int

func (id TileID) String() string {
	return strings.ToUpper(strconv.FormatInt(int64(id), 16))
}
func (id TileID) IsValid() bool {
	return id >= 0
}

func ParseTileIDString(str string) TileID {
	i, err := strconv.ParseInt(str, 16, 64)
	if err != nil {
		return -1
	}

	return TileID(i)
}

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
