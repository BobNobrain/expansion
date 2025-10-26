package gamelogic

import (
	"math"
	"srv/internal/game"
	"srv/internal/globals/globaldata"
	"time"
)

type FactoryUpdatesLogic struct {
	factory *game.Factory
	reg     *globaldata.CraftingRegistry

	speeds map[game.CommodityID]float64
}

type factoryUpdatePoint struct {
	deltaHours float64
	reason     factoryUpdateReason
	// t          time.Time
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

func (fup factoryUpdatePoint) isNever() bool {
	return math.IsInf(fup.deltaHours, 1)
}

func NewFactoryUpdatesLogic(factory *game.Factory) *FactoryUpdatesLogic {
	return &FactoryUpdatesLogic{
		factory: factory,
		reg:     globaldata.Crafting(),
	}
}

func (l *FactoryUpdatesLogic) MockRegistry(reg *globaldata.CraftingRegistry) {
	l.reg = reg
}

func (l *FactoryUpdatesLogic) RunAutomaticUpdates(now time.Time) {
	success := false
	for range 500 {
		nextUpdate := l.calculateNextUpdateTime()

		if nextUpdate.isNever() || now.Sub(l.factory.Updated).Hours() < nextUpdate.deltaHours {
			// next update is yet to happen (relative to provided `now` value)
			success = true
			break
		}

		l.actualizeInventory(nextUpdate.deltaHours)
		l.factory.Updated = l.factory.Updated.Add(time.Duration(float64(time.Hour) * nextUpdate.deltaHours))

		if nextUpdate.reason.shouldHaltFactory() && l.factory.Status.IsActive() {
			l.factory.Status = game.FactoryStatusHalted
		}
	}

	if !success {
		panic("too much updates have happened")
	}

	// TODO:
	// 1. update inventory to nextUpdate.t
	// 2. update factory status
	// 3. repeat until nextUpdate.t > now (or nextUpdate.isNever())
}

// calculates inventory change speeds (per hour), regardless of whether the factory is actually running
func (l *FactoryUpdatesLogic) calculateSpeeds() {
	l.speeds = make(map[game.CommodityID]float64)

	for _, eq := range l.factory.Equipment {
		wfEfficiency := 1.0 // TODO: calculate workforce efficiency
		eqEff := float64(eq.Count) * wfEfficiency

		for rid, production := range eq.Production {
			recipe := l.reg.GetRecipe(rid)
			timeEff := float64(time.Hour.Milliseconds()) / float64(recipe.BaseDuration.Milliseconds())
			eff := eqEff * production.ManualEfficiency * timeEff

			for cid, delta := range recipe.StaticInputs {
				l.speeds[cid] -= delta * eff
			}
			for cid, delta := range recipe.StaticOutputs {
				l.speeds[cid] += delta * eff
			}
			for cid, delta := range production.DynamicOutputs {
				l.speeds[cid] += delta * eff
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
func (l *FactoryUpdatesLogic) calculateNextUpdateTime() factoryUpdatePoint {
	if !l.factory.Status.IsActive() {
		return factoryUpdatePoint{deltaHours: math.Inf(1)} // never
	}

	if l.speeds == nil {
		l.calculateSpeeds()
	}

	minHoursUntilOut := math.Inf(1)
	for cid, speed := range l.speeds {
		if speed >= 0 {
			continue
		}

		amount := l.factory.Inventory.GetAmount(cid)
		if amount <= 0 {
			minHoursUntilOut = 0
			break
		}

		hoursUntilOut := amount / -speed
		minHoursUntilOut = min(minHoursUntilOut, hoursUntilOut)
	}

	// TODO: account for storage overflow

	return factoryUpdatePoint{deltaHours: minHoursUntilOut, reason: factoryUpdateReasonOutOfInputs}
}

// Recalculates inventory up to given time, using l.speeds.
//
// It truncates any negative amounts back to zero and does not perform any intermediate state updates.
//
// If factory is not active, or deltaHours <= 0, no changes are made.
//
// Warning! This function does not set factory update time, this should be done manually!
func (l *FactoryUpdatesLogic) actualizeInventory(deltaHours float64) {
	if !l.factory.Status.IsActive() {
		return
	}

	if deltaHours <= 0 {
		return
	}

	if l.speeds == nil {
		l.calculateSpeeds()
	}

	for cid, speed := range l.speeds {
		l.factory.Inventory.AlterAmount(cid, l.factory.Inventory[cid]+speed*deltaHours)
	}
}
