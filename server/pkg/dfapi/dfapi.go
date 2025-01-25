package dfapi

import "encoding/json"

type DFTableRequest struct {
	Path         string          `json:"path"`
	JustBrowsing bool            `json:"justBrowsing"`
	Query        json.RawMessage `json:"query"`
}

type DFSingletonRequest struct {
	Path         string `json:"path"`
	JustBrowsing bool   `json:"justBrowsing"`
}

type DFTableResponse struct {
	Values []any `json:"values"`
}

func (v DFTableResponse) Encode() any {
	return v
}

type DFSingletonResponse struct {
	Value any `json:"value"`
}

func (v DFSingletonResponse) Encode() any {
	return v
}

type DFUpdateEvent struct {
	TablePatches     []DFTableUpdatePatch     `json:"tables,omitempty"`
	SingletonPatches []DFSingletonUpdatePatch `json:"singletons,omitempty"`
}

func (v DFUpdateEvent) Encode() any {
	return v
}

type DFTableUpdatePatch struct {
	Path     string `json:"path"`
	EntityID string `json:"eid"`
	Update   any    `json:"update"`
}

type DFSingletonUpdatePatch struct {
	Path   string `json:"path"`
	Update any    `json:"update"`
}

type DFTableUnsubscribeRequest struct {
	Path string   `json:"path"`
	IDs  []string `json:"ids"`
}
