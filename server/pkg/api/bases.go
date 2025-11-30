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

	DynamicRecipes []BasesTableRowRecipe `json:"dynamicRecipes,omitempty"`
}

type BasesTableRowSite struct {
	ID           int                          `json:"id"`
	Target       []FactoriesTableRowEquipment `json:"target"`
	Contribution Contribution                 `json:"contribution"`
}

type BasesTableRowStorage struct {
	Inventory map[string]float64 `json:"inventory"`
}

type BasesTableRowRecipe struct {
	RecipeID    string             `json:"id"`
	Inputs      map[string]float64 `json:"inputs"`
	Outputs     map[string]float64 `json:"outputs"`
	EquipmentID string             `json:"equipment"`
}
