package api

import "time"

const (
	FactoriesQueryTypeByBaseID = "factories/byBaseId"
)

const (
	FactoriesTableName = "factories"
)

type FactoriesQueryByBaseID struct {
	BaseID int `json:"baseId"`
}

type FactoriesTableRow struct {
	FactoryID int    `json:"id"`
	BaseID    int    `json:"baseId"`
	Status    string `json:"status"`

	CreatedAt time.Time `json:"created"`
	UpdatedTo time.Time `json:"updatedTo"`

	Equipment []FactoriesTableRowEquipment `json:"equipment"`

	Inventory map[string]float64 `json:"inventory"`
	Employees map[string]int     `json:"employees"`

	UpgradeTarget       []FactoriesTableRowEquipmentPlan `json:"upgradeTarget,omitempty"`
	UpgradeContribution Contribution                     `json:"upgradeContribution,omitempty"`
	UpgradeLastUpdated  time.Time                        `json:"upgradeLastUpdated"`
}

type FactoriesTableRowEquipment struct {
	EquipmentID string `json:"equipmentId"`
	Count       int    `json:"count"`

	Production []FactoriesTableRowProductionItem `json:"production"`
}

type FactoriesTableRowProductionItem struct {
	RecipeID         string             `json:"recipeId"`
	Inputs           map[string]float64 `json:"inputs"`
	Outputs          map[string]float64 `json:"outputs"`
	ManualEfficiency float64            `json:"manualEfficiency"`
}

type FactoriesTableRowEquipmentPlan struct {
	EquipmentID string `json:"equipmentId"`
	Count       int    `json:"count"`

	Production []FactoriesTableRowProductionPlan `json:"production"`
}

type FactoriesTableRowProductionPlan struct {
	RecipeID         string  `json:"recipeId"`
	ManualEfficiency float64 `json:"manualEfficiency"`
}
