package datafront

import "encoding/json"

type DFRequest struct {
	Path         []string        `json:"path"`
	JustBrowsing bool            `json:"justBrowsing"`
	Query        json.RawMessage `json:"query"`
}

func (q DFRequest) GetPath() DFPath {
	result := make(DFPath, 0, len(q.Path))
	for _, next := range q.Path {
		result = append(result, DFPathFragment(next))
	}
	return result
}

type DFResponse struct {
	Value any `json:"value"`
}

func (v DFResponse) Encode() any {
	return v
}

type DFUpdateEvent struct {
	Patches []DFUpdatePatch `json:"patches"`
}

func (v DFUpdateEvent) Encode() any {
	return v
}

type DFUpdatePatch struct {
	Path []string `json:"path"`

	// only one of those will be presented
	Replace         *DFUpdatePatchReplace         `json:"replace,omitempty"`
	PropertyReplace *DFUpdatePatchPropertyReplace `json:"propReplace,omitempty"`
	ItemAdd         *DFUpdatePatchItemAdd         `json:"itemAdd,omitempty"`
	ItemReplace     *DFUpdatePatchItemReplace     `json:"itemReplace,omitempty"`
	ItemDelete      *DFUpdatePatchItemDelete      `json:"itemDelete,omitempty"`
	SetItemDelete   *DFUpdatePatchSetItemDelete   `json:"setItemDelete,omitempty"`
	Clear           *DFUpdatePatchClear           `json:"clear,omitempty"`
}

type DFUpdatePatchReplace struct {
	NewValue any `json:"newValue"`
}

type DFUpdatePatchPropertyReplace struct {
	Property string `json:"prop"`
	NewValue any    `json:"newValue"`
}

type DFUpdatePatchItemReplace struct {
	Index    int `json:"index"`
	NewValue any `json:"newValue"`
}

type DFUpdatePatchItemDelete struct {
	Index int `json:"index"`
}

type DFUpdatePatchItemAdd struct {
	NewValue any `json:"newValue"`
}

type DFUpdatePatchSetItemDelete struct {
	DeletedValue any `json:"value"`
}

type DFUpdatePatchClear struct{}
