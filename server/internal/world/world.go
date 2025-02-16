package world

import (
	"srv/internal/utils/color"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
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
	Population  WorldPopulationOverview

	Tiles               []WorldDataTile
	TileResources       map[int]ResourceDeposit
	TileElevationsScale phys.Distance
}

type WorldDataTile struct {
	Color     color.RichColorRGB
	AvgTemp   phys.Temperature
	Surface   BiomeSurface
	Pressure  phys.Pressure
	Elevation float64
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
	TileResources       map[int]ResourceDeposit
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
