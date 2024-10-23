package galaxymap

import (
	"srv/internal/components"
	"srv/internal/utils/common"
	"srv/internal/utils/pagination"
	"srv/internal/world"
)

func (g *galaxyMap) queryBeacons(maxCount int) []world.GalaxyBeacon {
	if maxCount >= len(g.beacons) {
		return g.beacons
	}
	return g.beacons[0:maxCount]
}

func (g *galaxyMap) GetOverview(limit int) ([]*world.GalacticSector, []world.GalaxyBeacon) {
	sectors := g.grid.GetSectors()
	beacons := g.queryBeacons(limit)
	return sectors, beacons
}

func (g *galaxyMap) QuerySectorContent(rq world.GalaxySectorContentRequest) pagination.Page[world.StarSystem] {
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

func (g *galaxyMap) GetSystemContent(systemID world.StarSystemID, cmd *components.DispatcherCommand) (world.StarSystem, []world.SurfaceOverview, common.Error) {
	sys := g.systemsByID[systemID]
	if sys == nil {
		return nil, nil, common.NewError("ERR_NOT_FOUND", "star system not found")
	}

	// TODO: for testing purposes, to be removed in future
	if !sys.IsExplored() {
		g.ExploreSystem(systemID, cmd.OnBehalf.ID)
	}

	surfaces := make([]world.SurfaceOverview, 0)
	for id, state := range g.surfacesByID {
		// TODO: get rid of full loop
		if id.GetStarSystemID() != systemID {
			continue
		}

		surfaces = append(surfaces, state)
	}

	return sys, surfaces, nil
}

func (g *galaxyMap) GetSurfaceData(surfaceID world.CelestialID, cmd *components.DispatcherCommand) (world.SurfaceData, common.Error) {
	surface, found := g.surfacesByID[surfaceID]

	if !found {
		return nil, common.NewError("ERR_NOT_FOUND", "surface not found: "+string(surfaceID))
	}

	if !surface.IsExplored() {
		g.ExploreSurface(surfaceID, cmd.OnBehalf.ID)
	}

	return surface, nil
}
