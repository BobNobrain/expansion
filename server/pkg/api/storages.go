package api

const (
	StoragesQueryTypeAllNeighbours = "storages/allNeighbours"
	StoragesQueryTypeByWorld       = "storages/byWorld"
)

const (
	StoragesTableName = "storages"
)

type StoragesQueryAllNeighbours struct {
	StorageID string `json:"storageId"`
}

type StoragesQueryByWorld struct {
	WorldID string `json:"worldId"`
}

type StoragesTableRow struct {
	StorageID      string                 `json:"stogrageId"`
	Name           string                 `json:"name"`
	SizeLimit      StorageSize            `json:"sizeLimit"`
	Location       string                 `json:"location"` // galactic tile id
	StaticContent  map[string]float64     `json:"staticContent"`
	DynamicContent map[string]Predictable `json:"dynamicContent"`
}

type StorageSize struct {
	MassT    float64 `json:"massT"`
	VolumeM3 float64 `json:"volumeM3"`
}
