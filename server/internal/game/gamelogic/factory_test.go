package gamelogic_test

import (
	"srv/internal/game"
	"srv/internal/game/gamelogic"
	"srv/internal/globals/assets"
	"srv/internal/globals/globaldata"
	"srv/internal/globals/logger"
	"testing"
	"time"
)

func TestFactoryLogicUpdateBasic(t *testing.T) {
	logger.Init()
	factory, updater, t0, mockReg := setup2()

	factory.Equipment = append(factory.Equipment, game.FactoryEquipment{
		EquipmentID: game.EquipmentID("E1"),
		Count:       1,
		Production: []game.FactoryProductionItem{
			{
				Recipe:           mockReg.GetRecipesForEquipment(game.EquipmentID("E1"))[0].Instantiate(),
				ManualEfficiency: 1.0,
			},
			{
				Recipe:           mockReg.GetRecipesForEquipment(game.EquipmentID("E1"))[1].Instantiate(),
				ManualEfficiency: 1.0,
			},
		},
	})

	// 50% efficiency (is not implemented yet)
	factory.Employees[game.WorkforceTypeIntern] = 2
	factory.Employees[game.WorkforceTypeWorker] = 1

	factory.StaticInventory[game.CommodityID("a")] = 2
	factory.StaticInventory[game.CommodityID("b")] = 2

	updater.UpdateTo(factory, t0.Add(5*time.Minute))

	assertInventoryAmount(t, factory.StaticInventory, "a", 0.0)
	assertInventoryAmount(t, factory.StaticInventory, "b", 0.0)
	assertInventoryAmount(t, factory.StaticInventory, "c", 0.0)
	assertInventoryAmount(t, factory.StaticInventory, "d", 1.0)

	assert(t, factory.Status == game.FactoryProductionStatusHalted, "the factory should be halted")

	updatedMinutes := factory.UpdatedTo.Sub(t0).Minutes()
	assertFloatEquals(t, updatedMinutes, 1.0, "updated time (m)")
}

func setup2() (*game.Factory, *gamelogic.FactoryUpdatesLogic, time.Time, *globaldata.CraftingRegistry) {
	t0 := time.Date(2025, time.January, 1, 12, 0, 0, 0, time.UTC)

	factory := &game.Factory{
		Status:          game.FactoryProductionStatusActive,
		Equipment:       []game.FactoryEquipment{},
		StaticInventory: make(map[game.CommodityID]float64),
		Employees:       make(map[game.WorkforceType]int),
		UpdatedTo:       t0,
	}

	mockReg := setUpMockRegistry2()
	l := gamelogic.FactoryUpdatesMocked(mockReg)

	return factory, l, t0, mockReg
}

func setUpMockRegistry2() *globaldata.CraftingRegistry {
	mockr := globaldata.NewMockCraftingRegistry(
		&assets.CommoditiesAsset{
			Commodities: map[string]assets.CommodityData{
				"a": {
					Category: "1",
					Mass:     1,
					Volume:   1,
				},
				"b": {
					Category: "1",
					Mass:     0.5,
					Volume:   1,
				},
				"c": {
					Category: "2",
					Mass:     2,
					Volume:   1,
				},
				"d": {
					Category: "2",
					Mass:     1,
					Volume:   1,
				},
			},
			Resources:      map[string]assets.ResourceData{},
			WGMaterialsMap: map[string]string{},
		},
		&assets.EquipmentAsset{
			Buildings: map[string]assets.EquipmentAssetBuilding{
				"B": {
					MatsPerArea: map[string]float64{
						"a": 1,
					},
				},
			},
			Equipment: map[string]assets.EquipmentAssetEquipment{
				"E1": {
					Building: "B",
					Area:     10,
					Operators: map[string]assets.EquipmentAssetEquipmentOperators{
						"intern": {Count: 2, Contribution: 0.1},
						"worker": {Count: 1, Contribution: 0.8},
					},
				},
				"E2": {
					Building: "B",
					Area:     200,
					Operators: map[string]assets.EquipmentAssetEquipmentOperators{
						"intern":   {Count: 5, Contribution: 10},
						"worker":   {Count: 2, Contribution: 15},
						"engineer": {Count: 1, Contribution: 20},
					},
				},
			},
		},
		&assets.RecipesAsset{
			Recipes: []assets.RecipesAssetRecipe{
				{
					Equipment: "E1",
					Inputs:    map[string]float64{"a": 1, "b": 1},
					Outputs:   map[string]float64{"c": 1},
					BaseTime:  "1m",
				},
				{
					Equipment: "E1",
					Inputs:    map[string]float64{"a": 1, "b": 1, "c": 1},
					Outputs:   map[string]float64{"d": 1},
					BaseTime:  "1m",
				},
				{
					Equipment: "E2",
					Inputs:    map[string]float64{"a": 1, "b": 1},
					Outputs:   map[string]float64{"c": 1, "d": 1},
					BaseTime:  "1m",
				},
				{
					Equipment: "E1",
					Inputs:    map[string]float64{"c": 1},
					Outputs:   map[string]float64{"d": 1},
					BaseTime:  "2m",
				},
			},
		},
	)

	return mockr
}
