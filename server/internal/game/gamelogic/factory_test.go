package gamelogic_test

import (
	"fmt"
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
	factory, updater, t0, _ := setup2()

	factory.Equipment = append(factory.Equipment, game.FactoryEquipment{
		EquipmentID: game.EquipmentID("E1"),
		Count:       2, // each recipe gets 1 building assigned to it, so no time scaling is happening
		Production: []game.FactoryProductionItem{
			{
				Recipe: game.RecipeTemplate{
					TemplateID:    "RT1",
					Equipment:     "E1",
					StaticInputs:  game.MakeInventoryDeltaFrom(map[string]float64{"a": 1, "b": 1}),
					StaticOutputs: game.MakeInventoryDeltaFrom(map[string]float64{"c": 1}),
					BaseDuration:  time.Minute,
				}.Instantiate(),
				ManualEfficiency: 1.0,
			},
			{
				Recipe: game.RecipeTemplate{
					TemplateID:    "RT2",
					Equipment:     "E1",
					StaticInputs:  game.MakeInventoryDeltaFrom(map[string]float64{"a": 1, "b": 1, "c": 1}),
					StaticOutputs: game.MakeInventoryDeltaFrom(map[string]float64{"d": 1}),
					BaseDuration:  time.Minute,
				}.Instantiate(),
				ManualEfficiency: 1.0,
			},
		},
	})

	// 50% efficiency (is not implemented yet)
	factory.Employees[game.WorkforceTypeIntern] = 2
	factory.Employees[game.WorkforceTypeWorker] = 1

	initialInventory := game.MakeEmptyInventory()
	initialInventory[game.CommodityID("a")] = 2
	initialInventory[game.CommodityID("b")] = 2

	factory.Production = game.MakeFactoryProductionPeriodFrom(t0, factory.Equipment, initialInventory)
	fmt.Printf("%+v\n", factory.Production)

	t1 := t0.Add(5 * time.Minute)
	updater.UpdateTo(factory, t1)

	resultingInventory := factory.Production.CalculateInventoryAt(t1)

	fmt.Printf("%+v\n", factory.Production)

	assertInventoryAmount(t, resultingInventory, "a", 0.0)
	assertInventoryAmount(t, resultingInventory, "b", 0.0)
	assertInventoryAmount(t, resultingInventory, "c", 0.0)
	assertInventoryAmount(t, resultingInventory, "d", 1.0)

	assert(t, factory.Production.Status() == game.FactoryProductionStatusHalted, "the factory should be halted")

	updatedMinutes := factory.Production.Start().Sub(t0).Minutes()
	assertFloatEquals(t, updatedMinutes, 1.0, "updated time (m)")

	assert(t, factory.Production.IsInfinite(), "current production period should be infinite")
}

func setup2() (*game.Factory, *gamelogic.FactoryUpdatesLogic, time.Time, *globaldata.CraftingRegistry) {
	t0 := time.Date(2025, time.January, 1, 12, 0, 0, 0, time.UTC)

	factory := &game.Factory{
		Equipment:  []game.FactoryEquipment{},
		Employees:  make(map[game.WorkforceType]int),
		Production: game.MakeEmptyFactoryProductionPeriod(t0),
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
