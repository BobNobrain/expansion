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
	ActionTransferFactoryItems = "factory.transfer"

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

type CreateBasePayload struct {
	WorldID  string `json:"worldId"`
	TileID   int    `json:"tileId"`
	Operator string `json:"operator"`
	Name     string `json:"name"`
}
type RemoveBasePayload struct {
	BaseID int `json:"baseId"`
}

type CreateFactoryPayload struct {
	BaseID      int    `json:"baseId"`
	FactoryName string `json:"name"`
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

type TransferFactoryItemsPayload struct {
	FactoryID         int                `json:"factoryId"`
	FromFactoryToBase bool               `json:"fromFactoryToBase"`
	Amounts           map[string]float64 `json:"amounts"`
}

type FoundCityPayload struct {
	WorldID string `json:"worldId"`
	TileID  int    `json:"tileId"`
	Name    string `json:"name"`
}

type RunCheatPayload struct {
	Cmd string `json:"cmd"`
}
