package world

type ResourceID string

type ResourceDeposit struct {
	ResourceID ResourceID
	Abundance  float64
}
