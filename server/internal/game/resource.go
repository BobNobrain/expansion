package game

type ResourceID string

func (r ResourceID) IsNil() bool {
	return len(r) == 0
}

type ResourceDeposit struct {
	ResourceID ResourceID
	Abundance  float64
}

type ResourceData struct {
	ResourceID    ResourceID
	CommodityID   CommodityID
	Abundance     float64
	Veins         float64
	IsFertileOnly bool
}

func (r ResourceData) IsNil() bool {
	return len(r.ResourceID) == 0
}
