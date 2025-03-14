package galaxymap

import (
	"srv/internal/components"
	"srv/internal/domain"
	"srv/internal/events"
	"srv/internal/globals/eb"
	"srv/internal/globals/globaldata"
	"srv/internal/globals/logger"
	"srv/internal/utils/common"
	"srv/internal/utils/phys/material"
	"srv/internal/world"
	"srv/internal/world/planetgen"
	"srv/internal/world/worldgen"
)

func (g *galaxyMap) ExploreSystem(systemID world.StarSystemID, explorer domain.UserID) common.Error {
	prevSystemData, err := g.starSystems.GetContent(systemID)
	if err != nil {
		return err
	}

	gendata := g.generator.Explore(worldgen.ExploreOptions{
		SystemID: systemID,
		Stars:    prevSystemData.Stars,
		Orbits:   prevSystemData.Orbits,
	})

	err = g.starSystems.ExploreSystem(components.ExploreSystemPayload{
		ID:         systemID,
		Explorer:   explorer,
		Orbits:     gendata.Orbits,
		NPlanets:   gendata.NPlanets,
		NMoons:     gendata.NMoons,
		NAsteroids: gendata.NAsteroids,
	})
	if err != nil {
		return err
	}

	generatedWorlds := make([]components.CreateWorldPayload, 0, len(gendata.Bodies))
	for _, world := range gendata.Bodies {
		generatedWorlds = append(generatedWorlds, components.CreateWorldPayload{
			ID:     world.ID,
			Params: world.Params,
			Size:   world.Size,
		})
	}
	g.worlds.CreateWorlds(generatedWorlds)

	eb.PublishNew(events.SourceGalaxy, events.EventGalaxySystemUpdate, events.GalaxySystemUpdate{SystemID: systemID})

	return nil
}

func (g *galaxyMap) ExploreWorld(worldID world.CelestialID, explorer domain.UserID) common.Error {
	system, err := g.starSystems.GetContent(worldID.GetStarSystemID())
	if err != nil {
		return err
	}

	prevWorldData, err := g.worlds.GetData(worldID)
	if err != nil {
		return err
	}

	orbits := system.Orbits
	surfaceOrbit, foundOrbit := orbits[worldID]

	if !foundOrbit {
		logger.Error(logger.FromMessage("galaxymap", "ExploreWorld: orbit not found").WithDetail("worldID", worldID))
		return nil
	}

	combinedStar := worldgen.CombinedStarForEstimates(system.Stars)
	parentMass := combinedStar.Mass
	if worldID.IsMoonID() {
		// TODO: use parent surface instead
	}

	rnd := g.generator.GetRandom().ForCelestial(worldID)
	allWgMats := globaldata.Materials().GetAll().FilterByHasAnyTag("volatile")
	protoplanetaryDisk := material.NewMaterialCompound()
	for _, mat := range allWgMats {
		protoplanetaryDisk.Add(mat, mat.GetAbundance(rnd.Float64())*mat.GetMolarMass())
	}

	generatedData := planetgen.GeneratePlanet(planetgen.GeneratePlanetOptions{
		WR:         *g.generator.GetRandom(),
		ID:         worldID,
		Params:     prevWorldData.Params,
		StarParams: combinedStar,
		// TODO: this is actually an average distance to a parent body
		StarDistance:          surfaceOrbit.Ellipse.AverageDistance(),
		ParentSurfaceMass:     parentMass,
		ParentSurfaceDistance: surfaceOrbit.Ellipse.AverageDistance(),
		AvailableMaterials:    protoplanetaryDisk,
	})

	explorePayload := components.ExploreWorldPayload{
		ID:         worldID,
		ExploredBy: explorer,

		Data: generatedData,
	}

	err = g.worlds.ExploreWorld(explorePayload)
	if err != nil {
		return err
	}

	eb.PublishNew(events.SourceGalaxy, events.EventGalaxyWorldUpdate, events.GalaxyWorldUpdate{WorldID: worldID})

	return nil
}
