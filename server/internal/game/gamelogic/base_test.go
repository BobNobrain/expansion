package gamelogic_test

// import (
// 	"srv/internal/game"
// 	"srv/internal/game/gamelogic"
// 	"srv/internal/globals/assets"
// 	"srv/internal/globals/globaldata"
// 	"srv/internal/globals/logger"
// 	"testing"
// 	"time"
// )

// func TestBaseLogicEquipmentProductivity(t *testing.T) {
// 	base, l, _ := setup()

// 	base.Equipment[game.EquipmentID("E1")] = game.BaseEquipment{
// 		EquipmentID: game.EquipmentID("E1"),
// 		Count:       2,
// 		Workers: map[game.WorkforceType]int{
// 			game.WorkforceTypeIntern: 4,
// 			game.WorkforceTypeWorker: 2,
// 		},
// 	}
// 	base.Equipment[game.EquipmentID("E2")] = game.BaseEquipment{
// 		EquipmentID: game.EquipmentID("E2"),
// 		Count:       1,
// 		Workers: map[game.WorkforceType]int{
// 			game.WorkforceTypeIntern: 5,
// 		},
// 	}

// 	assertFloatEquals(t, l.CalcEquipmentWorkforceProductivity(base.Equipment[game.EquipmentID("E1")]), 1.0, "E1 productivity")
// 	assertFloatEquals(t, l.CalcEquipmentWorkforceProductivity(base.Equipment[game.EquipmentID("E2")]), 0.5, "E2 productivity")
// }

// func TestBaseLogicUpdateBasic(t *testing.T) {
// 	logger.Init()
// 	base, l, t0 := setup()

// 	base.Equipment[game.EquipmentID("E1")] = game.BaseEquipment{
// 		EquipmentID: game.EquipmentID("E1"),
// 		Count:       2,
// 		Workers: map[game.WorkforceType]int{
// 			// 50% productivity
// 			game.WorkforceTypeIntern: 2,
// 			game.WorkforceTypeWorker: 1,
// 		},
// 	}

// 	base.Production = append(base.Production, game.BaseProductionItem{
// 		Template: game.RecipeID(0),
// 		IsActive: true,
// 	}, game.BaseProductionItem{
// 		Template: game.RecipeID(1),
// 		IsActive: true,
// 	})

// 	base.Inventory[game.CommodityID("a")] = 2
// 	base.Inventory[game.CommodityID("b")] = 2

// 	l.Update(t0.Add(5 * time.Minute))

// 	assertInventoryAmount(t, base.Inventory, "a", 0.0)
// 	assertInventoryAmount(t, base.Inventory, "b", 0.0)
// 	assertInventoryAmount(t, base.Inventory, "c", 0.0)
// 	assertInventoryAmount(t, base.Inventory, "d", 1.0)

// 	assert(t, !base.Production[0].IsActive, "production #0 should be stopped")
// 	assert(t, !base.Production[1].IsActive, "production #1 should be stopped")

// 	updatedMinutes := base.Updated.Sub(t0).Minutes()
// 	assertFloatEquals(t, updatedMinutes, 2.0, "updated time (m)")
// }

// func TestBaseLogicUpdateMultiplePoints(t *testing.T) {
// 	logger.Init()
// 	base, l, t0 := setup()

// 	base.Equipment[game.EquipmentID("E1")] = game.BaseEquipment{
// 		EquipmentID: game.EquipmentID("E1"),
// 		Count:       1,
// 		Workers: map[game.WorkforceType]int{
// 			// 20% productivity
// 			game.WorkforceTypeIntern: 2,
// 		},
// 	}

// 	base.Production = append(base.Production, game.BaseProductionItem{
// 		Template: game.RecipeID(0),
// 		IsActive: true,
// 	}, game.BaseProductionItem{
// 		Template: game.RecipeID(3),
// 		IsActive: true,
// 	})

// 	base.Inventory[game.CommodityID("a")] = 2
// 	base.Inventory[game.CommodityID("b")] = 2

// 	// 1. in the middle of the 1st span (500 seconds), where both recipes should be active
// 	l.Update(t0.Add(500 * time.Second))

// 	// inventory does not show points between updates, but this should have been it:
// 	// assertInventoryAmount(t, base, "a", 1.0)
// 	// assertInventoryAmount(t, base, "b", 1.0)
// 	// assertInventoryAmount(t, base, "c", 2.0/3.0)
// 	// assertInventoryAmount(t, base, "d", 1.0/3.0)

// 	assert(t, base.Production[0].IsActive, "production #0 should be running")
// 	assert(t, base.Production[1].IsActive, "production #1 should be running")

// 	assertFloatEquals(t, base.Updated.Sub(t0).Minutes(), 0, "1. updated time (m)")

// 	// 2. at the end of the 1st span (1000 seconds), where first recipe should just have been switched off
// 	l.Update(t0.Add(1000 * time.Second))

// 	assertInventoryAmount(t, base.Inventory, "a", 0.0)
// 	assertInventoryAmount(t, base.Inventory, "b", 0.0)
// 	assertInventoryAmount(t, base.Inventory, "c", 4.0/3.0)
// 	assertInventoryAmount(t, base.Inventory, "d", 2.0/3.0)

// 	assert(t, !base.Production[0].IsActive, "production #0 should be stopped")
// 	assert(t, base.Production[1].IsActive, "production #1 should be running")

// 	assertFloatEquals(t, base.Updated.Sub(t0).Seconds(), 1000, "2. updated time (s)")

// 	// 3. at the end of the 2nd span (1500 seconds), where first recipe should just have been switched off
// 	l.Update(time.Date(2025, time.January, 1, 12, 30, 0, 1, time.UTC))

// 	assertInventoryAmount(t, base.Inventory, "a", 0.0)
// 	assertInventoryAmount(t, base.Inventory, "b", 0.0)
// 	assertInventoryAmount(t, base.Inventory, "c", 0.0)
// 	assertInventoryAmount(t, base.Inventory, "d", 2.0)

// 	assert(t, !base.Production[0].IsActive, "production #0 should be stopped")
// 	assert(t, !base.Production[1].IsActive, "production #1 should be stopped")

// 	assertFloatEquals(t, base.Updated.Sub(t0).Minutes(), 30, "3. updated time (m)")
// }

// func TestBaseLogicUpdateMultiplePointsSkips(t *testing.T) {
// 	logger.Init()
// 	base, l, t0 := setup()

// 	base.Equipment[game.EquipmentID("E1")] = game.BaseEquipment{
// 		EquipmentID: game.EquipmentID("E1"),
// 		Count:       1,
// 		Workers: map[game.WorkforceType]int{
// 			// 20% productivity
// 			game.WorkforceTypeIntern: 2,
// 		},
// 	}

// 	base.Production = append(base.Production, game.BaseProductionItem{
// 		Template: game.RecipeID(0),
// 		IsActive: true,
// 	}, game.BaseProductionItem{
// 		Template: game.RecipeID(3),
// 		IsActive: true,
// 	})

// 	base.Inventory[game.CommodityID("a")] = 2
// 	base.Inventory[game.CommodityID("b")] = 2

// 	// 3. at the end of the 2nd span (1500 seconds), where first recipe should just have been switched off
// 	l.Update(t0.Add(30*time.Minute + time.Millisecond))

// 	assertInventoryAmount(t, base.Inventory, "a", 0.0)
// 	assertInventoryAmount(t, base.Inventory, "b", 0.0)
// 	assertInventoryAmount(t, base.Inventory, "c", 0.0)
// 	assertInventoryAmount(t, base.Inventory, "d", 2.0)

// 	assert(t, !base.Production[0].IsActive, "production #0 should be stopped")
// 	assert(t, !base.Production[1].IsActive, "production #1 should be stopped")

// 	assertFloatEquals(t, base.Updated.Sub(t0).Minutes(), 30, "updated time (m)")
// }

// func TestBaseLogicAlterInventory(t *testing.T) {
// 	logger.Init()
// 	base, l, t0 := setup()

// 	base.Equipment[game.EquipmentID("E1")] = game.BaseEquipment{
// 		EquipmentID: game.EquipmentID("E1"),
// 		Count:       1,
// 		Workers: map[game.WorkforceType]int{
// 			// 100% productivity
// 			game.WorkforceTypeIntern: 2,
// 			game.WorkforceTypeWorker: 1,
// 		},
// 	}

// 	base.Production = append(base.Production, game.BaseProductionItem{
// 		Template: game.RecipeID(0),
// 		IsActive: true,
// 	})

// 	// this should last 1 minute
// 	base.Inventory[game.CommodityID("a")] = 1
// 	base.Inventory[game.CommodityID("b")] = 2

// 	l.AlterInventory(t0.Add(30*time.Second), map[game.CommodityID]float64{
// 		game.CommodityID("a"): 10,
// 	})

// 	assertInventoryAmount(t, base.Inventory, "a", 10.5)
// 	assertInventoryAmount(t, base.Inventory, "b", 1.5)
// 	assertInventoryAmount(t, base.Inventory, "c", 0.5)

// 	l.Update(t0.Add(10 * time.Minute))

// 	assertInventoryAmount(t, base.Inventory, "a", 9.0)
// 	assertInventoryAmount(t, base.Inventory, "b", 0.0)
// 	assertInventoryAmount(t, base.Inventory, "c", 2.0)

// 	assert(t, !base.Production[0].IsActive, "production #0 should be stopped")

// 	assertFloatEquals(t, base.Updated.Sub(t0).Minutes(), 2.0, "updated time (m)")
// }

// func TestBaseLogicAlterInventoryRerunsStoppedProduction(t *testing.T) {
// 	logger.Init()
// 	base, l, t0 := setup()

// 	base.Equipment[game.EquipmentID("E1")] = game.BaseEquipment{
// 		EquipmentID: game.EquipmentID("E1"),
// 		Count:       1,
// 		Workers: map[game.WorkforceType]int{
// 			// 100% productivity
// 			game.WorkforceTypeIntern: 2,
// 			game.WorkforceTypeWorker: 1,
// 		},
// 	}

// 	base.Production = append(base.Production, game.BaseProductionItem{
// 		Template: game.RecipeID(0),
// 		IsActive: true,
// 	})

// 	// this should last 1 minute
// 	base.Inventory[game.CommodityID("a")] = 1
// 	base.Inventory[game.CommodityID("b")] = 1

// 	l.Update(t0.Add(2 * time.Minute))
// 	assert(t, !base.Production[0].IsActive, "production #0 should be stopped")
// 	assertInventoryAmount(t, base.Inventory, "a", 0)
// 	assertInventoryAmount(t, base.Inventory, "b", 0)
// 	assertInventoryAmount(t, base.Inventory, "c", 1)

// 	l.AlterInventory(t0.Add(3*time.Minute), map[game.CommodityID]float64{
// 		game.CommodityID("a"): 10,
// 		game.CommodityID("b"): 10,
// 	})

// 	assertInventoryAmount(t, base.Inventory, "a", 10)
// 	assertInventoryAmount(t, base.Inventory, "b", 10)
// 	assertInventoryAmount(t, base.Inventory, "c", 1)

// 	l.Update(t0.Add(4 * time.Minute))
// 	l.InsertManualPoint(t0.Add(4 * time.Minute))

// 	assert(t, base.Production[0].IsActive, "production #0 should be running")
// 	assertInventoryAmount(t, base.Inventory, "a", 9)
// 	assertInventoryAmount(t, base.Inventory, "b", 9)
// 	assertInventoryAmount(t, base.Inventory, "c", 2)
// }

// func TestBaseLogicPartialProduction(t *testing.T) {
// 	logger.Init()
// 	base, l, t0 := setup()

// 	base.Equipment[game.EquipmentID("E1")] = game.BaseEquipment{
// 		EquipmentID: game.EquipmentID("E1"),
// 		Count:       1,
// 		Workers: map[game.WorkforceType]int{
// 			// 100% productivity
// 			game.WorkforceTypeIntern: 2,
// 			game.WorkforceTypeWorker: 1,
// 		},
// 	}

// 	base.Production = append(
// 		base.Production,
// 		// 20% a,b -> c [1m]
// 		game.BaseProductionItem{
// 			Template: game.RecipeID(0),
// 			IsActive: true,
// 		},
// 		// 80% c -> d [2m] == 0.5c -> 0.5d [1m]
// 		game.BaseProductionItem{
// 			Template: game.RecipeID(3),
// 			IsActive: true,
// 		},
// 		// total:
// 		// a,b: -0.2/m
// 		// c: +0.2/m -0.4/m => c->d recipe should run on 50% efficiency
// 	)

// 	base.Inventory[game.CommodityID("a")] = 1
// 	base.Inventory[game.CommodityID("b")] = 1

// 	l.Update(t0.Add(time.Minute))
// 	assert(t, base.Production[0].IsActive, "production #0 should be running")
// 	assert(t, base.Production[1].IsActive, "production #0 should be running")

// 	l.Update(t0.Add(5*time.Minute + time.Millisecond))
// 	assertInventoryAmount(t, base.Inventory, "a", 9)
// 	assertInventoryAmount(t, base.Inventory, "b", 9)
// 	assertInventoryAmount(t, base.Inventory, "c", 2)
// }

// func setup() (*game.BaseData, *gamelogic.BaseUpdatesLogic, time.Time) {
// 	base := &game.BaseData{
// 		ID:         game.BaseID(1),
// 		Created:    time.Date(2025, time.January, 1, 10, 0, 0, 0, time.UTC),
// 		Operator:   game.CompanyID("company"),
// 		WorldID:    game.CelestialID("AA-000a"),
// 		TileID:     game.TileID(0),
// 		Equipment:  make(map[game.EquipmentID]game.BaseEquipment),
// 		Sites:      make([]game.BaseConstructionSite, 0),
// 		Production: make([]game.BaseProductionItem, 0),
// 		Inventory:  make(map[game.CommodityID]float64),
// 		Updated:    time.Date(2025, time.January, 1, 12, 0, 0, 0, time.UTC),
// 	}
// 	l := gamelogic.NewBaseUpdatesLogic(base)
// 	l.MockRegistry(setUpMockRegistry())

// 	return base, l, time.Date(2025, time.January, 1, 12, 0, 0, 0, time.UTC)
// }

// func setUpMockRegistry() *globaldata.CraftingRegistry {
// 	mockr := globaldata.NewMockCraftingRegistry(
// 		&assets.CommoditiesAsset{
// 			Commodities: map[string]assets.CommodityData{
// 				"a": {
// 					Category: "1",
// 					Mass:     1,
// 					Volume:   1,
// 				},
// 				"b": {
// 					Category: "1",
// 					Mass:     0.5,
// 					Volume:   1,
// 				},
// 				"c": {
// 					Category: "2",
// 					Mass:     2,
// 					Volume:   1,
// 				},
// 				"d": {
// 					Category: "2",
// 					Mass:     1,
// 					Volume:   1,
// 				},
// 			},
// 			Resources:      map[string]assets.ResourceData{},
// 			WGMaterialsMap: map[string]string{},
// 		},
// 		&assets.EquipmentAsset{
// 			Buildings: map[string]assets.EquipmentAssetBuilding{
// 				"B": {
// 					MatsPerArea: map[string]float64{
// 						"a": 1,
// 					},
// 				},
// 			},
// 			Equipment: map[string]assets.EquipmentAssetEquipment{
// 				"E1": {
// 					Building: "B",
// 					Area:     10,
// 					Operators: map[string]assets.EquipmentAssetEquipmentOperators{
// 						"intern": {Count: 2, Contribution: 0.1},
// 						"worker": {Count: 1, Contribution: 0.8},
// 					},
// 				},
// 				"E2": {
// 					Building: "B",
// 					Area:     200,
// 					Operators: map[string]assets.EquipmentAssetEquipmentOperators{
// 						"intern":   {Count: 5, Contribution: 10},
// 						"worker":   {Count: 2, Contribution: 15},
// 						"engineer": {Count: 1, Contribution: 20},
// 					},
// 				},
// 			},
// 		},
// 		&assets.RecipesAsset{
// 			Recipes: []assets.RecipesAssetRecipe{
// 				{
// 					Equipment: "E1",
// 					Inputs:    map[string]float64{"a": 1, "b": 1},
// 					Outputs:   map[string]float64{"c": 1},
// 					BaseTime:  "1m",
// 				},
// 				{
// 					Equipment: "E1",
// 					Inputs:    map[string]float64{"a": 1, "b": 1, "c": 1},
// 					Outputs:   map[string]float64{"d": 1},
// 					BaseTime:  "1m",
// 				},
// 				{
// 					Equipment: "E2",
// 					Inputs:    map[string]float64{"a": 1, "b": 1},
// 					Outputs:   map[string]float64{"c": 1, "d": 1},
// 					BaseTime:  "1m",
// 				},
// 				{
// 					Equipment: "E1",
// 					Inputs:    map[string]float64{"c": 1},
// 					Outputs:   map[string]float64{"d": 1},
// 					BaseTime:  "2m",
// 				},
// 			},
// 		},
// 	)

// 	return mockr
// }
