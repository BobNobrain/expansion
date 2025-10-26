package api

const (
	// exploration
	ActionExploreSystem = "exploreSystem"
	ActionExploreWorld  = "exploreWorld"

	// base management
	ActionCreateBase = "createBase"
	ActionRemoveBase = "removeBase"

	// base factories
	ActionCreateFactory       = "createFactory"
	ActionUpdateFactoryConfig = "updateFactoryConfig"
	ActionUpdateFactoryStatus = "updateFactoryStatus"
	ActionRemoveFactory       = "removeFactory"

	// inventory management
	ActionTransferItems = "transferItems"

	// cities
	ActionFoundCity = "foundCity"
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
	BaseID    int                          `json:"baseId"`
	Equipment []FactoriesTableRowEquipment `json:"equipment"`
}
type UpdateFactoryConfigPayload struct {
	FactoryID int                          `json:"factoryId"`
	Equipment []FactoriesTableRowEquipment `json:"equipment"`
}
type UpdateFactoryStatusPayload struct {
	FactoryID int    `json:"factoryId"`
	Status    string `json:"status"`
}
type RemoveFactoryPayload struct {
	FactoryID int `json:"factoryId"`
}
