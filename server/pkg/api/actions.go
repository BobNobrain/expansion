package api

const (
	// exploration
	ActionExploreSystem = "explore.system"
	ActionExploreWorld  = "explore.world"

	// base management
	ActionCreateBase = "base.create"
	ActionRemoveBase = "base.remove"

	// base factories
	ActionCreateFactory        = "factory.create"
	ActionRebalanceFactory     = "factory.rebalance"
	ActionChangeUpgradeProject = "factory.upgrade"
	ActionContributeToUpgrade  = "factory.contribute"

	// inventory management
	ActionTransferItems = "transferItems"

	// cities
	ActionFoundCity = "city.found"

	// misc
	ActionRunCheat = "cheat"
)

type ExploreSystemPayload struct {
	SystemID string `json:"systemId"`
}

type ExploreWorldPayload struct {
	WorldID string `json:"worldId"`
}

type FoundCityPayload struct {
	WorldID string `json:"worldId"`
	TileID  int    `json:"tileId"`
	Name    string `json:"name"`
}

type CreateBasePayload struct {
	WorldID  string `json:"worldId"`
	TileID   int    `json:"tileId"`
	Operator string `json:"operator"`
}
type RemoveBasePayload struct {
	BaseID int `json:"baseId"`
}

type CreateFactoryPayload struct {
	BaseID int `json:"baseId"`
}

type UpgradeFactoryPayload struct {
	FactoryID int                              `json:"factoryId"`
	Equipment []FactoriesTableRowEquipmentPlan `json:"equipment"`
}

type RebalanceFactoryPayload struct {
	FactoryID int `json:"factoryId"`

	Plan [][]FactoriesTableRowProductionPlan `json:"plan"`
}

type ContributeToFactoryPayload struct {
	FactoryID int                `json:"factoryId"`
	Amounts   map[string]float64 `json:"amounts"`
}

type RemoveFactoryPayload struct {
	FactoryID int `json:"factoryId"`
}

type RunCheatPayload struct {
	Cmd string `json:"cmd"`
}
