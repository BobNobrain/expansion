package datafront

import (
	"srv/internal/components"
	"srv/internal/usecases"
	"srv/pkg/api"
)

func (gdf *GameDataFront) InitExploreActions(
	exploreSystem components.Usecase[usecases.ExploreSystemUsecaseInput],
	exploreWorld components.Usecase[usecases.ExploreWorldUsecaseInput],
) {
	gdf.df.AttachAction(api.ActionExploreSystem, newActionFromUsecase(exploreSystem, exploreSystemMapper))
	gdf.df.AttachAction(api.ActionExploreWorld, newActionFromUsecase(exploreWorld, exploreWorldMapper))
}

func (gdf *GameDataFront) InitCityActions(foundCity components.Usecase[usecases.FoundCityUsecaseInput]) {
	gdf.df.AttachAction(api.ActionFoundCity, newActionFromUsecase(foundCity, foundCityMapper))
}

func (gdf *GameDataFront) InitBaseActions(
	createBase components.Usecase[usecases.CreateBaseUsecaseInput],
) {
	gdf.df.AttachAction(api.ActionCreateBase, newActionFromUsecase(createBase, createBaseMapper))
}
