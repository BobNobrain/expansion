package game

import (
	"srv/internal/domain"
	"time"
)

type CompanyID string

type Company struct {
	ID      CompanyID
	Name    string
	OwnerID domain.UserID
	Est     time.Time
	Logo    []any
}
