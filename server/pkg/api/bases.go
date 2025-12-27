package api

import "time"

const BasesTableName = "bases"

const (
	BasesQueryTypeByLocation = "bases/byLocation"
)

type BasesQueryByLocation struct {
	WorldID string `json:"worldId"`
	TileID  int    `json:"tileId"`
}

type BasesTableRow struct {
	BaseID    int    `json:"id"`
	WorldID   string `json:"worldId"`
	TileID    int    `json:"tileId"`
	CompanyID string `json:"companyId"`
	CityID    int    `json:"cityId"`

	CreatedAt time.Time `json:"established"`

	Storage BasesTableRowStorage `json:"storage"`
}

type BasesTableRowStorage struct {
	Inventory map[string]float64 `json:"inventory"`
}

const (
	BaseOverviewsQueryTypeByCompanyID = "base_overviews/byCompanyId"
	BaseOverviewsQueryTypeByBranch    = "base_overviews/byBranch"
)

const BaseOverviewsTableName = "base_overviews"

type BaseOverviewsQueryByCompanyID struct {
	CompanyID string `json:"companyId"`
}
type BaseOverviewsQueryByBranch struct {
	CompanyID string `json:"companyId"`
	WorldID   string `json:"worldId"`
}

type BaseOverviewsTableRow struct {
	BaseID     int    `json:"id"`
	WorldID    string `json:"worldId"`
	TileID     int    `json:"tileId"`
	CompanyID  string `json:"companyId"`
	CityID     int    `json:"cityId"`
	NFactories int    `json:"nFactories"`

	CreatedAt time.Time `json:"established"`
}
