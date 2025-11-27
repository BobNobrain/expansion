package api

const (
	// exploration
	ActionExploreSystem = "exploreSystem"
	ActionExploreWorld  = "exploreWorld"

	// base management
	ActionCreateBase = "createBase"
	ActionRemoveBase = "removeBase"

	// base construction sites
	ActionCreateBaseSite   = "createSite"
	ActionContributeToSite = "contributeToSite"

	// base factories
	ActionCreateFactory       = "createFactory"
	ActionUpdateFactoryConfig = "updateFactoryConfig"
	ActionUpdateFactoryStatus = "updateFactoryStatus"
	ActionRemoveFactory       = "removeFactory"

	// inventory management
	ActionTransferItems = "transferItems"

	// cities
	ActionFoundCity = "foundCity"

	// misc
	ActionRunCheat = "runCheat"
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

type CreateSitePayload struct {
	BaseID    int                          `json:"baseId"`
	Equipment []FactoriesTableRowEquipment `json:"equipment"`
}
type ContributeToSitePayload struct {
	BaseID int `json:"baseId"`
	SiteID int `json:"siteId"`

	Amounts map[string]float64 `json:"amounts"`
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

type RunCheatPayload struct {
	Cmd string `json:"cmd"`
}
