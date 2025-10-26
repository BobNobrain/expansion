package api

import "time"

const (
	CompaniesQueryTypeByOwner = "byOwner"
)

type CompaniesQueryByOwner struct {
	OwnerID string `json:"ownerId"`
}

type CompaniesTableRow struct {
	CompanyID string    `json:"id"`
	OwnerID   string    `json:"owner"`
	Name      string    `json:"name"`
	Created   time.Time `json:"est"`
}
