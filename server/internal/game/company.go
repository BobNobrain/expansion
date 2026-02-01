package game

import (
	"srv/internal/domain"
	"time"
)

type CompanyID string

func (oid CompanyID) IsValid() bool {
	return len(oid) > 0
}

type Company struct {
	ID      CompanyID
	Name    string
	OwnerID domain.UserID
	Est     time.Time
	Logo    []any
}
