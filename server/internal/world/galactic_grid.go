package world

type GalacticGrid interface {
	GetSectorCoordsById(GalacticSectorID) *GalacticSector
	GetContainingSectorCoords(GalacticCoords) *GalacticSector
	Size() int
	GetSectors() []*GalacticSector
}

func BuildGalacticGridFromSectorsData(sectors map[GalacticSectorID]*GalacticSector) GalacticGrid {
	return &galacticSectorGridImpl{sectors: sectors}
}
func BuildGalacticGridFromSectorsList(sectors []*GalacticSector) GalacticGrid {
	byId := make(map[GalacticSectorID]*GalacticSector)

	for _, sector := range sectors {
		byId[sector.ID] = sector
	}

	return BuildGalacticGridFromSectorsData(byId)
}

type galacticSectorGridImpl struct {
	sectors map[GalacticSectorID]*GalacticSector
}

func (grid *galacticSectorGridImpl) GetSectorCoordsById(id GalacticSectorID) *GalacticSector {
	return grid.sectors[id]
}
func (grid *galacticSectorGridImpl) GetContainingSectorCoords(coords GalacticCoords) *GalacticSector {
	for _, sector := range grid.sectors {
		if sector.Coords.IsInside(coords) {
			return sector
		}
	}
	return nil
}
func (grid *galacticSectorGridImpl) Size() int {
	return len(grid.sectors)
}

func (grid *galacticSectorGridImpl) GetSectors() []*GalacticSector {
	vals := make([]*GalacticSector, 0, len(grid.sectors))
	for _, sector := range grid.sectors {
		vals = append(vals, sector)
	}
	return vals
}
