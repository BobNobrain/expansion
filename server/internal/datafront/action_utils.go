package datafront

import (
	"context"
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/usecases"
	"srv/internal/utils/common"
	"srv/pkg/api"
)

func newActionFromUsecase[APIInput any, UCInput any](
	uc components.Usecase[UCInput],
	inputMapper func(APIInput) UCInput,
) *dfcore.Action[APIInput] {
	return dfcore.NewAction(func(apiInput APIInput, userID domain.UserID) (common.Encodable, common.Error) {
		return common.EmptyEncodable(), uc.Run(
			context.TODO(),
			inputMapper(apiInput),
			components.UsecaseContext{Author: userID},
		)
	})
}

// api -> usecase input mappers
func exploreSystemMapper(payload api.ExploreSystemPayload) usecases.ExploreSystemUsecaseInput {
	return usecases.ExploreSystemUsecaseInput{
		SystemID: game.StarSystemID(payload.SystemID),
	}
}
func exploreWorldMapper(payload api.ExploreWorldPayload) usecases.ExploreWorldUsecaseInput {
	return usecases.ExploreWorldUsecaseInput{
		WorldID: game.CelestialID(payload.WorldID),
	}
}

func foundCityMapper(payload api.FoundCityPayload) usecases.FoundCityUsecaseInput {
	return usecases.FoundCityUsecaseInput{
		Name:    payload.Name,
		WorldID: game.CelestialID(payload.WorldID),
		TileID:  game.TileID(payload.TileID),
	}
}

func createBaseMapper(payload api.CreateBasePayload) usecases.CreateBaseUsecaseInput {
	return usecases.CreateBaseUsecaseInput{
		WorldID: game.CelestialID(payload.WorldID),
		TileID:  game.TileID(payload.TileID),
	}
}
