package game

type Inventory map[CommodityID]float64

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

func (i Inventory) ToMap() map[string]float64 {
	result := make(map[string]float64)
	for cid, amount := range i {
		result[string(cid)] = amount
	}
	return result
}
