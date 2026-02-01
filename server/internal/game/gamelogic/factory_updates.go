package gamelogic

import (
	"srv/internal/game"
	"srv/internal/globals/globaldata"
	"time"
)

type FactoryUpdatesLogic struct {
	reg *globaldata.CraftingRegistry
}

type factoryUpdateReason byte

const (
	factoryUpdateReasonNone factoryUpdateReason = iota
	factoryUpdateReasonOutOfInputs
	factoryUpdateReasonOutOfStorage
)

func (r factoryUpdateReason) shouldHaltFactory() bool {
	return r != factoryUpdateReasonNone
}

var globalFactoryUpdatesLogic *FactoryUpdatesLogic

func FactoryUpdates() *FactoryUpdatesLogic {
	if globalFactoryUpdatesLogic == nil {
		globalFactoryUpdatesLogic = &FactoryUpdatesLogic{
			reg: globaldata.Crafting(),
		}
	}
	return globalFactoryUpdatesLogic
}

func FactoryUpdatesMocked(reg *globaldata.CraftingRegistry) *FactoryUpdatesLogic {
	return &FactoryUpdatesLogic{
		reg: reg,
	}
}

func (l *FactoryUpdatesLogic) UpdateTo(f *game.Factory, now time.Time) bool {
	const maxUpdatesInARow = 10 // actually, 2 should be enough, but let's play it safe

	success := false
	hasUpdated := false

	for range maxUpdatesInARow {
		if !f.Production.NeedsUpdate(now) {
			success = true
			break
		}

		f.Production = f.Production.Next()
		hasUpdated = true
	}

	if !success {
		panic("too much updates have happened")
	}

	return hasUpdated
}

func (l *FactoryUpdatesLogic) AddItems(f *game.Factory, items game.InventoryDelta, now time.Time) bool {
	_, after := f.Production.SplitAt(now)
	inv := after.GetStartingInventoryClone()

	ok := inv.Add(items)
	if !ok {
		return false
	}
	f.Production = after.WithStartingInventory(inv)
	return true
}

func (l *FactoryUpdatesLogic) WithdrawItems(f *game.Factory, items game.InventoryDelta, now time.Time) game.InventoryDelta {
	_, after := f.Production.SplitAt(now)
	inv := after.GetStartingInventoryClone()

	factualDelta := inv.RemoveAsMuchAsPossible(items)

	f.Production = after.WithStartingInventory(inv)
	return factualDelta
}

func (l *FactoryUpdatesLogic) GetDemolishInventory(f game.Factory, at time.Time) game.InventoryDelta {
	// when demolishing a factory, we should get back:
	// 1. its current inventory
	result := f.Production.CalculateInventoryAt(at).ToDelta()

	// 2. equipment and building parts from its current production lines
	for _, eq := range f.Equipment {
		result.Add(Construction().GetConstructionCosts(eq.EquipmentID, eq.Count), 1)
	}

	// 3. everything we have contributed to its upgrade so far
	for _, contribution := range f.Upgrade.Progress {
		result.Add(contribution.AmountsProvided, 1)
	}

	return result
}
