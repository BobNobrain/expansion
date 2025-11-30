package game

import (
	"srv/internal/utils/color"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
	"srv/internal/utils/predictable"
)

type CelestialBodyClass byte

const (
	CelestialBodyClassTerrestial CelestialBodyClass = iota
	CelestialBodyClassGaseous
)

func (c CelestialBodyClass) IsTerrestial() bool {
	return c == CelestialBodyClassTerrestial
}
func (c CelestialBodyClass) IsGaseous() bool {
	return c == CelestialBodyClassGaseous
}

func (c CelestialBodyClass) String() string {
	switch c {
	case CelestialBodyClassTerrestial:
		return "terrestial"

	case CelestialBodyClassGaseous:
		return "gaseous"

	default:
		return "unknown"
	}
}

type WorldOverview struct {
	ID         CelestialID
	IsExplored bool
	Size       int
	Conditions WorldConditions
	Params     WorldParams
	Population WorldPopulationOverview
}

type WorldData struct {
	ID          CelestialID
	Explored    *ExplorationData
	Grid        geom.SpatialGraph
	Conditions  WorldConditions
	Params      WorldParams
	Composition WorldComposition
	NPops       predictable.Predictable

	Tiles               []WorldDataTile
	FertileTiles        []FertileWorldDataTile
	TileResources       map[TileID][]ResourceDeposit
	TileElevationsScale phys.Distance

	TileCityCenters map[TileID]CityID
	TileBases       map[TileID]BaseID
}

type WorldDataTile struct {
	Color     color.RichColorRGB
	AvgTemp   phys.Temperature
	Pressure  phys.Pressure
	Surface   BiomeSurface
	Elevation float64
}

type FertileWorldDataTile struct {
	MoistureLevel float64
	SoilFertility float64
}

type WorldExplorationData struct {
	Grid       geom.SpatialGraph
	Conditions WorldConditions
	Params     WorldParams
	OceanLevel float64
	Atmosphere *material.MaterialCompound
	Oceans     *material.MaterialCompound
	Snow       *material.MaterialCompound

	Tiles               []WorldExplorationDataTile
	FertileTiles        []FertileWorldDataTile
	TileResources       map[int][]ResourceDeposit
	TileElevationsScale phys.Distance
}

type WorldExplorationDataTile struct {
	Color     color.RichColorRGB
	AvgTemp   phys.Temperature
	Pressure  phys.Pressure
	Surface   BiomeSurface
	Elevation float64
}

type WorldConditions struct {
	Pressure phys.Pressure
	AvgTemp  phys.Temperature
	Gravity  phys.Acceleration
}

type WorldComposition struct {
	OceanLevel float64
	Atmosphere *material.MaterialCompound
	Oceans     *material.MaterialCompound
	Snow       *material.MaterialCompound
}

type WorldParams struct {
	Radius phys.Distance
	Mass   phys.Mass
	Age    phys.Age
	Class  CelestialBodyClass

	AxisTilt  geom.Angle
	DayLength phys.PhysicalTime
}

type WorldPopulationOverview struct {
	NPops   int
	NCities int
	NBases  int
}

func (w WorldData) GetTileData(tid TileID) TileData {
	tile := w.Tiles[tid]
	fertility := -1.0

	if len(w.FertileTiles) > 0 {
		fertility = w.FertileTiles[tid].SoilFertility
	}

	return TileData{
		ID:        tid,
		Elevation: w.TileElevationsScale.Mul(tile.Elevation),
		AvgTemp:   tile.AvgTemp,
		Pressure:  tile.Pressure,
		Surface:   tile.Surface,

		Resources:     w.TileResources[tid],
		Composition:   w.Composition,
		SoilFertility: fertility,

		TransportLevel: 0,
		EnergyLevel:    0,
	}
}
