package api

const (
	BaseEnvsQueryTypeByFactoryID = "base_envs/byFactory"
)

const (
	BaseEnvsTableName = "base_envs"
)

type BaseEnvsQueryByFactoryID struct {
	FactoryID int `json:"factoryId"`
}

type BaseEnvsTableRow struct {
	Recipes []BaseEnvsTableRowRecipe `json:"recipes"`

	TileFertility float64 `json:"tileFertility"`

	Resources  []WorldsTableRowResourceDeposit `json:"resources"`
	Snow       []WorldsTableRowResourceDeposit `json:"snow"`
	Ocean      []WorldsTableRowResourceDeposit `json:"ocean"`
	Atmosphere []WorldsTableRowResourceDeposit `json:"atmosphere"`
}

type BaseEnvsTableRowRecipe struct {
	RecipeID    string             `json:"recipeId"`
	EquipmentID string             `json:"equipmentId"`
	Inputs      map[string]float64 `json:"inputs"`
	Outputs     map[string]float64 `json:"outputs"`
}
