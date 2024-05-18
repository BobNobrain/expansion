package surface

import "srv/internal/world"

type surfaceConnectionImpl struct {
	Id    world.SurfaceConnectionID
	Cell1 world.SurfaceCellID
	Cell2 world.SurfaceCellID
}

func (cn *surfaceConnectionImpl) GetID() world.SurfaceConnectionID {
	return cn.Id
}
func (cn *surfaceConnectionImpl) GetCells() (world.SurfaceCellID, world.SurfaceCellID) {
	return cn.Cell1, cn.Cell2
}

func NewSurfaceConnection() world.SurfaceConnection {
	return &surfaceConnectionImpl{}
}
