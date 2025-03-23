package game

import (
	"srv/internal/domain"
	"time"
)

type CompanyID string

type CompanyOverview struct {
	ID      CompanyID
	Name    string
	OwnerID domain.UserID
	Est     time.Time
	NBases  int
}

type CompanyData struct {
	ID      CompanyID
	Name    string
	OwnerID domain.UserID
	Est     time.Time
	Bases   []CompanyBase
}

type CompanyBase struct {
	ID      BaseID
	Created time.Time
	WorldID CelestialID
	// A share of base area that is in use, 0-1
	DevelopedArea float64
}

type BaseID string

type BaseOverview struct {
	ID            BaseID
	Created       time.Time
	WorldID       CelestialID
	OwnerID       domain.UserID
	DevelopedArea float64
}
