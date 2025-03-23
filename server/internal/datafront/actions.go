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

//
// TODO: dfcore.NewActionFromUsecase[APIInput any, UCInput any](components.Usecase[Input], inputMapper func(APIInput) UCInput)?
//

type gameActions struct {
	exploreSystem components.Usecase[usecases.ExploreSystemUsecaseInput]
	exploreWorld  components.Usecase[usecases.ExploreWorldUsecaseInput]
	foundCity     components.Usecase[usecases.FoundCityUsecaseInput]
}

func (gdf *GameDataFront) InitExploreActions(
	exploreSystem components.Usecase[usecases.ExploreSystemUsecaseInput],
	exploreWorld components.Usecase[usecases.ExploreWorldUsecaseInput],
) {
	if gdf.actions == nil {
		gdf.actions = &gameActions{}
	}
	gdf.actions.exploreSystem = exploreSystem
	gdf.actions.exploreWorld = exploreWorld

	gdf.df.AttachAction(api.ActionExploreSystem, dfcore.NewAction(gdf.actions.handleExploreSystem))
	gdf.df.AttachAction(api.ActionExploreWorld, dfcore.NewAction(gdf.actions.handleExploreWorld))
}
func (a *gameActions) handleExploreSystem(
	payload api.ExploreSystemPayload,
	userID domain.UserID,
) (common.Encodable, common.Error) {
	return common.EmptyEncodable(), a.exploreSystem.Run(
		context.TODO(),
		usecases.ExploreSystemUsecaseInput{
			SystemID: game.StarSystemID(payload.SystemID),
		},
		components.UsecaseContext{Author: userID},
	)
}
func (a *gameActions) handleExploreWorld(
	payload api.ExploreWorldPayload,
	userID domain.UserID,
) (common.Encodable, common.Error) {
	return common.EmptyEncodable(), a.exploreWorld.Run(
		context.TODO(),
		usecases.ExploreWorldUsecaseInput{
			WorldID: game.CelestialID(payload.WorldID),
		},
		components.UsecaseContext{Author: userID},
	)
}

func (gdf *GameDataFront) InitCityActions(foundCity components.Usecase[usecases.FoundCityUsecaseInput]) {
	if gdf.actions == nil {
		gdf.actions = &gameActions{}
	}
	gdf.actions.foundCity = foundCity

	gdf.df.AttachAction(api.ActionFoundCity, dfcore.NewAction(gdf.actions.handleFoundCity))
}
func (a *gameActions) handleFoundCity(
	payload api.FoundCityPayload,
	userID domain.UserID,
) (common.Encodable, common.Error) {
	return common.EmptyEncodable(), a.foundCity.Run(
		context.TODO(),
		usecases.FoundCityUsecaseInput{
			Name:    payload.Name,
			WorldID: game.CelestialID(payload.WorldID),
			TileID:  game.TileID(payload.TileID),
		},
		components.UsecaseContext{Author: userID},
	)
}
