package dfcore

import "srv/internal/utils/common"

type EntityID string

type TableResponse struct {
	results map[EntityID]common.Encodable
}

func NewTableResponse() *TableResponse {
	return &TableResponse{results: make(map[EntityID]common.Encodable)}
}

func NewTableResponseFromList[T any](objects []T, identify func(T) EntityID, encode func(T) common.Encodable) *TableResponse {
	response := NewTableResponse()
	for _, object := range objects {
		response.Add(identify(object), encode(object))
	}
	return response
}

func NewTableResponseFromSingle(id EntityID, entity common.Encodable) *TableResponse {
	response := NewTableResponse()
	response.Add(id, entity)
	return response
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
