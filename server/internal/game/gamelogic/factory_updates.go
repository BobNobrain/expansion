package gamelogic

import (
	"math"
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
	success := false
	hasUpdated := false
	for range 500 {
		nextUpdate := l.calculateNextUpdate(*f)

		if !nextUpdate.isDue(f.UpdatedTo, now) {
			// next update is yet to happen (relative to provided `now` value)
			success = true
			break
		}

		// apply the update
		hasUpdated = true
		nextUpdate.apply(f)
	}

	if !success {
		panic("too much updates have happened")
	}

	return hasUpdated
}

func (l *FactoryUpdatesLogic) GetDynamicInventory(f game.Factory) game.DynamicInventory {
	nextUpdate := l.calculateNextUpdate(f)
	inventory := game.MakeDynamicInventoryFrom(f.StaticInventory, nextUpdate.speeds, f.UpdatedTo, time.Hour)
	if !nextUpdate.isNever() {
		inventory.SetLimits(nextUpdate.getUpdateTime(f.UpdatedTo))
	}

	return inventory
}

func (l *FactoryUpdatesLogic) forceUpdate(f *game.Factory, to time.Time) {
	f.StaticInventory = f.DynamicInventory.Sample(to)
	f.UpdatedTo = to
}

func (l *FactoryUpdatesLogic) WithdrawItems(f *game.Factory, items game.InventoryDelta, now time.Time) bool {
	inventory := l.GetDynamicInventory(*f)
	snapshot := inventory.Sample(now)
	success := snapshot.Remove(items)
	if !success {
		return false
	}

	f.StaticInventory = snapshot
	f.UpdatedTo = now
	return true
}

func (l *FactoryUpdatesLogic) calculateNextUpdate(f game.Factory) *factoryUpdate {
	result := &factoryUpdate{}
	result.calculateSpeeds(f)
	result.calculateNextUpdateTime(f)
	return result
}

type factoryUpdate struct {
	deltaHours float64
	reason     factoryUpdateReason
	speeds     map[game.CommodityID]float64
}

func (u *factoryUpdate) calculateSpeeds(f game.Factory) {
	u.speeds = make(map[game.CommodityID]float64)

	for _, eq := range f.Equipment {
		totalManualEfficiencies := 0.0
		for _, production := range eq.Production {
			totalManualEfficiencies += production.ManualEfficiency
		}

		// cannot move the whole calculation to just a method of game.Factory,
		// because it needs the workforce efficiency calculation
		wfEfficiency := 1.0 // TODO: calculate workforce efficiency

		eqEff := float64(eq.Count) * wfEfficiency / totalManualEfficiencies

		for _, production := range eq.Production {
			eff := eqEff * production.ManualEfficiency

			for cid, delta := range production.Recipe.Inputs {
				u.speeds[cid] -= delta * eff
			}
			for cid, delta := range production.Recipe.Outputs {
				u.speeds[cid] += delta * eff
			}
		}
	}
}

// Calculates next time an update should happen to the fabric state.
// An update can be caused by:
//
// - an input running out
//
// - storage overflow (TBD)
//
// - other similar reasons (to be decided in future)
func (u *factoryUpdate) calculateNextUpdateTime(f game.Factory) {
	if !f.Status.IsActive() {
		u.deltaHours = math.Inf(1) // never
		return
	}

	minHoursUntilOut := math.Inf(1)
	for cid, speed := range u.speeds {
		if speed >= 0 {
			continue
		}

		amount := f.StaticInventory.GetAmount(cid)
		if amount <= 0 {
			minHoursUntilOut = 0
			break
		}

		hoursUntilOut := amount / -speed
		minHoursUntilOut = min(minHoursUntilOut, hoursUntilOut)
	}

	// TODO: account for storage overflow

	u.deltaHours = minHoursUntilOut
	u.reason = factoryUpdateReasonOutOfInputs
}

func (u *factoryUpdate) isDue(lastUpdate time.Time, now time.Time) bool {
	if math.IsInf(u.deltaHours, 1) || u.reason == factoryUpdateReasonNone {
		return false
	}

	return now.Sub(lastUpdate).Hours() < u.deltaHours
}
func (u *factoryUpdate) isNever() bool {
	return math.IsInf(u.deltaHours, 1) && u.reason == factoryUpdateReasonNone
}

func (u *factoryUpdate) getUpdateTime(lastUpdate time.Time) time.Time {
	return lastUpdate.Add(time.Duration(float64(time.Hour) * u.deltaHours))
}

func (u *factoryUpdate) apply(f *game.Factory) {
	for cid, speed := range u.speeds {
		f.StaticInventory.AlterAmount(cid, speed*u.deltaHours)
	}

	f.UpdatedTo = u.getUpdateTime(f.UpdatedTo)

	if u.reason.shouldHaltFactory() && f.Status.IsActive() {
		f.Status = game.FactoryProductionStatusHalted
	}
}
