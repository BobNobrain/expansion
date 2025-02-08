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

type SurfaceCellID int
type SurfaceConnectionID int

type SurfaceOverview interface {
	GetID() CelestialID
	IsExplored() bool
	GetSize() int
	GetConditions() SurfaceConditions
	GetParams() CelestialSurfaceParams
}

type SurfaceData interface {
	GetID() CelestialID
	GetGrid() geom.SpatialGraph
	GetConditions() SurfaceConditions
	GetComposition() SurfaceComposition
	GetParams() CelestialSurfaceParams
	GetTileConditions() []SurfaceTileConditions
}

type WorldOverview struct {
	ID         CelestialID
	IsExplored bool
	Size       int
	Conditions SurfaceConditions
	Params     CelestialSurfaceParams
}

type WorldData struct {
	ID          CelestialID
	Explored    *ExplorationData
	Grid        geom.SpatialGraph
	Conditions  SurfaceConditions
	Params      CelestialSurfaceParams
	Composition SurfaceComposition

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
	Conditions SurfaceConditions
	Params     CelestialSurfaceParams
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

type SurfaceConditions struct {
	Pressure phys.Pressure
	AvgTemp  phys.Temperature
	Gravity  phys.Acceleration
}

type SurfaceComposition struct {
	OceanLevel float64
	Atmosphere *material.MaterialCompound
	Oceans     *material.MaterialCompound
	Snow       *material.MaterialCompound
}

type SurfaceTileConditions struct {
	BiomeColor color.RichColorRGB
	Elevation  phys.Distance
	AvgTemp    phys.Temperature
	Pressure   phys.Pressure
	Surface    BiomeSurface
}

type CelestialSurfaceParams struct {
	Radius phys.Distance
	Mass   phys.Mass
	Age    phys.Age
	Class  CelestialBodyClass

	AxisTilt  geom.Angle
	DayLength phys.PhysicalTime
}
