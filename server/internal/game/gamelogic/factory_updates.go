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

func (l *FactoryUpdatesLogic) WithdrawItems(f *game.Factory, items game.InventoryDelta, now time.Time) bool {
	_, after := f.Production.SplitAt(now)
	hasSuccesfullyWithdrawn := after.GetStartingInventory().Remove(items)
	if !hasSuccesfullyWithdrawn {
		return false
	}

	f.Production = after
	return true
}

// type factoryUpdate struct {
// 	deltaHours float64
// 	reason     factoryUpdateReason
// 	speeds     map[game.CommodityID]float64
// }

// func (u *factoryUpdate) calculateSpeeds(f game.Factory) {
// 	u.speeds = make(map[game.CommodityID]float64)

// 	for _, eq := range f.Equipment {
// 		totalManualEfficiencies := 0.0
// 		for _, production := range eq.Production {
// 			totalManualEfficiencies += production.ManualEfficiency
// 		}

// 		// cannot move the whole calculation to just a method of game.Factory,
// 		// because it needs the workforce efficiency calculation
// 		wfEfficiency := 1.0 // TODO: calculate workforce efficiency

// 		eqEff := float64(eq.Count) * wfEfficiency / totalManualEfficiencies

// 		for _, production := range eq.Production {
// 			eff := eqEff * production.ManualEfficiency

// 			for cid, delta := range production.Recipe.Inputs {
// 				u.speeds[cid] -= delta * eff
// 			}
// 			for cid, delta := range production.Recipe.Outputs {
// 				u.speeds[cid] += delta * eff
// 			}
// 		}
// 	}
// }

// func (u *factoryUpdate) isDue(lastUpdate time.Time, now time.Time) bool {
// 	if math.IsInf(u.deltaHours, 1) || u.reason == factoryUpdateReasonNone {
// 		return false
// 	}

// 	return now.Sub(lastUpdate).Hours() < u.deltaHours
// }
// func (u *factoryUpdate) isNever() bool {
// 	return math.IsInf(u.deltaHours, 1) && u.reason == factoryUpdateReasonNone
// }

// func (u *factoryUpdate) getUpdateTime(lastUpdate time.Time) time.Time {
// 	return lastUpdate.Add(time.Duration(float64(time.Hour) * u.deltaHours))
// }
