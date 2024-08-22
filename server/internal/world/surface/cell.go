package surface

import (
	"srv/internal/utils/geom"
	"srv/internal/world"
)

type surfaceCellImpl struct {
	Id world.SurfaceCellID
	// Biome  world.Biome
	Coords geom.Vec3
}

func (cell *surfaceCellImpl) GetID() world.SurfaceCellID {
	return cell.Id
}

//	func (cell *surfaceCellImpl) GetBiome() world.Biome {
//		return cell.Biome
//	}
func (cell *surfaceCellImpl) GetLocalCoords() geom.Vec3 {
	return cell.Coords
}

func (cell *surfaceCellImpl) CopyFrom(source world.SurfaceCell) {
	cell.Id = source.GetID()
	cell.Coords = source.GetLocalCoords()
	// cell.Biome = source.GetBiome()
}

func NewSurfaceCell() world.SurfaceCell {
	return &surfaceCellImpl{}
}
