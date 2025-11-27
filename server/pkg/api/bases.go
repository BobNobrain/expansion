package api

import "time"

const (
	BasesQueryTypeByCompanyID = "byCompanyId"
	BasesQueryTypeByBranch    = "byBranch"
	BasesQueryTypeByLocation  = "byLocation"
)

type BasesQueryByCompanyID struct {
	CompanyID string `json:"companyId"`
}
type BasesQueryByBranch struct {
	CompanyID string `json:"companyId"`
	WorldID   string `json:"worldId"`
}
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

	ConstructionSites []BasesTableRowSite  `json:"constructionSites"`
	Storage           BasesTableRowStorage `json:"storage"`
}

type BasesTableRowSite struct {
	Target       []FactoriesTableRowEquipment `json:"target"`
	Contribution Contribution                 `json:"contribution"`
}

type BasesTableRowStorage struct {
	Inventory map[string]float64 `json:"inventory"`
}
