package galaxy

import (
	"srv/internal/utils/pagination"
	"srv/internal/world"
	"srv/internal/world/wsm"
)

func (g *gameGalaxy) loadSectorContents() {
	g.sectors = make(map[world.GalacticSectorID][]*wsm.SystemSharedState)

	for sid, systemState := range g.systemsById {
		sectorID := sid.GetSectorID()
		g.sectors[sectorID] = append(g.sectors[sectorID], systemState)
	}
}

func (g *gameGalaxy) querySectorContent(rq world.GalaxySectorContentRequest) pagination.Page[world.StarSystem] {
	systemsInSector := g.sectors[rq.SectorID]
	if len(systemsInSector) == 0 {
		return pagination.EmptyPage[world.StarSystem]()
	}

	result := make([]world.StarSystem, 0)

	// TODO: filter with rq.Search

	page := rq.Page.Normalized(50, len(systemsInSector))
	for i := 0; i < page.Limit; i++ {
		index := i + page.Offset
		if index >= len(systemsInSector) {
			break
		}

		result = append(result, systemsInSector[index])
	}

	return pagination.Page[world.StarSystem]{
		Items: result,
		Page: pagination.PageInfo{
			Offset: page.Offset,
			Total:  len(systemsInSector),
		},
	}
}
