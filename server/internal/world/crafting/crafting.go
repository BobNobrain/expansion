package crafting

import "srv/internal/utils/phys"

type CommodityID string

type Commodity struct {
	CommodityID CommodityID
	Mass        phys.Mass
	Volume      phys.Volume
	IsQuantized bool
}

func (c Commodity) IsNil() bool {
	return len(c.CommodityID) == 0
}
