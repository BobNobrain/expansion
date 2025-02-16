package dfapi

import "encoding/json"

type DFGenericRequest struct {
	ID      int             `json:"id"`
	Type    string          `json:"type"`
	Request json.RawMessage `json:"request"`
}

type DFGenericResponse struct {
	RequestID int      `json:"requestId"`
	Result    any      `json:"result,omitempty"`
	Error     *DFError `json:"error,omitempty"`
}
type DFError struct {
	Code        string `json:"code"`
	Message     string `json:"message"`
	IsRetriable bool   `json:"isRetriable"`
	Details     any    `json:"details"`
}

func (v DFGenericResponse) Encode() any {
	return v
}

type DFTableRequest struct {
	Path         string   `json:"path"`
	JustBrowsing bool     `json:"justBrowsing"`
	IDs          []string `json:"ids"`
}

type DFTableQueryRequest struct {
	Path         string          `json:"path"`
	JustBrowsing bool            `json:"justBrowsing"`
	Payload      json.RawMessage `json:"payload"`
}

type DFSingletonRequest struct {
	Path         string `json:"path"`
	JustBrowsing bool   `json:"justBrowsing"`
}

type DFActionRequest struct {
	Name             string          `json:"name"`
	IdempotencyToken string          `json:"token"`
	Payload          json.RawMessage `json:"payload"`
}

type DFGenericEvent struct {
	Event   string `json:"event"`
	Payload any    `json:"payload"`
}

type DFUpdateEvent struct {
	TablePatches       []DFTableUpdatePatch             `json:"tables,omitempty"`
	SingletonPatches   []DFSingletonUpdatePatch         `json:"singletons,omitempty"`
	QueryNotifications []DFTableQueryUpdateNotification `json:"queries,omitempty"`
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

type DFTableQueryUpdateNotification struct {
	Path    string `json:"path"`
	Payload any    `json:"payload"`
}

type DFTableUnsubscribeRequest struct {
	Path string   `json:"path"`
	IDs  []string `json:"ids"`
}

type DFTableQueryUnsubscribeRequest struct {
	Path    string          `json:"path"`
	Payload json.RawMessage `json:"payload"`
	IDs     []string        `json:"ids,omitempty"`
}

type DFSingletonUnsubscribeRequest struct {
	Path string `json:"path"`
}
