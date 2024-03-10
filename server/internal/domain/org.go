package domain

import "srv/internal/utils/common"

type OrgID string

type Org struct {
	ID      OrgID
	Name    string
	Ticker  string
	OwnerID UserID
}

type OrgRepo interface {
	GetByID(OrgID) (*Org, common.Error)
}
