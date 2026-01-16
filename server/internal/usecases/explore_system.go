package usecases

import (
	"context"
	"srv/internal/components"
	"srv/internal/game"
	"srv/internal/game/worldgen"
	"srv/internal/globals/events"
	"srv/internal/utils/common"
)

type exploreSystemUsecase struct {
	wg    *worldgen.WorldGen
	store components.GlobalReposReadonly
}

type ExploreSystemUsecaseInput struct {
	SystemID game.StarSystemID
}

func NewExploreSystemUsecase(
	wg *worldgen.WorldGen,
	store components.GlobalReposReadonly,
) components.Usecase[ExploreSystemUsecaseInput] {
	return &exploreSystemUsecase{
		wg:    wg,
		store: store,
	}
}

// Run implements components.Usecase.
func (e *exploreSystemUsecase) Run(
	ctx context.Context,
	input ExploreSystemUsecaseInput,
	uctx components.UsecaseContext,
) common.Error {
	tx, err := e.store.StartTransaction(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	prevSystemData, err := tx.Systems().GetContent(input.SystemID)
	if err != nil {
		return err
	}

	gendata := e.wg.Explore(worldgen.ExploreOptions{
		SystemID: input.SystemID,
		Stars:    prevSystemData.Stars,
		Orbits:   prevSystemData.Orbits,
	})

	err = tx.Systems().ExploreSystem(components.ExploreSystemPayload{
		ID:         input.SystemID,
		Explorer:   uctx.Author,
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
	tx.Worlds().CreateWorlds(generatedWorlds)

	events.SystemUpdated.Publish(events.SystemUpdatedPayload{SystemID: input.SystemID})

	return tx.Commit()
}
