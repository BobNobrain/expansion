package api

const (
	// exploration
	ActionExploreSystem = "exploreSystem"
	ActionExploreWorld  = "exploreWorld"

	// base management
	ActionEstablishBase = "establishBase"
	ActionRemoveBase    = "removeBase"

	// cities
	ActionFoundCity = "foundCity"
)

type ExploreSystemPayload struct {
	SystemID string `json:"systemId"`
}

type ExploreWorldPayload struct {
	WorldID string `json:"worldId"`
}

type EstablishBasePayload struct {
	WorldID    string `json:"worldId"`
	TileID     int    `json:"tileId"`
	OperatorID string `json:"operatorId"`
}

type EstablishBaseResult struct {
	BaseID int `json:"baseId"`
}

type RemoveBasePayload struct {
	BaseID int `json:"baseId"`
}

type FoundCityPayload struct {
	WorldID string `json:"worldId"`
	TileID  int    `json:"tileId"`
	Name    string `json:"name"`
}
