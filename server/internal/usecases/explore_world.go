package usecases

import (
	"context"
	"srv/internal/components"
	"srv/internal/events"
	"srv/internal/game"
	"srv/internal/game/planetgen"
	"srv/internal/game/worldgen"
	"srv/internal/globals/eb"
	"srv/internal/globals/globaldata"
	"srv/internal/globals/logger"
	"srv/internal/utils/common"
	"srv/internal/utils/phys/material"
)

type exploreWorldUsecase struct {
	wg    *worldgen.WorldGen
	store components.Storage
}

type ExploreWorldUsecaseInput struct {
	WorldID game.CelestialID
}

func NewExploreWorldUsecase(wg *worldgen.WorldGen, store components.Storage) components.Usecase[ExploreWorldUsecaseInput] {
	return &exploreWorldUsecase{
		wg:    wg,
		store: store,
	}
}

func (e *exploreWorldUsecase) Run(
	ctx context.Context,
	input ExploreWorldUsecaseInput,
	uctx components.UsecaseContext,
) common.Error {
	tx, err := e.store.StartTransaction(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	system, err := tx.Systems().GetContent(input.WorldID.GetStarSystemID())
	if err != nil {
		return err
	}

	prevWorldData, err := tx.Worlds().GetData(input.WorldID)
	if err != nil {
		return err
	}

	orbits := system.Orbits
	surfaceOrbit, foundOrbit := orbits[input.WorldID]

	if !foundOrbit {
		logger.Error(logger.FromMessage("galaxymap", "ExploreWorld: orbit not found").WithDetail("worldID", input.WorldID))
		return nil
	}

	combinedStar := worldgen.CombinedStarForEstimates(system.Stars)
	parentMass := combinedStar.Mass
	if input.WorldID.IsMoonID() {
		// TODO: use parent surface instead
	}

	// TODO: extract this into its own method under worldgen.*
	rnd := e.wg.GetRandom().ForCelestial(input.WorldID)
	allWgMats := globaldata.Materials().GetAll().FilterByHasAnyTag("volatile")
	protoplanetaryDisk := material.NewMaterialCompound()
	for _, mat := range allWgMats {
		protoplanetaryDisk.Add(mat, mat.GetAbundance(rnd.Float64())*mat.GetMolarMass())
	}

	generatedData := planetgen.GeneratePlanet(planetgen.GeneratePlanetOptions{
		WR:         e.wg.GetRandom(),
		ID:         input.WorldID,
		Params:     prevWorldData.Params,
		StarParams: combinedStar,
		// TODO: this is actually an average distance to a parent body
		StarDistance:          surfaceOrbit.Ellipse.AverageDistance(),
		ParentSurfaceMass:     parentMass,
		ParentSurfaceDistance: surfaceOrbit.Ellipse.AverageDistance(),
		AvailableMaterials:    protoplanetaryDisk,
	})

	explorePayload := components.ExploreWorldPayload{
		ID:         input.WorldID,
		ExploredBy: uctx.Author,

		Data: generatedData,
	}

	err = tx.Worlds().ExploreWorld(explorePayload)
	if err != nil {
		return err
	}

	eb.PublishNew(events.SourceGalaxy, events.EventGalaxyWorldUpdate, events.GalaxyWorldUpdate{WorldID: input.WorldID})

	return tx.Commit()
}
