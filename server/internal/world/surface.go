package world

import (
	"srv/internal/utils/common"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
)

type SurfaceCellID int
type SurfaceConnectionID int

type Surface interface {
	GetSize() int
	GetNConnections() int

	GetCell(SurfaceCellID) SurfaceCell
	GetConnection(SurfaceConnectionID) SurfaceConnection

	AreConnected(SurfaceCellID, SurfaceCellID) bool

	// TODO
	Marshall() ([]byte, common.Error)
	Unmarshall([]byte) common.Error
}

type SurfaceCell interface {
	GetID() SurfaceCellID
	GetLocalCoords() geom.Vec3
	// GetBiome() Biome
}

type SurfaceConnection interface {
	GetID() SurfaceConnectionID
	GetCells() (SurfaceCellID, SurfaceCellID)
}

type SurfaceConditions struct {
	Pressure phys.Pressure
	AvgTemp  phys.Temperature
}
