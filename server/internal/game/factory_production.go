package game

import (
	"math"
	"time"
)

type fppEndReason byte

const (
	fppEndReasonNone fppEndReason = iota
	fppEndReasonManual
	fppEndReasonInputs
	fppEndReasonStorage
)

type FactoryProductionStatus byte

const (
	// The factory has been manually disabled and should not be automatically turned back on
	FactoryProductionStatusDisabled FactoryProductionStatus = iota
	// The factory is running, producing outputs and consuming inputs
	FactoryProductionStatusActive
	// The factory is being prevented from functioning properly (due to lack of inputs, storage, etc). Should the issues
	// be resolved, it will become active again.
	FactoryProductionStatusHalted
)

// Returns true for any factory status that permits factory operation (i.e. its production running)
func (s FactoryProductionStatus) IsActive() bool {
	return s == FactoryProductionStatusActive
}

func (s FactoryProductionStatus) String() string {
	switch s {
	case FactoryProductionStatusDisabled:
		return "disabled"
	case FactoryProductionStatusActive:
		return "active"
	case FactoryProductionStatusHalted:
		return "halted"
	default:
		return ""
	}
}
func ParseFactoryStatus(s string) FactoryProductionStatus {
	switch s {
	case "disabled":
		return FactoryProductionStatusDisabled
	case "active":
		return FactoryProductionStatusActive
	case "halted":
		return FactoryProductionStatusHalted
	default:
		return FactoryProductionStatusDisabled
	}
}

type FactoryProductionPeriod struct {
	start     time.Time
	end       time.Time
	status    FactoryProductionStatus
	inventory Inventory
	speeds    InventoryDelta
	endReason fppEndReason
	// inventoryLimits StorageSize
}

func (period FactoryProductionPeriod) Start() time.Time {
	return period.start
}

func (period FactoryProductionPeriod) IsInfinite() bool {
	return period.end.IsZero()
}

func (period FactoryProductionPeriod) NeedsUpdate(now time.Time) bool {
	return !period.IsInfinite() && period.end.Before(now)
}

func (period FactoryProductionPeriod) GetStartingInventory() Inventory {
	return period.inventory
}

func (period FactoryProductionPeriod) Status() FactoryProductionStatus {
	return period.status
}

func (period FactoryProductionPeriod) CalculateInventoryAt(at time.Time) Inventory {
	if period.speeds.IsEmpty() {
		return period.inventory.Clone()
	}

	deltaHours := at.Sub(period.start).Hours()
	result := period.inventory.Clone()
	result.applyDelta(period.speeds, deltaHours)
	return result
}

func (period FactoryProductionPeriod) GetDynamicInventory() DynamicInventory {
	return MakeDynamicInventoryFrom(period.inventory, period.speeds, period.start, time.Hour)
}

func (period FactoryProductionPeriod) Next() FactoryProductionPeriod {
	result := FactoryProductionPeriod{
		start:     period.end,
		end:       time.Time{},
		status:    FactoryProductionStatusHalted,
		inventory: period.CalculateInventoryAt(period.end),
		speeds:    MakeEmptyInventoryDelta(),
		endReason: fppEndReasonNone,
	}

	return result
}

func (period FactoryProductionPeriod) SplitAt(t time.Time) (FactoryProductionPeriod, FactoryProductionPeriod) {
	firstHalf := period
	firstHalf.end = t
	firstHalf.endReason = fppEndReasonManual

	secondHalf := period
	secondHalf.start = t
	secondHalf.inventory = period.CalculateInventoryAt(t)

	return firstHalf, secondHalf
}

func (period FactoryProductionPeriod) AlterConfiguration(at time.Time, eqs []FactoryEquipment) FactoryProductionPeriod {
	return MakeFactoryProductionPeriodFrom(at, eqs, period.CalculateInventoryAt(at))
}

func (period FactoryProductionPeriod) calcEnd() (time.Time, fppEndReason) {
	minHoursUntilOut := math.Inf(1)
	for cid, speed := range period.speeds {
		if speed >= 0 {
			continue
		}

		amount := period.inventory.GetAmount(cid)
		if amount <= 0 {
			return period.start, fppEndReasonInputs
		}

		hoursUntilOut := amount / -speed
		minHoursUntilOut = min(minHoursUntilOut, hoursUntilOut)
	}

	if math.IsInf(minHoursUntilOut, 1) {
		return time.Time{}, fppEndReasonNone
	}

	return period.start.Add(time.Duration(minHoursUntilOut * float64(time.Hour))), fppEndReasonInputs
}

func MakeEmptyFactoryProductionPeriod(
	start time.Time,
) FactoryProductionPeriod {
	return FactoryProductionPeriod{
		start:     start,
		status:    FactoryProductionStatusActive,
		inventory: MakeEmptyInventory(),
		speeds:    MakeEmptyInventoryDelta(),
	}
}

func MakeFactoryProductionPeriodFrom(
	start time.Time,
	eqs []FactoryEquipment,
	startingInventory Inventory,
) FactoryProductionPeriod {
	speeds := MakeEmptyInventoryDelta()

	for _, eq := range eqs {
		totalManualEfficiencies := 0.0
		for _, production := range eq.Production {
			totalManualEfficiencies += production.ManualEfficiency
		}

		wfEfficiency := 1.0 // TODO: calculate workforce efficiency

		eqEff := float64(eq.Count) * wfEfficiency / totalManualEfficiencies

		for _, production := range eq.Production {
			eff := eqEff * production.ManualEfficiency

			for cid, delta := range production.Recipe.Inputs {
				speeds[cid] -= delta * eff
			}
			for cid, delta := range production.Recipe.Outputs {
				speeds[cid] += delta * eff
			}
		}
	}

	status := FactoryProductionStatusActive
	for cid, speed := range speeds {
		if speed >= 0.0 {
			continue
		}

		amt := startingInventory[cid]
		if amt <= 0.0 {
			status = FactoryProductionStatusHalted
			break
		}
	}

	result := FactoryProductionPeriod{
		start:     start,
		status:    status,
		speeds:    speeds,
		inventory: startingInventory,
	}

	result.end, result.endReason = result.calcEnd()

	return result
}
