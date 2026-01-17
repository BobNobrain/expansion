package db

import (
	"context"
	"encoding/json"
	"srv/internal/db/dbq"
	"srv/internal/domain"
	"srv/internal/game"
	"srv/internal/game/gamelogic"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

type factoriesRepoImpl struct {
	q   *dbq.Queries
	ctx context.Context
}

type factoryDataJSON struct {
	// TODO: remove (it is calculated from production recipes and current inventory anyways)
	Status    byte                       `json:"status"`
	Employees map[string]int             `json:"wf"`
	Inventory map[string]float64         `json:"inv"`
	Equipment []factoryDataEquipmentJSON `json:"equipment"`

	UpgradeTarget        []factoryDataEquipmentJSON    `json:"upgradeTarget,omitempty"`
	UpgradeContributions []contributionJSONHistoryItem `json:"upgradeContributions,omitempty"`
	UpgradeLastChanged   time.Time                     `json:"upgradeLastChanged"`
}
type factoryDataEquipmentJSON struct {
	EquipmentID string                          `json:"eqId"`
	Count       int                             `json:"n"`
	Production  []factoryDataProductionItemJSON `json:"production"`
}
type factoryDataProductionItemJSON struct {
	RecipeID         string             `json:"recipe"`
	TemplateID       string             `json:"template,omitempty"`
	ManualEfficiency float64            `json:"manualEff"`
	Inputs           map[string]float64 `json:"inputs,omitempty"`
	Outputs          map[string]float64 `json:"outputs,omitempty"`
}

func (b *factoriesRepoImpl) ResolveFactoryOverviews(fids []game.FactoryID) ([]game.FactoryStaticOverview, common.Error) {
	rows, dberr := b.q.ResolveFactoryOverviews(b.ctx, utils.ConvertInts[game.FactoryID, int32](fids))
	if dberr != nil {
		return nil, makeDBError(dberr, "FactoriesRepo::ResolveFactoryOverviews")
	}

	overviews := make([]game.FactoryStaticOverview, 0, len(rows))
	for _, row := range rows {
		overviews = append(overviews, game.FactoryStaticOverview{
			FactoryID: game.FactoryID(row.ID),
			BaseID:    game.BaseID(row.BaseID),
			WorldID:   game.CelestialID(row.WorldID),
			TileID:    game.TileID(row.TileID),
			BuiltAt:   row.CreatedAt.Time,
		})
	}

	return overviews, nil
}

func (b *factoriesRepoImpl) actualizeAndSave(
	fs []game.Factory,
	updater *gamelogic.FactoryUpdatesLogic,
	now time.Time,
) common.Error {
	factoriesToUpdate := make([]game.Factory, 0)
	for i, f := range fs {
		updatedFactory := f
		hasUpdated := updater.UpdateTo(&updatedFactory, now)

		if hasUpdated {
			factoriesToUpdate = append(factoriesToUpdate, f)
		}

		fs[i] = updatedFactory
	}

	for _, f := range factoriesToUpdate {
		err := b.UpdateBaseFactory(f)
		if err != nil {
			return err
		}
	}

	return nil
}

func (b *factoriesRepoImpl) GetBaseFactories(bid game.BaseID, updater *gamelogic.FactoryUpdatesLogic) ([]game.Factory, common.Error) {
	rows, dberr := b.q.GetBaseFactories(b.ctx, int32(bid))
	if dberr != nil {
		return nil, makeDBError(dberr, "FactoriesRepo::GetBaseFactories")
	}

	factories, err := utils.MapSliceFailable(rows, decodeFactory)
	if err != nil {
		return nil, err
	}

	err = b.actualizeAndSave(factories, updater, time.Now())
	if err != nil {
		return nil, err
	}
	return factories, nil
}

func (b *factoriesRepoImpl) ResolveFactories(ids []game.FactoryID, updater *gamelogic.FactoryUpdatesLogic) ([]game.Factory, common.Error) {
	rows, dberr := b.q.ResolveFactories(b.ctx, utils.ConvertInts[game.FactoryID, int32](ids))
	if dberr != nil {
		return nil, makeDBError(dberr, "FactoriesRepo::ResolveFactories")
	}

	factories, err := utils.MapSliceFailable(rows, decodeFactory)
	if err != nil {
		return nil, err
	}

	err = b.actualizeAndSave(factories, updater, time.Now())
	if err != nil {
		return nil, err
	}
	return factories, nil
}

func (b *factoriesRepoImpl) CreateBaseFactory(factory game.Factory) common.Error {
	factoryData := encodeFactoryData(factory)

	factoryDataJSON, jerr := json.Marshal(factoryData)
	if jerr != nil {
		return makeDBError(jerr, "FactoriesRepo::CreateBaseFactory(FactoryData.ToJSON)")
	}

	dberr := b.q.CreateFactory(b.ctx, dbq.CreateFactoryParams{
		BaseID: int32(factory.BaseID),
		Data:   factoryDataJSON,
		Name:   factory.Name,
	})
	if dberr != nil {
		return makeDBError(dberr, "FactoriesRepo::CreateBaseFactory")
	}

	return nil
}

func (b *factoriesRepoImpl) DeleteBaseFactory(fid game.FactoryID) common.Error {
	dberr := b.q.DestroyFactory(b.ctx, int32(fid))
	if dberr != nil {
		return makeDBError(dberr, "FactoriesRepo::DeleteBaseFactory")
	}
	return nil
}

func (b *factoriesRepoImpl) UpdateBaseFactory(factory game.Factory) common.Error {
	factoryData, jerr := json.Marshal(encodeFactoryData(factory))
	if jerr != nil {
		return makeDBError(jerr, "FactoriesRepo::UpdateBaseFactory")
	}

	dberr := b.q.UpdateFactory(b.ctx, dbq.UpdateFactoryParams{
		ID:        int32(factory.FactoryID),
		Data:      factoryData,
		UpdatedTo: pgtype.Timestamptz{Time: factory.Production.Start(), Valid: true},
	})
	if dberr != nil {
		return makeDBError(dberr, "FactoriesRepo::UpdateBaseFactory")
	}
	return nil
}

func (b *factoriesRepoImpl) RenameFactory(fid game.FactoryID, uid domain.UserID, newName string) common.Error {
	dberr := b.q.RenameFactory(b.ctx, dbq.RenameFactoryParams{
		ID:   int32(fid),
		Name: newName,
	})

	if dberr != nil {
		return makeDBError(dberr, "FactoriesRepo::RenameFactory")
	}
	return nil
}

func decodeFactory(row dbq.Factory) (game.Factory, common.Error) {
	rowData, err := parseJSON[factoryDataJSON](row.Data)
	if err != nil {
		return game.Factory{}, nil
	}

	equipment := utils.MapSlice(rowData.Equipment, decodeFactoryEquipment)

	factory := game.Factory{
		FactoryID: game.FactoryID(row.ID),
		BaseID:    game.BaseID(row.BaseID),
		BuiltAt:   row.CreatedAt.Time,
		Name:      row.Name,

		Production: game.MakeFactoryProductionPeriodFrom(
			row.UpdatedTo.Time,
			equipment,
			game.MakeInventoryFrom(rowData.Inventory),
		),
		Employees: make(map[game.WorkforceType]int),
		Equipment: equipment,

		Upgrade: game.FactoryUpgradeProject{
			Equipment: utils.MapSlice(rowData.UpgradeTarget, func(data factoryDataEquipmentJSON) game.FactoryUpgradeProjectEqipment {
				return game.FactoryUpgradeProjectEqipment{
					EquipmentID: game.EquipmentID(data.EquipmentID),
					Count:       data.Count,
					Production: utils.MapSlice(data.Production, func(data factoryDataProductionItemJSON) game.FactoryProductionPlan {
						return game.FactoryProductionPlan{
							RecipeID:         game.RecipeID(data.RecipeID),
							ManualEfficiency: data.ManualEfficiency,
						}
					}),
				}
			}),
			Progress:    utils.MapSlice(rowData.UpgradeContributions, decodeContributionJSONHistoryItem),
			LastUpdated: rowData.UpgradeLastChanged,
		},
	}

	for wf, count := range rowData.Employees {
		wfType := game.ParseWorkforceType(wf)
		if !wfType.IsValid() {
			continue
		}

		factory.Employees[game.ParseWorkforceType(wf)] = count
	}

	return factory, nil
}
func decodeFactoryEquipment(eqData factoryDataEquipmentJSON) game.FactoryEquipment {
	eq := game.FactoryEquipment{
		EquipmentID: game.EquipmentID(eqData.EquipmentID),
		Count:       eqData.Count,
		Production:  nil,
	}

	for _, prodData := range eqData.Production {
		eq.Production = append(eq.Production, game.FactoryProductionItem{
			Recipe: game.Recipe{
				RecipeID:    game.RecipeID(prodData.RecipeID),
				TemplateID:  game.RecipeTemplateID(prodData.TemplateID),
				Inputs:      utils.ConvertStringKeys[string, game.CommodityID](prodData.Inputs),
				Outputs:     utils.ConvertStringKeys[string, game.CommodityID](prodData.Outputs),
				EquipmentID: eq.EquipmentID,
			},
			ManualEfficiency: prodData.ManualEfficiency,
		})
	}

	return eq
}

func encodeFactoryData(factory game.Factory) factoryDataJSON {
	data := factoryDataJSON{
		Status:    byte(factory.Production.Status()),
		Employees: utils.MapKeys(factory.Employees, func(wf game.WorkforceType) string { return wf.String() }),
		Inventory: factory.Production.GetStartingInventoryClone().ToMap(),
		Equipment: utils.MapSlice(factory.Equipment, encodeFactoryEquipment),

		UpgradeTarget: utils.MapSlice(factory.Upgrade.Equipment, func(eq game.FactoryUpgradeProjectEqipment) factoryDataEquipmentJSON {
			return factoryDataEquipmentJSON{
				EquipmentID: string(eq.EquipmentID),
				Count:       eq.Count,
				Production: utils.MapSlice(eq.Production, func(prod game.FactoryProductionPlan) factoryDataProductionItemJSON {
					return factoryDataProductionItemJSON{
						RecipeID:         string(prod.RecipeID),
						ManualEfficiency: prod.ManualEfficiency,
					}
				}),
			}
		}),
		UpgradeContributions: utils.MapSlice(factory.Upgrade.Progress, encodeContributionJSONHistoryItem),
		UpgradeLastChanged:   factory.Upgrade.LastUpdated,
	}
	return data
}
func encodeFactoryEquipment(eq game.FactoryEquipment) factoryDataEquipmentJSON {
	data := factoryDataEquipmentJSON{
		EquipmentID: string(eq.EquipmentID),
		Count:       eq.Count,
		Production:  nil,
	}

	for _, production := range eq.Production {
		data.Production = append(data.Production, factoryDataProductionItemJSON{
			RecipeID:         string(production.Recipe.RecipeID),
			TemplateID:       string(production.Recipe.TemplateID),
			Inputs:           utils.ConvertStringKeys[game.CommodityID, string](production.Recipe.Inputs),
			Outputs:          utils.ConvertStringKeys[game.CommodityID, string](production.Recipe.Outputs),
			ManualEfficiency: production.ManualEfficiency,
		})
	}

	return data
}
