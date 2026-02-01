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
	createBase components.UsecaseWithOutput[usecases.BaseCreateInput, any],
	renameBase components.Usecase[usecases.RenameBaseUsecaseInput],
) {
	gdf.df.AttachAction(api.ActionCreateBase, newActionFromUsecaseWithResult(
		createBase,
		func(payload api.CreateBasePayload) usecases.BaseCreateInput {
			return usecases.BaseCreateInput{
				WorldID:  game.CelestialID(payload.WorldID),
				TileID:   game.TileID(payload.TileID),
				Operator: game.CompanyID(payload.Operator),
				Name:     payload.Name,
			}
		},
		emptyEncodable,
	))

	gdf.df.AttachAction(api.ActionRenameBase, newActionFromUsecase(
		renameBase,
		func(payload api.RenameBasePayload) usecases.RenameBaseUsecaseInput {
			return usecases.RenameBaseUsecaseInput{
				BaseID:   game.BaseID(payload.BaseID),
				BaseName: payload.BaseName,
			}
		},
	))
}

func (gdf *GameDataFront) InitFactoryActions(
	createFactory components.Usecase[usecases.CreateFactoryUsecaseInput],
	upgradeFactory components.Usecase[usecases.UpgradeFactoryUsecaseInput],
	rebalanceFactory components.Usecase[usecases.RebalanceFactoryUsecaseInput],
	contributeToFactory components.Usecase[usecases.ContributeToFactoryUsecaseInput],
	transferFactoryItems components.Usecase[usecases.TransferFactoryItemsUsecaseInput],
	renameFactory components.Usecase[usecases.RenameFactoryUsecaseInput],
	demolishFactory components.UsecaseWithOutput[usecases.FactoryDemolishInput, any],
) {
	gdf.df.AttachAction(api.ActionCreateFactory, newActionFromUsecase(
		createFactory,
		func(payload api.CreateFactoryPayload) usecases.CreateFactoryUsecaseInput {
			return usecases.CreateFactoryUsecaseInput{
				BaseID: game.BaseID(payload.BaseID),
				Name:   payload.FactoryName,
			}
		},
	))

	gdf.df.AttachAction(api.ActionChangeUpgradeProject, newActionFromUsecase(
		upgradeFactory,
		func(payload api.UpgradeFactoryPayload) usecases.UpgradeFactoryUsecaseInput {
			return usecases.UpgradeFactoryUsecaseInput{
				FactoryID: game.FactoryID(payload.FactoryID),
				Project: game.FactoryUpgradeProject{
					Equipment: utils.MapSlice(
						payload.Equipment,
						func(data api.FactoriesTableRowEquipmentPlan) game.FactoryUpgradeProjectEqipment {
							return game.FactoryUpgradeProjectEqipment{
								EquipmentID: game.EquipmentID(data.EquipmentID),
								Count:       data.Count,
								Production: utils.MapSlice(
									data.Production,
									func(data api.FactoriesTableRowProductionPlan) game.FactoryProductionPlan {
										return game.FactoryProductionPlan{
											RecipeID:         game.RecipeID(data.RecipeID),
											ManualEfficiency: data.ManualEfficiency,
										}
									},
								),
							}
						},
					),
				},
			}
		},
	))

	gdf.df.AttachAction(api.ActionRebalanceFactory, newActionFromUsecase(
		rebalanceFactory,
		func(payload api.RebalanceFactoryPayload) usecases.RebalanceFactoryUsecaseInput {
			return usecases.RebalanceFactoryUsecaseInput{
				FactoryID: game.FactoryID(payload.FactoryID),
				Plan: game.FactoryRebalancePlan{
					EquipmentRebalances: utils.MapSlice(
						payload.Plan,
						func(data []api.FactoriesTableRowProductionPlan) game.FactoryEquipmentRebalancePlan {
							return game.FactoryEquipmentRebalancePlan{
								Production: utils.MapSlice(
									data,
									func(data api.FactoriesTableRowProductionPlan) game.FactoryProductionPlan {
										return game.FactoryProductionPlan{
											RecipeID:         game.RecipeID(data.RecipeID),
											ManualEfficiency: data.ManualEfficiency,
										}
									},
								),
							}
						},
					),
				},
			}
		},
	))

	gdf.df.AttachAction(api.ActionContributeToUpgrade, newActionFromUsecase(
		contributeToFactory,
		func(payload api.ContributeToFactoryPayload) usecases.ContributeToFactoryUsecaseInput {
			return usecases.ContributeToFactoryUsecaseInput{
				FactoryID: game.FactoryID(payload.FactoryID),
				Amounts:   game.MakeInventoryDeltaFrom(payload.Amounts),
			}
		},
	))

	gdf.df.AttachAction(api.ActionTransferFactoryItems, newActionFromUsecase(
		transferFactoryItems,
		func(payload api.TransferFactoryItemsPayload) usecases.TransferFactoryItemsUsecaseInput {
			return usecases.TransferFactoryItemsUsecaseInput{
				FactoryID:         game.FactoryID(payload.FactoryID),
				Items:             game.MakeInventoryDeltaFrom(payload.Amounts),
				FromFactoryToBase: payload.FromFactoryToBase,
			}
		},
	))

	gdf.df.AttachAction(api.ActionRenameFactory, newActionFromUsecase(
		renameFactory,
		func(payload api.RenameFactoryPayload) usecases.RenameFactoryUsecaseInput {
			return usecases.RenameFactoryUsecaseInput{
				FactoryID:   game.FactoryID(payload.FactoryID),
				FactoryName: payload.FactoryName,
			}
		},
	))

	gdf.df.AttachAction(api.ActionDemolishFactory, newActionFromUsecaseWithResult(
		demolishFactory,
		func(payload api.DemolishFactoryPayload) usecases.FactoryDemolishInput {
			return usecases.FactoryDemolishInput{
				FactoryID: game.FactoryID(payload.FactoryID),
			}
		},
		emptyEncodable,
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

func emptyEncodable(_ any) common.Encodable {
	return common.EmptyEncodable()
}
