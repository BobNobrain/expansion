package world

import (
	"srv/internal/domain"
)

type GalacticGrid interface {
	GetSectorCoordsById(domain.GalacticSectorID) *domain.GalacticSector
	GetContainingSectorCoords(domain.GalacticCoords) *domain.GalacticSector
	Size() int
	GetSectors() []*domain.GalacticSector
}

func BuildGalacticGridFromSectorsData(sectors map[domain.GalacticSectorID]*domain.GalacticSector) GalacticGrid {
	return &galacticSectorGridImpl{sectors: sectors}
}
func BuildGalacticGridFromSectorsList(sectors []*domain.GalacticSector) GalacticGrid {
	byId := make(map[domain.GalacticSectorID]*domain.GalacticSector)

	for _, sector := range sectors {
		byId[sector.ID] = sector
	}

	return BuildGalacticGridFromSectorsData(byId)
}

type galacticSectorGridImpl struct {
	sectors map[domain.GalacticSectorID]*domain.GalacticSector
}

func (grid *galacticSectorGridImpl) GetSectorCoordsById(id domain.GalacticSectorID) *domain.GalacticSector {
	return grid.sectors[id]
}
func (grid *galacticSectorGridImpl) GetContainingSectorCoords(coords domain.GalacticCoords) *domain.GalacticSector {
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

func (grid *galacticSectorGridImpl) GetSectors() []*domain.GalacticSector {
	vals := make([]*domain.GalacticSector, 0, len(grid.sectors))
	for _, sector := range grid.sectors {
		vals = append(vals, sector)
	}
	return vals
}
