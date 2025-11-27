package datafront

import (
	"srv/internal/components"
	"srv/internal/game"
	"srv/internal/usecases"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"srv/pkg/api"
)

func (gdf *GameDataFront) InitExploreActions(
	exploreSystem components.Usecase[usecases.ExploreSystemUsecaseInput],
	exploreWorld components.Usecase[usecases.ExploreWorldUsecaseInput],
) {
	gdf.df.AttachAction(api.ActionExploreSystem, newActionFromUsecase(
		exploreSystem,
		func(payload api.ExploreSystemPayload) usecases.ExploreSystemUsecaseInput {
			return usecases.ExploreSystemUsecaseInput{
				SystemID: game.StarSystemID(payload.SystemID),
			}
		},
	))

	gdf.df.AttachAction(api.ActionExploreWorld, newActionFromUsecase(
		exploreWorld,
		func(payload api.ExploreWorldPayload) usecases.ExploreWorldUsecaseInput {
			return usecases.ExploreWorldUsecaseInput{
				WorldID: game.CelestialID(payload.WorldID),
			}
		},
	))
}

func (gdf *GameDataFront) InitCityActions(foundCity components.Usecase[usecases.FoundCityUsecaseInput]) {
	gdf.df.AttachAction(api.ActionFoundCity, newActionFromUsecase(
		foundCity,
		func(payload api.FoundCityPayload) usecases.FoundCityUsecaseInput {
			return usecases.FoundCityUsecaseInput{
				Name:    payload.Name,
				WorldID: game.CelestialID(payload.WorldID),
				TileID:  game.TileID(payload.TileID),
			}
		},
	))
}

func (gdf *GameDataFront) InitBaseActions(
	createBase components.Usecase[usecases.CreateBaseUsecaseInput],
	createBaseSite components.Usecase[usecases.CreateFactorySiteUsecaseInput],
	contributeToSite components.Usecase[usecases.MakeFactorySiteContributionUsecaseInput],
) {
	gdf.df.AttachAction(api.ActionCreateBase, newActionFromUsecase(
		createBase,
		func(payload api.CreateBasePayload) usecases.CreateBaseUsecaseInput {
			return usecases.CreateBaseUsecaseInput{
				WorldID:  game.CelestialID(payload.WorldID),
				TileID:   game.TileID(payload.TileID),
				Operator: game.CompanyID(payload.Operator),
			}
		},
	))

	gdf.df.AttachAction(api.ActionCreateBaseSite, newActionFromUsecase(
		createBaseSite,
		func(payload api.CreateSitePayload) usecases.CreateFactorySiteUsecaseInput {
			return usecases.CreateFactorySiteUsecaseInput{
				BaseID: game.BaseID(payload.BaseID),
				Equipment: utils.MapSlice(payload.Equipment, func(equipment api.FactoriesTableRowEquipment) game.FactoryEquipment {
					production := make(map[game.RecipeID]game.FactoryProductionItem)
					for _, p := range equipment.Production {
						rid := game.RecipeID(p.RecipeID)
						production[rid] = game.FactoryProductionItem{
							Template:         rid,
							ManualEfficiency: p.ManualEfficiency,
							DynamicOutputs:   game.MakeInventoryFrom(p.DynamicOutputs),
						}
					}

					return game.FactoryEquipment{
						EquipmentID: game.EquipmentID(equipment.EquipmentID),
						Count:       equipment.Count,
						Production:  production,
					}
				}),
			}
		},
	))

	gdf.df.AttachAction(api.ActionContributeToSite, newActionFromUsecase(
		contributeToSite,
		func(payload api.ContributeToSitePayload) usecases.MakeFactorySiteContributionUsecaseInput {
			return usecases.MakeFactorySiteContributionUsecaseInput{
				BaseID:  game.BaseID(payload.BaseID),
				SiteID:  payload.SiteID,
				Amounts: game.MakeInventoryDeltaFrom(payload.Amounts),
			}
		},
	))
}

func (gdf *GameDataFront) InitCheatAction(uc components.UsecaseWithOutput[usecases.CheatUsecaseInput, usecases.CheatUsecaseOutput]) {
	gdf.df.AttachAction(
		api.ActionRunCheat,
		newActionFromUsecaseWithResult(
			uc,
			func(payload api.RunCheatPayload) usecases.CheatUsecaseInput {
				return usecases.CheatUsecaseInput{Command: payload.Cmd}
			},
			func(result usecases.CheatUsecaseOutput) common.Encodable {
				return result.Result
			},
		),
	)
}
