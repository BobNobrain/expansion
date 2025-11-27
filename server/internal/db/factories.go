package db

import (
	"context"
	"encoding/json"
	"srv/internal/db/dbq"
	"srv/internal/game"
	"srv/internal/utils"
	"srv/internal/utils/common"
)

type factoriesRepoImpl struct {
	q   *dbq.Queries
	ctx context.Context
}

type factoryDataJSON struct {
	Status    byte                       `json:"status"`
	Employees map[string]int             `json:"wf"`
	Inventory map[string]float64         `json:"inv"`
	Equipment []factoryDataEquipmentJSON `json:"equipment"`
}
type factoryDataEquipmentJSON struct {
	EquipmentID string                                `json:"eqId"`
	Count       int                                   `json:"n"`
	Production  map[int]factoryDataProductionItemJSON `json:"production"`
}
type factoryDataProductionItemJSON struct {
	RecipeID         int                `json:"recipe"`
	ManualEfficiency float64            `json:"manualEff"`
	DynamicOutputs   map[string]float64 `json:"dynOutputs"`
}

func (b *factoriesRepoImpl) GetBaseFactories(bid game.BaseID) ([]game.Factory, common.Error) {
	rows, dberr := b.q.GetBaseFactories(b.ctx, int32(bid))
	if dberr != nil {
		return nil, makeDBError(dberr, "FactoriesRepo::GetBaseFactories")
	}

	return utils.MapSliceFailable(rows, decodeFactory)
}

func (b *factoriesRepoImpl) ResolveFactories(ids []game.FactoryID) ([]game.Factory, common.Error) {
	rows, dberr := b.q.ResolveFactories(b.ctx, utils.ConvertInts[game.FactoryID, int32](ids))
	if dberr != nil {
		return nil, makeDBError(dberr, "FactoriesRepo::ResolveFactories")
	}

	return utils.MapSliceFailable(rows, decodeFactory)
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

	dberr := b.q.UpdateBase(b.ctx, dbq.UpdateBaseParams{
		ID:   int32(factory.FactoryID),
		Data: factoryData,
	})
	if dberr != nil {
		return makeDBError(dberr, "FactoriesRepo::UpdateBaseFactory")
	}
	return nil
}

func decodeFactory(row dbq.Factory) (game.Factory, common.Error) {
	rowData, err := parseJSON[factoryDataJSON](row.Data)
	if err != nil {
		return game.Factory{}, nil
	}

	factory := game.Factory{
		FactoryID: game.FactoryID(row.ID),
		BaseID:    game.BaseID(row.BaseID),
		BuiltAt:   row.CreatedAt.Time,
		Updated:   row.UpdatedTo.Time,

		Status:    game.FactoryStatus(rowData.Status),
		Inventory: game.MakeInventoryFrom(rowData.Inventory),
		Employees: make(map[game.WorkforceType]int),
		Equipment: utils.MapSlice(rowData.Equipment, decodeFactoryEquipment),
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
		Production:  make(map[game.RecipeID]game.FactoryProductionItem),
	}

	for _, prodData := range eqData.Production {
		eq.Production[game.RecipeID(prodData.RecipeID)] = game.FactoryProductionItem{
			Template:         game.RecipeID(prodData.RecipeID),
			DynamicOutputs:   game.MakeInventoryFrom(prodData.DynamicOutputs),
			ManualEfficiency: prodData.ManualEfficiency,
		}
	}

	return eq
}

func encodeFactoryData(factory game.Factory) factoryDataJSON {
	data := factoryDataJSON{
		Status:    byte(factory.Status),
		Employees: utils.MapKeys(factory.Employees, func(wf game.WorkforceType) string { return wf.String() }),
		Inventory: factory.Inventory.ToMap(),
		Equipment: utils.MapSlice(factory.Equipment, encodeFactoryEquipment),
	}
	return data
}
func encodeFactoryEquipment(eq game.FactoryEquipment) factoryDataEquipmentJSON {
	data := factoryDataEquipmentJSON{
		EquipmentID: string(eq.EquipmentID),
		Count:       eq.Count,
		Production:  make(map[int]factoryDataProductionItemJSON),
	}

	for _, production := range eq.Production {
		data.Production[int(production.Template)] = factoryDataProductionItemJSON{
			RecipeID:         int(production.Template),
			ManualEfficiency: production.ManualEfficiency,
			DynamicOutputs:   production.DynamicOutputs.ToMap(),
		}
	}

	return data
}
