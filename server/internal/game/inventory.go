package game

import (
	"math"
	"srv/internal/utils"
)

type Inventory map[CommodityID]float64

const CommodityAmountPrecision float64 = 1e-9

func MakeEmptyInventory() Inventory {
	return Inventory{}
}

func MakeInventoryFrom(data map[string]float64) Inventory {
	result := Inventory{}
	for key, amount := range data {
		result.SetAmount(CommodityID(key), amount)
	}
	return result
}

func (i Inventory) GetAmount(cid CommodityID) float64 {
	return max(0.0, i[cid])
}

func (i Inventory) SetAmount(cid CommodityID, amt float64) {
	if amt > 0.0 {
		i[cid] = amt
	} else {
		delete(i, cid)
	}
}

func (i Inventory) AlterAmount(cid CommodityID, delta float64) {
	i.SetAmount(cid, max(0.0, i[cid]+delta))
}

func (i Inventory) Add(delta InventoryDelta) bool {
	return i.applyDelta(delta, 1)
}
func (i Inventory) Remove(delta InventoryDelta) bool {
	return i.applyDelta(delta, -1)
}
func (i Inventory) applyDelta(delta InventoryDelta, multiplier float64) bool {
	result := make(map[CommodityID]float64)

	for cid, amount := range delta {
		sum := i[cid] + amount*multiplier
		if sum < 0.0 {
			return false
		}

		result[cid] = sum
	}

	for cid, amount := range result {
		i.SetAmount(cid, amount)
	}
	return true
}

func (i Inventory) GetDeltaTo(target Inventory) InventoryDelta {
	result := MakeEmptyInventoryDelta()

	for cid, amount := range target {
		result[cid] = amount
	}
	for cid, amount := range i {
		result[cid] -= amount
	}

	return result
}

func (i Inventory) ToMap() map[string]float64 {
	result := make(map[string]float64)
	for cid, amount := range i {
		result[string(cid)] = amount
	}
	return result
}

func (i Inventory) Clone() Inventory {
	return MakeInventoryFrom(i.ToMap())
}

func (subset Inventory) IsSubsetOf(superset Inventory) bool {
	for cid, amount := range subset {
		if amount > superset[cid]+CommodityAmountPrecision {
			return false
		}
	}

	return true
}

type InventoryDelta map[CommodityID]float64

func MakeEmptyInventoryDelta() InventoryDelta {
	return InventoryDelta{}
}
func MakeInventoryDeltaFrom(data map[string]float64) InventoryDelta {
	return InventoryDelta(utils.ConvertStringKeys[string, CommodityID](data))
}

func (d InventoryDelta) ToMap() map[string]float64 {
	result := make(map[string]float64)
	for cid, amount := range d {
		result[string(cid)] = amount
	}
	return result
}

func (d InventoryDelta) IsEmpty() bool {
	for _, amount := range d {
		if math.Abs(amount) >= CommodityAmountPrecision {
			return false
		}
	}

	return true
}
func (d InventoryDelta) IsPositive() bool {
	for _, amount := range d {
		if amount < 0 {
			return false
		}
	}

	return true
}
