package dfcore

import "srv/internal/utils/common"

type EntityID string

type TableResponse struct {
	results map[EntityID]common.Encodable
}

func NewTableResponse() *TableResponse {
	return &TableResponse{results: make(map[EntityID]common.Encodable)}
}

func (t *TableResponse) Add(eid EntityID, data common.Encodable) {
	t.results[eid] = data
}

func (t *TableResponse) Encode() map[string]any {
	encodedRows := make(map[string]any, len(t.results))
	for id, row := range t.results {
		encodedRows[string(id)] = row.Encode()
	}
	return encodedRows
}
