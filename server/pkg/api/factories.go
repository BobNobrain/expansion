package api

import "time"

const (
	FactoriesQueryTypeByBaseID = "byBaseId"
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
}

type FactoriesTableRowEquipment struct {
	EquipmentID string `json:"equipmentId"`
	Count       int    `json:"count"`

	Production []FactoriesTableRowProductionItem `json:"production"`
}

type FactoriesTableRowProductionItem struct {
	RecipeID         int                `json:"recipeId"`
	DynamicOutputs   map[string]float64 `json:"dynamicOutputs"`
	ManualEfficiency float64            `json:"manualEfficiency"`
}
