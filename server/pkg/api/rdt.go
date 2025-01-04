package api

type RDTQuery struct {
	Path         []string `json:"path"`
	JustBrowsing bool     `json:"justBrowsing"`
}

type RDTResponse struct {
	Value any `json:"value"`
}

type RDTUpdateEvent struct {
	Patches []RDTUpdatePatch `json:"patches"`
}

type RDTUpdatePatch struct {
	Path []string `json:"path"`

	// only one of those will be presented
	Replace         *RDTUpdatePatchReplace         `json:"replace,omitempty"`
	PropertyReplace *RDTUpdatePatchPropertyReplace `json:"propReplace,omitempty"`
	ItemAdd         *RDTUpdatePatchItemAdd         `json:"itemAdd,omitempty"`
	ItemReplace     *RDTUpdatePatchItemReplace     `json:"itemReplace,omitempty"`
	ItemDelete      *RDTUpdatePatchItemDelete      `json:"itemDelete,omitempty"`
}

type RDTUpdatePatchReplace struct {
	NewValue any `json:"newValue"`
}

type RDTUpdatePatchPropertyReplace struct {
	Property string `json:"prop"`
	NewValue any    `json:"newValue"`
}

type RDTUpdatePatchItemReplace struct {
	Index    int `json:"index"`
	NewValue any `json:"newValue"`
}

type RDTUpdatePatchItemDelete struct {
	Index int `json:"index"`
}

type RDTUpdatePatchItemAdd struct {
	NewValue any `json:"newValue"`
}
