package domain

type OrgID string

type Org struct {
	ID      OrgID
	Name    string
	Ticker  string
	OwnerID UserID
}
