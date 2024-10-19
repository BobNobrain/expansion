package galaxymap

import (
	"srv/internal/domain"
	"srv/internal/globals/globaldata"
	"srv/internal/globals/logger"
	"srv/internal/utils/phys/material"
	"srv/internal/world"
	"srv/internal/world/planetgen"
	"srv/internal/world/worldgen"
	"srv/internal/world/wsm"
)

func (g *galaxyMap) ExploreSystem(systemID world.StarSystemID, explorer domain.UserID) {
	g.lock.Lock()
	defer g.lock.Unlock()

	system := g.systemsByID[systemID]
	if system == nil {
		return
	}

	gendata := g.generator.Explore(worldgen.ExploreOptions{
		SystemID: systemID,
		Stars:    system.GetStars(),
		Orbits:   system.GetOrbits(),
	})

	system.FillFromExplorationData(explorer, gendata)

	for _, body := range gendata.Bodies {
		surfaceState := wsm.NewSurfaceSharedState()
		surfaceState.FromGeneratedData(body)
		g.surfacesByID[body.ID] = surfaceState
	}
}

func (g *galaxyMap) ExploreSurface(surfaceID world.CelestialID, explorer domain.UserID) {
	g.lock.Lock()
	defer g.lock.Unlock()

	system, foundSystem := g.systemsByID[surfaceID.GetStarSystemID()]
	surfaceState, foundSurface := g.surfacesByID[surfaceID]

	if !foundSystem {
		logger.Error(logger.FromMessage("galaxymap", "ExploreSurface: system not found").WithDetail("surfaceID", surfaceID))
		return
	}
	if !foundSurface {
		logger.Error(logger.FromMessage("galaxymap", "ExploreSurface: surface not found").WithDetail("surfaceID", surfaceID))
		return
	}

	orbits := system.GetOrbits()
	surfaceOrbit, foundOrbit := orbits[surfaceID]

	if !foundOrbit {
		logger.Error(logger.FromMessage("galaxymap", "ExploreSurface: orbit not found").WithDetail("surfaceID", surfaceID))
		return
	}

	combinedStar := worldgen.CombinedStarForEstimates(system.GetStars())
	parentMass := combinedStar.Mass
	if surfaceID.IsMoonID() {
		// TODO: use parent surface instead
	}

	rnd := g.generator.GetRandom().ForCelestial(surfaceID)
	allWgMats := globaldata.Materials().GetAll().FilterByHasAnyTag("wg")
	protoplanetaryDisk := material.NewMaterialCompound()
	for _, mat := range allWgMats {
		protoplanetaryDisk.Add(mat, mat.GetAbundance(rnd.Float64())*mat.GetMolarMass())
	}

	generatedData := planetgen.GeneratePlanet(planetgen.GeneratePlanetOptions{
		WR:         *g.generator.GetRandom(),
		ID:         surfaceID,
		Params:     surfaceState.GetParams(),
		StarParams: combinedStar,
		// TODO: this is actually an average distance to a parent body
		StarDistance:          surfaceOrbit.Ellipse.AverageDistance(),
		ParentSurfaceMass:     parentMass,
		ParentSurfaceDistance: surfaceOrbit.Ellipse.AverageDistance(),
		AvailableMaterials:    protoplanetaryDisk,
	})

	surfaceState.FromExplorationData(generatedData)
}
