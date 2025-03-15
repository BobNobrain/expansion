package world

import "srv/internal/world/crafting"

type ResourceID string

type ResourceDeposit struct {
	ResourceID ResourceID
	Abundance  float64
}

type ResourceData struct {
	ResourceID    ResourceID
	CommodityID   crafting.CommodityID
	Abundance     float64
	Veins         float64
	IsFertileOnly bool
}

func (r ResourceData) IsNil() bool {
	return len(r.ResourceID) == 0
}
