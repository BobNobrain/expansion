package wsm

import (
	"srv/internal/domain"
	"srv/internal/world"
	"srv/internal/world/worldgen"
	"sync"
)

// TODO: this is not needed, at least for now
// functionality is moved into gamerunner.worldRunner

type GalaxySharedState struct {
	lock *sync.RWMutex

	Grid world.GalacticGrid
	// TODO: other things needed to be simulated, e.g.:
	// Markets components.MarketsManager
	// Fleets components.FleetManager
	// etc.

	systemsById     map[world.StarSystemID]*SystemSharedState
	systemsBySector map[world.GalacticSectorID][]*SystemSharedState

	// landmarksCache []*GalaxyStar
	generator *worldgen.WorldGen
}

func NewGalaxySharedState(
	grid world.GalacticGrid,
	systemsData []*domain.OpaqueBlob,
	generator *worldgen.WorldGen,
) *GalaxySharedState {
	galaxy := &GalaxySharedState{
		lock: &sync.RWMutex{},

		Grid:        grid,
		systemsById: make(map[world.StarSystemID]*SystemSharedState),

		generator: generator,
	}

	for _, systemData := range systemsData {
		systemState := NewSystemSharedState(generator, world.StarSystemID(systemData.ID))
		galaxy.systemsById[systemState.GetSystemID()] = systemState
	}

	galaxy.buildCaches()

	return galaxy
}

func (g *GalaxySharedState) buildCaches() {
	g.systemsBySector = make(map[world.GalacticSectorID][]*SystemSharedState)
	for _, sector := range g.Grid.GetSectors() {
		g.systemsBySector[sector.ID] = make([]*SystemSharedState, 0)
	}
	for _, system := range g.systemsById {
		sectorId := system.GetSystemID().GetSectorID()
		g.systemsBySector[sectorId] = append(g.systemsBySector[sectorId], system)
	}

	// topByBrightness := utils.MakeTop[*GalaxyStar](200)
	// for _, systemState := range g.systemsById {
	// 	for _, star := range systemState.GetStars() {
	// 		gstar := &GalaxyStar{
	// 			StarID:   star.StarID,
	// 			StarData: star.StarData,
	// 			Coords:   systemState.GetCoords(),
	// 		}
	// 		topByBrightness.Insert(gstar, star.StarData.Luminosity.Suns())
	// 	}
	// }
	// g.landmarksCache = topByBrightness.Get()
}

// func (g *GalaxySharedState) GetGalaxyLandmarks(limit int) []*GalaxyStar {
// 	g.lock.RLock()
// 	defer g.lock.RUnlock()

// 	if limit < 0 || limit > len(g.landmarksCache) {
// 		return g.landmarksCache
// 	}
// 	return g.landmarksCache[0:limit]
// }

// func (g *GalaxySharedState) GetSectorContent(
// 	rq components.CelestialRepoSectorContentRequest,
// ) pagination.Page[StarSystemOverview] {
// 	g.lock.RLock()
// 	defer g.lock.RUnlock()

// 	sectorContent, found := g.systemsBySector[rq.SectorID]
// 	if !found {
// 		return pagination.EmptyPage[StarSystemOverview]()
// 	}

// 	pageParams := rq.Page.Normalized(100, 200)
// 	items := make([]StarSystemOverview, 0, pageParams.Limit)
// 	total := len(sectorContent)

// 	if rq.Search == "" {
// 		// we can skip the whole search phase
// 		for i := pageParams.Offset; i < pageParams.Limit+pageParams.Offset; i++ {
// 			if i >= len(sectorContent) {
// 				break
// 			}

// 			next := sectorContent[i]
// 			items = append(items, next.GetOverview())
// 		}

// 		return pagination.Page[StarSystemOverview]{
// 			Items: items,
// 			Page:  pagination.PageInfo{Offset: pageParams.Offset, Total: total},
// 		}
// 	}

// 	nFound := 0
// 	cursor := 0
// 	if pageParams.Offset > 0 {
// 		// skipping over all systems in offset
// 		for i, systemState := range sectorContent {
// 			if !isRelevantForSearch(systemState, rq.Search) {
// 				continue
// 			}

// 			nFound++
// 			if nFound >= pageParams.Offset {
// 				cursor = i
// 			}
// 		}
// 	}

// 	for i := cursor; i < total; i++ {
// 		if len(items) >= pageParams.Limit {
// 			cursor = i
// 			// we're done, found all items we needed
// 			break
// 		}

// 		systemState := sectorContent[i]
// 		if !isRelevantForSearch(systemState, rq.Search) {
// 			continue
// 		}

// 		nFound++
// 		items = append(items, systemState.GetOverview())
// 	}

// 	// but we need to continue in order to calculate the PageInfo.Total
// 	for i := cursor; i < total; i++ {
// 		system := sectorContent[i]
// 		if !isRelevantForSearch(system, rq.Search) {
// 			continue
// 		}

// 		nFound++
// 	}

// 	return pagination.Page[StarSystemOverview]{
// 		Items: items,
// 		Page: pagination.PageInfo{
// 			Offset: pageParams.Offset,
// 			Total:  nFound,
// 		},
// 	}
// }

// func (g *GalaxySharedState) GetSystemData(sid domain.StarSystemID) *domain.StarSystem {
// 	g.lock.RLock()
// 	defer g.lock.RUnlock()

// 	return g.systemsById[sid]
// }

// func (g *GalaxySharedState) UpdateSystemData(system domain.StarSystem) {
// 	g.lock.Lock()
// 	defer g.lock.Unlock()

// 	oldSystem, found := g.systemsById[system.SystemID]
// 	if !found {
// 		// this method is not intended for inserting new systems
// 		// this also should never happen
// 		return
// 	}

// 	oldSystem.UpdateData(system)
// }

// func isRelevantForSearch(system *SystemSharedState, search string) bool {
// 	if search == "" {
// 		return true
// 	}

// 	// TODO: names
// 	return strings.Contains(string(system.GetSystemID()), search)
// }
